export interface NormalizerConfig {
  trimStrings?: boolean;
  lowercaseKeys?: boolean;
  removeNullFields?: boolean;
  removeEmptyArrays?: boolean;
  coerceNumbers?: boolean;
}

export interface NormalizeResult {
  data: unknown;
  changes: NormalizeChange[];
}

export interface NormalizeChange {
  path: string;
  type: 'trim' | 'lowercase_key' | 'remove_null' | 'remove_empty_array' | 'coerce_number';
  before: unknown;
  after: unknown;
}
