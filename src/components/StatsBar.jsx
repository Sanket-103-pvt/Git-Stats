function StatsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-3" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          style={{ animationDelay: `${index * 0.05}s` }}
          className="h-16 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] animate-pulse animate-fade-in opacity-0"
        />
      ))}
    </div>
  );
}

function StatTile({ label, value, index = 0 }) {
  return (
    <div
      style={{ animationDelay: `${index * 0.05}s` }}
      className="rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] px-4 py-3 animate-fade-in opacity-0"
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">{label}</div>
      <div
        key={value}
        className="mt-2 text-lg font-semibold text-[var(--gs-text)] inline-block animate-count-pulse"
      >
        {value}
      </div>
    </div>
  );
}

function getAccountAge(createdAt) {
  if (!createdAt) {
    return 0;
  }

  const started = new Date(createdAt).getTime();
  const years = (Date.now() - started) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.floor(years));
}

function getLanguageSummary(repos) {
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
      <StatTile label="Total Stars" value={totalStars.toLocaleString()} index={0} />
      <StatTile label="Top Language" value={topLanguage} index={1} />
      <StatTile label="Account Age" value={`${accountAge} year${accountAge === 1 ? '' : 's'}`} index={2} />
    </div>
  );
}

export default StatsBar;