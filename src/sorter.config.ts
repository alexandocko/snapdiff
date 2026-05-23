import { SortConfig, SortField, SortOrder } from './sorter.types';

const VALID_ORDERS: SortOrder[] = ['asc', 'desc'];

export function parseSorterConfig(raw: unknown): SortConfig {
  if (!raw || typeof raw !== 'object') {
    return { fields: [] };
  }
  const obj = raw as Record<string, unknown>;
  const fields: SortField[] = [];

  if (Array.isArray(obj.fields)) {
    for (const entry of obj.fields) {
      if (typeof entry === 'string') {
        fields.push({ key: entry, order: 'asc' });
      } else if (entry && typeof entry === 'object') {
        const e = entry as Record<string, unknown>;
        const key = typeof e.key === 'string' ? e.key : undefined;
        const order: SortOrder =
          typeof e.order === 'string' && VALID_ORDERS.includes(e.order as SortOrder)
            ? (e.order as SortOrder)
            : 'asc';
        if (key) fields.push({ key, order });
      }
    }
  }

  const nullsFirst = typeof obj.nullsFirst === 'boolean' ? obj.nullsFirst : false;
  return { fields, nullsFirst };
}

export function validateSorterConfig(config: SortConfig): string[] {
  const errors: string[] = [];
  for (const field of config.fields) {
    if (!field.key || typeof field.key !== 'string') {
      errors.push(`sorter: invalid field key: ${JSON.stringify(field.key)}`);
    }
    if (!VALID_ORDERS.includes(field.order)) {
      errors.push(`sorter: invalid order '${field.order}' for field '${field.key}'`);
    }
  }
  return errors;
}

export function getSorterConfigSummary(config: SortConfig): string {
  if (!config.fields.length) return 'sorter: disabled';
  const list = config.fields.map(f => `${f.key}(${f.order})`).join(', ');
  return `sorter: ${config.fields.length} field(s) — ${list}`;
}
