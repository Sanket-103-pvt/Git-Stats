# 04 — UI/UX Design Brief

## Aesthetic Direction
Dark-mode-first. Clean, minimal, developer-focused.  
Vibe: **GitHub × Linear × Vercel**. Feels like a tool a developer would trust.  
No rounded bubbly consumer UI. Slightly techy, data-forward, information dense without being cluttered.

## Color Palette

### Dark Mode (default)
| Role | Value | Usage |
|------|-------|-------|
| Background | `#0D1117` | Page bg (GitHub's own dark bg) |
| Surface | `#161B22` | Cards, panels |
| Border | `#30363D` | Card borders, dividers |
| Text Primary | `#E6EDF3` | Headings, names |
| Text Secondary | `#8B949E` | Bio, meta, labels |
| Accent | `#58A6FF` | Links, highlights, search button |
| Success/Green | `#3FB950` | Language dots, positive stats |
| Warning | `#D29922` | Rate limit warning |
| Error | `#F85149` | Not-found error state |

### Light Mode
| Role | Value |
|------|-------|
| Background | `#FFFFFF` |
| Surface | `#F6F8FA` |
| Border | `#D0D7DE` |
| Text Primary | `#1F2328` |
| Text Secondary | `#656D76` |
| Accent | `#0969DA` |

## Typography
- **Font:** `Inter` (Google Fonts) — clean, readable, modern sans-serif
- **Headings (name):** `text-xl font-semibold`
- **Body:** `text-sm` / `text-base`
- **Meta/labels:** `text-xs text-secondary`
- **Stat numbers:** `text-2xl font-bold`
- **Repo names:** `text-sm font-medium text-accent`

## Component Style

| Property | Value |
|----------|-------|
| Border radius | `rounded-lg` (8px) — cards, inputs, buttons |
| Button radius | `rounded-md` (6px) |
| Avatar radius | `rounded-full` |
| Shadows | Subtle: `shadow-sm` in light mode. None in dark (border does the work). |
| Cards | Border + surface bg. No heavy drop shadows. |
| Language dot | `w-3 h-3 rounded-full` inline before language name |

## Key UI Patterns

**Search Bar:**
- Full width on mobile, max-w-2xl centered on desktop
- Icon inside left of input (search icon)
- Prominent primary-colored Search button on right
- `focus:ring` accent color glow on focus

**Profile Card:**
- Left: Avatar (80px circle) + name + @username + bio + location tag
- Right: Follower / Following / Repos — 3 stat boxes side by side
- Single card, full width

**Stats Bar:**
- 3 horizontal pills / stat boxes: `⭐ Total Stars`, `💻 Top Language`, `📅 Account Age`
- Icon + label + value layout
- Subtle border, surface bg

**Language Chart (Donut):**
- Recharts `PieChart` with `innerRadius` — donut style
- Legend to the right (or below on mobile): colored dot + language name + percentage
- Max 6 languages shown; rest grouped as "Other"

**Repo Cards (Grid):**
- 2-column grid on desktop, 1-column on mobile
- Each card: repo name (link), description, stars + forks row, language tag pill at bottom
- `⭐ {stars}` and `🍴 {forks}` with lucide icons

**Dark/Light Toggle:**
- Top-right corner
- Sun icon (light mode active) / Moon icon (dark mode active)
- `cursor-pointer`, subtle hover bg

## Dark / Light Mode
Tailwind `darkMode: 'class'` strategy.  
Toggle adds/removes `dark` class on `<html>`.  
All components use `dark:` variants for bg, text, border.

## Mobile Responsiveness
- Search bar: full width, stacked button below on very small screens
- Profile card: avatar + name stack vertically on mobile
- Stats bar: wrap to 1-column on mobile
- Repo grid: 1-column on mobile, 2-column on `sm:` and above
- Language chart: legend moves below chart on mobile

## Accessibility
- All interactive elements keyboard-navigable
- Color contrast ≥ 4.5:1 for text on bg (both modes)
- Repo links open in `_blank` with `rel="noopener noreferrer"`
- Input has `aria-label="GitHub username"`
- Loading skeleton has `aria-busy="true"`

## Reference Apps
Linear, Vercel dashboard, GitHub profile page itself.
