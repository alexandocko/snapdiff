export interface WatcherOptions {
  interval: number; // ms between polls
  maxRuns: number | null;
  exitOnChange: boolean;
  silent: boolean;
}

export interface WatcherRun {
  runIndex: number;
  timestamp: string;
  changed: boolean;
  summary: string;
}

export interface WatcherState {
  runs: WatcherRun[];
  startedAt: string;
  stoppedAt: string | null;
  totalChanges: number;
}
