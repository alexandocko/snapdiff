import type { SchemaConfig } from "./schema.types";

export function parseSchemaConfig(raw: unknown): SchemaConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Schema config must be an object");
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.rules !== "object" || obj.rules === null) {
    throw new Error("Schema config must have a 'rules' object");
  }

  const rules = obj.rules as Record<string, unknown>;
  const validTypes = new Set(["string", "number", "boolean", "object", "array"]);

  for (const [field, rule] of Object.entries(rules)) {
    if (typeof rule !== "object" || rule === null) {
      throw new Error(`Rule for field "${field}" must be an object`);
    }
    const r = rule as Record<string, unknown>;
    if (r.type !== undefined && !validTypes.has(r.type as string)) {
      throw new Error(
        `Invalid type "${r.type}" for field "${field}". Must be one of: ${[...validTypes].join(", ")}`
      );
    }
  }

  return {
    rules: rules as SchemaConfig["rules"],
    strict: Boolean(obj.strict ?? false),
    ignoreExtra: Boolean(obj.ignoreExtra ?? false),
  };
}

export function getSchemaConfigSummary(config: SchemaConfig): string {
  const fieldCount = Object.keys(config.rules).length;
  const required = Object.values(config.rules).filter((r) => r.required).length;
  const flags = [config.strict && "strict", config.ignoreExtra && "ignoreExtra"]
    .filter(Boolean)
    .join(", ");
  return `Schema: ${fieldCount} field(s), ${required} required${flags ? ` [${flags}]` : ""}`;
}
