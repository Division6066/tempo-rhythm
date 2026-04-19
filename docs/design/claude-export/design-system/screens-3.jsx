/* Tempo Flow — Screens Part 3: Goals, Projects, Analytics, Settings, Templates */

/* ------------------ Screen 15: Goals ------------------ */
const ScreenGoals = () => {
  const goals = [
    { title: "Ship Tempo 1.0", cat: "work", pct: 72, due: "May 30", ms: 8, done: 6 },
    { title: "Publish twelve letters this year", cat: "creative", pct: 41, due: "Dec 31", ms: 12, done: 5 },
    { title: "Walk 10 km a week", cat: "health", pct: 100, due: "ongoing", ms: 4, done: 4 },
    { title: "Read the Bach biography", cat: "learning", pct: 55, due: "Jul 15", ms: 8, done: 4 },
  ];
  const tone = c => ({ work: "accent", creative: "moss", health: "slate", learning: "amber" }[c]);
  return (
    <>
      <Topbar title="Goals" crumb="Library"/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Library · Goals</div>
            <h1>Things worth slowly moving toward.</h1>
            <p className="lede">Four active. Coach nudges every other Friday — not every day.</p>
          </div>
          <button className="btn btn-primary"><I.Plus size={14}/>New goal</button>
        </div>

        <div className="grid-2">
          {goals.map(g => (
            <div key={g.title} className="card">
              <div className="row-apart" style={{ marginBottom: "var(--space-3)" }}>
                <Pill tone={tone(g.cat)}>{g.cat}</Pill>
                <span className="caption">due {g.due}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, marginBottom: 10 }}>{g.title}</h3>
              <div className="row-apart" style={{ marginBottom: 8 }}>
                <span className="caption">{g.done} of {g.ms} milestones</span>
                <span className="mono" style={{ fontWeight: 500 }}>{g.pct}%</span>
              </div>
              <ProgressBar pct={g.pct} tone={g.pct === 100 ? "moss" : "tempo"}/>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 16: Goal Detail ------------------ */
const ScreenGoalDetail = () => {
  const milestones = [
    { t: "Lock down all 42 screens", done: true },
    { t: "Hire a designer for review", done: true },
    { t: "Internal alpha (5 users)", done: true },
    { t: "Closed beta (30 users)", done: true },
    { t: "Public beta · iOS + Android", done: true },
    { t: "RevenueCat + $1 trial live", done: true },
    { t: "PWA + Apple Store approval", done: false },
    { t: "Launch post + founder vlog", done: false },
  ];
  return (
    <>
      <Topbar title="Ship Tempo 1.0" crumb="Goals"/>
      <div className="page-tight">
        <div className="page-header"><div className="eyebrow">Goal · Work</div><h1 style={{ fontSize: 40 }}>Ship Tempo 1.0.</h1><p className="lede">Full MVP, all 42 screens, PWA + iOS + Android. Due May 30. 72% there.</p></div>
        <div className="grid-asym">
          <div className="card">
            <h3 style={{ marginBottom: "var(--space-4)" }}>Milestones</h3>
            <div className="stack-3">
              {milestones.map((m, i) => (
                <div key={i} className="row" style={{ padding: 10, background: m.done ? "var(--moss-bg)" : "var(--surface-sunken)", borderRadius: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 99, background: m.done ? "var(--moss)" : "transparent", border: m.done ? 0 : "1.5px solid var(--border)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{m.done && <I.Check size={12} stroke={2.5}/>}</div>
                  <span style={{ fontWeight: 500, textDecoration: m.done ? "line-through" : "none", color: m.done ? "var(--fg-muted)" : "var(--fg)" }}>{m.t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="stack">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Progress</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 500 }}>72%</div>
              <div className="caption" style={{ marginBottom: 10 }}>6 of 8 · 38 days left</div>
              <ProgressBar pct={72}/>
            </div>
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Linked tasks</div>
              <div className="stack-2">
                {["Finish landing copy","Launch post draft","Submit to Apple"].map(t => (
                  <div key={t} className="row"><I.CheckSquare size={14} stroke={1.5}/><span style={{ fontSize: 14 }}>{t}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 17: Goals · Progress chart ------------------ */
const ScreenGoalsProgress = () => (
  <>
    <Topbar title="Goals · Progress" crumb="Library"/>
    <div className="page">
      <div className="page-header"><div className="eyebrow">Goals · Progress</div><h1>Steady, quiet movement.</h1></div>
      <div className="card">
        <div className="card-head"><h3>Ship Tempo 1.0 — over time</h3><div className="tabs"><button>7d</button><button className="is-active">30d</button><button>All</button></div></div>
        <svg viewBox="0 0 800 240" style={{ width: "100%", height: 240 }}>
          <defs>
            <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--tempo-orange)" stopOpacity="0.25"/><stop offset="100%" stopColor="var(--tempo-orange)" stopOpacity="0"/></linearGradient>
          </defs>
          {[0,1,2,3,4].map(i => <line key={i} x1="40" y1={40+i*40} x2="780" y2={40+i*40} stroke="var(--border-soft)"/>)}
          <path d="M40 200 L120 190 L200 175 L280 165 L360 140 L440 130 L520 110 L600 90 L680 75 L760 65" fill="none" stroke="var(--tempo-orange)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M40 200 L120 190 L200 175 L280 165 L360 140 L440 130 L520 110 L600 90 L680 75 L760 65 L760 220 L40 220 Z" fill="url(#gfill)"/>
          {[["0%",40],["25%",40],["50%",120],["75%",160],["100%",200]].map(([t, y], i) => <text key={i} x="10" y={45+i*40} style={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--fg-muted)" }}>{[0,25,50,75,100].reverse()[i]}%</text>)}
        </svg>
      </div>
    </div>
  </>
);

/* ------------------ Screen 18: Projects ------------------ */
const ScreenProjects = () => {
  const projects = [
    { title: "Tempo 1.0", team: 1, tasks: 42, pct: 72, due: "May 30" },
    { title: "Landing redesign", team: 1, tasks: 11, pct: 54, due: "Apr 29" },
    { title: "Book: Everyday Anchors", team: 1, tasks: 27, pct: 18, due: "Sep 1" },
  ];
  return (
    <>
      <Topbar title="Projects" crumb="Library"/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Library · Projects</div>
            <h1>Containers for longer work.</h1>
            <p className="lede">Each project gets its own tasks, notes, and calendar blocks — plus an optional kanban view.</p>
          </div>
          <button className="btn btn-primary"><I.Plus size={14}/>New project</button>
        </div>
        <div className="grid-2">
          {projects.map(p => (
            <div key={p.title} className="card">
              <div className="row-apart" style={{ marginBottom: 8 }}><Pill tone="accent">{p.due}</Pill><span className="caption">{p.tasks} tasks · {p.team} person</span></div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, marginBottom: 12 }}>{p.title}</h3>
              <ProgressBar pct={p.pct}/>
              <div className="caption" style={{ marginTop: 8 }}>{p.pct}% complete</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 19: Project Detail ------------------ */
const ScreenProjectDetail = () => (
  <>
    <Topbar title="Tempo 1.0" crumb="Projects"/>
    <div className="page">
      <div className="page-header"><div className="eyebrow">Project · Work</div><h1>Tempo 1.0.</h1><p className="lede">42 screens. Ship by May 30. Every afternoon is a small piece of this.</p></div>
      <div className="grid-asym">
        <div className="card">
          <div className="card-head"><h3>Linked tasks</h3><Pill tone="accent">12 open</Pill></div>
          <div className="stack-2">
            {[
              { title: "Finish landing copy", done: false },
              { title: "Review PRs", done: false },
              { title: "Submit to Apple", done: false },
              { title: "Push Android alpha", done: true },
              { title: "Brand style guide — v1", done: true },
            ].map((t, i) => <TaskRow key={i} task={t}/>)}
          </div>
        </div>
        <div className="stack">
          <div className="card"><div className="eyebrow" style={{ marginBottom: 10 }}>Overview</div>
            <div className="stack-3">
              <div className="row-apart"><span>Completion</span><strong>72%</strong></div>
              <ProgressBar pct={72}/>
              <div className="row-apart"><span>Tasks</span><strong>30 / 42</strong></div>
              <div className="row-apart"><span>Notes</span><strong>14</strong></div>
              <div className="row-apart"><span>Due</span><strong>May 30</strong></div>
            </div>
          </div>
          <div className="card"><div className="eyebrow" style={{ marginBottom: 8 }}>Linked notes</div>
            {["A letter, not a form","Onboarding rewrite","Convex migration"].map(n => <div key={n} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--border-soft)" }}><I.Notebook size={14}/><span style={{ fontSize: 14 }}>{n}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  </>
);

/* ------------------ Screen 20: Project Kanban ------------------ */
const ScreenProjectKanban = () => {
  const cols = [
    { t: "Backlog", items: ["Pricing page v2","Recovery email flow","Onboarding analytics","Dark mode polish"] },
    { t: "This week", items: ["Submit to Apple","Finish landing copy","Record founder vlog"] },
    { t: "In progress", items: ["Launch post draft","Landing rewrite"] },
    { t: "Shipped", items: ["Brand style guide v1","Convex migration","All 42 screens"] },
  ];
  return (
    <>
      <Topbar title="Tempo 1.0 · Kanban" crumb="Projects"/>
      <div className="page">
        <div className="page-header"><div className="eyebrow">Project · Kanban</div><h1>Moving things forward.</h1></div>
        <div className="kanban">
          {cols.map(c => (
            <div key={c.t} className="kanban-col">
              <div className="kanban-col-head"><span className="col-title">{c.t}</span><span className="caption mono">{c.items.length}</span></div>
              {c.items.map(it => <div key={it} className="kanban-card">{it}</div>)}
              <button className="btn btn-sm btn-ghost" style={{ width: "100%" }}><I.Plus size={12}/>Add</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 43: Analytics / Insights ------------------ */
const ScreenAnalytics = () => (
  <>
    <Topbar title="Insights" crumb="You"/>
    <div className="page">
      <div className="page-header"><div className="eyebrow">Insights</div><h1>Quiet numbers.</h1><p className="lede">Summaries, never raw events. All aggregated from PostHog — and you can opt out any time.</p></div>
      <div className="grid-4" style={{ marginBottom: "var(--space-8)" }}>
        {[
          { label: "Completion · 7d", value: "78%", trend: "+6" },
          { label: "Habit streaks", value: "3 live", trend: "1 broken" },
          { label: "Planning sessions", value: "11", trend: "this week" },
          { label: "Journal words", value: "2,104", trend: "30d" },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="eyebrow" style={{ marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div className="caption" style={{ marginTop: 4 }}>{s.trend}</div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Completion over time</h3>
          <svg viewBox="0 0 400 140" style={{ width: "100%", marginTop: 12 }}>
            {Array.from({ length: 14 }).map((_, i) => {
              const h = 40 + Math.sin(i * 0.7) * 20 + Math.random() * 40;
              return <rect key={i} x={12 + i*27} y={130 - h} width="18" height={h} rx="3" fill="var(--tempo-orange)" opacity={0.4 + i*0.04}/>;
            })}
          </svg>
        </div>
        <div className="card">
          <h3>When you ship</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4, marginTop: 16 }}>
            {Array.from({ length: 84 }).map((_, i) => {
              const v = Math.max(0, Math.sin(i * 0.3) + Math.random() * 0.8);
              return <div key={i} style={{ aspectRatio: 1, background: "var(--tempo-orange)", opacity: v * 0.9 + 0.05, borderRadius: 3 }}/>;
            })}
          </div>
          <div className="row-apart" style={{ marginTop: 10 }}><span className="caption">6am</span><span className="caption">Peak: 10–11am</span><span className="caption">6pm</span></div>
        </div>
      </div>
    </div>
  </>
);

/* ------------------ Screen 44: Recent Activity ------------------ */
const ScreenActivity = () => {
  const feed = [
    { t: "9:42 AM", what: "Completed", obj: "Morning pages", tone: "moss", icon: "Check" },
    { t: "9:15 AM", what: "Started plan", obj: "Today · 5 blocks", tone: "accent", icon: "Layout" },
    { t: "8:58 AM", what: "Brain dump sorted", obj: "7 items · 5 accepted", tone: "accent", icon: "Sparkles" },
    { t: "Yest 4:12 PM", what: "Shipped milestone", obj: "Closed beta complete", tone: "moss", icon: "Trophy" },
    { t: "Yest 3:30 PM", what: "Broke streak", obj: "Shutdown sequence", tone: "amber", icon: "Flame" },
    { t: "Yest 10:02 AM", what: "Coach conversation", obj: "Shipping worries · 12 msgs", tone: "slate", icon: "Mic" },
  ];
  return (
    <>
      <Topbar title="Recent activity" crumb="You"/>
      <div className="page-tight">
        <div className="page-header"><div className="eyebrow">You · Activity</div><h1>What did you actually do?</h1><p className="lede">A calm chronology. Scroll as far back as you need.</p></div>
        <div className="card">
          <div className="stack-3">
            {feed.map((f, i) => {
              const Ic = I[f.icon];
              return (
                <div key={i} className="row" style={{ padding: "10px 0", borderBottom: i < feed.length-1 ? "1px solid var(--border-soft)" : 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 99, background: `var(--${f.tone}-bg)`, color: `var(--${f.tone === "accent" ? "tempo-orange" : f.tone})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={16}/></div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>{f.what} <span style={{ color: "var(--fg-muted)" }}>· {f.obj}</span></div></div>
                  <span className="caption mono">{f.t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 21: Templates ------------------ */
const ScreenTemplates = () => {
  const templates = [
    { title: "Student", desc: "Course tracking + assignment deadlines", icon: "Book" },
    { title: "Builder", desc: "Project-based + code context", icon: "Zap" },
    { title: "Daily Life", desc: "Routines + habits + general tasks", icon: "Leaf" },
    { title: "Weekly review", desc: "Nine questions, fifteen minutes, every Friday", icon: "Calendar" },
    { title: "Morning routine", desc: "Kettle → pages → walk", icon: "Sun" },
    { title: "Creative page", desc: "Blank cream page. Serif. No UI.", icon: "Notebook" },
  ];
  return (
    <>
      <Topbar title="Templates" crumb="You"/>
      <div className="page">
        <div className="page-header row"><div><div className="eyebrow">Templates</div><h1>Starts, not stencils.</h1><p className="lede">Use one, tweak it, or build your own. Community templates unlock in Tempo 1.1.</p></div><button className="btn btn-primary"><I.Plus size={14}/>New template</button></div>
        <div className="grid-3">
          {templates.map(t => {
            const Ic = I[t.icon] || I.Layers;
            return (
              <div key={t.title} className="card">
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--gradient-tempo)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-4)" }}><Ic size={22}/></div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 6 }}>{t.title}</h3>
                <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: "var(--space-4)" }}>{t.desc}</p>
                <button className="btn btn-sm btn-outline">Use template</button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 22: Template Editor ------------------ */
const ScreenTemplateEditor = () => (
  <>
    <Topbar title="Weekly review · editing" crumb="Templates"/>
    <div className="page-tight">
      <div className="page-header"><div className="eyebrow">Template editor</div><h1>Weekly review.</h1><p className="lede">Nine questions. Fifteen minutes. Every Friday at 3.</p></div>
      <div className="card">
        <div className="field" style={{ marginBottom: 20 }}><label>Name</label><input defaultValue="Weekly review"/></div>
        <div className="field" style={{ marginBottom: 20 }}><label>When</label><input defaultValue="Friday · 3:00 PM"/></div>
        <div className="field"><label>Questions</label>
          <div className="stack-2">
            {["What went well this week?","What drained energy?","What did I avoid?","What's one small win?","What do I want to feel next week?","Anything to let go of?","Who deserves a thank-you?","One thing to carry forward","Anything else?"].map((q, i) => (
              <div key={i} className="row" style={{ padding: 10, background: "var(--surface-sunken)", borderRadius: 8 }}>
                <I.GripVertical size={16} stroke={1.8}/>
                <span className="caption mono">{i+1}.</span>
                <input defaultValue={q} style={{ flex: 1, background: "transparent", border: 0, fontSize: 14 }}/>
                <button className="icon-btn"><I.Trash size={14}/></button>
              </div>
            ))}
          </div>
          <button className="btn btn-sm btn-outline" style={{ marginTop: 10, alignSelf: "flex-start" }}><I.Plus size={12}/>Add question</button>
        </div>
      </div>
    </div>
  </>
);

/* ------------------ Screen 23: Picture-sketch template gen ------------------ */
const ScreenTemplateSketch = () => (
  <>
    <Topbar title="Sketch → Template" crumb="Templates"/>
    <div className="page">
      <div className="page-header"><div className="eyebrow">Template from a sketch</div><h1>Draw it. I'll turn it into blocks.</h1><p className="lede">Upload a photo of a page from your notebook, a printed timetable, or a whiteboard. Coach extracts the structure and offers a template draft.</p></div>
      <div className="grid-asym">
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ aspectRatio: "4/3", background: "repeating-linear-gradient(45deg, var(--surface-sunken), var(--surface-sunken) 10px, var(--cream-deep) 10px, var(--cream-deep) 20px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: 99, background: "var(--surface-card)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tempo-orange)" }}><I.Upload size={28} stroke={1.5}/></div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 20 }}>Drop a photo, or tap to pick one.</div>
            <span className="caption">JPG, PNG, or HEIC · max 8 MB</span>
          </div>
        </div>
        <div className="stack">
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Draft — Morning routine</div>
            <div className="stack-2">
              {["Kettle on","Journal — three pages","Ten-minute walk","Shower","Check today's plan"].map((s, i) => (
                <div key={i} className="row" style={{ padding: 10, background: "var(--surface-sunken)", borderRadius: 8 }}>
                  <span className="caption mono">{i+1}.</span>
                  <span style={{ fontSize: 14 }}>{s}</span>
                </div>
              ))}
            </div>
            <div className="row-tight" style={{ marginTop: 16 }}>
              <button className="btn btn-primary btn-sm">Save template</button>
              <button className="btn btn-outline btn-sm">Tweak</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

/* ------------------ Screen 30: Search ------------------ */
const ScreenSearch = () => (
  <>
    <Topbar title="Search" crumb=""/>
    <div className="page-narrow">
      <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <div className="row" style={{ gap: 12 }}>
          <I.Search size={20}/>
          <input placeholder="Search tasks, notes, journal, habits…" style={{ flex: 1, border: 0, background: "transparent", fontSize: 18, fontFamily: "var(--font-serif)" }} defaultValue="shipping"/>
          <span className="caption">⌘K</span>
        </div>
      </div>
      <div className="stack">
        {[
          { kind: "Note", title: "Shipping worries · journal", snip: "…mentioned shipping speed three times this week. Worth fifteen minutes of reflection…", icon: "BookOpen" },
          { kind: "Task", title: "Ship Tempo 1.0 goal review", snip: "Due May 30. 72% complete. 6 of 8 milestones done.", icon: "CheckSquare" },
          { kind: "Coach", title: "Conversation · Shipping worries", snip: "Mon 10:02 AM · 12 messages · scope: Launch notes", icon: "Mic" },
          { kind: "Template", title: "Shipping-day routine", snip: "Four steps. Run on days a major release goes out.", icon: "Repeat" },
        ].map((r, i) => {
          const Ic = I[r.icon];
          return (
            <div key={i} className="card" style={{ cursor: "pointer", padding: "var(--space-4)" }}>
              <div className="row" style={{ alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tempo-orange)" }}><Ic size={16}/></div>
                <div style={{ flex: 1 }}>
                  <div className="caption">{r.kind}</div>
                  <div style={{ fontWeight: 500 }}>{r.title}</div>
                  <div className="caption" style={{ marginTop: 2 }}>{r.snip}</div>
                </div>
                <I.ChevronRight size={16}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>
);

/* ------------------ Screen 31: Command Bar ------------------ */
const ScreenCommand = () => (
  <>
    <Topbar title="Command" crumb=""/>
    <div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 640, background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-lift)", overflow: "hidden" }}>
        <div className="row" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <I.Command size={18}/>
          <input placeholder="What would help right now?" style={{ flex: 1, border: 0, background: "transparent", fontSize: 17, fontFamily: "var(--font-serif)" }} defaultValue="add"/>
          <span className="caption mono">⌘K</span>
        </div>
        <div style={{ padding: 8 }}>
          <div className="caption" style={{ padding: "8px 12px" }}>Actions</div>
          {[
            { k: "Add task", s: "⌘N", ic: "Plus" },
            { k: "Add a journal entry", s: "⌘J", ic: "BookOpen" },
            { k: "Start brain dump", s: "⌘B", ic: "Sparkles" },
            { k: "Plan the day", s: "⌘P", ic: "Layout" },
            { k: "Ask the coach", s: "⌘C", ic: "Mic" },
          ].map((a, i) => {
            const Ic = I[a.ic];
            return (
              <div key={i} className="row-apart" style={{ padding: "10px 12px", borderRadius: 10, background: i === 0 ? "var(--surface-sunken)" : "transparent" }}>
                <div className="row"><Ic size={16}/><span style={{ fontSize: 14, fontWeight: 500 }}>{a.k}</span></div>
                <span className="caption mono">{a.s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </>
);

Object.assign(window, { ScreenGoals, ScreenGoalDetail, ScreenGoalsProgress, ScreenProjects, ScreenProjectDetail, ScreenProjectKanban, ScreenAnalytics, ScreenActivity, ScreenTemplates, ScreenTemplateEditor, ScreenTemplateSketch, ScreenSearch, ScreenCommand });
