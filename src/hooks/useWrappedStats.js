import { useMemo } from 'react';
import {
  getMostUsedLanguage,
  getTotalEvents,
  getMostStarredRepo,
  getPeakActivityMonth,
  getCoderPersonality,
  getLongestStreak,
} from '../lib/repoStats';

export default function useWrappedStats(profile, repos, events, activityMap) {
  return useMemo(() => {
    if (!profile || !repos || !events) {
      return null;
    }

    return {
      mostUsedLanguage: getMostUsedLanguage(repos),
      totalEvents: getTotalEvents(events),
      mostStarredRepo: getMostStarredRepo(repos),
      peakActivityMonth: getPeakActivityMonth(events),
      coderPersonality: getCoderPersonality(events),
      longestStreak: getLongestStreak(events, activityMap),
    };
  }, [profile, repos, events, activityMap]);
}
