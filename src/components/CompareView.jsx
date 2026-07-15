import ProfileCard from './ProfileCard';
import { getAccountAgeYears, getTopLanguage } from '../lib/repoStats';

function getStars(repos) {
  return repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
}

function CompareView({ profile1, repos1, loading1, profile2, repos2, loading2 }) {
  // 1. Calculate values for User 1
  const stars1 = profile1 ? getStars(repos1) : 0;
  const lang1 = profile1 ? getTopLanguage(repos1) : 'N/A';
  const age1 = profile1 ? getAccountAgeYears(profile1.created_at) : 0;

  // 2. Calculate values for User 2
  const stars2 = profile2 ? getStars(repos2) : 0;
  const lang2 = profile2 ? getTopLanguage(repos2) : 'N/A';
  const age2 = profile2 ? getAccountAgeYears(profile2.created_at) : 0;

  // 3. Define metrics to compare
  const metrics = [
    {
      key: 'followers',
      label: 'Followers',
      val1: profile1?.followers || 0,
      val2: profile2?.followers || 0,
      display1: profile1?.followers.toLocaleString() || '0',
      display2: profile2?.followers.toLocaleString() || '0',
      compare: (a, b) => a - b,
    },
    {
      key: 'following',
      label: 'Following',
      val1: profile1?.following || 0,
      val2: profile2?.following || 0,
      display1: profile1?.following.toLocaleString() || '0',
      display2: profile2?.following.toLocaleString() || '0',
      compare: (a, b) => a - b,
    },
    {
      key: 'public_repos',
      label: 'Public Repos',
      val1: profile1?.public_repos || 0,
      val2: profile2?.public_repos || 0,
      display1: profile1?.public_repos.toLocaleString() || '0',
      display2: profile2?.public_repos.toLocaleString() || '0',
      compare: (a, b) => a - b,
    },
    {
      key: 'stars',
      label: 'Total Stars',
      val1: stars1,
      val2: stars2,
      display1: stars1.toLocaleString(),
      display2: stars2.toLocaleString(),
      compare: (a, b) => a - b,
    },
    {
      key: 'language',
      label: 'Top Language',
      val1: lang1,
      val2: lang2,
      display1: lang1,
      display2: lang2,
      compare: (a, b) => (a === b ? 0 : null),
    },
    {
      key: 'age',
      label: 'Account Age',
      val1: age1,
      val2: age2,
      display1: `${age1} year${age1 === 1 ? '' : 's'}`,
      display2: `${age2} year${age2 === 1 ? '' : 's'}`,
      compare: (a, b) => a - b,
    },
  ];

  // 4. Calculate Scores (excluding language since it is not a numeric win-loss metric)
  let score1 = 0;
  let score2 = 0;

  if (profile1 && profile2 && !loading1 && !loading2) {
    metrics.forEach((m) => {
      if (m.key !== 'language') {
        const comp = m.compare(m.val1, m.val2);
        if (comp > 0) score1++;
        if (comp < 0) score2++;
      }
    });
  }

  const overallWinner = score1 > score2 ? profile1 : score2 > score1 ? profile2 : null;

  return (
    <div className="space-y-8">
      {/* Cards Layout */}
      <div className="relative flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-8">
        {/* User 1 */}
        <div className="relative flex-1">
          <ProfileCard profile={profile1} loading={loading1} />
        </div>

        {/* VS Badge (Desktop) */}
        <div className="absolute left-1/2 top-[40%] z-10 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--gs-accent)] bg-[var(--gs-bg)] shadow-[0_0_15px_rgba(88,166,255,0.6)] animate-glow-pulse">
            <span className="text-lg font-black tracking-wider text-[var(--gs-text)]">VS</span>
          </div>
        </div>

        {/* VS Divider (Mobile) */}
        <div className="flex justify-center my-1 md:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--gs-accent)] bg-[var(--gs-bg)] shadow-[0_0_12px_rgba(88,166,255,0.5)] animate-glow-pulse">
            <span className="text-sm font-black tracking-wider text-[var(--gs-text)]">VS</span>
          </div>
        </div>

        {/* User 2 */}
        <div className="relative flex-1">
          <ProfileCard profile={profile2} loading={loading2} />
        </div>
      </div>

      {/* Head-to-Head Statistics Table */}
      {profile1 && profile2 && !loading1 && !loading2 && (
        <section className="panel overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--gs-border)] bg-[var(--gs-surface-alt)]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gs-text)]">Head-to-Head Stats</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--gs-border)] text-xs uppercase tracking-wider text-[var(--gs-text-secondary)] bg-[var(--gs-surface)]/50">
                  <th className="px-6 py-3.5 font-semibold w-1/3 text-right">
                    {profile1.name || profile1.login}
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-center w-1/3">Metric</th>
                  <th className="px-6 py-3.5 font-semibold w-1/3 text-left">
                    {profile2.name || profile2.login}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gs-border)]">
                {metrics.map((m) => {
                  const compResult = m.compare(m.val1, m.val2);
                  const u1Wins = compResult > 0;
                  const u2Wins = compResult < 0;
                  const isDraw = compResult === 0;

                  return (
                    <tr key={m.key} className="hover:bg-[var(--gs-surface-alt)]/30 transition-colors">
                      {/* User 1 Value */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`font-semibold ${
                              u1Wins ? 'text-[var(--gs-success)]' : 'text-[var(--gs-text-secondary)]'
                            }`}
                          >
                            {m.display1}
                          </span>
                          {u1Wins && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--gs-success)]/10 text-[var(--gs-success)] border border-[var(--gs-success)]/20">
                              🏆 Win
                            </span>
                          )}
                          {isDraw && m.key !== 'language' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--gs-warning)]/10 text-[var(--gs-warning)] border border-[var(--gs-warning)]/20">
                              Draw
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Metric Name */}
                      <td className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-[var(--gs-text)] bg-[var(--gs-surface)]/10">
                        {m.label}
                      </td>

                      {/* User 2 Value */}
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-start gap-2">
                          <span
                            className={`font-semibold ${
                              u2Wins ? 'text-[var(--gs-success)]' : 'text-[var(--gs-text-secondary)]'
                            }`}
                          >
                            {m.display2}
                          </span>
                          {u2Wins && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--gs-success)]/10 text-[var(--gs-success)] border border-[var(--gs-success)]/20">
                              🏆 Win
                            </span>
                          )}
                          {isDraw && m.key !== 'language' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--gs-warning)]/10 text-[var(--gs-warning)] border border-[var(--gs-warning)]/20">
                              Draw
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Winner Summary Card */}
      {profile1 && profile2 && !loading1 && !loading2 && (
        <div className="panel p-6 bg-[linear-gradient(135deg,rgba(88,166,255,0.08),transparent_45%,rgba(63,185,80,0.04)_80%,transparent)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,166,255,0.05),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--gs-accent)]">
              Who Wins Overall?
            </h3>
            {overallWinner ? (
              <div className="mt-4 flex flex-col items-center gap-4">
                <img
                  src={overallWinner.avatar_url}
                  alt={overallWinner.login}
                  className="h-20 w-20 rounded-full border-2 border-[var(--gs-success)] object-cover shadow-[0_0_20px_rgba(63,185,80,0.3)]"
                />
                <div>
                  <div className="text-2xl font-black text-[var(--gs-text)]">
                    {overallWinner.name || overallWinner.login} Wins! 🏆
                  </div>
                  <div className="mt-2 text-sm text-[var(--gs-text-secondary)]">
                    Final Score: <span className="font-extrabold text-[var(--gs-success)]">{Math.max(score1, score2)}</span> - <span className="font-extrabold text-[var(--gs-error)]">{Math.min(score1, score2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="text-4xl">🤝</div>
                <div>
                  <div className="text-2xl font-black text-[var(--gs-text)]">It's a Tie!</div>
                  <div className="mt-2 text-sm text-[var(--gs-text-secondary)]">
                    Final Score: <span className="font-extrabold text-[var(--gs-warning)]">{score1}</span> - <span className="font-extrabold text-[var(--gs-warning)]">{score2}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompareView;
