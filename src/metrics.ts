import { RequestMetric, MetricsSummary, MetricsReport } from './metrics.types';

const metrics: RequestMetric[] = [];

export function recordMetric(metric: RequestMetric): void {
  metrics.push(metric);
}

export function getMetrics(): RequestMetric[] {
  return [...metrics];
}

export function clearMetrics(): void {
  metrics.length = 0;
}

export function buildMetricsSummary(records: RequestMetric[]): MetricsSummary {
  if (records.length === 0) {
    return {
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      averageDurationMs: 0,
      maxDurationMs: 0,
      minDurationMs: 0,
      totalRetries: 0,
      successRate: '0.00%',
    };
  }

  const successCount = records.filter((r) => r.success).length;
  const failureCount = records.length - successCount;
  const durations = records.map((r) => r.durationMs);
  const totalRetries = records.reduce((sum, r) => sum + r.retries, 0);
  const averageDurationMs = Math.round(
    durations.reduce((a, b) => a + b, 0) / durations.length
  );
  const successRate = ((successCount / records.length) * 100).toFixed(2) + '%';

  return {
    totalRequests: records.length,
    successCount,
    failureCount,
    averageDurationMs,
    maxDurationMs: Math.max(...durations),
    minDurationMs: Math.min(...durations),
    totalRetries,
    successRate,
  };
}

export function buildMetricsReport(records: RequestMetric[]): MetricsReport {
  const summary = buildMetricsSummary(records);
  const slowest = [...records]
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 5);
  const failed = records.filter((r) => !r.success);

  return { summary, slowest, failed };
}

export function formatMetricsReport(report: MetricsReport): string {
  const { summary } = report;
  const lines: string[] = [
    '=== Request Metrics ===',
    `Total Requests : ${summary.totalRequests}`,
    `Success        : ${summary.successCount} (${summary.successRate})`,
    `Failures       : ${summary.failureCount}`,
    `Avg Duration   : ${summary.averageDurationMs}ms`,
    `Max Duration   : ${summary.maxDurationMs}ms`,
    `Min Duration   : ${summary.minDurationMs}ms`,
    `Total Retries  : ${summary.totalRetries}`,
  ];

  if (report.slowest.length > 0) {
    lines.push('\nSlowest Requests:');
    report.slowest.forEach((r) => {
      lines.push(`  [${r.durationMs}ms] ${r.url}`);
    });
  }

  if (report.failed.length > 0) {
    lines.push('\nFailed Requests:');
    report.failed.forEach((r) => {
      lines.push(`  [${r.statusCode}] ${r.url}`);
    });
  }

  return lines.join('\n');
}
