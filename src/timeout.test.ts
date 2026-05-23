import { withTimeout, resolveTimeout, isTimeoutError, buildTimeoutResult } from './timeout';
import { parseTimeoutConfig, validateTimeoutConfig, getTimeoutSummary } from './timeout.config';

describe('withTimeout', () => {
  it('resolves when promise completes before timeout', async () => {
    const result = await withTimeout(Promise.resolve('ok'), 1000);
    expect(result).toBe('ok');
  });

  it('rejects with timeout error when promise exceeds limit', async () => {
    const slow = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('late')), 500)
    );
    await expect(withTimeout(slow, 50)).rejects.toMatchObject({
      timedOut: true,
      limitMs: 50,
    });
  });

  it('includes endpoint in timeout error message', async () => {
    const slow = new Promise<never>(() => {});
    await expect(withTimeout(slow, 10, '/api/v1')).rejects.toThrow('/api/v1');
  });
});

describe('resolveTimeout', () => {
  const config = parseTimeoutConfig({ requestTimeoutMs: 5000, perEndpoint: { '/slow': 20000 } });

  it('returns default timeout when no endpoint match', () => {
    expect(resolveTimeout(config)).toBe(5000);
  });

  it('returns per-endpoint timeout when matched', () => {
    expect(resolveTimeout(config, '/slow')).toBe(20000);
  });
});

describe('isTimeoutError', () => {
  it('returns true for timeout errors', () => {
    const err = Object.assign(new Error('timeout'), { timedOut: true });
    expect(isTimeoutError(err)).toBe(true);
  });

  it('returns false for regular errors', () => {
    expect(isTimeoutError(new Error('nope'))).toBe(false);
  });
});

describe('validateTimeoutConfig', () => {
  it('returns no errors for valid config', () => {
    const config = parseTimeoutConfig({ requestTimeoutMs: 10000 });
    expect(validateTimeoutConfig(config)).toHaveLength(0);
  });

  it('returns error for out-of-range timeout', () => {
    const config = parseTimeoutConfig({ requestTimeoutMs: 50 });
    expect(validateTimeoutConfig(config).length).toBeGreaterThan(0);
  });
});

describe('getTimeoutSummary', () => {
  it('includes overrides count in description', () => {
    const config = parseTimeoutConfig({ requestTimeoutMs: 8000, perEndpoint: { '/a': 1000, '/b': 2000 } });
    const summary = getTimeoutSummary(config);
    expect(summary.overrides).toBe(2);
    expect(summary.description).toContain('2 endpoint override(s)');
  });
});
