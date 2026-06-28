# 02 — TRD: Technical Requirements Document

## Frontend
**React 18** with **Vite** (latest) + **TypeScript** optional but plain JS acceptable  
**Tailwind CSS v3** for all styling — utility-first, no custom CSS unless unavoidable  
**Recharts** for language donut/pie chart (already listed as available in artifact env)

## Backend
None. Fully client-side. All data fetched directly from GitHub REST API v3.

## Database
None. No persistence required in v1. Dark mode preference stored in `localStorage`.

## Auth
None. Uses unauthenticated GitHub REST API.  
Rate limit: 60 requests/hour per IP. Acceptable for this use case.

## Hosting
**Vercel** (recommended) — drag-and-drop Vite build output (`/dist`) or connect GitHub repo.  
Alternatively: Netlify, GitHub Pages (with Vite base config).

## Third-party APIs

| API | Purpose | Auth |
|-----|---------|------|
| `https://api.github.com/users/{username}` | Fetch profile data | None |
| `https://api.github.com/users/{username}/repos?per_page=100` | Fetch all repos | None |
| `https://api.github.com/repos/{owner}/{repo}/languages` | Per-repo language bytes | None (optional — use repo.language for speed) |

> **Note:** Language breakdown aggregated from `repo.language` field across all repos (faster, avoids N+1 calls). If deeper accuracy needed, use `/languages` endpoint per repo — but this burns rate limit quickly.

## Key Libraries

| Library | Purpose |
|---------|---------|
| `recharts` | Donut/pie chart for language breakdown |
| `lucide-react` | Icons (search, moon/sun, star, fork, location, etc.) |
| Native `fetch` | API calls — no axios needed |

## Folder Structure

```
gitstats/
├── public/
├── src/
│   ├── components/
│   │   ├── ProfileCard.jsx      # Avatar, name, bio, follower stats
│   │   ├── LanguageChart.jsx    # Donut chart with legend
│   │   ├── RepoCard.jsx         # Single repo tile (stars, forks, lang)
│   │   └── StatsBar.jsx         # Total stars, top language, account age
│   ├── App.jsx                  # Root: search bar, layout, dark mode, state
│   ├── App.css                  # Minimal global styles (Tailwind @layer base)
│   └── main.jsx                 # Vite entry point
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Environment Variables
None required for v1 (unauthenticated API).  
If adding auth token later: `VITE_GITHUB_TOKEN=ghp_...` (Vite exposes via `import.meta.env`)

## Constraints
- Must work on mobile (min 320px width)
- Must be free-tier only — no paid APIs
- No build-time server — static SPA only
- Must handle GitHub API 404 (user not found) and rate-limit (403) errors
- Dark mode toggle state persists via `localStorage` key `gitstats-theme`
