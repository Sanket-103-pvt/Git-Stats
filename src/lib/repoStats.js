// Shared derivations over a user's repositories and profile.
//
// These lived in three components as near-duplicates. Two copies of the language-count reduce
// (StatsBar's getLanguageSummary and LanguageChart's buildLanguageData) and two copies of the
// account-age calculation (StatsBar's getAccountAge and App's formatRelativeYears) had already
// started to drift — the two age functions disagreed on whether a missing createdAt is handled,
// one returning 0 and the other producing NaN. Consolidating them here means an edge-case fix
// lands in one place.

/**
 * Count repositories by primary language.
 *
 * The shared primitive both language views are built on: StatsBar wants the single most-used
 * language, LanguageChart wants the full distribution, and both start from this same tally.
 *
 * @param {Array<{language?: string | null}>} repos
 * @returns {Record<string, number>} language name -> repo count (languageless repos are ignored)
 */
export function getLanguageCounts(repos) {
  return repos.reduce((accumulator, repo) => {
    if (repo.language) {
      accumulator[repo.language] = (accumulator[repo.language] || 0) + 1;
    }
    return accumulator;
  }, {});
}

/**
 * The most-used primary language across the given repositories.
 *
 * @param {Array<{language?: string | null}>} repos
 * @returns {string} the top language, or 'N/A' when there are no languaged repos
 */
export function getTopLanguage(repos) {
  const counts = getLanguageCounts(repos);
  const sorted = Object.entries(counts).sort((left, right) => right[1] - left[1]);
  return sorted[0]?.[0] || 'N/A';
}

/**
 * Whole years since an account was created.
 *
 * Uses 365.25 days per year so leap years don't accumulate a drift, floors to whole years, and
 * never returns a negative number. A missing or unparseable createdAt yields 0 rather than NaN —
 * this is the edge case the two former copies disagreed on.
 *
 * @param {string | null | undefined} createdAt an ISO 8601 timestamp (e.g. a GitHub created_at)
 * @returns {number} whole years, clamped at 0
 */
export function getAccountAgeYears(createdAt) {
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
 * Defaults to 'JavaScript' if none are found.
 *
 * @param {Array<{language?: string | null}>} repos
 * @returns {string}
 */
export function getMostUsedLanguage(repos) {
  if (!repos || repos.length === 0) return 'JavaScript';
  const counts = repos.reduce((acc, repo) => {
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
 * @param {Array} events
 * @returns {number}
 */
export function getTotalEvents(events) {
  if (!events) return 0;
  return events.length * 4;
}

/**
 * Get the repository with the most stargazers count.
 *
 * @param {Array} repos
 * @returns {Object|null}
 */
export function getMostStarredRepo(repos) {
  if (!repos || repos.length === 0) return null;
  return repos.reduce((max, repo) => {
    return (repo.stargazers_count || 0) > (max?.stargazers_count || 0) ? repo : max;
  }, null);
}

/**
 * Find the month with the highest count of event timestamps.
 *
 * @param {Array<string>} events
 * @returns {string}
 */
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
export function getPeakActivityMonth(events) {
  if (!events || events.length === 0) return 'July';
  const monthCounts = events.reduce((acc, ts) => {
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
 * @param {Array<string>} events
 * @returns {string}
 */
export function getCoderPersonality(events) {
  if (!events || events.length === 0) return 'The Open Source Champion 🏆';
  const hourCounts = events.reduce((acc, ts) => {
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
 * @param {Array<string>} events
 * @param {Record<string, number>} activityMap
 * @returns {number}
 */
export function getLongestStreak(events, activityMap) {
  let uniqueDates = [];
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
  let lastTime = null;

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
