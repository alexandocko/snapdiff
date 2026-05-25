import {
  startProfile,
  endProfile,
  getProfile,
  getAllProfiles,
  clearProfiles,
  getProfilerSummary,
  formatProfilerReport,
} from './profiler';
import { parseProfilerConfig, validateProfilerConfig, getProfilerConfigSummary } from './profiler.config';

beforeEach(() => clearProfiles());

describe('startProfile / endProfile', () => {
  it('records a completed profile entry', () => {
    startProfile('fetch');
    const entry = endProfile('fetch');
    expect(entry).not.toBeNull();
    expect(entry!.label).toBe('fetch');
    expect(typeof entry!.durationMs).toBe('number');
    expect(entry!.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('returns null for unknown label', () => {
    expect(endProfile('missing')).toBeNull();
  });

  it('stores tags on entry', () => {
    startProfile('req', { env: 'staging' });
    endProfile('req');
    expect(getProfile('req')?.tags).toEqual({ env: 'staging' });
  });
});

describe('getAllProfiles', () => {
  it('returns only completed entries', () => {
    startProfile('a');
    endProfile('a');
    startProfile('b'); // not ended
    const all = getAllProfiles();
    expect(all).toHaveLength(1);
    expect(all[0].label).toBe('a');
  });
});

describe('getProfilerSummary', () => {
  it('returns zero summary when empty', () => {
    const s = getProfilerSummary();
    expect(s.totalEntries).toBe(0);
    expect(s.slowestLabel).toBeNull();
  });

  it('computes summary from entries', () => {
    startProfile('x'); endProfile('x');
    startProfile('y'); endProfile('y');
    const s = getProfilerSummary();
    expect(s.totalEntries).toBe(2);
    expect(s.slowestLabel).toBeTruthy();
  });
});

describe('formatProfilerReport', () => {
  it('returns message when no entries', () => {
    expect(formatProfilerReport()).toBe('No profile entries recorded.');
  });

  it('includes label in report', () => {
    startProfile('diff'); endProfile('diff');
    expect(formatProfilerReport()).toContain('diff');
  });
});

describe('parseProfilerConfig', () => {
  it('parses enabled flag', () => {
    expect(parseProfilerConfig({ profilerEnabled: true }).enabled).toBe(true);
  });

  it('defaults to disabled', () => {
    expect(parseProfilerConfig({}).enabled).toBe(false);
  });
});

describe('validateProfilerConfig', () => {
  it('errors on negative minDurationMs', () => {
    const errs = validateProfilerConfig({ enabled: true, minDurationMs: -1 });
    expect(errs.length).toBeGreaterThan(0);
  });

  it('passes valid config', () => {
    expect(validateProfilerConfig({ enabled: true, minDurationMs: 50 })).toHaveLength(0);
  });
});

describe('getProfilerConfigSummary', () => {
  it('returns disabled string', () => {
    expect(getProfilerConfigSummary({ enabled: false })).toBe('Profiler: disabled');
  });

  it('includes minDuration when set', () => {
    expect(getProfilerConfigSummary({ enabled: true, minDurationMs: 100 })).toContain('minDuration=100ms');
  });
});
