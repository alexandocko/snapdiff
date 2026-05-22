import {
  recordMetric,
  getMetrics,
  clearMetrics,
  buildMetricsSummary,
  buildMetricsReport,
  formatMetricsReport,
} from './metrics';
import { RequestMetric } from './metrics.types';
import { parseMetricsOptions, getMetricsSummaryLine, validateMetricsOptions } from './metrics.config';

const makeMetric = (overrides: Partial<RequestMetric> = {}): RequestMetric => ({
  url: 'https://api.example.com/users',
  statusCode: 200,
  durationMs: 150,
  success: true,
  retries: 0,
  timestamp: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => clearMetrics());

describe('recordMetric / getMetrics', () => {
  it('stores and retrieves metrics', () => {
    const m = makeMetric();
    recordMetric(m);
    expect(getMetrics()).toHaveLength(1);
    expect(getMetrics()[0]).toEqual(m);
  });

  it('returns a copy so internal state is protected', () => {
    recordMetric(makeMetric());
    getMetrics().push(makeMetric({ url: 'other' }));
    expect(getMetrics()).toHaveLength(1);
  });
});

describe('buildMetricsSummary', () => {
  it('handles empty records', () => {
    const s = buildMetricsSummary([]);
    expect(s.totalRequests).toBe(0);
    expect(s.successRate).toBe('0.00%');
  });

  it('computes correct summary', () => {
    const records = [
      makeMetric({ durationMs: 100, success: true, retries: 1 }),
      makeMetric({ durationMs: 300, success: false, retries: 2 }),
      makeMetric({ durationMs: 200, success: true, retries: 0 }),
    ];
    const s = buildMetricsSummary(records);
    expect(s.totalRequests).toBe(3);
    expect(s.successCount).toBe(2);
    expect(s.failureCount).toBe(1);
    expect(s.averageDurationMs).toBe(200);
    expect(s.maxDurationMs).toBe(300);
    expect(s.minDurationMs).toBe(100);
    expect(s.totalRetries).toBe(3);
    expect(s.successRate).toBe('66.67%');
  });
});

describe('buildMetricsReport', () => {
  it('includes slowest and failed requests', () => {
    const records = [
      makeMetric({ durationMs: 500, success: true }),
      makeMetric({ durationMs: 100, success: false, statusCode: 500 }),
    ];
    const report = buildMetricsReport(records);
    expect(report.slowest[0].durationMs).toBe(500);
    expect(report.failed).toHaveLength(1);
  });
});

describe('formatMetricsReport', () => {
  it('returns a non-empty string', () => {
    const report = buildMetricsReport([makeMetric()]);
    const text = formatMetricsReport(report);
    expect(text).toContain('Request Metrics');
    expect(text).toContain('Success');
  });
});

describe('parseMetricsOptions', () => {
  it('uses defaults when empty', () => {
    const opts = parseMetricsOptions();
    expect(opts.enabled).toBe(true);
    expect(opts.reportSlowThresholdMs).toBe(2000);
  });

  it('overrides with provided values', () => {
    const opts = parseMetricsOptions({ enabled: false, reportSlowThresholdMs: 500 });
    expect(opts.enabled).toBe(false);
    expect(opts.reportSlowThresholdMs).toBe(500);
  });

  it('ignores invalid threshold', () => {
    const opts = parseMetricsOptions({ reportSlowThresholdMs: -1 });
    expect(opts.reportSlowThresholdMs).toBe(2000);
  });
});

describe('validateMetricsOptions', () => {
  it('returns no errors for valid config', () => {
    expect(validateMetricsOptions(parseMetricsOptions())).toHaveLength(0);
  });
});

describe('getMetricsSummaryLine', () => {
  it('returns disabled string when not enabled', () => {
    const line = getMetricsSummaryLine(parseMetricsOptions({ enabled: false }));
    expect(line).toBe('Metrics: disabled');
  });

  it('includes threshold when enabled', () => {
    const line = getMetricsSummaryLine(parseMetricsOptions({ enabled: true, reportSlowThresholdMs: 1000 }));
    expect(line).toContain('slow-threshold=1000ms');
  });
});
