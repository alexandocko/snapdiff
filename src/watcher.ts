import { WatcherOptions, WatcherRun, WatcherState } from './watcher.types';

const DEFAULT_OPTIONS: WatcherOptions = {
  interval: 30_000,
  maxRuns: null,
  exitOnChange: false,
  silent: false,
};

let _state: WatcherState | null = null;

export function initWatcherState(): WatcherState {
  _state = {
    runs: [],
    startedAt: new Date().toISOString(),
    stoppedAt: null,
    totalChanges: 0,
  };
  return _state;
}

export function recordWatcherRun(run: WatcherRun): void {
  if (!_state) throw new Error('Watcher state not initialized');
  _state.runs.push(run);
  if (run.changed) _state.totalChanges++;
}

export function stopWatcher(): void {
  if (_state) _state.stoppedAt = new Date().toISOString();
}

export function getWatcherState(): WatcherState | null {
  return _state;
}

export function clearWatcherState(): void {
  _state = null;
}

export function buildWatcherRun(
  runIndex: number,
  changed: boolean,
  summary: string
): WatcherRun {
  return {
    runIndex,
    timestamp: new Date().toISOString(),
    changed,
    summary,
  };
}

export function getWatcherSummary(state: WatcherState): string {
  const elapsed = state.stoppedAt
    ? new Date(state.stoppedAt).getTime() - new Date(state.startedAt).getTime()
    : Date.now() - new Date(state.startedAt).getTime();
  const secs = Math.round(elapsed / 1000);
  return `Watcher: ${state.runs.length} run(s), ${state.totalChanges} change(s) detected in ${secs}s`;
}

export function resolveWatcherOptions(
  partial: Partial<WatcherOptions>
): WatcherOptions {
  return { ...DEFAULT_OPTIONS, ...partial };
}
