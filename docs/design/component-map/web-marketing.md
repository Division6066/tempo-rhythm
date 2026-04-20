# Marketing — component map (Tier B)

**@category:** Marketing (public)  
**@prd:** §4 launch surfaces; §16 legal links; brand `docs/brain/brand/voice.md`.

---

## landing

- **@screen:** landing  
- **@route:** `/` (marketing home)  
- **@source:** `design-system/landing.html`  
- **@prd:** §18 Launch surfaces  
- **@summary:** Hero, value props, CTA to app / sign-in.

### Interactive (stub)

- Primary CTA — `@navigate: /sign-in` or `/app`  
- Try daily note link — `@navigate: app.html?screen=daily-note` (design preview) / production route when wired

---

## about

- **@screen:** about  
- **@route:** `/about`  
- **@source:** `about.html`, `screens-7.jsx`  
- **@prd:** §4  
- **@summary:** About page.

### Interactive (stub)

- Contact / social — `@action: outbound link` (no tracking without consent)

---

## changelog

- **@screen:** changelog  
- **@route:** `/changelog`  
- **@source:** `changelog.html`, `screens-7.jsx`  
- **@prd:** §4  
- **@summary:** Release notes list.

### Interactive (stub)

- Version anchor — `@navigate: #anchor`
