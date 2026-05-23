import { TimeoutConfig, TimeoutSummary } from './timeout.types';

const DEFAULT_TIMEOUT_MS = 10_000;
const MIN_TIMEOUT_MS = 100;
const MAX_TIMEOUT_MS = 120_000;

export function parseTimeoutConfig(raw: Record<string, unknown>): TimeoutConfig {
  const requestTimeoutMs =
    typeof raw.requestTimeoutMs === 'number' ? raw.requestTimeoutMs : DEFAULT_TIMEOUT_MS;
  const connectTimeoutMs =
    typeof raw.connectTimeoutMs === 'number' ? raw.connectTimeoutMs : undefined;
  const perEndpoint =
    raw.perEndpoint && typeof raw.perEndpoint === 'object'
      ? (raw.perEndpoint as Record<string, number>)
      : undefined;

  return { requestTimeoutMs, connectTimeoutMs, perEndpoint };
}

export function validateTimeoutConfig(config: TimeoutConfig): string[] {
  const errors: string[] = [];

  if (config.requestTimeoutMs < MIN_TIMEOUT_MS || config.requestTimeoutMs > MAX_TIMEOUT_MS) {
    errors.push(`requestTimeoutMs must be between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS}`);
  }

  if (
    config.connectTimeoutMs !== undefined &&
    (config.connectTimeoutMs < MIN_TIMEOUT_MS || config.connectTimeoutMs > MAX_TIMEOUT_MS)
  ) {
    errors.push(`connectTimeoutMs must be between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS}`);
  }

  if (config.perEndpoint) {
    for (const [key, val] of Object.entries(config.perEndpoint)) {
      if (typeof val !== 'number' || val < MIN_TIMEOUT_MS || val > MAX_TIMEOUT_MS) {
        errors.push(`perEndpoint["${key}"] must be a number between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS}`);
      }
    }
  }

  return errors;
}

export function getTimeoutSummary(config: TimeoutConfig): TimeoutSummary {
  const overrides = config.perEndpoint ? Object.keys(config.perEndpoint).length : 0;
  const parts = [`default ${config.requestTimeoutMs}ms`];
  if (config.connectTimeoutMs) parts.push(`connect ${config.connectTimeoutMs}ms`);
  if (overrides > 0) parts.push(`${overrides} endpoint override(s)`);
  return {
    defaultMs: config.requestTimeoutMs,
    connectMs: config.connectTimeoutMs,
    overrides,
    description: parts.join(', '),
  };
}
