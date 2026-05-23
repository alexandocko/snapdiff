import { GrouperConfig, GroupedResult, GrouperSummary } from './grouper.types';

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function buildGroupKey(
  item: Record<string, unknown>,
  fields: string[]
): string {
  return fields
    .map((f) => {
      const val = getNestedValue(item, f);
      return val !== undefined ? String(val) : '__undefined__';
    })
    .join('|');
}

export function groupItems<T extends Record<string, unknown>>(
  items: T[],
  config: GrouperConfig
): GroupedResult<T>[] {
  const fields = Array.isArray(config.groupBy) ? config.groupBy : [config.groupBy];
  const map = new Map<string, T[]>();
  const ungrouped: T[] = [];

  for (const item of items) {
    const key = buildGroupKey(item, fields);
    if (key.includes('__undefined__') && config.includeUngrouped === false) {
      ungrouped.push(item);
      continue;
    }
    if (!map.has(key)) map.set(key, []);
    const group = map.get(key)!;
    if (!config.maxGroupSize || group.length < config.maxGroupSize) {
      group.push(item);
    }
  }

  const results: GroupedResult<T>[] = [];
  for (const [key, groupItems] of map.entries()) {
    results.push({ key, items: groupItems, count: groupItems.length });
  }

  return results;
}

export function getGrouperSummary<T>(
  groups: GroupedResult<T>[],
  ungroupedCount = 0
): GrouperSummary {
  const totalItems = groups.reduce((sum, g) => sum + g.count, 0);
  const largestGroup = groups.reduce((max, g) => Math.max(max, g.count), 0);
  return {
    totalGroups: groups.length,
    totalItems,
    largestGroup,
    ungroupedCount,
  };
}
