/* ============================================================
   Tempo Flow — mobile screens · Part B
   Coach · Library · Notes · Journal · Habits · Goals
   Templates · Template Editor · Settings · Onboarding
   ============================================================ */

// ---------- Coach (full screen, PRD Screen 12) ----------
const MobileCoachScreen = () => {
  return (
    <div style={{flex:1, display:"flex", flexDirection:"column"}}>
      <div style={{padding:"12px 16px 8px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${MT.borderSoft}`}}>
        <div style={{width:36,height:36,borderRadius:99,background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, color:"#fff", display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MT.serif,fontSize:16,fontWeight:600}}>T</div>
        <div style={{flex:1}}>
          <div style={{fontSize:15, fontWeight:500, color:MT.ink}}>Tempo Coach</div>
          <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted}}>warmth 6/10 · scope: Today + Tempo project</div>
        </div>
        <span style={{fontSize:10, fontFamily:MT.mono, padding:"3px 8px", borderRadius:99, background:MT.sunken, color:MT.moss, display:"flex", alignItems:"center", gap:4}}>
          <span style={{width:5,height:5,borderRadius:99,background:MT.moss}}/> walkie
        </span>
      </div>

      <div style={{flex:1, overflowY:"auto", padding:"14px 14px", display:"flex", flexDirection:"column", gap:12}}>
        <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, textAlign:"center", letterSpacing:"0.08em", textTransform:"uppercase"}}>Thu · 9:47 AM</div>

        <CBubble who="coach">Morning. I saw you dumped five things earlier. Three look like worries about shipping — want to talk about those, or should I stage the tasks first?</CBubble>
        <CBubble who="me">Stage the tasks. I'll come back to the worries tonight.</CBubble>
        <CBubble who="coach">Good. I'll add <em>Finish landing copy</em>, <em>Book dentist</em>, and <em>Ask Sam about Convex</em> to today. The dentist is quick — five minutes. Can we try it after your walk?</CBubble>
        <CBubble who="me">Sure. Keep it gentle.</CBubble>
        <CBubble who="coach">Always. One small note — you've mentioned shipping speed three times this week. It might be worth fifteen minutes of journal time on Friday. I'll leave a gentle prompt, not a task.</CBubble>

        {/* action extraction card */}
        <div style={{margin:"4px 4px 0", padding:"10px 12px", background:MT.card, borderRadius:14, border:`1px solid ${MT.border}`}}>
          <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6}}>Extract · 3 tasks</div>
          {["Finish landing copy","Book dentist","Ask Sam about Convex"].map(t=>(
            <div key={t} style={{display:"flex", alignItems:"center", gap:8, padding:"4px 0", fontSize:13, color:MT.ink}}>
              <span style={{width:14,height:14,borderRadius:99,border:`1.5px solid ${MT.border}`}}/> {t}
            </div>
          ))}
          <div style={{display:"flex", gap:6, marginTop:8}}>
            <span style={{fontSize:11, fontFamily:MT.mono, padding:"5px 10px", borderRadius:99, background:MT.terracotta, color:"#fff"}}>Add all to today</span>
            <span style={{fontSize:11, fontFamily:MT.mono, padding:"5px 10px", borderRadius:99, background:MT.sunken, color:MT.muted}}>Review each</span>
          </div>
        </div>
      </div>

      {/* composer with push-to-talk */}
      <div style={{padding:"8px 14px 16px", background:MT.card, borderTop:`1px solid ${MT.border}`, display:"flex", flexDirection:"column", gap:8}}>
        <div style={{display:"flex", gap:6, overflowX:"auto"}}>
          {["Stage tasks","Draft journal prompt","Review this week","What did I dodge?"].map(p=>(
            <span key={p} style={{fontSize:11, fontFamily:MT.mono, padding:"5px 11px", borderRadius:99, border:`1px solid ${MT.border}`, color:MT.muted, whiteSpace:"nowrap"}}>{p}</span>
          ))}
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <div style={{flex:1, border:`1px solid ${MT.border}`, borderRadius:22, padding:"10px 16px", background:MT.cream, fontSize:14, color:MT.muted, fontFamily:MT.sans}}>Type, or hold mic to dictate…</div>
          <button style={{width:44,height:44,borderRadius:99,border:"none",background:MT.terracotta, color:"#fff", display:"flex",alignItems:"center",justifyContent:"center", boxShadow:"0 6px 14px -4px rgba(217,119,87,0.5)"}}>
            <MI.mic size={18} c="#fff"/>
          </button>
        </div>
      </div>
    </div>
  );
};
const CBubble = ({who, children}) => who==="coach" ? (
  <div style={{display:"flex",gap:8, alignItems:"flex-start", paddingRight:30}}>
    <div style={{width:22,height:22,borderRadius:99,background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, color:"#fff", display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MT.serif,fontSize:11,fontWeight:600,flexShrink:0}}>T</div>
    <div style={{background:MT.sunken, padding:"10px 14px", borderRadius:"14px 14px 14px 4px", fontFamily:MT.serif, fontSize:14, lineHeight:1.5, color:MT.ink}}>{children}</div>
  </div>
) : (
  <div style={{display:"flex", justifyContent:"flex-end", paddingLeft:30}}>
    <div style={{background:MT.terracotta, color:"#fff", padding:"10px 14px", borderRadius:"14px 14px 4px 14px", fontSize:14, lineHeight:1.5}}>{children}</div>
  </div>
);

