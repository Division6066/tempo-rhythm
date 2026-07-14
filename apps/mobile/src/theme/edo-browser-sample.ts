import { edoTheme } from "../../../../packages/theme/src/edo";

type EdoLanguage = "en" | "he";
type EdoDirection = "ltr" | "rtl";

const sampleCopy = {
  kanji: "道",
  romaji: "Michi",
  title: "Edo rhythm tokens",
  body: "A quiet sumi-e system for planning without pressure.",
} as const;

const getDirection = (language: EdoLanguage): EdoDirection =>
  language === "he" ? "rtl" : "ltr";

export { edoTheme };

const renderTokenCss = (): string => `
  :root {
    --edo-color-indigo: ${edoTheme.colors.indigo};
    --edo-color-vermilion: ${edoTheme.colors.vermilion};
    --edo-color-sumi: ${edoTheme.colors.sumi};
    --edo-color-gold-leaf: ${edoTheme.colors.goldLeaf};
    --edo-color-washi: ${edoTheme.colors.washi};
    --edo-color-washi-raised: ${edoTheme.colors.washiRaised};
    --edo-color-sumi-muted: ${edoTheme.colors.sumiMuted};
    --edo-color-mist: ${edoTheme.colors.mist};
    --edo-font-display: ${edoTheme.type.display};
    --edo-font-body: ${edoTheme.type.body};
    --edo-font-annotation: ${edoTheme.type.annotation};
    --edo-font-kanji: ${edoTheme.type.kanji};
    --edo-space-xs: ${edoTheme.spacing.xs}px;
    --edo-space-sm: ${edoTheme.spacing.sm}px;
    --edo-space-md: ${edoTheme.spacing.md}px;
    --edo-space-lg: ${edoTheme.spacing.lg}px;
    --edo-space-xl: ${edoTheme.spacing.xl}px;
    --edo-space-xxl: ${edoTheme.spacing.xxl}px;
    --edo-radius-lg: ${edoTheme.radii.lg}px;
    --edo-radius-full: ${edoTheme.radii.full}px;
    --edo-motion-settle: ${edoTheme.motion.settle}ms;
    --edo-motion-brush: ${edoTheme.motion.brush};
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  [data-testid="edo-sample-screen"] {
    background: var(--edo-color-washi);
    color: var(--edo-color-sumi);
    font-family: var(--edo-font-body), sans-serif;
    min-height: 100vh;
    padding-block: var(--edo-space-lg);
    padding-inline: var(--edo-space-lg);
  }

  [data-testid="edo-token-card"] {
    background: var(--edo-color-washi-raised);
    border: 1px solid var(--edo-color-gold-leaf);
    border-radius: var(--edo-radius-lg);
    padding-block: var(--edo-space-md);
    padding-inline: var(--edo-space-md);
    position: relative;
  }

  [data-testid="edo-direction-accent"] {
    background: var(--edo-color-vermilion);
    border-radius: var(--edo-radius-full);
    height: var(--edo-space-sm);
    inline-size: var(--edo-space-xl);
    inset-block-start: var(--edo-space-md);
    inset-inline-start: var(--edo-space-md);
    position: absolute;
    transition: inset var(--edo-motion-settle) var(--edo-motion-brush);
  }

  [data-testid="kanji-romaji-pair"] {
    display: grid;
    gap: var(--edo-space-xs);
  }

  .edo-kanji {
    color: var(--edo-color-sumi);
    font-family: var(--edo-font-kanji), serif;
    font-size: var(--edo-space-xxl);
    line-height: 1;
  }

  .edo-romaji {
    color: var(--edo-color-sumi-muted);
    font-family: var(--edo-font-annotation), monospace;
    font-size: calc(var(--edo-space-md) - var(--edo-space-xs));
    letter-spacing: calc(var(--edo-space-xs) / 2);
    text-transform: uppercase;
  }

  [data-testid="enso-ring"] {
    block-size: var(--edo-space-xxl);
    border: var(--edo-space-xs) solid var(--edo-color-indigo);
    border-radius: var(--edo-radius-full);
    border-inline-end-color: var(--edo-color-vermilion);
    inline-size: var(--edo-space-xxl);
  }
`;

export const renderEdoThemeSampleHtml = (language: EdoLanguage): string => {
  const direction = getDirection(language);

  return `<!doctype html>
    <html lang="${language}" dir="${direction}">
      <head>
        <meta charset="utf-8" />
        <style>${renderTokenCss()}</style>
      </head>
      <body>
        <main data-testid="edo-sample-screen" dir="${direction}">
          <section data-testid="edo-token-card">
            <span data-testid="edo-direction-accent"></span>
            <div data-testid="enso-ring" aria-label="Enso ring"></div>
            <div data-testid="kanji-romaji-pair" aria-label="${sampleCopy.kanji}, ${sampleCopy.romaji}">
              <span class="edo-kanji">${sampleCopy.kanji}</span>
              <span class="edo-romaji">${sampleCopy.romaji}</span>
            </div>
            <h1>${sampleCopy.title}</h1>
            <p>${sampleCopy.body}</p>
          </section>
        </main>
      </body>
    </html>`;
};
