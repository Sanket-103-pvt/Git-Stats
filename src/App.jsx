import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowUp, GitCompare, LoaderCircle, MoonStar, Search, Share2, SunMedium } from 'lucide-react';
import ProfileCard from './components/ProfileCard';
import StatsBar from './components/StatsBar';
import LanguageChart from './components/LanguageChart';
import RepoCard from './components/RepoCard';
import CompareView from './components/CompareView';
import RepoFilters from './components/RepoFilters';
import AchievementBadges from './components/AchievementBadges';
import ActivityInsights from './components/ActivityInsights';
import GitHubWrapped from './components/GitHubWrapped';
import ContributionHeatmap from './components/ContributionHeatmap';
import SearchHistory from './components/SearchHistory';
import { getAccountAgeYears } from './lib/repoStats';

const THEME_KEY = 'gitstats-theme';
const HISTORY_KEY = 'gitstats-history';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  return storedTheme === 'light' ? 'light' : 'dark';
}

// A request that never resolves — a stalled network, say — would otherwise leave the loading
// spinner up forever with no way to recover but a page reload. AbortController with a timeout turns
// that into a normal, recoverable error.
const REQUEST_TIMEOUT_MS = 12000;

async function fetchGitHubJson(url) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      signal: controller.signal,
    });
  } catch (fetchError) {
    // AbortController surfaces the timeout as an AbortError; anything else is a genuine network
    // failure. Flag the timeout so the caller can show a message that tells the user to retry.
    if (fetchError.name === 'AbortError') {
      const timeoutError = new Error('GitHub request timed out');
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw fetchError;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.ok) {
    return response.json();
  }

  const error = new Error('GitHub request failed');
  error.status = response.status;
  error.body = await response.json().catch(() => null);
  // GitHub reports rate-limit state in headers. Capture them so the caller can tell a real rate
  // limit (remaining === 0) from other 403s, and can show the actual reset time instead of a guess.
  error.rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
  error.rateLimitReset = response.headers.get('x-ratelimit-reset');
  error.retryAfter = response.headers.get('retry-after');
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

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [inputValue, setInputValue] = useState('');
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedUsername, setSearchedUsername] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isThemeSpinning, setIsThemeSpinning] = useState(false);

  // Comparison Mode States
  const [compareMode, setCompareMode] = useState(false);
  const [inputValue2, setInputValue2] = useState('');
  const [profile2, setProfile2] = useState(null);
  const [repos2, setRepos2] = useState([]);
  const [loading2, setLoading2] = useState(false);
  const [error2, setError2] = useState(null);
  const [searchedUsername2, setSearchedUsername2] = useState('');

  // activityMap: { 'YYYY-MM-DD': eventCount } built from the public Events API.
  // Note: GitHub's Events API only returns the last ~90 days of activity (up to
  // 300 events across 3 pages). This is an approximation — not the full
  // contribution graph which requires the authenticated GraphQL API.
  const [activityMap, setActivityMap] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventTimestamps, setEventTimestamps] = useState([]);

  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const requestIdRef = useRef(0);

  useEffect(() => {
    // Parse URL parameter on initial mount
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      setInputValue(userParam);
      handleSearch(userParam, '', false);
    }

    // Listen to popstate event for back/forward navigation
    function handlePopState() {
      const currentParams = new URLSearchParams(window.location.search);
      const currentUser = currentParams.get('user');
      if (currentUser) {
        setInputValue(currentUser);
        handleSearch(currentUser, '', false);
      } else {
        setInputValue('');
        setProfile(null);
        setRepos([]);
        setSearchedUsername('');
        setActivityMap(null);
        setError(null);
        document.title = 'GitStats';
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [filterLanguage, setFilterLanguage] = useState('');
  const [sortBy, setSortBy] = useState('stars');
  const [isGridFading, setIsGridFading] = useState(false);
  const [displayRepos, setDisplayRepos] = useState([]);


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

  const languages = useMemo(() => {
    const langs = new Set();
    repos.forEach((repo) => {
      if (repo.language) {
        langs.add(repo.language);
      }
    });
    return Array.from(langs).sort();
  }, [repos]);

  const filteredRepos = useMemo(() => {
    let result = [...repos];

    if (filterLanguage) {
      result = result.filter((repo) => repo.language === filterLanguage);
    }

    if (sortBy === 'stars') {
      result.sort((left, right) => right.stargazers_count - left.stargazers_count);
    } else if (sortBy === 'forks') {
      result.sort((left, right) => right.forks_count - left.forks_count);
    } else if (sortBy === 'updated') {
      result.sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
    } else if (sortBy === 'name') {
      result.sort((left, right) => left.name.localeCompare(right.name));
    }

    return result;
  }, [repos, filterLanguage, sortBy]);

  useEffect(() => {
    setIsGridFading(true);
    const timer = setTimeout(() => {
      setDisplayRepos(filteredRepos);
      setIsGridFading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [filteredRepos]);

  const hasLanguageData = useMemo(() => repos.some((repo) => repo.language), [repos]);

  async function fetchUserData(username) {
    const [profileData, firstPage] = await Promise.all([
      fetchGitHubJson(`https://api.github.com/users/${encodeURIComponent(username)}`),
      fetchGitHubJson(reposPageUrl(username, 1)),
    ]);

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
      reposData = firstPage.concat(remainingPages.flat());
    }

    return { profile: profileData, repos: reposData };
  }

  const saveToHistory = (username) => {
    if (!username) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((name) => name.toLowerCase() !== username.toLowerCase());
      const updated = [username, ...filtered].slice(0, 5);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save search history', err);
      }
      return updated;
    });
  };

  // Turns an x-ratelimit-reset (Unix seconds) or Retry-After (seconds) into a short human phrase.
  function formatRetryHint(caughtError) {
    const retryAfter = caughtError.retryAfter;
    const reset = caughtError.rateLimitReset;

    let msUntilRetry = null;
    if (retryAfter && !Number.isNaN(Number(retryAfter))) {
      msUntilRetry = Number(retryAfter) * 1000;
    } else if (reset && !Number.isNaN(Number(reset))) {
      msUntilRetry = Number(reset) * 1000 - Date.now();
    }

    if (msUntilRetry === null || msUntilRetry <= 0) {
      return 'Try again shortly.';
    }

    const minutes = Math.ceil(msUntilRetry / 60000);
    if (minutes < 60) {
      return `Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`;
    }
    const hours = Math.ceil(minutes / 60);
    return `Try again in about ${hours} hour${hours === 1 ? '' : 's'}.`;
  }

  function getErrorMessage(caughtError, username) {
    if (caughtError.isTimeout) {
      return 'Request timed out. Check your connection and try again.';
    }
    if (caughtError.status === 404) {
      return `User "${username}" not found. Check spelling.`;
    }
    if (caughtError.status === 403) {
      // 403 covers more than rate limiting. A real rate limit reports remaining === "0"; other 403s
      // (secondary limits, blocked requests) shouldn't claim the primary limit was hit.
      if (caughtError.rateLimitRemaining === '0') {
        return `GitHub API rate limit reached. ${formatRetryHint(caughtError)}`;
      }
      if (caughtError.retryAfter) {
        return `GitHub temporarily blocked this request (secondary rate limit). ${formatRetryHint(caughtError)}`;
      }
      return 'GitHub denied this request (403). If this persists, add a VITE_GITHUB_TOKEN to raise the rate limit.';
    }
    return 'Network error. Check your connection and try again.';
  }

  async function handleSearch(
    submittedUsername = inputValue,
    submittedUsername2 = inputValue2,
    isCompare = compareMode
  ) {
    const username = submittedUsername.trim();
    const username2 = submittedUsername2.trim();

    if (!username) {
      return;
    }
    if (isCompare && !username2) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);
    setProfile(null);
    setRepos([]);
    setSearchedUsername(username);
    setActivityMap(null);
    setEventTimestamps([]);
    setEventsLoading(true);
    setFilterLanguage('');
    setSortBy('stars');
    document.title = 'GitStats';

    if (isCompare) {
      setLoading2(true);
      setError2(null);
      setProfile2(null);
      setRepos2([]);
      setSearchedUsername2(username2);
    }

    try {
      if (isCompare) {
        const [res1, res2] = await Promise.allSettled([
          fetchUserData(username),
          fetchUserData(username2),
        ]);

        if (requestIdRef.current !== requestId) {
          return;
        }

        if (res1.status === 'fulfilled') {
          setProfile(res1.value.profile);
          setRepos(res1.value.repos);
          saveToHistory(res1.value.profile.login);
        } else {
          setError(getErrorMessage(res1.reason, username));
        }

        if (res2.status === 'fulfilled') {
          setProfile2(res2.value.profile);
          setRepos2(res2.value.repos);
          saveToHistory(res2.value.profile.login);
        } else {
          setError2(getErrorMessage(res2.reason, username2));
        }
      } else {
        const res = await fetchUserData(username);
        if (requestIdRef.current !== requestId) {
          return;
        }
        setProfile(res.profile);
        setRepos(res.repos);
        saveToHistory(res.profile.login);

        // Update URL and Title
        const url = new URL(window.location.href);
        url.searchParams.set('user', res.profile.login);
        window.history.pushState({ user: res.profile.login }, '', url.toString());
        document.title = `${res.profile.login} — GitStats`;

        // Fetch public events for the heatmap (up to 3 pages × 100 = 300 events).
        // Events are limited to roughly the last 90 days by GitHub's API.
        try {
          const eventPages = await Promise.all([
            fetchGitHubJson(`https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=100&page=1`),
            fetchGitHubJson(`https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=100&page=2`),
            fetchGitHubJson(`https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=100&page=3`),
          ]);

          if (requestIdRef.current !== requestId) return;

          const allEvents = eventPages.flat();
          const map = {};
          const timestamps = [];
          for (const evt of allEvents) {
            if (!evt.created_at) continue;
            timestamps.push(evt.created_at);
            // Convert the UTC timestamp to a local YYYY-MM-DD key.
            const localDate = new Date(evt.created_at);
            const y = localDate.getFullYear();
            const m = String(localDate.getMonth() + 1).padStart(2, '0');
            const d = String(localDate.getDate()).padStart(2, '0');
            const key = `${y}-${m}-${d}`;
            map[key] = (map[key] || 0) + 1;
          }
          setActivityMap(map);
          setEventTimestamps(timestamps);
        } catch {
          // Events API failing should not break the rest of the profile view.
          setActivityMap({});
        } finally {
          setEventsLoading(false);
        }
      }
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setError(getErrorMessage(caughtError, username));

      // Remove URL parameter on error
      const url = new URL(window.location.href);
      url.searchParams.delete('user');
      window.history.pushState({}, '', url.toString());
      document.title = 'GitStats';
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
        setLoading2(false);
      }
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleSearch();
  }

  const handleSelectHistory = (username) => {
    setCompareMode(false);
    setInputValue(username);
    handleSearch(username, '', false);
  };

  const handleRemoveHistory = (username) => {
    setSearchHistory((prev) => {
      const updated = prev.filter((name) => name !== username);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to remove history item', err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch (err) {
      console.error('Failed to clear search history', err);
    }
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        setToastMessage('Failed to copy link.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      });
  };

  const showIntro = !loading && !profile && !error && (!compareMode || (!loading2 && !profile2 && !error2));
  const showRepoEmptyState = profile && !loading && repos.length === 0;
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCompareMode(!compareMode);
                setProfile(null);
                setRepos([]);
                setProfile2(null);
                setRepos2([]);
                setError(null);
                setError2(null);

                // Reset URL and Title
                const url = new URL(window.location.href);
                url.searchParams.delete('user');
                window.history.pushState({}, '', url.toString());
                document.title = 'GitStats';
              }}
              className={`inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg border transition ${
                compareMode
                  ? 'border-[var(--gs-accent)] bg-[var(--gs-accent)]/10 text-[var(--gs-accent)]'
                  : 'border-[var(--gs-border)] bg-[var(--gs-surface)] text-[var(--gs-text)] hover:border-[var(--gs-accent)]/60 hover:text-[var(--gs-accent)]'
              }`}
            >
              <GitCompare className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">Compare</span>
            </button>

            {profile && !compareMode && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] text-[var(--gs-text)] hover:border-[var(--gs-accent)]/60 hover:text-[var(--gs-accent)] transition animate-fade-in"
                >
                  <Share2 className="h-4.5 w-4.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <GitHubWrapped
                  profile={profile}
                  repos={repos}
                  eventTimestamps={eventTimestamps}
                  onCopyShareLink={handleShareLink}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
                setIsThemeSpinning(true);
              }}
              onAnimationEnd={() => setIsThemeSpinning(false)}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] text-[var(--gs-text)] transition hover:border-[var(--gs-accent)]/60 hover:text-[var(--gs-accent)] ${
                isThemeSpinning ? 'animate-spin-once' : ''
              }`}
            >
              {theme === 'dark' ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
            </button>
          </div>
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
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-4 py-3 focus-within:border-[var(--gs-accent)] focus-within:ring-2 focus-within:ring-[var(--gs-accent)]">
                  <Search className="h-4.5 w-4.5 shrink-0 text-[var(--gs-text-secondary)]" />
                  <input
                    id="username-search"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder={compareMode ? "First GitHub username" : "Enter a GitHub username"}
                    autoComplete="off"
                    spellCheck="false"
                    aria-label="First GitHub username"
                    className="w-full bg-transparent text-sm text-[var(--gs-text)] outline-none placeholder:text-[var(--gs-text-secondary)]"
                  />
                </div>

                {compareMode && (
                  <div className="flex flex-1 items-center gap-3 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-4 py-3 focus-within:border-[var(--gs-accent)] focus-within:ring-2 focus-within:ring-[var(--gs-accent)]">
                    <Search className="h-4.5 w-4.5 shrink-0 text-[var(--gs-text-secondary)]" />
                    <input
                      id="username-search-2"
                      value={inputValue2}
                      onChange={(event) => setInputValue2(event.target.value)}
                      placeholder="Second GitHub username"
                      autoComplete="off"
                      spellCheck="false"
                      aria-label="Second GitHub username"
                      className="w-full bg-transparent text-sm text-[var(--gs-text)] outline-none placeholder:text-[var(--gs-text-secondary)]"
                    />
                  </div>
                )}
              </div>

              <SearchHistory
                searchHistory={searchHistory}
                onSelectHistory={handleSelectHistory}
                onRemoveHistory={handleRemoveHistory}
                onClearHistory={handleClearHistory}
              />

              <button
                type="submit"
                disabled={loading || (compareMode && loading2)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--gs-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading || loading2 ? <LoaderCircle className="h-4.5 w-4.5 animate-spin" /> : <Search className="h-4.5 w-4.5" />}
                {compareMode ? 'Compare Profiles' : 'Search'}
              </button>
            </div>
          </form>

          {showIntro ? (
            <div className="relative z-10 mx-auto mt-8 max-w-2xl rounded-lg border border-dashed border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-5 py-6 text-center text-sm text-[var(--gs-text-secondary)]">
              {compareMode ? (
                <span>
                  Start by entering two usernames like <span className="font-medium text-[var(--gs-text)]">sanket1035</span> and <span className="font-medium text-[var(--gs-text)]">torvalds</span> to compare.
                </span>
              ) : (
                <span>
                  Start with a username like <span className="font-medium text-[var(--gs-text)]">sanket1035</span> to load a full profile summary.
                </span>
              )}
            </div>
          ) : null}
        </section>

        {error ? (
          <section className="rounded-lg border border-[var(--gs-error)] bg-[var(--gs-surface-alt)] px-5 py-4 text-[var(--gs-text)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gs-error)]" />
              <div>
                <div className="font-semibold">Search failed {compareMode && '(User 1)'}</div>
                <p className="mt-1 text-sm text-[var(--gs-text-secondary)]">{error}</p>
                {searchedUsername ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">Query: {searchedUsername}</p> : null}
              </div>
            </div>
          </section>
        ) : null}

        {compareMode && error2 ? (
          <section className="rounded-lg border border-[var(--gs-error)] bg-[var(--gs-surface-alt)] px-5 py-4 text-[var(--gs-text)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gs-error)]" />
              <div>
                <div className="font-semibold">Search failed (User 2)</div>
                <p className="mt-1 text-sm text-[var(--gs-text-secondary)]">{error2}</p>
                {searchedUsername2 ? <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--gs-text-secondary)]">Query: {searchedUsername2}</p> : null}
              </div>
            </div>
          </section>
        ) : null}

        {compareMode ? (
          (loading || loading2 || profile || profile2) ? (
            <CompareView
              profile1={profile}
              repos1={repos}
              loading1={loading}
              profile2={profile2}
              repos2={repos2}
              loading2={loading2}
            />
          ) : null
        ) : (
          <>
            {loading || profile ? <ProfileCard profile={profile} loading={loading} /> : null}

            {loading || profile ? <StatsBar repos={repos} profile={profile} loading={loading} /> : null}

            {loading || profile ? <AchievementBadges repos={repos} profile={profile} loading={loading} /> : null}

            {/* Contribution heatmap — shown only in single-profile mode */}
            {loading || profile ? (
              <ContributionHeatmap
                activityMap={activityMap}
                loading={eventsLoading || loading}
                username={searchedUsername}
              />
            ) : null}

            {loading || profile ? <LanguageChart repos={repos} loading={loading} /> : null}

            {loading || profile ? (
              <ActivityInsights
                eventTimestamps={eventTimestamps}
                loading={eventsLoading || loading}
              />
            ) : null}

            {showLanguageEmptyState && profile ? (
              <section className="panel px-5 py-4 text-sm text-[var(--gs-text-secondary)]">Language data unavailable for this account.</section>
            ) : null}

            {showRepoEmptyState ? (
              <section className="panel px-5 py-4 text-sm text-[var(--gs-text-secondary)]">No public repositories yet.</section>
            ) : null}

            {loading ? (
              <section>
                <div className="mb-3 text-sm font-medium text-[var(--gs-text-secondary)]">Repositories</div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <RepoCard key={index} index={index} loading />
                  ))}
                </div>
              </section>
            ) : profile && repos.length > 0 ? (
              <section className="flex flex-col gap-4 animate-fade-in-up">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--gs-text)]">Repositories</h2>
                    <p className="mt-1 text-sm text-[var(--gs-text-secondary)]">Public repositories for this account.</p>
                  </div>
                </div>

                <RepoFilters
                  languages={languages}
                  filterLanguage={filterLanguage}
                  setFilterLanguage={setFilterLanguage}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  filteredCount={filteredRepos.length}
                  totalCount={repos.length}
                />

                {displayRepos.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--gs-border)] bg-[var(--gs-surface-alt)] p-8 text-center text-sm text-[var(--gs-text-secondary)]">
                    No repositories match the selected language filter.
                  </div>
                ) : (
                  <div className={`grid gap-4 lg:grid-cols-2 transition-opacity duration-150 ${isGridFading ? 'opacity-0' : 'opacity-100'}`}>
                    {displayRepos.map((repo, index) => (
                      <RepoCard key={repo.id} repo={repo} index={index} />
                    ))}
                  </div>
                )}
              </section>
            ) : null}
          </>
        )}

        {!loading && !profile && !error && (!compareMode || (!loading2 && !profile2 && !error2)) ? (
          <div className="flex justify-center pb-8 pt-2 text-xs uppercase tracking-[0.22em] text-[var(--gs-text-secondary)]">
            {compareMode ? 'Search two usernames to begin comparison.' : 'Search a username to begin.'}
          </div>
        ) : null}

        {profile && !compareMode ? (
          <div className="pb-2 text-right text-[11px] uppercase tracking-[0.2em] text-[var(--gs-text-secondary)]">
            Account age: {getAccountAgeYears(profile.created_at)} years
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

      {/* Reusable Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--gs-text)] shadow-lg animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;