// ---------- Library (PRD Screen 20) — tabs: Prompts, Recipes, Routines, Formats, References ----------
const MobileLibrary = () => {
  return (
    <div style={{flex:1, overflowY:"auto", padding:"4px 0 20px"}}>
      <div style={{padding:"8px 18px 12px"}}>
        <div style={{fontFamily:MT.serif, fontSize:32, fontWeight:500, color:MT.ink, letterSpacing:"-0.01em", marginBottom:4}}>Library</div>
        <div style={{fontSize:13, color:MT.muted, marginBottom:12}}>Reusable pieces: prompts, recipes, routines, formats, references.</div>
      </div>

      {/* quick filters */}
      <div style={{padding:"0 14px 14px", display:"flex", gap:6, overflowX:"auto"}}>
        {[
          {l:"All", n:42, active:true},
          {l:"Prompts", n:18},
          {l:"Routines", n:6},
          {l:"Recipes", n:9},
          {l:"Formats", n:4},
          {l:"References", n:5},
        ].map((p,i)=>(
          <span key={i} style={{
            padding:"7px 13px", borderRadius:99, fontSize:12, fontFamily:MT.mono, whiteSpace:"nowrap",
            background: p.active ? MT.ink : MT.card, color: p.active ? MT.card : MT.ink,
            border: p.active ? "none" : `1px solid ${MT.border}`,
          }}>{p.l} <span style={{opacity:0.6, marginLeft:4}}>{p.n}</span></span>
        ))}
      </div>

      <div style={{margin:"0 14px"}}>
        {[
          {type:"Routine",  title:"Morning shutdown", meta:"5 steps · used daily", color:MT.moss, icon:MI.repeat},
          {type:"Prompt",   title:"Unstuck-me (exec dysfn)", meta:"used 23× · last Tue", color:MT.terracotta, icon:MI.sparkles},
          {type:"Recipe",   title:"Weekly review · Friday", meta:"12 min · 9 prompts", color:MT.clay, icon:MI.book},
          {type:"Format",   title:"Meeting note · 1-pager", meta:"last used Mon", color:MT.ink, icon:MI.note},
          {type:"Reference",title:"Convex auth notes", meta:"linked to 4 tasks", color:MT.soft, icon:MI.folder},
          {type:"Prompt",   title:"Ask me what I'm avoiding", meta:"used 6×", color:MT.terracotta, icon:MI.sparkles},
        ].map((it,i)=>{
          const Icon = it.icon;
          return (
            <div key={i} style={{padding:"12px 14px", background:MT.card, borderRadius:14, border:`1px solid ${MT.border}`, marginBottom:8, display:"flex", gap:12, alignItems:"center"}}>
              <div style={{width:36, height:36, borderRadius:10, background: `${it.color}22`, color: it.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                <Icon size={18} c={it.color}/>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:2}}>
                  <span style={{fontFamily:MT.mono, fontSize:9, letterSpacing:"0.08em", textTransform:"uppercase", color:it.color}}>{it.type}</span>
                </div>
                <div style={{fontFamily:MT.serif, fontSize:15, fontWeight:500, color:MT.ink, lineHeight:1.25}}>{it.title}</div>
                <div style={{fontSize:11, fontFamily:MT.mono, color:MT.muted, marginTop:2}}>{it.meta}</div>
              </div>
              <MI.chevR size={16} c={MT.soft}/>
            </div>
          );
        })}
      </div>

      {/* secondary navigation — quick access to Habits / Goals / Notes / Journal */}
      <div style={{margin:"6px 14px 0", padding:"4px 4px"}}>
        <div style={{fontFamily:MT.mono, fontSize:10, letterSpacing:"0.1em", color:MT.muted, textTransform:"uppercase", padding:"8px 4px"}}>Also in library</div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
          {[
            {l:"Notes", icon:MI.note, n:"28"},
            {l:"Journal", icon:MI.journal, n:"34 entries"},
            {l:"Habits", icon:MI.repeat, n:"6 · 7d streak"},
            {l:"Goals", icon:MI.bullseye, n:"4 active"},
            {l:"Projects", icon:MI.folder, n:"3"},
            {l:"Templates", icon:MI.template, n:"12"},
          ].map((it,i)=>{
            const Icon = it.icon;
            return (
              <div key={i} style={{padding:"12px 14px", background:MT.card, borderRadius:14, border:`1px solid ${MT.border}`}}>
                <Icon size={18} c={MT.muted}/>
                <div style={{fontFamily:MT.serif, fontSize:15, fontWeight:500, color:MT.ink, marginTop:6}}>{it.l}</div>
                <div style={{fontSize:11, fontFamily:MT.mono, color:MT.muted, marginTop:2}}>{it.n}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------- Journal (PRD Screen 6 — separate from Notes) ----------
const MobileJournal = () => {
  return (
    <div style={{flex:1, overflowY:"auto", padding:"4px 0 20px"}}>
      <div style={{padding:"8px 18px 6px", display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <div>
          <div style={{fontFamily:MT.serif, fontSize:32, fontWeight:500, color:MT.ink, letterSpacing:"-0.01em"}}>Journal</div>
          <div style={{fontSize:12, color:MT.muted, fontFamily:MT.mono, marginTop:2}}>34 entries · 🔒 end-to-end encrypted</div>
        </div>
        <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
          <span style={{fontFamily:MT.serif, fontSize:24, fontWeight:500, color:MT.terracotta}}>12</span>
          <span style={{fontFamily:MT.mono, fontSize:9, color:MT.muted, letterSpacing:"0.08em", textTransform:"uppercase"}}>day streak</span>
        </div>
      </div>

      {/* prompt card (daily) */}
      <div style={{margin:"14px 14px 0", padding:"16px 18px", background:"linear-gradient(135deg, rgba(193,154,123,0.15), rgba(143,165,113,0.1))", borderRadius:18, border:`1px solid ${MT.border}`}}>
        <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6}}>Morning intention · Thu</div>
        <div style={{fontFamily:MT.serif, fontSize:17, fontWeight:500, lineHeight:1.35, color:MT.ink, textWrap:"pretty", marginBottom:10}}>If today goes well — not perfectly, just well — what did I spend time on?</div>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <span style={{fontSize:11, fontFamily:MT.mono, padding:"6px 12px", borderRadius:99, background:MT.card, color:MT.ink, border:`1px solid ${MT.border}`}}>Start writing</span>
          <span style={{fontSize:11, fontFamily:MT.mono, color:MT.muted}}>or tap to dismiss</span>
        </div>
      </div>

      {/* feed */}
      <div style={{margin:"14px 14px 0", display:"flex", flexDirection:"column", gap:10}}>
        {[
          {date:"Wed · Apr 17", mood:"foggy", excerpt:"Started strong, lost the thread after lunch. Kept coming back to the shipping worry — it's really just fear of being judged for the copy.", tags:["#work","#fear"]},
          {date:"Tue · Apr 16", mood:"okay", excerpt:"Slept fine for once. The meds timing is working better at 8am than 7am. Need to protect my morning — that's when I think best.", tags:["#body","#pattern"]},
          {date:"Mon · Apr 15", mood:"bright", excerpt:"The walk with Maya helped. She laughed at my launch anxiety and that made it smaller.", tags:["#friends"]},
        ].map((e,i)=>(
          <div key={i} style={{padding:"14px 16px", background:MT.card, borderRadius:16, border:`1px solid ${MT.border}`}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <span style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.06em", textTransform:"uppercase"}}>{e.date}</span>
              <span style={{fontSize:10, fontFamily:MT.mono, padding:"3px 9px", borderRadius:99, background:MT.sunken, color:MT.muted}}>mood · {e.mood}</span>
            </div>
            <div style={{fontFamily:MT.serif, fontSize:14, lineHeight:1.55, color:MT.ink, textWrap:"pretty"}}>{e.excerpt}</div>
            <div style={{display:"flex", gap:6, marginTop:8}}>
              {e.tags.map(t=><span key={t} style={{fontSize:10, fontFamily:MT.mono, color:MT.soft}}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Template Editor (PRD Screen 23) — dual mode NL / sketch ----------
const MobileTemplateEditor = () => {
  return (
    <div style={{flex:1, overflowY:"auto", padding:"4px 0 20px"}}>
      <div style={{padding:"8px 18px 6px", display:"flex", alignItems:"center", gap:10}}>
        <button style={{width:32,height:32,borderRadius:99,border:`1px solid ${MT.border}`, background:"transparent", display:"flex",alignItems:"center",justifyContent:"center", color:MT.muted}}><MI.chevL size={16}/></button>
        <div>
          <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.08em", textTransform:"uppercase"}}>Template editor</div>
          <div style={{fontFamily:MT.serif, fontSize:22, fontWeight:500, color:MT.ink, lineHeight:1.1}}>Describe it.</div>
        </div>
      </div>

      {/* mode switch */}
      <div style={{padding:"10px 14px"}}>
        <div style={{display:"flex", gap:4, padding:4, background:MT.sunken, borderRadius:12}}>
          {["Natural language","Picture sketch"].map((m,i)=>(
            <span key={m} style={{flex:1, padding:"8px 10px", textAlign:"center", fontFamily:MT.mono, fontSize:11, borderRadius:9, background: i===0?MT.card:"transparent", color: i===0?MT.ink:MT.muted, fontWeight: i===0?500:400, border: i===0?`1px solid ${MT.border}`:"none"}}>{m}</span>
          ))}
        </div>
      </div>

      {/* prompt input */}
      <div style={{padding:"4px 14px 0"}}>
        <div style={{background:MT.card, border:`1px solid ${MT.border}`, borderRadius:18, padding:"14px 16px"}}>
          <div style={{fontFamily:MT.serif, fontSize:15, lineHeight:1.55, color:MT.ink, textWrap:"pretty"}}>
            Weekly review template with energy check-in, three priority slots, and a "what did I dodge" journal prompt at the end.
          </div>
          <div style={{display:"flex", gap:6, marginTop:10}}>
            <span style={{fontSize:10, fontFamily:MT.mono, padding:"4px 9px", borderRadius:99, background:MT.sunken, color:MT.muted}}>weekly</span>
            <span style={{fontSize:10, fontFamily:MT.mono, padding:"4px 9px", borderRadius:99, background:MT.sunken, color:MT.muted}}>review</span>
            <span style={{fontSize:10, fontFamily:MT.mono, padding:"4px 9px", borderRadius:99, background:MT.sunken, color:MT.muted}}>journal</span>
          </div>
        </div>
      </div>

      {/* generated preview */}
      <div style={{padding:"16px 14px 0"}}>
        <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 4px 8px", display:"flex", alignItems:"center", gap:6}}>
          <MI.sparkles size={11} c={MT.terracotta}/> Preview · generated
        </div>
        <div style={{background:MT.card, border:`1px solid ${MT.border}`, borderRadius:18, padding:"14px 18px"}}>
          <div style={{fontFamily:MT.serif, fontSize:18, fontWeight:500, color:MT.ink, marginBottom:10}}># Weekly Review · <span style={{color:MT.muted, fontWeight:400}}>{`{{friday}}`}</span></div>

          <div style={{fontFamily:MT.mono, fontSize:11, color:MT.clay, marginBottom:6}}>## Energy check-in</div>
          <div style={{fontSize:13, color:MT.muted, marginBottom:12}}>Rate the week: 1–10 · note what drained / restored.</div>

          <div style={{fontFamily:MT.mono, fontSize:11, color:MT.clay, marginBottom:6}}>## Top 3 next week</div>
          {["- [ ] priority 1","- [ ] priority 2","- [ ] priority 3"].map(t=>(
            <div key={t} style={{fontFamily:MT.mono, fontSize:12, color:MT.ink, padding:"3px 0"}}>{t}</div>
          ))}

          <div style={{fontFamily:MT.mono, fontSize:11, color:MT.clay, margin:"12px 0 6px"}}>## What did I dodge?</div>
          <div style={{fontSize:13, color:MT.muted, fontStyle:"italic", fontFamily:MT.serif}}>(journal · 5 min · no judgement)</div>
        </div>
      </div>

      <div style={{padding:"14px 14px 0", display:"flex", gap:10}}>
        <button style={{flex:1, padding:"12px", borderRadius:99, border:`1px solid ${MT.border}`, background:"transparent", color:MT.ink, fontSize:13, fontFamily:MT.mono}}>Refine</button>
        <button style={{flex:2, padding:"12px", borderRadius:99, border:"none", background:MT.terracotta, color:"#fff", fontSize:13, fontWeight:500, fontFamily:MT.mono}}>Save template</button>
      </div>
    </div>
  );
};

// ---------- Settings (PRD Screen 25 root + mobile-specific toggles) ----------
const MobileSettings = () => {
  const Row = ({icon, label, detail, color=MT.soft})=>{
    const Icon = icon;
    return (
      <div style={{display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:`1px solid ${MT.borderSoft}`}}>
        <div style={{width:30, height:30, borderRadius:8, background: `${color}22`, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
          <Icon size={15} c={color}/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14, color:MT.ink}}>{label}</div>
          {detail && <div style={{fontSize:11, fontFamily:MT.mono, color:MT.muted, marginTop:1}}>{detail}</div>}
        </div>
        <MI.chevR size={14} c={MT.soft}/>
      </div>
    );
  };
  const Group = ({children,header})=>(
    <div style={{margin:"0 14px 16px"}}>
      {header && <div style={{fontFamily:MT.mono, fontSize:10, letterSpacing:"0.1em", color:MT.muted, textTransform:"uppercase", padding:"8px 6px"}}>{header}</div>}
      <div style={{background:MT.card, border:`1px solid ${MT.border}`, borderRadius:16, overflow:"hidden"}}>{children}</div>
    </div>
  );
  return (
    <div style={{flex:1, overflowY:"auto", padding:"4px 0 20px"}}>
      <div style={{padding:"8px 18px 14px"}}>
        <div style={{fontFamily:MT.serif, fontSize:32, fontWeight:500, color:MT.ink, letterSpacing:"-0.01em"}}>Settings</div>
      </div>

      {/* Profile card */}
      <div style={{margin:"0 14px 16px", padding:"14px 16px", background:MT.card, borderRadius:16, border:`1px solid ${MT.border}`, display:"flex", alignItems:"center", gap:12}}>
        <div style={{width:46,height:46,borderRadius:99,background:`linear-gradient(135deg, ${MT.clay}, ${MT.terracotta})`, color:"#fff", display:"flex",alignItems:"center",justifyContent:"center", fontFamily:MT.serif, fontSize:18, fontWeight:600}}>A</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:15, fontWeight:500, color:MT.ink}}>Amit</div>
          <div style={{fontSize:12, fontFamily:MT.mono, color:MT.muted}}>amit@tempoflow.app</div>
          <div style={{display:"flex", gap:4, marginTop:4}}>
            <span style={{fontSize:10, fontFamily:MT.mono, padding:"2px 8px", borderRadius:99, background:MT.sunken, color:MT.terracottaDeep}}>Pro · trial</span>
            <span style={{fontSize:10, fontFamily:MT.mono, padding:"2px 8px", borderRadius:99, background:MT.sunken, color:MT.muted}}>4 days left</span>
          </div>
        </div>
      </div>

      <Group header="Experience">
        <Row icon={MI.sparkles} label="AI & Coach" detail="warmth 6/10 · Gemma 4 26B" color={MT.terracotta}/>
        <Row icon={MI.mic} label="Voice" detail="walkie-talkie · 12/30 min today" color={MT.moss}/>
        <Row icon={MI.bell} label="Notifications" detail="quiet hours · 22:00–08:00" color={MT.clay}/>
      </Group>

      <Group header="Appearance & Access">
        <Row icon={MI.sun} label="Appearance" detail="light · accent terracotta" color={MT.clay}/>
        <Row icon={MI.book} label="Accessibility" detail="OpenDyslexic · 115%" color={MT.soft}/>
      </Group>

      <Group header="Account">
        <Row icon={MI.star} label="Subscription" detail="Pro · $10/mo · RevenueCat" color={MT.terracotta}/>
        <Row icon={MI.folder} label="Integrations" detail="Coming in 2.0" color={MT.muted}/>
        <Row icon={MI.brain} label="Privacy & data" detail="analytics off · export data" color={MT.moss}/>
      </Group>

      <Group header="Support">
        <Row icon={MI.chat} label="Ask the Founder" detail="Amit replies in ~48h" color={MT.terracotta}/>
        <Row icon={MI.note} label="About" detail="v1.0.0 · licenses" color={MT.soft}/>
      </Group>
    </div>
  );
};

// ---------- Onboarding · 5-step pre-auth flow (PRD Screens 38-42) ----------
const MobileOnboarding = ({ initialStep = 0 }) => {
  const [step, setStep] = React.useState(initialStep);
  const [tags, setTags] = React.useState(["ADHD","Burnout"]);
  const [energy, setEnergy] = React.useState("morning");
  const [tpl, setTpl] = React.useState("Builder");
  const toggle = (t) => setTags(ts => ts.includes(t) ? ts.filter(x=>x!==t) : [...ts, t]);
  const next = () => setStep(s => Math.min(4, s+1));
  const back = () => setStep(s => Math.max(0, s-1));

  const Progress = () => (
    <div style={{padding:"12px 20px 8px", display:"flex", gap:4}}>
      {[0,1,2,3,4].map(i=>(
        <div key={i} style={{flex:1, height:3, borderRadius:99, background: i<=step?MT.terracotta:MT.sunken}}/>
      ))}
    </div>
  );

  const Header = ({eyebrow, title, lede}) => (
    <div style={{padding:"14px 22px 8px"}}>
      <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10}}>{eyebrow}</div>
      <div style={{fontFamily:MT.serif, fontSize:28, fontWeight:500, letterSpacing:"-0.015em", color:MT.ink, lineHeight:1.15, marginBottom:8, textWrap:"pretty"}}>{title}</div>
      {lede && <div style={{fontFamily:MT.serif, fontSize:15, lineHeight:1.5, color:MT.muted, textWrap:"pretty"}}>{lede}</div>}
    </div>
  );

  const Footer = ({primary="Continue", onPrimary=next, primaryIcon=true, canBack=step>0, secondary}) => (
    <div style={{padding:"12px 18px 22px", display:"flex", flexDirection:"column", gap:8, borderTop:`1px solid ${MT.borderSoft}`, background:MT.cream}}>
      {secondary}
      <div style={{display:"flex", gap:8}}>
        {canBack && (
          <button onClick={back} style={{width:52, height:48, borderRadius:99, border:`1px solid ${MT.border}`, background:"transparent", color:MT.muted, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <MI.chevL size={16} c={MT.muted}/>
          </button>
        )}
        <button onClick={onPrimary} style={{flex:1, padding:"14px", borderRadius:99, border:"none", background:MT.terracotta, color:"#fff", fontSize:14, fontWeight:500, fontFamily:MT.sans, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
          {primary}{primaryIcon && <MI.chevR size={16} c="#fff"/>}
        </button>
      </div>
      <div style={{fontFamily:MT.mono, fontSize:10, color:MT.soft, textAlign:"center", letterSpacing:"0.06em"}}>{step+1} / 5</div>
    </div>
  );

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", background:MT.cream, overflow:"hidden"}}>
      <Progress/>

      {/* ---- STEP 0 · Welcome ---- */}
      {step === 0 && (
        <>
          <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"20px 28px", textAlign:"center"}}>
            <div style={{width:88, height:88, borderRadius:26, background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24, boxShadow:"0 20px 40px -20px rgba(217,119,87,0.5)"}}>
              <svg width="48" height="44" viewBox="0 0 64 56" fill="none"><path d="M14 16 H50" stroke="#fff" strokeWidth="5" strokeLinecap="round"/><path d="M32 16 V46" stroke="#fff" strokeWidth="5" strokeLinecap="round"/><circle cx="42" cy="44" r="6" fill="#fff"/></svg>
            </div>
            <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10}}>Welcome</div>
            <div style={{fontFamily:MT.serif, fontSize:32, fontWeight:500, letterSpacing:"-0.02em", color:MT.ink, lineHeight:1.1, marginBottom:12, textWrap:"pretty"}}>A planner that feels like a letter, not a form.</div>
            <div style={{fontFamily:MT.serif, fontSize:15, lineHeight:1.55, color:MT.muted, maxWidth:300, textWrap:"pretty"}}>Four minutes to set up. We'll tune the coach to your brain, pick a shape, and make your first plan together.</div>
          </div>
          <Footer primary="Let's begin" canBack={false} secondary={<div style={{fontSize:11, color:MT.soft, fontFamily:MT.mono, textAlign:"center"}}>Already have an account? <span style={{color:MT.terracotta}}>Sign in</span></div>}/>
        </>
      )}

      {/* ---- STEP 1 · Personalization ---- */}
      {step === 1 && (
        <>
          <Header eyebrow="Personalization · 1 of 5" title="Who does this need to work for?" lede="Tap any that describe you. I'll adjust the pacing, copy and coach warmth. Nothing is shared."/>
          <div style={{flex:1, overflowY:"auto", padding:"4px 18px 8px"}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14}}>
              {["ADHD","Autism","Anxiety","Dyslexia","Burnout","Exec. dysfunction","CPTSD","Low spoons","Just want a better system"].map(t=>{
                const on = tags.includes(t);
                return (
                  <button key={t} onClick={()=>toggle(t)} style={{padding:"12px 14px", borderRadius:14, border:on?`1.5px solid ${MT.terracotta}`:`1px solid ${MT.border}`, background:on?"rgba(217,119,87,0.06)":MT.card, color:MT.ink, fontSize:13, fontFamily:MT.sans, fontWeight:500, textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                    {t}{on && <MI.check size={13} c={MT.terracotta}/>}
                  </button>
                );
              })}
            </div>
            <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 2px 8px"}}>Your energy</div>
            <div style={{display:"flex", flexDirection:"column", gap:6, marginBottom:10}}>
              {[["morning","Mornings are my thing"],["evening","Nights are my thing"],["variable","It changes day to day"]].map(([k,v])=>{
                const on = energy===k;
                return (
                  <button key={k} onClick={()=>setEnergy(k)} style={{padding:"13px 14px", borderRadius:12, border:on?`1.5px solid ${MT.terracotta}`:`1px solid ${MT.border}`, background:on?"rgba(217,119,87,0.06)":MT.card, color:MT.ink, fontSize:14, fontFamily:MT.serif, textAlign:"left", display:"flex", alignItems:"center", gap:10}}>
                    <div style={{width:16, height:16, borderRadius:99, border:`1.5px solid ${on?MT.terracotta:MT.border}`, background:on?MT.terracotta:"transparent"}}/>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
          <Footer/>
        </>
      )}

      {/* ---- STEP 2 · Template shape ---- */}
      {step === 2 && (
        <>
          <Header eyebrow="Template · 2 of 5" title="Pick a starting shape." lede="You can change it anytime, or mix them. I'll pre-populate your first planning session."/>
          <div style={{flex:1, overflowY:"auto", padding:"4px 16px 8px"}}>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              {[
                { k:"Student", d:"Courses, assignments, exam blocks. Weekly review on Sunday.", ic:MI.book },
                { k:"Builder", d:"Projects with code context. Deep-work anchors. Shutdown routine.", ic:MI.bolt },
                { k:"Daily Life", d:"Habits, chores, small joys. Gentle pacing for variable days.", ic:MI.sun },
              ].map(c=>{
                const on = tpl===c.k;
                const Ic = c.ic;
                return (
                  <button key={c.k} onClick={()=>setTpl(c.k)} style={{padding:"16px", borderRadius:16, border:on?`1.5px solid ${MT.terracotta}`:`1px solid ${MT.border}`, background:on?"rgba(217,119,87,0.06)":MT.card, textAlign:"left", display:"flex", gap:14, alignItems:"flex-start"}}>
                    <div style={{width:42, height:42, borderRadius:12, background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><Ic size={18} c="#fff"/></div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontFamily:MT.serif, fontSize:18, fontWeight:500, color:MT.ink, marginBottom:3}}>{c.k}</div>
                      <div style={{fontSize:12, color:MT.muted, lineHeight:1.45}}>{c.d}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{textAlign:"center", padding:"14px 0 4px"}}>
              <button style={{background:"transparent", border:"none", color:MT.terracotta, fontSize:12, fontFamily:MT.mono, textDecoration:"underline", textUnderlineOffset:3}}>Start blank instead →</button>
            </div>
          </div>
          <Footer/>
        </>
      )}

      {/* ---- STEP 3 · Brain dump ---- */}
      {step === 3 && (
        <>
          <Header eyebrow="Brain dump · 3 of 5" title="Tell me everything." lede="Fragments, worries, things you're avoiding — all welcome. I'll sort it next."/>
          <div style={{flex:1, padding:"8px 16px 8px", display:"flex", flexDirection:"column"}}>
            <div style={{flex:1, background:MT.card, borderRadius:16, border:`1px solid ${MT.border}`, padding:"16px 18px", fontFamily:MT.serif, fontSize:15, lineHeight:1.65, color:MT.ink}}>
              <div>i keep forgetting the expense report</div>
              <div>launch anxiety — what if the copy is bad</div>
              <div>maya's birthday is sunday</div>
              <div>i feel foggy after 3pm lately</div>
              <div>call mom, it's been 3 weeks</div>
              <div style={{color:MT.terracotta, opacity:0.7}}>|</div>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 4px 0"}}>
              <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted}}>42 words · encrypted</div>
              <button style={{display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${MT.border}`, color:MT.muted, padding:"6px 10px", borderRadius:99, fontSize:11, fontFamily:MT.mono}}>
                <MI.mic size={11} c={MT.muted}/> dictate
              </button>
            </div>
          </div>
          <Footer primary="Sort this"/>
        </>
      )}

      {/* ---- STEP 4 · First plan + account ---- */}
      {step === 4 && (
        <>
          <Header eyebrow="First plan · 4 of 5" title="Three things for today." lede="Small and doable. The rest is parked for tomorrow."/>
          <div style={{flex:1, overflowY:"auto", padding:"4px 16px 0"}}>
            <div style={{display:"flex", flexDirection:"column", gap:8, marginBottom:14}}>
              {[
                { n:1, t:"Send the expense report", time:"09:30", est:"5 min" },
                { n:2, t:"Launch post · final read-through", time:"10:30", est:"40 min" },
                { n:3, t:"Ten-minute walk outside", time:"12:30", est:"10 min" },
              ].map(x=>(
                <div key={x.n} style={{padding:"12px 14px", background:MT.card, borderRadius:14, border:`1px solid ${MT.border}`, display:"flex", alignItems:"center", gap:12}}>
                  <div style={{width:26, height:26, borderRadius:99, background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MT.serif, fontWeight:600, fontSize:13, flexShrink:0}}>{x.n}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:14, color:MT.ink, fontWeight:500}}>{x.t}</div>
                    <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, marginTop:2}}>{x.time} · {x.est}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(217,119,87,0.07)", border:`1px solid rgba(217,119,87,0.22)`, borderRadius:12, padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-start", marginBottom:14}}>
              <MI.sparkles size={14} c={MT.terracotta}/>
              <div style={{fontFamily:MT.serif, fontSize:13, color:MT.ink, lineHeight:1.45}}>Small on purpose. You can add more after — but let's start here.</div>
            </div>
            <div style={{padding:"14px", background:MT.card, borderRadius:16, border:`1px solid ${MT.border}`}}>
              <div style={{fontFamily:MT.serif, fontSize:15, fontWeight:500, color:MT.ink, marginBottom:4}}>Save this? Your first week is a dollar.</div>
              <div style={{fontSize:12, color:MT.muted, marginBottom:10, lineHeight:1.5}}>Magic link or passkey. Cancel in two taps from the app.</div>
              <button onClick={next} style={{width:"100%", padding:"13px", borderRadius:99, border:"none", background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, color:"#fff", fontSize:13, fontWeight:500, fontFamily:MT.sans, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
                Continue · $1 for 7 days <MI.chevR size={14} c="#fff"/>
              </button>
            </div>
          </div>
          <Footer primary="I'm good — finish setup" primaryIcon={false} onPrimary={next}/>
        </>
      )}
    </div>
  );
};

// ---------- Habits (PRD Screen 14) — quick grid ----------
const MobileHabits = () => {
  return (
    <div style={{flex:1, overflowY:"auto", padding:"4px 0 20px"}}>
      <div style={{padding:"8px 18px 14px", display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <div>
          <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.1em", textTransform:"uppercase"}}>Library · habits</div>
          <div style={{fontFamily:MT.serif, fontSize:28, fontWeight:500, color:MT.ink, letterSpacing:"-0.01em", lineHeight:1.1}}>Habits</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:MT.serif, fontSize:22, color:MT.terracotta}}>7d</div>
          <div style={{fontFamily:MT.mono, fontSize:9, color:MT.muted, letterSpacing:"0.08em", textTransform:"uppercase"}}>avg streak</div>
        </div>
      </div>

      <div style={{padding:"0 14px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        {[
          {name:"Meds · AM", streak:12, freq:"daily", pct:100, color:MT.terracotta},
          {name:"Walk outside", streak:7, freq:"daily", pct:85, color:MT.moss},
          {name:"Journal", streak:4, freq:"daily", pct:70, color:MT.clay},
          {name:"Read · 15 min", streak:2, freq:"M-F", pct:40, color:MT.soft},
          {name:"Stretch", streak:0, freq:"daily", pct:20, color:"#d6b78d"},
          {name:"Call a friend", streak:1, freq:"weekly", pct:55, color:MT.terracottaDeep},
        ].map((h,i)=>(
          <div key={i} style={{padding:"14px", background:MT.card, borderRadius:16, border:`1px solid ${MT.border}`}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
              <div style={{width:30, height:30, borderRadius:99, position:"relative", background: `conic-gradient(${h.color} ${h.pct}%, ${MT.sunken} ${h.pct}%)`, display:"flex", alignItems:"center", justifyContent:"center"}}>
                <div style={{width:22, height:22, background:MT.card, borderRadius:99, fontSize:9, fontFamily:MT.mono, color:MT.ink, display:"flex", alignItems:"center", justifyContent:"center"}}>{h.pct}</div>
              </div>
              <span style={{fontFamily:MT.serif, fontSize:15, color:MT.ink, fontWeight:500}}>{h.streak}<span style={{fontSize:10, color:MT.muted, marginLeft:2, fontFamily:MT.mono}}>d</span></span>
            </div>
            <div style={{fontFamily:MT.serif, fontSize:14, fontWeight:500, color:MT.ink}}>{h.name}</div>
            <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, marginTop:2}}>{h.freq}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, {
  MobileCoachScreen, MobileLibrary, MobileJournal, MobileTemplateEditor,
  MobileSettings, MobileOnboarding, MobileHabits,
});
