import { Building, ExternalLink, MapPin } from 'lucide-react';
import useCountUp, { formatStatValue } from '../hooks/useCountUp';

function StatBlock({ label, value, loading }) {
  if (loading) {
    return <div className="h-20 rounded-lg border border-[var(--gs-stat-border)] bg-[var(--gs-stat-bg)] animate-pulse" />;
  }

  return (
    <div className="rounded-lg border border-[var(--gs-stat-border)] bg-[var(--gs-stat-bg)] px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] font-medium text-[var(--gs-text-secondary)]">{label}</div>
      <div className="mt-2 text-lg font-bold text-[var(--gs-text)]">{value}</div>
    </div>
  );
}

function ProfileCard({ profile, loading, isCompare }) {
  // Hooks must run on every render, so they sit above every early return (loading and !profile
  // below). useCountUp coerces its argument with Number(x) || 0, so passing undefined while the
  // profile is still loading is safe — the component returns before these values are shown.
  const animatedFollowers = useCountUp(profile?.followers);
  const animatedFollowing = useCountUp(profile?.following);
  const animatedRepos = useCountUp(profile?.public_repos);

  if (loading) {
    return (
      <section className="panel p-5 sm:p-6 animate-fade-in-up opacity-0" aria-busy="true">
        <div className={isCompare ? "flex flex-col gap-5" : "grid gap-6 lg:grid-cols-[1.2fr_0.9fr]"}>
          <div className="flex gap-4">
            <div className="h-20 w-20 shrink-0 rounded-full bg-[var(--gs-surface-alt)] animate-pulse" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-5 w-40 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
              <div className="h-4 w-28 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
              <div className="h-4 w-full max-w-xl rounded bg-[var(--gs-surface-alt)] animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-[var(--gs-surface-alt)] animate-pulse" />
            </div>
          </div>
          <div className={isCompare ? "grid grid-cols-3 gap-3" : "grid gap-3 sm:grid-cols-3"}>
            <div className="h-20 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] animate-pulse" />
            <div className="h-20 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] animate-pulse" />
            <div className="h-20 rounded-lg border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <section className="panel p-5 sm:p-6 animate-fade-in-up opacity-0">
      <div className={isCompare ? "flex flex-col gap-5" : "grid gap-6 lg:grid-cols-[1.2fr_0.9fr]"}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <img
            className="h-20 w-20 rounded-full border border-[var(--gs-border)] object-cover ring-4 ring-[var(--gs-bg)] transition-transform duration-300 hover:scale-105"
            src={profile.avatar_url}
            alt={`${profile.login} avatar`}
          />
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <a
                href={profile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xl font-semibold text-[var(--gs-text)] transition hover:text-[var(--gs-accent)]"
              >
                {profile.name || profile.login}
                <ExternalLink className="h-4 w-4" />
              </a>
              <div className="mt-1 text-sm text-[var(--gs-text-secondary)]">@{profile.login}</div>
            </div>
            {profile.bio && profile.bio.trim() !== '' ? (
              <p className="max-w-2xl text-sm leading-6 text-[var(--gs-text-secondary)]">{profile.bio}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 text-xs text-[var(--gs-text-secondary)]">
              {profile.company && profile.company.trim() !== '' ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-3 py-1">
                  <Building className="h-3.5 w-3.5" />
                  {profile.company}
                </span>
              ) : null}
              {profile.location ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-3 py-1 transition hover:border-[var(--gs-accent)]/60 hover:text-[var(--gs-accent)]"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </a>
              ) : null}
              <span className="rounded-full border border-[var(--gs-border)] bg-[var(--gs-surface-alt)] px-3 py-1">
                Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className={isCompare ? "grid grid-cols-3 gap-3" : "grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"}>
          <StatBlock label="Followers" value={formatStatValue(animatedFollowers, profile.followers)} />
          <StatBlock label="Following" value={formatStatValue(animatedFollowing, profile.following)} />
          <StatBlock label="Public Repos" value={formatStatValue(animatedRepos, profile.public_repos)} />
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;