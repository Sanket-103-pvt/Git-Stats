# 05 — Backend Schema: Data Model & API Structure

## Overview
GitStats has **no backend and no database**. All data is fetched client-side from the GitHub REST API v3.  
This document defines the **data shapes** used throughout the app — what the API returns and how the app transforms and stores data in React state.

---

## API Endpoints Used

### 1. User Profile
```
GET https://api.github.com/users/{username}
```

**Fields used from response:**

| Field | Type | Used for |
|-------|------|---------|
| `login` | string | @username display |
| `name` | string | Display name |
| `avatar_url` | string | Profile photo |
| `bio` | string | Bio text |
| `location` | string | Location tag |
| `followers` | number | Follower count stat |
| `following` | number | Following count stat |
| `public_repos` | number | Repo count stat |
| `created_at` | ISO date string | Account age calculation |
| `html_url` | string | Link to GitHub profile |

---

### 2. User Repositories
```
GET https://api.github.com/users/{username}/repos?per_page=100&sort=updated
```

**Fields used from each repo object:**

| Field | Type | Used for |
|-------|------|---------|
| `id` | number | React key |
| `name` | string | Repo name |
| `description` | string | Repo description |
| `html_url` | string | Link to repo |
| `stargazers_count` | number | Star count, sorting, total stars calc |
| `forks_count` | number | Fork count display |
| `language` | string \| null | Language breakdown aggregation |
| `fork` | boolean | Filter out forks (optional) |
| `created_at` | ISO date string | (optional, not used in v1) |

---

## React State Shape

All data lives in `App.jsx` state. Passed as props to child components.

```js
// App.jsx state
{
  username: "",           // string — current search input
  loading: false,         // boolean — fetch in progress
  error: null,            // string | null — error message
  profile: null,          // object | null — raw GitHub user response
  repos: [],              // array — raw GitHub repos response
}
```

### Derived data (computed from `repos`, not stored separately)

```js
// Computed in App.jsx or in child components via useMemo

// Top 6 repos by stars
topRepos = repos
  .filter(r => !r.fork)           // exclude forks (optional)
  .sort((a,b) => b.stargazers_count - a.stargazers_count)
  .slice(0, 6)

// Language breakdown — { "JavaScript": 23, "Python": 15, "TypeScript": 8, ... }
languageCounts = repos.reduce((acc, repo) => {
  if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1
  return acc
}, {})

// Total stars earned
totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)

// Most used language
topLanguage = Object.entries(languageCounts)
  .sort((a,b) => b[1] - a[1])[0]?.[0] || "N/A"

// Account age in years
accountAge = Math.floor(
  (Date.now() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24 * 365)
)
```

---

## Data Flow

```
User types username
       ↓
App.jsx handleSearch()
       ↓
fetch(/users/{username})  ←→  fetch(/users/{username}/repos)
       ↓ both resolve
setProfile(data) + setRepos(data)
       ↓
Props passed down:
  profile → ProfileCard
  repos (top 6) → RepoCard (×6)
  languageCounts → LanguageChart
  { totalStars, topLanguage, accountAge } → StatsBar
```

---

## localStorage
| Key | Value | Purpose |
|-----|-------|---------|
| `gitstats-theme` | `"dark"` \| `"light"` | Persist dark/light preference across sessions |

---

## Error Handling

| HTTP Status | Meaning | App response |
|-------------|---------|--------------|
| 404 | User not found | `setError("User not found")` |
| 403 | Rate limit hit | `setError("Rate limit hit. Try in ~1hr.")` |
| Network fail | `fetch` throws | `setError("Network error.")` |

---

## No Auth / No Tokens (v1)
Unauthenticated GitHub API: 60 requests/hour per IP.  
Each search = 2 requests (profile + repos).  
= 30 searches/hour. Sufficient for personal/demo use.

To increase limit later: add `Authorization: Bearer ghp_...` header using `VITE_GITHUB_TOKEN`.
