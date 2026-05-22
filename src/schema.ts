import type {
  SchemaConfig,
  SchemaRule,
  SchemaValidationError,
  SchemaValidationResult,
  SchemaValidationWarning,
} from "./schema.types";

export function validateSchema(
  data: unknown,
  config: SchemaConfig
): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];
  const warnings: SchemaValidationWarning[] = [];

  if (typeof data !== "object" || data === null) {
    errors.push({ path: "$", message: "Expected an object at root" });
    return { valid: false, errors, warnings };
  }

  const obj = data as Record<string, unknown>;

  for (const [field, rule] of Object.entries(config.rules)) {
    const value = obj[field];
    validateField(field, value, rule, errors, warnings);
  }

  if (config.strict && !config.ignoreExtra) {
    const knownKeys = new Set(Object.keys(config.rules));
    for (const key of Object.keys(obj)) {
      if (!knownKeys.has(key)) {
        warnings.push({ path: key, message: `Unexpected field "${key}"` });
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function validateField(
  path: string,
  value: unknown,
  rule: SchemaRule,
  errors: SchemaValidationError[],
  warnings: SchemaValidationWarning[]
): void {
  if (rule.required && (value === undefined || value === null)) {
    if (!rule.nullable || value === undefined) {
      errors.push({ path, message: `Field "${path}" is required` });
      return;
    }
  }

  if (value === undefined || value === null) return;

  if (rule.type) {
    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== rule.type) {
      errors.push({
        path,
        message: `Type mismatch for "${path}"`,
        expected: rule.type,
        actual,
      });
    }
  }

  if (rule.pattern && typeof value === "string") {
    const re = new RegExp(rule.pattern);
    if (!re.test(value)) {
      errors.push({
        path,
        message: `Field "${path}" does not match pattern ${rule.pattern}`,
      });
    }
  }
}

export function getValidationSummary(result: SchemaValidationResult): string {
  if (result.valid && result.warnings.length === 0) {
    return "Schema validation passed";
  }
  const parts: string[] = [];
  if (!result.valid) parts.push(`${result.errors.length} error(s)`);
  if (result.warnings.length > 0) parts.push(`${result.warnings.length} warning(s)`);
  return `Schema validation: ${parts.join(", ")}`;
}
