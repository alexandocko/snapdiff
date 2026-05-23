import { ThrottleOptions } from './throttle';

export interface RawThrottleConfig {
  rps?: unknown;
  burst?: unknown;
  enabled?: unknown;
}

export function parseThrottleConfig(raw: RawThrottleConfig): ThrottleOptions | null {
  if (raw.enabled === false) return null;

  const rps = typeof raw.rps === 'number' && raw.rps > 0 ? raw.rps : 10;
  const burst = typeof raw.burst === 'number' && raw.burst > 0 ? raw.burst : 1;

  return { requestsPerSecond: rps, burstLimit: burst };
}

export function validateThrottleConfig(raw: RawThrottleConfig): string[] {
  const errors: string[] = [];

  if (raw.rps !== undefined && (typeof raw.rps !== 'number' || (raw.rps as number) <= 0)) {
    errors.push('throttle.rps must be a positive number');
  }

  if (raw.burst !== undefined && (typeof raw.burst !== 'number' || (raw.burst as number) <= 0)) {
    errors.push('throttle.burst must be a positive number');
  }

  if (raw.enabled !== undefined && typeof raw.enabled !== 'boolean') {
    errors.push('throttle.enabled must be a boolean');
  }

  return errors;
}

export function getThrottleConfigSummary(options: ThrottleOptions | null): string {
  if (!options) return 'throttling: disabled';
  return `throttling: ${options.requestsPerSecond} req/s, burst: ${options.burstLimit ?? 1}`;
}
