export default function RepoFilters({
  languages,
  filterLanguage,
  setFilterLanguage,
  sortBy,
  setSortBy,
  filteredCount,
  totalCount,
}) {
  const hasActiveFilters = filterLanguage !== '' || sortBy !== 'stars';

  const handleClear = () => {
    setFilterLanguage('');
    setSortBy('stars');
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] p-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
      {/* Dropdowns */}
      <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:w-auto">
        {/* Language Filter */}
        <div className="flex flex-col gap-1.5 w-full sm:w-48">
          <label htmlFor="lang-filter" className="text-xs font-semibold text-[var(--gs-text-secondary)]">
            Language
          </label>
          <select
            id="lang-filter"
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="w-full rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-3 py-2 text-sm text-[var(--gs-text)] outline-none focus:border-[var(--gs-accent)] focus:ring-1 focus:ring-[var(--gs-accent)]"
          >
            <option value="">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="flex flex-col gap-1.5 w-full sm:w-48">
          <label htmlFor="sort-select" className="text-xs font-semibold text-[var(--gs-text-secondary)]">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-3 py-2 text-sm text-[var(--gs-text)] outline-none focus:border-[var(--gs-accent)] focus:ring-1 focus:ring-[var(--gs-accent)]"
          >
            <option value="stars">Stars</option>
            <option value="forks">Forks</option>
            <option value="updated">Recently Updated</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Stats Counter & Clear Controls */}
      <div className="flex items-center justify-between gap-4 mt-1 sm:mt-0 sm:flex-col sm:items-end">
        <span className="text-sm font-medium text-[var(--gs-text-secondary)]">
          Showing <strong className="text-[var(--gs-text)]">{filteredCount}</strong> of{' '}
          <strong className="text-[var(--gs-text)]">{totalCount}</strong> repos
        </span>
        
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-[var(--gs-accent)] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
