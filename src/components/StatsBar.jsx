function StatsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-3" aria-busy="true">
      <div className="h-16 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] animate-pulse" />
      <div className="h-16 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] animate-pulse" />
      <div className="h-16 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] animate-pulse" />
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">{label}</div>
      <div className="mt-2 text-lg font-semibold text-[var(--gs-text)]">{value}</div>
    </div>
  );
}

export function getAccountAge(createdAt) {
  if (!createdAt) {
    return 0;
  }

  const started = new Date(createdAt).getTime();
  const years = (Date.now() - started) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.floor(years));
}

export function getLanguageSummary(repos) {
  const counts = repos.reduce((accumulator, repo) => {
    if (repo.language) {
      accumulator[repo.language] = (accumulator[repo.language] || 0) + 1;
    }
    return accumulator;
  }, {});

  const topLanguage = Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] || 'N/A';
  return topLanguage;
}

function StatsBar({ repos, profile, loading }) {
  if (loading) {
    return <StatsSkeleton />;
  }

  if (!profile) {
    return null;
  }

  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const topLanguage = getLanguageSummary(repos);
  const accountAge = getAccountAge(profile.created_at);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <StatTile label="Total Stars" value={totalStars.toLocaleString()} />
      <StatTile label="Top Language" value={topLanguage} />
      <StatTile label="Account Age" value={`${accountAge} year${accountAge === 1 ? '' : 's'}`} />
    </div>
  );
}

export default StatsBar;