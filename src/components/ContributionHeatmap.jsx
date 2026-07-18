// NOTE: GitHub's full contribution graph requires the GraphQL API (requires auth).
// This component uses the public Events API (/users/{username}/events) as an
// approximation. It captures up to 100 public events from the last 90 days.
// Push events, PR events, issue events etc. all count as activity.
// This will NOT match GitHub's own contribution graph exactly.

import { useMemo, useState } from 'react';

const DAYS_IN_WEEK = 7;
const WEEKS = 52;
const TOTAL_DAYS = DAYS_IN_WEEK * WEEKS; // 364

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns a YYYY-MM-DD string in local time for a given Date object.
 */
function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns a Tailwind background class based on the event count.
 * Colours follow GitHub's green-square convention, mapped to CSS variables.
 */
function getCellStyle(count) {
  if (count === 0) return { backgroundColor: '#222' };
  if (count <= 2)  return { backgroundColor: '#0e4429' };
  if (count <= 5)  return { backgroundColor: '#006d32' };
  if (count <= 10) return { backgroundColor: '#26a641' };
  return              { backgroundColor: '#39d353' };
}

/**
 * Formats a YYYY-MM-DD date string for tooltip display.
 * e.g. "Jul 8, 2026"
 */
function formatTooltipDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

function ContributionHeatmap({ activityMap, loading }) {
  const [tooltip, setTooltip] = useState(null); // { text, x, y }

  // Build the ordered list of 364 date strings ending today.
  const { dates, monthLabels } = useMemo(() => {
    const today = new Date();
    // Align start to the nearest Sunday (so week columns are Sun→Sat)
    const dayOfWeek = today.getDay(); // 0=Sun
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(today.getDate() - (TOTAL_DAYS - 1) - dayOfWeek);

    const allDates = [];
    const cur = new Date(start);
    while (allDates.length < WEEKS * DAYS_IN_WEEK) {
      allDates.push(toLocalDateString(cur));
      cur.setDate(cur.getDate() + 1);
    }

    // Build month label positions: which column (week index) each month starts at.
    const labels = [];
    let lastMonth = -1;
    for (let col = 0; col < WEEKS; col++) {
      const dateStr = allDates[col * DAYS_IN_WEEK];
      if (!dateStr) continue;
      const month = Number(dateStr.split('-')[1]);
      if (month !== lastMonth) {
        labels.push({ col, label: MONTH_NAMES[month - 1] });
        lastMonth = month;
      }
    }

    return { dates: allDates, monthLabels: labels, end };
  }, []);

  if (loading) {
    return (
      <section className="panel p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--gs-text)]">Activity Heatmap</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">Last 12 months</span>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-grid animate-pulse gap-[3px]" style={{ gridTemplateColumns: `28px repeat(${WEEKS}, 13px)`, gridTemplateRows: `16px repeat(7, 13px)` }}>
            {Array.from({ length: WEEKS + 1 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-[var(--gs-border)]" style={{ opacity: 0.3 }} />
            ))}
            {Array.from({ length: WEEKS * DAYS_IN_WEEK }).map((_, i) => (
              <div key={`cell-${i}`} className="h-3.5 w-3.5 rounded-sm bg-[var(--gs-border)]" style={{ opacity: 0.3 }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!activityMap) {
    return null;
  }

  // Arrange dates into a 2D array: weeks[col][row]
  const weeks = [];
  for (let col = 0; col < WEEKS; col++) {
    const week = [];
    for (let row = 0; row < DAYS_IN_WEEK; row++) {
      week.push(dates[col * DAYS_IN_WEEK + row] || null);
    }
    weeks.push(week);
  }

  const totalEvents = Object.values(activityMap).reduce((s, v) => s + v, 0);
  const activeDays = Object.values(activityMap).filter((v) => v > 0).length;

  return (
    <section className="panel p-5 sm:p-6 relative">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--gs-text)]">Activity Heatmap</h2>
          <p className="mt-0.5 text-xs text-[var(--gs-text-secondary)]">
            Based on GitHub contribution calendar · fallback to public events if unavailable
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--gs-text-secondary)]">
          <span className="uppercase tracking-[0.18em]">Last 12 months</span>
          <span>{totalEvents.toLocaleString()} events · {activeDays} active days</span>
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto pb-2">
        <div className="relative inline-block min-w-max">
          {/* Month labels row */}
          <div className="mb-1 flex" style={{ paddingLeft: 36 }}>
            {weeks.map((week, colIdx) => {
              const label = monthLabels.find((l) => l.col === colIdx);
              return (
                <div key={colIdx} className="w-[15px] shrink-0 text-[10px] text-[var(--gs-text-secondary)]">
                  {label ? label.label : ''}
                </div>
              );
            })}
          </div>

          {/* Grid rows */}
          <div className="flex gap-0">
            {/* Day-of-week labels */}
            <div className="mr-1 flex flex-col justify-between" style={{ width: 28 }}>
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-[10px] leading-[13px] text-[var(--gs-text-secondary)]"
                  style={{ height: 13, lineHeight: '13px' }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Cell columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[3px]">
                  {week.map((dateStr, rowIdx) => {
                    const count = dateStr ? (activityMap[dateStr] || 0) : 0;
                    const cellStyle = getCellStyle(count);
                    const isFuture = dateStr ? dateStr > toLocalDateString(new Date()) : false;

                    return (
                      <div
                        key={rowIdx}
                        className="h-[13px] w-[13px] cursor-pointer rounded-sm transition-transform hover:scale-125"
                        style={isFuture ? { backgroundColor: 'transparent' } : cellStyle}
                        onMouseEnter={(e) => {
                          if (!dateStr || isFuture) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            text: count === 0
                              ? `No events on ${formatTooltipDate(dateStr)}`
                              : `${count} event${count === 1 ? '' : 's'} on ${formatTooltipDate(dateStr)}`,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        aria-label={dateStr ? `${count} events on ${formatTooltipDate(dateStr)}` : undefined}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Colour legend */}
          <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-[var(--gs-text-secondary)]">
            <span>Less</span>
            {[0, 1, 3, 6].map((n) => (
              <div
                key={n}
                className="h-[11px] w-[11px] rounded-sm"
                style={getCellStyle(n)}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md border border-[var(--gs-border)] bg-[var(--gs-surface)] px-2.5 py-1.5 text-xs text-[var(--gs-text)] shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </section>
  );
}

export default ContributionHeatmap;
