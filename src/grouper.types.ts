export interface GrouperConfig {
  groupBy: string | string[];
  maxGroupSize?: number;
  includeUngrouped?: boolean;
}

export interface GroupedResult<T> {
  key: string;
  items: T[];
  count: number;
}

export interface GrouperSummary {
  totalGroups: number;
  totalItems: number;
  largestGroup: number;
  ungroupedCount: number;
}
