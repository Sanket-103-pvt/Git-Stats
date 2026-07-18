import useCountUp, { formatStatValue } from '../hooks/useCountUp';
import { getAccountAgeYears, getTopLanguage } from '../lib/repoStats';

function StatsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-3" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          style={{ animationDelay: `${index * 0.05}s` }}
          className="h-16 rounded-lg border border-[var(--gs-stat-border)] bg-[var(--gs-stat-bg)] animate-pulse animate-fade-in opacity-0"
        />
      ))}
    </div>
  );
}

function StatTile({ label, value, triggerValue, index = 0 }) {
  return (
    <div
      style={{ animationDelay: `${index * 0.05}s` }}
      className="rounded-lg border border-[var(--gs-stat-border)] bg-[var(--gs-stat-bg)] px-4 py-3 animate-fade-in opacity-0"
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">{label}</div>
      <div
        key={triggerValue ?? value}
        className="mt-2 text-lg font-semibold text-[var(--gs-text)] inline-block animate-count-pulse"
      >
        {value}
      </div>
    </div>
  );
}

function StatsBar({ repos, profile, loading }) {
  // Hooks must run unconditionally, so the derived values they consume are computed first with
  // null-safe fallbacks, and the hooks sit above the early returns. When profile/repos aren't ready
  // these resolve to 0, which is harmless because the component returns before rendering them.
  const totalStars = (repos || []).reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const topLanguage = getTopLanguage(repos || []);
  const accountAge = getAccountAgeYears(profile?.created_at);

  const animatedStars = useCountUp(totalStars);
  const animatedAge = useCountUp(accountAge);

  if (loading) {
    return <StatsSkeleton />;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <StatTile label="Total Stars" value={formatStatValue(animatedStars, totalStars)} triggerValue={totalStars} index={0} />
      <StatTile label="Top Language" value={topLanguage} index={1} />
      <StatTile label="Account Age" value={`${Math.floor(animatedAge)} year${accountAge === 1 ? '' : 's'}`} triggerValue={accountAge} index={2} />
    </div>
  );
}

export default StatsBar;