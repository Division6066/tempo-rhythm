/* Tempo Flow — Shared React components (global scope via window)
   Depends on React 18 + Babel. No JSX imports; we assign to window. */

const { useState, useEffect, useRef, useMemo, createContext, useContext, Fragment } = React;

/* ---------- Lucide-ish inline icons (1.5px stroke) ---------- */
const Icon = ({ d, size = 18, stroke = 1.5, fill = "none", children, ...rest }) => (
  <svg className="lucide" width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children || <path d={d}/>}
  </svg>
);
const I = {
  Home: (p) => <Icon {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></Icon>,
  Check: (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>,
  CheckSquare: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/></Icon>,
  Notebook: (p) => <Icon {...p}><path d="M4 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4z"/><path d="M4 8h-2"/><path d="M4 12h-2"/><path d="M4 16h-2"/><path d="M10 4v16"/></Icon>,
  BookOpen: (p) => <Icon {...p}><path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></Icon>,
  Sparkles: (p) => <Icon {...p}><path d="M12 3 13.5 9 20 10.5 13.5 12 12 18 10.5 12 4 10.5 10.5 9z"/><path d="M18 18l.8 2L21 20.8 18.8 21.6 18 24l-.8-2.4L15 21l2.2-1z"/></Icon>,
  Flame: (p) => <Icon {...p}><path d="M12 2c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4-1 4 1 5 2 5 0-3 1-6 1-11z"/></Icon>,
  Target: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></Icon>,
  Folder: (p) => <Icon {...p}><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></Icon>,
  Repeat: (p) => <Icon {...p}><path d="M17 2l3 3-3 3"/><path d="M3 11v-1a4 4 0 0 1 4-4h13"/><path d="M7 22l-3-3 3-3"/><path d="M21 13v1a4 4 0 0 1-4 4H4"/></Icon>,
  Chart: (p) => <Icon {...p}><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-6"/></Icon>,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.3-.9a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.5a7 7 0 0 0 2.1-1.2l2.3.9 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z"/></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>,
  Mic: (p) => <Icon {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/></Icon>,
  Command: (p) => <Icon {...p}><path d="M6 6a2 2 0 1 1 2 2H6V6zM16 6a2 2 0 1 0-2 2h2V6zM6 18a2 2 0 1 0 2-2H6v2zM16 18a2 2 0 1 1-2-2h2v2z"/><path d="M8 8h8v8H8z"/></Icon>,
  Sun: (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Icon>,
  Moon: (p) => <Icon {...p}><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></Icon>,
  Laptop: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M2 20h20"/></Icon>,
  Monitor: (p) => <Icon {...p}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></Icon>,
  Ear: (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 3-2 4-3 6s-1 4-3 4-3-1-3-3"/><path d="M9 12a3 3 0 0 1 6 0"/></Icon>,
  Type: (p) => <Icon {...p}><path d="M4 7V5h16v2M9 5v14M15 19h-6"/></Icon>,
  Volume: (p) => <Icon {...p}><path d="M3 10v4h4l5 4V6L7 10H3z"/><path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"/></Icon>,
  Image: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></Icon>,
  Heading: (p) => <Icon {...p}><path d="M6 4v16M18 4v16M6 12h12"/></Icon>,
  AlignLeft: (p) => <Icon {...p}><path d="M3 6h18M3 12h12M3 18h18M3 24h9"/></Icon>,
  List: (p) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></Icon>,
  GripVertical: (p) => <Icon {...p}><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></Icon>,
  Info: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 12v5"/></Icon>,
  Slider: (p) => <Icon {...p}><path d="M3 8h18M3 16h18"/><circle cx="9" cy="8" r="2.5" fill="currentColor"/><circle cx="16" cy="16" r="2.5" fill="currentColor"/></Icon>,
  Play: (p) => <Icon {...p}><path d="m6 4 14 8-14 8z" fill="currentColor" stroke="none"/></Icon>,
  Pause: (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></Icon>,
  Copy: (p) => <Icon {...p}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></Icon>,
  Eye: (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Bell: (p) => <Icon {...p}><path d="M6 10a6 6 0 0 1 12 0v4l2 3H4l2-3z"/><path d="M10 21h4"/></Icon>,
  Mail: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>,
  ArrowRight: (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>,
  ArrowLeft: (p) => <Icon {...p}><path d="M19 12H5M11 5l-7 7 7 7"/></Icon>,
  ChevronRight: (p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  ChevronDown: (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  X: (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Leaf: (p) => <Icon {...p}><path d="M11 20A7 7 0 0 1 4 13V5h8a7 7 0 0 1 7 7v1a7 7 0 0 1-8 7z"/><path d="M5 21 19 7"/></Icon>,
  Pebble: (p) => <Icon {...p}><ellipse cx="12" cy="13" rx="8" ry="6"/><path d="M8 11c1-1 3-2 5-1" opacity="0.5"/></Icon>,
  Wind: (p) => <Icon {...p}><path d="M4 8h11a3 3 0 1 0-3-3"/><path d="M2 12h17a3 3 0 1 1-3 3"/><path d="M5 16h8"/></Icon>,
  Coffee: (p) => <Icon {...p}><path d="M4 8h14v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M18 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 2v3M12 2v3"/></Icon>,
  Moon2: (p) => <Icon {...p}><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></Icon>,
  Zap: (p) => <Icon {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></Icon>,
  Heart: (p) => <Icon {...p}><path d="M20.8 6.6a5 5 0 0 0-8.8-2.2A5 5 0 0 0 3.2 6.6c0 5 8.8 10.4 8.8 10.4s8.8-5.4 8.8-10.4z"/></Icon>,
  Layers: (p) => <Icon {...p}><path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/></Icon>,
  Download: (p) => <Icon {...p}><path d="M12 3v13M6 11l6 6 6-6M5 21h14"/></Icon>,
  Upload: (p) => <Icon {...p}><path d="M12 21V8M6 13l6-6 6 6M5 3h14"/></Icon>,
  Link: (p) => <Icon {...p}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></Icon>,
  Share: (p) => <Icon {...p}><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></Icon>,
  Tag: (p) => <Icon {...p}><path d="M20 12 12 4H4v8l8 8z"/><circle cx="8" cy="8" r="1.5"/></Icon>,
  Filter: (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></Icon>,
  GripVertical: (p) => <Icon {...p} stroke={1.8}><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></Icon>,
  Edit: (p) => <Icon {...p}><path d="M4 20h4l11-11-4-4L4 16z"/><path d="m13 5 4 4"/></Icon>,
  Trash: (p) => <Icon {...p}><path d="M4 6h16M9 6V4h6v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></Icon>,
  User: (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>,
  Lock: (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>,
  Shield: (p) => <Icon {...p}><path d="M12 3 4 6v6c0 4.5 3.2 8.6 8 10 4.8-1.4 8-5.5 8-10V6z"/></Icon>,
  Globe: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></Icon>,
  Palette: (p) => <Icon {...p}><path d="M12 3a9 9 0 0 0 0 18 2 2 0 0 0 2-2v-1a1 1 0 0 1 1-1h2a4 4 0 0 0 4-4 9 9 0 0 0-9-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16.5" cy="11" r="1"/></Icon>,
  Menu: (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16"/></Icon>,
  Play: (p) => <Icon {...p}><path d="M6 4v16l14-8z" fill="currentColor"/></Icon>,
  Pause: (p) => <Icon {...p}><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></Icon>,
  Star: (p) => <Icon {...p}><path d="m12 3 2.9 5.9L21 10l-4.5 4.4L17.8 21 12 17.8 6.2 21l1.3-6.6L3 10l6.1-1.1z"/></Icon>,
  MoreHorizontal: (p) => <Icon {...p}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></Icon>,
  Send: (p) => <Icon {...p}><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></Icon>,
  CornerDownRight: (p) => <Icon {...p}><path d="M4 4v7a4 4 0 0 0 4 4h13"/><path d="m17 11 4 4-4 4"/></Icon>,
  Book: (p) => <Icon {...p}><path d="M5 4a2 2 0 0 1 2-2h11v18H7a2 2 0 0 0-2 2z"/></Icon>,
  Trophy: (p) => <Icon {...p}><path d="M8 21h8M12 17v4M5 4h14v4a7 7 0 0 1-14 0z"/><path d="M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3"/></Icon>,
  Layout: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></Icon>,
  Refresh: (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Icon>,
};
window.I = I;

/* ---------- Mark + Wordmark ---------- */
const BrandMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block" }}>
    <defs>
      <linearGradient id={`bm${size}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#D97757"/><stop offset="100%" stopColor="#E8A87C"/>
      </linearGradient>
    </defs>
    <path d="M14 16 H50" stroke={`url(#bm${size})`} strokeWidth="5" strokeLinecap="round" fill="none"/>
    <path d="M32 16 V46" stroke={`url(#bm${size})`} strokeWidth="5" strokeLinecap="round" fill="none"/>
    <circle cx="42" cy="44" r="6" fill={`url(#bm${size})`}/>
  </svg>
);
const Wordmark = ({ size = 22, color = "var(--fg)" }) => (
  <span style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: size, letterSpacing: "-0.02em", color, display: "inline-flex", alignItems: "baseline", gap: size * 0.18 }}>
    Tempo<em style={{ fontStyle: "normal", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Flow</em>
  </span>
);

/* ---------- App context (nav, theme) ---------- */
const AppCtx = createContext(null);

const AppProvider = ({ children, initialScreen = "today" }) => {
  const [screen, setScreen] = useState(() => {
    try { return localStorage.getItem("tf-screen") || initialScreen; } catch { return initialScreen; }
  });
  // Theme is managed by the global TempoTheme controller (theme-controller.js).
  // We mirror its state here so React surfaces re-render on change.
  // `theme` = user pref ("light" | "dark" | "system"), `resolvedTheme` = actual applied.
  const T = (typeof window !== "undefined" && window.TempoTheme) || null;
  const [theme, _setTheme] = useState(() => T?.getTheme?.() || "system");
  const [resolvedTheme, setResolvedTheme] = useState(() => T?.getResolved?.() || "light");
  const [dyslexia, _setDyslexia] = useState(() => T?.getDyslexia?.() || "off");
  const [readAloud, _setReadAloud] = useState(() => T?.getReadAloud?.() || "off");
  const setTheme = (v) => { T?.setTheme?.(v); };
  const setDyslexia = (v) => { T?.setDyslexia?.(v); };
  const setReadAloud = (v) => { T?.setReadAloud?.(v); };
  useEffect(() => {
    const onChange = (e) => {
      _setTheme(e.detail.theme);
      setResolvedTheme(e.detail.resolvedTheme);
      _setDyslexia(e.detail.dyslexia);
      _setReadAloud(e.detail.readAloud);
    };
    window.addEventListener("tf-theme-change", onChange);
    return () => window.removeEventListener("tf-theme-change", onChange);
  }, []);
  useEffect(() => { try { localStorage.setItem("tf-screen", screen); } catch {} }, [screen]);
  const value = { screen, setScreen, theme, setTheme, resolvedTheme, dyslexia, setDyslexia, readAloud, setReadAloud };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};
const useApp = () => useContext(AppCtx);

/* ---------- Sidebar + Topbar ---------- */
const NAV = [
  { group: "Flow", items: [
    { id: "daily-note", label: "Daily Note", icon: "Notebook" },
    { id: "today", label: "Today", icon: "Home" },
    { id: "brain-dump", label: "Brain Dump", icon: "Sparkles" },
    { id: "coach", label: "Coach", icon: "Mic" },
    { id: "plan", label: "Planning", icon: "Layout" },
  ]},
  { group: "Library", items: [
    { id: "tasks", label: "Tasks", icon: "CheckSquare", badge: "12" },
    { id: "notes", label: "Notes", icon: "Notebook" },
    { id: "journal", label: "Journal", icon: "BookOpen" },
    { id: "calendar", label: "Calendar", icon: "Calendar" },
    { id: "habits", label: "Habits", icon: "Flame" },
    { id: "routines", label: "Routines", icon: "Repeat" },
    { id: "goals", label: "Goals", icon: "Target" },
    { id: "projects", label: "Projects", icon: "Folder" },
  ]},
  { group: "You", items: [
    { id: "analytics", label: "Insights", icon: "Chart" },
    { id: "templates", label: "Templates", icon: "Layers" },
    { id: "settings", label: "Settings", icon: "Settings" },
  ]},
];
window.NAV = NAV;

const Sidebar = () => {
  const { screen, setScreen } = useApp();
  return (
    <aside className="sidebar scroll-subtle">
      <div className="sidebar-brand">
        <BrandMark size={28}/>
        <span className="brand-name">Tempo<em>Flow</em></span>
      </div>
      {NAV.map(group => (
        <div className="sidebar-section" key={group.group}>
          <h4>{group.group}</h4>
          {group.items.map(item => {
            const Ic = I[item.icon];
            return (
              <button key={item.id}
                      className={"nav-item" + (screen === item.id ? " is-active" : "")}
                      onClick={() => setScreen(item.id)}>
                <Ic/>
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      ))}
      <div style={{ marginTop: "auto", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
        <button className="nav-item" onClick={() => setScreen("ask-founder")}>
          <I.Mail/><span>Ask the Founder</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", marginTop: "var(--space-2)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--gradient-tempo)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontFamily: "var(--font-serif)", fontWeight: 600 }}>A</div>
          <div style={{ lineHeight: 1.2, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Amit</div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Pro · 5-day streak</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ---------- Read-aloud indicator (floats bottom-left when speaking) ---------- */
const ReadAloudIndicator = () => {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    let raf;
    const tick = () => {
      try {
        const s = !!(window.speechSynthesis?.speaking);
        setSpeaking((prev) => prev === s ? prev : s);
      } catch {}
      raf = requestAnimationFrame(() => setTimeout(tick, 200));
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  if (!speaking) return null;
  return (
    <div style={{
      position:"fixed", bottom:20, left:20, zIndex:900,
      background:"var(--fg)", color:"var(--surface-card)",
      padding:"10px 14px 10px 12px", borderRadius:99,
      display:"flex", alignItems:"center", gap:10,
      boxShadow:"var(--shadow-lift)", fontSize:13, fontFamily:"var(--font-sans)",
    }}>
      <div style={{display:"flex", gap:3, alignItems:"flex-end", height:16}}>
        {[0,1,2,3].map(i => (
          <span key={i} style={{
            width:3, borderRadius:2, background:"var(--tempo-orange)",
            animation:`tfBar 0.9s ease-in-out ${i*0.12}s infinite alternate`,
            height: 6 + (i*2),
          }}/>
        ))}
      </div>
      <span>Reading aloud…</span>
      <button onClick={() => window.TempoTheme?.stopSpeaking?.()}
        style={{background:"transparent", border:"1px solid rgba(255,255,255,0.25)", color:"inherit",
                padding:"3px 10px", borderRadius:99, fontSize:11, cursor:"pointer", marginLeft:4}}>
        Stop
      </button>
      <style>{`@keyframes tfBar { 0%{transform:scaleY(0.4)} 100%{transform:scaleY(1.2)} }`}</style>
    </div>
  );
};

/* ---------- Listen button (small speaker icon next to headings) ---------- */
const ListenBtn = ({ text, size = 14 }) => {
  const { readAloud } = useApp();
  if (readAloud !== "on") return null;
  return (
    <button
      onClick={(e) => { e.preventDefault(); window.TempoTheme?.speak?.(text); }}
      aria-label="Listen"
      title="Listen"
      style={{
        background:"transparent", border:"none", padding:4, cursor:"pointer",
        color:"var(--fg-muted)", display:"inline-flex", alignItems:"center",
        borderRadius:6, marginLeft:6, verticalAlign:"middle",
      }}>
      <I.Volume size={size} stroke={1.6}/>
    </button>
  );
};

const Topbar = ({ title, crumb, right }) => {
  const { theme, setTheme, resolvedTheme } = useApp();
  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const label = theme === "system" ? `System (${resolvedTheme})` : theme[0].toUpperCase()+theme.slice(1);
  const ThemeIcon = theme === "system" ? I.Laptop || I.Sun : theme === "dark" ? I.Sun : I.Moon;
  return (
    <header className="topbar">
      <div className="breadcrumb">
        {crumb ? <span>{crumb} · </span> : null}<strong>{title}</strong>
      </div>
      <div className="spacer"/>
      {right}
      <button className="icon-btn" title="Search"><I.Search/></button>
      <button className="icon-btn" title="Notifications"><I.Bell/></button>
      <button className="icon-btn" title={`Theme: ${label} → ${nextTheme}`}
              onClick={() => setTheme(nextTheme)}>
        <ThemeIcon/>
      </button>
    </header>
  );
};

/* ---------- Ring ---------- */
const Ring = ({ pct = 0, size = 44, stroke = 3, label, color = "var(--tempo-orange)" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="ring-track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke}/>
        <circle className="ring-fill" cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
                style={{ stroke: color, strokeDasharray: c, strokeDashoffset: off }}/>
      </svg>
      {label != null && <span className="ring-label">{label}</span>}
    </span>
  );
};

/* ---------- Pill ---------- */
const Pill = ({ tone = "neutral", children, dot }) => {
  const cls = tone === "neutral" ? "pill" : `pill pill-${tone}`;
  return <span className={cls}>{dot && <span className="dot" style={dot === true ? {} : { background: dot }}/>} {children}</span>;
};

/* ---------- Task row ---------- */
const TaskRow = ({ task, onToggle }) => {
  return (
    <div className={"task-row" + (task.done ? " is-done" : "")} onClick={() => onToggle && onToggle(task.id)}>
      <button className="check" aria-label="Toggle"><I.Check size={12} stroke={2.5}/></button>
      <div className="task-main">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          {task.time && <><I.Clock size={12}/><span>{task.time}</span></>}
          {task.est && <span>· {task.est} min</span>}
          {task.energy && <Pill tone={task.energy === "high" ? "accent" : task.energy === "low" ? "slate" : "moss"}>{task.energy} energy</Pill>}
          {task.tag && <Pill tone="neutral"># {task.tag}</Pill>}
        </div>
      </div>
      {task.ai && <Pill tone="accent">AI</Pill>}
    </div>
  );
};

/* ---------- Coach bubble ---------- */
const CoachBubble = ({ children }) => (
  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
    <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--gradient-tempo)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600 }}>T</div>
    <div className="coach-bubble">{children}</div>
  </div>
);
const UserBubble = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <div className="user-bubble">{children}</div>
  </div>
);

/* ---------- Accept-reject strip ---------- */
const AcceptStrip = ({ text, onAccept, onTweak, onSkip }) => (
  <div className="accept-strip">
    <I.Sparkles size={16}/>
    <div className="strip-text">{text || "I think I can add this. Accept, tweak, or skip?"}</div>
    <button className="btn btn-sm btn-primary" onClick={onAccept}>Accept</button>
    <button className="btn btn-sm btn-outline" onClick={onTweak}>Tweak</button>
    <button className="btn btn-sm btn-ghost" onClick={onSkip}>Skip</button>
  </div>
);

/* ---------- Progress bar ---------- */
const ProgressBar = ({ pct = 0, tone = "tempo", height = 6 }) => {
  const color = tone === "moss" ? "var(--moss)" : tone === "amber" ? "var(--amber)" : "var(--tempo-orange)";
  return (
    <div style={{ width: "100%", height, background: "var(--surface-sunken)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", background: color, transition: "width 220ms var(--ease)" }}/>
    </div>
  );
};

/* ---------- Energy bar ---------- */
const EnergyBar = ({ level = 3 }) => (
  <div style={{ display: "inline-flex", gap: 3 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ width: 16, height: 6, borderRadius: 99, background: i <= level ? "var(--tempo-orange)" : "var(--border)" }}/>
    ))}
  </div>
);

/* ---------- Export to window ---------- */
Object.assign(window, {
  AppProvider, useApp, AppCtx,
  Sidebar, Topbar, BrandMark, Wordmark,
  Ring, Pill, TaskRow, CoachBubble, UserBubble, AcceptStrip, ProgressBar, EnergyBar,
  ReadAloudIndicator, ListenBtn,
});
