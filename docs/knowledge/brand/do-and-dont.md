# Tempo Flow — Do / Don't Examples

**Revision:** 0.1 (scaffold — examples grow as real UI ships)

Each pair is a concrete anti-pattern paired with its Tempo-correct replacement. Agents reviewing UI work should match against these; when a design or copy violates a Don't, push back.

## Streak / habit gaps

**Don't**
```
🔥 3-DAY STREAK LOST
You haven't checked in since Tuesday.
```

**Do**
```
Welcome back.

Want to pick up where you left, or start this week fresh?

[ Start fresh ]   [ Pick up ]
```

**Why:** no fire icon signalling loss, no counting days of absence, no "you" pointed as the subject of failure. Two gentle branches.

## Delete confirmation

**Don't**
```
Are you sure you want to delete this task?
This action cannot be undone.

[ Cancel ]   [ Delete ]
```

**Do**
```
Delete "Pay electricity bill"?

Moves to Recently deleted — you can restore within 30 days.

[ Cancel ]   [ Delete ]
```

**Why:** HARD_RULES §5 says hard deletes are forbidden on user-visible data. Copy must match reality: soft-delete with restore window.

## Empty task list

**Don't**
```
No tasks yet!
Click + to add your first task.
```

**Do**
```
Your tasks live here.

When something is on your mind, jot it down — we'll sort it.

[ Add a task ]   [ Open brain dump ]
```

**Why:** acknowledges purpose of the surface, offers two entry points (quick add and brain dump), no exclamation.

## AI-suggested plan

**Don't**
```
Your plan has been created! ✨
```
(then list magically appears with no preview / confirm)

**Do**
```
Here's a draft plan. Okay to apply, or want to edit?

• 9:00  Reply to Miriam (15 min)
• 9:30  Deep work: Tempo schema (90 min)
• 11:00 Break
• 11:15 Pay electricity bill (5 min)

[ Looks good ]   [ Edit ]   [ Not yet ]
```

**Why:** HARD_RULES §6.2 — accept-reject is law. Preview is structured; the user can confirm, edit, or reject.

## Error: API call failed

**Don't**
```
Error 500: Internal Server Error
```

**Do**
```
Couldn't reach the planner. We'll keep your draft here and retry.

[ Retry now ]   [ Keep offline ]
```

**Why:** reveals no implementation detail, offers agency, keeps the user's work safe.

## Color used as only signal

**Don't**
```
[red bar]  [yellow bar]  [green bar]
```
(no labels, no icons)

**Do**
```
🔴 Overdue (3)    🟡 Due today (5)    🟢 Upcoming (12)
```
or icon + label pairs. Never color alone.

**Why:** HARD_RULES §7.1 — color-blind safe, always pair color with icon or label.

## Font for long reading surfaces

**Don't**
```
Body copy rendered in Inter at 14px with 1.3 line-height.
```

**Do**
```
Body copy in Inter 16px, 1.5 line-height on reading surfaces
(Library items, Coach transcripts, Journal). 14px is for chrome and UI labels.
```

## Loading state

**Don't**
```
Loading… ⟳ (spinner for 4 seconds)
```

**Do**
```
[ skeleton card with shimmer ]
[ skeleton card with shimmer ]
[ skeleton card with shimmer ]
```

**Why:** HARD_RULES §7.4 — skeletons, not spinners, for anything > 100ms expected latency.

## Streak-break imagery

**Don't** — any imagery or copy that centers loss of progress.

**Do** — any imagery that centers the user returning. Warm light, open space, a path.

---

More pairs added as real surfaces ship. When you catch a Don't in the wild, add it here with a PR and tag @amit for review.
