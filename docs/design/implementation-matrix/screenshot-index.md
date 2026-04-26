# Screenshot Index — `docs/design/claude-export/design-system/`

> Every PNG screenshot bundled with the Claude design export, grouped
> by feature. File names use a Figma-style "_<slug>" convention with
> optional `01-` / `02-` prefixes for the dark variant.
>
> Use these as the visual ground truth when porting a screen.

---

## Voice — landing / today / full

| File | Variant | Notes |
|---|---|---|
| `_voice-home.png` | light | Voice-first landing, marketing-style |
| `_voice-home2.png` | light alt | Layout variant |
| `_voice-home3.png` | light alt | Layout variant |
| `01-_voice-today.png` | light | Today screen with voice dock |
| `02-_voice-today.png` | dark | Today screen with voice dock |
| `01-_voice-dock.png` | light | Voice dock floating component |
| `02-_voice-dock.png` | dark | Voice dock floating component |
| `01-_voice-full.png` | light | Full voice mode (live) |
| `02-_voice-full.png` | dark | Full voice mode (live) |

## Voice — walkie-talkie + check states

| File | Notes |
|---|---|
| `_vcwalkie.png` | Walkie-talkie / push-to-talk modal |
| `_vcvoice.png` | Live voice mode |
| `_vcfinal3.png` | Final reviewed VC composition |
| `01-_vcfinal.png` / `02-_vcfinal.png` | Light / dark final |
| `01-_vcfinal2.png` / `02-_vcfinal2.png` | Light / dark final-alt |
| `_voice-check.png` … `_voice-check10.png` | 10 incremental review states for voice UX |

## Coach

| File | Notes |
|---|---|
| `_check-coach-screen.png` | Coach screen reviewed render |
| `_check-coach-input.png` | Input row reviewed render |
| `_check-dock2.png` … `_check-dock4.png` | Coach dock review states |
| `01-_check-dock.png` / `02-_check-dock.png` | Light / dark dock |

## Template builder

| File | Notes |
|---|---|
| `_check-builder.png` | Builder canvas |
| `_check-builder2.png` | Inspector / palette state |
| `_check-builder3.png` | Slash-menu open |
| `_check-builder4.png` | AI block prompt |
| `_check-builder-wide.png` | Wide layout sanity |
| `_check-slash.png` | Slash menu typed |
| `_check-slash-ai.png` | Slash → AI block |

## Template run

| File | Notes |
|---|---|
| `_check-run.png` … `_check-run6.png` | Six iteration states of the run-mode UI |
| `_run-weekly.png` | Weekly run render |

---

## How to use

When porting a screen:

1. Find the matching screenshot above.
2. Open it side-by-side with your dev preview.
3. Compare layout primitive-by-primitive (header, body, dock, modal).
4. Light + dark — both must match.
5. If your preview drifts, *do not* edit the prototype source — adjust your
   port until the screenshot is reproduced.

## Insufficient evidence

These prototype assets have **no matching screenshot** — port from JSX
alone and flag any ambiguity:

- `daily-note` (no `_daily-*.png` file)
- `journal`, `calendar`, `habits`, `routines`, `goals`, `projects`
  detail screens
- `analytics`, `activity`, `search`, `command`, `empty-states`
- `settings/*`
- `about`, `changelog`, `landing` (HTML-only — render those HTML files
  in a browser as the visual reference instead)
- `mobile-*` screens (no PNGs in the bundle)
- Onboarding screens
