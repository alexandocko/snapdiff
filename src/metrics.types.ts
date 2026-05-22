export interface RequestMetric {
  url: string;
  statusCode: number;
  durationMs: number;
  success: boolean;
  retries: number;
  timestamp: string;
}

export interface MetricsSummary {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  averageDurationMs: number;
  maxDurationMs: number;
  minDurationMs: number;
  totalRetries: number;
  successRate: string;
}

export interface MetricsReport {
  summary: MetricsSummary;
  slowest: RequestMetric[];
  failed: RequestMetric[];
}
