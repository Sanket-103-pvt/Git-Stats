import { GitFork, Star } from 'lucide-react';

function RepoSkeleton() {
  return (
    <div className="panel p-5 animate-pulse">
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

function RepoCard({ repo, loading }) {
  if (loading) {
    return <RepoSkeleton />;
  }

  if (!repo) {
    return null;
  }

  return (
    <article className="panel p-5 transition duration-200 hover:border-[var(--gs-accent)]/60 hover:bg-[var(--gs-surface-alt)]">
      <div className="flex items-start justify-between gap-4">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[var(--gs-accent)] transition hover:brightness-110"
        >
          {repo.name}
        </a>
        {repo.language ? (
          <span className="shrink-0 rounded-full border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--gs-text)]">
            {repo.language}
          </span>
        ) : null}
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