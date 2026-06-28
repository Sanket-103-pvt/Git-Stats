# 06 — Implementation Plan: Step-by-Step Build Sequence

---

## Phase 1: Project Setup
**Goal:** Working Vite + React + Tailwind project boots in browser.

- [ ] `npm create vite@latest gitstats -- --template react`
- [ ] `cd gitstats && npm install`
- [ ] Install dependencies: `npm install recharts lucide-react`
- [ ] Install Tailwind: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- [ ] Configure `tailwind.config.js`:
  - Add `content: ["./index.html", "./src/**/*.{js,jsx}"]`
  - Add `darkMode: 'class'`
- [ ] Add Tailwind directives to `src/App.css` (`@tailwind base/components/utilities`)
- [ ] Import `Inter` font in `index.html` via Google Fonts link
- [ ] Clear boilerplate from `App.jsx` — render just `<h1>GitStats</h1>`
- [ ] Run `npm run dev` — verify blank page renders, Tailwind class works

**Done criteria:** `npm run dev` runs, page shows, Tailwind utility class changes text color correctly.

---

## Phase 2: Dark Mode Infrastructure
**Goal:** Toggle works, preference persists, all future components can use `dark:` variants.

- [ ] In `App.jsx`, add state: `const [dark, setDark] = useState()`
- [ ] On mount (`useEffect`), read `localStorage.getItem('gitstats-theme')` — default to `'dark'`
- [ ] Apply/remove `dark` class on `document.documentElement` when `dark` state changes
- [ ] Save to `localStorage` on toggle
- [ ] Add toggle button to top bar (sun/moon icon from lucide-react)
- [ ] Set `<html>` and `<body>` base colors via Tailwind (`bg-[#0D1117] dark:bg-[#0D1117]`, etc.) in `App.css`

**Done criteria:** Toggle switches theme. Refresh preserves last choice.

---

## Phase 3: Search Bar + API Fetch Logic
**Goal:** Enter username → fetch data → store in state → log to console.

- [ ] Add state to `App.jsx`: `profile`, `repos`, `loading`, `error`, `inputValue`
- [ ] Build search bar UI: input + button, centered, styled with Tailwind
- [ ] `handleSearch()` function:
  - Set `loading = true`, clear `error`
  - `await fetch` both endpoints in parallel using `Promise.all`
  - Handle 404 → set error message
  - Handle 403 → rate limit error
  - Handle network throw → generic error
  - On success: `setProfile(data)` + `setRepos(data)`
  - Finally: `setLoading(false)`
- [ ] Trigger on Enter keypress and button click
- [ ] `console.log(profile, repos)` to verify shape

**Done criteria:** Search "torvalds" → profile and repos logged to console. Bad username shows error.

---

## Phase 4: ProfileCard Component
**Goal:** `ProfileCard.jsx` renders profile data correctly in both themes.

- [ ] Create `src/components/ProfileCard.jsx`
- [ ] Props: `{ profile }`
- [ ] Render: avatar (`<img>`), name, `@login`, bio, location (with MapPin icon), `html_url` link
- [ ] Bottom row: 3 stat boxes — Followers / Following / Public Repos
- [ ] Skeleton version: when `loading=true`, render grey pulse blocks instead (use `animate-pulse`)
- [ ] Import + render in `App.jsx` below search bar (conditional on `profile || loading`)
- [ ] Tailwind dark: variants for all bg/text/border

**Done criteria:** Profile card shows real data. Skeleton animates during load. Both themes look correct.

---

## Phase 5: StatsBar Component
**Goal:** `StatsBar.jsx` shows 3 derived stats below profile card.

- [ ] Create `src/components/StatsBar.jsx`
- [ ] Props: `{ repos, profile }`
- [ ] Compute inside component (or via useMemo):
  - `totalStars` — sum of `stargazers_count`
  - `topLanguage` — most frequent `repo.language`
  - `accountAge` — years since `profile.created_at`
- [ ] Render 3 horizontal stat pills: `⭐ {totalStars} Total Stars`, `💻 {topLanguage}`, `📅 {accountAge}y on GitHub`
- [ ] Skeleton: 3 grey pill placeholders when `loading`
- [ ] Responsive: wrap to column on mobile

**Done criteria:** Stats show correct values. "torvalds" shows large star count and "C" as top language.

---

## Phase 6: LanguageChart Component
**Goal:** Donut chart from Recharts shows language distribution.

- [ ] Create `src/components/LanguageChart.jsx`
- [ ] Props: `{ repos }`
- [ ] Compute `languageCounts` from repos — count by `repo.language`, filter nulls
- [ ] Take top 6 languages, group rest as "Other"
- [ ] Map to Recharts `PieChart` data format: `[{ name: "JavaScript", value: 23 }, ...]`
- [ ] Define color array (10 colors for language slots)
- [ ] Render `<PieChart><Pie innerRadius={60} outerRadius={100} ...><Cell /></Pie></PieChart>`
- [ ] Add custom legend: colored dot + name + percentage
- [ ] Hide chart entirely if `languageCounts` is empty
- [ ] Skeleton: grey donut circle placeholder when loading

**Done criteria:** Chart renders for any user with ≥1 repo with a language set. Legend percentages add to 100%.

---

## Phase 7: RepoCard Component + Grid
**Goal:** Top 6 repos shown in a 2-col grid of cards.

- [ ] Create `src/components/RepoCard.jsx`
- [ ] Props: `{ repo }` — single repo object
- [ ] Render: repo name (as `<a href={html_url}>` link), description (truncated), stars + forks row with icons, language pill
- [ ] In `App.jsx`: compute `topRepos` (sort by stars, slice 0-6)
- [ ] Render `topRepos.map(r => <RepoCard key={r.id} repo={r} />)` in 2-col grid
- [ ] Skeleton: 6 grey card outlines when loading
- [ ] Handle null description gracefully

**Done criteria:** 6 repo cards render. Stars sorted descending. Links open in new tab.

---

## Phase 8: Error State + Polish
**Goal:** All error and edge cases handled. UI is pixel-perfect in both themes.

- [ ] Error card component (inline in App.jsx): red border, error icon, message text
- [ ] Empty state for first load (no search yet): centered tagline
- [ ] Empty repos state: "No public repositories yet."
- [ ] Fix any spacing, alignment, font size inconsistencies
- [ ] Test all components in light mode — verify dark: variants correct
- [ ] Mobile test at 375px: check search bar, profile card stack, repo grid 1-col
- [ ] Add `title="GitStats"` and favicon to `index.html`

**Done criteria:** Every state renders without layout breaking. No console errors. Both themes clean.

---

## Phase 9: Build & Deploy
**Goal:** Production build works. App live on Vercel or Netlify.

- [ ] `npm run build` — verify no errors
- [ ] `npm run preview` — test production build locally
- [ ] Deploy: push to GitHub repo → connect to Vercel → auto-deploy on push
- [ ] OR: Netlify drag-and-drop `/dist` folder
- [ ] Test live URL: search 3-4 usernames, toggle theme, mobile browser test

**Done criteria:** Live URL works. Profile fetches correctly. Dark mode persists on reload.

---

## Done Criteria (Full App)
- [ ] Search any public GitHub username → full profile, stats, chart, repos render
- [ ] Error states handle 404, 403, network fail gracefully
- [ ] Dark/light toggle works and persists
- [ ] Mobile layout correct at 375px
- [ ] No console errors on happy path
- [ ] Live deployment URL accessible
