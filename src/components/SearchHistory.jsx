import { X } from 'lucide-react';

export default function SearchHistory({
  searchHistory,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
}) {
  if (!searchHistory || searchHistory.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-1 text-xs animate-fade-in">
      <span className="text-[var(--gs-text-secondary)] font-medium">Recent:</span>
      <div className="flex flex-wrap items-center gap-2">
        {searchHistory.map((username) => (
          <div
            key={username}
            className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--gs-border)] bg-[var(--gs-surface)] pl-1.5 pr-2 py-0.5 transition hover:border-[var(--gs-accent)]/55 hover:bg-[var(--gs-surface-alt)] animate-fade-in"
          >
            <button
              type="button"
              onClick={() => onSelectHistory(username)}
              className="inline-flex items-center gap-1 font-semibold text-[var(--gs-text)] outline-none hover:text-[var(--gs-accent)]"
            >
              <img
                src={`https://github.com/${username}.png`}
                alt={`${username}'s avatar`}
                onError={(e) => {
                  e.target.src = `https://avatars.githubusercontent.com/${username}`;
                }}
                className="h-4.5 w-4.5 rounded-full object-cover"
              />
              <span>{username}</span>
            </button>
            <button
              type="button"
              onClick={() => onRemoveHistory(username)}
              aria-label={`Remove ${username} from history`}
              className="rounded-full p-0.5 text-[var(--gs-text-secondary)] hover:bg-[var(--gs-border)] hover:text-[var(--gs-error)] transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onClearHistory}
          className="text-[var(--gs-text-secondary)] hover:text-[var(--gs-error)] transition-colors ml-1 font-semibold"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
