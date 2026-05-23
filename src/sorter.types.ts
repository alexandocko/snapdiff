export type SortOrder = 'asc' | 'desc';

export type SortField = {
  key: string;
  order: SortOrder;
};

export type SortConfig = {
  fields: SortField[];
  nullsFirst?: boolean;
};

export type SortResult<T> = {
  sorted: T[];
  appliedFields: string[];
  skippedFields: string[];
};
