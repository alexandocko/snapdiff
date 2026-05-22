export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
  warnings: SchemaValidationWarning[];
}

export interface SchemaValidationError {
  path: string;
  message: string;
  expected?: string;
  actual?: string;
}

export interface SchemaValidationWarning {
  path: string;
  message: string;
}

export interface SchemaRule {
  type?: string;
  required?: boolean;
  nullable?: boolean;
  pattern?: string;
}

export interface SchemaConfig {
  rules: Record<string, SchemaRule>;
  strict?: boolean;
  ignoreExtra?: boolean;
}
