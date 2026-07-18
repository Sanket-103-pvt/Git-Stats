import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function PlayerCardModal({ profile, repos, activityMap }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  if (!profile) return null;

  // 1. Stats Calculations
  const activeDays = Object.values(activityMap || {}).filter((v) => v > 0).length;
  const totalStars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
  
  const uniqueLangs = new Set(repos.map((r) => r.language).filter(Boolean));
  const uniqueLangsCount = uniqueLangs.size;

  // Pace (PAC): Based on active contribution days (target: 60 active days for max rating)
  const pac = Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, activeDays * 0.8))));

  // Shooting (SHO): Based on total stars (log scale)
  const sho = Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, 12 * Math.log2(totalStars + 1)))));

  // Passing (PAS): Based on follower count (log scale)
  const pas = Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, 10 * Math.log2((profile.followers || 0) + 1)))));

  // Dribbling (DRI): Based on unique languages count
  const dri = Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, uniqueLangsCount * 7))));

  // Defending (DEF): Based on forks (log scale)
  const def = Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, 10 * Math.log2(totalForks + 1)))));

  // Physical (PHY): Based on public repos and account age
  const years = (new Date() - new Date(profile.created_at || Date.now())) / (1000 * 60 * 60 * 24 * 365.25);
  const phy = Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, (profile.public_repos || 0) * 0.7 + years * 4.0))));

  // Overall rating (OVR)
  const ovr = Math.round((pac + sho + pas + dri + def + phy) / 6);

  // Position logic
  let position = 'ST'; // Fullstack Striker
  const mainLang = [...uniqueLangs][0] || 'JavaScript';
  
  if (['HTML', 'CSS', 'TypeScript'].includes(mainLang)) {
    position = 'RW'; // Right Winger (Frontend)
  } else if (['Go', 'Rust', 'Java', 'C++', 'Ruby'].includes(mainLang)) {
    position = 'CB'; // Center Back (Backend / Infrastructure)
  } else if (['Python', 'R', 'Julia'].includes(mainLang)) {
    position = 'CM'; // Center Mid (Data / Analytics)
  } else if (['Shell', 'PowerShell', 'Docker'].includes(mainLang)) {
    position = 'GK'; // Goalkeeper (DevOps / Protection)
  } else if (mainLang === 'JavaScript') {
    position = 'LW'; // Left Winger (Frontend)
  }

  // Country Flag Detection
  let flag = '💻';
  const loc = (profile.location || '').toLowerCase();
  if (loc.includes('india') || loc.includes('nashik') || loc.includes('mumbai') || loc.includes('delhi')) {
    flag = '🇮🇳';
  } else if (loc.includes('usa') || loc.includes('united states') || loc.includes('america') || loc.includes('san francisco')) {
    flag = '🇺🇸';
  } else if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('london')) {
    flag = '🇬🇧';
  } else if (loc.includes('canada')) {
    flag = '🇨🇦';
  } else if (loc.includes('germany')) {
    flag = '🇩🇪';
  } else if (loc.includes('france')) {
    flag = '🇫🇷';
  } else if (loc.includes('japan')) {
    flag = '🇯🇵';
  } else if (loc.includes('brazil')) {
    flag = '🇧🇷';
  }

  // Card themes by OVR
  let theme = {
    name: 'Bronze',
    border: 'from-orange-700 via-amber-800 to-orange-900',
    bg: 'from-slate-950 via-orange-950/25 to-slate-950',
    text: 'text-orange-400',
    photoBorder: 'border-orange-500/30',
    btnBg: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400',
    btnBorder: 'border-orange-500/30',
    badge: '🏆 Bronze Developer',
  };

  if (ovr >= 90) {
    theme = {
      name: 'TOTY',
      border: 'from-blue-600 via-cyan-400 to-indigo-600',
      bg: 'from-slate-950 via-blue-950/90 to-purple-950/95',
      text: 'text-cyan-400',
      photoBorder: 'border-cyan-500/30',
      btnBg: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400',
      btnBorder: 'border-cyan-500/30',
      badge: '✨ TOTY Icon',
    };
  } else if (ovr >= 80) {
    theme = {
      name: 'Gold',
      border: 'from-amber-500 via-yellow-300 to-amber-600',
      bg: 'from-slate-900 via-amber-950/70 to-slate-950',
      text: 'text-yellow-400',
      photoBorder: 'border-yellow-500/30',
      btnBg: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400',
      btnBorder: 'border-yellow-500/30',
      badge: '👑 Gold Class',
    };
  } else if (ovr >= 65) {
    theme = {
      name: 'Silver',
      border: 'from-slate-400 via-slate-200 to-slate-500',
      bg: 'from-slate-900 via-slate-800/70 to-slate-950',
      text: 'text-slate-300',
      photoBorder: 'border-slate-400/30',
      btnBg: 'bg-slate-400/10 hover:bg-slate-400/20 text-slate-300',
      btnBorder: 'border-slate-400/30',
      badge: '⭐ Silver Class',
    };
  }

  // Get color based on attribute value
  const getStatColor = (val) => {
    if (val > 85) return 'text-emerald-400';
    if (val >= 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    try {
      setDownloading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // Retain sharp borders on save
      });
      
      const link = document.createElement('a');
      link.download = `${profile.login}-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download card:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Append timestamp parameter to force fresh CORS-compliant image fetch in html2canvas
  const avatarUrl = profile.avatar_url
    ? `${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}t=${Date.now()}`
    : '';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg border border-[var(--gs-accent)]/20 bg-[var(--gs-accent)]/5 text-[var(--gs-accent)] hover:bg-[var(--gs-accent)]/10 transition animate-fade-in"
      >
        <Sparkles className="h-4.5 w-4.5" />
        <span>Player Card 🃏</span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-start sm:justify-center overflow-y-auto bg-black/85 backdrop-blur-md py-16 px-4 select-none">
          {/* Controls Bar */}
          <div className="absolute top-6 right-6 flex gap-3 text-white z-50">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className={`inline-flex items-center gap-2 h-10 px-5 text-sm font-bold rounded-full border ${theme.btnBorder} ${theme.btnBg} transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50`}
            >
              <Download className="h-4.5 w-4.5" />
              <span>{downloading ? 'Exporting...' : 'Download Card'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* FIFA Player Card Container */}
          <div className="flex flex-col items-center gap-6 mt-8 sm:mt-0">
            <div
              ref={cardRef}
              style={{
                clipPath: 'polygon(50% 0%, 100% 12%, 100% 80%, 50% 100%, 0% 80%, 0% 12%)',
              }}
              className={`relative w-[320px] h-[460px] p-[2.5px] bg-gradient-to-b ${theme.border} shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]`}
            >
              {/* Inner Shield */}
              <div
                style={{
                  clipPath: 'polygon(50% 0%, 100% 12%, 100% 80%, 50% 100%, 0% 80%, 0% 12%)',
                }}
                className={`relative w-full h-full bg-gradient-to-b ${theme.bg} p-6 flex flex-col justify-between overflow-hidden text-white`}
              >
                {/* SVG Fractal Noise Overlay */}
                <div
                  className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Diagonal Shine Band Glossy Streak */}
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_45%,rgba(255,255,255,0.15)_50%,transparent_55%)] pointer-events-none" />

                {/* Card Header Info */}
                <div className="flex justify-between items-start mt-6">
                  {/* Left-hand attributes column */}
                  <div className="flex flex-col items-start pl-3 pt-3 space-y-0.5">
                    <div className="text-5xl font-black tracking-tighter leading-none">{ovr}</div>
                    <div className={`text-xs font-black tracking-widest uppercase opacity-90 ${theme.text}`}>{position}</div>
                    
                    {/* Divider line */}
                    <div className="h-[1.5px] w-8 bg-white/20 my-1" />
                    
                    {/* Flag and Language emblem side-by-side in one row */}
                    <div className="flex flex-row items-center gap-2 mt-0.5">
                      <span className="text-xl leading-none" title={profile.location || 'Global'}>{flag}</span>
                      <span
                        className="flex items-center justify-center h-5 w-5 rounded-full bg-white/10 border border-white/25 text-[8px] font-extrabold uppercase text-white/90"
                        title={`Main language: ${mainLang}`}
                      >
                        {mainLang.substring(0, 2)}
                      </span>
                    </div>
                  </div>

                  {/* Player Profile Photo */}
                  <div className="relative pr-2 pt-2">
                    <div className={`h-32 w-32 rounded-full border-2 ${theme.photoBorder} overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] ring-4 ring-black/35 bg-transparent`}>
                      <img
                        src={avatarUrl}
                        alt={profile.login}
                        className="h-full w-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>
                </div>

                {/* Center Name Block */}
                <div className="text-center mt-3">
                  <div className="text-xl font-black tracking-[0.25em] uppercase border-b border-white/20 pb-1.5 max-w-[210px] mx-auto truncate text-white shadow-sm">
                    {profile.name ? profile.name.split(' ')[0] : profile.login}
                  </div>
                </div>

                {/* Bottom Attribute Matrix - Horizontal Grid Layout */}
                <div className="grid grid-cols-3 gap-y-3 gap-x-2 px-4 mb-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-base font-black ${getStatColor(pac)}`}>{pac}</span>
                    <span className="text-[9px] font-bold text-white/50 tracking-wider">PAC</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-base font-black ${getStatColor(dri)}`}>{dri}</span>
                    <span className="text-[9px] font-bold text-white/50 tracking-wider">DRI</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-base font-black ${getStatColor(sho)}`}>{sho}</span>
                    <span className="text-[9px] font-bold text-white/50 tracking-wider">SHO</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-base font-black ${getStatColor(def)}`}>{def}</span>
                    <span className="text-[9px] font-bold text-white/50 tracking-wider">DEF</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-base font-black ${getStatColor(pas)}`}>{pas}</span>
                    <span className="text-[9px] font-bold text-white/50 tracking-wider">PAS</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-base font-black ${getStatColor(phy)}`}>{phy}</span>
                    <span className="text-[9px] font-bold text-white/50 tracking-wider">PHY</span>
                  </div>
                </div>

                {/* Card Type Badge & Watermark */}
                <div className="flex flex-col items-center space-y-1 mb-3">
                  <div className="flex items-center gap-1 text-[9px] font-black tracking-[0.2em] text-white/55 uppercase">
                    <Sparkles className="h-3 w-3 opacity-75 animate-pulse" />
                    <span>{theme.badge}</span>
                  </div>
                  <div className="text-[8px] font-bold tracking-[0.25em] text-white/30 uppercase">
                    SANKETCHAUDHARI.IN
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
