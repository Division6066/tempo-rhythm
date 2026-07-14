import { expect, test } from '@playwright/test';
import {
  tempoColors,
  tempoRadii,
  tempoSpacing,
} from '../../../packages/ui/src/theme/tokens';

type Locale = 'en' | 'he';

const hexToRgb = (hex: string): string => {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgb(${red}, ${green}, ${blue})`;
};

const sampleCopy = {
  en: {
    eyebrow: 'Theme sample',
    title: 'Plan one gentle next step',
    body: 'Soft Editorial tokens keep the mobile sample calm and readable.',
    action: 'Review',
  },
  he: {
    eyebrow: 'דוגמת ערכת נושא',
    title: 'לתכנן צעד קטן ועדין',
    body: 'הטוקנים של Soft Editorial שומרים על מסך רגוע וקריא.',
    action: 'בדיקה',
  },
} as const;

const renderThemeSample = (locale: Locale): string => {
  const isRtl = locale === 'he';
  const copy = sampleCopy[locale];

  return `<!doctype html>
    <html lang="${locale}" dir="${isRtl ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8" />
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: ${tempoColors.cream};
            color: ${tempoColors.ink};
            font-family: Inter, system-ui, sans-serif;
          }

          [data-testid="sample-shell"] {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: ${tempoSpacing[6]}px;
          }

          [data-testid="sample-card"] {
            width: 420px;
            display: flex;
            flex-direction: row;
            align-items: stretch;
            gap: ${tempoSpacing[4]}px;
            padding: ${tempoSpacing[5]}px;
            border: 1px solid ${tempoColors.line};
            border-radius: ${tempoRadii['2xl']}px;
            background: ${tempoColors.creamRaised};
          }

          [data-testid="accent-rail"] {
            width: ${tempoSpacing[2]}px;
            border-radius: ${tempoRadii.pill}px;
            background: ${tempoColors.tempoOrange};
            flex: 0 0 auto;
          }

          [data-testid="sample-content"] {
            flex: 1 1 auto;
            min-width: 0;
            text-align: ${isRtl ? 'right' : 'left'};
          }

          [data-testid="sample-eyebrow"] {
            margin: 0 0 ${tempoSpacing[2]}px;
            color: ${tempoColors.moss};
            font-size: 12px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          [data-testid="sample-title"] {
            margin: 0 0 ${tempoSpacing[2]}px;
            font-family: Newsreader, Georgia, serif;
            font-size: 28px;
            line-height: 1.1;
          }

          [data-testid="sample-body"] {
            margin: 0;
            color: ${tempoColors.dustGrey};
            line-height: 1.5;
          }

          [data-testid="sample-action"] {
            align-self: flex-start;
            border: 0;
            border-radius: ${tempoRadii.pill}px;
            background: ${tempoColors.ink};
            color: ${tempoColors.creamRaised};
            font: inherit;
            padding: ${tempoSpacing[2]}px ${tempoSpacing[4]}px;
          }
        </style>
      </head>
      <body>
        <main data-testid="sample-shell">
          <section data-testid="sample-card" aria-label="${copy.eyebrow}">
            <div data-testid="accent-rail"></div>
            <div data-testid="sample-content">
              <p data-testid="sample-eyebrow">${copy.eyebrow}</p>
              <h1 data-testid="sample-title">${copy.title}</h1>
              <p data-testid="sample-body">${copy.body}</p>
            </div>
            <button data-testid="sample-action" type="button">${copy.action}</button>
          </section>
        </main>
      </body>
    </html>`;
};

test.describe('Theme tokens directionality', () => {
  test('LTR theme sample renders with left-to-right direction and layout', async ({
    page,
  }) => {
    await page.setContent(renderThemeSample('en'));

    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByTestId('sample-card')).toHaveCSS(
      'background-color',
      hexToRgb(tempoColors.creamRaised)
    );
    await expect(page.getByTestId('accent-rail')).toHaveCSS(
      'background-color',
      hexToRgb(tempoColors.tempoOrange)
    );
    await expect(page.getByTestId('sample-content')).toHaveCSS(
      'text-align',
      'left'
    );

    const rail = await page.getByTestId('accent-rail').boundingBox();
    const content = await page.getByTestId('sample-content').boundingBox();
    const action = await page.getByTestId('sample-action').boundingBox();

    expect(rail).not.toBeNull();
    expect(content).not.toBeNull();
    expect(action).not.toBeNull();
    expect(rail!.x).toBeLessThan(content!.x);
    expect(content!.x).toBeLessThan(action!.x);
  });

  test('RTL theme sample renders with right-to-left direction and mirrored layout', async ({
    page,
  }) => {
    await page.setContent(renderThemeSample('he'));

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('sample-card')).toHaveCSS(
      'background-color',
      hexToRgb(tempoColors.creamRaised)
    );
    await expect(page.getByTestId('accent-rail')).toHaveCSS(
      'background-color',
      hexToRgb(tempoColors.tempoOrange)
    );
    await expect(page.getByTestId('sample-content')).toHaveCSS(
      'text-align',
      'right'
    );

    const rail = await page.getByTestId('accent-rail').boundingBox();
    const content = await page.getByTestId('sample-content').boundingBox();
    const action = await page.getByTestId('sample-action').boundingBox();

    expect(rail).not.toBeNull();
    expect(content).not.toBeNull();
    expect(action).not.toBeNull();
    expect(action!.x).toBeLessThan(content!.x);
    expect(content!.x).toBeLessThan(rail!.x);
  });
});
