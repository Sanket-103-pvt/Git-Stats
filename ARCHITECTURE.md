# 🏗️ Git-Stats System Architecture

Welcome to the architectural overview for **Git-Stats**, an advanced GitHub Profile Analyzer built to provide deep, visually engaging insights into any developer's public footprint.

---

## 🌟 Tech Stack Layering

- **Core Framework**: React 18 (Client-side rendering with mixed JSX/TSX support)
- **Build Tooling**: Vite 5 (HMR and fast ES-module bundling)
- **Styling**: Tailwind CSS 3 (Utility-first styling, fully responsive, persistent dark mode)
- **Data Visualization**: Recharts (Interactive SVG charts for language stats & heatmaps)
- **Data Source**: GitHub REST API v3
- **Export & Rendering**: `html2canvas` (for downloading the Player Card / Wrapped stats)

---

## 📂 Advanced Component Hierarchy

The application follows a highly modular, component-driven design localized within `src/components/`, utilizing a robust Context API for global state.

```mermaid
graph TD
    A[App.jsx] --> CTX((GitStatsContext))
    A --> SB[Search History & Input]
    SB --> SH(SearchHistory.jsx)
    
    A --> MAIN[Main Dashboard]
    MAIN --> PC(ProfileCard.tsx)
    MAIN --> SB2(StatsBar.tsx)
    
    A --> TABS[Navigation Tabs]
    TABS --> TAB1[Overview]
    TABS --> TAB2[Repositories]
    TABS --> TAB3[GitHub Wrapped]
    TABS --> TAB4[Compare View]
    
    TAB1 --> LC(LanguageChart.jsx)
    TAB1 --> CH(ContributionHeatmap.jsx)
    TAB1 --> AI(ActivityInsights.jsx)
    TAB1 --> AB(AchievementBadges.jsx)
    
    TAB2 --> RF(RepoFilters.jsx)
    TAB2 --> RC(RepoCard.jsx)
    RC --> RLB(RepoLanguageBar.jsx)
    
    TAB3 --> GW(GitHubWrapped.jsx)
    GW --> HOOK1{{useWrappedStats.js}}
    
    TAB4 --> CV(CompareView.jsx)
    
    A --> MODALS[Modals / Overlays]
    MODALS --> PCM(PlayerCardModal.jsx)
    
    A --> EXTRA[Extras]
    EXTRA --> GC(GistCard.jsx)
```

### 🧩 Core Component Roles

1. **`App.jsx`**: The root orchestrator. It acts as the primary layout wrapper and handles tab switching.
2. **`GitStatsContext.jsx`**: The centralized state container providing global access to `searchQuery`, `userData`, `reposData`, `loading`, and `error` states without prop drilling.
3. **Dashboard Components**:
   - `ProfileCard.tsx`: Displays core user metadata (Avatar, Bio, Follower counts) in a typed interface.
   - `StatsBar.tsx`: A numeric dashboard showcasing aggregate statistics.
4. **Data Visualization**:
   - `LanguageChart.jsx`: Integrates with `recharts` for an interactive language donut chart.
   - `ContributionHeatmap.jsx`: Visualizes commit patterns over time.
   - `ActivityInsights.jsx` & `AchievementBadges.jsx`: Gamified insights based on repo data.
5. **Interactive Modules**:
   - `GitHubWrapped.jsx`: A Spotify-style year-in-review for a developer, powered by `useWrappedStats.js`.
   - `PlayerCardModal.jsx`: Uses `html2canvas` to render and download a shareable developer "trading card."
   - `CompareView.jsx`: Side-by-side analysis of two distinct GitHub accounts.

---

## 🔄 Data Flow & State Management

1. **Global Context**: State is managed via `GitStatsContext.jsx`, eliminating deeply nested prop drilling.
2. **Fetch Lifecycle**:
   - User inputs a GitHub handle.
   - Context triggers parallel HTTP GET requests to:
     - `/users/{username}` (Profile)
     - `/users/{username}/repos` (Repositories)
     - `/users/{username}/gists` (Gists - mapped to `GistCard.jsx`)
3. **Custom Hooks**:
   - `useCountUp.js`: Drives smooth numeric animations in the UI.
   - `useWrappedStats.js`: Pure data transformation hook that calculates insights exclusively for the `GitHubWrapped.jsx` view.

---

## 🎨 Theming, Styling & Animations

- Styling is handled exclusively through **Tailwind CSS**.
- Complex transitions and responsive reflows are orchestrated via Tailwind classes.
- Persistent Dark Mode is supported natively.
