import { describe, it, expect } from "vitest";
import { applyLabels, applyLabelsToAll, matchesRule, resolveFieldValue, getLabelsSummary } from "./labels";
import { parseLabelConfig, validateLabelConfig, getLabelConfigSummary } from "./labels.config";
import { DiffResult } from "./types";

const makeResult = (key: string, staging: unknown): DiffResult => ({
  key,
  status: "changed",
  staging,
  production: {},
  diff: [],
});

describe("resolveFieldValue", () => {
  it("resolves nested fields", () => {
    expect(resolveFieldValue({ a: { b: 42 } }, "a.b")).toBe(42);
  });
  it("returns undefined for missing path", () => {
    expect(resolveFieldValue({ a: 1 }, "a.b.c")).toBeUndefined();
  });
});

describe("matchesRule", () => {
  it("matches by pattern", () => {
    expect(matchesRule("error_500", { field: "status", pattern: "^error", label: "error" })).toBe(true);
  });
  it("matches by value", () => {
    expect(matchesRule("ok", { field: "status", value: "ok", label: "ok" })).toBe(true);
  });
  it("returns false for no match", () => {
    expect(matchesRule("ok", { field: "status", value: "fail", label: "fail" })).toBe(false);
  });
});

describe("applyLabels", () => {
  it("applies matching label rule", () => {
    const config = parseLabelConfig({ rules: [{ field: "code", value: "404", label: "not-found", color: "red" }] });
    const result = applyLabels(makeResult("ep1", { code: "404" }), config);
    expect(result.labels).toHaveLength(1);
    expect(result.labels[0].label).toBe("not-found");
  });

  it("applies default label when no rules match", () => {
    const config = parseLabelConfig({ rules: [], defaultLabel: "uncategorized" });
    const result = applyLabels(makeResult("ep2", {}), config);
    expect(result.labels[0].label).toBe("uncategorized");
  });
});

describe("applyLabelsToAll", () => {
  it("labels multiple results", () => {
    const config = parseLabelConfig({ rules: [{ field: "env", value: "prod", label: "production" }] });
    const results = [makeResult("a", { env: "prod" }), makeResult("b", { env: "staging" })];
    const labeled = applyLabelsToAll(results, config);
    expect(labeled).toHaveLength(2);
    expect(labeled[0].labels[0].label).toBe("production");
  });
});

describe("getLabelsSummary", () => {
  it("summarises label counts", () => {
    const summary = getLabelsSummary([
      { key: "a", labels: [{ label: "ok", color: "green" }] },
      { key: "b", labels: [{ label: "ok", color: "green" }, { label: "slow", color: "yellow" }] },
    ]);
    expect(summary).toContain("ok: 2");
    expect(summary).toContain("slow: 1");
  });
});

describe("validateLabelConfig", () => {
  it("returns error when rule has neither pattern nor value", () => {
    const config = parseLabelConfig({ rules: [{ field: "x", label: "y" }] });
    const errors = validateLabelConfig(config);
    expect(errors.length).toBeGreaterThan(0);
  });
  it("passes valid config", () => {
    const config = parseLabelConfig({ rules: [{ field: "x", value: "1", label: "y" }] });
    expect(validateLabelConfig(config)).toHaveLength(0);
  });
});

describe("getLabelConfigSummary", () => {
  it("returns readable summary", () => {
    const config = parseLabelConfig({ rules: [{ field: "f", value: "v", label: "l" }], defaultLabel: "misc" });
    expect(getLabelConfigSummary(config)).toContain("1 rule");
    expect(getLabelConfigSummary(config)).toContain("misc");
  });
});
