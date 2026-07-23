import { useMemo } from "react";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function useWrappedStats(profile, repos, events, activityMap) {
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
    const mostUsedLanguage = sortedLangs[0]?.[0] || "JavaScript";

    // 2. totalEvents (extrapolated 90 days of public activity to 365 days)
    const totalEvents = events.length * 4;

    // 3. mostStarredRepo
    const mostStarredRepo = repos.reduce((max, repo) => {
      return (repo.stargazers_count || 0) > (max?.stargazers_count || 0)
        ? repo
        : max;
    }, null);

    // 4. peakActivityMonth
    const monthCounts = events.reduce((acc, ts) => {
      const d = new Date(ts);
      const m = d.getMonth();
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    const sortedMonths = Object.entries(monthCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const peakActivityMonth = sortedMonths[0]
      ? monthNames[Number(sortedMonths[0][0])]
      : "July";

    // 5. coderPersonality
    const hourCounts = events.reduce((acc, ts) => {
      const d = new Date(ts);
      const h = d.getHours();
      acc[h] = (acc[h] || 0) + 1;
      return acc;
    }, {});
    const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
    const maxHour = sortedHours[0] ? Number(sortedHours[0][0]) : 12;

    let coderPersonality = "The Open Source Champion 🏆";
    if (maxHour >= 0 && maxHour < 4) {
      coderPersonality = "The Night Owl 🦉";
    } else if (maxHour >= 4 && maxHour < 6) {
      coderPersonality = "The Early Bird 🌅";
    } else if (maxHour >= 6 && maxHour < 12) {
      coderPersonality = "The Morning Coder ☕";
    } else if (maxHour >= 12 && maxHour < 18) {
      coderPersonality = "The Open Source Champion 🏆";
    } else {
      coderPersonality = "The Evening Hacker 🌙";
    }

    // 6. longestStreak (consecutive active days calculated from activityMap or timestamps)
    let uniqueDates = [];
    if (activityMap && Object.keys(activityMap).length > 0) {
      uniqueDates = Object.keys(activityMap)
        .filter((dateStr) => activityMap[dateStr] > 0)
        .sort();
    } else {
      uniqueDates = Array.from(
        new Set(
          events.map((ts) => {
            const d = new Date(ts);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          }),
        ),
      ).sort();
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let lastTime = null;

    uniqueDates.forEach((dateStr) => {
      const currentTime = new Date(dateStr).getTime();
      if (lastTime === null) {
        currentStreak = 1;
      } else {
        const diffDays = Math.round(
          (currentTime - lastTime) / (1000 * 60 * 60 * 24),
        );
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
  }, [profile, repos, events, activityMap]);
}
