export type AggregateOp = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'first' | 'last';

export interface AggregateField {
  field: string;
  op: AggregateOp;
  alias?: string;
}

export interface AggregatorConfig {
  groupBy?: string[];
  fields: AggregateField[];
  includeCount?: boolean;
}

export interface AggregateResult {
  group: Record<string, unknown>;
  values: Record<string, number | unknown>;
  count: number;
}
