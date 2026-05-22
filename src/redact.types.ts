export interface RedactConfig {
  fields?: string[];
  patterns?: string[];
  replacement?: string;
  recursive?: boolean;
}

export interface RedactResult {
  data: unknown;
  redactedCount: number;
  redactedPaths: string[];
}

export interface RedactSummary {
  enabled: boolean;
  fieldCount: number;
  patternCount: number;
  replacement: string;
}
