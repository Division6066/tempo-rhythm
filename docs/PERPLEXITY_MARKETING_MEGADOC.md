# TEMPO — Perplexity Marketing, Ads & App Store Megadoc

> **Purpose:** A collection of copy-pasteable Perplexity Computer prompts that walk through setting up all marketing, advertising, domain selection, and app store listing preparation for TEMPO.
>
> **How to use:** Copy the prompt from each section into Perplexity (with Computer Use / Pro Search enabled). Each prompt is self-contained with full TEMPO context so Perplexity can execute independently.

---

## Master Checklist

| # | Section | Status | Dependencies |
|---|---------|--------|--------------|
| 1 | Google Ads Setup & Configuration | ☐ | Google account, payment method |
| 2 | Facebook/Meta Ads Setup & Configuration | ☐ | Meta Business account, payment method |
| 3 | Organic Marketing Strategy | ☐ | Marketing site live, social accounts created |
| 4 | Paid Ads Optimization & Analytics | ☐ | Sections 1 & 2 complete, marketing site live |
| 5 | Domain Name Strategy | ☐ | Business entity registered |
| 6 | App Store Optimization — Apple App Store | ☐ | Apple Developer account ($99/yr), Legal pages (Task #Legal) |
| 7 | App Store Optimization — Google Play Store | ☐ | Google Play Console ($25 one-time), Legal pages (Task #Legal) |
| 8 | App Store Required Documentation & Compliance | ☐ | Legal pages (Task #Legal), Privacy policy, Terms of Service |
| 9 | App Store Marketing Copy & Keywords | ☐ | Sections 6 & 7 complete |

### Cross-Reference: Legal Pages (from Legal/SEO Task)

The following URLs are required by both app stores and several ad platforms. Ensure these are live before submitting:

- **Privacy Policy URL:** `https://[tempo-domain]/privacy`
- **Terms of Service URL:** `https://[tempo-domain]/terms`
- **Support URL:** `https://[tempo-domain]/support`
- **Marketing URL:** `https://[tempo-domain]`

---

## TEMPO Context Block (included in each prompt)

> Use this reference to understand what each prompt tells Perplexity about TEMPO.

```
APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Value prop: Tempo uses AI to gracefully organize your chaos — scheduling, prioritizing, and breaking down tasks so you can just focus on doing.
• Target audience: Adults with ADHD, neurodivergent professionals, productivity enthusiasts, executive function coaches, life coaches.
• Platforms: iOS (com.tempo.app), Android (com.tempo.app), Web.
• Pricing tiers:
  - Free ($0): Basic Daily Plan, Standard Task Management, 5 AI Suggestions/day, Community Support.
  - Pro ($9/mo): Everything in Free + Unlimited AI Planning, Two-Way Calendar Sync, Voice Memos to Tasks, Focus Timers & Analytics, Priority Support. 14-day free trial.
  - Team ($19/mo/user): Everything in Pro + Shared Workspaces, Team Task Delegation, Admin Controls & Billing, Dedicated Success Manager.
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers (Pomodoro), NotePlan-style Editor (markdown), Two-Way Calendar Sync (Google/Outlook), Gentle Rescheduling (no guilt/shame).
• Brand voice: Calm, empathetic, empowering. Never patronizing. Speaks to the user as an ally, not an authority.
• Brand colors: Deep Indigo (#1A1A2E) as dark background, clean whites, soft purples. Minimalist, calming aesthetic.
• Font style: Serif headings (elegant, warm), sans-serif body (clean, readable).
• Founder location: Israel.
• Company stage: Pre-launch / early stage.
```

---

## SECTION 1 — Google Ads Setup & Configuration

### Prompt

```
I need your help setting up Google Ads for my app. Here is full context:

APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Value prop: Tempo uses AI to gracefully organize your chaos — scheduling, prioritizing, and breaking down tasks so you can just focus on doing.
• Target audience: Adults with ADHD, neurodivergent professionals, productivity enthusiasts, executive function coaches, life coaches.
• Platforms: iOS (com.tempo.app), Android (com.tempo.app), Web.
• Pricing: Free ($0), Pro ($9/mo with 14-day trial), Team ($19/mo/user).
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers, NotePlan-style Editor, Two-Way Calendar Sync, Gentle Rescheduling.
• Brand voice: Calm, empathetic, empowering.
• Marketing site URL: https://[tempo-domain]
• Founder location: Israel (business entity based in Israel).

TASKS — Please do all of the following:

1. ACCOUNT SETUP
   - Go to https://ads.google.com and create a new Google Ads account (or guide me through it if I need to do manual steps).
   - Set the account currency to USD and time zone to Asia/Jerusalem.
   - Set up billing with a credit card.

2. CAMPAIGN STRUCTURE — Create 3 campaigns:

   CAMPAIGN A: Search — "ADHD Planner Keywords"
   - Campaign type: Search
   - Goal: Website traffic → signups
   - Budget: $20/day (start conservatively)
   - Bidding: Maximize conversions
   - Location targeting: United States, United Kingdom, Canada, Australia
   - Language: English
   - Ad groups and keywords:
     * Ad Group 1 — "ADHD Planner": adhd planner, adhd planner app, planner for adhd, best planner for adhd adults, adhd daily planner, adhd friendly planner
     * Ad Group 2 — "Executive Function": executive function tools, executive dysfunction help, executive function app, executive function planner
     * Ad Group 3 — "Neurodivergent Productivity": neurodivergent productivity app, neurodivergent planner, adhd productivity tools, productivity app for adhd
     * Ad Group 4 — "AI Planner": ai planner app, ai daily planner, smart planner app, ai task manager
   - Negative keywords: free, children, kids, school, homework, game
   - Ad copy suggestions (write 3 responsive search ads):
     * Headlines should include: "ADHD Planner That Gets It", "AI-Powered Daily Planning", "Built for ADHD Brains", "Try Free — No Credit Card", "Smart Brain Dump Feature", "Gentle Rescheduling", "14-Day Pro Trial"
     * Descriptions should emphasize: empathy (not broken, just different), AI doing the heavy lifting, calm/minimalist design, no guilt/shame, 14-day free trial

   CAMPAIGN B: Search — "Competitor / Alternative Keywords"
   - Keywords: todoist alternative adhd, notion adhd planner, things 3 alternative, adhd task manager, structured app alternative
   - Budget: $10/day
   - Bidding: Maximize clicks (awareness)
   - Ad copy: Position TEMPO as "the planner designed specifically for ADHD brains" vs generic productivity tools

   CAMPAIGN C: Display — "Awareness / Retargeting"
   - Campaign type: Display
   - Goal: Brand awareness
   - Budget: $10/day
   - Audience: In-market for productivity software, custom affinity (ADHD, mental health, self-improvement)
   - Placements: Exclude apps and games, focus on websites
   - Creative guidance: Use calming imagery (deep indigo backgrounds, clean UI screenshots), emphasize "finally, a planner that adapts to your brain"

3. CONVERSION TRACKING
   - Set up a conversion action for "Sign Up" on the marketing site.
   - Provide the Google Ads conversion tracking tag/snippet I need to install.
   - Set up a conversion action for "Start Free Trial" (Pro plan).

4. BUDGET RECOMMENDATIONS
   - Total starting budget: $40/day (~$1,200/month).
   - After 2 weeks of data, recommend optimization moves.
   - Suggest when to scale each campaign based on CPA targets.

WHAT TO BRING BACK:
- Screenshot or confirmation of account creation
- List of all campaigns, ad groups, and keywords created
- Ad copy for all responsive search ads
- Conversion tracking code snippet to install on the marketing site
- A summary of recommended next steps after the first 2 weeks
```

---

## SECTION 2 — Facebook/Meta Ads Setup & Configuration

### Prompt

```
I need your help setting up Facebook and Instagram advertising for my app. Here is full context:

APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Value prop: Tempo uses AI to gracefully organize your chaos — scheduling, prioritizing, and breaking down tasks so you can just focus on doing.
• Target audience: Adults with ADHD, neurodivergent professionals, productivity enthusiasts, executive function coaches, life coaches.
• Platforms: iOS (com.tempo.app), Android (com.tempo.app), Web.
• Pricing: Free ($0), Pro ($9/mo with 14-day trial), Team ($19/mo/user).
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers, NotePlan-style Editor, Two-Way Calendar Sync, Gentle Rescheduling.
• Brand voice: Calm, empathetic, empowering. Never clinical or preachy.
• Brand colors: Deep Indigo (#1A1A2E), soft purples, clean whites. Minimalist, calming.
• Marketing site URL: https://[tempo-domain]
• Founder location: Israel.

TASKS — Please do all of the following:

1. META BUSINESS SUITE SETUP
   - Go to https://business.facebook.com and create a Meta Business Suite account for "TEMPO".
   - Create an Ad Account within the Business Suite.
   - Set currency to USD.
   - Connect or create a Facebook Page for TEMPO (name: "TEMPO — ADHD Planner", category: App, Productivity).
   - Connect or create an Instagram Business account for @tempoapp.

2. META PIXEL SETUP
   - Create a Meta Pixel named "TEMPO Website Pixel".
   - Provide the pixel base code to install on the marketing site.
   - Set up standard events: PageView, Lead (signup), StartTrial, CompleteRegistration.
   - Explain how to verify the pixel is firing correctly.

3. CAMPAIGN STRUCTURE — Create 3 campaigns:

   CAMPAIGN A: Awareness — "Meet TEMPO"
   - Objective: Brand Awareness
   - Budget: $15/day
   - Audience:
     * Ages 22-45
     * Interests: ADHD, Attention deficit hyperactivity disorder, Executive function, Neurodiversity, Productivity, Self-improvement, Life coaching
     * Behaviors: Engaged shoppers, Technology early adopters
     * Locations: United States, United Kingdom, Canada, Australia
   - Placements: Facebook Feed, Instagram Feed, Instagram Stories, Instagram Reels
   - Creative direction:
     * Video ad (15-30 sec): Show a chaotic to-do list transforming into a calm, organized Tempo daily plan. Voiceover: "Your brain isn't broken. Your planner is. Meet Tempo."
     * Carousel ad: 4 cards — (1) "Overwhelmed?" (2) "AI builds your daily plan" (3) "Voice dump your thoughts" (4) "Finally, calm." Each card uses deep indigo backgrounds with clean UI mockups.
     * Static image: Split screen — left side chaotic sticky notes, right side clean Tempo interface. Text: "From chaos to calm."

   CAMPAIGN B: Consideration — "Try TEMPO"
   - Objective: App Installs (when app is live) or Traffic (pre-launch)
   - Budget: $20/day
   - Audience: Lookalike of website visitors + interest targeting (ADHD support groups, productivity tools, mindfulness)
   - Creative: Testimonial-style ads, feature highlight videos, before/after planning scenarios
   - CTA: "Try Free" or "Start Your Free Trial"

   CAMPAIGN C: Conversion — "Sign Up for TEMPO"
   - Objective: Conversions (optimize for Lead or StartTrial events)
   - Budget: $15/day
   - Audience: Retargeting website visitors (last 30 days) who did not sign up
   - Creative: Direct response — "Still thinking about it? Start your free 14-day Pro trial. No credit card needed."
   - CTA: "Sign Up"

4. AUDIENCE STRATEGY
   - Create these Custom Audiences:
     * Website Visitors (all, last 30 days)
     * Website Visitors (pricing page, last 14 days)
     * Engaged with Facebook/Instagram (last 60 days)
   - Create these Lookalike Audiences:
     * 1% Lookalike of website visitors (US)
     * 1% Lookalike of signups/leads (once we have enough data)

5. AD CREATIVE GUIDANCE
   - All ads should feel calm and supportive, never clinical or "disorder-focused."
   - Use language like: "Your brain works differently. Your planner should too." / "Planning shouldn't feel like punishment." / "AI that adapts to you, not the other way around."
   - Avoid: Medical claims, before/after health claims, language that pathologizes ADHD.
   - Color palette for creatives: Deep Indigo (#1A1A2E), white (#FFFFFF), soft purple accents, warm neutrals.

WHAT TO BRING BACK:
- Confirmation of Business Suite and Ad Account creation
- Meta Pixel code snippet to install
- List of all campaigns, ad sets, and audiences created
- Written ad copy for each campaign (headlines, primary text, descriptions)
- Creative briefs for video/carousel/static ads
- Total monthly budget summary
```

---

## SECTION 3 — Organic Marketing Strategy

### Prompt

```
I need your help building a comprehensive organic marketing strategy for my app. Here is full context:

APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Value prop: Tempo uses AI to gracefully organize your chaos — scheduling, prioritizing, and breaking down tasks so you can just focus on doing.
• Target audience: Adults with ADHD, neurodivergent professionals, productivity enthusiasts, executive function coaches, life coaches.
• Platforms: iOS, Android, Web.
• Pricing: Free ($0), Pro ($9/mo with 14-day trial), Team ($19/mo/user).
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers, NotePlan-style Editor, Two-Way Calendar Sync, Gentle Rescheduling.
• Brand voice: Calm, empathetic, empowering. We speak as an ally, never an authority. No toxic positivity. No "just try harder."
• Marketing site URL: https://[tempo-domain]
• Company stage: Pre-launch / early stage. Budget is limited — organic reach is critical.

TASKS — Research and produce a complete organic marketing plan covering:

1. SEO KEYWORD RESEARCH
   - Research and provide a prioritized list of 30+ target keywords organized by:
     * High intent (people looking for a solution): "adhd planner app", "best planner for adhd adults", "executive function tools"
     * Medium intent (exploring the problem): "how to plan with adhd", "why can't I stick to a planner", "executive dysfunction help"
     * Low intent / awareness (educational): "what is executive dysfunction", "adhd and time blindness", "neurodivergent productivity tips"
   - For each keyword, estimate: monthly search volume, difficulty, and recommended content type (blog post, landing page, FAQ).
   - Identify long-tail opportunities specific to ADHD + planning.

2. CONTENT CALENDAR (First 3 Months)
   - Create a month-by-month content calendar with:
     * 2 blog posts per week (topics, titles, target keywords, word count targets)
     * Blog post ideas should cover: ADHD planning tips, productivity strategies for neurodivergent people, comparisons with other tools, founder story, feature deep-dives, user stories
   - Example blog titles:
     * "Why Every Planner Failed You (And What to Do Instead)"
     * "The ADHD Brain Dump: How to Turn Chaos Into a Daily Plan"
     * "Time Blindness Is Real — Here's How AI Can Help"
     * "Todoist vs Tempo: Which Is Better for ADHD?"
     * "5 Signs You Need an ADHD-Friendly Planner"

3. SOCIAL MEDIA STRATEGY
   - Platform-by-platform plan:
     * Twitter/X: Daily posting schedule, thread ideas (ADHD tips, product updates, founder journey), hashtags (#ADHD, #ADHDPlanner, #Neurodivergent, #ProductivityTips), engagement strategy (reply to ADHD community posts)
     * Instagram: Posting schedule (3-4x/week), content mix (carousel tips, short Reels showing app features, quote graphics with brand colors), Stories strategy
     * TikTok: Short-form video ideas (day-in-the-life with ADHD + Tempo, "POV: your planner finally gets it", ADHD relatability content), posting frequency (3-5x/week)
     * LinkedIn: Thought leadership posts (1-2x/week), topics (neurodiversity in the workplace, building for underserved communities, founder journey)
     * Reddit: Communities to engage with (r/ADHD, r/adhdwomen, r/productivity, r/getdisciplined, r/Entrepreneurs), rules for authentic engagement (no spam, genuine help first), when/how to mention Tempo organically

4. EMAIL MARKETING
   - Recommend an email platform (e.g., Loops, ConvertKit, Mailchimp) suitable for early-stage startups.
   - Design these email sequences:
     * Welcome sequence (5 emails over 10 days): introduce Tempo, share ADHD planning tips, soft CTA to try the app
     * Onboarding drip (for new signups): guide through first daily plan, brain dump, focus timer
     * Newsletter: Weekly "ADHD Planning Tip" with blog content, product updates, community highlights
   - Write subject line suggestions for each email in the sequences.
   - Recommend lead magnet ideas: "The ADHD Daily Planning Checklist (PDF)", "5-Minute Brain Dump Template", "ADHD-Friendly Weekly Review Worksheet"

5. COMMUNITY BUILDING
   - Strategy for building a community around TEMPO:
     * Discord or Slack community? Recommend which and why.
     * Channel structure: #introductions, #daily-wins, #adhd-tips, #feature-requests, #accountability-buddies
     * Engagement tactics: weekly challenges ("Share your brain dump"), AMAs with ADHD coaches, accountability partnerships

6. INFLUENCER / CREATOR OUTREACH
   - Identify categories of influencers to partner with:
     * ADHD content creators (YouTube, TikTok, Instagram)
     * Productivity YouTubers/bloggers
     * ADHD coaches and therapists (ethical, non-clinical partnership)
     * Neurodivergent advocacy accounts
   - Outreach template: Write a warm, authentic outreach email/DM template that aligns with Tempo's brand voice
   - Partnership types: free Pro access for review, affiliate program, sponsored content, co-created content
   - Suggest 10 specific creators/accounts to research and potentially reach out to (by niche, not necessarily by name)

WHAT TO BRING BACK:
- Complete keyword research spreadsheet (keyword, volume, difficulty, content type)
- 3-month content calendar with all blog post titles and target keywords
- Social media strategy document with posting schedules and content ideas for each platform
- Email sequence outlines with subject lines
- Community building plan
- Influencer outreach strategy with template
- A prioritized "Quick Wins" list — the 5 things to do first for maximum organic impact
```

---

## SECTION 4 — Paid Ads Optimization & Analytics

### Prompt

```
I need your help setting up analytics, conversion tracking, and an optimization framework for my paid advertising campaigns. Here is full context:

APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Target audience: Adults with ADHD, neurodivergent professionals, productivity enthusiasts, executive function coaches.
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers (Pomodoro), NotePlan-style Markdown Editor, Two-Way Calendar Sync (Google/Outlook), Gentle Rescheduling.
• Brand voice: Calm, empathetic, empowering. Ally, not authority.
• Brand colors: Deep Indigo (#1A1A2E), soft purples, clean whites. Minimalist, calming aesthetic.
• Marketing site URL: https://[tempo-domain]
• App: iOS (com.tempo.app), Android (com.tempo.app)
• Pricing: Free ($0), Pro ($9/mo with 14-day trial), Team ($19/mo/user)
• Ad platforms in use: Google Ads, Meta (Facebook/Instagram) Ads
• Starting monthly ad budget: ~$1,200/month ($40/day across Google + Meta)

TASKS — Please do all of the following:

1. GOOGLE ANALYTICS 4 (GA4) SETUP
   - Go to https://analytics.google.com and create a GA4 property for TEMPO's marketing site.
   - Set up the data stream for the web property.
   - Provide the GA4 measurement ID and installation snippet.
   - Configure these events:
     * page_view (automatic)
     * sign_up (when user completes registration)
     * begin_trial (when user starts Pro trial)
     * pricing_page_view (when user visits pricing page)
     * feature_page_view (when user visits features page)
   - Enable Enhanced Measurement (scroll, outbound clicks, site search, file downloads).
   - Set up audiences:
     * "Engaged Visitors" — visited 3+ pages in one session
     * "Pricing Viewers" — visited the pricing page
     * "Trial Starters" — triggered begin_trial event
   - Link GA4 to Google Ads for audience sharing and conversion import.

2. CONVERSION FUNNELS
   - Set up these funnels in GA4 Explorations:
     * Funnel 1: Landing Page → Features Page → Pricing Page → Sign Up
     * Funnel 2: Landing Page → Sign Up (direct)
     * Funnel 3: Any Page → Pricing Page → Start Trial
   - For each funnel, explain what drop-off at each step might indicate and how to address it.

3. ATTRIBUTION MODEL
   - Recommend an attribution model for TEMPO's stage (early, small budget):
     * Explain data-driven vs last-click vs first-click for our context.
     * Recommend starting with last-click and moving to data-driven once we have 300+ conversions/month.
   - Set the attribution model in GA4 and Google Ads.

4. RETARGETING PIXEL SETUP
   - Verify Google Ads remarketing tag is installed (from Section 1).
   - Verify Meta Pixel is installed with standard events (from Section 2).
   - Create retargeting audiences:
     * Google: Website visitors (last 30 days) who did not convert; Pricing page visitors (last 14 days)
     * Meta: Same segments via Custom Audiences
   - Explain how to create cross-platform retargeting sequences (user sees Google ad → visits site → gets Meta retargeting ad).

5. A/B TESTING FRAMEWORK
   - Set up a systematic A/B testing plan:
     * Ad creative tests: Test 3 headline variations, 2 description variations, 2 image/video styles per campaign
     * Landing page tests: Recommend a tool (Google Optimize successor, VWO, or simple URL-based splits) and 3 landing page variations to test:
       - Variation A: Lead with empathy ("Your brain isn't broken")
       - Variation B: Lead with features ("AI builds your daily plan in 30 seconds")
       - Variation C: Lead with social proof ("Join 10,000+ ADHD professionals")
     * Testing cadence: Run each test for 2 weeks minimum or until 100+ conversions per variant
   - Document the testing protocol: hypothesis → test → measure → winner → iterate

6. BUDGET ALLOCATION STRATEGY
   - Recommend budget splits across channels:
     * Month 1: 50% Google Search, 30% Meta Awareness, 20% Meta Retargeting
     * Month 2: Adjust based on CPA data — shift budget to best-performing channel
     * Month 3+: Scale winners, pause losers, introduce new channels (TikTok ads, YouTube pre-roll)
   - Set CPA targets:
     * Free signup: Target $3-5 CPA
     * Pro trial start: Target $15-25 CPA
     * Pro conversion (paid): Target $40-60 CPA
   - Define ROAS targets for each tier.

7. KPI DASHBOARD
   - Recommend a dashboard tool (Google Looker Studio is free and connects to GA4 + Google Ads).
   - Set up or provide a template for a dashboard with these metrics:
     * Daily/weekly/monthly: Impressions, Clicks, CTR, CPC, Conversions, CPA, Spend
     * Funnel metrics: Landing page → Signup conversion rate, Signup → Trial conversion rate, Trial → Paid conversion rate
     * Channel comparison: Google vs Meta performance side-by-side
     * Key ratios: Customer Acquisition Cost (CAC), estimated Lifetime Value (LTV = $9/mo × avg retention months), LTV:CAC ratio (target 3:1+)
   - Include a weekly review checklist: What to check, what actions to take based on data.

WHAT TO BRING BACK:
- GA4 measurement ID and installation code
- Screenshot/confirmation of GA4 property setup with events and audiences
- Conversion funnel configurations
- Attribution model recommendation with setup confirmation
- A/B testing plan document
- Budget allocation spreadsheet for months 1-3
- KPI dashboard template or Looker Studio link
- Weekly optimization checklist
```

---

## SECTION 5 — Domain Name Strategy

### Prompt

```
I need your help researching and recommending domain names and setting up DNS for my app. Here is full context:

APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• App name: TEMPO
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Target audience: Adults with ADHD, neurodivergent professionals, productivity enthusiasts, executive function coaches.
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers (Pomodoro), NotePlan-style Markdown Editor, Two-Way Calendar Sync (Google/Outlook), Gentle Rescheduling.
• Brand voice: Calm, empathetic, empowering. Ally, not authority.
• Brand colors: Deep Indigo (#1A1A2E), soft purples, clean whites. Minimalist, calming aesthetic.
• Pricing: Free ($0), Pro ($9/mo with 14-day trial), Team ($19/mo/user).
• Founder location: Israel
• Business entity: Israeli company (Ltd / בע"מ)
• Planned subdomains: www (marketing site), app (web app), api (backend), docs (documentation)
• Email needs: hello@[domain], support@[domain], founders@[domain]

TASKS — Please do all of the following:

1. DOMAIN NAME RESEARCH
   - Search for available domains across these TLDs for "tempo" and variations:
     * Premium TLDs: .com, .app, .io, .co
     * Specialty: .adhd (if exists), .plan, .day, .life
     * Country-specific: .co.il (Israel)
   - Check availability and pricing for:
     * tempo.app
     * tempoplan.com
     * tempoapp.com
     * gettempo.com
     * gettempo.app
     * usetempo.com
     * usetempo.app
     * mytempo.app
     * trytempo.com
     * trytempo.app
     * tempoflow.com
     * tempoplanner.com
     * tempo-adhd.com
     * tempobrain.com
     * tempo.co.il
   - For each available domain, note: price, renewal price, and any premium pricing.
   - Recommend the top 3 choices with reasoning (brandability, length, memorability, SEO value).

2. BRAND PROTECTION
   - Recommend which additional domains to purchase defensively (common misspellings, alternative TLDs).
   - Check if "tempo" or "tempo app" has trademark conflicts in the productivity/software space.
   - Advise on trademark registration (US, EU, Israel) — what class to file under and estimated cost.

3. DOMAIN PURCHASE
   - Recommend a registrar (Cloudflare Registrar for at-cost pricing, or Google Domains, Namecheap).
   - Walk through purchasing the recommended primary domain.
   - Set up auto-renewal and WHOIS privacy.

4. DNS CONFIGURATION
   - Set up DNS records for the primary domain:
     * A/AAAA records for the root domain → marketing site hosting
     * CNAME: www → marketing site
     * CNAME: app → web app hosting
     * CNAME: api → API server
     * CNAME: docs → documentation hosting (e.g., GitBook, Notion, or custom)
   - Set up email DNS:
     * Recommend email provider: Google Workspace ($6/user/mo) vs Zoho Mail (free for 5 users) vs Fastmail
     * MX records for the chosen email provider
     * SPF, DKIM, DMARC records for email authentication
   - Set up SSL: Verify certificates are provisioned for all subdomains.

5. SUBDOMAIN STRATEGY
   - Confirm this subdomain structure:
     * `[domain]` or `www.[domain]` → Marketing site (TEMPO landing page, features, pricing, blog)
     * `app.[domain]` → Web application (the actual TEMPO planner)
     * `api.[domain]` → Backend API server
     * `docs.[domain]` → Developer/user documentation
     * `status.[domain]` → Status page (recommend: Instatus, Better Stack, or UptimeRobot)
   - Recommend any additional subdomains we might need.

6. EMAIL SETUP
   - Create these email addresses on the chosen provider:
     * hello@[domain] — General contact
     * support@[domain] — Customer support (will be used for app store listings)
     * press@[domain] — Media inquiries
     * legal@[domain] — Legal/compliance
   - Set up email forwarding to the founder's personal email for now.
   - Create an email signature template matching TEMPO branding.

WHAT TO BRING BACK:
- Domain availability report with prices
- Top 3 domain recommendations with reasoning
- Confirmation of domain purchase
- Complete DNS configuration (all records)
- Email provider setup confirmation
- Email signature template
- Brand protection / trademark advice summary
```

---

## SECTION 6 — App Store Optimization (ASO) — Apple App Store

### Prompt

```
I need your help preparing all materials for submitting my app to the Apple App Store. Here is full context:

APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Value prop: Tempo uses AI to gracefully organize your chaos — scheduling, prioritizing, and breaking down tasks so you can just focus on doing.
• Target audience: Adults with ADHD, neurodivergent professionals, productivity enthusiasts.
• Bundle ID: com.tempo.app
• Version: 1.0.0
• Pricing: Free download with in-app purchases (Pro $9/mo, Team $19/mo/user). 14-day free trial for Pro.
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers (Pomodoro), NotePlan-style Markdown Editor, Two-Way Calendar Sync (Google/Outlook), Gentle Rescheduling.
• Brand voice: Calm, empathetic, empowering.
• Platforms: iPhone, iPad.
• Privacy policy URL: https://[tempo-domain]/privacy
• Support URL: https://[tempo-domain]/support
• Marketing URL: https://[tempo-domain]

TASKS — Prepare all of the following App Store listing materials:

1. APP NAME & SUBTITLE
   - App Name (30 characters max): Suggest 3 options, e.g.:
     * "TEMPO — ADHD Daily Planner"
     * "TEMPO: AI Planner for ADHD"
     * "TEMPO – Smart ADHD Planner"
   - Subtitle (30 characters max): Suggest 3 options, e.g.:
     * "AI Planning for ADHD Brains"
     * "Your Calm Daily Planner"
     * "Focus, Plan, Breathe"

2. KEYWORDS (100 characters total, comma-separated)
   - Research and provide an optimized keyword string that maximizes discoverability:
   - Must include variations of: adhd, planner, executive function, neurodivergent, focus, timer, brain dump, daily plan, ai planner, productivity
   - Avoid duplicating words already in the app name/subtitle.
   - Provide the final comma-separated keyword string within the 100-character limit.

3. FULL DESCRIPTION (4000 characters max)
   - Write a compelling App Store description that:
     * Opens with a hook addressing the ADHD struggle with traditional planners
     * Lists key features with emoji bullets
     * Includes social proof placeholder
     * Mentions the free tier and Pro trial
     * Ends with a warm, empathetic CTA
     * Uses relevant keywords naturally
   - Write the complete description text.

4. PROMOTIONAL TEXT (170 characters max)
   - Write 3 options for promotional text (this can be updated without a new app version):
   - Examples: seasonal promotions, new feature announcements, launch celebration

5. WHAT'S NEW TEXT (Version 1.0.0)
   - Write the initial "What's New" text for the launch version.
   - Keep it warm and exciting, matching the brand voice.

6. SCREENSHOT STRATEGY
   - Define screenshot content for these sizes:
     * 6.7" (iPhone 15 Pro Max): 1290 × 2796 pixels — up to 10 screenshots
     * 6.5" (iPhone 14 Plus): 1284 × 2778 pixels — up to 10 screenshots
     * 5.5" (iPhone 8 Plus): 1242 × 2208 pixels — up to 10 screenshots
   - Recommend 6 screenshot scenes in order:
     1. Hero shot: "Your ADHD brain deserves a planner that gets it" — clean daily plan view
     2. AI Daily Staging: "Wake up to a plan that's already made" — morning staging screen
     3. Brain Dump: "Dump your thoughts. We'll sort them." — inbox/brain dump feature
     4. Focus Timer: "One task. Full focus. Built-in timer." — flow state timer
     5. Calendar Sync: "Your calendar and tasks, in harmony" — two-way sync view
     6. Gentle Rescheduling: "No guilt. Just gentle nudges." — rescheduling screen
   - For each screenshot: describe the text overlay, device frame style (modern, minimal), and background color (use Deep Indigo #1A1A2E or white).

7. APP PREVIEW VIDEO
   - Recommend a 15-30 second app preview video storyboard:
     * Scene 1 (0-5s): "Tired of planners that don't get it?" — show overwhelming traditional planner
     * Scene 2 (5-15s): "Meet TEMPO" — show AI staging a daily plan, brain dump processing, focus timer
     * Scene 3 (15-25s): "Built for ADHD brains" — show gentle rescheduling, calm UI
     * Scene 4 (25-30s): "Start free today" — app icon + CTA
   - Specs: 1080 × 1920 (portrait), 30fps, no letterboxing

8. CATEGORY SELECTION
   - Primary category: Productivity
   - Secondary category: Health & Fitness (for mental health / ADHD angle)
   - Explain why this combination maximizes visibility.

9. AGE RATING QUESTIONNAIRE
   - Provide recommended answers for the age rating questionnaire:
     * No violence, no sexual content, no gambling
     * User-generated content: No (at launch)
     * Unrestricted web access: No
     * Expected rating: 4+ (or equivalent)

10. APP PRIVACY (NUTRITION LABELS)
    - Data types collected by TEMPO:
      * Contact Info: Email address (account creation) — Linked to identity
      * Identifiers: User ID — Linked to identity
      * Usage Data: Product interaction, other usage data — Linked to identity
      * Diagnostics: Crash data, performance data — Not linked to identity
    - Data used for tracking: None (we do not track users across other apps)
    - Provide the exact selections for each category in App Store Connect.

11. REQUIRED DOCUMENTATION CHECKLIST
    - Privacy Policy URL: https://[tempo-domain]/privacy (must be live and accessible)
    - Support URL: https://[tempo-domain]/support
    - Marketing URL: https://[tempo-domain]
    - License Agreement: Default Apple EULA or custom (https://[tempo-domain]/terms)
    - Copyright: "© 2025 TEMPO Ltd."
    - Contact information for App Review team

WHAT TO BRING BACK:
- Complete app name, subtitle, and keywords ready to paste into App Store Connect
- Full description text (4000 chars)
- Promotional text options
- What's New text
- Screenshot content strategy with specifications
- App preview video storyboard
- Category and age rating selections
- Privacy nutrition label selections
- Documentation checklist with status of each item
```

---

## SECTION 7 — App Store Optimization (ASO) — Google Play Store

### Prompt

```
I need your help preparing all materials for submitting my app to the Google Play Store. Here is full context:

APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Value prop: Tempo uses AI to gracefully organize your chaos — scheduling, prioritizing, and breaking down tasks so you can just focus on doing.
• Target audience: Adults with ADHD, neurodivergent professionals, productivity enthusiasts.
• Package name: com.tempo.app
• Version: 1.0.0
• Pricing: Free download with in-app purchases (Pro $9/mo, Team $19/mo/user). 14-day free trial for Pro.
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers (Pomodoro), NotePlan-style Markdown Editor, Two-Way Calendar Sync (Google/Outlook), Gentle Rescheduling.
• Brand voice: Calm, empathetic, empowering.
• Privacy policy URL: https://[tempo-domain]/privacy
• Support URL: https://[tempo-domain]/support

TASKS — Prepare all of the following Google Play Store listing materials:

1. APP TITLE (50 characters max)
   - Suggest 3 options:
     * "TEMPO — ADHD Daily Planner & AI Focus Tool"
     * "TEMPO: Smart Planner for ADHD Brains"
     * "TEMPO – AI Daily Planner for ADHD & Focus"

2. SHORT DESCRIPTION (80 characters max)
   - Suggest 3 options:
     * "AI-powered daily planner designed for ADHD brains. Plan calmly. Focus deeply."
     * "The ADHD planner that adapts to your brain. AI planning, brain dump & focus."
     * "Finally, a planner that gets ADHD. AI daily plans, focus timers & brain dump."

3. FULL DESCRIPTION (4000 characters max)
   - Write a Google Play-optimized description that:
     * Front-loads keywords in the first 1-2 sentences (Google Play indexes the full description for search)
     * Uses structured formatting with feature headers
     * Includes relevant keywords naturally throughout
     * Highlights the free tier and 14-day Pro trial
     * Ends with a download CTA
   - Note: Google Play description can differ from App Store — optimize for Google's algorithm.
   - Write the complete description.

4. GRAPHIC ASSETS
   - Feature Graphic (1024 × 500 pixels):
     * Design brief: Deep Indigo (#1A1A2E) background, TEMPO logo centered, tagline "Your ADHD brain deserves a planner that gets it" below, subtle abstract pattern (matching marketing site hero).
   - App Icon (512 × 512 pixels):
     * Design brief: Should match the iOS icon. Clean, recognizable at small sizes. Suggest: stylized "T" or abstract brain/clock icon on Deep Indigo background.
   - Screenshots:
     * Phone: 16:9 aspect ratio, minimum 2, up to 8. Same 6 scenes as Apple (Section 6), adapted for Android device frames.
     * 7-inch tablet: Same scenes, tablet-optimized layouts
     * 10-inch tablet: Same scenes, tablet-optimized layouts
     * Chromebook: If applicable, same scenes in landscape

5. CONTENT RATING (IARC)
   - Walk through the IARC rating questionnaire:
     * No violence, no sexual content, no gambling, no controlled substances
     * User interaction: Users can communicate (if any social features)? No (at launch)
     * Location sharing: No
     * Expected rating: Everyone / PEGI 3
   - Provide recommended answers for each question.

6. DATA SAFETY SECTION
   - Fill out the Data Safety form to match our privacy policy:
     * Data collected:
       - Personal info: Email address (required, account creation)
       - App activity: App interactions, in-app search history
       - App info & performance: Crash logs, diagnostics, other app performance data
     * Data shared with third parties: None
     * Security practices:
       - Data is encrypted in transit: Yes
       - Data can be deleted: Yes (user can request account deletion)
       - Committed to Play Families Policy: No (not a kids app)
   - Provide the exact selections for each field.

7. STORE LISTING EXPERIMENTS (A/B Testing)
   - Set up 3 store listing experiments:
     * Experiment 1: Title test — Test 2 title variations
     * Experiment 2: Short description test — Test 2 short description variations
     * Experiment 3: Icon test — Test current icon vs 1 alternative
   - Explain how to read results and pick winners.

8. TARGET AUDIENCE & CONTENT
   - Target age group: 18 and over
   - Not designed for children under 13
   - Not a "Teacher Approved" app
   - Content declarations: No ads in the app (at launch)

9. CATEGORY & TAGS
   - Category: Productivity
   - Tags (select up to 5): Planner, Task Manager, To-Do List, Focus, Organization
   - Content rating: Everyone

10. REQUIRED DOCUMENTATION
    - Privacy policy URL: https://[tempo-domain]/privacy (required, must be accessible)
    - Data safety form: Complete (from step 6)
    - Ads declaration: App does not contain ads
    - Government apps: Not a government app
    - Financial features: No financial features
    - Health features: Not a regulated health app (ADHD support is productivity, not medical)

WHAT TO BRING BACK:
- Complete app title, short description ready to paste into Google Play Console
- Full description text (4000 chars) optimized for Google Play search
- Graphic asset design briefs with exact specifications
- IARC content rating questionnaire answers
- Data safety form selections
- Store listing experiment setup
- Category, tags, and audience declarations
- Documentation checklist with status
```

---

## SECTION 8 — App Store Required Documentation & Compliance

### Prompt

```
I need your help preparing all mandatory documentation and compliance materials required by both Apple App Store and Google Play Store for my app. Here is full context:

APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Target audience: Adults (18+) with ADHD, neurodivergent professionals, productivity enthusiasts, executive function coaches.
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers (Pomodoro), NotePlan-style Markdown Editor, Two-Way Calendar Sync (Google/Outlook), Gentle Rescheduling.
• Brand voice: Calm, empathetic, empowering. Ally, not authority.
• Brand colors: Deep Indigo (#1A1A2E), soft purples, clean whites. Minimalist, calming aesthetic.
• Bundle ID / Package: com.tempo.app
• Platforms: iOS, Android, Web
• Pricing: Freemium (Free, Pro $9/mo, Team $19/mo/user)
• Data collected: Email, user ID, task data, calendar data (with permission), voice memos (with permission), usage analytics, crash data.
• Third-party services: OpenAI API (for AI features), Google Calendar API, Microsoft Graph API (Outlook), analytics SDK.
• Founder location: Israel
• Business entity: Israeli company (Ltd / בע"מ)
• Legal pages exist at: https://[tempo-domain]/privacy and https://[tempo-domain]/terms (created in the Legal task)

TASKS — Prepare all of the following:

1. PRIVACY POLICY REVIEW FOR APP STORES
   - Review the existing privacy policy at https://[tempo-domain]/privacy against both Apple and Google requirements:
     * Apple requirements: Must disclose all data collection, use of tracking, third-party data sharing, data retention, user rights (access, deletion, portability).
     * Google requirements: Must match the Data Safety section exactly. Must disclose encryption, deletion mechanism, data sharing.
   - Provide a checklist of items our privacy policy MUST include for both stores.
   - Flag any gaps between our current privacy policy and store requirements.

2. SUPPORT PAGE / CONTACT SETUP
   - Create or recommend content for a support page at https://[tempo-domain]/support:
     * FAQ section (10 common questions): How to create an account, how to use brain dump, how to sync calendar, how to cancel subscription, how to delete account, etc.
     * Contact form or email: support@[tempo-domain]
     * Response time commitment: "We respond within 24 hours"
     * Link to knowledge base (if we create one)
   - This URL will be submitted to both app stores as the official support URL.

3. TERMS OF SERVICE / EULA REVIEW
   - Review the existing Terms of Service at https://[tempo-domain]/terms against app store requirements:
     * Apple: Can use Apple's standard EULA or provide a custom one. Custom EULA must cover in-app purchases, subscriptions, auto-renewal terms.
     * Google: Must include subscription terms, auto-renewal disclosures, and cancellation instructions.
   - Recommend whether to use Apple's standard EULA or our custom Terms.
   - Flag any gaps in our current Terms for app store compliance.

4. DATA DELETION MECHANISM
   - Both Apple and Google require users to be able to request data deletion.
   - Design and document the data deletion flow:
     * Option A: In-app "Delete My Account" button (Settings → Account → Delete Account)
     * Option B: Web form at https://[tempo-domain]/delete-account
     * Option C: Email request to support@[tempo-domain] (minimum requirement)
   - Recommend Option A (in-app) as Apple strongly prefers this.
   - Document what happens when deletion is requested:
     * Account deactivated immediately
     * Data deletion completed within 30 days
     * Subscription cancelled
     * Confirmation email sent
   - Provide the text/copy for the deletion confirmation dialog.

5. COPPA COMPLIANCE
   - TEMPO is not designed for children under 13.
   - Document our COPPA compliance stance:
     * We do not knowingly collect data from children under 13.
     * Age gate: Require users to confirm they are 18+ during signup.
     * If we discover a user is under 13, we will delete their account and data.
   - Provide the text for our COPPA statement to include in the privacy policy.

6. EXPORT COMPLIANCE (ENCRYPTION)
   - Apple requires an export compliance declaration.
   - TEMPO uses encryption:
     * HTTPS/TLS for data in transit: Yes (standard, exempt from export regulations)
     * End-to-end encryption: No
     * Custom encryption algorithms: No (we use standard libraries)
   - Based on this: TEMPO qualifies for the encryption exemption (uses only standard HTTPS).
   - Document the App Store Connect answers for the export compliance questionnaire:
     * "Does your app use encryption?" → Yes
     * "Does your app qualify for any exemptions?" → Yes, it uses only standard encryption (HTTPS/TLS)
     * "Is your app available in France?" → Provide if needed

7. ISRAELI BUSINESS ENTITY — DEVELOPER ACCOUNT REQUIREMENTS
   - Document what's needed to register as an Israeli company on both stores:
     * Apple Developer Program:
       - D-U-N-S Number (apply at https://developer.apple.com/enroll/duns-lookup/)
       - Legal entity name in English
       - Israeli business registration number (ח.פ.)
       - Authorized representative details
       - $99/year enrollment fee
       - Payment method: Credit card
     * Google Play Console:
       - $25 one-time registration fee
       - Developer identity verification (government ID)
       - Organization details: Legal name, address, phone, website
       - D-U-N-S Number (for organization accounts)
       - Israeli business address and phone number
   - Walk through the developer account registration process for both stores.
   - Note any Israel-specific considerations or requirements.

8. SUBSCRIPTION COMPLIANCE
   - Both stores have strict rules around subscription disclosure:
     * Must clearly display: price, billing period, free trial length, auto-renewal terms, cancellation instructions
     * Must show this information BEFORE the user subscribes
     * Apple: Must include subscription terms in the app description and on the paywall screen
     * Google: Must include subscription terms in the app and in the Play Store listing
   - Write the subscription disclosure text to display in-app:
     * "TEMPO Pro — $9.00/month after a 14-day free trial. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. You can manage and cancel your subscription in your [App Store/Google Play] account settings."
   - Write the subscription terms to include in the app store descriptions.

WHAT TO BRING BACK:
- Privacy policy review checklist with gaps identified
- Support page content (FAQ, contact info)
- Terms of Service review with recommendations
- Data deletion flow documentation with in-app copy
- COPPA compliance statement
- Export compliance questionnaire answers
- Israeli developer account registration guide for both stores
- Subscription disclosure text for in-app and store listings
- Master compliance checklist showing readiness for both stores
```

---

## SECTION 9 — App Store Marketing Copy & Keywords

### Prompt

```
I need your help generating optimized marketing copy, keywords, and templates for my app's presence on both Apple App Store and Google Play Store. Here is full context:

APP CONTEXT — TEMPO
• What: AI-powered daily planner designed specifically for people with ADHD and neurodivergent minds.
• Tagline: "Your ADHD brain deserves a planner that gets it."
• Value prop: Tempo uses AI to gracefully organize your chaos — scheduling, prioritizing, and breaking down tasks so you can just focus on doing.
• Target audience: Adults with ADHD, neurodivergent professionals, productivity enthusiasts, executive function coaches.
• Pricing: Free ($0), Pro ($9/mo with 14-day trial), Team ($19/mo/user).
• Key features: AI Daily Staging, Smart Brain Dump (voice + text), Flow State Timers (Pomodoro), NotePlan-style Markdown Editor, Two-Way Calendar Sync (Google/Outlook), Gentle Rescheduling.
• Brand voice: Calm, empathetic, empowering. Ally, not authority.
• Competitors: Todoist, Notion, Things 3, Structured, Tiimo, Routinery

TASKS — Please generate all of the following:

1. KEYWORD VARIATIONS (10 per store)
   - Apple App Store keywords (remember: 100-character limit, comma-separated, no spaces after commas):
     * Research and provide 10 keyword groupings, then the final optimized 100-character string.
     * Keywords to consider: adhd planner, executive function, neurodivergent, daily planning, ai planner, focus timer, brain dump, task manager, pomodoro, productivity, daily agenda, time management, schedule, organizer, mindful planning
     * Avoid words already in the app name/subtitle.
   - Google Play keywords (embedded in the description, no separate field):
     * Provide 10 keyword phrases to naturally embed in the description.
     * Focus on long-tail: "adhd planner app", "ai daily planner for adhd", "executive function planner", "neurodivergent productivity app", "adhd focus timer", "brain dump task manager", "gentle task rescheduling", "adhd friendly planner", "ai powered planner", "pomodoro planner adhd"

2. LOCALIZED DESCRIPTIONS
   - English (US) — Primary:
     * Full description for App Store (4000 chars)
     * Full description for Google Play (4000 chars)
     * (These may have been created in Sections 6 and 7 — refine and optimize them here)
   - Hebrew (עברית) — Secondary:
     * Translate the App Store short description (subtitle) to Hebrew
     * Translate the Google Play short description to Hebrew
     * Write a Hebrew full description (4000 chars) — adapted, not just translated. Should feel natural to Hebrew-speaking ADHD community.
     * Hebrew keywords for App Store (100 chars)

3. REVIEW RESPONSE TEMPLATES
   - Write 5 response templates for POSITIVE reviews:
     * Template 1 (Generic gratitude): Warm, personal thank you
     * Template 2 (Feature appreciation): When user praises a specific feature
     * Template 3 (ADHD journey): When user shares their ADHD experience
     * Template 4 (Rating ask): When user leaves 4 stars — gentle nudge for 5
     * Template 5 (Pro upgrade): When free user raves — soft mention of Pro features
   - Write 5 response templates for NEGATIVE reviews:
     * Template 1 (Bug report): Acknowledge, apologize, ask for details, provide support email
     * Template 2 (Missing feature): Thank for feedback, share roadmap excitement
     * Template 3 (Subscription complaint): Empathize, explain value, mention free tier
     * Template 4 (Comparison): When user says "X app is better" — acknowledge, highlight unique ADHD focus
     * Template 5 (Performance issue): Apologize, request device/OS details, promise fix
   - All responses should match the brand voice: calm, empathetic, never defensive.

4. FEATURE ANNOUNCEMENT TEMPLATES
   - Write 3 "What's New" templates for future updates:
     * Template A — Major feature release (e.g., "Smart Routines"):
       "✨ New: Smart Routines — Build habits that stick, not stress. Tempo now learns your daily patterns and suggests routines that work with your brain, not against it. Plus: [2-3 smaller improvements]. As always, we'd love to hear from you at support@[domain]."
     * Template B — Bug fix / performance release:
       "🛠 We've been listening. This update squashes [X] bugs and makes Tempo faster and smoother. Specific fixes: [list]. Your feedback makes Tempo better — thank you."
     * Template C — Seasonal / thematic release:
       "🌿 Fresh start? Us too. [Seasonal tie-in]. New in this update: [features]. Wishing you a calm and focused [season]."

5. PRESS KIT / MEDIA PAGE CONTENT
   - Write content for a press/media page at https://[tempo-domain]/press:
     * Company boilerplate (150 words): Who we are, what we do, why we exist
     * Founder bio placeholder (100 words)
     * Key statistics placeholder: Users, countries, ratings (to be filled when available)
     * Product description (50 words): Concise, quotable
     * Brand assets section: Logo (link to download), screenshots (link to download), brand colors, typography
     * Press contact: press@[tempo-domain]
     * Key messaging / talking points:
       - "TEMPO is the first AI planner built from the ground up for ADHD brains."
       - "Traditional productivity tools assume neurotypical executive function. TEMPO doesn't."
       - "We believe planning should feel like scaffolding, not a cage."
     * Sample press headlines:
       - "Israeli Startup TEMPO Launches AI Planner for ADHD Community"
       - "TEMPO: The Anti-Productivity App That Actually Gets Things Done"
       - "How TEMPO Uses AI to Turn ADHD Chaos Into Calm"
   - Provide a downloadable press kit checklist (what to include: logo files, screenshots, founder photo, boilerplate, fact sheet).

6. ASO COMPETITIVE ANALYSIS
   - Analyze the App Store and Google Play listings of these competitors:
     * Todoist, Notion, Things 3, Structured, Tiimo, Routinery
   - For each, note: title format, keyword strategy, description structure, screenshot style, rating, review count.
   - Identify gaps and opportunities: What keywords are they missing? What positioning angles are underserved?
   - Provide recommendations on how TEMPO can differentiate in search results and browse.

WHAT TO BRING BACK:
- Finalized keyword strings for both stores (English + Hebrew)
- Localized descriptions (English + Hebrew) for both stores
- 10 review response templates (5 positive, 5 negative)
- 3 "What's New" templates
- Press kit / media page content
- Competitive analysis summary with actionable recommendations
- A "Top 10 ASO Quick Wins" list — immediate actions to maximize visibility at launch
```

---

## Appendix: How to Use These Prompts

1. **Open Perplexity** at https://perplexity.ai (Pro account recommended for Computer Use features).
2. **Copy the entire prompt** from a section above — including the APP CONTEXT block.
3. **Paste into Perplexity** and hit enter.
4. **Follow along** as Perplexity navigates websites and performs tasks.
5. **Save the outputs** — copy text, download files, take screenshots as needed.
6. **Check the "WHAT TO BRING BACK" section** at the end of each prompt to ensure you've captured everything.
7. **Update the Master Checklist** at the top of this document as you complete each section.

### Order of Operations

For best results, complete sections in this approximate order:

1. **Section 5** (Domain) — You need a domain before everything else.
2. **Section 8** (Compliance) — Legal pages must be live before store submissions.
3. **Sections 6 & 7** (App Store listings) — Prepare store materials.
4. **Section 9** (Marketing copy) — Refine and optimize store copy.
5. **Sections 1 & 2** (Paid ads) — Set up ad accounts and campaigns.
6. **Section 4** (Analytics) — Set up tracking before going live with ads.
7. **Section 3** (Organic) — Start organic strategy in parallel with paid.

### Tips

- Replace `[tempo-domain]` with your actual domain once purchased (Section 5).
- Some prompts reference outputs from other sections — complete dependencies first.
- Each prompt is self-contained, but running them in the recommended order avoids rework.
- Save all outputs in a shared folder (Google Drive, Notion, etc.) for the team to reference.
- **Privacy note:** When saving "WHAT TO BRING BACK" outputs (especially screenshots), redact or avoid sharing billing details, account IDs, API keys, or other sensitive credentials. Store these securely and separately from shared marketing documents.
