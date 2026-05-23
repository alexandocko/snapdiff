export interface TruncateConfig {
  maxDepth?: number;
  maxArrayLength?: number;
  maxStringLength?: number;
  placeholder?: string;
}

export interface TruncateResult {
  truncated: boolean;
  arraysTruncated: number;
  stringsTruncated: number;
  depthTruncated: number;
}

export const DEFAULT_TRUNCATE_CONFIG: Required<TruncateConfig> = {
  maxDepth: 10,
  maxArrayLength: 100,
  maxStringLength: 512,
  placeholder: "[truncated]",
};
