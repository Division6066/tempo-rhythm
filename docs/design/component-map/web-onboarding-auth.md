# Onboarding & auth (bare shells) — component map (Tier B)

**@category:** Auth  
**@prd:** §4; §16; Convex Auth only (`HARD_RULES`).

---

## sign-in

- **@screen:** sign-in  
- **@route:** `/sign-in`  
- **@source:** `screens-7.jsx`  
- **@prd:** §4  
- **@summary:** No app chrome; email / passkey / magic link per product.

### Interactive (stub)

- Submit credentials — `@mutation: auth.signIn` (Convex Auth)  
- **@auth:** public

---

## onboarding

- **@screen:** onboarding  
- **@route:** `/onboarding`  
- **@source:** `screens-7.jsx` (5 steps)  
- **@prd:** §4 activation within 24h; coach personality seed  
- **@summary:** Multi-step first-run; collects preferences.

### Interactive (stub)

- Next / Back — `@action: onboardingStep`  
- Complete — `@mutation: users.completeOnboarding`  
- **@auth:** required (session during signup)
