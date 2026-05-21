export interface EndpointConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

export interface SnapdiffConfig {
  staging: string;
  production: string;
  endpoints: EndpointConfig[];
  snapshotDir?: string;
  timeout?: number;
}

export interface Snapshot {
  endpoint: string;
  url: string;
  timestamp: string;
  hash: string;
  data: unknown;
  statusCode: number;
}

export interface SnapshotPair {
  endpoint: string;
  staging: Snapshot | null;
  production: Snapshot | null;
}

export type DiffStatus = 'changed' | 'unchanged' | 'added' | 'removed';

export interface DiffResult {
  endpoint: string;
  status: DiffStatus;
  diff: string | null;
}

export interface FetchResult {
  url: string;
  statusCode: number;
  data: unknown;
  error?: string;
}
