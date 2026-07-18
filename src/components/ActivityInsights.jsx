import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

// NOTE: Events API only returns the last 90 days of public activity.
// This component analyzes event timestamps to determine activity patterns.

function InsightsSkeleton() {
  return (
    <section className="panel p-5 sm:p-6" aria-busy="true">
      <div className="h-5 w-40 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
      <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-center">
        <div className="space-y-4">
          <div className="h-16 w-full rounded bg-[var(--gs-surface-alt)] animate-pulse" />
          <div className="h-6 w-3/4 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
        </div>
        <div className="h-[200px] w-full rounded bg-[var(--gs-surface-alt)] animate-pulse" />
      </div>
    </section>
  );
}

export default function ActivityInsights({ eventTimestamps, loading }) {
  if (loading) {
    return <InsightsSkeleton />;
  }

  if (!eventTimestamps || eventTimestamps.length === 0) {
    return null;
  }

  const dayCounts = Array(7).fill(0);
  const hourCounts = Array(24).fill(0);

  eventTimestamps.forEach((ts) => {
    const d = new Date(ts);
    dayCounts[d.getDay()]++;
    hourCounts[d.getHours()]++;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesPlural = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

  let maxDayIdx = 0;
  let maxDayCount = 0;
  dayCounts.forEach((cnt, idx) => {
    if (cnt > maxDayCount) {
      maxDayCount = cnt;
      maxDayIdx = idx;
    }
  });

  let maxHour = 0;
  let maxHourCount = 0;
  hourCounts.forEach((cnt, hr) => {
    if (cnt > maxHourCount) {
      maxHourCount = cnt;
      maxHour = hr;
    }
  });

  // Coder Personality Classification
  let emoji = '💼';
  let label = 'The Daytime Dev';
  if (maxHour >= 0 && maxHour < 4) {
    emoji = '🦉';
    label = 'The Night Owl';
  } else if (maxHour >= 4 && maxHour < 6) {
    emoji = '🌅';
    label = 'The Early Bird';
  } else if (maxHour >= 6 && maxHour < 12) {
    emoji = '☕';
    label = 'The Morning Coder';
  } else if (maxHour >= 12 && maxHour < 18) {
    emoji = '💼';
    label = 'The Daytime Dev';
  } else {
    emoji = '🌙';
    label = 'The Evening Hacker';
  }

  // Active time window description
  let activeWindow = 'evenings';
  if (maxHour >= 0 && maxHour < 6) {
    activeWindow = 'late nights (12-6 AM)';
  } else if (maxHour >= 6 && maxHour < 12) {
    activeWindow = 'mornings (6 AM-12 PM)';
  } else if (maxHour >= 12 && maxHour < 18) {
    activeWindow = 'afternoons (12-6 PM)';
  } else {
    activeWindow = 'evenings (6 PM-12 AM)';
  }

  const dayData = dayNames.map((name, idx) => ({
    name: name.slice(0, 3),
    events: dayCounts[idx],
  }));

  const totalEvents = eventTimestamps.length;

  return (
    <section className="panel p-5 sm:p-6 animate-fade-in-up">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--gs-text)]">Activity Pattern</h2>
          <p className="mt-1 text-sm text-[var(--gs-text-secondary)]">
            Commit and event frequency analytics based on your public activity timeline.
          </p>
        </div>
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">
          Last {totalEvents} events
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        {/* Personality Badge & Active Time */}
        <div className="flex flex-col gap-4 rounded-xl border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gs-bg)] text-4xl shadow-inner border border-[var(--gs-border)]">
              {emoji}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gs-accent)]">
                Personality
              </div>
              <h3 className="text-lg font-bold text-[var(--gs-text)] mt-0.5">{label}</h3>
            </div>
          </div>

          <div className="border-t border-[var(--gs-border)] pt-4 mt-1">
            <div className="text-sm font-medium text-[var(--gs-text)]">
              Most active on <span className="text-[var(--gs-accent)] font-semibold">{dayNamesPlural[maxDayIdx]}</span> during the <span className="text-[var(--gs-accent)] font-semibold">{activeWindow}</span>.
            </div>
            <p className="text-xs text-[var(--gs-text-secondary)] mt-1.5 leading-relaxed">
              Timestamps are extracted from public push, pull request, and issue events over the last 90 days.
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--gs-text-secondary)', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--gs-text-secondary)', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'var(--gs-surface-alt)', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: 'var(--gs-surface)',
                  borderColor: 'var(--gs-border)',
                  borderRadius: '8px',
                  color: 'var(--gs-text)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="events" radius={[4, 4, 0, 0]}>
                {dayData.map((entry, index) => {
                  const isMax = entry.events === maxDayCount;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isMax ? 'var(--gs-accent)' : 'var(--gs-border)'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
