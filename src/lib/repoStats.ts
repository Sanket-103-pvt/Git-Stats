import { GitHubRepo } from '../types/github';

/**
 * Count repositories by primary language.
 *
 * @param {GitHubRepo[]} repos
 * @returns {Record<string, number>}
 */
export function getLanguageCounts(repos: GitHubRepo[]): Record<string, number> {
  return repos.reduce((accumulator: Record<string, number>, repo: GitHubRepo) => {
    if (repo.language) {
      accumulator[repo.language] = (accumulator[repo.language] || 0) + 1;
    }
    return accumulator;
  }, {});
}

/**
 * The most-used primary language across the given repositories.
 *
 * @param {GitHubRepo[]} repos
 * @returns {string}
 */
export function getTopLanguage(repos: GitHubRepo[]): string {
  const counts = getLanguageCounts(repos);
  const sorted = Object.entries(counts).sort((left, right) => right[1] - left[1]);
  return sorted[0]?.[0] || 'N/A';
}

/**
 * Whole years since an account was created.
 *
 * @param {string | null | undefined} createdAt
 * @returns {number}
 */
export function getAccountAgeYears(createdAt: string | null | undefined): number {
  if (!createdAt) {
    return 0;
  }

  const started = new Date(createdAt).getTime();
  if (Number.isNaN(started)) {
    return 0;
  }

  const years = (Date.now() - started) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.floor(years));
}

/**
 * Get most used language by repository counts.
 *
 * @param {GitHubRepo[]} repos
 * @returns {string}
 */
export function getMostUsedLanguage(repos: GitHubRepo[]): string {
  if (!repos || repos.length === 0) return 'JavaScript';
  const counts = repos.reduce((acc: Record<string, number>, repo: GitHubRepo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'JavaScript';
}

/**
 * Extrapolate 90 days of public activity to 365 days.
 *
 * @param {string[] | null | undefined} events
 * @returns {number}
 */
export function getTotalEvents(events: string[] | null | undefined): number {
  if (!events) return 0;
  return events.length * 4;
}

/**
 * Get the repository with the most stargazers count.
 *
 * @param {GitHubRepo[]} repos
 * @returns {GitHubRepo|null}
 */
export function getMostStarredRepo(repos: GitHubRepo[]): GitHubRepo | null {
  if (!repos || repos.length === 0) return null;
  return repos.reduce((max: GitHubRepo | null, repo: GitHubRepo) => {
    if (!max) return repo;
    return (repo.stargazers_count || 0) > (max.stargazers_count || 0) ? repo : max;
  }, null);
}

/**
 * Find the month with the highest count of event timestamps.
 *
 * @param {string[]} events
 * @returns {string}
 */
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
export function getPeakActivityMonth(events: string[]): string {
  if (!events || events.length === 0) return 'July';
  const monthCounts = events.reduce((acc: Record<number, number>, ts: string) => {
    const d = new Date(ts);
    const m = d.getMonth();
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  const sortedMonths = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]);
  return sortedMonths[0] ? monthNames[Number(sortedMonths[0][0])] : 'July';
}

/**
 * Determine coder personality based on the peak hour of event timestamps.
 *
 * @param {string[]} events
 * @returns {string}
 */
export function getCoderPersonality(events: string[]): string {
  if (!events || events.length === 0) return 'The Open Source Champion 🏆';
  const hourCounts = events.reduce((acc: Record<number, number>, ts: string) => {
    const d = new Date(ts);
    const h = d.getHours();
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});
  const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
  const maxHour = sortedHours[0] ? Number(sortedHours[0][0]) : 12;

  if (maxHour >= 0 && maxHour < 4) {
    return 'The Night Owl 🦉';
  } else if (maxHour >= 4 && maxHour < 6) {
    return 'The Early Bird 🌅';
  } else if (maxHour >= 6 && maxHour < 12) {
    return 'The Morning Coder ☕';
  } else if (maxHour >= 12 && maxHour < 18) {
    return 'The Open Source Champion 🏆';
  } else {
    return 'The Evening Hacker 🌙';
  }
}

/**
 * Compute the longest streak of consecutive days.
 *
 * @param {string[] | null} events
 * @param {Record<string, number> | null} activityMap
 * @returns {number}
 */
export function getLongestStreak(
  events: string[] | null,
  activityMap: Record<string, number> | null
): number {
  let uniqueDates: string[] = [];
  if (activityMap && Object.keys(activityMap).length > 0) {
    uniqueDates = Object.keys(activityMap)
      .filter((dateStr) => activityMap[dateStr] > 0)
      .sort();
  } else {
    if (!events || events.length === 0) return 0;
    uniqueDates = Array.from(new Set(events.map((ts) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))).sort();
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let lastTime: number | null = null;

  uniqueDates.forEach((dateStr) => {
    const currentTime = new Date(dateStr).getTime();
    if (lastTime === null) {
      currentStreak = 1;
    } else {
      const diffDays = Math.round((currentTime - lastTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    lastTime = currentTime;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  });

  return longestStreak;
}
