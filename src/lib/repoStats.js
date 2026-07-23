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
  const sorted = Object.entries(counts).sort(
    (left, right) => right[1] - left[1],
  );
  return sorted[0]?.[0] || "N/A";
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
