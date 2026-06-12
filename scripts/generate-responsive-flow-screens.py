#!/usr/bin/env python3
"""Generate responsive HTML screen variants for Tempo Flow design grind."""

from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "docs" / "design" / "screens"
BREAKPOINTS = {
    "desktop": "tf-desktop",
    "tablet": "tf-tablet",
    "mobile": "tf-mobile",
}

FLOW_NAV = [
    ("daily-note", "Daily Note", "📓"),
    ("today", "Today", "🏠"),
    ("brain-dump", "Brain Dump", "✨"),
    ("coach", "Coach", "🎙"),
    ("plan", "Planning", "📅"),
]

LIBRARY_NAV = [
    ("tasks", "Tasks", "☑"),
    ("notes", "Notes", "📓"),
    ("journal", "Journal", "📖"),
    ("calendar", "Calendar", "📅"),
    ("habits", "Habits", "🔥"),
]

TASKS_TODAY = [
    ("Morning pages", "08:00", "15 min", "low", True, False),
    ("Draft Tempo 1.0 launch post", "09:30", "60 min", "high", False, True),
    ("Review PRs from yesterday", "11:00", "30 min", "medium", False, False),
    ("10-minute walk", "12:30", "10 min", "low", False, False),
    ("Respond to three founder questions", "14:00", "25 min", "medium", False, True),
]

BRAIN_ITEMS = [
    ("task", "Finish the landing copy", "94"),
    ("task", "Book dentist", "97"),
    ("task", "Ask Sam about the Convex migration", "91"),
    ("reminder", "Pick up groceries on the way home", "86"),
    ("worry", "Am I shipping fast enough?", "88"),
    ("idea", "Orange gradient on the first-run splash", "82"),
    ("reminder", "Journal about the talk", "79"),
]

PLAN_BLOCKS = [
    ("8:00", "8:15", "Morning pages", "moss"),
    ("9:30", "10:30", "Draft Tempo 1.0 launch post", "accent"),
    ("11:00", "11:30", "Review PRs", "slate"),
    ("12:30", "12:40", "10-minute walk", "moss"),
    ("14:00", "14:25", "Respond to founder Qs", "accent"),
]


def head(screen_id: str, title: str, bp: str) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{title} · {bp} · Tempo Flow</title>
  <link rel="stylesheet" href="../../tokens.css"/>
  <link rel="stylesheet" href="../../responsive-shell.css"/>
