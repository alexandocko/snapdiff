import { FlattenOptions, FlattenResult } from './flatten.types';

const DEFAULT_DELIMITER = '.';
const DEFAULT_MAX_DEPTH = 16;

export function flattenObject(
  input: unknown,
  options: FlattenOptions = {}
): FlattenResult {
  const delimiter = options.delimiter ?? DEFAULT_DELIMITER;
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const preserveArrays = options.preserveArrays ?? false;

  const result: Record<string, unknown> = {};
  const truncatedKeys: string[] = [];
  let reachedDepth = 0;

  function recurse(current: unknown, prefix: string, depth: number): void {
    if (depth > reachedDepth) reachedDepth = depth;

    if (depth >= maxDepth) {
      if (prefix) truncatedKeys.push(prefix);
      result[prefix] = current;
      return;
    }

    if (Array.isArray(current) && preserveArrays) {
      result[prefix] = current;
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item, idx) => {
        const key = prefix ? `${prefix}${delimiter}${idx}` : String(idx);
        recurse(item, key, depth + 1);
      });
      return;
    }

    if (current !== null && typeof current === 'object') {
      const entries = Object.entries(current as Record<string, unknown>);
      if (entries.length === 0 && prefix) {
        result[prefix] = current;
        return;
      }
      entries.forEach(([k, v]) => {
        const key = prefix ? `${prefix}${delimiter}${k}` : k;
        recurse(v, key, depth + 1);
      });
      return;
    }

    result[prefix] = current;
  }

  recurse(input, '', 0);

  return {
    data: result,
    keyCount: Object.keys(result).length,
    maxDepth: reachedDepth,
    truncatedKeys,
  };
}

export function getFlattenSummary(result: FlattenResult): string {
  const parts = [`keys=${result.keyCount}`, `depth=${result.maxDepth}`];
  if (result.truncatedKeys.length > 0) {
    parts.push(`truncated=${result.truncatedKeys.length}`);
  }
  return `flatten(${parts.join(', ')})`;
}
