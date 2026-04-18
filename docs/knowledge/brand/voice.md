# Tempo Flow — Voice & Copy Rules

**Revision:** 0.1 (scaffold)
**Source:** HARD_RULES §1, HARD_RULES §6.5, founder tone guidance
**Reviewer of record:** human-amit

## The three voice principles

1. **Shame-proof.** Every line of copy passes the "could a 3-AM user read this without flinching?" test.
2. **Context-aware warmth.** Empty states, errors, and accountability check-ins are the highest-risk surfaces. Warmth there is non-optional.
3. **Assume competence, acknowledge fatigue.** The user is smart. They are also probably overwhelmed. Write for both facts simultaneously.

## Copy pattern library

### Empty states

✅ "Nothing here yet. Drop a thought when you're ready."
✅ "Your tasks live here. First one's on you — we'll handle the rest."
❌ "You have no tasks. Click + to add one." — corporate, implies a missing action.
❌ "Oops, looks empty!" — infantilizing.

### Error states

✅ "Couldn't save that. Network hiccup — try again?"
✅ "We lost the AI's reply mid-sentence. Tap to retry."
❌ "Error 403: Unauthorized." — leaks implementation detail.
❌ "Something went wrong. Please try again later." — cold, passive.

### Accountability / habit gaps

✅ "Back after a while — want to start this week fresh, or pick up where you left?"
✅ "Seven days since last check-in. No judgment. Ready to look at the week?"
❌ "You broke a 14-day streak!" — shame trigger.
❌ "You haven't opened the app in a while." — surveillance tone.

### Coach turns

Tone varies with `profiles.coachDial` (0–10). See HARD_RULES §6.5.

- **Dial 0 (warm mentor):** "When you're ready, we can look at this together. No pressure."
- **Dial 5 (peer friend, default):** "Okay — let's break this one down. What's first?"
- **Dial 10 (high-intensity):** "That's the task. You said you'd do it today. What's blocking you right now?"

**Hard-coded personality is forbidden** anywhere other than the coach system prompt. Tone comes from the dial.

### Confirmation dialogs (accept-reject)

✅ "Here's what I'd do — okay to apply, or want to edit?"
✅ "I'll move these three tasks to tomorrow. Confirm, or tweak?"
❌ "Are you sure you want to perform this action?" — sterile, scary.
❌ "This cannot be undone." — violates HARD_RULES: everything must be undoable.

### Undo toasts

✅ "Moved 3 tasks. Undo?"
✅ "Saved draft. Undo (5 min)?"

### Loading states

Write *once* per surface; never stack. Prefer a skeleton over a phrase. When a phrase is needed:

✅ "Thinking…" (coach processing)
✅ "Gathering your week…" (planner)
❌ "Loading please wait…"
❌ "Just a moment…"

## Forbidden words and phrases

- "streak broken" — never. Gap is welcome, not failure.
- "oops", "uh oh", "whoops" — infantilizing.
- "please try again later" — cold and passive.
- "you must", "you should", "you need to" — all imperatives directed at the user without context.
- "failed", "invalid", "denied", "unauthorized" — user-visible. Replace with plain words.
- "productivity", "optimize your day", "crush your goals", "unlock your potential" — corporate bro language. Tempo is not this.
- "we" collectively with the user (e.g. "let's get organized!") when the user has done nothing yet. Use "you" until the relationship is earned.

## Encouraged patterns

- Soft openers: "When you're ready…", "No pressure, but…", "Whenever you have a minute…"
- Declarative calm: "Here's what you told me. Want to adjust?"
- Concrete next step: end every state that allows action with one clear verb ("Undo?", "Start now?", "Pick up where you left?").
- Plain numbers: "3 tasks" not "three tasks" in UI; "three" is fine in coach prose.
- Sentence case in UI. Title Case is reserved for proper nouns, headings, and marketing.

## Approval

Copy changes on critical surfaces (empty, error, gap, confirmation, coach turns) require Amit's review before merge.
