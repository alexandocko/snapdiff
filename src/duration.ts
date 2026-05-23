import { Metric } from './metrics.types';

export interface DurationEntry {
  label: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
}

const timers: Map<string, DurationEntry> = new Map();

export function startTimer(label: string): void {
  timers.set(label, { label, startedAt: Date.now() });
}

export function stopTimer(label: string): DurationEntry {
  const entry = timers.get(label);
  if (!entry) {
    throw new Error(`No timer found for label: "${label}"`);
  }
  const endedAt = Date.now();
  const finished: DurationEntry = {
    ...entry,
    endedAt,
    durationMs: endedAt - entry.startedAt,
  };
  timers.set(label, finished);
  return finished;
}

export function getTimer(label: string): DurationEntry | undefined {
  return timers.get(label);
}

export function clearTimers(): void {
  timers.clear();
}

export function getAllTimers(): DurationEntry[] {
  return Array.from(timers.values());
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}

export function buildDurationReport(entries: DurationEntry[]): string {
  const finished = entries.filter((e) => e.durationMs !== undefined);
  if (finished.length === 0) return 'No timing data available.';
  const lines = finished.map(
    (e) => `  ${e.label}: ${formatDuration(e.durationMs!)}`
  );
  return ['Durations:', ...lines].join('\n');
}

export function durationToMetric(entry: DurationEntry): Metric {
  return {
    name: entry.label,
    value: entry.durationMs ?? 0,
    unit: 'ms',
  };
}
