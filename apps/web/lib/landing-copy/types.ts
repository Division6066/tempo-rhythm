export type LandingCopy = {
  metadata: { title: string; description: string };
  nav: {
    homeLabel: string;
    features: string;
    coach: string;
    pricing: string;
    manifesto: string;
    signIn: string;
    signUp: string;
    joinBeta: string;
  };
  hero: {
    badge: string;
    titleBefore: string;
    titleEmphasis: string;
    titleAfter: string;
    lede: string;
    proof: readonly (readonly [string, string])[];
    brainDumpLabel: string;
    brainDump: string;
    coachLabel: string;
    coachTitle: string;
    coachBody: string;
    streakLabel: string;
    streakBody: string;
  };
  features: {
    eyebrow: string;
    title: string;
    lede: string;
    dailyNote: {
      eyebrow: string;
      title: string;
      body: string;
      links: string;
      commandBar: string;
      tags: string;
      sample: readonly string[];
    };
    brainDump: {
      eyebrow: string;
      title: string;
      body: string;
      sortedLabel: string;
      items: readonly (readonly [string, string])[];
    };
    coach: { eyebrow: string; title: string; body: string; quote: string };
    firstPlan: { eyebrow: string; title: string; body: string };
    journal: { eyebrow: string; title: string; body: string };
    routines: { eyebrow: string; title: string; body: string };
    weekly: { eyebrow: string; title: string; body: string };
  };
  coach: {
    eyebrow: string;
    title: string;
    lede: string;
    quotes: readonly { quote: string; caption: string }[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    lede: string;
    beta: {
      label: string;
      price: string;
      suffix: string;
      body: string;
      includes: readonly string[];
      cta: string;
    };
    included: {
      badge: string;
      label: string;
      price: string;
      suffix: string;
      body: string;
      includes: readonly string[];
      cta: string;
    };
  };
  testimonials: {
    eyebrow: string;
    title: string;
    items: readonly { quote: string; initial: string; name: string; role: string }[];
  };
  letter: {
    eyebrow: string;
    title: string;
    paragraphs: readonly string[];
    signature: string;
  };
  finalCta: { title: string; body: string; cta: string };
  footer: {
    tagline: string;
    product: string;
    features: string;
    coach: string;
    pricing: string;
    signUp: string;
    legal: string;
    privacy: string;
    terms: string;
    contact: string;
    email: string;
    copyright: string;
    version: string;
  };
};