</head>
<body class="{BREAKPOINTS[bp]}" data-screen="{screen_id}" data-breakpoint="{bp}">"""


def sidebar(active: str) -> str:
    flow_items = "".join(
        f'          <button class="nav-item{" is-active" if i == active else ""}"><span>{icon}</span><span>{label}</span></button>\n'
        for i, label, icon in [("daily-note", "Daily Note", "📓"), ("today", "Today", "🏠"), ("brain-dump", "Brain Dump", "✨"), ("coach", "Coach", "🎙"), ("plan", "Planning", "📅")]
    )
    lib_items = "".join(
        f'          <button class="nav-item"><span>{icon}</span><span>{label}</span><span class="badge">{"12" if i == "tasks" else ""}</span></button>\n'
        for i, label, icon in LIBRARY_NAV
    )
    return f"""  <!-- @tfComponent TF.Shell.App -->
  <div class="app">
    <!-- @tfComponent TF.Shell.Sidebar -->
    <aside class="sidebar">
      <!-- @tfComponent TF.Shell.BrandMark -->
      <div class="sidebar-brand"><span class="brand-mark">◐</span><span class="brand-name">Tempo<em>Flow</em></span></div>
      <div class="sidebar-section">
        <h4>Flow</h4>
{flow_items}      </div>
      <div class="sidebar-section">
        <h4>Library</h4>
{lib_items}      </div>
      <!-- @tfComponent TF.Shell.UserChip -->
      <div style="margin-top:auto;padding-top:var(--space-4);border-top:1px solid var(--border)">
        <div class="row" style="padding:var(--space-3)">
          <div style="width:32px;height:32px;border-radius:99px;background:var(--gradient-tempo);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600">A</div>
          <div><div style="font-size:13px;font-weight:500">Amit</div><div class="caption">Pro · 5-day streak</div></div>
        </div>
      </div>
    </aside>"""


def sidebar_rail(active: str) -> str:
    icons = [("today", "🏠"), ("brain-dump", "✨"), ("coach", "🎙"), ("plan", "📅"), ("tasks", "☑")]
    items = "".join(
        f'      <button class="nav-item{" is-active" if i == active else ""}" title="{i}"><span class="sr-only">{i}</span><span>{icon}</span></button>\n'
        for i, icon in icons
    )
    return f"""  <!-- @tfComponent TF.Shell.App -->
  <div class="app">
    <!-- @tfComponent TF.Shell.SidebarRail -->
    <aside class="sidebar-rail">
      <div style="font-family:var(--font-serif);font-weight:600;color:var(--tempo-orange)">T</div>
{items}    </aside>"""


def bottom_nav(active: str) -> str:
    items = [("today", "Today", "🏠"), ("brain-dump", "Dump", "✨"), ("coach", "Coach", "🎙"), ("plan", "Plan", "📅")]
    links = "".join(
        f'    <a href="#" class="{"is-active" if i == active else ""}"><span class="nav-icon">{icon}</span>{label}</a>\n'
        for i, label, icon in items
    )
    return f"""    <!-- @tfComponent TF.Shell.BottomNav -->
    <nav class="bottom-nav" aria-label="Primary">
{links}    </nav>"""


def topbar(title: str, crumb: str, right: str, mobile: bool = False) -> str:
    menu = '      <button class="icon-btn mobile-menu-btn" aria-label="Open menu">☰</button>\n' if mobile else ""
    return f"""    <div class="app-main">
      <!-- @tfComponent TF.Shell.Topbar -->
      <header class="topbar">
{menu}        <div class="breadcrumb"><strong>{title}</strong> · {crumb}</div>
        <div class="spacer"></div>
        {right}
      </header>"""


def task_row(title: str, time: str, est: str, energy: str, done: bool, ai: bool) -> str:
    cls = "task-row is-done" if done else "task-row"
    ai_pill = '<span class="pill pill-accent">AI</span>' if ai else ""
    return f"""                <!-- @tfComponent TF.Card.Task -->
                <div class="{cls}">
                  <button class="check" aria-label="Toggle task">{'✓' if done else ''}</button>
                  <div class="task-main">
                    <div class="task-title">{title}</div>
                    <div class="task-meta"><span>{time}</span><span>{est}</span><span class="pill">{energy}</span>{ai_pill}</div>
                  </div>
                </div>"""


def shell_open(screen_id: str, bp: str, title: str, crumb: str, right: str, bare: bool = False) -> str:
    if bare:
        return head(screen_id, title, bp)
    if bp == "mobile":
        return head(screen_id, title, bp) + "\n" + sidebar_rail(screen_id) + "\n" + topbar(title, crumb, right, mobile=True)
    if bp == "tablet":
        return head(screen_id, title, bp) + "\n" + sidebar_rail(screen_id) + "\n" + topbar(title, crumb, right)
    return head(screen_id, title, bp) + "\n" + sidebar(screen_id) + "\n" + topbar(title, crumb, right)


def shell_close(screen_id: str, bp: str, bare: bool = False) -> str:
    nav = bottom_nav(screen_id) if bp == "mobile" and not bare else ""
    return f"""    </div>
  </div>
{nav}</body>
</html>
"""


def limit_class(bp: str) -> str:
    return " mobile-limit-5" if bp == "mobile" else ""


def screen_today(bp: str) -> str:
    tasks = TASKS_TODAY if bp != "mobile" else TASKS_TODAY[:5]
    task_html = "\n".join(task_row(*t) for t in tasks)
    up_next = ["11:00 Review PRs · 30 min", "12:30 10-minute walk", "14:00 Respond to founder Qs"]
    if bp == "mobile":
        up_next = up_next[:3]
    up_html = "\n".join(
        f'                <div class="row" style="padding:8px 0;border-bottom:1px solid var(--border-soft)"><span>🕐</span><span style="font-size:14px">{x}</span></div>'
        for x in up_next
    )
    cta = '<button class="btn btn-gradient">Plan with Coach</button>'
    if bp == "mobile":
        cta = '<button class="btn btn-gradient btn-lg mobile-primary-cta" style="width:100%">Plan with Coach</button>'
    content = shell_open("today", bp, "Today", "Thursday, April 23", cta)
    content += f"""
      <main class="page">
        <!-- @tfComponent TF.Page.Header -->
        <header class="page-header row">
          <div>
            <!-- @tfComponent TF.Page.Eyebrow -->
            <div class="eyebrow">Thursday · April 23</div>
            <h1>Good morning, Amit.</h1>
            <p class="lede">Three things look doable this afternoon. Your energy tends to dip after lunch — that's allowed.</p>
          </div>
          <div class="row">
            <!-- @tfComponent TF.EnergyBar -->
            <div><div class="eyebrow">Energy</div><div class="pill pill-moss">4 / 5</div></div>
            <div class="divider-vert" style="height:40px"></div>
            <div><div class="eyebrow">Streak</div><div style="font-family:var(--font-serif);font-size:22px">5 days</div></div>
          </div>
        </header>

        <div class="grid-asym">
          <div class="stack">
            <!-- @tfComponent TF.Card -->
            <section class="card">
              <!-- @tfComponent TF.Card.Head -->
              <div class="card-head">
                <div><div class="eyebrow">Today's anchors</div><h2>{sum(t[4] for t in tasks)} of {len(tasks)} things</h2></div>
                <div class="row">
                  <!-- @tfComponent TF.Ring -->
                  <div class="ring" style="width:40px;height:40px"><span class="ring-label">20</span></div>
                  <!-- @tfComponent TF.Button.Outline -->
                  <button class="btn btn-sm btn-outline">+ Add</button>
                </div>
              </div>
              <div class="stack-2{limit_class(bp)}">
{task_html}
              </div>
              <!-- @tfComponent TF.AcceptStrip -->
              <div class="accept-strip" style="margin-top:var(--space-4)">
                <p class="strip-text">Two overdue things from yesterday. Carry them to today, or let them rest?</p>
                <button class="btn btn-sm btn-primary">Carry over</button>
                <button class="btn btn-sm btn-ghost">Let rest</button>
              </div>
            </section>

            <!-- @tfComponent TF.Card.Sunken -->
            <section class="card sunken">
              <!-- @tfComponent TF.Coach.Bubble -->
              <div class="coach-bubble">Nice work on morning pages. When you're ready, the Tempo 1.0 post is the biggest thing — sixty minutes, high-energy. Want me to stage the outline first?</div>
              <div class="row-tight" style="margin-top:var(--space-4)">
                <button class="btn btn-sm btn-primary">Stage the outline</button>
                <button class="btn btn-sm btn-ghost">Not now</button>
              </div>
            </section>
          </div>

          <div class="stack">
            <section class="card">
              <div class="eyebrow" style="margin-bottom:12px">Habits · today</div>
              <div class="stack-3{limit_class(bp)}">
                <!-- @tfComponent TF.Card.Habit -->
                <div class="row-apart"><div class="row"><div class="ring" style="width:32px;height:32px"></div><span style="font-weight:500">Morning pages</span></div><span class="pill pill-moss">5-day streak</span></div>
                <div class="row-apart"><div class="row"><div class="ring" style="width:32px;height:32px"></div><span style="font-weight:500">10-min walk</span></div><span class="pill pill-amber">due</span></div>
                <div class="row-apart"><div class="row"><div class="ring" style="width:32px;height:32px"></div><span style="font-weight:500">Shutdown sequence</span></div><span class="pill">8pm</span></div>
              </div>
            </section>
            <section class="card">
              <div class="eyebrow" style="margin-bottom:12px">Up next</div>
              <!-- @tfComponent TF.List.UpNext -->
              <div class="stack-3">
{up_html}
              </div>
            </section>
            <section class="card sunken flat">
              <!-- @tfComponent TF.List.Pebble -->
              <div class="eyebrow" style="margin-bottom:10px">Pebble of the day</div>
              <p style="font-family:var(--font-serif);font-size:18px;line-height:1.5">"10 minute walk" beats "some movement." — small, gentle, specific.</p>
            </section>
          </div>
        </div>
      </main>"""
    return content + shell_close("today", bp)


def screen_brain_dump(bp: str) -> str:
    items = BRAIN_ITEMS if bp != "mobile" else BRAIN_ITEMS[:5]
    sorted_rows = "\n".join(
        f"""                <!-- @tfComponent TF.Card.SortedItem -->
                <div class="row-apart" style="padding:12px 16px;background:var(--surface-sunken);border-radius:10px">
                  <div class="row"><span class="pill pill-{"accent" if t == "task" else "slate" if t == "reminder" else "amber"}">{t}</span><span>{text}</span></div>
                  <div class="row-tight"><span class="caption mono">{conf}%</span><button class="btn btn-sm btn-primary">Accept</button><button class="btn btn-sm btn-ghost">Skip</button></div>
                </div>"""
        for t, text, conf in items
    )
    cta = '<button class="btn btn-gradient">✨ Sort it</button>'
    if bp == "mobile":
        cta = '<button class="btn btn-gradient btn-lg mobile-primary-cta" style="width:100%">✨ Sort it</button>'
    content = shell_open("brain-dump", bp, "Brain Dump", "Flow", cta)
    content += f"""
      <main class="page">
        <header class="page-header">
          <div class="eyebrow">Brain Dump</div>
          <h1>Everything on your mind.</h1>
          <p class="lede">Don't organize it. Just type. I'll sort it into tasks, reminders, ideas, and worries — then you approve what sticks.</p>
        </header>
        <div class="grid-asym">
          <section class="card">
            <div class="card-head"><h3>Dump</h3><span class="caption mono">312 chars · 58 words</span></div>
            <!-- @tfComponent TF.Field.Textarea -->
            <div class="field"><textarea style="min-height:280px;font-family:var(--font-serif);font-size:18px">Remember to finish the landing copy. Book dentist. Ask Sam about the Convex migration. Pick up groceries on the way home. Worry: am I shipping fast enough?</textarea></div>
            <div class="row-apart" style="margin-top:var(--space-4)">
              <span class="caption">End-to-end encrypted. Only you see this.</span>
              {cta}
            </div>
          </section>
          <div class="stack">
            <section class="card">
              <div class="eyebrow" style="margin-bottom:8px">Gentle prompts</div>
              <div class="stack-2{limit_class(bp)}">
                <!-- @tfComponent TF.Card.Prompt -->
                <div style="padding:10px;background:var(--surface-sunken);border-radius:10px;font-family:var(--font-serif);font-size:14px">What's one thing you've been avoiding?</div>
                <div style="padding:10px;background:var(--surface-sunken);border-radius:10px;font-family:var(--font-serif);font-size:14px">Any small wins from yesterday?</div>
                <div style="padding:10px;background:var(--surface-sunken);border-radius:10px;font-family:var(--font-serif);font-size:14px">What would help your shoulders drop?</div>
              </div>
            </section>
          </div>
        </div>
        <section class="card" style="margin-top:var(--space-8)">
          <div class="card-head">
            <div><div class="eyebrow">Sorted — {len(items)} items</div><h3>Review and approve</h3></div>
            <div class="row-tight">
              <button class="btn btn-sm btn-outline">Approve all</button>
              <button class="btn btn-sm btn-ghost">Skip all</button>
            </div>
          </div>
          <div class="stack-2{limit_class(bp)}">
{sorted_rows}
          </div>
        </section>
      </main>"""
    return content + shell_close("brain-dump", bp)


def screen_coach(bp: str) -> str:
    cta = '<button class="btn btn-primary btn-sm">Send</button>'
    content = shell_open("coach", bp, "Coach", "Flow", '<span class="pill pill-moss">Online</span>')
    content += f"""
      <main class="page-tight">
        <header class="page-header">
          <div class="eyebrow">Coach</div>
          <h1>A quiet second brain.</h1>
          <p class="lede">Warmth dial at <strong>6/10</strong> — gently offering, not saccharine. Coach sees only the notes and projects you share.</p>
        </header>
        <div class="grid-asym">
          <section class="card" style="padding:0;display:flex;flex-direction:column;min-height:480px">
            <!-- @tfComponent TF.Coach.Thread -->
            <div style="flex:1;padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4);overflow-y:auto">
              <div class="caption" style="text-align:center">Thursday, 9:12 AM</div>
              <div class="coach-bubble">Morning. I noticed you dumped seven things earlier. Three of them look like worries about shipping. Want to talk about those, or should I stage the tasks first?</div>
              <div class="user-bubble">Stage the tasks. I'll come back to the worries tonight.</div>
              <div class="coach-bubble">Good. I'll add <em>Finish landing copy</em>, <em>Book dentist</em>, and <em>Ask Sam about Convex</em> to today.</div>
            </div>
            <!-- @tfComponent TF.Coach.Composer -->
            <div style="padding:var(--space-4) var(--space-5);border-top:1px solid var(--border)">
              <div class="field"><textarea placeholder="Type, or hold to dictate…" style="min-height:44px"></textarea></div>
              <div class="row-tight" style="margin-top:8px">
                <button class="btn btn-sm btn-primary" style="{"width:100%" if bp == "mobile" else ""}">Send</button>
                <span class="pill pill-accent">Stage tasks</span>
                <span class="pill">Draft journal prompt</span>
              </div>
            </div>
          </section>
          <div class="stack">
            <!-- @tfComponent TF.Coach.PersonalityDial -->
            <section class="card">
              <div class="eyebrow" style="margin-bottom:10px">Personality dial</div>
              <div style="font-family:var(--font-serif);font-size:20px;margin-bottom:8px">Gentle</div>
              <div style="height:8px;background:var(--surface-sunken);border-radius:99px"><div style="width:60%;height:100%;background:var(--gradient-tempo);border-radius:99px"></div></div>
            </section>
            <!-- @tfComponent TF.Coach.ScopeList -->
            <section class="card">
              <div class="eyebrow" style="margin-bottom:10px">Conversation scope</div>
              <div class="stack-2"><div class="row"><span>📓</span><span>Launch notes</span></div><div class="row"><span>📁</span><span>Tempo 1.0</span></div></div>
            </section>
          </div>
        </div>
      </main>"""
    return content + shell_close("coach", bp)


def screen_plan(bp: str) -> str:
    blocks = PLAN_BLOCKS if bp != "mobile" else PLAN_BLOCKS[:5]
    block_html = "\n".join(
        f"""                <!-- @tfComponent TF.Card.TimelineBlock -->
                <div style="padding:8px 12px;margin:4px 0;background:var(--{"moss" if t == "moss" else "slate-blue" if t == "slate" else "tempo-orange"}-bg);border-left:3px solid var(--{"moss" if t == "moss" else "slate-blue" if t == "slate" else "tempo-orange"});border-radius:8px">
                  <div style="font-weight:500">{title}</div><div class="caption">{start}–{end}</div>
                </div>"""
        for start, end, title, t in blocks
    )
    cta = '<button class="btn btn-primary">✨ Re-plan</button>'
    content = shell_open("plan", bp, "Planning", "Flow", cta)
    content += f"""
      <main class="page">
        <header class="page-header row">
          <div>
            <div class="eyebrow">Plan · Thursday</div>
            <h1>Let's stage today.</h1>
            <p class="lede">Coach suggests six blocks based on yesterday's energy curve and your two anchors (pages + walk).</p>
          </div>
          <div class="row-tight">
            <!-- @tfComponent TF.SegControl -->
            <div class="seg-control"><button class="is-active">Day</button><button>Week</button></div>
            {cta}
          </div>
        </header>
        <div class="grid-asym">
          <section class="card">
            <div class="card-head"><h3>Timeline</h3><div class="caption">{len(blocks)} blocks · 2h 30m focused work</div></div>
            <!-- @tfComponent TF.Timeline -->
            <div class="stack-2{limit_class(bp)}">
{block_html}
            </div>
          </section>
          <div class="stack">
            <section class="card">
              <div class="eyebrow" style="margin-bottom:10px">Energy check-in</div>
              <div class="pill pill-moss">4 / 5 alert</div>
            </section>
            <section class="card sunken flat">
              <div class="coach-bubble">Five things feels full but fine. If the afternoon wobbles, the founder questions can slide to Friday.</div>
            </section>
          </div>
        </div>
      </main>"""
    return content + shell_close("plan", bp)


def screen_daily_note(bp: str) -> str:
    tasks = [
        ("Morning pages — Journal", True),
        ("Draft launch post, first pass", True),
        ("Ten-minute walk (non-negotiable", False),
        ("Respond to founder Qs in Tempo 1.0", False),
        ("Evening shutdown — close loops", False),
    ]
    if bp == "mobile":
        tasks = tasks[:5]
    task_html = "\n".join(
        f'          <div class="task-row{" is-done" if d else ""}"><button class="check">{"✓" if d else ""}</button><span>{t}</span></div>'
        for t, d in tasks
    )
    content = head("daily-note", "Daily Note", bp)
    content += """
  <!-- @tfComponent TF.Shell.App -->
  <div class="note-layout">
    <!-- @tfComponent TF.Note.CalendarRail -->
    <aside class="note-calendar">
      <div class="calendar-detail" style="padding:var(--space-4)">
        <div class="sidebar-brand"><span>Tempo<em>Flow</em></span></div>
        <div class="eyebrow" style="margin:12px 0">April 2026</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;font-size:11px;text-align:center">
          <span>23</span>
        </div>
        <div style="margin-top:16px" class="stack-2">
          <button class="nav-item is-active">Today</button>
          <button class="nav-item">This week</button>
          <button class="nav-item">Projects <span class="badge">4</span></button>
        </div>
      </div>
    </aside>
    <main class="note-editor">
      <!-- @tfComponent TF.Shell.Topbar -->
      <header class="topbar" style="position:sticky;top:0">
        <button class="icon-btn mobile-menu-btn">☰</button>
        <span class="mono caption">2026-04-23.md</span>
        <div class="spacer"></div>
        <button class="btn btn-sm btn-outline">⌘K Quick switch</button>
      </header>
      <!-- @tfComponent TF.Note.Editor -->
      <article style="max-width:720px;margin:0 auto;padding:32px">
        <div class="eyebrow" style="color:var(--tempo-orange)">Thursday · April 23 · Week 17</div>
        <h1>☀️ Today</h1>
        <p style="font-style:italic;color:var(--fg-muted);margin:16px 0">Three things look doable this afternoon. I pulled them from your dump — the worry I parked for tomorrow.</p>
        <h2>Tasks</h2>
        <div class="stack-2""" + limit_class(bp) + """">
""" + task_html + """
        </div>
        <h2 style="margin-top:24px">Linked mentions</h2>
        <!-- @tfComponent TF.Card.Backlink -->
        <div class="card" style="margin-top:8px;padding:14px">
          <div class="caption">3 backlinks · #writing</div>
          <div style="margin-top:8px;font-size:13px;color:var(--tempo-orange)">2026-04-22.md</div>
          <p style="font-size:13px;color:var(--fg-muted)">Got the structure for launch post — three sections, intro is hardest.</p>
        </div>
      </article>
    </main>
    <!-- @tfComponent TF.Note.RightRail -->
    <aside class="note-right" style="padding:var(--space-4)">
      <div class="eyebrow">Focus</div>
      <div class="row-tight" style="margin:12px 0"><button class="btn btn-sm btn-outline">−5m</button><button class="btn btn-sm btn-primary">Pause</button><button class="btn btn-sm btn-outline">+5m</button></div>
      <div class="eyebrow" style="margin-top:20px">Quick dump</div>
      <div class="field" style="margin-top:8px"><textarea placeholder="Capture without leaving the note…"></textarea></div>
      <button class="btn btn-gradient" style="margin-top:12px;width:100%">Send to Brain Dump</button>
    </aside>
  </div>
"""
    if bp == "mobile":
        content += bottom_nav("daily-note")
    content += "</body>\n</html>\n"
    return content


GENERATORS = {
    "today": screen_today,
    "brain-dump": screen_brain_dump,
    "coach": screen_coach,
    "plan": screen_plan,
    "daily-note": screen_daily_note,
}


def main() -> None:
    for screen_id, gen in GENERATORS.items():
        for bp in BREAKPOINTS:
            out_dir = ROOT / screen_id
            out_dir.mkdir(parents=True, exist_ok=True)
            path = out_dir / f"{bp}.html"
            path.write_text(gen(bp), encoding="utf-8")
            print(f"wrote {path.relative_to(ROOT.parent.parent)}")


if __name__ == "__main__":
    main()
