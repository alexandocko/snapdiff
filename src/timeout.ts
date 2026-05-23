import { TimeoutConfig, TimeoutResult } from './timeout.types';

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  endpoint?: string
): Promise<T> {
  const start = Date.now();
  let timer: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const elapsed = Date.now() - start;
      const err = Object.assign(
        new Error(`Request timed out after ${timeoutMs}ms${endpoint ? ` [${endpoint}]` : ''}`),
        { code: 'ETIMEDOUT', timedOut: true, elapsedMs: elapsed, limitMs: timeoutMs, endpoint }
      );
      reject(err);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export function resolveTimeout(config: TimeoutConfig, endpoint?: string): number {
  if (endpoint && config.perEndpoint?.[endpoint] !== undefined) {
    return config.perEndpoint[endpoint];
  }
  return config.requestTimeoutMs;
}

export function isTimeoutError(err: unknown): err is Error & TimeoutResult {
  return (
    err instanceof Error &&
    (err as Error & { timedOut?: boolean }).timedOut === true
  );
}

export function buildTimeoutResult(
  timedOut: boolean,
  elapsedMs: number,
  limitMs: number,
  endpoint?: string
): TimeoutResult {
  return { timedOut, elapsedMs, limitMs, endpoint };
}
