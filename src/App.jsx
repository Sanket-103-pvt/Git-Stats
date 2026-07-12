import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowUp, LoaderCircle, MoonStar, Search, SunMedium } from 'lucide-react';
import ProfileCard from './components/ProfileCard';
import StatsBar from './components/StatsBar';
import LanguageChart from './components/LanguageChart';
import RepoCard from './components/RepoCard';

const THEME_KEY = 'gitstats-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  return storedTheme === 'light' ? 'light' : 'dark';
}

async function fetchGitHubJson(url) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (response.ok) {
    return response.json();
  }

  const error = new Error('GitHub request failed');
  error.status = response.status;
  error.body = await response.json().catch(() => null);
  throw error;
}

// Cap on repo pages fetched per search. 100 repos/page, so this covers up to
// 1000 repositories while bounding requests against GitHub's unauthenticated
// 60/hour limit for exceptionally prolific accounts.
const MAX_REPO_PAGES = 10;

function reposPageUrl(username, page) {
  return `https://api.github.com/users/${encodeURIComponent(
    username
  )}/repos?per_page=100&sort=updated&page=${page}`;
}

function formatRelativeYears(createdAt) {
  const start = new Date(createdAt).getTime();
  const years = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24 * 365.25));
  return Math.max(0, years);
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [inputValue, setInputValue] = useState('');
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedUsername, setSearchedUsername] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setInputValue('sanket1035');
    void handleSearch('sanket1035');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topRepos = useMemo(
    () => [...repos].sort((left, right) => right.stargazers_count - left.stargazers_count).slice(0, 6),
    [repos],
  );

  const hasLanguageData = useMemo(() => repos.some((repo) => repo.language), [repos]);

  async function handleSearch(submittedUsername = inputValue) {
    const username = submittedUsername.trim();
    if (!username) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);
    setProfile(null);
    setRepos([]);
    setSearchedUsername(username);

    try {
      const [profileData, firstPage] = await Promise.all([
        fetchGitHubJson(`https://api.github.com/users/${encodeURIComponent(username)}`),
        fetchGitHubJson(reposPageUrl(username, 1)),
      ]);

      if (requestIdRef.current !== requestId) {
        return;
      }

      // Paginate the repos endpoint so aggregate stats (Total Stars, Top
      // Language, language breakdown, Top Repos) are computed over ALL
      // repositories rather than only the first 100 most-recently-updated.
      // public_repos tells us exactly how many pages exist; MAX_REPO_PAGES
      // bounds the request count for very prolific users.
      let reposData = firstPage;
      const totalPages = Math.min(
        Math.ceil((profileData.public_repos || 0) / 100),
        MAX_REPO_PAGES
      );
      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            fetchGitHubJson(reposPageUrl(username, index + 2))
          )
        );

        if (requestIdRef.current !== requestId) {
          return;
        }

        reposData = firstPage.concat(remainingPages.flat());
      }

      setProfile(profileData);
      setRepos(reposData);
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      if (caughtError.status === 404) {
        setError(`User \"${username}\" not found. Check spelling.`);
      } else if (caughtError.status === 403) {
        setError('GitHub API rate limit reached. Try again in about an hour.');
      } else {
        setError('Network error. Check your connection and try again.');
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleSearch();
  }

  const showIntro = !loading && !profile && !error;
  const showRepoEmptyState = profile && !loading && topRepos.length === 0;
  const showLanguageEmptyState = profile && !loading && !hasLanguageData;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--gs-bg)] text-[var(--gs-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(88,166,255,0.18),transparent_56%)]" />
      <div className="pointer-events-none absolute right-[-6rem] top-[18rem] -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(63,185,80,0.12),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-4rem] bottom-[-10rem] -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(88,166,255,0.12),transparent_70%)] blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-[var(--gs-border)] bg-[var(--gs-bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] text-sm font-bold text-[var(--gs-accent)] shadow-sm">
              G
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[var(--gs-text)]">GitStats</div>
              <div className="text-xs text-[var(--gs-text-secondary)]">GitHub Profile Analyzer</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] text-[var(--gs-text)] transition hover:border-[var(--gs-accent)]/60 hover:text-[var(--gs-accent)]"
          >
            {theme === 'dark' ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="panel relative overflow-hidden p-5 sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(88,166,255,0.08),transparent_35%,rgba(63,185,80,0.04)_70%,transparent)]" />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--gs-accent)]">Instant profile intelligence</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--gs-text)] sm:text-4xl">
              Explore a GitHub profile without leaving the page.
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--gs-text-secondary)] sm:text-base">
              Search any public username to inspect follower counts, top repositories, language distribution, and aggregate activity.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 mx-auto mt-6 max-w-3xl">
            <label className="sr-only" htmlFor="username-search">
              GitHub username
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-4 py-3 focus-within:border-[var(--gs-accent)] focus-within:ring-2 focus-within:ring-[var(--gs-accent)]">
                <Search className="h-4.5 w-4.5 shrink-0 text-[var(--gs-text-secondary)]" />
                <input
                  id="username-search"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Enter a GitHub username"
                  autoComplete="off"
                  spellCheck="false"
                  aria-label="GitHub username"
                  className="w-full bg-transparent text-sm text-[var(--gs-text)] outline-none placeholder:text-[var(--gs-text-secondary)]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--gs-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <LoaderCircle className="h-4.5 w-4.5 animate-spin" /> : <Search className="h-4.5 w-4.5" />}
                Search
              </button>
            </div>
          </form>

          {showIntro ? (
            <div className="relative z-10 mx-auto mt-8 max-w-2xl rounded-lg border border-dashed border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-5 py-6 text-center text-sm text-[var(--gs-text-secondary)]">
              Start with a username like <span className="font-medium text-[var(--gs-text)]">sanket1035</span> to load a full profile summary.
            </div>
          ) : null}
        </section>

        {error ? (
          <section className="rounded-lg border border-[var(--gs-error)] bg-[var(--gs-surface-alt)] px-5 py-4 text-[var(--gs-text)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gs-error)]" />
              <div>
                <div className="font-semibold">Search failed</div>
                <p className="mt-1 text-sm text-[var(--gs-text-secondary)]">{error}</p>
                {searchedUsername ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">Query: {searchedUsername}</p> : null}
              </div>
            </div>
          </section>
        ) : null}

        {loading || profile ? <ProfileCard profile={profile} loading={loading} /> : null}

        {loading || profile ? <StatsBar repos={repos} profile={profile} loading={loading} /> : null}

        {loading || profile ? <LanguageChart repos={repos} loading={loading} /> : null}

        {showLanguageEmptyState && profile ? (
          <section className="panel px-5 py-4 text-sm text-[var(--gs-text-secondary)]">Language data unavailable for this account.</section>
        ) : null}

        {showRepoEmptyState ? (
          <section className="panel px-5 py-4 text-sm text-[var(--gs-text-secondary)]">No public repositories yet.</section>
        ) : null}

        {loading ? (
          <section>
            <div className="mb-3 text-sm font-medium text-[var(--gs-text-secondary)]">Top repositories</div>
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <RepoCard key={index} loading />
              ))}
            </div>
          </section>
        ) : profile && topRepos.length > 0 ? (
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--gs-text)]">Top Repositories</h2>
                <p className="mt-1 text-sm text-[var(--gs-text-secondary)]">Sorted by stars. Public repos only, with the strongest signals first.</p>
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">{topRepos.length} shown</div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {topRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </section>
        ) : null}

        {!loading && !profile && !error ? (
          <div className="flex justify-center pb-8 pt-2 text-xs uppercase tracking-[0.22em] text-[var(--gs-text-secondary)]">
            Search a username to begin.
          </div>
        ) : null}

        {profile ? (
          <div className="pb-2 text-right text-[11px] uppercase tracking-[0.2em] text-[var(--gs-text-secondary)]">
            Account age: {formatRelativeYears(profile.created_at)} years
          </div>
        ) : null}
      </main>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] text-[var(--gs-text)] shadow-md transition-all duration-300 hover:scale-110 hover:border-[var(--gs-accent)]/60 hover:text-[var(--gs-accent)] ${
          showBackToTop ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <ArrowUp className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}

export default App;