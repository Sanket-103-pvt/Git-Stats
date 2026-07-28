import { describe, it, expect, vi } from 'vitest';
import {
  getLanguageCounts,
  getTopLanguage,
  getAccountAgeYears,
  getMostUsedLanguage,
  getTotalEvents,
  getMostStarredRepo,
  getPeakActivityMonth,
  getCoderPersonality,
  getLongestStreak,
} from './repoStats';

describe('GitHub Wrapped Calculation Utilities', () => {
  describe('getLanguageCounts', () => {
    it('correctly counts occurrences of primary languages', () => {
      const repos = [
        { language: 'JavaScript' },
        { language: 'Python' },
        { language: 'JavaScript' },
        { language: null },
        { language: 'TypeScript' },
      ];
      expect(getLanguageCounts(repos)).toEqual({
        JavaScript: 2,
        Python: 1,
        TypeScript: 1,
      });
    });

    it('returns empty object when no repos are provided', () => {
      expect(getLanguageCounts([])).toEqual({});
    });
  });

  describe('getTopLanguage', () => {
    it('returns the most frequent language', () => {
      const repos = [
        { language: 'Python' },
        { language: 'JavaScript' },
        { language: 'Python' },
      ];
      expect(getTopLanguage(repos)).toBe('Python');
    });

    it('returns N/A when there are no languages', () => {
      expect(getTopLanguage([])).toBe('N/A');
    });
  });

  describe('getAccountAgeYears', () => {
    it('calculates the correct full years since account creation', () => {
      // Mock Date.now to keep testing deterministic
      const mockNow = new Date('2026-07-28T00:00:00.000Z').getTime();
      vi.spyOn(Date, 'now').mockReturnValue(mockNow);

      const createdDate = '2023-01-01T00:00:00.000Z';
      // Expected years: ~3.57 years, floored to 3 years
      expect(getAccountAgeYears(createdDate)).toBe(3);

      vi.restoreAllMocks();
    });

    it('returns 0 for invalid or missing dates', () => {
      expect(getAccountAgeYears(null)).toBe(0);
      expect(getAccountAgeYears(undefined)).toBe(0);
      expect(getAccountAgeYears('invalid-date')).toBe(0);
    });
  });

  describe('getMostUsedLanguage', () => {
    it('returns the top language and defaults to JavaScript if list is empty', () => {
      const repos = [
        { language: 'C++' },
        { language: 'C++' },
        { language: 'Go' },
      ];
      expect(getMostUsedLanguage(repos)).toBe('C++');
      expect(getMostUsedLanguage([])).toBe('JavaScript');
    });
  });

  describe('getTotalEvents', () => {
    it('multiplies activity event count by 4 to extrapolate yearly rate', () => {
      const events = ['event1', 'event2', 'event3'];
      expect(getTotalEvents(events)).toBe(12);
      expect(getTotalEvents([])).toBe(0);
      expect(getTotalEvents(null)).toBe(0);
    });
  });

  describe('getMostStarredRepo', () => {
    it('identifies the repository with the highest stargazers count', () => {
      const repos = [
        { name: 'repo-a', stargazers_count: 5 },
        { name: 'repo-b', stargazers_count: 102 },
        { name: 'repo-c', stargazers_count: 89 },
      ];
      expect(getMostStarredRepo(repos)).toEqual({ name: 'repo-b', stargazers_count: 102 });
    });

    it('returns null if repository array is empty', () => {
      expect(getMostStarredRepo([])).toBeNull();
    });
  });

  describe('getPeakActivityMonth', () => {
    it('correctly maps timestamps to the peak month of commits', () => {
      const events = [
        '2026-03-12T10:00:00', // March
        '2026-03-15T12:00:00', // March
        '2026-08-01T08:00:00', // August
      ];
      expect(getPeakActivityMonth(events)).toBe('March');
    });

    it('defaults to July if there are no events', () => {
      expect(getPeakActivityMonth([])).toBe('July');
    });
  });

  describe('getCoderPersonality', () => {
    it('returns Night Owl for peak activity between midnight and 4 AM', () => {
      const events = [
        '2026-07-28T01:00:00',
        '2026-07-28T02:00:00',
      ];
      expect(getCoderPersonality(events)).toBe('The Night Owl 🦉');
    });

    it('returns Early Bird for peak activity between 4 AM and 6 AM', () => {
      const events = [
        '2026-07-28T04:30:00',
        '2026-07-28T05:00:00',
      ];
      expect(getCoderPersonality(events)).toBe('The Early Bird 🌅');
    });

    it('returns Morning Coder for peak activity between 6 AM and 12 PM', () => {
      const events = [
        '2026-07-28T09:00:00',
        '2026-07-28T10:00:00',
      ];
      expect(getCoderPersonality(events)).toBe('The Morning Coder ☕');
    });

    it('returns Open Source Champion for peak activity between 12 PM and 6 PM', () => {
      const events = [
        '2026-07-28T14:00:00',
        '2026-07-28T15:00:00',
      ];
      expect(getCoderPersonality(events)).toBe('The Open Source Champion 🏆');
    });

    it('returns Evening Hacker for peak activity between 6 PM and midnight', () => {
      const events = [
        '2026-07-28T20:00:00',
        '2026-07-28T21:00:00',
      ];
      expect(getCoderPersonality(events)).toBe('The Evening Hacker 🌙');
    });
  });

  describe('getLongestStreak', () => {
    it('calculates the longest consecutive day streak from activityMap', () => {
      const activityMap = {
        '2026-07-01': 2,
        '2026-07-02': 1,
        '2026-07-03': 0, // Gap
        '2026-07-04': 5,
        '2026-07-05': 1,
        '2026-07-06': 3,
        '2026-07-07': 0,
      };
      // Streaks are [2 days (July 1-2), 3 days (July 4-6)]. Longest is 3.
      expect(getLongestStreak([], activityMap)).toBe(3);
    });

    it('calculates longest streak directly from events if activityMap is missing', () => {
      const events = [
        '2026-07-10T12:00:00',
        '2026-07-11T12:00:00',
        '2026-07-12T12:00:00', // 3 days
        '2026-07-15T12:00:00', // Gap
        '2026-07-16T12:00:00', // 2 days
      ];
      expect(getLongestStreak(events, null)).toBe(3);
    });

    it('returns 0 if no events or activityMap is provided', () => {
      expect(getLongestStreak([], {})).toBe(0);
      expect(getLongestStreak(null, null)).toBe(0);
    });
  });
});
