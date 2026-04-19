/* Tempo Flow — Screens Part 1: Today, Brain Dump, Coach, Plan, Tasks */

/* ------------------ Screen 2: Today / Dashboard ------------------ */
const ScreenToday = () => {
  const { setScreen } = useApp();
  const [tasks, setTasks] = useState([
    { id: 1, title: "Morning pages", time: "08:00", est: 15, energy: "low", done: true },
    { id: 2, title: "Draft Tempo 1.0 launch post", time: "09:30", est: 60, energy: "high", tag: "writing", done: false, ai: true },
    { id: 3, title: "Review PRs from yesterday", time: "11:00", est: 30, energy: "medium", done: false },
    { id: 4, title: "10-minute walk", time: "12:30", est: 10, energy: "low", done: false },
    { id: 5, title: "Respond to three founder questions", time: "14:00", est: 25, energy: "medium", done: false, ai: true },
  ]);
  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const done = tasks.filter(t => t.done).length;

  return (
    <>
      <Topbar title="Today" crumb="Thursday, April 23"
        right={<button className="btn btn-sm btn-gradient" onClick={() => setScreen("plan")}><I.Sparkles size={14}/>Plan with Coach</button>}/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Thursday · April 23</div>
            <h1 style={{ fontSize: 40 }}>Good morning, Amit.</h1>
            <p className="lede">Three things look doable this afternoon. Your energy tends to dip after lunch — that's allowed.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div className="eyebrow">Energy</div>
              <EnergyBar level={4}/>
            </div>
            <div className="divider-vert" style={{ height: 40 }}/>
            <div style={{ textAlign: "right" }}>
              <div className="eyebrow">Streak</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500 }}>5 days</div>
            </div>
          </div>
        </div>

        <div className="grid-asym">
          <div className="stack">
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="eyebrow">Today's anchors</div>
                  <h2>{done} of {tasks.length} things</h2>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Ring pct={done/tasks.length} size={40} stroke={3} label={`${Math.round(done/tasks.length*100)}`}/>
                  <button className="btn btn-sm btn-outline"><I.Plus size={14}/>Add</button>
                </div>
              </div>
              <div className="stack-2">
                {tasks.map(t => <TaskRow key={t.id} task={t} onToggle={toggle}/>)}
              </div>
              <AcceptStrip text="Two overdue things from yesterday. Carry them to today, or let them rest?"/>
            </div>

            <div className="card sunken">
              <CoachBubble>
                Nice work on morning pages. When you're ready, the Tempo 1.0 post is the biggest thing — sixty minutes, high-energy. Want me to stage the outline first?
              </CoachBubble>
              <div style={{ marginTop: "var(--space-4)", display: "flex", gap: 8 }}>
                <button className="btn btn-sm btn-primary">Stage the outline</button>
                <button className="btn btn-sm btn-ghost">Not now</button>
              </div>
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 12 }}>Habits · today</div>
              <div className="stack-3">
                <div className="row-apart">
                  <div className="row"><Ring pct={1} size={32} stroke={3}/><span style={{ fontWeight: 500 }}>Morning pages</span></div>
                  <Pill tone="moss">5-day streak</Pill>
                </div>
                <div className="row-apart">
                  <div className="row"><Ring pct={0.5} size={32} stroke={3}/><span style={{ fontWeight: 500 }}>10-min walk</span></div>
                  <Pill tone="amber">due</Pill>
                </div>
                <div className="row-apart">
                  <div className="row"><Ring pct={0} size={32} stroke={3}/><span style={{ fontWeight: 500 }}>Shutdown sequence</span></div>
                  <Pill tone="neutral">8pm</Pill>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 12 }}>Up next</div>
              <div className="stack-3">
                {["11:00 Review PRs · 30 min", "12:30 10-minute walk", "14:00 Respond to founder Qs"].map(x => (
                  <div key={x} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--border-soft)" }}>
                    <I.Clock size={14} stroke={1.5}/><span style={{ fontSize: 14 }}>{x}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card sunken flat">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Pebble of the day</div>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.5 }}>
                "10 minute walk" beats "some movement." — small, gentle, specific.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 3: Brain Dump ------------------ */
const ScreenBrainDump = () => {
  const [text, setText] = useState("Remember to finish the landing copy. Book dentist. Ask Sam about the Convex migration. Pick up groceries on the way home. Worry: am I shipping fast enough? Idea: use the orange gradient on the first-run splash. Journal later about the talk.");
  const [processed, setProcessed] = useState(true);
  const items = [
    { text: "Finish the landing copy", type: "task", confidence: 0.94 },
    { text: "Book dentist", type: "task", confidence: 0.97 },
    { text: "Ask Sam about the Convex migration", type: "task", confidence: 0.91 },
    { text: "Pick up groceries on the way home", type: "reminder", confidence: 0.86 },
    { text: "Am I shipping fast enough?", type: "worry", confidence: 0.88 },
    { text: "Orange gradient on the first-run splash", type: "idea", confidence: 0.82 },
    { text: "Journal about the talk", type: "reminder", confidence: 0.79 },
  ];
  const toneFor = t => ({ task: "accent", reminder: "slate", idea: "moss", worry: "amber", note: "neutral" }[t]);

  return (
    <>
      <Topbar title="Brain Dump" crumb="Flow"/>
      <div className="page">
        <div className="page-header">
          <div className="eyebrow">Brain Dump</div>
          <h1>Everything on your mind.</h1>
          <p className="lede">Don't organize it. Just type. I'll sort it into tasks, reminders, ideas, and worries — then you approve what sticks.</p>
        </div>

        <div className="grid-asym">
          <div className="card">
            <div className="card-head">
              <h3>Dump</h3>
              <div className="row-tight">
                <button className="icon-btn" title="Dictate"><I.Mic size={16}/></button>
                <span className="caption mono">{text.length} chars · {text.split(/\s+/).length} words</span>
              </div>
            </div>
            <div className="field" style={{ gap: 0 }}>
              <textarea value={text} onChange={e => setText(e.target.value)}
                style={{ minHeight: 280, fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.6, border: 0, padding: 0, background: "transparent" }}/>
            </div>
            <div className="row-apart" style={{ marginTop: "var(--space-4)" }}>
              <span className="caption">End-to-end encrypted. Only you see this.</span>
              <button className="btn btn-gradient" onClick={() => setProcessed(true)}><I.Sparkles size={14}/>Sort it</button>
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 8 }}>Gentle prompts</div>
              <div className="stack-2">
                {["What's one thing you've been avoiding?", "Any small wins from yesterday?", "What would help your shoulders drop?"].map(q => (
                  <div key={q} style={{ padding: 10, background: "var(--surface-sunken)", borderRadius: 10, fontFamily: "var(--font-serif)", fontSize: 14 }}>{q}</div>
                ))}
              </div>
            </div>
            <div className="card sunken flat">
              <div className="eyebrow" style={{ marginBottom: 6 }}>Privacy</div>
              <p style={{ fontSize: 13, color: "var(--fg-muted)" }}>Raw dumps never leave Convex. Only sorted items are written to your library — and only after you approve them.</p>
            </div>
          </div>
        </div>

        {processed && (
          <div className="card" style={{ marginTop: "var(--space-8)" }}>
            <div className="card-head">
              <div>
                <div className="eyebrow">Sorted — 7 items</div>
                <h3>Review and approve</h3>
              </div>
              <div className="row-tight">
                <button className="btn btn-sm btn-outline">Approve all</button>
                <button className="btn btn-sm btn-ghost">Skip all</button>
              </div>
            </div>
            <div className="stack-2">
              {items.map((it, i) => (
                <div key={i} className="row-apart" style={{ padding: "12px 16px", background: "var(--surface-sunken)", borderRadius: 10 }}>
                  <div className="row" style={{ flex: 1, minWidth: 0 }}>
                    <Pill tone={toneFor(it.type)}>{it.type}</Pill>
                    <span style={{ fontSize: 15 }}>{it.text}</span>
                  </div>
                  <div className="row-tight">
                    <span className="caption mono">{Math.round(it.confidence * 100)}%</span>
                    <button className="btn btn-sm btn-primary">Accept</button>
                    <button className="btn btn-sm btn-ghost">Skip</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ------------------ Screen 4: Coach ------------------ */
const ScreenCoach = () => {
  return (
    <>
      <Topbar title="Coach" crumb="Flow"/>
      <div className="page-tight">
        <div className="page-header">
          <div className="eyebrow">Coach</div>
          <h1>A quiet second brain.</h1>
          <p className="lede">Warmth dial at <strong>6/10</strong> — gently offering, not saccharine. Coach sees only the notes and projects you share.</p>
        </div>

        <div className="grid-asym">
          <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 560 }}>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 99, background: "var(--gradient-tempo)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 13, fontWeight: 600 }}>T</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Tempo Coach</div>
                <div className="caption">scope: 2 notes · 1 project</div>
              </div>
              <Pill tone="moss" dot="var(--moss)">Online</Pill>
            </div>

            <div style={{ flex: 1, padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)", overflowY: "auto" }}>
              <div className="caption" style={{ textAlign: "center" }}>Thursday, 9:12 AM</div>
              <CoachBubble>
                Morning. I noticed you dumped seven things earlier. Three of them look like worries about shipping. Want to talk about those, or should I stage the tasks first?
              </CoachBubble>
              <UserBubble>Stage the tasks. I'll come back to the worries tonight.</UserBubble>
              <CoachBubble>
                Good. I'll add <em>Finish landing copy</em>, <em>Book dentist</em>, and <em>Ask Sam about Convex</em> to today. The dentist is quick — five minutes. Can we try it after your walk?
              </CoachBubble>
              <UserBubble>Sure. Keep it gentle.</UserBubble>
              <CoachBubble>
                Always. One small note — you've mentioned shipping speed three times this week. It might be worth fifteen minutes of journal time on Friday. I'll leave a gentle prompt, not a task.
              </CoachBubble>
            </div>

            <div style={{ padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }} className="field">
                  <textarea placeholder="Type, or hold to dictate…" style={{ minHeight: 44 }}/>
                </div>
                <button className="icon-btn" title="Walkie-talkie — hold to speak" onClick={() => window.__vcOpen?.('walkie')}><I.Mic/></button>
                <button className="icon-btn" title="Voice mode — hands-free" onClick={() => window.__vcOpen?.('voice')} style={{background:"color-mix(in oklab, var(--tempo-orange) 14%, var(--surface-page))", borderColor:"color-mix(in oklab, var(--tempo-orange) 35%, var(--border))", color:"var(--tempo-orange)"}}><I.Volume/></button>
                <button className="btn btn-primary btn-sm"><I.Send size={14}/>Send</button>
              </div>
              <div className="row-tight" style={{ marginTop: 8 }}>
                <Pill tone="accent">Stage tasks</Pill>
                <Pill tone="neutral">Draft journal prompt</Pill>
                <Pill tone="neutral">Review this week</Pill>
              </div>
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Personality dial</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 8 }}>Gentle</div>
              <div style={{ position: "relative", height: 8, background: "var(--surface-sunken)", borderRadius: 99 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: "var(--gradient-tempo)", borderRadius: 99, width: "60%" }}/>
                <div style={{ position: "absolute", left: "60%", top: -4, width: 16, height: 16, background: "#fff", border: "2px solid var(--tempo-orange)", borderRadius: 99, transform: "translateX(-50%)", boxShadow: "var(--shadow-whisper)" }}/>
              </div>
              <div className="row-apart" style={{ marginTop: 6 }}>
                <span className="caption">softer</span>
                <span className="caption">sharper</span>
              </div>
            </div>

            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Conversation scope</div>
              <div className="stack-2">
                <div className="row"><I.Notebook size={14} stroke={1.5}/><span style={{ fontSize: 14 }}>Launch notes</span></div>
                <div className="row"><I.Notebook size={14} stroke={1.5}/><span style={{ fontSize: 14 }}>Onboarding copy</span></div>
                <div className="row"><I.Folder size={14} stroke={1.5}/><span style={{ fontSize: 14 }}>Tempo 1.0</span></div>
                <button className="btn btn-sm btn-outline" style={{ alignSelf: "flex-start", marginTop: 4 }}><I.Plus size={12}/>Add to scope</button>
              </div>
            </div>

            <div className="card sunken flat">
              <div className="eyebrow" style={{ marginBottom: 6 }}>Past conversations</div>
              <div className="stack-2">
                {["Shipping worries · Mon", "Outline: launch post · Sun", "Weekly review · Fri"].map(x => (
                  <div key={x} style={{ fontSize: 13, color: "var(--fg-muted)", padding: "4px 0", fontFamily: "var(--font-serif)" }}>{x}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 5: Planning ------------------ */
const ScreenPlan = () => {
  const blocks = [
    { start: "8:00", end: "8:15", title: "Morning pages", tone: "moss" },
    { start: "9:30", end: "10:30", title: "Draft Tempo 1.0 launch post", tone: "accent" },
    { start: "11:00", end: "11:30", title: "Review PRs", tone: "slate" },
    { start: "12:30", end: "12:40", title: "10-minute walk", tone: "moss" },
    { start: "14:00", end: "14:25", title: "Respond to founder Qs", tone: "accent" },
    { start: "16:00", end: "16:10", title: "Shutdown sequence", tone: "slate" },
  ];
  return (
    <>
      <Topbar title="Planning" crumb="Flow"/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Plan · Thursday</div>
            <h1>Let's stage today.</h1>
            <p className="lede">Coach suggests six blocks based on yesterday's energy curve and your two anchors (pages + walk).</p>
          </div>
          <div className="row-tight">
            <div className="seg-control">
              <button className="is-active">Day</button>
              <button>Week</button>
            </div>
            <button className="btn btn-primary"><I.Sparkles size={14}/>Re-plan</button>
          </div>
        </div>

        <div className="grid-asym">
          <div className="card">
            <div className="card-head">
              <h3>Timeline</h3>
              <div className="caption">6 blocks · 2h 30m focused work · 4h 30m open</div>
            </div>
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "56px 1fr", gap: 0 }}>
              {["8","9","10","11","12","13","14","15","16","17"].map((h, i) => (
                <Fragment key={h}>
                  <div style={{ gridColumn: 1, padding: "10px 8px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)", borderTop: i ? "1px solid var(--border-soft)" : 0, minHeight: 56 }}>{h}:00</div>
                  <div style={{ gridColumn: 2, borderTop: i ? "1px solid var(--border-soft)" : 0, minHeight: 56, position: "relative" }}/>
                </Fragment>
              ))}
              {blocks.map((b, i) => {
                const startH = parseInt(b.start); const startM = parseInt(b.start.split(":")[1]);
                const endH = parseInt(b.end); const endM = parseInt(b.end.split(":")[1]);
                const top = ((startH - 8) * 60 + startM) * (56/60);
                const height = Math.max(24, ((endH - startH) * 60 + (endM - startM)) * (56/60));
                const bg = b.tone === "accent" ? "rgba(217,119,87,0.12)" : b.tone === "moss" ? "var(--moss-bg)" : "var(--slate-blue-bg)";
                const border = b.tone === "accent" ? "var(--tempo-orange)" : b.tone === "moss" ? "var(--moss)" : "var(--slate-blue)";
                return (
                  <div key={i} style={{ position: "absolute", left: 64, right: 8, top, height, background: bg, border: `1px solid ${border}33`, borderLeft: `3px solid ${border}`, borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>
                    <div style={{ fontWeight: 500 }}>{b.title}</div>
                    <div className="caption">{b.start}–{b.end}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Energy check-in</div>
              <EnergyBar level={4}/>
              <p className="caption" style={{ marginTop: 8 }}>Feeling alert — Coach leaned the day toward deeper work before noon.</p>
            </div>
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Anchors</div>
              <div className="stack-2">
                <div className="row"><I.Pebble size={16}/><span style={{ fontSize: 14 }}>Morning pages — 8:00</span></div>
                <div className="row"><I.Leaf size={16}/><span style={{ fontSize: 14 }}>10-minute walk — 12:30</span></div>
              </div>
            </div>
            <div className="card sunken flat">
              <CoachBubble>
                Five things feels full but fine. If the afternoon wobbles, the founder questions can slide to Friday — they're not time-locked.
              </CoachBubble>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 6: Tasks ------------------ */
const ScreenTasks = () => {
  const tasks = [
    { id: 1, title: "Draft Tempo 1.0 launch post", time: "Today", est: 60, energy: "high", tag: "writing", done: false, ai: true },
    { id: 2, title: "Finish landing copy", time: "Today", est: 45, energy: "medium", tag: "writing", done: false },
    { id: 3, title: "Review PRs from yesterday", time: "Today", est: 30, energy: "medium", done: false },
    { id: 4, title: "Book dentist", time: "Tomorrow", est: 5, energy: "low", tag: "admin", done: false },
    { id: 5, title: "Ask Sam about the Convex migration", time: "Fri", est: 15, energy: "medium", tag: "eng", done: false },
    { id: 6, title: "Publish weekly recap", time: "Sun", est: 25, energy: "low", done: false, ai: true },
    { id: 7, title: "Read one chapter of the Bach book", time: "Anytime", est: 30, energy: "low", done: true },
  ];
  return (
    <>
      <Topbar title="Tasks" crumb="Library"/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Library · Tasks</div>
            <h1>Small things, in order.</h1>
            <p className="lede">Twelve in flight. Three flagged by Coach as "high energy" — tackle before noon if you can.</p>
          </div>
          <div className="row-tight">
            <div className="seg-control">
              <button className="is-active">List</button>
              <button>Board</button>
              <button>Timeline</button>
            </div>
            <button className="btn btn-primary"><I.Plus size={14}/>New task</button>
          </div>
        </div>

        <div className="row" style={{ marginBottom: "var(--space-6)" }}>
          <div className="tabs">
            <button className="is-active">All</button><button>Today</button><button>Upcoming</button><button>Someday</button><button>Done</button>
          </div>
          <div className="row-tight" style={{ marginLeft: "auto" }}>
            <button className="btn btn-sm btn-outline"><I.Filter size={14}/>Energy</button>
            <button className="btn btn-sm btn-outline"><I.Tag size={14}/>Tag</button>
          </div>
        </div>

        <div className="card" style={{ padding: "var(--space-3)" }}>
          <div className="stack-2">
            {tasks.map(t => <TaskRow key={t.id} task={t}/>)}
          </div>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { ScreenToday, ScreenBrainDump, ScreenCoach, ScreenPlan, ScreenTasks });
