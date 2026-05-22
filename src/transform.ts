import { SnapshotData } from './types';

export type TransformFn = (data: unknown) => unknown;

export interface TransformConfig {
  stripFields?: string[];
  maskFields?: string[];
  sortArrays?: boolean;
  maskValue?: string;
}

export function applyTransforms(
  snapshot: SnapshotData,
  config: TransformConfig
): SnapshotData {
  let data = structuredClone(snapshot.data);

  if (config.stripFields?.length) {
    data = stripFields(data, config.stripFields);
  }

  if (config.maskFields?.length) {
    data = maskFields(data, config.maskFields, config.maskValue ?? '***');
  }

  if (config.sortArrays) {
    data = sortArraysDeep(data);
  }

  return { ...snapshot, data };
}

export function stripFields(data: unknown, fields: string[]): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => stripFields(item, fields));
  }
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>)
        .filter(([key]) => !fields.includes(key))
        .map(([key, val]) => [key, stripFields(val, fields)])
    );
  }
  return data;
}

export function maskFields(
  data: unknown,
  fields: string[],
  maskValue: string
): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => maskFields(item, fields, maskValue));
  }
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, val]) => [
        key,
        fields.includes(key) ? maskValue : maskFields(val, fields, maskValue),
      ])
    );
  }
  return data;
}

export function sortArraysDeep(data: unknown): unknown {
  if (Array.isArray(data)) {
    const sorted = data.map(sortArraysDeep);
    try {
      return sorted.sort((a, b) =>
        JSON.stringify(a).localeCompare(JSON.stringify(b))
      );
    } catch {
      return sorted;
    }
  }
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([k, v]) => [
        k,
        sortArraysDeep(v),
      ])
    );
  }
  return data;
}
