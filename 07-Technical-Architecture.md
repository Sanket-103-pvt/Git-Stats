# 07 — Technical Architecture: GitStats

## Document Purpose
This document is the current technical source of truth for the GitStats app. It describes what is implemented now, how the app is structured, how data flows through it, and what should be updated whenever the implementation changes.

## Current Implementation Status
GitStats is implemented as a client-side React app with Vite and Tailwind CSS. It fetches public GitHub profile and repository data directly from the GitHub REST API, renders profile cards, contribution stats, a language donut chart, and top repository cards, and supports persistent dark/light mode.

## Architecture Summary
- Frontend only: no backend server.
- No database: all state is in React.
- No authentication: unauthenticated GitHub API calls only.
- Single-page experience: one route, state-driven rendering.
- Persistent theme: `localStorage` key `gitstats-theme`.
- Production build: Vite build output in `dist/`.

## Technology Stack
- React 18
- Vite 5
- Tailwind CSS 3
- Recharts for the language donut chart
- lucide-react for icons
- Native `fetch` for GitHub API requests

## Repository Layout
```
GitStats/
├── 01-PRD.md
├── 02-TRD.md
├── 03-AppFlow.md
├── 04-UIUXBrief.md
├── 05-BackendSchema.md
├── 06-ImplementationPlan.md
├── 07-Technical-Architecture.md
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── App.jsx
    ├── App.css
    ├── main.jsx
    └── components/
        ├── LanguageChart.jsx
        ├── ProfileCard.jsx
        ├── RepoCard.jsx
        └── StatsBar.jsx
```

## Runtime Flow
1. The browser loads `index.html` and mounts the React app from `src/main.jsx`.
2. `src/App.jsx` initializes theme, search state, profile state, repository state, loading state, and error state.
3. On first mount, the app preloads `torvalds` to demonstrate the app with real data.
4. A user can search any GitHub username from the search bar.
5. The app fetches user profile data and repository data in parallel.
6. The app computes derived metrics from the repository list.
7. Child components render the current state slice.
8. The dark/light preference is persisted to `localStorage` and applied to the `html` element.

## Main State Model
`src/App.jsx` owns the app state.

```js
{
  theme: 'dark' | 'light',
  inputValue: string,
  profile: object | null,
  repos: Array<object>,
  loading: boolean,
  error: string | null,
  searchedUsername: string
}
```

### State Responsibilities
- `theme`: controls light and dark mode.
- `inputValue`: current search box value.
- `profile`: raw GitHub user response.
- `repos`: raw GitHub repo array.
- `loading`: shows skeletons and disables search.
- `error`: stores the current error message for the error banner.
- `searchedUsername`: shows the last query in the error panel.

## API Integration
The app calls GitHub REST API v3 directly.

### User Profile Endpoint
`GET https://api.github.com/users/{username}`

Fields used:
- `login`
- `name`
- `avatar_url`
- `bio`
- `location`
- `followers`
- `following`
- `public_repos`
- `created_at`
- `html_url`

### Repository Endpoint
`GET https://api.github.com/users/{username}/repos?per_page=100&sort=updated`

Fields used:
- `id`
- `name`
- `description`
- `html_url`
- `stargazers_count`
- `forks_count`
- `language`
- `fork`

### Request Strategy
- Profile and repos are fetched in parallel with `Promise.all`.
- Requests include `Accept: application/vnd.github+json`.
- A request id guard prevents older in-flight searches from overwriting newer results.

### Error Handling
- `404`: user not found.
- `403`: API rate limit reached.
- other failures: network or unexpected API failure.

## Derived Data
The app derives several values from `repos` and `profile` rather than storing them separately.

### Top Repositories
- Sort by `stargazers_count` descending.
- Keep the top 6.
- Render in a responsive grid.

### Total Stars
- Sum of all `stargazers_count` values across the repo list.

