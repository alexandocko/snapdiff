import { RedactConfig, RedactResult } from './redact.types';

const DEFAULT_REPLACEMENT = '[REDACTED]';

export function redactData(
  data: unknown,
  config: RedactConfig
): RedactResult {
  const replacement = config.replacement ?? DEFAULT_REPLACEMENT;
  const redactedPaths: string[] = [];

  const result = redactValue(data, config, replacement, '', redactedPaths);

  return {
    data: result,
    redactedCount: redactedPaths.length,
    redactedPaths,
  };
}

function redactValue(
  value: unknown,
  config: RedactConfig,
  replacement: string,
  path: string,
  redactedPaths: string[]
): unknown {
  if (Array.isArray(value)) {
    return value.map((item, i) =>
      redactValue(item, config, replacement, `${path}[${i}]`, redactedPaths)
    );
  }

  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(obj)) {
      const fieldPath = path ? `${path}.${key}` : key;

      if (shouldRedactField(key, fieldPath, config)) {
        result[key] = replacement;
        redactedPaths.push(fieldPath);
      } else if (config.recursive !== false) {
        result[key] = redactValue(val, config, replacement, fieldPath, redactedPaths);
      } else {
        result[key] = val;
      }
    }

    return result;
  }

  if (typeof value === 'string' && config.patterns?.length) {
    return redactPatterns(value, config.patterns, replacement, path, redactedPaths);
  }

  return value;
}

function shouldRedactField(key: string, path: string, config: RedactConfig): boolean {
  if (config.fields?.includes(key)) return true;
  if (config.fields?.includes(path)) return true;
  return false;
}

function redactPatterns(
  value: string,
  patterns: string[],
  replacement: string,
  path: string,
  redactedPaths: string[]
): string {
  let result = value;
  let changed = false;

  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'g');
    if (regex.test(result)) {
      result = result.replace(new RegExp(pattern, 'g'), replacement);
      changed = true;
    }
  }

  if (changed) redactedPaths.push(path);
  return result;
}
