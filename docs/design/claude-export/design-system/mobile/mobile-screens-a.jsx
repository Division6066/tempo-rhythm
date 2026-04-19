/* ============================================================
   Tempo Flow — mobile screens · Part A
   Today (daily-note) · Brain Dump · Tasks · Planning Session
   ============================================================ */

// ---------- Today (NotePlan-style daily note, PRD Screen 1) ----------
const MobileToday = () => {
  return (
    <div style={{flex:1, overflowY:"auto", padding:"4px 0 20px"}}>
      {/* top strip: week calendar rail */}
      <div style={{padding:"8px 14px 6px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline", marginBottom:10}}>
          <div>
            <div style={{fontFamily:MT.mono, fontSize:11, color:MT.muted, letterSpacing:"0.08em", textTransform:"uppercase"}}>Thursday</div>
            <div style={{fontFamily:MT.serif, fontSize:30, fontWeight:500, color:MT.ink, letterSpacing:"-0.01em", lineHeight:1.1}}>April 18</div>
          </div>
          <div style={{display:"flex", gap:6}}>
            <button style={{width:36,height:36,borderRadius:99,border:`1px solid ${MT.border}`, background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:MT.muted}}><MI.search size={16}/></button>
            <button style={{width:36,height:36,borderRadius:99,border:`1px solid ${MT.border}`, background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:MT.muted}}><MI.calendar size={16}/></button>
          </div>
        </div>
        {/* week rail */}
        <div style={{display:"flex", gap:6, justifyContent:"space-between"}}>
          {[
            {d:"Mon", n:14, dots:2},
            {d:"Tue", n:15, dots:3},
            {d:"Wed", n:16, dots:1},
            {d:"Thu", n:17, active:true, dots:4},
            {d:"Fri", n:18, dots:2},
            {d:"Sat", n:19, dots:0},
            {d:"Sun", n:20, dots:1},
          ].map(x=>(
            <div key={x.d} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              padding:"8px 0 6px", borderRadius:14,
              background: x.active ? MT.ink : "transparent",
              color: x.active ? MT.card : MT.ink,
            }}>
              <span style={{fontFamily:MT.mono, fontSize:9, letterSpacing:"0.08em", opacity: x.active?0.7:0.6, textTransform:"uppercase"}}>{x.d}</span>
              <span style={{fontFamily:MT.serif, fontSize:18, fontWeight:500}}>{x.n}</span>
              <div style={{display:"flex", gap:2, marginTop:2, minHeight:4}}>
                {Array.from({length:x.dots}).map((_,i)=><span key={i} style={{width:3,height:3,borderRadius:99,background: x.active? "rgba(255,255,255,0.6)" : MT.terracotta}}/>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* coach greeting card */}
      <div style={{margin:"14px 14px 10px", padding:"14px 16px", background:MT.card, borderRadius:18, border:`1px solid ${MT.border}`}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:26,height:26,borderRadius:99,background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, color:"#fff", display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MT.serif,fontSize:12,fontWeight:600,flexShrink:0}}>T</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:MT.serif, fontSize:15, lineHeight:1.4, color:MT.ink, textWrap:"pretty"}}>
              Good morning. You've got three things from yesterday still open. Want to move them, or finish one first?
            </div>
            <div style={{display:"flex", gap:6, marginTop:10, flexWrap:"wrap"}}>
              <span style={{fontSize:11, fontFamily:MT.mono, padding:"4px 9px", borderRadius:99, background:MT.sunken, color:MT.muted}}>Reschedule all</span>
              <span style={{fontSize:11, fontFamily:MT.mono, padding:"4px 9px", borderRadius:99, background:MT.sunken, color:MT.muted}}>Plan my hour →</span>
            </div>
          </div>
        </div>
      </div>

      {/* energy check-in (PRD: asks energy level) */}
      <div style={{margin:"0 14px 12px", padding:"12px 14px", background:MT.card, borderRadius:16, border:`1px solid ${MT.borderSoft}`, display:"flex", alignItems:"center", gap:10}}>
        <MI.bolt size={16} c={MT.clay}/>
        <div style={{flex:1, fontSize:13, color:MT.ink}}>How's your energy?</div>
        {["low","med","hi"].map((e,i)=>(
          <span key={e} style={{fontFamily:MT.mono, fontSize:10, padding:"4px 9px", borderRadius:99, background: i===1? MT.ink : MT.sunken, color: i===1? MT.card: MT.muted}}>{e}</span>
        ))}
      </div>

      {/* today's plan — note-style with tasks inline (NotePlan DNA) */}
      <div style={{margin:"4px 14px 0"}}>
        <div style={{fontFamily:MT.mono, fontSize:10, letterSpacing:"0.1em", color:MT.muted, textTransform:"uppercase", padding:"0 4px 8px"}}>Today's note</div>
        <div style={{background:MT.card, borderRadius:18, border:`1px solid ${MT.border}`, padding:"16px 18px"}}>
          <div style={{fontFamily:MT.serif, fontSize:19, fontWeight:500, color:MT.ink, marginBottom:10}}># Thursday, April 18</div>

          <div style={{fontFamily:MT.serif, fontSize:14, color:MT.muted, fontStyle:"italic", lineHeight:1.5, marginBottom:14, textWrap:"pretty"}}>
            Shipping the mobile preview. Keep it tight — one thing at a time.
          </div>

          <div style={{fontFamily:MT.mono, fontSize:11, color:MT.clay, marginBottom:8, letterSpacing:"0.04em"}}>## Top 3</div>
          <div style={{display:"flex", flexDirection:"column", gap:2, marginBottom:16}}>
            <TaskRow done text="Review PR from Sam" time="20 min" tag="#tempo"/>
            <TaskRow text="Ship mobile preview v1" time="60 min" energy="high" tag="#tempo"/>
            <TaskRow text="Call the dentist" time="5 min" energy="low"/>
          </div>

          <div style={{fontFamily:MT.mono, fontSize:11, color:MT.clay, marginBottom:8, letterSpacing:"0.04em"}}>## Later today</div>
          <div style={{display:"flex", flexDirection:"column", gap:2}}>
            <TaskRow text="Pay invoice" tag="#admin"/>
            <TaskRow text="Read Convex auth docs" tag="#learning" time="30 min"/>
          </div>

          <div style={{marginTop:14, padding:"10px 12px", background:MT.sunken, borderRadius:12, display:"flex", alignItems:"center", gap:8}}>
            <MI.flame size={14} c={MT.terracotta}/>
            <div style={{fontSize:12, color:MT.muted}}><strong style={{color:MT.ink, fontWeight:600}}>7 day</strong> streak · habits on track</div>
          </div>
        </div>
      </div>

      {/* time blocks (planning session output) */}
      <div style={{margin:"18px 14px 0"}}>
        <div style={{fontFamily:MT.mono, fontSize:10, letterSpacing:"0.1em", color:MT.muted, textTransform:"uppercase", padding:"0 4px 8px", display:"flex", alignItems:"center", gap:6}}>
          Time blocks <span style={{flex:1}}/> <span style={{color:MT.terracotta, textTransform:"none", letterSpacing:"0.01em"}}>Re-plan →</span>
        </div>
        <div style={{background:MT.card, borderRadius:18, border:`1px solid ${MT.border}`, padding:"10px 12px 14px"}}>
          {[
            {t:"9:00", label:"Deep focus · mobile preview", color:MT.terracotta, active:true},
            {t:"10:30", label:"Coach check-in", color:MT.moss},
            {t:"11:00", label:"Sam PR review", color:MT.clay},
            {t:"14:00", label:"Dentist call", color:MT.ink},
          ].map((b,i)=>(
            <div key={i} style={{display:"flex", gap:10, alignItems:"center", padding:"8px 4px", borderBottom: i<3?`1px solid ${MT.borderSoft}`:"none"}}>
              <span style={{fontFamily:MT.mono, fontSize:11, color:MT.muted, width:38}}>{b.t}</span>
              <span style={{width:3, height:22, background:b.color, borderRadius:99}}/>
              <span style={{fontSize:13, color:MT.ink, flex:1}}>{b.label}</span>
              {b.active && <span style={{fontSize:9, padding:"2px 7px", borderRadius:99, background:MT.terracotta, color:"#fff", fontFamily:MT.mono, letterSpacing:"0.06em"}}>NOW</span>}
            </div>
          ))}
        </div>
      </div>

      {/* journal prompt card */}
      <div style={{margin:"18px 14px 0", padding:"14px 16px", background:"linear-gradient(135deg, rgba(217,119,87,0.08), rgba(143,165,113,0.08))", borderRadius:18, border:`1px solid ${MT.border}`}}>
        <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6}}>Evening prompt</div>
        <div style={{fontFamily:MT.serif, fontSize:16, lineHeight:1.4, color:MT.ink, marginBottom:8, textWrap:"pretty"}}>What's one thing that felt lighter today than you expected?</div>
        <span style={{fontSize:11, fontFamily:MT.mono, padding:"5px 11px", borderRadius:99, background:MT.card, color:MT.ink, border:`1px solid ${MT.border}`}}>Journal now</span>
      </div>
    </div>
  );
};

