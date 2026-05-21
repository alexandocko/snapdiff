export type Environment = 'staging' | 'production';

export interface EndpointConfig {
  /** Relative path appended to the base URL, e.g. "/api/v1/users" */
  path: string;
  /** Optional HTTP method, defaults to GET */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Optional request headers */
  headers?: Record<string, string>;
  /** Optional request body for non-GET methods */
  body?: unknown;
}

export interface EnvironmentConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export interface AppConfig {
  staging: EnvironmentConfig;
  production: EnvironmentConfig;
  endpoints: EndpointConfig[];
  /** Directory where snapshots are stored, defaults to ".snapdiff" */
  outputDir?: string;
  /** Whether to run requests sequentially instead of in parallel */
  sequential?: boolean;
}

export interface DiffResult {
  endpoint: string;
  environment: Environment;
  statusMatch: boolean;
  bodyMatch: boolean;
  stagingHash: string;
  productionHash: string;
  differences: DiffEntry[];
}

export interface DiffEntry {
  path: string;
  stagingValue: unknown;
  productionValue: unknown;
  type: 'added' | 'removed' | 'changed';
}
