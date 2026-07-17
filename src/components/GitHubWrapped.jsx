import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Link, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import useWrappedStats from '../hooks/useWrappedStats';

export default function GitHubWrapped({ profile, repos, eventTimestamps, onCopyShareLink }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const stats = useWrappedStats(profile, repos, eventTimestamps);
  const slideTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      startAutoAdvance();
    } else {
      stopAutoAdvance();
    }
    return () => stopAutoAdvance();
    // Auto-advance is driven by open/closed state only; startAutoAdvance/stopAutoAdvance are stable
    // helpers defined below, intentionally excluded to keep this effect keyed on isOpen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startAutoAdvance = () => {
    stopAutoAdvance();
    slideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev < 5) {
          return prev + 1;
        }
        stopAutoAdvance();
        return prev;
      });
    }, 2800);
  };

  const stopAutoAdvance = () => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
      slideTimerRef.current = null;
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    stopAutoAdvance();
    if (currentSlide < 5) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    stopAutoAdvance();
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleDotClick = (idx, e) => {
    e.stopPropagation();
    stopAutoAdvance();
    setCurrentSlide(idx);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const summaryCard = document.getElementById('wrapped-summary-card');
    if (!summaryCard) return;

    html2canvas(summaryCard, {
      backgroundColor: null,
      useCORS: true,
      scale: 3,
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `wrapped-${profile.login}-2026.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  if (!stats) return null;

  const slides = [
    // Slide 1: Welcome
    {
      bg: 'from-indigo-600 via-purple-600 to-pink-500',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in px-6">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">GitStats Wrapped</div>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Your Year<br />on GitHub
          </h2>
          <div className="relative mt-2">
            <img
              src={profile.avatar_url}
              alt={profile.login}
              className="h-28 w-28 rounded-full border-4 border-white/30 object-cover shadow-2xl"
            />
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow">
              🚀
            </div>
          </div>
          <div className="text-xl font-bold text-white">@{profile.login}</div>
          <p className="text-xs text-white/70 max-w-xs">
            Let's dive into your coding journey and reveal your unique developer insights.
          </p>
        </div>
      ),
    },
    // Slide 2: Language
    {
      bg: 'from-emerald-500 via-teal-600 to-cyan-500',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in px-6">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/85">Language Spotlight</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Your #1 Language
          </h2>
          <div className="my-4 flex h-32 w-32 items-center justify-center rounded-full bg-white/10 border border-white/20 text-6xl shadow-inner">
            🌐
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {stats.mostUsedLanguage}
          </div>
          <p className="text-sm text-white/80 max-w-xs leading-relaxed">
            You pushed the most updates to repos powered by this language. Truly a master of your craft!
          </p>
        </div>
      ),
    },
    // Slide 3: Repo
    {
      bg: 'from-amber-500 via-orange-600 to-rose-500',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in px-6">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/85">Top Creation</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Most Starred Repo
          </h2>
          <div className="my-2 text-6xl">⭐</div>
          {stats.mostStarredRepo ? (
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-black text-white max-w-md truncate">
                {stats.mostStarredRepo.name}
              </div>
              <div className="text-lg font-bold text-white/90">
                {stats.mostStarredRepo.stargazers_count} Star{stats.mostStarredRepo.stargazers_count === 1 ? '' : 's'}
              </div>
            </div>
          ) : (
            <div className="text-xl font-bold text-white">No starred repos yet</div>
          )}
          <p className="text-xs text-white/75 max-w-xs">
            The community appreciated this work the most. An excellent contribution!
          </p>
        </div>
      ),
    },
    // Slide 4: Peak Month
    {
      bg: 'from-blue-600 via-indigo-600 to-violet-600',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in px-6">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/85">Peak Momentum</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Most Active Month
          </h2>
          <div className="my-4 flex h-32 w-32 items-center justify-center rounded-full bg-white/10 border border-white/20 text-6xl shadow-inner">
            📅
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {stats.peakActivityMonth}
          </div>
          <p className="text-sm text-white/80 max-w-xs leading-relaxed">
            During this month, your commit frequencies and project participation hit their highest gears.
          </p>
        </div>
      ),
    },
    // Slide 5: Personality
    {
      bg: 'from-fuchsia-600 via-pink-600 to-rose-600',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in px-6">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/85">Coding Rhythm</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Developer Persona
          </h2>
          <div className="my-4 flex h-32 w-32 items-center justify-center rounded-full bg-white/10 border border-white/20 text-6xl shadow-inner">
            💡
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {stats.coderPersonality}
          </div>
          <p className="text-sm text-white/80 max-w-xs leading-relaxed">
            Calculated from your peak activity hour logs over the past 90 days.
          </p>
        </div>
      ),
    },
    // Slide 6: Summary & Export
    {
      bg: 'from-gray-950 via-slate-900 to-zinc-950',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-5 animate-fade-in px-6 w-full max-w-md">
          {/* Card target for html2canvas */}
          <div
            id="wrapped-summary-card"
            className="w-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-zinc-950 p-6 text-left shadow-2xl relative overflow-hidden"
            style={{ minHeight: '430px' }}
          >
            {/* Visual background details for exporting */}
            <div className="absolute right-[-4rem] top-[-4rem] -z-10 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />
            <div className="absolute left-[-2rem] bottom-[-2rem] -z-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <img
                src={profile.avatar_url}
                alt={profile.login}
                className="h-14 w-14 rounded-full border-2 border-purple-500/40 object-cover"
              />
              <div>
                <div className="text-md font-bold text-white">@{profile.login}</div>
                <div className="text-xs text-purple-400 font-semibold tracking-wider uppercase">My GitStats Wrapped</div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">#1 Programming Language</div>
                <div className="text-lg font-extrabold text-white mt-0.5">{stats.mostUsedLanguage}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Top Creation</div>
                <div className="text-lg font-extrabold text-white mt-0.5 truncate">
                  {stats.mostStarredRepo ? stats.mostStarredRepo.name : 'N/A'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Peak Month</div>
                  <div className="text-md font-extrabold text-white mt-0.5">{stats.peakActivityMonth}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Longest Streak</div>
                  <div className="text-md font-extrabold text-white mt-0.5">{stats.longestStreak} days</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Developer Persona</div>
                <div className="text-md font-extrabold text-purple-400 mt-0.5">{stats.coderPersonality}</div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
              <span>git-stats-103.vercel.app</span>
              <span>2026 Edition</span>
            </div>
          </div>

          {/* Export Action Controls */}
          <div className="flex gap-3 w-full mt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-wider rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-md"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyShareLink();
              }}
              className="flex items-center justify-center gap-2 h-11 px-4 text-xs font-bold uppercase tracking-wider rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              <Link className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg border border-[var(--gs-accent)]/20 bg-[var(--gs-accent)]/5 text-[var(--gs-accent)] hover:bg-[var(--gs-accent)]/10 transition animate-fade-in"
      >
        <Sparkles className="h-4.5 w-4.5" />
        <span>Wrapped 🎁</span>
      </button>

      {isOpen && createPortal(
        <div
          onClick={() => {
            if (currentSlide < 5) {
              setCurrentSlide(currentSlide + 1);
            }
          }}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-start sm:justify-center overflow-y-auto bg-gradient-to-br ${slides[currentSlide].bg} transition-colors duration-700 select-none cursor-pointer py-16 px-4`}
        >
          <div className="absolute top-6 inset-x-6 flex items-center justify-between text-white z-50">
            <div className="flex-1 flex gap-1.5 mr-6">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  onClick={(e) => handleDotClick(idx, e)}
                  className="h-1 flex-1 rounded-full overflow-hidden bg-white/20 cursor-pointer"
                >
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{
                      width: idx < currentSlide ? '100%' : idx === currentSlide ? '60%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="rounded-full p-1.5 bg-black/10 hover:bg-black/25 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute inset-x-4 flex justify-between items-center pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`pointer-events-auto h-12 w-12 flex items-center justify-center rounded-full bg-black/15 text-white/80 hover:text-white transition-opacity border border-white/10 ${
                currentSlide === 0 ? 'opacity-0 cursor-default' : 'opacity-100'
              }`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentSlide === 5}
              className={`pointer-events-auto h-12 w-12 flex items-center justify-center rounded-full bg-black/15 text-white/80 hover:text-white transition-opacity border border-white/10 ${
                currentSlide === 5 ? 'opacity-0 cursor-default' : 'opacity-100'
              }`}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="w-full flex justify-center py-12">
            {slides[currentSlide].content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