// ---------- TaskRow (used across screens) ----------
const TaskRow = ({ text, done, time, tag, energy }) => {
  const energyColor = energy==="high" ? MT.terracotta : energy==="low" ? MT.moss : MT.clay;
  return (
    <div style={{display:"flex", alignItems:"center", gap:10, padding:"7px 2px"}}>
      {done
        ? <MI.circleDone size={18} c={MT.moss}/>
        : <div style={{width:18,height:18,borderRadius:99,border:`1.5px solid ${MT.border}`, flexShrink:0}}/>
      }
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:14, color: done? MT.muted : MT.ink, textDecoration: done?"line-through":"none", fontFamily:MT.serif, lineHeight:1.3}}>{text}</div>
        <div style={{display:"flex", gap:8, alignItems:"center", marginTop:2}}>
          {time && <span style={{fontSize:10, fontFamily:MT.mono, color:MT.muted, display:"flex", alignItems:"center", gap:3}}><MI.clock size={10}/>{time}</span>}
          {energy && <span style={{fontSize:10, fontFamily:MT.mono, color: energyColor}}>{energy==="high"?"⚡ high":energy==="low"?"· low":"· med"}</span>}
          {tag && <span style={{fontSize:10, fontFamily:MT.mono, color:MT.soft}}>{tag}</span>}
        </div>
      </div>
    </div>
  );
};

