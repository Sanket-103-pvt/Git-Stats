# 01 — PRD: Product Requirements Document

## App Name
**GitStats** — GitHub Profile Analyzer

## Tagline
Instantly visualize any GitHub developer's profile, repos, and coding patterns.

## Problem
Developers want a quick, visual way to explore GitHub profiles — their own or others'. GitHub's native UI buries stats across multiple pages and lacks visual breakdowns like language charts or aggregated star counts.

## Target User
Developers, indie hackers, and recruiters who want to quickly assess a GitHub profile's activity, language expertise, and popular projects — without manually hunting through dozens of pages.

## Core Features (Must Have)

- **Search bar** — Enter any GitHub username to fetch profile data
- **Profile card** — Avatar, name, bio, followers, following, public repos, location
- **Language breakdown** — Donut chart showing top languages across all repos
- **Top 6 repos** — Sorted by stars; shows name, description, stars, forks, language tag
- **Contribution stats** — Total stars earned, most used language, account age in years
- **Dark / Light mode toggle** — Persists user preference
- **Loading skeleton** — Shown while API data is fetching
- **Error state** — Clear message if username not found (404) or API fails

## Nice to Have (v2)
- GitHub OAuth to fetch private repo stats
- Compare two GitHub usernames side-by-side
- Export profile card as PNG
- Pin / save profiles locally

## Out of Scope (v1)
- No authentication / login
- No backend server — purely client-side
- No private repo access
- No commit history heatmap
- No rate-limit bypass (uses unauthenticated GitHub REST API; 60 req/hr)

## User Stories
- As a developer, I want to enter a GitHub username and see their profile summary so I can quickly assess their activity.
- As a recruiter, I want to see top repos sorted by stars so I can evaluate a candidate's best work.
- As a user, I want a language donut chart so I can see at a glance what technologies someone uses.
- As a user, I want dark mode so the app is comfortable to use at night.
- As a user, I want a loading state so I know data is being fetched and the app hasn't frozen.

## Success Metrics
- Profile loads in under 3 seconds on standard connection
- Language chart renders for any user with ≥1 public repo
- Error state handles 404 and network failures gracefully
- App is fully usable on mobile screens (≥ 320px wide)
