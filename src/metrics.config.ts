export interface MetricsOptions {
  enabled: boolean;
  reportSlowThresholdMs: number;
  includeInOutput: boolean;
}

const DEFAULTS: MetricsOptions = {
  enabled: true,
  reportSlowThresholdMs: 2000,
  includeInOutput: false,
};

export function parseMetricsOptions(
  raw: Partial<MetricsOptions> = {}
): MetricsOptions {
  return {
    enabled: raw.enabled ?? DEFAULTS.enabled,
    reportSlowThresholdMs:
      typeof raw.reportSlowThresholdMs === 'number' && raw.reportSlowThresholdMs > 0
        ? raw.reportSlowThresholdMs
        : DEFAULTS.reportSlowThresholdMs,
    includeInOutput: raw.includeInOutput ?? DEFAULTS.includeInOutput,
  };
}

export function getMetricsSummaryLine(options: MetricsOptions): string {
  if (!options.enabled) return 'Metrics: disabled';
  return [
    'Metrics: enabled',
    `slow-threshold=${options.reportSlowThresholdMs}ms`,
    `include-in-output=${options.includeInOutput}`,
  ].join(', ');
}

export function validateMetricsOptions(
  options: MetricsOptions
): string[] {
  const errors: string[] = [];
  if (options.reportSlowThresholdMs <= 0) {
    errors.push('reportSlowThresholdMs must be a positive number');
  }
  return errors;
}
