import { Lock } from 'lucide-react';
import { getAccountAge } from './StatsBar';

function AchievementsSkeleton() {
  return (
    <section className="panel p-5 sm:p-6" aria-busy="true">
      <div className="mb-4 space-y-2">
        <div className="h-5 w-40 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
        <div className="h-4 w-64 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="h-20 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] animate-pulse animate-fade-in opacity-0"
          />
        ))}
      </div>
    </section>
  );
}

export default function AchievementBadges({ profile, repos, loading }) {
  if (loading) {
    return <AchievementsSkeleton />;
  }

  if (!profile || !repos) return null;

  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const uniqueLanguages = new Set(repos.map((repo) => repo.language).filter(Boolean)).size;
  const accountAge = getAccountAge(profile.created_at);
  const forkedRepos = repos.filter((repo) => repo.fork).length;

  const badges = [
    {
      id: 'stars',
      name: 'Star Collector',
      emoji: '⭐',
      earned: totalStars >= 50,
      description: 'Earned 50+ total repository stars.',
      requirement: 'Get 50+ total repository stars.',
    },
    {
      id: 'prolific',
      name: 'Prolific Coder',
      emoji: '💻',
      earned: profile.public_repos >= 50,
      description: 'Published 50+ public repositories.',
      requirement: 'Publish 50+ public repositories.',
    },
    {
      id: 'social',
      name: 'Social Butterfly',
      emoji: '🦋',
      earned: profile.followers >= 100,
      description: 'Gained 100+ followers.',
      requirement: 'Gain 100+ followers.',
    },
    {
      id: 'polyglot',
      name: 'Polyglot',
      emoji: '🌐',
      earned: uniqueLanguages >= 5,
      description: 'Used 5+ different programming languages.',
      requirement: 'Use 5+ different programming languages.',
    },
    {
      id: 'veteran',
      name: 'Veteran Dev',
      emoji: '🏆',
      earned: accountAge >= 5,
      description: 'GitHub account active for 5+ years.',
      requirement: 'GitHub account active for 5+ years.',
    },
    {
      id: 'hero',
      name: 'Open Source Hero',
      emoji: '🦸',
      earned: forkedRepos >= 10,
      description: 'Forked 10+ public repositories.',
      requirement: 'Fork 10+ public repositories.',
    },
    {
      id: 'owl',
      name: 'Night Owl',
      emoji: '🦉',
      earned: false,
      description: 'N/A',
      requirement: 'Commit code during late night hours.',
    },
    {
      id: 'explorer',
      name: 'Explorer',
      emoji: '🗺️',
      earned: !!profile.location,
      description: 'Added a location to profile.',
      requirement: 'Add location to profile.',
    },
  ];

  return (
    <section className="panel p-5 sm:p-6 animate-fade-in-up">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--gs-text)]">Achievements</h2>
        <p className="mt-0.5 text-xs text-[var(--gs-text-secondary)]">
          Profile milestones and badges earned based on public GitHub statistics.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge, index) => (
          <div
            key={badge.id}
            style={{ animationDelay: `${index * 0.05}s` }}
            className={`relative flex items-start gap-3 rounded-lg border p-3.5 transition-all duration-300 hover:scale-[1.02] animate-fade-in opacity-0 ${
              badge.earned
                ? 'border-[var(--gs-accent)]/20 bg-[var(--gs-surface-alt)] shadow-sm'
                : 'border-[var(--gs-border)] bg-[var(--gs-surface)] opacity-55'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface)] text-2xl shadow-sm">
              {badge.earned ? (
                <span>{badge.emoji}</span>
              ) : (
                <Lock className="h-4.5 w-4.5 text-[var(--gs-text-secondary)]" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-semibold truncate ${badge.earned ? 'text-[var(--gs-text)]' : 'text-[var(--gs-text-secondary)]'}`}>
                  {badge.name}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--gs-text-secondary)]">
                {badge.earned ? badge.description : badge.requirement}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
