import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { getLanguageCounts } from '../lib/repoStats';

const COLORS = ['var(--gs-accent)', '#58A6FF', '#3FB950', '#A371F7', '#D29922', '#F85149', '#7EE787', '#79C0FF'];

function buildLanguageData(repos) {
  const counts = getLanguageCounts(repos);

  const entries = Object.entries(counts).sort((left, right) => right[1] - left[1]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (!total) {
    return { total: 0, data: [] };
  }

  const topLanguages = entries.slice(0, 6).map(([name, value]) => ({ name, value }));
  const rest = entries.slice(6).reduce((sum, [, value]) => sum + value, 0);

  if (rest > 0) {
    topLanguages.push({ name: 'Other', value: rest });
  }

  return { total, data: topLanguages };
}

function LanguageChart({ repos, loading }) {
  if (loading) {
    return (
      <section className="panel p-5 sm:p-6" aria-busy="true">
        <div className="h-5 w-40 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
        <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="mx-auto h-[240px] w-[240px] rounded-full border border-dashed border-[var(--gs-border)] bg-[var(--gs-surface-alt)] animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-48 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
            <div className="h-4 w-36 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
            <div className="h-4 w-56 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
            <div className="h-4 w-44 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  const { total, data } = buildLanguageData(repos);
  const topLanguage = data[0];

const chartLabel = topLanguage
  ? `Language breakdown pie chart. ${topLanguage.name} is the most common language at ${(
      (topLanguage.value / total) *
      100
    ).toFixed(1)} percent.`
  : 'Language breakdown pie chart.';

  if (!total) {
    return null;
  }

  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--gs-text)]">Language Breakdown</h2>
          <p className="mt-1 text-sm text-[var(--gs-text-secondary)]">Repository language counts, grouped into the top languages and Other.</p>
        </div>
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">{total} language-tagged repos</div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-center">
        <div
  className="h-[260px] w-full"
  role="img"
  aria-label={chartLabel}
  aria-describedby="language-chart-legend"
>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={66}
                outerRadius={102}
                paddingAngle={3}
                stroke="var(--gs-bg)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

         <div
  id="language-chart-legend"
  className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"
>
          {data.map((entry, index) => {
            const percent = ((entry.value / total) * 100).toFixed(1);

            return (
              <div key={entry.name} className="flex items-center justify-between rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate text-sm font-medium text-[var(--gs-text)]">{entry.name}</span>
                </div>
                <span className="text-sm text-[var(--gs-text-secondary)]">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default LanguageChart;