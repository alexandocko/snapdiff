import { describe, it, expect } from "vitest";
import { validateSchema, getValidationSummary } from "./schema";
import { parseSchemaConfig, getSchemaConfigSummary } from "./schema.config";
import type { SchemaConfig } from "./schema.types";

const baseConfig: SchemaConfig = {
  rules: {
    id: { type: "number", required: true },
    name: { type: "string", required: true },
    email: { type: "string", pattern: "^[^@]+@[^@]+$" },
    active: { type: "boolean" },
  },
  strict: false,
};

describe("validateSchema", () => {
  it("returns valid for a conforming object", () => {
    const result = validateSchema(
      { id: 1, name: "Alice", email: "alice@example.com", active: true },
      baseConfig
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("reports missing required field", () => {
    const result = validateSchema({ id: 1 }, baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "name")).toBe(true);
  });

  it("reports type mismatch", () => {
    const result = validateSchema({ id: "not-a-number", name: "Bob" }, baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "id" && e.expected === "number")).toBe(true);
  });

  it("reports pattern mismatch", () => {
    const result = validateSchema({ id: 1, name: "Bob", email: "not-an-email" }, baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "email")).toBe(true);
  });

  it("warns about extra fields in strict mode", () => {
    const result = validateSchema(
      { id: 1, name: "Alice", extra: "field" },
      { ...baseConfig, strict: true }
    );
    expect(result.warnings.some((w) => w.path === "extra")).toBe(true);
  });

  it("returns error when root is not an object", () => {
    const result = validateSchema("not-an-object", baseConfig);
    expect(result.valid).toBe(false);
  });
});

describe("getValidationSummary", () => {
  it("returns passed message for clean result", () => {
    const summary = getValidationSummary({ valid: true, errors: [], warnings: [] });
    expect(summary).toContain("passed");
  });

  it("includes error and warning counts", () => {
    const summary = getValidationSummary({
      valid: false,
      errors: [{ path: "id", message: "required" }],
      warnings: [{ path: "extra", message: "unexpected" }],
    });
    expect(summary).toContain("1 error");
    expect(summary).toContain("1 warning");
  });
});

describe("parseSchemaConfig", () => {
  it("parses a valid config object", () => {
    const config = parseSchemaConfig({
      rules: { id: { type: "number", required: true } },
      strict: true,
    });
    expect(config.rules.id.required).toBe(true);
    expect(config.strict).toBe(true);
  });

  it("throws on invalid type value", () => {
    expect(() =>
      parseSchemaConfig({ rules: { id: { type: "uuid" } } })
    ).toThrow(/Invalid type/);
  });

  it("throws when rules is missing", () => {
    expect(() => parseSchemaConfig({ strict: true })).toThrow(/rules/);
  });
});

describe("getSchemaConfigSummary", () => {
  it("returns a readable summary", () => {
    const summary = getSchemaConfigSummary(baseConfig);
    expect(summary).toContain("4 field");
    expect(summary).toContain("2 required");
  });
});
