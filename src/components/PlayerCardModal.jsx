import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Sparkles, 
  Twitter, 
  Linkedin, 
  ChevronDown, 
  GitPullRequest, 
  Flame, 
  Shield, 
  Globe,
  Award,
  Star,
  Clock,
  Moon,
  Sun,
  Activity
} from 'lucide-react';
import html2canvas from 'html2canvas';

export default function PlayerCardModal({ profile, repos, activityMap, eventTimestamps }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cardRef = useRef(null);

  if (!profile) return null;

  // 1. Stats Calculations
  const activeDays = Object.values(activityMap || {}).filter((v) => v > 0).length;
  const totalStars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
  const totalContributions = Object.values(activityMap || {}).reduce((a, b) => a + b, 0);
  const topRepoReach = Math.max(0, ...repos.map(r => r.stargazers_count || 0));
  
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

  // Mapped/Derived Scouting Metrics
  const skillMoves = Math.min(5, Math.max(1, Math.round(ovr / 20)));

  // Contribution pattern logic based on events/commits hours
  const getContributionPattern = (timestamps) => {
    if (!timestamps || timestamps.length < 10) {
      return { pattern: 'Balanced', percentage: 0, icon: Globe };
    }
    
    let nightCount = 0;
    let earlyCount = 0;
    let dayCount = 0;
    let eveningCount = 0;
    
    for (const ts of timestamps) {
      const date = new Date(ts);
      const hr = date.getHours(); // Local timezone hour
      
      if (hr >= 22 || hr < 5) {
        nightCount++;
      } else if (hr >= 5 && hr < 9) {
        earlyCount++;
      } else if (hr >= 9 && hr < 18) {
        dayCount++;
      } else {
        eveningCount++;
      }
    }
    
    const total = timestamps.length;
    const patterns = [
      { name: 'Night Owl', count: nightCount, icon: Moon, desc: 'commits between 10 PM and 5 AM' },
      { name: 'Early Bird', count: earlyCount, icon: Sun, desc: 'commits between 5 AM and 9 AM' },
      { name: 'Day Grinder', count: dayCount, icon: Activity, desc: 'commits between 9 AM and 6 PM' },
      { name: 'Evening Coder', count: eveningCount, icon: Clock, desc: 'commits between 6 PM and 10 PM' },
    ];
    
    patterns.sort((a, b) => b.count - a.count);
    const topPattern = patterns[0];
    const pct = Math.round((topPattern.count / total) * 100);
    
    return {
      pattern: topPattern.name,
      percentage: pct,
      icon: topPattern.icon,
      desc: `${topPattern.name} — ${pct}% of ${topPattern.desc}.`
    };
  };

  const patternData = getContributionPattern(eventTimestamps);

  // Work Rate Calculations
  const attackRate = pac > 75 ? 'HIGH' : pac > 60 ? 'MED' : 'LOW';
  
  // Defensive work rate derived from consistency/variance of commit hours
  let defenseRate = 'MED';
  if (eventTimestamps && eventTimestamps.length >= 10) {
    const hours = eventTimestamps.map(ts => new Date(ts).getHours());
    const meanHr = hours.reduce((a, b) => a + b, 0) / hours.length;
    const varHr = hours.reduce((a, b) => a + Math.pow(b - meanHr, 2), 0) / hours.length;
    defenseRate = varHr < 16 ? 'HIGH' : varHr < 36 ? 'MED' : 'LOW';
  }
  const workRate = `${attackRate} / ${defenseRate}`;

  // Style Tag
  const statsList = [pac, sho, pas, dri, def, phy];
  const maxStat = Math.max(...statsList);
  const minStat = Math.min(...statsList);
  let styleTag = 'BALANCED';
  if (maxStat - minStat < 15) {
    styleTag = 'COMPLETE';
  } else if (maxStat === pac) {
    styleTag = 'ENGINE';
  } else if (maxStat === dri) {
    styleTag = 'MAVERICK';
  } else if (maxStat === def) {
    styleTag = 'INDUSTRIOUS';
  } else if (maxStat === sho) {
    styleTag = 'FINISHER';
  } else if (maxStat === pas) {
    styleTag = 'PLAYMAKER';
  } else if (maxStat === phy) {
    styleTag = 'ENFORCER';
  }

  // Archetype
  let archetype = 'ALL-ROUNDER';
  if (dri > 75 && pas > 75) {
    archetype = 'FANTASISTA';
  } else if (def > 75) {
    archetype = 'THE WALL';
  } else if (sho > 75) {
    archetype = 'SNIPER';
  } else if (pac > 75) {
    archetype = 'SPEEDSTER';
  } else if (pas > 75) {
    archetype = 'PLAYMAKER';
  }

  // Coder Personality Insight Calculations
  let insight = {
    title: "THE SYSTEM PLAYMAKER",
    desc: "All-Rounder: Easily manages multiple modules, architectures, and features."
  };
  if (patternData.pattern === 'Night Owl' && dri > 80) {
    insight = {
      title: "NOCTURNAL ARCHITECT",
      desc: "Late-Night Coding Wizard: Writes clean, complex code when the world sleeps."
    };
  } else if (patternData.pattern === 'Early Bird' && pac > 80) {
    insight = {
      title: "DISCIPLINED ENGINE",
      desc: "Morning Runner: Ships features with high speed and discipline before the day starts."
    };
  } else if (archetype === 'FANTASISTA') {
    insight = {
      title: "THE MAGICIAN",
      desc: "Creative Playmaker: Builds beautiful full-stack features using a wide range of technologies."
    };
  } else if (archetype === 'THE WALL') {
    insight = {
      title: "THE CODE GUARDIAN",
      desc: "Infrastructure protector: Keeps the codebase safe, clean, and highly stable."
    };
  } else if (archetype === 'SNIPER') {
    insight = {
      title: "THE FEATURE FINISHER",
      desc: "Precise executor: Delivers high-impact features and earns stars on top repositories."
    };
  } else if (archetype === 'SPEEDSTER') {
    insight = {
      title: "THE SPEED DEMON",
      desc: "Fast Shipper: Relentlessly pushes updates and codes at an extreme speed."
    };
  }

  // Playstyles List
  const playstyles = [];
  
  // Prepend detected timezone pattern playstyle if available
  if (patternData.pattern !== 'Balanced') {
    playstyles.push({
      name: patternData.pattern,
      desc: patternData.desc,
      icon: patternData.icon
    });
  }

  if (uniqueLangsCount > 3) {
    playstyles.push({ name: 'Polyglot', desc: 'Working across multiple stacks', icon: Globe });
  }
  if (totalForks > 5) {
    playstyles.push({ name: 'Connector', desc: 'Highly collaborative developer', icon: GitPullRequest });
  }
  if (totalContributions > 200) {
    playstyles.push({ name: 'Rapid Fire', desc: 'Extremely high commit velocity', icon: Flame });
  }
  if (years > 3) {
    playstyles.push({ name: 'Maintainer', desc: 'Long-term repository steward', icon: Shield });
  }
  // Ensure we have at least 3 playstyles
  if (playstyles.length < 3) {
    playstyles.push({ name: 'Specialist', desc: 'Deep language mastery', icon: Award });
  }
  if (playstyles.length < 3) {
    playstyles.push({ name: 'Tactician', desc: 'Clean architecture design', icon: Sparkles });
  }

  // Raw metrics and their 0-99 scores
  const prsCount = Math.round(totalForks * 1.2 + activeDays * 0.1);
  const issuesCount = Math.round(activeDays * 0.15 + (profile.public_repos || 0) * 0.3);
  const codeReviews = Math.round(activeDays * 0.08 + totalForks * 0.5);

  const rawMetrics = [
    { label: 'Commits', raw: `${totalContributions} commits`, score: Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, totalContributions * 0.1)))) },
    { label: 'Stars earned', raw: `${totalStars} stars`, score: sho },
    { label: 'Top repo reach', raw: `${topRepoReach} stars`, score: Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, 15 * Math.log2(topRepoReach + 1))))) },
    { label: 'Pull requests', raw: `${prsCount} PRs`, score: Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, prsCount * 2.5)))) },
    { label: 'Followers', raw: `${profile.followers || 0} followers`, score: pas },
    { label: 'Languages', raw: `${uniqueLangsCount} langs`, score: Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, uniqueLangsCount * 7.5)))) },
    { label: 'Issues', raw: `${issuesCount} issues`, score: Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, issuesCount * 2.0)))) },
    { label: 'Code reviews', raw: `${codeReviews} reviews`, score: Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, codeReviews * 3.0)))) },
    { label: 'Contributions', raw: `${totalContributions} total`, score: Math.min(99, Math.max(50, 50 + Math.round(Math.min(49, totalContributions * 0.08)))) },
  ];

  // Position logic
  let position = 'ST'; 
  const mainLang = [...uniqueLangs][0] || 'JavaScript';
  
  if (['HTML', 'CSS', 'TypeScript'].includes(mainLang)) {
    position = 'RW'; 
  } else if (['Go', 'Rust', 'Java', 'C++', 'Ruby'].includes(mainLang)) {
    position = 'CB'; 
  } else if (['Python', 'R', 'Julia'].includes(mainLang)) {
    position = 'CM'; 
  } else if (['Shell', 'PowerShell', 'Docker'].includes(mainLang)) {
    position = 'GK'; 
  } else if (mainLang === 'JavaScript') {
    position = 'LW'; 
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

  const handleDownload = async (format = 'png') => {
    if (!cardRef.current || downloading) return;
    try {
      setDownloading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, 
      });
      
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const fileExt = format === 'jpeg' ? 'jpg' : 'png';
      
      const link = document.createElement('a');
      link.download = `${profile.login}-card.${fileExt}`;
      link.href = canvas.toDataURL(mimeType, format === 'jpeg' ? 0.95 : undefined);
      link.click();
    } catch (err) {
      console.error('Failed to download card:', err);
    } finally {
      setDownloading(false);
    }
  };

  const avatarUrl = profile.avatar_url
    ? `${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}t=${Date.now()}`
    : '';

  // Bell Curve Positioning logic (OVR range 50 to 100 mapped to 0 to 100)
  const bellCurvePercent = Math.min(100, Math.max(0, ((ovr - 50) / 50) * 100));

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
        <div className="fixed inset-0 z-[9999] bg-slate-950 overflow-y-auto select-none font-sans text-slate-100">
          
          {/* Main Top Header Controls */}
          <div className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-wider text-[var(--gs-accent)]">SCOUTING REPORT</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 uppercase font-mono tracking-widest text-slate-400">
                PRO-DEV MATCH
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="w-full max-w-6xl mx-auto py-8 px-6 space-y-8 pb-20">

            {/* TOP HEADER DETAILS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-start gap-4">
                {/* OVR + Tier badge */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-slate-900 shadow-md min-w-[70px] text-center">
                  <div className="text-3xl font-black leading-none">{ovr}</div>
                  <div className={`text-[9px] font-black uppercase tracking-wider mt-1 ${theme.text}`}>{theme.name}</div>
                </div>

                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white uppercase">{profile.name || profile.login}</h1>
                  
                  {/* Position tag, Archetype, @username, main lang */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] bg-slate-800 border border-white/10 ${theme.text}`}>
                      {position}
                    </span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">{archetype}</span>
                    <span className="text-slate-400 font-medium">@{profile.login}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                    <span className="text-slate-300 font-bold uppercase tracking-widest">{mainLang}</span>
                  </div>
                </div>
              </div>

              {/* Coder Personality Insight Box */}
              <div className={`md:max-w-md ${theme.btnBg} border ${theme.btnBorder} rounded-xl p-4 shadow-lg animate-fade-in-up duration-500`}>
                <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                  <Sparkles className={`h-3 w-3 ${theme.text} animate-pulse`} />
                  <span>CODER PERSONALITY INSIGHT</span>
                </div>
                <h3 className={`text-sm font-black tracking-wide uppercase mt-1 ${theme.text}`}>
                  {insight.title}
                </h3>
                <p className="text-xs font-medium text-slate-200 mt-1 leading-relaxed">
                  {insight.desc}
                </p>
              </div>
            </div>

            {/* 3-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-8 items-start">
              
              {/* LEFT COLUMN: ATTRIBUTES & PLAYSTYLES */}
              <div className="space-y-6">
                
                {/* ATTRIBUTES PANEL */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h2 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase border-b border-slate-800 pb-2">
                    PLAYER ATTRIBUTES
                  </h2>

                  <div className="space-y-3.5 text-sm">
                    {/* Skill Moves */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Skill Moves</span>
                      <div className="flex text-amber-400 text-xs tracking-widest">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < skillMoves ? 'fill-current' : 'opacity-20'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Work Rate */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Work Rate</span>
                      <span className="font-mono text-xs font-bold text-slate-200">{workRate}</span>
                    </div>

                    {/* Style Tag */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Style Tag</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase bg-slate-800 border border-slate-700 ${theme.text}`}>
                        {styleTag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PLAYSTYLES PANEL */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h2 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase border-b border-slate-800 pb-2">
                    PLAYSTYLES
                  </h2>

                  <div className="space-y-3.5">
                    {playstyles.map((ps, idx) => {
                      const Icon = ps.icon;
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-slate-800 border border-slate-700/60 ${theme.text}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-100">{ps.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{ps.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* CENTER COLUMN: CARD DISPLAY & SHARING ACTIONS */}
              <div className="flex flex-col items-center justify-center space-y-6">
                
                {/* Centered FUT Card Component (rendered exact dimensions) */}
                <div
                  ref={cardRef}
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 12%, 100% 80%, 50% 100%, 0% 80%, 0% 12%)',
                  }}
                  className={`relative w-[320px] h-[460px] p-[2.5px] bg-gradient-to-b ${theme.border} shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]`}
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

                {/* Actions Grid */}
                <div className="w-full max-w-[320px]">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      disabled={downloading}
                      className="w-full flex items-center justify-between px-4 h-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition font-bold text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>{downloading ? 'Exporting...' : 'Download Card'}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute bottom-full mb-2 left-0 w-full rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1.5 z-50 animate-fade-in text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            handleDownload('png');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                        >
                          Download as PNG
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleDownload('jpeg');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                        >
                          Download as JPEG
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: SCOUTING METRICS & BELL-CURVE DISTRIBUTION */}
              <div className="space-y-6">
                
                {/* SCOUTING METRICS PANEL */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h2 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase border-b border-slate-800 pb-2">
                    SCOUTING METRICS
                  </h2>

                  <div className="space-y-3.5">
                    {rawMetrics.map((metric, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-end text-xs">
                          <span className="font-semibold text-slate-200">{metric.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-medium">{metric.raw}</span>
                            <span className={`font-mono font-black text-sm leading-none ${getStatColor(metric.score)}`}>
                              {metric.score}
                            </span>
                          </div>
                        </div>
                        
                        {/* Custom visual progress bar */}
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              metric.score > 85 ? 'bg-emerald-500' : metric.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${metric.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DISTRIBUTION PANEL */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h2 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase border-b border-slate-800 pb-2">
                    RATING DISTRIBUTION
                  </h2>

                  {/* Bell Curve SVG */}
                  <div className="relative pt-4">
                    <svg viewBox="0 0 100 30" className="w-full h-16 overflow-visible text-slate-700 fill-slate-800/20">
                      {/* Bell curve baseline */}
                      <path 
                        d="M 0 30 C 20 30, 35 3, 50 3 C 65 3, 80 30, 100 30" 
                        fill="rgba(51,65,85,0.15)" 
                        stroke="rgba(148,163,184,0.3)" 
                        strokeWidth="1.5" 
                      />
                      
                      {/* Dotted indicator line for user's OVR position */}
                      <line 
                        x1={bellCurvePercent} 
                        y1="2" 
                        x2={bellCurvePercent} 
                        y2="30" 
                        stroke="rgba(245,158,11,0.85)" 
                        strokeWidth="1.2" 
                        strokeDasharray="2,2" 
                      />
                      
                      {/* Circle dot representing user */}
                      <circle 
                        cx={bellCurvePercent} 
                        cy="15" 
                        r="3.5" 
                        fill="rgba(245,158,11,1)" 
                        className="animate-pulse"
                      />
                    </svg>

                    {/* Position tag labeling user */}
                    <div 
                      className="absolute -top-1 bg-amber-500 text-slate-950 font-black font-mono text-[8px] rounded px-1 py-0.5 tracking-tight shadow-md transform -translate-x-1/2"
                      style={{ left: `${bellCurvePercent}%` }}
                    >
                      {profile.login} · {ovr}
                    </div>
                  </div>

                  {/* Percentile scores */}
                  <div className="grid grid-cols-2 gap-3 text-center border-t border-slate-800/80 pt-4">
                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                      <div className="text-slate-500 text-[9px] font-bold tracking-wider uppercase">Global percentile</div>
                      <div className="text-base font-black text-emerald-400 mt-0.5">TOP {Math.max(1, 100 - ovr)}%</div>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                      <div className="text-slate-500 text-[9px] font-bold tracking-wider uppercase">Active Percentile</div>
                      <div className="text-base font-black text-cyan-400 mt-0.5">TOP {Math.max(1, Math.round((100 - ovr) * 1.4))}%</div>
                    </div>
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
