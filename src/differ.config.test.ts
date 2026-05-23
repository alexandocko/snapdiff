import { parseDiffConfig, validateDiffConfig, getDiffConfigSummary } from "./differ.config";

describe("parseDiffConfig", () => {
  it("returns empty config for empty input", () => {
    expect(parseDiffConfig({})).toEqual({});
  });

  it("parses ignoreKeys as string array", () => {
    const result = parseDiffConfig({ ignoreKeys: ["timestamp", "id"] });
    expect(result.ignoreKeys).toEqual(["timestamp", "id"]);
  });

  it("filters non-string values from ignoreKeys", () => {
    const result = parseDiffConfig({ ignoreKeys: ["key", 42, null] });
    expect(result.ignoreKeys).toEqual(["key"]);
  });

  it("parses ignoreOrder boolean", () => {
    expect(parseDiffConfig({ ignoreOrder: true }).ignoreOrder).toBe(true);
    expect(parseDiffConfig({ ignoreOrder: false }).ignoreOrder).toBe(false);
  });

  it("parses numericTolerance", () => {
    expect(parseDiffConfig({ numericTolerance: 0.01 }).numericTolerance).toBe(0.01);
  });

  it("throws if numericTolerance is negative", () => {
    expect(() => parseDiffConfig({ numericTolerance: -1 })).toThrow("numericTolerance must be >= 0");
  });

  it("parses strictTypes boolean", () => {
    expect(parseDiffConfig({ strictTypes: true }).strictTypes).toBe(true);
  });
});

describe("validateDiffConfig", () => {
  it("returns no errors for valid config", () => {
    expect(validateDiffConfig({ ignoreKeys: ["ts"], numericTolerance: 0.1 })).toEqual([]);
  });

  it("returns error for negative numericTolerance", () => {
    const errors = validateDiffConfig({ numericTolerance: -5 });
    expect(errors).toContain("numericTolerance must be a non-negative number");
  });

  it("returns error for empty string in ignoreKeys", () => {
    const errors = validateDiffConfig({ ignoreKeys: ["valid", ""] });
    expect(errors).toContain("ignoreKeys must not contain empty strings");
  });
});

describe("getDiffConfigSummary", () => {
  it("returns default message for empty config", () => {
    expect(getDiffConfigSummary({})).toBe("diff config: defaults");
  });

  it("includes ignoreKeys in summary", () => {
    const summary = getDiffConfigSummary({ ignoreKeys: ["id", "ts"] });
    expect(summary).toContain("ignoreKeys=[id, ts]");
  });

  it("includes numericTolerance in summary", () => {
    const summary = getDiffConfigSummary({ numericTolerance: 0.05 });
    expect(summary).toContain("numericTolerance=0.05");
  });

  it("includes all active options", () => {
    const summary = getDiffConfigSummary({ ignoreOrder: true, strictTypes: true });
    expect(summary).toContain("ignoreOrder=true");
    expect(summary).toContain("strictTypes=true");
  });
});
