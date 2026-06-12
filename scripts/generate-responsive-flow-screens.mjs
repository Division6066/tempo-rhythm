#!/usr/bin/env node
/**
 * Generates responsive HTML for flow-01 batch screens.
 * Output: docs/design/screens/{id}/{desktop,tablet,mobile}.html
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "docs", "design", "screens");

const NAV = [
  { group: "Flow", items: [
    { id: "daily-note", label: "Daily Note", active: false },
    { id: "today", label: "Today", active: true },
    { id: "brain-dump", label: "Brain Dump", active: false },
    { id: "coach", label: "Coach", active: false },
    { id: "plan", label: "Planning", active: false },
  ]},
  { group: "Library", items: [
    { id: "tasks", label: "Tasks", badge: "12" },
    { id: "notes", label: "Notes" },
    { id: "journal", label: "Journal" },
    { id: "calendar", label: "Calendar" },
  ]},
];

function head(title, layout) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tempo Flow · ${title}</title>
  <link rel="stylesheet" href="../../tokens.css">
  <link rel="stylesheet" href="../../shell.css">
  <link rel="stylesheet" href="../../responsive-layout.css">
</head>
<body data-layout="${layout}">`;
}

function sidebar(activeId) {
  const groups = NAV.map(g => `
      <!-- @tfComponent TF.Nav.Group -->
      <div class="sidebar-section">
        <h4>${g.group}</h4>
        ${g.items.map(item => `
        <!-- @tfComponent TF.Nav.Item -->
        <a class="nav-item${item.id === activeId ? " is-active" : ""}" href="../${item.id}/desktop.html">
          <span>${item.label}</span>${item.badge ? `<span class="badge">${item.badge}</span>` : ""}
        </a>`).join("")}
      </div>`).join("");
  return `
  <!-- @tfComponent TF.Shell.Sidebar -->
  <aside class="sidebar scroll-subtle">
    <!-- @tfComponent TF.Brand.Mark -->
    <div class="sidebar-brand">
      <span class="brand-name">Tempo<em>Flow</em></span>
    </div>
    ${groups}
    <!-- @tfComponent TF.Nav.UserFooter -->
    <div style="margin-top:auto;padding-top:var(--space-4);border-top:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3)">
        <div style="width:32px;height:32px;border-radius:99px;background:var(--gradient-tempo);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">A</div>
        <div><div style="font-size:13px;font-weight:500">Amit</div><div class="caption">Pro · 5-day streak</div></div>
      </div>
    </div>
  </aside>`;
}

function sidebarRail(activeId) {
  const icons = { "daily-note": "📝", today: "🏠", "brain-dump": "✨", coach: "🎙", plan: "📋", tasks: "☑", notes: "📓", journal: "📖" };
  const items = NAV.flatMap(g => g.items);
  return `
  <!-- @tfComponent TF.Shell.SidebarRail -->
  <nav class="sidebar-rail" aria-label="Main">
    ${items.map(item => `
    <a class="rail-item${item.id === activeId ? " is-active" : ""}" href="../${item.id}/tablet.html" title="${item.label}">${icons[item.id] || "•"}</a>`).join("")}
  </nav>`;
}

function bottomNav(activeId) {
  const tabs = [
    { id: "today", label: "Today", icon: "🏠" },
    { id: "brain-dump", label: "Dump", icon: "✨" },
    { id: "coach", label: "Coach", icon: "🎙" },
    { id: "plan", label: "Plan", icon: "📋" },
    { id: "tasks", label: "Tasks", icon: "☑" },
  ];
  return `
  <!-- @tfComponent TF.Shell.BottomNav -->
  <nav class="bottom-nav" aria-label="Primary">
    ${tabs.map(t => `<a href="../${t.id}/mobile.html" class="${t.id === activeId ? "is-active" : ""}"><span>${t.icon}</span>${t.label}</a>`).join("")}
  </nav>`;
}

function drawer(activeId) {
  const nav = sidebar(activeId)
    .trim()
    .replace(
      /<!-- @tfComponent TF\.Shell\.Sidebar -->\s*<aside class="sidebar scroll-subtle">/,
      '<!-- @tfComponent TF.Shell.Sidebar -->\n  <div class="sidebar scroll-subtle" style="position:static;width:100%;height:auto;border:0">',
    )
    .replace(/<\/aside>\s*$/, "</div>");
  return `
  <!-- @tfComponent TF.Shell.Drawer -->
  <aside class="drawer" id="nav-drawer">
    ${nav}
  </aside>
  <div class="drawer-overlay" onclick="document.getElementById('nav-drawer').classList.remove('is-open')"></div>`;
}

function topbar(title, crumb, right = "", layout) {
  const menu = layout === "mobile" ? `<button class="menu-btn" aria-label="Menu" onclick="document.getElementById('nav-drawer').classList.add('is-open')">☰</button>` : "";
  return `
    <!-- @tfComponent TF.Shell.Topbar -->
    <header class="topbar">
      ${menu}
      <div class="breadcrumb">${crumb ? `<span>${crumb} · </span>` : ""}<strong>${title}</strong></div>
      <div class="spacer"></div>
      ${right}
      <button class="icon-btn" title="Search" aria-label="Search">🔍</button>
      <button class="icon-btn" title="Notifications" aria-label="Notifications">🔔</button>
    </header>`;
}

function shellWrap(activeId, layout, title, crumb, right, body) {
  const bare = activeId === "daily-note";
  if (bare) {
    return `${head(title, layout)}
${body}
${layout === "mobile" ? bottomNav(activeId) : ""}
</body></html>`;
  }
  return `${head(title, layout)}
<!-- @tfComponent TF.Shell.App -->
<div class="app">
  ${layout === "desktop" ? sidebar(activeId) : ""}
  ${layout === "tablet" ? sidebarRail(activeId) : ""}
  ${layout === "mobile" ? drawer(activeId) : ""}
  <div class="app-main">
    ${topbar(title, crumb, right, layout)}
    ${body}
  </div>
</div>
${layout === "mobile" ? bottomNav(activeId) : ""}
</body></html>`;
}

function taskRow(task, extraClass = "") {
  return `
          <!-- @tfComponent TF.TaskRow -->
          <div class="task-row${task.done ? " is-done" : ""}${extraClass ? ` ${extraClass}` : ""}">
            <button class="check" aria-label="Toggle task"></button>
            <div class="task-main">
              <div class="task-title">${task.title}</div>
              <div class="task-meta">
                ${task.time ? `<span>${task.time}</span>` : ""}
                ${task.est ? `<span>· ${task.est} min</span>` : ""}
                ${task.energy ? `<!-- @tfComponent TF.Pill --><span class="pill pill-${task.energy === "high" ? "accent" : task.energy === "low" ? "slate" : "moss"}">${task.energy} energy</span>` : ""}
              </div>
            </div>
            ${task.ai ? `<!-- @tfComponent TF.Pill --><span class="pill pill-accent">AI</span>` : ""}
          </div>`;
}

const tasks = [
  { title: "Morning pages", time: "08:00", est: 15, energy: "low", done: true },
  { title: "Draft Tempo 1.0 launch post", time: "09:30", est: 60, energy: "high", tag: "writing", done: false, ai: true },
  { title: "Review PRs from yesterday", time: "11:00", est: 30, energy: "medium", done: false },
  { title: "10-minute walk", time: "12:30", est: 10, energy: "low", done: false },
  { title: "Respond to three founder questions", time: "14:00", est: 25, energy: "medium", done: false, ai: true },
];

function screenToday(layout) {
  const visibleTasks = layout === "mobile" ? tasks.slice(0, 3) : tasks;
  const right = layout === "mobile"
    ? ""
    : `<!-- @tfComponent TF.Button.Gradient --><button class="btn btn-sm btn-gradient">✨ Plan with Coach</button>`;
  const mobileCta = layout === "mobile" ? `
    <div class="mobile-primary-cta">
      <!-- @tfComponent TF.Button.Gradient -->
      <a class="btn btn-gradient" href="../plan/mobile.html" style="display:flex;text-decoration:none">✨ Plan with Coach</a>
    </div>` : "";
  const body = `
    <!-- @tfComponent TF.Page.Container -->
    <div class="page">
      <!-- @tfComponent TF.Page.Header -->
      <div class="page-header row">
        <div>
          <div class="eyebrow">Thursday · April 23</div>
          <h1${layout === "desktop" ? ' style="font-size:40px"' : ""}>Good morning, Amit.</h1>
          <p class="lede">Three things look doable this afternoon. Your energy tends to dip after lunch — that's allowed.</p>
        </div>
        <div class="row hide-mobile">
          <div style="text-align:right">
            <div class="eyebrow">Energy</div>
            <!-- @tfComponent TF.EnergyBar -->
            <div style="display:inline-flex;gap:3">${[1,2,3,4,5].map(i => `<span style="width:16px;height:6px;border-radius:99px;background:${i <= 4 ? "var(--tempo-orange)" : "var(--border)"}"></span>`).join("")}</div>
          </div>
          <div class="divider-vert" style="height:40px"></div>
          <div style="text-align:right">
            <div class="eyebrow">Streak</div>
            <div style="font-family:var(--font-serif);font-size:22px;font-weight:500">5 days</div>
          </div>
        </div>
      </div>

      <div class="grid-asym">
        <!-- @tfComponent TF.Stack -->
        <div class="stack">
          <!-- @tfComponent TF.Card.TaskList -->
          <div class="card">
            <div class="card-head">
              <div>
                <div class="eyebrow">Today's anchors</div>
                <h2>1 of 5 things</h2>
              </div>
              <div class="row-tight">
                <!-- @tfComponent TF.Ring -->
                <span class="ring" style="width:40px;height:40px"><svg width="40" height="40"><circle class="ring-track" cx="20" cy="20" r="18" stroke-width="3"/><circle class="ring-fill" cx="20" cy="20" r="18" stroke-width="3" style="stroke-dasharray:113;stroke-dashoffset:90"/></svg><span class="ring-label">20</span></span>
                <!-- @tfComponent TF.Button.Outline --><button class="btn btn-sm btn-outline">+ Add</button>
              </div>
            </div>
            <div class="stack-2">
              ${visibleTasks.map((t, i) => taskRow(t, i >= 3 && layout === "mobile" ? "hide-mobile" : "")).join("")}
            </div>
            <!-- @tfComponent TF.AcceptStrip -->
            <div class="accept-strip">
              <div class="strip-text">Two overdue things from yesterday. Carry them to today, or let them rest?</div>
              <button class="btn btn-sm btn-primary">Accept</button>
              <button class="btn btn-sm btn-outline">Tweak</button>
              <button class="btn btn-sm btn-ghost">Skip</button>
            </div>
          </div>

          <!-- @tfComponent TF.Card.CoachSuggestion -->
          <div class="card sunken">
            <!-- @tfComponent TF.Coach.Bubble -->
            <div style="display:flex;gap:var(--space-3);align-items:flex-start">
              <div class="coach-avatar">T</div>
              <div class="coach-bubble">Nice work on morning pages. When you're ready, the Tempo 1.0 post is the biggest thing — sixty minutes, high-energy. Want me to stage the outline first?</div>
            </div>
            <div style="margin-top:var(--space-4);display:flex;gap:8">
              <button class="btn btn-sm btn-primary">Stage the outline</button>
              <button class="btn btn-sm btn-ghost">Not now</button>
            </div>
          </div>
        </div>

        <!-- @tfComponent TF.Stack -->
        <div class="stack">
          <!-- @tfComponent TF.Card.Habits -->
          <div class="card">
            <div class="eyebrow" style="margin-bottom:12px">Habits · today</div>
            <div class="stack-3">
              <div class="row-apart"><div class="row"><span>Morning pages</span></div><!-- @tfComponent TF.Pill --><span class="pill pill-moss">5-day streak</span></div>
              <div class="row-apart"><div class="row"><span>10-min walk</span></div><span class="pill pill-amber">due</span></div>
              ${layout !== "mobile" ? `<div class="row-apart"><div class="row"><span>Shutdown sequence</span></div><span class="pill">8pm</span></div>` : ""}
            </div>
          </div>
          <!-- @tfComponent TF.Card.UpNext -->
          <div class="card">
            <div class="eyebrow" style="margin-bottom:12px">Up next</div>
            <div class="stack-3">
              <div class="row" style="padding:8px 0;border-bottom:1px solid var(--border-soft)"><span style="font-size:14px">11:00 Review PRs · 30 min</span></div>
              <div class="row" style="padding:8px 0;border-bottom:1px solid var(--border-soft)"><span style="font-size:14px">12:30 10-minute walk</span></div>
              ${layout !== "mobile" ? `<div class="row" style="padding:8px 0"><span style="font-size:14px">14:00 Respond to founder Qs</span></div>` : ""}
            </div>
          </div>
          ${layout !== "mobile" ? `<!-- @tfComponent TF.Card.Pebble -->
          <div class="card sunken flat">
            <div class="eyebrow" style="margin-bottom:10px">Pebble of the day</div>
            <p style="font-family:var(--font-serif);font-size:18px;line-height:1.5">"10 minute walk" beats "some movement." — small, gentle, specific.</p>
          </div>` : ""}
        </div>
      </div>
      ${mobileCta}
    </div>`;
  return shellWrap("today", layout, "Today", "Thursday, April 23", right, body);
}

function screenBrainDump(layout) {
  const items = [
    { text: "Finish the landing copy", type: "task", confidence: 94 },
    { text: "Book dentist", type: "task", confidence: 97 },
    { text: "Ask Sam about the Convex migration", type: "task", confidence: 91 },
    { text: "Pick up groceries on the way home", type: "reminder", confidence: 86 },
    { text: "Am I shipping fast enough?", type: "worry", confidence: 88 },
    { text: "Orange gradient on the first-run splash", type: "idea", confidence: 82 },
    { text: "Journal about the talk", type: "reminder", confidence: 79 },
  ];
  const visible = layout === "mobile" ? items.slice(0, 4) : items;
  const tone = { task: "accent", reminder: "slate", idea: "moss", worry: "amber" };
  const mobileCta = layout === "mobile" ? `
    <div class="mobile-primary-cta">
      <button class="btn btn-gradient" style="width:100%">✨ Sort it</button>
    </div>` : "";
  const body = `
    <div class="page">
      <div class="page-header">
        <div class="eyebrow">Brain Dump</div>
        <h1>Everything on your mind.</h1>
        <p class="lede">Don't organize it. Just type. I'll sort it into tasks, reminders, ideas, and worries — then you approve what sticks.</p>
      </div>
      <div class="grid-asym">
        <!-- @tfComponent TF.Card.Dump -->
        <div class="card">
          <div class="card-head"><h3>Dump</h3><span class="caption mono">312 chars · 58 words</span></div>
          <!-- @tfComponent TF.Field.Textarea -->
          <div class="field"><textarea style="min-height:200px;font-family:var(--font-serif);font-size:18px">Remember to finish the landing copy. Book dentist. Ask Sam about the Convex migration…</textarea></div>
          <div class="row-apart" style="margin-top:var(--space-4)">
            <span class="caption">End-to-end encrypted. Only you see this.</span>
            ${layout !== "mobile" ? `<button class="btn btn-gradient">✨ Sort it</button>` : ""}
          </div>
        </div>
        ${layout !== "mobile" ? `<div class="stack">
          <!-- @tfComponent TF.Card.Prompts -->
          <div class="card">
            <div class="eyebrow" style="margin-bottom:8px">Gentle prompts</div>
            <div class="stack-2">
              <div style="padding:10px;background:var(--surface-sunken);border-radius:10px;font-family:var(--font-serif);font-size:14px">What's one thing you've been avoiding?</div>
              <div style="padding:10px;background:var(--surface-sunken);border-radius:10px;font-family:var(--font-serif);font-size:14px">Any small wins from yesterday?</div>
            </div>
          </div>
          <!-- @tfComponent TF.Card.Privacy -->
          <div class="card sunken flat"><div class="eyebrow">Privacy</div><p class="caption">Raw dumps never leave Convex. Only sorted items are written after you approve.</p></div>
        </div>` : ""}
      </div>
      <!-- @tfComponent TF.Card.Sorted -->
      <div class="card" style="margin-top:var(--space-8)">
        <div class="card-head">
          <div><div class="eyebrow">Sorted — 7 items</div><h3>Review and approve</h3></div>
          ${layout !== "mobile" ? `<div class="row-tight"><button class="btn btn-sm btn-outline">Approve all</button><button class="btn btn-sm btn-ghost">Skip all</button></div>` : ""}
        </div>
        <div class="stack-2">
          ${visible.map((it, i) => `
          <!-- @tfComponent TF.Sorted.Item -->
          <div class="row-apart sorted-item${i >= 3 && layout === "mobile" ? " hide-mobile" : ""}" style="padding:12px 16px;background:var(--surface-sunken);border-radius:10px">
            <div class="row" style="flex:1;min-width:0">
              <span class="pill pill-${tone[it.type] || "neutral"}">${it.type}</span>
              <span style="font-size:15px">${it.text}</span>
            </div>
            <div class="row-tight">
              <span class="caption mono">${it.confidence}%</span>
              <button class="btn btn-sm btn-primary">Accept</button>
            </div>
          </div>`).join("")}
        </div>
        ${layout === "mobile" ? `<div style="margin-top:var(--space-4)"><button class="btn btn-sm btn-outline" style="width:100%">Approve all</button></div>` : ""}
      </div>
      ${mobileCta}
    </div>`;
  return shellWrap("brain-dump", layout, "Brain Dump", "Flow", "", body);
}

function screenCoach(layout) {
  const body = `
    <div class="page-tight">
      <div class="page-header">
        <div class="eyebrow">Coach</div>
        <h1>A quiet second brain.</h1>
        <p class="lede">Warmth dial at <strong>6/10</strong> — gently offering, not saccharine.</p>
      </div>
      <div class="grid-asym">
        <!-- @tfComponent TF.Card.CoachChat -->
        <div class="card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;min-height:${layout === "mobile" ? "420" : "560"}px">
          <div style="padding:12px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
            <div class="coach-avatar" style="width:28px;height:28px;font-size:13px">T</div>
            <div style="flex:1"><div style="font-size:13px;font-weight:500">Tempo Coach</div><div class="caption">scope: 2 notes · 1 project</div></div>
            <span class="pill pill-moss">Online</span>
          </div>
          <div style="flex:1;padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4);overflow-y:auto">
            <div class="caption" style="text-align:center">Thursday, 9:12 AM</div>
            <div style="display:flex;gap:var(--space-3)"><div class="coach-avatar">T</div><div class="coach-bubble">Morning. I noticed you dumped seven things earlier. Want to talk about those, or should I stage the tasks first?</div></div>
            <div class="user-bubble" style="align-self:flex-end">Stage the tasks. I'll come back to the worries tonight.</div>
            <div style="display:flex;gap:var(--space-3)"><div class="coach-avatar">T</div><div class="coach-bubble">Good. I'll add <em>Finish landing copy</em>, <em>Book dentist</em>, and <em>Ask Sam about Convex</em> to today.</div></div>
          </div>
          <div class="coach-composer" style="padding:var(--space-4) var(--space-5);border-top:1px solid var(--border)">
            <div class="row" style="align-items:flex-end">
              <div class="field" style="flex:1"><textarea placeholder="Type, or hold to dictate…" style="min-height:44px"></textarea></div>
              <button class="btn btn-primary btn-sm">Send</button>
            </div>
            ${layout !== "mobile" ? `<div class="row-tight" style="margin-top:8px"><span class="pill pill-accent">Stage tasks</span><span class="pill">Draft journal prompt</span></div>` : ""}
          </div>
        </div>
        ${layout === "desktop" ? `<div class="stack">
          <!-- @tfComponent TF.Card.PersonalityDial -->
          <div class="card"><div class="eyebrow">Personality dial</div><div style="font-family:var(--font-serif);font-size:20px;margin:8px 0">Gentle</div><div style="height:8px;background:var(--surface-sunken);border-radius:99px"><div style="width:60%;height:100%;background:var(--gradient-tempo);border-radius:99px"></div></div></div>
          <!-- @tfComponent TF.Card.Scope -->
          <div class="card"><div class="eyebrow">Conversation scope</div><div class="stack-2" style="margin-top:10px"><div>Launch notes</div><div>Onboarding copy</div><div>Tempo 1.0</div></div></div>
          <!-- @tfComponent TF.Card.PastConversations -->
          <div class="card sunken flat"><div class="eyebrow">Past conversations</div><div class="caption" style="margin-top:8px">Shipping worries · Mon</div></div>
        </div>` : ""}
      </div>
    </div>`;
  return shellWrap("coach", layout, "Coach", "Flow", "", body);
}

function screenPlan(layout) {
  const blocks = [
    { start: "8:00", end: "8:15", title: "Morning pages", tone: "moss" },
    { start: "9:30", end: "10:30", title: "Draft Tempo 1.0 launch post", tone: "accent" },
    { start: "11:00", end: "11:30", title: "Review PRs", tone: "slate" },
    { start: "12:30", end: "12:40", title: "10-minute walk", tone: "moss" },
    { start: "14:00", end: "14:25", title: "Respond to founder Qs", tone: "accent" },
  ];
  const visible = layout === "mobile" ? blocks.slice(0, 4) : blocks;
  const mobileCta = layout === "mobile" ? `<div class="mobile-primary-cta"><button class="btn btn-primary" style="width:100%">✨ Re-plan</button></div>` : "";
  const body = `
    <div class="page">
      <div class="page-header row">
        <div>
          <div class="eyebrow">Plan · Thursday</div>
          <h1>Let's stage today.</h1>
          <p class="lede">Coach suggests six blocks based on yesterday's energy curve and your two anchors.</p>
        </div>
        <div class="row-tight hide-mobile">
          <!-- @tfComponent TF.SegControl -->
          <div class="seg-control"><button class="is-active">Day</button><button>Week</button></div>
          <button class="btn btn-primary">✨ Re-plan</button>
        </div>
      </div>
      <div class="grid-asym">
        <!-- @tfComponent TF.Card.Timeline -->
        <div class="card">
          <div class="card-head"><h3>Timeline</h3><div class="caption">6 blocks · 2h 30m focused work</div></div>
          <div class="stack-2">
            ${visible.map(b => `
            <!-- @tfComponent TF.Timeline.Block -->
            <div style="padding:12px 16px;border-left:3px solid var(--tempo-orange);background:var(--surface-sunken);border-radius:8px">
              <div style="font-weight:500">${b.title}</div>
              <div class="caption">${b.start}–${b.end}</div>
            </div>`).join("")}
          </div>
        </div>
        ${layout !== "mobile" ? `<div class="stack">
          <!-- @tfComponent TF.Card.EnergyCheckIn -->
          <div class="card"><div class="eyebrow">Energy check-in</div><div style="margin:10px 0;display:inline-flex;gap:3">${[1,2,3,4,5].map(i => `<span style="width:16px;height:6px;border-radius:99px;background:${i <= 4 ? "var(--tempo-orange)" : "var(--border)"}"></span>`).join("")}</div><p class="caption">Feeling alert — deeper work before noon.</p></div>
          <!-- @tfComponent TF.Card.Anchors -->
          <div class="card"><div class="eyebrow">Anchors</div><div class="stack-2" style="margin-top:10px"><div>Morning pages — 8:00</div><div>10-minute walk — 12:30</div></div></div>
          <div class="card sunken flat"><div class="coach-bubble">Five things feels full but fine. Founder questions can slide to Friday.</div></div>
        </div>` : ""}
      </div>
      ${mobileCta}
    </div>`;
  return shellWrap("plan", layout, "Planning", "Flow", layout !== "mobile" ? `<button class="btn btn-sm btn-primary">✨ Re-plan</button>` : "", body);
}

function screenDailyNote(layout) {
  const noteTasks = [
    { title: "Morning pages", time: "08:00", done: true },
    { title: "Draft launch post, first pass", time: "09:30", done: true },
    { title: "Ten-minute walk (non-negotiable)", time: "12:30", done: false },
    { title: "Respond to founder Qs", time: "14:00", done: false },
    { title: "Evening shutdown", time: "17:00", done: false },
  ];
  const visible = layout === "mobile" ? noteTasks.slice(0, 3) : noteTasks;
  const mobileExtras = layout === "mobile" ? `
  <!-- @tfComponent TF.Shell.Drawer -->
  <aside class="drawer" id="nav-drawer" style="padding:var(--space-4)">
    <div class="eyebrow">Navigate</div>
    <a class="nav-item is-active" href="mobile.html">Daily Note</a>
    <a class="nav-item" href="../today/mobile.html">Today</a>
    <a class="nav-item" href="../brain-dump/mobile.html">Brain Dump</a>
    <a class="nav-item" href="../coach/mobile.html">Coach</a>
    <a class="nav-item" href="../plan/mobile.html">Planning</a>
  </aside>
  <div class="drawer-overlay" onclick="document.getElementById('nav-drawer').classList.remove('is-open')"></div>
  <!-- @tfComponent TF.Shell.BottomNav -->
  <nav class="bottom-nav" aria-label="Primary">
    <a href="../today/mobile.html"><span>🏠</span>Today</a>
    <a href="../brain-dump/mobile.html"><span>✨</span>Dump</a>
    <a href="mobile.html" class="is-active"><span>📝</span>Note</a>
    <a href="../coach/mobile.html"><span>🎙</span>Coach</a>
    <a href="../plan/mobile.html"><span>📋</span>Plan</a>
  </nav>` : "";
  return `${head("Daily Note", layout)}
<!-- @tfComponent TF.Shell.App -->
<div class="daily-note-layout">
  <!-- @tfComponent TF.Card.CalendarRail -->
  <aside class="daily-note-rail" style="padding:var(--space-4)">
    <div class="sidebar-brand" style="margin-bottom:var(--space-4)"><span class="brand-name">Tempo<em>Flow</em></span></div>
    <div class="eyebrow">April 2026</div>
    <p class="caption" style="margin:8px 0">Today · 2026-04-23</p>
    ${layout === "desktop" ? `<div class="stack-2" style="margin-top:var(--space-4)">
      <button class="nav-item is-active">Today</button>
      <button class="nav-item">This week</button>
      <button class="nav-item">Journal</button>
    </div>` : ""}
  </aside>
  <!-- @tfComponent TF.Card.NoteEditor -->
  <main class="daily-note-editor">
    <header class="topbar" style="position:sticky;top:0">
      <span class="mono caption">2026-04-23.md</span>
      <div class="spacer"></div>
      ${layout === "mobile" ? `<button class="menu-btn" onclick="document.getElementById('nav-drawer')?.classList.add('is-open')">☰</button>` : ""}
    </header>
    <article style="max-width:720px;margin:0 auto;padding:var(--space-8) var(--space-6)">
      <div class="eyebrow" style="color:var(--tempo-orange)">Thursday · April 23 · Week 17</div>
      <h1>☀️ Today</h1>
      <blockquote style="font-family:var(--font-serif);font-size:17px;color:var(--fg-muted);border-left:3px solid var(--tempo-orange);padding-left:var(--space-4);margin:var(--space-4) 0">Three things look doable this afternoon. I pulled them from your dump.</blockquote>
      <h2>Tasks</h2>
      <div class="stack-2" style="margin:var(--space-4) 0">
        ${visible.map(t => taskRow({ ...t, energy: "low", est: 15, done: t.done })).join("")}
      </div>
      <h2>Notes</h2>
      <p>Sam replied on Convex — he's bullish, wants a 30-min pairing session this week.</p>
      ${layout === "mobile" ? `<div class="mobile-primary-cta"><button class="btn btn-primary" style="width:100%">⌘K Quick switch</button></div>` : ""}
    </article>
  </main>
  ${layout === "desktop" ? `<!-- @tfComponent TF.Card.WidgetsRail -->
  <aside class="daily-note-widgets">
    <div class="card sunken" style="margin-bottom:14px">
      <div class="row-apart"><span style="font-family:var(--font-serif);font-weight:500">Today's rhythm</span><span class="mono caption">2/5</span></div>
      <div style="height:6px;background:var(--border-soft);border-radius:99px;margin:10px 0"><div style="width:40%;height:100%;background:var(--gradient-tempo);border-radius:99px"></div></div>
      <span class="caption">5-day streak</span>
    </div>
    <div class="card"><div class="eyebrow">Time blocks</div><div class="stack-2" style="margin-top:10px"><div class="caption">09:30 Draft launch post</div><div class="caption">12:30 Walk</div></div></div>
  </aside>` : ""}
</div>
${mobileExtras}
</body></html>`;
}

const screens = {
  "daily-note": screenDailyNote,
  today: screenToday,
  "brain-dump": screenBrainDump,
  coach: screenCoach,
  plan: screenPlan,
};

for (const [id, fn] of Object.entries(screens)) {
  const dir = join(ROOT, id);
  mkdirSync(dir, { recursive: true });
  for (const layout of ["desktop", "tablet", "mobile"]) {
    const html = fn(layout);
    const path = join(dir, `${layout}.html`);
    writeFileSync(path, html);
    console.log("wrote", path);
  }
}

console.log("Done: 15 responsive HTML files for flow-01 batch.");