// ---------- Tasks (PRD Screen 2) — filterable master list ----------
const MobileTasks = () => {
  return (
    <div style={{flex:1, overflowY:"auto", padding:"4px 0 20px"}}>
      <div style={{padding:"8px 18px 12px"}}>
        <div style={{fontFamily:MT.serif, fontSize:32, fontWeight:500, color:MT.ink, letterSpacing:"-0.01em", marginBottom:10}}>Tasks</div>
        <div style={{display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:14, background:MT.card, border:`1px solid ${MT.border}`}}>
          <MI.search size={16} c={MT.muted}/>
          <span style={{fontSize:13, color:MT.muted, flex:1}}>Search tasks, tags, projects…</span>
          <span style={{fontFamily:MT.mono, fontSize:10, padding:"2px 6px", background:MT.sunken, borderRadius:4, color:MT.muted}}>⌘K</span>
        </div>
      </div>

      {/* grouped-by view switcher */}
      <div style={{padding:"0 18px 12px", display:"flex", gap:6, overflowX:"auto"}}>
        {[{l:"All", n:24, active:true},{l:"Today", n:5},{l:"Energy", n:null},{l:"Project", n:null},{l:"#tempo", n:8}].map((p,i)=>(
          <span key={i} style={{
            padding:"6px 12px", borderRadius:99, fontSize:12, fontFamily:MT.mono, whiteSpace:"nowrap",
            background: p.active ? MT.ink : "transparent",
            color: p.active ? MT.card : MT.ink,
            border: p.active ? "none" : `1px solid ${MT.border}`,
          }}>{p.l}{p.n != null && <span style={{opacity:0.6, marginLeft:6}}>{p.n}</span>}</span>
        ))}
      </div>

      {[
        {h:"Top 3 · today", items:[
          {t:"Ship mobile preview v1", time:"60 min", energy:"high", tag:"#tempo"},
          {t:"Review PR from Sam", time:"20 min", tag:"#tempo", done:true},
          {t:"Call the dentist", time:"5 min", energy:"low"},
        ]},
        {h:"This week", items:[
          {t:"Pay invoice", tag:"#admin"},
          {t:"Read Convex auth docs", time:"30 min", tag:"#learning"},
          {t:"Maya's birthday gift", energy:"low", tag:"#personal"},
          {t:"Write launch post outline", time:"45 min", energy:"high", tag:"#tempo"},
        ]},
        {h:"Someday", items:[
          {t:"Organize raw notes folder", tag:"#maintenance"},
          {t:"Try OpenDyslexic toggle"},
        ]},
      ].map((g,gi)=>(
        <div key={gi} style={{margin:"0 14px 14px"}}>
          <div style={{fontFamily:MT.mono, fontSize:10, letterSpacing:"0.1em", color:MT.muted, textTransform:"uppercase", padding:"8px 4px"}}>{g.h}</div>
          <div style={{background:MT.card, borderRadius:18, border:`1px solid ${MT.border}`, padding:"6px 14px"}}>
            {g.items.map((t,ti)=>(
              <div key={ti} style={{borderBottom: ti<g.items.length-1?`1px solid ${MT.borderSoft}`:"none"}}>
                <TaskRow {...t} text={t.t}/>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* FAB equivalents — new task & quick capture */}
      <div style={{display:"flex", justifyContent:"center", padding:"8px 14px 0"}}>
        <button style={{
          display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:99,
          background:MT.ink, color:MT.card, border:"none", fontSize:13, fontFamily:MT.sans, fontWeight:500,
          boxShadow:"0 8px 18px -8px rgba(42,37,32,0.35)",
        }}><MI.plus size={14} c={MT.card}/> New task</button>
      </div>
    </div>
  );
};

// ---------- Brain Dump (PRD Screen 11) ----------
const MobileBrainDump = () => {
  return (
    <div style={{flex:1, display:"flex", flexDirection:"column"}}>
      <div style={{padding:"14px 18px 8px"}}>
        <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6}}>Brain dump</div>
        <div style={{fontFamily:MT.serif, fontSize:22, fontWeight:500, color:MT.ink, lineHeight:1.25, textWrap:"pretty", marginBottom:8}}>
          Tell me everything.<br/>I'll sort it later.
        </div>
        <div style={{fontSize:13, color:MT.muted, lineHeight:1.5, textWrap:"pretty"}}>
          Don't organize it. Fragments are fine. Use returns for breaks. I'll pull out tasks and flag what feels urgent.
        </div>
      </div>

      <div style={{flex:1, padding:"6px 14px 8px"}}>
        <div style={{
          height:"100%", width:"100%", background:MT.card, borderRadius:18,
          border:`1px solid ${MT.border}`, padding:"16px 18px",
          fontFamily:MT.serif, fontSize:15, lineHeight:1.7, color:MT.ink,
        }}>
          <div>expense report overdue — ugh</div>
          <div>maya's bday sunday — need a gift</div>
          <div>ask sam about convex auth session duration</div>
          <div>tempo landing copy still feels off</div>
          <div style={{color:MT.muted}}>feel foggy after 3pm lately — might be the meds timing?</div>
          <div>&nbsp;</div>
          <div style={{color:"#bbb"}}>|</div>
        </div>
      </div>

      {/* processing preview (collapsed, peek) */}
      <div style={{margin:"0 14px 10px", padding:"12px 14px", background:`linear-gradient(135deg, rgba(217,119,87,0.1), rgba(143,165,113,0.08))`, borderRadius:14, border:`1px solid ${MT.border}`}}>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
          <MI.sparkles size={14} c={MT.terracotta}/>
          <span style={{fontSize:12, fontWeight:500, color:MT.ink}}>Found <strong>4 tasks</strong>, 1 feeling, 0 urgent</span>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:4}}>
          <div style={{display:"flex", alignItems:"center", gap:6, fontSize:12, color:MT.ink}}>
            <span style={{width:12,height:12,borderRadius:99,border:`1.5px solid ${MT.border}`}}/> Submit expense report <span style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, marginLeft:"auto"}}>~5 min</span>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:6, fontSize:12, color:MT.ink}}>
            <span style={{width:12,height:12,borderRadius:99,border:`1.5px solid ${MT.border}`}}/> Buy Maya's birthday gift <span style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, marginLeft:"auto"}}>Sun</span>
          </div>
          <div style={{fontSize:11, color:MT.muted, fontFamily:MT.mono, marginTop:4}}>+ 2 more · tap to review</div>
        </div>
      </div>

      <div style={{padding:"8px 14px 14px", display:"flex", gap:8, alignItems:"center", background:MT.card, borderTop:`1px solid ${MT.border}`}}>
        <button style={{width:44,height:44,borderRadius:99,border:`1px solid ${MT.border}`, background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:MT.muted}}><MI.mic size={18}/></button>
        <button style={{flex:1, border:`1px solid ${MT.border}`, borderRadius:99, padding:"11px 16px", background:MT.cream, fontSize:13, color:MT.muted, fontFamily:MT.sans, textAlign:"left"}}>Keep typing…</button>
        <button style={{padding:"11px 16px", borderRadius:99, border:"none", background:MT.terracotta, color:"#fff", fontSize:12, fontWeight:500, fontFamily:MT.mono, display:"flex", alignItems:"center", gap:6}}>
          <MI.sparkles size={12} c="#fff"/> Triage
        </button>
      </div>
    </div>
  );
};

