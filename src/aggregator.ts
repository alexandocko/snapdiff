import { AggregatorConfig, AggregateResult, AggregateOp } from './aggregator.types';

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function applyOp(op: AggregateOp, values: number[]): number | unknown {
  if (values.length === 0) return null;
  switch (op) {
    case 'count': return values.length;
    case 'sum': return values.reduce((a, b) => a + b, 0);
    case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
    case 'min': return Math.min(...values);
    case 'max': return Math.max(...values);
    case 'first': return values[0];
    case 'last': return values[values.length - 1];
  }
}

export function aggregateData<T>(items: T[], config: AggregatorConfig): AggregateResult[] {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const groupKey = config.groupBy
      ? config.groupBy.map(f => String(getNestedValue(item, f) ?? '')).join('|')
      : '__all__';
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey)!.push(item);
  }

  const results: AggregateResult[] = [];

  for (const [, groupItems] of groups) {
    const group: Record<string, unknown> = {};
    if (config.groupBy) {
      for (const f of config.groupBy) {
        group[f] = getNestedValue(groupItems[0], f);
      }
    }

    const values: Record<string, number | unknown> = {};
    for (const agg of config.fields) {
      const raw = groupItems.map(i => getNestedValue(i, agg.field)).filter(v => typeof v === 'number') as number[];
      const key = agg.alias ?? `${agg.op}_${agg.field}`;
      values[key] = applyOp(agg.op, raw);
    }

    results.push({ group, values, count: groupItems.length });
  }

  return results;
}

export function getAggregatorSummary(results: AggregateResult[]): string {
  return `Aggregated into ${results.length} group(s) with ${Object.keys(results[0]?.values ?? {}).length} computed field(s).`;
}
