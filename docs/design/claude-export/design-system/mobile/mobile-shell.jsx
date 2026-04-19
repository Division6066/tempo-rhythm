/* ============================================================
   Tempo Flow — mobile web app screens (Part 1 of 2)
   Screens: Today · Tasks · Coach · Library · Settings
   Plus the global "chat ball" and mobile bottom tab bar.
   Built with the Soft Editorial tokens + NotePlan-style daily
   note paradigm for Today. PRD-driven feature set.
   ============================================================ */

// -------- Shared tokens (inline for isolation inside phone) ----
// `MT` is a *mutable* object. Flip the theme by calling setMTTheme("dark")
// before/as the page renders; all screens that read MT.* at render time
// pick up the new values because React re-renders on state change.
const MT_LIGHT = {
  cream:    "#f3ebe2",
  card:     "#fbf7f2",
  sunken:   "#efe6db",
  ink:      "#2a2520",
  muted:    "#6e6458",
  soft:     "#8a7f72",
  border:   "#e3d8c9",
  borderSoft:"rgba(0,0,0,0.06)",
  terracotta:"#D97757",
  terracottaDeep:"#C8643F",
  moss:     "#8fa571",
  clay:     "#C19A7B",
};
const MT_DARK = {
  cream:    "#18161A",    // page
  card:     "#221F1D",    // card — slightly warmer
  sunken:   "#15131A",    // sunken — deeper
  ink:      "#F3EBE2",    // foreground text
  muted:    "#A8A49F",
  soft:     "#7A7672",
  border:   "#2C2B28",
  borderSoft:"rgba(255,255,255,0.06)",
  terracotta:"#E8A87C",   // soft orange in dark
  terracottaDeep:"#D97757",
  moss:     "#A3B884",
  clay:     "#C19A7B",
};
const MT_FONTS = {
  serif:    'Fraunces, "Iowan Old Style", Georgia, serif',
  sans:     '-apple-system, "SF Pro Text", "Inter", system-ui, sans-serif',
  mono:     '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
};
// Mutable export. Mutating keys instead of replacing the ref keeps
// all existing `import { MT }` readers pointed at the same object.
const MT = { ...MT_LIGHT, ...MT_FONTS };
window.__setMTTheme = (theme) => {
  const next = theme === "dark" ? MT_DARK : MT_LIGHT;
  Object.keys(MT).forEach(k => { if (!(k in MT_FONTS)) delete MT[k]; });
  Object.assign(MT, next, MT_FONTS);
};