### Top Language
- Count `repo.language` values.
- Pick the most frequent non-null language.

### Account Age
- Years since `profile.created_at`.

### Language Chart Data
- Count repos by `repo.language`.
- Keep the top 6 languages.
- Group the remaining languages into `Other`.

## UI Composition
The UI is built from a small number of focused components.

### `src/App.jsx`
Responsibilities:
- owns app state
- performs GitHub API fetches
- applies theme to the `html` element
- renders the page shell
- renders error, empty, and data states

### `src/components/ProfileCard.jsx`
Responsibilities:
- renders avatar, name, username, bio, and location
- links to the GitHub profile page
- displays follower, following, and public repo counters
- provides loading skeleton state

### `src/components/StatsBar.jsx`
Responsibilities:
- calculates and renders total stars, top language, and account age
- provides loading skeleton state

### `src/components/LanguageChart.jsx`
Responsibilities:
- transforms repo languages into chart data
- renders the Recharts donut chart
- renders a custom legend with percentages
- hides itself when there is no language data
- provides loading skeleton state

### `src/components/RepoCard.jsx`
Responsibilities:
- renders one repository card
- shows repo name, description, stars, forks, and language pill
- opens repo links in a new tab
- provides loading skeleton state

## Theme System
Theme is class-based on the `html` element.

### Behavior
- Default theme is dark.
- Theme preference is loaded from `localStorage`.
- Toggling theme updates the `html` class.
- Theme is stored back into `localStorage`.

### Styling Approach
- CSS variables define colors for background, surface, border, text, accent, success, warning, and error.
- Tailwind utility classes reference the variables through `App.css` and component class names.
- This keeps the dark/light rendering consistent across components.

## Styling System
- Tailwind is the primary styling layer.
- `src/App.css` contains the global theme variables and shared component classes.
- `panel` is the reusable card shell class.
- The app uses a developer-oriented palette with high contrast and minimal shadows.

## Loading States
When `loading = true`, the app renders skeleton placeholders instead of data:
- profile card skeleton
- stats bar skeleton
- language donut skeleton
- six repo card skeletons

This keeps the page stable while data is being fetched.

## Empty States
Current empty states:
- no search yet: intro panel and search prompt
- no public repos: message instead of repo cards
- no language data: message instead of chart

## Responsive Behavior
- Search form stacks on narrow screens and becomes horizontal on larger screens.
- Profile card stacks vertically on mobile and splits on desktop.
- Stats bar wraps on smaller screens.
- Language chart legend shifts to a stacked layout.
- Repo cards render as a single column on mobile and two columns on larger screens.

## Accessibility Notes
- Search input has an accessible label.
- Search and theme toggle are keyboard accessible.
- Repo links and profile links open in new tabs with `rel="noopener noreferrer"`.
- Loading containers use `aria-busy="true"`.

## Build and Deployment
- `npm install` installs dependencies.
- `npm run build` generates the production bundle.
- `npm run preview` can be used to test the production build locally.
- The app is deployable as a static site to Vercel, Netlify, or GitHub Pages.

## Current Behavior Notes
- The app currently preloads `torvalds` on first mount.
- This is an implementation convenience so the UI shows real data immediately.
- If a future version should start completely empty, remove the initial search effect in `src/App.jsx`.

## Known Constraints
- GitHub API rate limits apply because the app uses unauthenticated requests.
- The current app only uses public repos and public profile data.
- The bundle is functional but still triggers a Vite size warning because Recharts is included in the client bundle.

## Update Log
### 2026-06-28
- Built the Vite + React + Tailwind app.
- Added GitHub profile search with parallel profile/repo fetches.
- Added loading skeletons and error states.
- Added profile card, stats bar, language donut chart, and repo grid.
- Added persistent dark/light mode using `localStorage`.
- Added favicon, font loading, and production build support.

## Maintenance Rule
Whenever the implementation changes, update this document in the same change set so it always matches the current app behavior.