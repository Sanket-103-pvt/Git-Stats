# Contributing to GitStats

GitStats participates in ELUSoC 2026, an open-source contribution program run by EduLinkUp. This document explains how to contribute to this repository as part of ELUSoC.

## Before You Start

- Read the ELUSoC contribution guidelines at [edulinkup.dev/elusoc](https://edulinkup.dev/elusoc)
- Make sure you are registered as an ELUSoC 2026 contributor
- Only issues labeled `elusoc` are eligible for ELUSoC points
- You must be assigned to an issue before opening a pull request

## Difficulty Levels and Points

| Label | Difficulty | Points |
| --- | --- | --- |
| `newbie` | Beginner - good for first-time contributors | 10 XP |
| `adventurer` | Intermediate - requires understanding of the codebase | 25 XP |
| `veteran` | Advanced - significant feature or architectural change | 50 XP |

## Getting Assigned

1. Browse open issues at [github.com/Sanket-103-pvt/gitstats/issues](https://github.com/Sanket-103-pvt/gitstats/issues)
2. Filter by the `elusoc` label to see eligible issues
3. Comment on the issue you want to work on with a brief description of your approach
4. Wait for assignment before writing any code
5. Do not open a pull request without being assigned first

## Setting Up the Project Locally

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/<your-username>/gitstats.git
cd gitstats

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Branching Convention

Create a branch from `elusoc` (not `main`) for all ELUSoC contributions:

```bash
git checkout elusoc
git pull origin elusoc
git checkout -b feat/your-feature-name
```

Branch naming examples:

- `feat/add-github-token-support`
- `fix/language-chart-overflow`
- `docs/improve-readme`
- `ui/dark-mode-contrast`

## Making Changes

- Keep changes focused on the issue you are assigned to
- Do not bundle unrelated changes in a single pull request
- Follow the existing code style - Tailwind for styling, functional React components, no class components
- Test your changes in both dark and light mode
- Verify the app is responsive on mobile screen widths

## Opening a Pull Request

1. Push your branch to your fork
2. Open a pull request targeting the `elusoc` branch of this repository
3. Use the following title format: `[ELUSoC'26] brief description of change`
4. In the PR description, include:

- The issue number it resolves (e.g. `Fixes #12`)
- A short summary of what changed and why
- Screenshots or screen recordings if the change affects the UI
5. Check all items in the PR checklist before requesting review

## Pull Request Checklist

- [ ] I am assigned to the related issue
- [ ] My branch targets `elusoc`, not `main`
- [ ] My changes are limited to the scope of the assigned issue
- [ ] The app builds without errors (`npm run build`)
- [ ] I have tested in both dark and light mode
- [ ] I have tested on a narrow screen width
- [ ] I have not committed `node_modules`, `.env`, or build output

## What Not to Do

- Do not open a pull request without assignment
- Do not target `main` directly
- Do not submit the same fix across multiple pull requests
- Do not copy code from other contributors submissions

## Code of Conduct

Be respectful in all issue and pull request discussions. Harassment or dismissive behavior toward other contributors will result in removal from this repository.

## Questions

Open a discussion or comment on the relevant issue. Do not send direct messages for questions that can be asked publicly.