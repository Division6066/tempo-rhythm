import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process';

type BrowserCueEvent = {
  cue: 'audio' | 'haptic';
  patternId: string;
  phaseId: string;
  phaseLabel: string;
  elapsedMs: number;
};

declare global {
  interface Window {
    __tempoBreathworkEvents?: BrowserCueEvent[];
  }
}

const port = 19086;
const baseUrl = `http://127.0.0.1:${port}`;
const serverLines: string[] = [];

let server: ChildProcessWithoutNullStreams | undefined;

type LocatorLike = {
  textContent: () => Promise<string | null>;
};

type PageLike = {
  addInitScript: (callback: () => void) => Promise<void>;
  evaluate: {
    <Result>(callback: () => Result | Promise<Result>): Promise<Result>;
    <Arg, Result>(
      callback: (arg: Arg) => Result | Promise<Result>,
      arg: Arg
    ): Promise<Result>;
  };
  getByTestId: (testId: string) => LocatorLike;
  goto: (url: string) => Promise<unknown>;
  waitForTimeout: (timeoutMs: number) => Promise<void>;
};

type LocatorAssertion = {
  toBeVisible: (options?: { timeout?: number }) => Promise<void>;
  toHaveText: (text: string) => Promise<void>;
};

type ValueAssertion = {
  toBeGreaterThanOrEqual: (expected: number) => void;
  toBeLessThanOrEqual: (expected: number) => void;
  toEqual: (expected: unknown) => void;
  toHaveLength: (expected: number) => void;
};

type PlaywrightExpect = {
  (actual: LocatorLike): LocatorAssertion;
  (actual: unknown): ValueAssertion;
};

type PlaywrightTest = {
  (title: string, callback: (args: { page: PageLike }) => Promise<void>): void;
  afterAll: (callback: () => void) => void;
  beforeAll: (callback: () => Promise<void>) => void;
};

type PlaywrightModule = {
  expect: PlaywrightExpect;
  test: PlaywrightTest;
};

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error(`Expo web server did not start.\n${serverLines.join('\n')}`);
}

function readElapsedMs(text: string | null): number {
  const match = text?.match(/Elapsed (?<elapsed>\d+) ms/);
  if (!match?.groups?.elapsed) {
    throw new Error(`Could not read elapsed text: ${text ?? '<empty>'}`);
  }

  return Number.parseInt(match.groups.elapsed, 10);
}

async function setVisibility(
  page: PageLike,
  visibilityState: 'hidden' | 'visible'
): Promise<void> {
  await page.evaluate((nextVisibilityState) => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: nextVisibilityState,
    });
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: nextVisibilityState === 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, visibilityState);
}

function registerBreathworkTimerSpec({ expect, test }: PlaywrightModule): void {
  test.beforeAll(async () => {
    server = spawn(
      'bun',
      [
        '--cwd',
        'apps/mobile',
        'x',
        'expo',
        'start',
        '--web',
        '--port',
        String(port),
        '--non-interactive',
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          CI: '1',
          EXPO_NO_TELEMETRY: '1',
          EXPO_PUBLIC_CONVEX_URL: 'http://127.0.0.1:3210',
        },
        stdio: 'pipe',
      }
    );

    server.stdout.on('data', (chunk: Buffer) => {
      serverLines.push(chunk.toString());
    });
    server.stderr.on('data', (chunk: Buffer) => {
      serverLines.push(chunk.toString());
    });

    await waitForServer();
  });

  test.afterAll(() => {
    server?.kill('SIGTERM');
  });

  test('4-7-8 timer keeps wall-clock time and cues every phase change', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__tempoBreathworkEvents = [];
    });

    await page.goto(`${baseUrl}/breathwork?autoplay=1&loops=1`);
    await expect(page.getByTestId('breathwork-phase')).toHaveText('Inhale');

    await page.waitForTimeout(2_000);
    await setVisibility(page, 'hidden');
    await page.waitForTimeout(4_250);
    await setVisibility(page, 'visible');

    const elapsedAfterForeground = readElapsedMs(
      await page.getByTestId('elapsed-ms').textContent()
    );
    expect(elapsedAfterForeground).toBeGreaterThanOrEqual(5_800);
    expect(elapsedAfterForeground).toBeLessThanOrEqual(7_200);
    await expect(page.getByTestId('breathwork-phase')).toHaveText('Hold');

    await expect(page.getByTestId('breathwork-complete')).toBeVisible({
      timeout: 15_000,
    });

    const finalElapsedMs = readElapsedMs(
      await page.getByTestId('elapsed-ms').textContent()
    );
    const cueEvents = await page.evaluate(
      () => window.__tempoBreathworkEvents ?? []
    );
    const audioEvents = cueEvents.filter((event) => event.cue === 'audio');
    const hapticEvents = cueEvents.filter((event) => event.cue === 'haptic');
    const phaseDurations = [
      audioEvents[0]?.elapsedMs ?? 0,
      (audioEvents[1]?.elapsedMs ?? 0) - (audioEvents[0]?.elapsedMs ?? 0),
      finalElapsedMs - (audioEvents[1]?.elapsedMs ?? 0),
    ];

    expect(phaseDurations).toEqual([4_000, 7_000, 8_000]);
    expect(audioEvents.map((event) => event.phaseId)).toEqual([
      'hold',
      'exhale',
    ]);
    expect(hapticEvents.map((event) => event.phaseId)).toEqual([
      'hold',
      'exhale',
    ]);
    expect(audioEvents).toHaveLength(hapticEvents.length);
  });
}

const launchedByPlaywright = process.argv.some((arg) =>
  arg.toLowerCase().includes('playwright')
);

if (launchedByPlaywright) {
  const importPlaywright = new Function(
    'specifier',
    'return import(specifier)'
  ) as (specifier: string) => Promise<unknown>;
  const playwrightModule = (await importPlaywright(
    '@playwright/test'
  )) as PlaywrightModule;
  registerBreathworkTimerSpec(playwrightModule);
}
