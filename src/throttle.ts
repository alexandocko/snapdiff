import { sleep } from './retry';

export interface ThrottleOptions {
  requestsPerSecond: number;
  burstLimit?: number;
}

export interface ThrottleState {
  tokens: number;
  lastRefill: number;
  totalWaited: number;
  totalRequests: number;
}

const DEFAULT_RPS = 10;
const DEFAULT_BURST = 1;

export function createThrottle(options: ThrottleOptions): ThrottleState {
  return {
    tokens: options.burstLimit ?? DEFAULT_BURST,
    lastRefill: Date.now(),
    totalWaited: 0,
    totalRequests: 0,
  };
}

export function refillTokens(state: ThrottleState, rps: number, burst: number): ThrottleState {
  const now = Date.now();
  const elapsed = (now - state.lastRefill) / 1000;
  const newTokens = Math.min(burst, state.tokens + elapsed * rps);
  return { ...state, tokens: newTokens, lastRefill: now };
}

export async function throttle(
  state: ThrottleState,
  options: ThrottleOptions
): Promise<ThrottleState> {
  const rps = options.requestsPerSecond ?? DEFAULT_RPS;
  const burst = options.burstLimit ?? DEFAULT_BURST;

  let current = refillTokens(state, rps, burst);

  if (current.tokens < 1) {
    const waitMs = Math.ceil(((1 - current.tokens) / rps) * 1000);
    await sleep(waitMs);
    current = refillTokens(current, rps, burst);
    current = { ...current, totalWaited: current.totalWaited + waitMs };
  }

  return {
    ...current,
    tokens: current.tokens - 1,
    totalRequests: current.totalRequests + 1,
  };
}

export function getThrottleSummary(state: ThrottleState): string {
  return [
    `requests: ${state.totalRequests}`,
    `total wait: ${state.totalWaited}ms`,
    `available tokens: ${state.tokens.toFixed(2)}`,
  ].join(', ');
}