// ---------- Planning Session (PRD Screen 13) ----------
const MobilePlan = () => {
  return (
    <div style={{flex:1, overflowY:"auto", padding:"4px 0 20px"}}>
      <div style={{padding:"12px 18px 6px"}}>
        <div style={{fontFamily:MT.mono, fontSize:10, color:MT.muted, letterSpacing:"0.1em", textTransform:"uppercase"}}>Planning · step 3 of 4</div>
        <div style={{height:4, background:MT.sunken, borderRadius:99, marginTop:8, overflow:"hidden"}}>
          <div style={{height:"100%", width:"75%", background:MT.terracotta, borderRadius:99}}/>
        </div>
      </div>

      <div style={{padding:"14px 18px 8px"}}>
        <div style={{fontFamily:MT.serif, fontSize:24, fontWeight:500, color:MT.ink, letterSpacing:"-0.01em", lineHeight:1.25, marginBottom:4, textWrap:"pretty"}}>
          Here's a gentle plan for today.
        </div>
        <div style={{fontSize:13, color:MT.muted}}>Drag to reorder. Tap to swap. You're in charge — I just drafted.</div>
      </div>

      <div style={{margin:"8px 14px 0", background:MT.card, borderRadius:18, border:`1px solid ${MT.border}`, overflow:"hidden"}}>
        {[
          {t:"9:00 – 10:30", task:"Ship mobile preview v1", energy:"high", tag:"#tempo"},
          {t:"10:30 – 10:45", task:"Break · walk + water", energy:"low"},
          {t:"10:45 – 11:15", task:"Sam PR review", energy:"med", tag:"#tempo"},
          {t:"11:15 – 12:00", task:"Read Convex auth docs", energy:"med", tag:"#learning"},
          {t:"14:00 – 14:05", task:"Call the dentist", energy:"low", tag:"#admin"},
          {t:"15:30 – 16:00", task:"Draft launch post", energy:"high", tag:"#tempo"},
        ].map((b,i,arr)=>(
          <div key={i} style={{
            padding:"12px 16px", display:"flex", gap:10, alignItems:"center",
            borderBottom: i<arr.length-1 ? `1px solid ${MT.borderSoft}` : "none",
          }}>
            <span style={{width:16, height:16, color:MT.soft, display:"flex", alignItems:"center"}}>⋮⋮</span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:14, color:MT.ink, fontFamily:MT.serif, fontWeight:500}}>{b.task}</div>
              <div style={{display:"flex", gap:10, marginTop:2}}>
                <span style={{fontFamily:MT.mono, fontSize:10, color:MT.muted}}>{b.t}</span>
                {b.tag && <span style={{fontFamily:MT.mono, fontSize:10, color:MT.soft}}>{b.tag}</span>}
                {b.energy && <span style={{fontFamily:MT.mono, fontSize:10, color: b.energy==="high"?MT.terracotta:b.energy==="low"?MT.moss:MT.clay}}>{b.energy==="high"?"⚡":"·"} {b.energy}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* coach note */}
      <div style={{margin:"14px 14px 0", padding:"12px 14px", background:MT.card, borderRadius:14, border:`1px solid ${MT.border}`, display:"flex", gap:10}}>
        <div style={{width:22,height:22,borderRadius:99,background:`linear-gradient(135deg, ${MT.terracotta}, ${MT.terracottaDeep})`, color:"#fff", display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MT.serif,fontSize:11,fontWeight:600,flexShrink:0}}>T</div>
        <div style={{flex:1, minWidth:0, fontFamily:MT.serif, fontSize:13, lineHeight:1.5, color:MT.ink}}>
          I kept the dentist at 2pm — it's quick and fits after your walk. Shipping is front-loaded so afternoon fog doesn't bite.
        </div>
      </div>

      <div style={{margin:"18px 14px 0", display:"flex", gap:10}}>
        <button style={{flex:1, padding:"12px", borderRadius:99, border:`1px solid ${MT.border}`, background:"transparent", color:MT.ink, fontSize:13, fontFamily:MT.mono}}>Redraft</button>
        <button style={{flex:2, padding:"12px", borderRadius:99, border:"none", background:MT.terracotta, color:"#fff", fontSize:13, fontWeight:500, fontFamily:MT.mono, display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
          <MI.check size={14} c="#fff"/> Commit plan
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { MobileToday, MobileTasks, MobileBrainDump, MobilePlan, TaskRow });
