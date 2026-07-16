import { GitFork, Star } from 'lucide-react';

function RepoSkeleton({ index = 0 }) {
  return (
    <div
      style={{ animationDelay: `${index * 0.05}s` }}
      className="panel p-5 animate-pulse animate-fade-in-up opacity-0"
    >
      <div className="h-5 w-2/3 rounded bg-[var(--gs-surface-alt)]" />
      <div className="mt-4 h-4 w-full rounded bg-[var(--gs-surface-alt)]" />
      <div className="mt-2 h-4 w-5/6 rounded bg-[var(--gs-surface-alt)]" />
      <div className="mt-6 flex items-center justify-between">
        <div className="h-4 w-20 rounded bg-[var(--gs-surface-alt)]" />
        <div className="h-6 w-24 rounded-full bg-[var(--gs-surface-alt)]" />
      </div>
    </div>
  );
}

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Shell: '#89e051',
};

function getLanguageColor(language) {
  if (!language) return '#8b949e'; // Fallback grey for Unknown
  return LANGUAGE_COLORS[language] || '#58a6ff'; // Default accent blue
}

function RepoCard({ repo, loading, index = 0 }) {
  if (loading) {
    return <RepoSkeleton index={index} />;
  }

  if (!repo) {
    return null;
  }

  return (
    <article
      style={{ animationDelay: `${index * 0.05}s` }}
      className="panel p-5 transition-all duration-200 hover:border-[var(--gs-accent)]/60 hover:bg-[var(--gs-surface-alt)] hover:-translate-y-[2px] hover:shadow-md animate-fade-in-up opacity-0"
    >
      <div className="flex items-start justify-between gap-4">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[var(--gs-accent)] transition hover:brightness-110"
        >
          {repo.name}
        </a>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--gs-text)]">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: getLanguageColor(repo.language) }}
          />
          {repo.language || 'Unknown'}
        </span>
      </div>

      <p className="mt-3 min-h-[3rem] text-sm leading-6 text-[var(--gs-text-secondary)] line-clamp-3">
        {repo.description || 'No description provided.'}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--gs-border)] pt-4 text-sm text-[var(--gs-text-secondary)]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 text-[var(--gs-warning)]" />
            {repo.stargazers_count.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitFork className="h-4 w-4 text-[var(--gs-success)]" />
            {repo.forks_count.toLocaleString()}
          </span>
        </div>
        {repo.fork ? <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">Fork</span> : null}
      </div>
    </article>
  );
}

export default RepoCard;