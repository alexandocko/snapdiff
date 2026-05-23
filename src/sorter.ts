import { SortConfig, SortField, SortResult } from './sorter.types';

function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function compareValues(
  a: unknown,
  b: unknown,
  order: 'asc' | 'desc',
  nullsFirst: boolean
): number {
  if (a === null || a === undefined) return nullsFirst ? -1 : 1;
  if (b === null || b === undefined) return nullsFirst ? 1 : -1;
  let cmp = 0;
  if (typeof a === 'string' && typeof b === 'string') {
    cmp = a.localeCompare(b);
  } else if (typeof a === 'number' && typeof b === 'number') {
    cmp = a - b;
  } else {
    cmp = String(a).localeCompare(String(b));
  }
  return order === 'desc' ? -cmp : cmp;
}

export function sortResults<T extends Record<string, unknown>>(
  items: T[],
  config: SortConfig
): SortResult<T> {
  if (!items.length || !config.fields.length) {
    return { sorted: [...items], appliedFields: [], skippedFields: [] };
  }

  const sample = items[0];
  const appliedFields: string[] = [];
  const skippedFields: string[] = [];

  for (const field of config.fields) {
    const val = getNestedValue(sample, field.key);
    if (val === undefined && items.every(i => getNestedValue(i, field.key) === undefined)) {
      skippedFields.push(field.key);
    } else {
      appliedFields.push(field.key);
    }
  }

  const activeFields = config.fields.filter(f => appliedFields.includes(f.key));
  const nullsFirst = config.nullsFirst ?? false;

  const sorted = [...items].sort((a, b) => {
    for (const field of activeFields) {
      const av = getNestedValue(a, field.key);
      const bv = getNestedValue(b, field.key);
      const cmp = compareValues(av, bv, field.order, nullsFirst);
      if (cmp !== 0) return cmp;
    }
    return 0;
  });

  return { sorted, appliedFields, skippedFields };
}

export function getSorterSummary(config: SortConfig): string {
  if (!config.fields.length) return 'sorter: no sort fields configured';
  const parts = config.fields.map(f => `${f.key}:${f.order}`);
  return `sorter: sorting by [${parts.join(', ')}]${config.nullsFirst ? ' (nulls first)' : ''}`;
}
