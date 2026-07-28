import { useEffect, useState } from 'react';

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
  C: '#555555',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Scala: '#c22d40',
  Vue: '#41B883',
  Svelte: '#ff3e00',
  Dart: '#00B4AB',
};

function getLanguageColor(language) {
  if (!language) return '#8b949e';
  return LANGUAGE_COLORS[language] || '#58a6ff';
}

export default function RepoLanguageBar({ languagesUrl }) {
  const [languages, setLanguages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!languagesUrl) {
      setLoading(false);
      return;
    }

    const cacheKey = `repo_langs_${languagesUrl.toLowerCase()}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setLanguages(parsed);
        setLoading(false);
        return;
      } catch {
        // Fallback to fetch on parse error
      }
    }

    let isMounted = true;
    async function fetchLanguages() {
      try {
        const token = import.meta.env.VITE_GITHUB_TOKEN;
        const headers = { Accept: 'application/vnd.github+json' };
        if (token && typeof token === 'string' && token.trim() !== '') {
          headers['Authorization'] = `Bearer ${token.trim()}`;
        }

        const response = await fetch(languagesUrl, { headers });
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setLanguages(data);
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          }
        }
      } catch (err) {
        console.error('Error fetching repo languages:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLanguages();
    return () => {
      isMounted = false;
    };
  }, [languagesUrl]);

  if (loading) {
    return (
      <div className="mt-3.5 h-1.5 w-full rounded-full bg-[var(--gs-border)]/20 animate-pulse" />
    );
  }

  if (!languages || Object.keys(languages).length === 0) {
    return null;
  }

  const totalBytes = Object.values(languages).reduce((sum, val) => sum + val, 0);
  if (totalBytes === 0) {
    return null;
  }

  const languagesList = Object.entries(languages)
    .map(([lang, bytes]) => {
      const percentage = (bytes / totalBytes) * 100;
      return { lang, bytes, percentage };
    })
    .sort((a, b) => b.bytes - a.bytes);

  return (
    <div className="mt-3.5 space-y-2">
      {/* Segmented Progress Bar */}
      <div className="flex h-1.5 w-full overflow-visible rounded-full bg-[var(--gs-border)]/25">
        {languagesList.map(({ lang, percentage }) => (
          <div
            key={lang}
            className="group relative h-full transition-all duration-200 hover:scale-y-[1.4]"
            style={{
              width: `${percentage}%`,
              backgroundColor: getLanguageColor(lang),
            }}
          >
            {/* Hover Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 -translate-x-1/2 scale-95 rounded-md border border-[var(--gs-border)] bg-[var(--gs-surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--gs-text)] shadow-lg opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap">
              <span
                className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: getLanguageColor(lang) }}
              />
              <span className="text-[var(--gs-text)]">{lang}:</span>{' '}
              <span className="text-[var(--gs-accent)]">{percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Languages Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--gs-text-secondary)] font-semibold">
        {languagesList.slice(0, 4).map(({ lang, percentage }) => (
          <span key={lang} className="inline-flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: getLanguageColor(lang) }}
            />
            {lang} <span className="text-[var(--gs-text)]/90">{percentage.toFixed(1)}%</span>
          </span>
        ))}
        {languagesList.length > 4 && (
          <span className="text-[9px] italic text-[var(--gs-text-secondary)]/80">
            +{languagesList.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}
