# GitStats

GitHub Profile Analyzer - explore any public GitHub account without leaving the page.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue?style=flat-square&logo=vercel)](https://git-stats-103.vercel.app/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Charts-FF6384?style=flat-square)](https://recharts.org/)
[![GitHub API](https://img.shields.io/badge/GitHub-REST%20API%20v3-181717?style=flat-square&logo=github)](https://docs.github.com/en/rest)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![ELUSoC 2026](https://img.shields.io/badge/ELUSoC-2026-purple?style=flat-square)](https://edulinkup.dev/elusoc)

## Features

- GitHub profile search with real-time data from the GitHub REST API
- Profile card with avatar, bio, location, followers, following, and public repo count
- Language breakdown donut chart grouped by top languages
- Aggregate stats including total stars earned, top language, and account age
- Top 6 repositories sorted by star count
- Persistent dark and light mode
- Loading skeletons and error states for all data conditions
- Fully responsive layout for mobile and desktop

## Tech Stack

| Layer      | Technology         |
| ---------- | ------------------ |
| Framework  | React 18           |
| Build Tool | Vite 5             |
| Styling    | Tailwind CSS 3     |
| Charts     | Recharts           |
| Icons      | lucide-react       |
| Data       | GitHub REST API v3 |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
git clone https://github.com/purvachopade1016/Git-Stats.git
cd Git-Stats
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```text
GitStats/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── App.jsx
    ├── App.css
    ├── main.jsx
    └── components/
        ├── ProfileCard.jsx
        ├── StatsBar.jsx
        ├── LanguageChart.jsx
        └── RepoCard.jsx
```

## API Usage

The app uses GitHub REST API v3 calls. Unauthenticated requests are subject to GitHub rate limits of 60 requests per hour per IP address.

Endpoints used:

```text
GET https://api.github.com/users/{username}
GET https://api.github.com/users/{username}/repos?per_page=100&sort=updated
```

## Increasing API Rate Limit

By using a GitHub Personal Access Token, you can increase the rate limit from 60 to 5000 requests per hour.

### Step 1: Create a Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give your token a descriptive name
4. Select the `public_repo` scope (only read-only access to public repositories is needed)
5. Click "Generate token"
6. **Copy the token immediately** - you won't be able to see it again!

### Step 2: Configure the Token

1. Copy the `.env.example` file to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and replace `your_github_personal_access_token_here` with the token you just created
3. Restart your dev server (`npm run dev`) for the changes to take effect

### Important Notes

- Never commit your `.env` file (it's already in `.gitignore`)
- Keep your token secure and don't share it publicly

## Contributing

This project participates in ELUSoC 2026. See [CONTRIBUTING.md](CONTRIBUTING.md) for full contribution guidelines.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Author

GitHub: [@purvachopade1016](https://github.com/purvachopade1016)
