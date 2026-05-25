export interface ProfileEntry {
  label: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  tags?: Record<string, string>;
}

export interface ProfilerOptions {
  enabled: boolean;
  minDurationMs?: number;
  tags?: Record<string, string>;
}

export interface ProfilerSummary {
  totalEntries: number;
  totalDurationMs: number;
  slowestLabel: string | null;
  fastestLabel: string | null;
  averageDurationMs: number;
}
