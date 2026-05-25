import { ProfileEntry, ProfilerOptions, ProfilerSummary } from './profiler.types';

const store = new Map<string, ProfileEntry>();

export function startProfile(label: string, tags?: Record<string, string>): void {
  store.set(label, { label, startedAt: Date.now(), tags });
}

export function endProfile(label: string): ProfileEntry | null {
  const entry = store.get(label);
  if (!entry) return null;
  const endedAt = Date.now();
  const updated: ProfileEntry = {
    ...entry,
    endedAt,
    durationMs: endedAt - entry.startedAt,
  };
  store.set(label, updated);
  return updated;
}

export function getProfile(label: string): ProfileEntry | undefined {
  return store.get(label);
}

export function getAllProfiles(): ProfileEntry[] {
  return Array.from(store.values()).filter((e) => e.durationMs !== undefined);
}

export function clearProfiles(): void {
  store.clear();
}

export function getProfilerSummary(options?: Pick<ProfilerOptions, 'minDurationMs'>): ProfilerSummary {
  const minMs = options?.minDurationMs ?? 0;
  const entries = getAllProfiles().filter((e) => (e.durationMs ?? 0) >= minMs);

  if (entries.length === 0) {
    return { totalEntries: 0, totalDurationMs: 0, slowestLabel: null, fastestLabel: null, averageDurationMs: 0 };
  }

  const totalDurationMs = entries.reduce((sum, e) => sum + (e.durationMs ?? 0), 0);
  const sorted = [...entries].sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0));

  return {
    totalEntries: entries.length,
    totalDurationMs,
    slowestLabel: sorted[0].label,
    fastestLabel: sorted[sorted.length - 1].label,
    averageDurationMs: Math.round(totalDurationMs / entries.length),
  };
}

export function formatProfilerReport(options?: Pick<ProfilerOptions, 'minDurationMs'>): string {
  const entries = getAllProfiles().filter((e) => (e.durationMs ?? 0) >= (options?.minDurationMs ?? 0));
  if (entries.length === 0) return 'No profile entries recorded.';
  const lines = entries
    .sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0))
    .map((e) => `  ${e.label}: ${e.durationMs}ms`);
  return ['Profiler Report:', ...lines].join('\n');
}
