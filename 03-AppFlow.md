# 03 — App Flow: Navigation & User Journey Map

## Pages / Screens

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Home — Search | Default landing. Search bar centered. No profile loaded yet. |
| `/` (with data) | Results | Same URL, state-driven. Profile card + charts + repos shown below search bar. |

> Single-page app. No routing library needed. UI state drives what's visible.

## Navigation Structure
No sidebar, no tabs. Single scrollable page.  
Top bar: App logo (left) + dark/light toggle (right).  
Below top bar: Search input (full-width on mobile, centered 600px max on desktop).  
Below search (after fetch): Profile card → Stats bar → Language chart → Repo grid.

## First Screen (New Visitor)
```
[ GitStats logo ]                    [ 🌙 toggle ]
─────────────────────────────────────────────────
        🔍  Enter a GitHub username...   [Search]

        (empty state illustration or tagline)
        "Explore any GitHub profile instantly."
```

## Auth Flow
None. No login. Open access.

## Core User Journey 1 — Search & View Profile
1. User lands on `/`
2. Types GitHub username into search bar
3. Presses Enter or clicks Search button
4. App sets `loading = true` → skeleton cards appear
5. `fetch` hits `GET /users/{username}` and `GET /users/{username}/repos?per_page=100`
6. Both resolve → state updated → skeleton replaced with real content
7. User sees: Profile Card → Stats Bar → Language Chart → Top 6 Repos
8. User scrolls to explore data

## Core User Journey 2 — Search New User
1. User already viewing a profile
2. Clears search bar, types new username, presses Enter
3. Previous data cleared, loading skeleton shown again
4. New data loads and replaces previous

## Core User Journey 3 — Toggle Dark/Light Mode
1. User clicks sun/moon icon in top bar
2. `dark` class toggled on `<html>` element
3. Tailwind dark: variants activate — background, text, card colors invert
4. Preference saved to `localStorage`
5. On next visit, preference restored on app mount

## Empty States

| Scenario | What shows |
|----------|-----------|
| App first load, no search yet | Centered tagline + search hint text |
| User has 0 public repos | Language chart hidden; repos section shows "No public repos yet." |
| User has repos but all have null language | Chart hidden; "Language data unavailable." message |

## Error States

| Error | Trigger | UI Response |
|-------|---------|-------------|
| User not found | GitHub returns 404 | Red error card: "User '{username}' not found. Check spelling." |
| Rate limit hit | GitHub returns 403 | Warning card: "GitHub API rate limit reached. Try again in ~1 hour." |
| Network failure | fetch throws | Error card: "Network error. Check your connection." |

## Loading States (Skeleton)
While `loading = true`, show:
- Profile card skeleton: grey animated pulse blocks for avatar circle, name line, bio lines, stat pills
- Stats bar skeleton: 3 grey pill placeholders
- Language chart skeleton: grey donut circle placeholder
- Repo grid skeleton: 6 grey card outlines

## Redirects
No redirects. All UI transitions are state-driven within single page.

## Modal / Overlays
None in v1.
