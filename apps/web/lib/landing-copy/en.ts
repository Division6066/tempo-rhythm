import type { LandingCopy } from "./types";

export const en = {
  metadata: {
    title: "Tempo Flow — A gentle planner for messy brains",
    description:
      "Tempo Flow is a calm, AI-gentle planner for ADHD brains, autistic brains, anxious brains, and anyone who's tried seventeen productivity apps and bounced off all of them.",
  },
  nav: {
    homeLabel: "Tempo Flow home",
    features: "Features",
    coach: "Coach",
    pricing: "Pricing",
    manifesto: "Manifesto",
    signIn: "Sign in",
    signUp: "Sign up",
    joinBeta: "Join the free beta",
  },
  hero: {
    badge: "Closed beta open now",
    titleBefore: "A planner that won't ",
    titleEmphasis: "shame",
    titleAfter: "your nervous system.",
    lede:
      "Tempo Flow is a calm, AI-gentle planner for ADHD brains, autistic brains, anxious brains, and anyone who's tried seventeen productivity apps and bounced off all of them. Dump your thoughts. We'll help you find the next doable thing.",
    proof: [
      ["42", "handcrafted screens"],
      ["1", "person, one year"],
      ["Free", "during beta"],
      ["0", "guilt trips, ever"],
    ],
    brainDumpLabel: "Brain Dump · 09:41",
    brainDump:
      "Finish landing copy. Book dentist. Ask Sam about Convex. Pick up groceries. Am I shipping fast enough?",
    coachLabel: "Coach",
    coachTitle: "Three things look doable this afternoon.",
    coachBody:
      "I pulled them from your dump. The worry I left on the side — we'll look at it tomorrow.",
    streakLabel: "Today · 5-day streak",
    streakBody: "Morning pages — five days running. Nice.",
  },
  features: {
    eyebrow: "What's inside",
    title: "Tasks, notes, and calendar — one markdown page per day.",
    lede:
      "Every feature below started as a frustration with another app. Dump, sort, plan, do, reflect — in a single plaintext file you actually own. Linked, searchable, yours forever.",
    dailyNote: {
      eyebrow: "★ Daily Note",
      title: "Markdown-native. Bi-directionally linked. Gently animated.",
      body:
        "Inspired by the clarity of tools like NotePlan — but warmer, quieter, and tuned for brains that need a little help staying on the page. A focus ring that breathes. Task completes that gently delight. Time blocks that pulse where you are right now.",
      links: "[[ bi-di links ]]",
      commandBar: "⌘K command bar",
      tags: "#tags · @people",
      sample: [
        "# ☀️ Thursday",
        "## Intentions",
        "Ship launch post by noon. Protect the afternoon.",
        "## Tasks",
        "* [x] Morning pages — [[Journal]]",
        "* [ ] Draft launch post @09:30 #writing",
        "* [ ] Ten-minute walk @12:30",
        "## Notes",
        "Sam replied on [[Convex migration]]...",
      ],
    },
    brainDump: {
      eyebrow: "01 — Brain Dump",
      title: "Empty your head onto the page. We'll do the sorting.",
      body:
        'Write everything — tasks, worries, ideas, grocery items — in one messy stream. Our AI untangles it into tasks, notes, journal fragments, and quiet "let\'s sit with this" items. No format to learn, no tags to choose.',
      sortedLabel: "SORTED · 6 ITEMS",
      items: [
        ["✓ Finish landing copy", "TASK"],
        ["✓ Book dentist", "TASK"],
        ["◉ Am I shipping fast enough?", "WORRY"],
      ],
    },
    coach: {
      eyebrow: "02 — Coach",
      title: "A voice that checks in, not checks up.",
      body:
        "Tap a warmth dial from 0 (businesslike) to 10 (your kindest friend). The coach reads your dump, suggests a plan, and stays quiet when you don't need it.",
      quote: '"Three doable things. The rest can wait."',
    },
    firstPlan: {
      eyebrow: "03 — First Plan",
      title: "A three-block day, already scheduled. You can still say no.",
      body:
        "On launch mornings, the plan is waiting. Drag to rearrange. Tap to skip. The calendar respects your energy — high-focus before noon, soft blocks after three, zero guilt if you close the laptop.",
    },
    journal: {
      eyebrow: "04 — Journal",
      title: "Prompts that fit your day.",
      body: "Encrypted at rest, prompts that shift with your mood, and never, ever a red streak warning.",
    },
    routines: {
      eyebrow: "05 — Routines",
      title: "Guided, not gamified.",
      body:
        "Run a morning routine like a meditation — one step at a time, with gentle audio cues. Skip anything.",
    },
    weekly: {
      eyebrow: "06 — Weekly",
      title: "Sunday, softly.",
      body:
        "A weekly recap written in the coach's voice — proud of what got done, gentle about what didn't.",
    },
  },
  coach: {
    eyebrow: "The coach",
    title: "It sounds like a person who's met you before.",
    lede:
      "Warmth dial set to 6 by default. Moves lower when you're heads-down, higher when the dump feels anxious. Below: actual lines from actual days.",
    quotes: [
      {
        quote:
          '"You finished two of three yesterday. That counts. Want to start with the unfinished one, or a lighter warm-up?"',
        caption: "Monday · 09:12 · warmth 6",
      },
      {
        quote:
          '"The dump looks heavy today. Three items feel like worries, not tasks. Want to park them, or look at one?"',
        caption: "Wednesday · 08:40 · warmth 7",
      },
      {
        quote: '"You protected the afternoon yesterday. That was a hard call. Noting it."',
        caption: "Friday · evening recap · warmth 5",
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Free during beta. Open sign-up.",
    lede: "Every new account gets the full app while beta is open. No card, and no trial clock.",
    beta: {
      label: "Open beta",
      price: "Free",
      suffix: "· sign up",
      body:
        "The whole app, for as long as beta stays open. Sign up when you want a place to put today.",
      includes: [
        "All 42 screens, unlocked",
        "AI coach · warmth dial · voice",
        "Web + iOS + Android",
        "No auto-enrollment",
      ],
      cta: "Join the free beta →",
    },
    included: {
      badge: "Included now",
      label: "What you get",
      price: "Free",
      suffix: "· during beta",
      body:
        "Journal, templates, and sync are part of the open beta. A paid price is not on this page, because signup does not charge one.",
      includes: [
        "Everything in the open beta",
        "Unlimited journal + templates",
        "Cloud sync across devices",
        "Email the founder any time",
      ],
      cta: "Join the free beta →",
    },
  },
  testimonials: {
    eyebrow: "Beta testers",
    title: "Thirty people used it for four weeks. Here's what they said.",
    items: [
      {
        quote:
          '"It\'s the first planner that didn\'t make me feel like a broken version of a neurotypical person. I used it for 23 out of 28 days. That\'s a record."',
        initial: "M",
        name: "Mira K.",
        role: "Designer · ADHD",
      },
      {
        quote:
          '"I pay for Notion and Sunsama and Things. I\'d cancel all three for this. The coach understood when I was having a hard week without me having to spell it out."',
        initial: "J",
        name: "Jonah R.",
        role: "Engineer · autistic",
      },
      {
        quote:
          '"The brain dump is genuinely unreasonable. I\'ve written 3000 words into it in two weeks and none of them are wasted."',
        initial: "S",
        name: "Sana P.",
        role: "Writer",
      },
    ],
  },
  letter: {
    eyebrow: "A letter from Amit",
    title: "Why I built this alone.",
    paragraphs: [
      "I've had sixteen planners. I've paid for eight. I was diagnosed with ADHD at thirty-four, and the thing that surprised me most was not the diagnosis — it was how much software in my life had quietly been shaming me for not being a person I wasn't.",
      'Tempo Flow is one person\'s answer to that. It\'s small. It doesn\'t try to be your operating system. It tries to be the friend who texts "what are you doing today?" without judgment.',
      "If it works for you, that is enough. Beta is free while it is open. If it does not fit, you can leave it there.",
    ],
    signature: "— Amit",
  },
  finalCta: {
    title: "Free during beta. One gentle week at a time.",
    body: "No credit card. No newsletter enrollment. No growth loops. Just the app.",
    cta: "Join the free beta",
  },
  footer: {
    tagline: "A gentle planner for messy brains. Made in Tel Aviv by one person.",
    product: "Product",
    features: "Features",
    coach: "The Coach",
    pricing: "Pricing",
    signUp: "Sign up",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    email: "amit@tempoflow.app",
    copyright: "© 2026 Tempo Flow · BUSL-1.1",
    version: "v1.0.0 · Closed beta",
  },
} satisfies LandingCopy;
