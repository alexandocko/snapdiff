export interface FlattenOptions {
  delimiter?: string;
  maxDepth?: number;
  preserveArrays?: boolean;
}

export interface FlattenResult {
  data: Record<string, unknown>;
  keyCount: number;
  maxDepth: number;
  truncatedKeys: string[];
}

export interface FlattenConfig {
  enabled: boolean;
  options: FlattenOptions;
}
