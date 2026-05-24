import { PipelineConfig } from './differ.pipeline';

export interface RawPipelineOptions {
  normalize?: boolean;
  truncateDepth?: number | string;
  redactFields?: string[];
  maskFields?: string[];
  stripFields?: string[];
  labelRules?: Array<{ field: string; match: string; label: string }>;
}

export function parsePipelineConfig(options: RawPipelineOptions): PipelineConfig {
  const config: PipelineConfig = {};

  if (options.normalize !== undefined) {
    config.normalize = Boolean(options.normalize);
  }

  const depth = options.truncateDepth !== undefined
    ? Number(options.truncateDepth)
    : undefined;
  if (depth !== undefined && !isNaN(depth)) {
    config.truncateDepth = depth;
  }

  const hasTransform =
    (options.stripFields && options.stripFields.length > 0) ||
    (options.maskFields && options.maskFields.length > 0);

  if (hasTransform) {
    config.transform = {
      strip: options.stripFields ?? [],
      mask: options.maskFields ?? [],
    };
  }

  if (options.redactFields && options.redactFields.length > 0) {
    config.redact = { fields: options.redactFields };
  }

  if (options.labelRules && options.labelRules.length > 0) {
    config.labelRules = options.labelRules;
  }

  return config;
}

export function validatePipelineConfig(config: PipelineConfig): string[] {
  const errors: string[] = [];

  if (
    config.truncateDepth !== undefined &&
    (config.truncateDepth < 1 || !Number.isInteger(config.truncateDepth))
  ) {
    errors.push('truncateDepth must be a positive integer');
  }

  return errors;
}

export function getPipelineConfigSummary(config: PipelineConfig): string {
  const parts: string[] = [];
  if (config.normalize) parts.push('normalize');
  if (config.transform) parts.push('transform');
  if (config.redact) parts.push('redact');
  if (config.truncateDepth !== undefined) parts.push(`truncate(depth=${config.truncateDepth})`);
  if (config.labelRules?.length) parts.push(`labels(${config.labelRules.length})`);
  return parts.length > 0 ? `pipeline stages: ${parts.join(', ')}` : 'pipeline: no stages configured';
}
