import { DiffResult } from './types';
import { applyTransforms } from './transform';
import { redactData } from './redact';
import { applyLabels } from './labels';
import { truncateData } from './truncate';
import { normalizeData } from './normalizer';
import { TransformConfig } from './transform.types';
import { RedactConfig } from './redact.types';

export interface PipelineConfig {
  transform?: TransformConfig;
  redact?: RedactConfig;
  normalize?: boolean;
  truncateDepth?: number;
  labelRules?: Array<{ field: string; match: string; label: string }>;
}

export interface PipelineResult {
  result: DiffResult;
  appliedStages: string[];
}

export function runDiffPipeline(
  result: DiffResult,
  config: PipelineConfig
): PipelineResult {
  const appliedStages: string[] = [];
  let data = { ...result };

  if (config.normalize) {
    data.actual = normalizeData(data.actual);
    data.expected = normalizeData(data.expected);
    appliedStages.push('normalize');
  }

  if (config.transform) {
    data.actual = applyTransforms(data.actual, config.transform);
    data.expected = applyTransforms(data.expected, config.transform);
    appliedStages.push('transform');
  }

  if (config.redact) {
    data.actual = redactData(data.actual, config.redact);
    data.expected = redactData(data.expected, config.redact);
    appliedStages.push('redact');
  }

  if (config.truncateDepth !== undefined) {
    data.actual = truncateData(data.actual, { maxDepth: config.truncateDepth });
    data.expected = truncateData(data.expected, { maxDepth: config.truncateDepth });
    appliedStages.push('truncate');
  }

  if (config.labelRules && config.labelRules.length > 0) {
    data = applyLabels(data, config.labelRules) as DiffResult;
    appliedStages.push('labels');
  }

  return { result: data, appliedStages };
}

export function runPipelineOnAll(
  results: DiffResult[],
  config: PipelineConfig
): PipelineResult[] {
  return results.map((r) => runDiffPipeline(r, config));
}

export function getPipelineSummary(results: PipelineResult[]): string {
  if (results.length === 0) return 'pipeline: no results processed';
  const stages = results[0]?.appliedStages ?? [];
  return `pipeline: ${results.length} result(s) processed through [${stages.join(' -> ') || 'none'}]`;
}
