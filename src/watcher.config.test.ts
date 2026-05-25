import {
  parseWatcherConfig,
  validateWatcherConfig,
  getWatcherConfigSummary,
} from './watcher.config';

describe('parseWatcherConfig', () => {
  it('parses valid fields', () => {
    const result = parseWatcherConfig({
      interval: 10000,
      maxRuns: 5,
      exitOnChange: true,
      silent: false,
    });
    expect(result.interval).toBe(10000);
    expect(result.maxRuns).toBe(5);
    expect(result.exitOnChange).toBe(true);
    expect(result.silent).toBe(false);
  });

  it('parses maxRuns null', () => {
    const result = parseWatcherConfig({ maxRuns: null });
    expect(result.maxRuns).toBeNull();
  });

  it('ignores unknown fields', () => {
    const result = parseWatcherConfig({ foo: 'bar' });
    expect(result).toEqual({});
  });
});

describe('validateWatcherConfig', () => {
  it('returns no errors for valid config', () => {
    expect(validateWatcherConfig({ interval: 5000, maxRuns: 3 })).toEqual([]);
  });

  it('errors on interval below 1000', () => {
    const errs = validateWatcherConfig({ interval: 500 });
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]).toMatch(/interval/);
  });

  it('errors on maxRuns less than 1', () => {
    const errs = validateWatcherConfig({ maxRuns: 0 });
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]).toMatch(/maxRuns/);
  });

  it('allows maxRuns null', () => {
    expect(validateWatcherConfig({ maxRuns: null })).toEqual([]);
  });
});

describe('getWatcherConfigSummary', () => {
  it('returns defaults message when empty', () => {
    expect(getWatcherConfigSummary({})).toBe('Watcher config: defaults');
  });

  it('includes configured values', () => {
    const s = getWatcherConfigSummary({ interval: 2000, maxRuns: 10 });
    expect(s).toContain('interval=2000ms');
    expect(s).toContain('maxRuns=10');
  });

  it('shows unlimited for null maxRuns', () => {
    const s = getWatcherConfigSummary({ maxRuns: null });
    expect(s).toContain('unlimited');
  });
});
