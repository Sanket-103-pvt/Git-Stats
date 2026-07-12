import { useMemo } from 'react';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function useWrappedStats(profile, repos, events) {
  return useMemo(() => {
    if (!profile || !repos || !events) {
      return null;
    }

    // 1. mostUsedLanguage (highest count of repositories)
    const langCounts = repos.reduce((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {});
    const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
    const mostUsedLanguage = sortedLangs[0]?.[0] || 'JavaScript';

    // 2. totalEvents (extrapolated 90 days of public activity to 365 days)
    const totalEvents = events.length * 4;

    // 3. mostStarredRepo
    const mostStarredRepo = repos.reduce((max, repo) => {
      return (repo.stargazers_count || 0) > (max?.stargazers_count || 0) ? repo : max;
    }, null);

    // 4. peakActivityMonth (month index with highest event frequency)
    const monthCounts = Array(12).fill(0);
    const hourCounts = Array(24).fill(0);
    events.forEach((ts) => {
      const d = new Date(ts);
      monthCounts[d.getMonth()]++;
      hourCounts[d.getHours()]++;
    });

    let maxMonthIdx = 0;
    let maxMonthCount = 0;
    monthCounts.forEach((cnt, idx) => {
      if (cnt > maxMonthCount) {
        maxMonthCount = cnt;
        maxMonthIdx = idx;
      }
    });
    const peakActivityMonth = monthNames[maxMonthIdx];

    // 5. coderPersonality (peak hour categories)
    let maxHour = 12;
    let maxHourCount = 0;
    hourCounts.forEach((cnt, hr) => {
      if (cnt > maxHourCount) {
        maxHour = hr;
        maxHourCount = cnt;
      }
    });

    let coderPersonality = 'The Open Source Champion 🏆';
    if (maxHour >= 0 && maxHour < 4) {
      coderPersonality = 'The Night Owl 🦉';
    } else if (maxHour >= 4 && maxHour < 6) {
      coderPersonality = 'The Early Bird 🌅';
    } else if (maxHour >= 6 && maxHour < 12) {
      coderPersonality = 'The Morning Coder ☕';
    } else if (maxHour >= 12 && maxHour < 18) {
      coderPersonality = 'The Open Source Champion 🏆';
    } else {
      coderPersonality = 'The Evening Hacker 🌙';
    }

    // 6. longestStreak (consecutive active days calculated from timestamps)
    const uniqueDates = Array.from(new Set(events.map((ts) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))).sort();

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

    return {
      mostUsedLanguage,
      totalEvents,
      mostStarredRepo,
      peakActivityMonth,
      coderPersonality,
      longestStreak,
    };
  }, [profile, repos, events]);
}
