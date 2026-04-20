# Settings & billing — component map (Tier B)

**@category:** Settings  
**@prd:** §4; §15 Pricing & paywall; §16 Compliance; §8 Coach dial may appear in settings.

---

## settings

- **@screen:** settings (profile)  
- **@route:** `(tempo)/settings/profile/page.tsx`  
- **@source:** `screens-6.jsx`  
- **@prd:** §4; §16  
- **@summary:** Profile, avatar, display name.

### Interactive (stub)

- Save profile — `@mutation: users.updateProfile`

---

## settings-prefs

- **@screen:** settings-prefs  
- **@route:** `(tempo)/settings/preferences/page.tsx`  
- **@source:** `screens-6.jsx`  
- **@prd:** §4; accessibility (dyslexia, theme, reduced motion)  
- **@summary:** Preferences toggles.

### Interactive (stub)

- Theme — `@mutation: settings.setTheme`  
- Dyslexia font — `@mutation: settings.setDyslexia`

---

## settings-integrations

- **@screen:** settings-integrations  
- **@route:** `(tempo)/settings/integrations/page.tsx`  
- **@source:** `screens-6.jsx`  
- **@prd:** §2 non-goals external calendar (Phase 2) — stub honest copy  
- **@summary:** Integration cards; MVP may be in-app only.

### Interactive (stub)

- Connect — `@todo: Phase 2` or disabled with explanation

---

## billing

- **@screen:** billing  
- **@route:** `(tempo)/billing/page.tsx`  
- **@source:** `screens-6.jsx`  
- **@prd:** §15 RevenueCat; trial copy  
- **@summary:** Plan picker; upgrade/downgrade.

### Interactive (stub)

- Manage subscription — `@action: openRevenueCatPortal` · `@auth: required`

---

## trial-end

- **@screen:** trial-end  
- **@route:** `(tempo)/billing/trial-end/page.tsx`  
- **@source:** `screens-6.jsx`  
- **@prd:** §15  
- **@summary:** Trial ended; upgrade CTA.

### Interactive (stub)

- Subscribe — `@action: startCheckout`

---

## ask-founder

- **@screen:** ask-founder  
- **@route:** `(tempo)/ask-founder/page.tsx`  
- **@source:** `screens-6.jsx`  
- **@prd:** §4; PRD Ask-the-Founder queue  
- **@summary:** Async message to founder.

### Interactive (stub)

- Send — `@mutation: founderMessages.create`

---

## notifications

- **@screen:** notifications  
- **@route:** `(tempo)/notifications/page.tsx`  
- **@source:** `screens-6.jsx`  
- **@prd:** §4  
- **@summary:** Notification list; mark read.

### Interactive (stub)

- Mark read — `@mutation: notifications.markRead`