// ---- tiny icon set (stroke, 1.75) ----
const m = (props) => (
  <svg width={props.size||18} height={props.size||18} viewBox="0 0 24 24"
       fill="none" stroke={props.c||"currentColor"} strokeWidth={props.sw||1.75}
       strokeLinecap="round" strokeLinejoin="round" style={props.style}>{props.children}</svg>
);
const MI = {
  check:  (p)=>m({...p, children:<path d="M20 6 9 17l-5-5"/>}),
  plus:   (p)=>m({...p, children:<><path d="M12 5v14"/><path d="M5 12h14"/></>}),
  search: (p)=>m({...p, children:<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>}),
  sparkles:(p)=>m({...p, children:<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>}),
  mic:    (p)=>m({...p, children:<><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/></>}),
  send:   (p)=>m({...p, children:<><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></>}),
  home:   (p)=>m({...p, children:<><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></>}),
  list:   (p)=>m({...p, children:<><path d="M4 6h16M4 12h16M4 18h16"/></>}),
  book:   (p)=>m({...p, children:<><path d="M5 4a2 2 0 0 1 2-2h11v18H7a2 2 0 0 0-2 2z"/></>}),
  cog:    (p)=>m({...p, children:<><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>}),
  flame:  (p)=>m({...p, children:<path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-2-1-3-2-5 2 3 4 5 4 9a8 8 0 0 1-16 0c0-5 5-6 8-11z"/>}),
  chevL:  (p)=>m({...p, children:<path d="m15 6-6 6 6 6"/>}),
  chevR:  (p)=>m({...p, children:<path d="m9 6 6 6-6 6"/>}),
  circle: (p)=>m({...p, children:<circle cx="12" cy="12" r="9"/>}),
  circleDone:(p)=>m({...p, children:<><circle cx="12" cy="12" r="9" fill={p?.c||"#8fa571"} stroke="none"/><path d="M8 12l3 3 5-6" stroke="#fff"/></>}),
  tag:    (p)=>m({...p, children:<><path d="M20 12 12 20l-9-9V3h8l9 9z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></>}),
  clock:  (p)=>m({...p, children:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}),
  calendar:(p)=>m({...p, children:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>}),
  brain:  (p)=>m({...p, children:<><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.5A3 3 0 0 0 7 19a3 3 0 0 0 5 .5 3 3 0 0 0 5-.5 3 3 0 0 0 2-5.5A3 3 0 0 0 18 8V7a3 3 0 0 0-3-3 3 3 0 0 0-3 1.5A3 3 0 0 0 9 4z"/></>}),
  bullseye:(p)=>m({...p, children:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>}),
  repeat: (p)=>m({...p, children:<><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>}),
  folder: (p)=>m({...p, children:<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>}),
  template:(p)=>m({...p, children:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>}),
  note:   (p)=>m({...p, children:<><path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6"/></>}),
  journal:(p)=>m({...p, children:<><path d="M4 4a2 2 0 0 1 2-2h12v20H6a2 2 0 0 1-2-2z"/><path d="M9 7h8M9 11h8M9 15h5"/></>}),
  star:   (p)=>m({...p, children:<path d="m12 3 2.9 5.9L21 10l-4.5 4.4L17.8 21 12 17.8 6.2 21l1.3-6.6L3 10l6.1-1.1z"/>}),
  bell:   (p)=>m({...p, children:<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></>}),
  x:      (p)=>m({...p, children:<path d="M18 6 6 18M6 6l12 12"/>}),
  close:  (p)=>m({...p, children:<path d="M18 6 6 18M6 6l12 12"/>}),
  sun:    (p)=>m({...p, children:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>}),
  moon:   (p)=>m({...p, children:<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>}),
  dots:   (p)=>m({...p, children:<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>}),
  battery:(p)=>m({...p, children:<><path d="M4 9v6M20 10v4"/><rect x="6" y="7" width="12" height="10" rx="2"/></>}),
  bolt:   (p)=>m({...p, children:<path d="m13 2-8 12h6l-1 8 8-12h-6z"/>}),
  chat:   (p)=>m({...p, children:<><path d="M4 12a8 8 0 0 1 8-8h0a8 8 0 0 1 8 8v0a8 8 0 0 1-8 8H7l-3 2v-2.4A8 8 0 0 1 4 12z"/><circle cx="9" cy="12" r="0.7" fill="currentColor"/><circle cx="12.5" cy="12" r="0.7" fill="currentColor"/><circle cx="16" cy="12" r="0.7" fill="currentColor"/></>}),
};

// ============================================================
// PhoneShell — a status bar, content area, optional bottom tabs,
// and the persistent Tempo chat ball in the bottom-right.
// ============================================================
const TimeLabel = ({ t = "9:41", dark }) => (
  <div style={{
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"14px 28px 6px", color:dark?"#fff":MT.ink,
    fontFamily:MT.sans, fontSize:15, fontWeight:600, letterSpacing:"-0.01em",
  }}>
    <span>{t}</span>
    <div style={{display:"flex",gap:5,alignItems:"center", opacity:0.95}}>
      {/* signal */}
      <svg width="17" height="10" viewBox="0 0 17 10">
        <rect x="0" y="6.5" width="2.6" height="3.5" rx="0.6" fill="currentColor"/>
        <rect x="4" y="4.5" width="2.6" height="5.5" rx="0.6" fill="currentColor"/>
        <rect x="8" y="2.5" width="2.6" height="7.5" rx="0.6" fill="currentColor"/>
        <rect x="12" y="0" width="2.6" height="10" rx="0.6" fill="currentColor"/>
      </svg>
      {/* wifi */}
      <svg width="15" height="10" viewBox="0 0 17 11"><path d="M8.5 3.2A9 9 0 0 1 14.4 5.4L15.5 4.3A11 11 0 0 0 8.5 1.5 11 11 0 0 0 1.5 4.3L2.6 5.4A9 9 0 0 1 8.5 3.2zM8.5 6.8A5 5 0 0 1 12 8l1.1-1.1A7 7 0 0 0 8.5 5a7 7 0 0 0-4.6 1.9L5 8A5 5 0 0 1 8.5 6.8z" fill="currentColor"/><circle cx="8.5" cy="10" r="1.2" fill="currentColor"/></svg>
      {/* battery */}
      <svg width="24" height="11" viewBox="0 0 24 11">
        <rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" strokeOpacity="0.4" fill="none"/>
        <rect x="2" y="2" width="15.5" height="7" rx="1.5" fill="currentColor"/>
        <rect x="21.5" y="3.5" width="2" height="4" rx="0.6" fill="currentColor" opacity="0.5"/>
      </svg>
    </div>
  </div>
);

const HomeBar = ({dark}) => (
  <div style={{
    position:"absolute", bottom:0, left:0, right:0, height:22,
    display:"flex", justifyContent:"center", alignItems:"flex-end",
    paddingBottom:7, pointerEvents:"none", zIndex:60,
  }}>
    <div style={{width:120, height:4, borderRadius:99, background: dark?"rgba(255,255,255,0.65)":"rgba(0,0,0,0.28)"}}/>
  </div>
);

const DynamicIsland = () => (
  <div style={{
    position:"absolute", top:9, left:"50%", transform:"translateX(-50%)",
    width:104, height:30, borderRadius:20, background:"#000", zIndex:50,
  }}/>
);

// ============================================================
// Bottom tab bar — PRD: Today / Tasks / Coach / Library / Settings
// ============================================================
const TabBar = ({active="today", onChange, coachMode}) => {
  const isDarkTheme = window.__tfMobileTheme === "dark";
  const tabs = [
    {id:"today",    label:"Today",    icon: MI.home},
    {id:"tasks",    label:"Tasks",    icon: MI.list},
    {id:"coach",    label:"Coach",    icon: MI.sparkles, big:true},
    {id:"library",  label:"Library",  icon: MI.book},
    {id:"settings", label:"Settings", icon: MI.cog},
  ];
  return (
    <div style={{
      position:"absolute", bottom:0, left:0, right:0, height:80,
      paddingBottom:22, paddingTop:8,
      background: `rgba(${isDarkTheme?"24,22,26":"251,247,242"},0.82)`,
      backdropFilter:"blur(20px) saturate(180%)",
      WebkitBackdropFilter:"blur(20px) saturate(180%)",
      borderTop:`1px solid ${isDarkTheme?"rgba(255,255,255,0.08)":MT.border}`,
      display:"flex", alignItems:"center", justifyContent:"space-around",
      zIndex:40, fontFamily:MT.sans,
    }}>
      {tabs.map(t=>{
        const isActive = t.id===active;
        const Icon = t.icon;
        const color = isActive ? MT.terracotta : MT.soft;
        if(t.big){
          // Coach — special rounded accent that doubles as the walkie-talkie entry
          return (
            <button key={t.id} onClick={()=>onChange?.(t.id)} style={{
              border:"none", background:"transparent", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              padding:"2px 4px",
            }}>
              <div style={{
                width:46, height:30, borderRadius:14,
                background: isActive
                  ? `linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`
                  : "transparent",
                border: isActive ? "none" : `1.5px solid ${MT.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color: isActive? "#fff" : MT.soft, marginTop:-2,
                boxShadow: isActive? "0 6px 12px -4px rgba(217,119,87,0.45)":"none",
              }}>
                <Icon size={17} c="currentColor"/>
              </div>
              <span style={{fontSize:10, color, fontWeight:500}}>{t.label}</span>
            </button>
          );
        }
        return (
          <button key={t.id} onClick={()=>onChange?.(t.id)} style={{
            border:"none", background:"transparent", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            padding:"4px 6px",
          }}>
            <Icon size={22} c={color}/>
            <span style={{fontSize:10, color, fontWeight: isActive?600:500, fontFamily:MT.sans}}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================
// Chat ball — small floating coach button. Tap to open panel.
// Positioned above the bottom tab bar so it never overlaps.
// ============================================================
const ChatBall = ({ open, onToggle, hideOnTab }) => {
  if (hideOnTab) return null;
  return (
    <button onClick={onToggle} aria-label="Open coach" style={{
      position:"absolute", right:18, bottom: 96,
      width:54, height:54, borderRadius:99, border:"none",
      background:`linear-gradient(135deg, #E08968, ${MT.terracottaDeep})`,
      color:"#fff", cursor:"pointer", zIndex:45,
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:"0 12px 28px -8px rgba(217,119,87,0.55), 0 2px 6px rgba(0,0,0,0.1)",
    }}>
      {/* breathing ring */}
      {!open && <span style={{
        position:"absolute", inset:-4, borderRadius:99,
        border:"1.5px solid rgba(217,119,87,0.35)",
        animation:"mball-breath 4.2s ease-in-out infinite",
      }}/>}
      {open ? <MI.close size={20} c="#fff" sw={2}/> : <MI.chat size={22} c="#fff"/>}
      {!open && <span style={{
        position:"absolute", top:5, right:6, width:9, height:9, borderRadius:99,
        background: MT.moss, boxShadow:`0 0 0 2px ${MT.card}`,
      }}/>}
    </button>
  );
};

// ============================================================
// PhoneShell wrapper — one device, one screen in it.
// `showTabs` and `showChatBall` let preauth screens opt out.
// ============================================================
const PhoneShell = ({ label, dark=false, children, tab="today", onTab, showTabs=true, showChatBall=true, statusDark }) => {
  const [coachOpen, setCoachOpen] = React.useState(false);
  const isDarkTheme = window.__tfMobileTheme === "dark";
  const bg = dark ? "#1a1612" : MT.cream;
  const statusIsDark = statusDark ?? (dark || isDarkTheme);
  return (
    <div style={{position:"relative"}}>
      {label && (
        <div style={{
          position:"absolute", bottom:"100%", left:0, paddingBottom:10,
          fontFamily:MT.mono, fontSize:11, color:"rgba(60,50,40,0.7)", whiteSpace:"nowrap",
          letterSpacing:"0.02em",
        }}>{label}</div>
      )}
      <div style={{
        width: 390, height: 844, borderRadius:52, overflow:"hidden",
        position:"relative", background: bg,
        boxShadow:"0 40px 80px rgba(60,40,20,0.22), 0 0 0 1px rgba(0,0,0,0.1)",
        fontFamily:MT.sans, color: dark?"#fff":MT.ink, WebkitFontSmoothing:"antialiased",
      }}>
        <DynamicIsland/>
        <div style={{position:"absolute", top:0, left:0, right:0, zIndex:30, color: statusDark ?? dark ? "#fff" : MT.ink}}>
          <TimeLabel dark={statusDark ?? dark}/>
        </div>
        <div style={{
          position:"absolute", inset:0,
          paddingTop: 44, paddingBottom: showTabs ? 80 : 0,
          display:"flex", flexDirection:"column", overflow:"hidden",
        }}>
          {children}
        </div>
        {showTabs && <TabBar active={tab} onChange={onTab}/>}
        <ChatBall open={coachOpen} onToggle={()=>setCoachOpen(o=>!o)} hideOnTab={!showChatBall}/>
        {coachOpen && <CoachPanel onClose={()=>setCoachOpen(false)}/>}
        <HomeBar dark={dark}/>
      </div>
    </div>
  );
};

// ============================================================
// CoachPanel — the mobile variant of the floating coach dock.
// Slides up from bottom; full-width; houses Chat + Brain dump tabs.
// ============================================================
const CoachPanel = ({ onClose }) => {
  const [tab, setTab] = React.useState("chat");
  return (
    <>
      <div onClick={onClose} style={{
        position:"absolute", inset:0, background:"rgba(30,22,14,0.28)",
        backdropFilter:"blur(3px)", zIndex:48,
        animation:"mball-fade 200ms ease forwards",
      }}/>
      <div style={{
        position:"absolute", left:0, right:0, bottom:0, zIndex:49,
        height:"72%", background:MT.card,
        borderTopLeftRadius:28, borderTopRightRadius:28,
        boxShadow:"0 -20px 48px -12px rgba(60,40,20,0.3)",
        display:"flex", flexDirection:"column", overflow:"hidden",
        animation:"mball-slide 280ms cubic-bezier(0.2,0.9,0.25,1.05) forwards",
      }}>
        {/* grab handle */}
        <div style={{display:"flex", justifyContent:"center", padding:"10px 0 6px"}}>
          <div style={{width:36, height:4, borderRadius:99, background:MT.border}}/>
        </div>
        {/* header */}
        <div style={{padding:"4px 18px 10px", display:"flex", alignItems:"center", gap:10}}>
          <div style={{
            width:32,height:32,borderRadius:99,
            background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`,
            color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:MT.serif, fontSize:15, fontWeight:600,
          }}>T</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:14, fontWeight:500, color:MT.ink}}>Tempo Coach</div>
            <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted}}>warmth 6/10 · scope: Today</div>
          </div>
          <button onClick={onClose} style={{
            width:30, height:30, borderRadius:99, border:"none", background:"transparent",
            color:MT.muted, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          }}><MI.close size={14}/></button>
        </div>
        {/* tabs */}
        <div style={{display:"flex", gap:4, padding:"0 14px", borderBottom:`1px solid ${MT.borderSoft}`}}>
          {[{id:"chat",l:"Chat"},{id:"dump",l:"Brain dump"}].map(t=>{
            const active = t.id===tab;
            return <button key={t.id} onClick={()=>setTab(t.id)} style={{
              border:"none", background:"transparent", padding:"10px 12px",
              fontFamily:MT.mono, fontSize:11, letterSpacing:"0.04em",
              color: active ? MT.ink : MT.muted,
              borderBottom: active ? `2px solid ${MT.terracotta}` : "2px solid transparent",
              marginBottom:-1, cursor:"pointer",
            }}>{t.l}</button>;
          })}
        </div>
        {/* body */}
        {tab==="chat" ? (
          <div style={{flex:1, minHeight:0, display:"flex", flexDirection:"column"}}>
            <div style={{flex:1, minHeight:0, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10}}>
              <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, textAlign:"center", letterSpacing:"0.06em", textTransform:"uppercase"}}>Thursday · 9:47 AM</div>
              <div style={{display:"flex",gap:8, alignItems:"flex-start"}}>
                <div style={{width:22,height:22,borderRadius:99,background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, color:"#fff", display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MT.serif,fontSize:11,fontWeight:600,flexShrink:0}}>T</div>
                <div style={{background:MT.sunken, padding:"10px 14px", borderRadius:"14px 14px 14px 4px", fontFamily:MT.serif, fontSize:14, lineHeight:1.5, maxWidth:260, color:MT.ink}}>
                  I'm here. What's up right now — a question, a worry, or a thing to capture?
                </div>
              </div>
              <div style={{display:"flex", justifyContent:"flex-end"}}>
                <div style={{background:MT.terracotta, color:"#fff", padding:"10px 14px", borderRadius:"14px 14px 4px 14px", fontSize:14, lineHeight:1.5, maxWidth:240}}>
                  I forgot to submit the expense report again.
                </div>
              </div>
              <div style={{display:"flex",gap:8, alignItems:"flex-start"}}>
                <div style={{width:22,height:22,borderRadius:99,background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, color:"#fff", display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MT.serif,fontSize:11,fontWeight:600,flexShrink:0}}>T</div>
                <div style={{background:MT.sunken, padding:"10px 14px", borderRadius:"14px 14px 14px 4px", fontFamily:MT.serif, fontSize:14, lineHeight:1.5, maxWidth:260, color:MT.ink}}>
                  Okay. Not a big deal — let's put it on your plate at a gentle time. Should I stage it for tomorrow 10am, right after standup?
                </div>
              </div>
            </div>
            <div style={{padding:"0 16px 8px", display:"flex", gap:6, flexWrap:"wrap"}}>
              {["Stage it ✓","Remind me tonight","Teach me a fix"].map(p=>(
                <span key={p} style={{border:`1px solid ${MT.border}`, background:"transparent", padding:"5px 10px", borderRadius:99, fontSize:11, fontFamily:MT.mono, color:MT.muted}}>{p}</span>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${MT.border}`, padding:"10px 12px 14px", display:"flex", gap:8, alignItems:"flex-end", background:MT.card}}>
              <div style={{flex:1, border:`1px solid ${MT.border}`, borderRadius:22, padding:"8px 14px", background:MT.cream, fontSize:14, color:MT.muted, fontFamily:MT.sans}}>Type or hold mic…</div>
              <button style={{width:40, height:40, borderRadius:99, border:`1px solid ${MT.border}`, background:MT.cream, color:MT.muted, display:"flex",alignItems:"center",justifyContent:"center"}}><MI.mic size={16}/></button>
              <button style={{width:40, height:40, borderRadius:99, border:"none", background:MT.terracotta, color:"#fff", display:"flex",alignItems:"center",justifyContent:"center"}}><MI.send size={15}/></button>
            </div>
          </div>
        ) : (
          <div style={{flex:1, minHeight:0, display:"flex", flexDirection:"column"}}>
            <div style={{padding:"14px 20px 6px"}}>
              <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6}}>Brain dump</div>
              <div style={{fontFamily:MT.serif, fontSize:17, lineHeight:1.35, color:MT.ink, textWrap:"pretty"}}>Get it out of your head. No structure. I'll read it and offer to triage.</div>
            </div>
            <div style={{flex:1, padding:"6px 18px 10px"}}>
              <div style={{
                height:"100%", width:"100%", border:`1px solid ${MT.borderSoft}`,
                borderRadius:14, padding:"12px 14px", background:MT.cream,
                fontFamily:MT.serif, fontSize:14, lineHeight:1.6, color:MT.muted,
              }}>
                <div>expense report overdue</div>
                <div>maya's bday sunday — gift??</div>
                <div>ask sam about convex auth</div>
                <div>tempo landing copy still bad</div>
                <div>feel foggy after 3pm lately</div>
              </div>
            </div>
            <div style={{borderTop:`1px solid ${MT.border}`, padding:"10px 14px 14px", display:"flex", alignItems:"center", gap:8, background:MT.card}}>
              <span style={{fontFamily:MT.mono, fontSize:11, color:MT.muted}}>21 words · 5 fragments</span>
              <div style={{flex:1}}/>
              <button style={{background:MT.terracotta, color:"#fff", border:"none", padding:"8px 14px", borderRadius:99, fontSize:12, fontWeight:500, fontFamily:MT.mono, display:"flex", alignItems:"center", gap:6}}>
                <MI.sparkles size={12}/> Triage
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

Object.assign(window, { MT, MI, PhoneShell, TabBar, ChatBall, CoachPanel });
