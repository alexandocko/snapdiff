import { NormalizerConfig, NormalizeResult, NormalizeChange } from './normalizer.types';

export function normalizeData(
  data: unknown,
  config: NormalizerConfig,
  path = ''
): NormalizeResult {
  const changes: NormalizeChange[] = [];

  function walk(value: unknown, currentPath: string): unknown {
    if (Array.isArray(value)) {
      const mapped = value.map((item, i) => walk(item, `${currentPath}[${i}]`));
      if (config.removeEmptyArrays && mapped.length === 0) {
        changes.push({ path: currentPath, type: 'remove_empty_array', before: value, after: undefined });
        return undefined;
      }
      return mapped;
    }

    if (value !== null && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (config.removeNullFields && v === null) {
          changes.push({ path: `${currentPath}.${k}`, type: 'remove_null', before: null, after: undefined });
          continue;
        }
        const newKey = config.lowercaseKeys ? k.toLowerCase() : k;
        if (newKey !== k) {
          changes.push({ path: `${currentPath}.${k}`, type: 'lowercase_key', before: k, after: newKey });
        }
        const walked = walk(v, `${currentPath}.${newKey}`);
        if (walked !== undefined) {
          result[newKey] = walked;
        }
      }
      return result;
    }

    if (typeof value === 'string') {
      if (config.trimStrings && value !== value.trim()) {
        const trimmed = value.trim();
        changes.push({ path: currentPath, type: 'trim', before: value, after: trimmed });
        return trimmed;
      }
      if (config.coerceNumbers && value !== '' && !isNaN(Number(value))) {
        const coerced = Number(value);
        changes.push({ path: currentPath, type: 'coerce_number', before: value, after: coerced });
        return coerced;
      }
    }

    return value;
  }

  const normalized = walk(data, path);
  return { data: normalized, changes };
}

export function getNormalizerSummary(config: NormalizerConfig): string {
  const flags: string[] = [];
  if (config.trimStrings) flags.push('trim-strings');
  if (config.lowercaseKeys) flags.push('lowercase-keys');
  if (config.removeNullFields) flags.push('remove-nulls');
  if (config.removeEmptyArrays) flags.push('remove-empty-arrays');
  if (config.coerceNumbers) flags.push('coerce-numbers');
  return flags.length ? `normalizer: [${flags.join(', ')}]` : 'normalizer: disabled';
}
