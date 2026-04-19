/* Tempo Flow — Screens Part 2: Notes, Journal, Calendar, Habits, Routines */

/* ------------------ Screen 7: Notes ------------------ */
const ScreenNotes = () => {
  const notes = [
    { title: "Launch post — draft", tag: "writing", wc: 1204, pinned: true, date: "Today" },
    { title: "Onboarding copy rewrite", tag: "writing", wc: 712, date: "Yesterday" },
    { title: "Convex migration — notes", tag: "eng", wc: 2041, date: "Mon" },
    { title: "Meeting: Sam + Ari · alignment", tag: "meeting", wc: 440, date: "Mon" },
    { title: "Idea: gradient on first-run splash", tag: "idea", wc: 86, date: "Sun" },
    { title: "Research: magic-link vs passkey", tag: "research", wc: 1580, date: "Sat" },
  ];
  return (
    <>
      <Topbar title="Notes" crumb="Library"/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Library · Notes</div>
            <h1>Your second brain, kept light.</h1>
            <p className="lede">Full-text search, tag filters, and quiet folders. Coach can scope any conversation to a subset — it never sees the rest.</p>
          </div>
          <div className="row-tight">
            <button className="btn btn-sm btn-outline"><I.Upload size={14}/>Export</button>
            <button className="btn btn-primary"><I.Plus size={14}/>New note</button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "240px 1fr", gap: "var(--space-6)" }}>
          <div className="stack-2">
            <div className="field"><input placeholder="Search notes…"/></div>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Folders</div>
              <div className="stack-2">
                {[["All notes", 42],["Writing", 14],["Engineering", 9],["Journal prompts", 6],["Research", 8],["Archive", 5]].map(([n, c]) => (
                  <div key={n} className="row-apart" style={{ fontSize: 14, padding: "6px 8px", borderRadius: 8 }}>
                    <span>{n}</span><span className="caption mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Tags</div>
              <div className="row-tight">
                {["writing","eng","meeting","idea","research"].map(t => <Pill key={t} tone="neutral"># {t}</Pill>)}
              </div>
            </div>
          </div>

          <div className="grid-2">
            {notes.map(n => (
              <div key={n.title} className="card" style={{ cursor: "pointer" }}>
                <div className="row-apart" style={{ marginBottom: 6 }}>
                  <Pill tone="neutral"># {n.tag}</Pill>
                  {n.pinned && <I.Star size={14} fill="var(--tempo-orange)"/>}
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 6 }}>{n.title}</h3>
                <p className="caption" style={{ marginBottom: 12 }}>Lorem warmth. A thoughtful opening paragraph. The note rolls gently onward, never rushing, never corporate…</p>
                <div className="row-apart">
                  <span className="caption mono">{n.wc.toLocaleString()} words</span>
                  <span className="caption">{n.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 8: Note Detail (editor) ------------------ */
const ScreenNoteDetail = () => (
  <>
    <Topbar title="Launch post — draft" crumb="Notes"/>
    <div className="page-narrow">
      <div className="row-apart" style={{ marginBottom: "var(--space-4)" }}>
        <div className="row-tight">
          <Pill tone="neutral"># writing</Pill>
          <Pill tone="accent">Pinned</Pill>
        </div>
        <div className="caption">Saved · 2 minutes ago · 1,204 words</div>
      </div>
      <h1 style={{ fontSize: 44, marginBottom: 6 }}>A letter, not a form.</h1>
      <p className="caption" style={{ marginBottom: "var(--space-8)" }}>Draft for the Tempo 1.0 launch. Tone: Uncle Iroh with a notebook.</p>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.7, color: "var(--fg)" }}>
        <p style={{ marginBottom: "var(--space-4)" }}>Most productivity apps want you to be a machine. They count. They streak. They buzz. They reward you for optimizing things that do not, on any honest day, need to be optimized.</p>
        <p style={{ marginBottom: "var(--space-4)" }}>Tempo Flow is built for the other days — the low-spoons ones, the ones where the calendar is a cathedral you cannot enter, the ones where <em>make a plan</em> is itself the impossible task.</p>
        <p style={{ marginBottom: "var(--space-4)" }}>It is a planner that feels like a letter from a thoughtful friend, not a form to fill…</p>
      </div>
      <div className="accept-strip" style={{ marginTop: "var(--space-8)" }}>
        <I.Sparkles size={16}/>
        <div className="strip-text">Coach suggests a sharper opening line. Want to see it?</div>
        <button className="btn btn-sm btn-primary">Show</button>
        <button className="btn btn-sm btn-ghost">Skip</button>
      </div>
    </div>
  </>
);

/* ------------------ Screen 9: Journal ------------------ */
const ScreenJournal = () => {
  const entries = [
    { date: "Thu", prompt: "Morning", mood: "settled", wc: 284 },
    { date: "Wed", prompt: "Evening", mood: "tired", wc: 156 },
    { date: "Tue", prompt: "Morning", mood: "anxious", wc: 410 },
    { date: "Mon", prompt: "Free", mood: "steady", wc: 221 },
  ];
  return (
    <>
      <Topbar title="Journal" crumb="Library"/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Library · Journal</div>
            <h1>A quiet record.</h1>
            <p className="lede">End-to-end encrypted. Coach only sees what you share. Gentle prompts, never required.</p>
          </div>
          <button className="btn btn-primary"><I.Plus size={14}/>New entry</button>
        </div>

        <div className="grid-asym">
          <div className="card">
            <div className="card-head">
              <div>
                <div className="eyebrow">Today's prompt · morning</div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, marginBottom: 6 }}>What does today want to be?</h3>
              </div>
              <div className="row-tight">
                <Pill tone="neutral">Morning</Pill>
                <Pill tone="slate">Midday</Pill>
                <Pill tone="neutral">Evening</Pill>
              </div>
            </div>
            <div className="field">
              <textarea placeholder="Start anywhere…" style={{ minHeight: 240, fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.7 }} defaultValue={"Steady this morning. Pages came easy. The launch post still feels big but it's one paragraph at a time — and today I only need one paragraph."}/>
            </div>
            <div className="row-apart" style={{ marginTop: "var(--space-4)" }}>
              <div className="row-tight">
                <span className="caption">Mood:</span>
                {["settled","tired","anxious","steady","bright"].map(m => <Pill key={m} tone={m === "settled" ? "moss" : "neutral"}>{m}</Pill>)}
              </div>
              <span className="caption mono">73 words · encrypted</span>
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 12 }}>This week</div>
              <div className="stack-3">
                {entries.map(e => (
                  <div key={e.date} className="row-apart" style={{ padding: "8px 0", borderBottom: "1px solid var(--border-soft)" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{e.date} · {e.prompt}</div>
                      <div className="caption">{e.wc} words · {e.mood}</div>
                    </div>
                    <I.ChevronRight size={14} stroke={1.5}/>
                  </div>
                ))}
              </div>
            </div>
            <div className="card sunken flat">
              <div className="eyebrow" style={{ marginBottom: 6 }}>Weekly recap</div>
              <p style={{ fontSize: 13 }}>Coach drafts a gentle weekly recap on Fridays. You accept, edit, or skip.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 10: Calendar ------------------ */
const ScreenCalendar = () => {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const events = {
    "Mon": [{ h: 10, title: "PR review", tone: "slate" }, { h: 14, title: "Deep work", tone: "accent" }],
    "Tue": [{ h: 9, title: "Pages", tone: "moss" }, { h: 11, title: "Sam 1:1", tone: "slate" }],
    "Wed": [{ h: 9, title: "Pages", tone: "moss" }, { h: 13, title: "Draft launch", tone: "accent" }],
    "Thu": [{ h: 9, title: "Launch post", tone: "accent" }, { h: 12, title: "Walk", tone: "moss" }, { h: 14, title: "Founder Qs", tone: "accent" }],
    "Fri": [{ h: 10, title: "Weekly review", tone: "slate" }, { h: 15, title: "Deep work", tone: "accent" }],
    "Sat": [{ h: 11, title: "Tea w/ mum", tone: "moss" }],
    "Sun": [{ h: 17, title: "Recap draft", tone: "amber" }],
  };
  return (
    <>
      <Topbar title="Calendar" crumb="Library"/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Library · Calendar</div>
            <h1>Week of April 21.</h1>
            <p className="lede">Tasks, habits, and routines live alongside events. External calendars sync in Tempo 2.0.</p>
          </div>
          <div className="row-tight">
            <div className="seg-control"><button>Day</button><button className="is-active">Week</button><button>Month</button></div>
            <button className="btn btn-primary"><I.Plus size={14}/>Block time</button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)" }}>
            <div></div>
            {days.map(d => <div key={d} style={{ padding: "12px 10px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 500 }}>{d} <span className="caption mono">{["21","22","23","24","25","26","27"][days.indexOf(d)]}</span></div>)}
            {["8","9","10","11","12","13","14","15","16","17","18"].map((h, i) => (
              <Fragment key={h}>
                <div style={{ padding: "8px 8px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)", borderTop: i ? "1px solid var(--border-soft)" : 0, minHeight: 52 }}>{h}:00</div>
                {days.map(d => {
                  const evt = (events[d]||[]).find(e => e.h === parseInt(h));
                  return (
                    <div key={d+h} style={{ minHeight: 52, borderTop: i ? "1px solid var(--border-soft)" : 0, borderLeft: "1px solid var(--border-soft)", padding: 4, position: "relative" }}>
                      {evt && (
                        <div style={{
                          background: evt.tone === "accent" ? "rgba(217,119,87,0.12)" : evt.tone === "moss" ? "var(--moss-bg)" : evt.tone === "amber" ? "var(--amber-bg)" : "var(--slate-blue-bg)",
                          borderLeft: `3px solid ${evt.tone === "accent" ? "var(--tempo-orange)" : evt.tone === "moss" ? "var(--moss)" : evt.tone === "amber" ? "var(--amber)" : "var(--slate-blue)"}`,
                          padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500
                        }}>{evt.title}</div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 11: Habits ------------------ */
const ScreenHabits = () => {
  const habits = [
    { title: "Morning pages", streak: 5, longest: 31, pct: 1, freq: "daily" },
    { title: "10-minute walk", streak: 3, longest: 18, pct: 0.5, freq: "daily" },
    { title: "Shutdown sequence", streak: 0, longest: 14, pct: 0, freq: "weekdays" },
    { title: "Read one chapter", streak: 12, longest: 24, pct: 1, freq: "daily" },
    { title: "No screens after 10pm", streak: 2, longest: 9, pct: 0, freq: "daily" },
  ];
  const grid = Array.from({ length: 35 }, (_, i) => Math.random() > 0.35);
  return (
    <>
      <Topbar title="Habits" crumb="Library"/>
      <div className="page">
        <div className="page-header">
          <div className="eyebrow">Library · Habits</div>
          <h1>Pebbles, not trophies.</h1>
          <p className="lede">Streaks are allowed to break. Missed days are never punished — you'll just see a gentle "back in the chair?"</p>
        </div>

        <div className="grid-3" style={{ marginBottom: "var(--space-8)" }}>
          {habits.slice(0, 3).map(h => (
            <div key={h.title} className="card">
              <div className="row-apart" style={{ marginBottom: "var(--space-3)" }}>
                <Ring pct={h.pct} size={40} stroke={3}/>
                <Pill tone={h.streak > 0 ? "moss" : "neutral"}>
                  <I.Flame size={11}/> {h.streak} {h.streak === 1 ? "day" : "days"}
                </Pill>
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 4 }}>{h.title}</h3>
              <div className="caption" style={{ marginBottom: "var(--space-4)" }}>{h.freq} · longest {h.longest}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {grid.slice(0, 14).map((done, i) => (
                  <div key={i} style={{ aspectRatio: 1, borderRadius: 4, background: done ? "var(--tempo-orange)" : "var(--border-soft)", opacity: done ? 1 - i*0.03 : 0.6 }}/>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head"><h3>All habits</h3><button className="btn btn-sm btn-outline"><I.Plus size={14}/>New habit</button></div>
          <div className="stack-2">
            {habits.map(h => (
              <div key={h.title} className="row-apart" style={{ padding: 12, background: "var(--surface-sunken)", borderRadius: 10 }}>
                <div className="row"><Ring pct={h.pct} size={28} stroke={2.5}/><span style={{ fontWeight: 500 }}>{h.title}</span><Pill tone="neutral">{h.freq}</Pill></div>
                <div className="row-tight">
                  <Pill tone={h.streak > 0 ? "moss" : "neutral"}><I.Flame size={11}/>{h.streak}d</Pill>
                  <span className="caption">longest {h.longest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 12: Habit Detail ------------------ */
const ScreenHabitDetail = () => {
  const grid = Array.from({ length: 42 }, (_, i) => i < 40 && Math.random() > 0.3);
  return (
    <>
      <Topbar title="Morning pages" crumb="Habits"/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Habit</div>
            <h1>Morning pages</h1>
            <p className="lede">Three pages, longhand, before anything else. Borrowed from Julia Cameron; kept gentle.</p>
          </div>
          <div className="row-tight">
            <Pill tone="moss"><I.Flame size={11}/> 5-day streak</Pill>
            <button className="btn btn-primary">Mark today done</button>
          </div>
        </div>

        <div className="grid-asym">
          <div className="card">
            <h3>Last 6 weeks</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginTop: 16 }}>
              {grid.map((done, i) => (
                <div key={i} title={done ? "Done" : "—"} style={{ aspectRatio: 1, borderRadius: 6, background: done ? "var(--tempo-orange)" : "var(--border-soft)", opacity: done ? 0.4 + (i/grid.length) * 0.6 : 0.5 }}/>
              ))}
            </div>
            <div className="row-apart" style={{ marginTop: 16 }}>
              <span className="caption">6 weeks ago</span>
              <div className="row-tight"><span className="caption">less</span><div style={{ width: 10, height: 10, background: "var(--border-soft)", borderRadius: 3 }}/><div style={{ width: 10, height: 10, background: "rgba(217,119,87,0.4)", borderRadius: 3 }}/><div style={{ width: 10, height: 10, background: "var(--tempo-orange)", borderRadius: 3 }}/><span className="caption">more</span></div>
              <span className="caption">today</span>
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Stats</div>
              <div className="stack-3">
                <div className="row-apart"><span>Current streak</span><strong>5 days</strong></div>
                <div className="row-apart"><span>Longest streak</span><strong>31 days</strong></div>
                <div className="row-apart"><span>Completion (30d)</span><strong>86%</strong></div>
                <div className="row-apart"><span>Best day</span><strong>Thursday</strong></div>
              </div>
            </div>
            <div className="card sunken flat">
              <div className="eyebrow" style={{ marginBottom: 6 }}>Missed yesterday</div>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 16 }}>"You missed yesterday. That's allowed. Back in the chair?"</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 13: Routines ------------------ */
const ScreenRoutines = () => {
  const routines = [
    { title: "Morning routine", steps: 5, schedule: "Daily · 7:30 AM", last: "Today", rate: 92, icon: "Sun" },
    { title: "Shutdown sequence", steps: 7, schedule: "Weekdays · 4:00 PM", last: "Yesterday", rate: 78, icon: "Moon2" },
    { title: "Weekly review", steps: 9, schedule: "Fri · 3:00 PM", last: "Last Fri", rate: 81, icon: "Repeat" },
    { title: "Deep work kickoff", steps: 4, schedule: "On demand", last: "Mon", rate: 65, icon: "Zap" },
  ];
  return (
    <>
      <Topbar title="Routines" crumb="Library"/>
      <div className="page">
        <div className="page-header row">
          <div>
            <div className="eyebrow">Library · Routines</div>
            <h1>Sequences you don't want to think about.</h1>
            <p className="lede">Step-by-step, with timers, linked tasks, and a guided run mode.</p>
          </div>
          <button className="btn btn-primary"><I.Plus size={14}/>New routine</button>
        </div>

        <div className="grid-2">
          {routines.map(r => {
            const Ic = I[r.icon] || I.Repeat;
            return (
              <div key={r.title} className="card">
                <div className="card-head">
                  <div className="row"><div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tempo-orange)" }}><Ic size={20}/></div><div><h3 style={{ fontSize: 18 }}>{r.title}</h3><div className="caption">{r.steps} steps · {r.schedule}</div></div></div>
                  <button className="btn btn-sm btn-primary"><I.Play size={12}/>Start</button>
                </div>
                <div className="row-apart">
                  <span className="caption">Last: {r.last}</span>
                  <div style={{ width: 140 }}><ProgressBar pct={r.rate}/></div>
                  <span className="mono caption">{r.rate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

/* ------------------ Screen 14: Routine Detail (guided run) ------------------ */
const ScreenRoutineDetail = () => {
  const steps = [
    { t: "Kettle on", d: "90 s", done: true },
    { t: "Open Tempo, check today's plan", d: "2 min", done: true },
    { t: "Morning pages — three pages", d: "15 min", done: true, active: false },
    { t: "Ten-minute walk", d: "10 min", active: true },
    { t: "Shower", d: "8 min" },
  ];
  return (
    <>
      <Topbar title="Morning routine" crumb="Routines"/>
      <div className="page-tight">
        <div className="page-header"><div className="eyebrow">Running · step 4 of 5</div><h1>Ten-minute walk.</h1><p className="lede">No podcast. No phone. Legs, breath, sky. If it's raining, that counts too.</p></div>

        <div className="card" style={{ padding: "var(--space-10)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 72, fontWeight: 500, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>07:42</div>
          <div className="caption" style={{ marginBottom: "var(--space-6)" }}>remaining · target 10 min</div>
          <ProgressBar pct={23} height={8}/>
          <div style={{ marginTop: "var(--space-6)", display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-outline"><I.Pause size={14}/>Pause</button>
            <button className="btn btn-primary"><I.Check size={14}/>Done</button>
            <button className="btn btn-ghost">Skip</button>
          </div>
        </div>

        <div className="card" style={{ marginTop: "var(--space-6)" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>All steps</div>
          <div className="stack-2">
            {steps.map((s, i) => (
              <div key={i} className="row" style={{ padding: 12, background: s.active ? "var(--surface-sunken)" : "transparent", borderRadius: 10, border: s.active ? "1px solid var(--tempo-orange)" : "1px solid transparent" }}>
                <div style={{ width: 22, height: 22, borderRadius: 99, background: s.done ? "var(--moss)" : s.active ? "var(--tempo-orange)" : "var(--border)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>{s.done ? "✓" : i+1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, textDecoration: s.done ? "line-through" : "none", color: s.done ? "var(--fg-muted)" : "var(--fg)" }}>{s.t}</div>
                  <div className="caption">{s.d}</div>
                </div>
                {s.active && <Pill tone="accent">now</Pill>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { ScreenNotes, ScreenNoteDetail, ScreenJournal, ScreenCalendar, ScreenHabits, ScreenHabitDetail, ScreenRoutines, ScreenRoutineDetail });
