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
    borderHover: 'hover:shadow-[0_20px_50px_rgba(194,65,12,0.35)]',
    bgImage: '/bronze_foil.png',
    text: 'text-orange-400',
    glowColor: 'rgba(194, 65, 12, 0.2)',
    badgeName: 'Bronze Developer',
  };

  if (ovr >= 90) {
    theme = {
      name: 'TOTY',
      border: 'from-blue-600 via-cyan-400 to-indigo-600',
      borderHover: 'hover:shadow-[0_20px_50px_rgba(6,182,212,0.55)]',
      bgImage: '/toty_foil.png',
      text: 'text-cyan-400',
      glowColor: 'rgba(6, 182, 212, 0.4)',
      badgeName: 'TOTY Icon',
    };
  } else if (ovr >= 80) {
    theme = {
      name: 'Gold',
      border: 'from-amber-500 via-yellow-300 to-amber-600',
      borderHover: 'hover:shadow-[0_20px_50px_rgba(245,158,11,0.55)]',
      bgImage: '/gold_foil.png',
      text: 'text-yellow-400',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      badgeName: 'Gold Class',
    };
  } else if (ovr >= 65) {
    theme = {
      name: 'Silver',
      border: 'from-slate-400 via-slate-200 to-slate-500',
      borderHover: 'hover:shadow-[0_20px_50px_rgba(148,163,184,0.45)]',
      bgImage: '/silver_foil.png',
      text: 'text-slate-300',
      glowColor: 'rgba(148, 163, 184, 0.3)',
      badgeName: 'Silver Class',
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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-start sm:justify-center overflow-y-auto bg-black/90 backdrop-blur-md py-16 px-4 select-none">
          {/* Controls Bar */}
          <div className="absolute top-6 right-6 flex gap-3 text-white z-50">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 h-10 px-6 text-sm font-black rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
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
          <div className="flex flex-col items-center gap-6 mt-8 sm:mt-0 relative group fifa-card-container">
            {/* Spotlight Radial Glow behind Card */}
            <div
              className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-60 pointer-events-none transition-all duration-500 group-hover:scale-110"
              style={{
                background: `radial-gradient(circle, ${theme.glowColor} 0%, rgba(0,0,0,0) 70%)`,
              }}
            />

            <div
              ref={cardRef}
              style={{
                clipPath: 'polygon(50% 0%, 100% 12%, 100% 80%, 50% 100%, 0% 80%, 0% 12%)',
              }}
              className={`relative w-[320px] h-[460px] p-[2.5px] bg-gradient-to-b ${theme.border} shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 hover:-translate-y-2.5 ${theme.borderHover}`}
            >
              {/* Inner Shield */}
              <div
                style={{
                  clipPath: 'polygon(50% 0%, 100% 12%, 100% 80%, 50% 100%, 0% 80%, 0% 12%)',
                  backgroundImage: `url(${theme.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                className="relative w-full h-full p-6 flex flex-col justify-between overflow-hidden text-white"
              >
                {/* Diagonal White/Shine Sweep Effect */}
                <div className="card-shine" />

                {/* Glossy Sheen Overlay */}
                <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-br from-white/15 via-white/5 to-transparent -skew-y-12 origin-top-left pointer-events-none" />

                {/* Card Header Info */}
                <div className="flex justify-between items-start mt-6">
                  {/* Left-hand attributes column */}
                  <div className="flex flex-col items-start pl-3 pt-3 space-y-0.5">
                    <div className="text-5xl font-black tracking-tighter leading-none">{ovr}</div>
                    <div className={`text-xs font-black tracking-widest uppercase opacity-90 ${theme.text}`}>{position}</div>
                    
                    {/* Divider line */}
                    <div className="h-[1.5px] w-8 bg-white/20 my-1" />
                    
                    {/* Flag and Language emblem side-by-side */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xl leading-none" title={profile.location || 'Global'}>{flag}</span>
                      <span
                        className="flex items-center justify-center h-5 w-5 rounded-full bg-white/10 border border-white/20 text-[8px] font-extrabold uppercase text-white/90"
                        title={`Main language: ${mainLang}`}
                      >
                        {mainLang.substring(0, 2)}
                      </span>
                    </div>
                  </div>

                  {/* Player Profile Photo */}
                  <div className="relative pr-2 pt-2">
                    {/* circular cutout, thin gold ring border + subtle inner shadow */}
                    <div className="h-32 w-32 rounded-full border border-amber-500/35 overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] relative ring-2 ring-black/45 bg-transparent">
                      <img
                        src={avatarUrl}
                        alt={profile.login}
                        className="h-full w-full object-cover relative z-10"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] z-20 pointer-events-none rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Center Name Block */}
                <div className="text-center mt-3">
                  <div className="text-xl font-black tracking-[0.25em] uppercase border-b border-white/20 pb-1.5 max-w-[210px] mx-auto truncate text-white shadow-sm">
                    {profile.name ? profile.name.split(' ')[0] : profile.login}
                  </div>
                </div>

                {/* Single horizontal stats section row */}
                <div className="grid grid-cols-6 gap-0 px-1 mb-8 text-center">
                  <div className="flex flex-col items-center border-r border-white/10">
                    <span className="text-[9px] font-black text-white/55 tracking-wider">PAC</span>
                    <span className={`text-sm font-black mt-0.5 ${getStatColor(pac)}`}>{pac}</span>
                  </div>
                  <div className="flex flex-col items-center border-r border-white/10">
                    <span className="text-[9px] font-black text-white/55 tracking-wider">DRI</span>
                    <span className={`text-sm font-black mt-0.5 ${getStatColor(dri)}`}>{dri}</span>
                  </div>
                  <div className="flex flex-col items-center border-r border-white/10">
                    <span className="text-[9px] font-black text-white/55 tracking-wider">SHO</span>
                    <span className={`text-sm font-black mt-0.5 ${getStatColor(sho)}`}>{sho}</span>
                  </div>
                  <div className="flex flex-col items-center border-r border-white/10">
                    <span className="text-[9px] font-black text-white/55 tracking-wider">DEF</span>
                    <span className={`text-sm font-black mt-0.5 ${getStatColor(def)}`}>{def}</span>
                  </div>
                  <div className="flex flex-col items-center border-r border-white/10">
                    <span className="text-[9px] font-black text-white/55 tracking-wider">PAS</span>
                    <span className={`text-sm font-black mt-0.5 ${getStatColor(pas)}`}>{pas}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-white/55 tracking-wider">PHY</span>
                    <span className={`text-sm font-black mt-0.5 ${getStatColor(phy)}`}>{phy}</span>
                  </div>
                </div>

                {/* Card Type Badge & Watermark */}
                <div className="flex flex-col items-center space-y-1 mb-3">
                  <div className="flex items-center gap-1 text-[9px] font-black tracking-[0.2em] text-white/55 uppercase">
                    <Sparkles className={`h-3 w-3 ${theme.text} animate-pulse`} />
                    <span>{theme.badgeName}</span>
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
