import {
  initWatcherState,
  recordWatcherRun,
  stopWatcher,
  getWatcherState,
  clearWatcherState,
  buildWatcherRun,
  getWatcherSummary,
  resolveWatcherOptions,
} from './watcher';

beforeEach(() => {
  clearWatcherState();
});

describe('initWatcherState', () => {
  it('creates fresh state', () => {
    const s = initWatcherState();
    expect(s.runs).toEqual([]);
    expect(s.totalChanges).toBe(0);
    expect(s.stoppedAt).toBeNull();
  });
});

describe('recordWatcherRun', () => {
  it('appends run and counts changes', () => {
    initWatcherState();
    recordWatcherRun(buildWatcherRun(0, true, 'diff found'));
    recordWatcherRun(buildWatcherRun(1, false, 'no diff'));
    const s = getWatcherState()!;
    expect(s.runs).toHaveLength(2);
    expect(s.totalChanges).toBe(1);
  });

  it('throws when state not initialized', () => {
    expect(() =>
      recordWatcherRun(buildWatcherRun(0, false, 'x'))
    ).toThrow('Watcher state not initialized');
  });
});

describe('stopWatcher', () => {
  it('sets stoppedAt', () => {
    initWatcherState();
    stopWatcher();
    expect(getWatcherState()!.stoppedAt).not.toBeNull();
  });
});

describe('getWatcherSummary', () => {
  it('returns summary string', () => {
    const s = initWatcherState();
    recordWatcherRun(buildWatcherRun(0, true, 'changed'));
    stopWatcher();
    const summary = getWatcherSummary(getWatcherState()!);
    expect(summary).toContain('1 run(s)');
    expect(summary).toContain('1 change(s)');
  });
});

describe('resolveWatcherOptions', () => {
  it('merges with defaults', () => {
    const opts = resolveWatcherOptions({ interval: 5000, silent: true });
    expect(opts.interval).toBe(5000);
    expect(opts.silent).toBe(true);
    expect(opts.maxRuns).toBeNull();
    expect(opts.exitOnChange).toBe(false);
  });
});
