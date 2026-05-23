import { truncateData, getTruncateResult, buildTruncateSummary } from "./truncate";
import { parseTruncateConfig, validateTruncateConfig, getTruncateConfigSummary } from "./truncate.config";

describe("truncateData", () => {
  it("returns primitives unchanged when within limits", () => {
    expect(truncateData(42)).toBe(42);
    expect(truncateData(true)).toBe(true);
    expect(truncateData(null)).toBe(null);
  });

  it("truncates long strings", () => {
    const long = "a".repeat(600);
    const result = truncateData(long, { maxStringLength: 10 }) as string;
    expect(result.startsWith("a".repeat(10))).toBe(true);
    expect(result).toContain("[truncated]");
    expect(getTruncateResult().stringsTruncated).toBe(1);
  });

  it("truncates long arrays", () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    const result = truncateData(arr, { maxArrayLength: 5 }) as unknown[];
    expect(result.length).toBe(6); // 5 items + placeholder
    expect(result[5]).toBe("[truncated]");
    expect(getTruncateResult().arraysTruncated).toBe(1);
  });

  it("truncates deeply nested objects", () => {
    const deep = { a: { b: { c: { d: { e: "value" } } } } };
    const result = truncateData(deep, { maxDepth: 2 }) as Record<string, unknown>;
    expect(getTruncateResult().depthTruncated).toBeGreaterThan(0);
    expect(getTruncateResult().truncated).toBe(true);
  });

  it("returns no truncation for small data", () => {
    truncateData({ a: 1, b: [1, 2] });
    expect(getTruncateResult().truncated).toBe(false);
  });
});

describe("buildTruncateSummary", () => {
  it("returns no truncation message when not truncated", () => {
    expect(buildTruncateSummary({ truncated: false, arraysTruncated: 0, stringsTruncated: 0, depthTruncated: 0 }))
      .toBe("No truncation applied");
  });

  it("lists all truncation types", () => {
    const summary = buildTruncateSummary({ truncated: true, arraysTruncated: 2, stringsTruncated: 3, depthTruncated: 1 });
    expect(summary).toContain("2 array(s)");
    expect(summary).toContain("3 string(s)");
    expect(summary).toContain("1 value(s) exceeded max depth");
  });
});

describe("parseTruncateConfig", () => {
  it("parses numeric fields", () => {
    const cfg = parseTruncateConfig({ maxDepth: "5", maxArrayLength: "50", maxStringLength: "256" });
    expect(cfg.maxDepth).toBe(5);
    expect(cfg.maxArrayLength).toBe(50);
    expect(cfg.maxStringLength).toBe(256);
  });

  it("parses placeholder", () => {
    const cfg = parseTruncateConfig({ placeholder: "..." });
    expect(cfg.placeholder).toBe("...");
  });
});

describe("validateTruncateConfig", () => {
  it("returns errors for invalid values", () => {
    const errors = validateTruncateConfig({ maxDepth: 0, maxArrayLength: -1, placeholder: "" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns no errors for valid config", () => {
    expect(validateTruncateConfig({ maxDepth: 5, maxArrayLength: 20, maxStringLength: 100 })).toEqual([]);
  });
});

describe("getTruncateConfigSummary", () => {
  it("returns a readable summary", () => {
    const summary = getTruncateConfigSummary({ maxDepth: 3 });
    expect(summary).toContain("maxDepth=3");
    expect(summary).toContain("maxArrayLength=");
  });
});
