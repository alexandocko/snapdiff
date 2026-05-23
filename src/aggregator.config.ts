import { AggregatorConfig, AggregateOp } from './aggregator.types';

const VALID_OPS: AggregateOp[] = ['count', 'sum', 'avg', 'min', 'max', 'first', 'last'];

export function parseAggregatorConfig(raw: unknown): AggregatorConfig {
  if (!raw || typeof raw !== 'object') throw new Error('Aggregator config must be an object');
  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj.fields) || obj.fields.length === 0) {
    throw new Error('Aggregator config requires at least one field entry');
  }

  const fields = obj.fields.map((f: unknown, i: number) => {
    if (!f || typeof f !== 'object') throw new Error(`fields[${i}] must be an object`);
    const entry = f as Record<string, unknown>;
    if (typeof entry.field !== 'string') throw new Error(`fields[${i}].field must be a string`);
    if (!VALID_OPS.includes(entry.op as AggregateOp)) {
      throw new Error(`fields[${i}].op must be one of: ${VALID_OPS.join(', ')}`);
    }
    return { field: entry.field, op: entry.op as AggregateOp, alias: entry.alias as string | undefined };
  });

  const groupBy = Array.isArray(obj.groupBy)
    ? (obj.groupBy as unknown[]).map((g, i) => {
        if (typeof g !== 'string') throw new Error(`groupBy[${i}] must be a string`);
        return g;
      })
    : undefined;

  return { fields, groupBy, includeCount: obj.includeCount === true };
}

export function validateAggregatorConfig(config: AggregatorConfig): string[] {
  const errors: string[] = [];
  if (config.fields.length === 0) errors.push('At least one aggregate field is required');
  for (const f of config.fields) {
    if (!f.field.trim()) errors.push('Aggregate field name cannot be empty');
  }
  return errors;
}

export function getAggregatorConfigSummary(config: AggregatorConfig): string {
  const ops = config.fields.map(f => `${f.op}(${f.field})`).join(', ');
  const group = config.groupBy?.length ? ` grouped by [${config.groupBy.join(', ')}]` : '';
  return `Aggregating: ${ops}${group}`;
}
