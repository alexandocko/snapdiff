export interface TimeoutConfig {
  requestTimeoutMs: number;
  connectTimeoutMs?: number;
  perEndpoint?: Record<string, number>;
}

export interface TimeoutResult {
  timedOut: boolean;
  elapsedMs: number;
  limitMs: number;
  endpoint?: string;
}

export interface TimeoutSummary {
  defaultMs: number;
  connectMs?: number;
  overrides: number;
  description: string;
}
