import { createThrottle, refillTokens, throttle, getThrottleSummary } from './throttle';
import { parseThrottleConfig, validateThrottleConfig, getThrottleConfigSummary } from './throttle.config';

jest.mock('./retry', () => ({ sleep: jest.fn().mockResolvedValue(undefined) }));

describe('createThrottle', () => {
  it('initializes state with burst tokens', () => {
    const state = createThrottle({ requestsPerSecond: 5, burstLimit: 2 });
    expect(state.tokens).toBe(2);
    expect(state.totalRequests).toBe(0);
    expect(state.totalWaited).toBe(0);
  });

  it('defaults burstLimit to 1', () => {
    const state = createThrottle({ requestsPerSecond: 5 });
    expect(state.tokens).toBe(1);
  });
});

describe('refillTokens', () => {
  it('adds tokens based on elapsed time', () => {
    const state = createThrottle({ requestsPerSecond: 10, burstLimit: 5 });
    const past = { ...state, tokens: 0, lastRefill: Date.now() - 500 };
    const refilled = refillTokens(past, 10, 5);
    expect(refilled.tokens).toBeGreaterThan(0);
    expect(refilled.tokens).toBeLessThanOrEqual(5);
  });

  it('does not exceed burst limit', () => {
    const state = createThrottle({ requestsPerSecond: 10, burstLimit: 3 });
    const old = { ...state, tokens: 0, lastRefill: Date.now() - 10000 };
    const refilled = refillTokens(old, 10, 3);
    expect(refilled.tokens).toBe(3);
  });
});

describe('throttle', () => {
  it('decrements token and increments request count', async () => {
    const state = createThrottle({ requestsPerSecond: 10, burstLimit: 2 });
    const next = await throttle(state, { requestsPerSecond: 10, burstLimit: 2 });
    expect(next.totalRequests).toBe(1);
    expect(next.tokens).toBeLessThan(state.tokens);
  });

  it('waits when tokens are exhausted', async () => {
    const { sleep } = require('./retry');
    const state = { ...createThrottle({ requestsPerSecond: 2, burstLimit: 1 }), tokens: 0 };
    await throttle(state, { requestsPerSecond: 2, burstLimit: 1 });
    expect(sleep).toHaveBeenCalled();
  });
});

describe('getThrottleSummary', () => {
  it('returns readable summary string', () => {
    const state = { tokens: 1.5, lastRefill: Date.now(), totalWaited: 200, totalRequests: 10 };
    const summary = getThrottleSummary(state);
    expect(summary).toContain('requests: 10');
    expect(summary).toContain('total wait: 200ms');
  });
});

describe('parseThrottleConfig', () => {
  it('returns null when disabled', () => {
    expect(parseThrottleConfig({ enabled: false })).toBeNull();
  });

  it('parses valid config', () => {
    const result = parseThrottleConfig({ rps: 5, burst: 3 });
    expect(result).toEqual({ requestsPerSecond: 5, burstLimit: 3 });
  });

  it('uses defaults for missing values', () => {
    const result = parseThrottleConfig({});
    expect(result?.requestsPerSecond).toBe(10);
    expect(result?.burstLimit).toBe(1);
  });
});

describe('validateThrottleConfig', () => {
  it('returns no errors for valid config', () => {
    expect(validateThrottleConfig({ rps: 5, burst: 2, enabled: true })).toHaveLength(0);
  });

  it('returns errors for invalid values', () => {
    const errors = validateThrottleConfig({ rps: -1, burst: 'x', enabled: 'yes' });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('getThrottleConfigSummary', () => {
  it('returns disabled message for null', () => {
    expect(getThrottleConfigSummary(null)).toBe('throttling: disabled');
  });

  it('returns rate info for valid options', () => {
    const summary = getThrottleConfigSummary({ requestsPerSecond: 5, burstLimit: 2 });
    expect(summary).toContain('5 req/s');
    expect(summary).toContain('burst: 2');
  });
});
