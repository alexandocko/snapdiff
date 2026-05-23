import {
  startTimer,
  stopTimer,
  getTimer,
  clearTimers,
  getAllTimers,
  formatDuration,
  buildDurationReport,
  durationToMetric,
} from './duration';

beforeEach(() => {
  clearTimers();
});

describe('startTimer / stopTimer', () => {
  it('records a duration entry after stopping', () => {
    startTimer('fetch');
    const entry = stopTimer('fetch');
    expect(entry.label).toBe('fetch');
    expect(typeof entry.durationMs).toBe('number');
    expect(entry.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('throws when stopping a timer that was never started', () => {
    expect(() => stopTimer('ghost')).toThrow('No timer found for label: "ghost"');
  });

  it('persists entry after stopping', () => {
    startTimer('diff');
    stopTimer('diff');
    const entry = getTimer('diff');
    expect(entry?.durationMs).toBeDefined();
  });
});

describe('getTimer', () => {
  it('returns undefined for unknown label', () => {
    expect(getTimer('unknown')).toBeUndefined();
  });

  it('returns running entry before stop', () => {
    startTimer('run');
    const entry = getTimer('run');
    expect(entry?.endedAt).toBeUndefined();
  });
});

describe('getAllTimers', () => {
  it('returns all registered timers', () => {
    startTimer('a');
    startTimer('b');
    expect(getAllTimers()).toHaveLength(2);
  });
});

describe('formatDuration', () => {
  it('formats milliseconds under 1000 as ms', () => {
    expect(formatDuration(250)).toBe('250ms');
  });

  it('formats milliseconds >= 1000 as seconds', () => {
    expect(formatDuration(1500)).toBe('1.50s');
  });
});

describe('buildDurationReport', () => {
  it('returns fallback when no finished timers', () => {
    expect(buildDurationReport([])).toBe('No timing data available.');
  });

  it('includes label and formatted duration', () => {
    const entries = [{ label: 'fetch', startedAt: 0, endedAt: 300, durationMs: 300 }];
    const report = buildDurationReport(entries);
    expect(report).toContain('fetch');
    expect(report).toContain('300ms');
  });
});

describe('durationToMetric', () => {
  it('converts a duration entry to a metric', () => {
    const metric = durationToMetric({ label: 'schema', startedAt: 0, endedAt: 50, durationMs: 50 });
    expect(metric).toEqual({ name: 'schema', value: 50, unit: 'ms' });
  });

  it('uses 0 for missing durationMs', () => {
    const metric = durationToMetric({ label: 'x', startedAt: 0 });
    expect(metric.value).toBe(0);
  });
});
