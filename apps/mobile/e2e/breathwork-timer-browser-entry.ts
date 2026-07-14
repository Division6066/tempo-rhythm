import {
  formatBreathworkSeconds,
  getBreathworkSnapshot,
} from '../features/breathwork/breathworkTimer';

declare global {
  interface Window {
    renderBreathworkSnapshot: (startedAtMs: number, nowMs: number) => void;
  }
}

window.renderBreathworkSnapshot = (startedAtMs: number, nowMs: number) => {
  const snapshot = getBreathworkSnapshot(startedAtMs, nowMs);
  const phaseLabel = document.querySelector('[data-testid="phase-label"]');
  const elapsed = document.querySelector('[data-testid="elapsed-ms"]');
  const remaining = document.querySelector('[data-testid="seconds-remaining"]');
  const cycle = document.querySelector('[data-testid="cycle-label"]');

  if (!phaseLabel || !elapsed || !remaining || !cycle) {
    throw new Error('Breathwork test harness is missing required nodes');
  }

  phaseLabel.textContent = snapshot.phase.label;
  phaseLabel.setAttribute('data-phase', snapshot.phase.key);
  phaseLabel.setAttribute('data-phase-elapsed-ms', `${snapshot.phaseElapsedMs}`);
  elapsed.textContent = `${snapshot.elapsedMs}`;
  remaining.textContent = formatBreathworkSeconds(snapshot.phaseRemainingMs);
  cycle.textContent = `Cycle ${snapshot.cycleIndex + 1}`;
};
