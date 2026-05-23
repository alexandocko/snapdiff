import { FlattenConfig, FlattenOptions } from './flatten.types';

const VALID_DELIMITERS = ['.', '/', '_', '-', '::'];
const MAX_ALLOWED_DEPTH = 64;

export function parseFlattenConfig(raw: Record<string, unknown>): FlattenConfig {
  if (!raw.flatten) {
    return { enabled: false, options: {} };
  }

  const cfg = typeof raw.flatten === 'object' && raw.flatten !== null
    ? (raw.flatten as Record<string, unknown>)
    : {};

  const options: FlattenOptions = {};

  if (typeof cfg.delimiter === 'string') {
    options.delimiter = cfg.delimiter;
  }

  if (typeof cfg.maxDepth === 'number') {
    options.maxDepth = cfg.maxDepth;
  }

  if (typeof cfg.preserveArrays === 'boolean') {
    options.preserveArrays = cfg.preserveArrays;
  }

  return { enabled: true, options };
}

export function validateFlattenConfig(config: FlattenConfig): string[] {
  const errors: string[] = [];

  if (!config.enabled) return errors;

  const { delimiter, maxDepth } = config.options;

  if (delimiter !== undefined && !VALID_DELIMITERS.includes(delimiter)) {
    errors.push(
      `flatten.delimiter "${delimiter}" is not supported; use one of: ${VALID_DELIMITERS.join(', ')}`
    );
  }

  if (maxDepth !== undefined) {
    if (!Number.isInteger(maxDepth) || maxDepth < 1) {
      errors.push('flatten.maxDepth must be a positive integer');
    } else if (maxDepth > MAX_ALLOWED_DEPTH) {
      errors.push(`flatten.maxDepth must not exceed ${MAX_ALLOWED_DEPTH}`);
    }
  }

  return errors;
}

export function getFlattenConfigSummary(config: FlattenConfig): string {
  if (!config.enabled) return 'flatten: disabled';
  const { delimiter = '.', maxDepth = 16, preserveArrays = false } = config.options;
  return `flatten: delimiter="${delimiter}" maxDepth=${maxDepth} preserveArrays=${preserveArrays}`;
}
