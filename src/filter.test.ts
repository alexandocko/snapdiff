import { describe, it, expect } from "vitest";
import { filterDiffResults, groupByStatus } from "./filter";
import { DiffResult } from "./types";

const makeDiff = (overrides: Partial<DiffResult>): DiffResult => ({
  path: "/api/users",
  status: "changed",
  severity: "low",
  productionValue: null,
  stagingValue: null,
  ...overrides,
});

describe("filterDiffResults", () => {
  const results: DiffResult[] = [
    makeDiff({ path: "/api/users", status: "changed", severity: "high" }),
    makeDiff({ path: "/api/orders", status: "added", severity: "medium" }),
    makeDiff({ path: "/api/users/123", status: "removed", severity: "low" }),
    makeDiff({ path: "/health", status: "unchanged", severity: "low" }),
  ];

  it("filters by status", () => {
    const out = filterDiffResults(results, { status: "added" });
    expect(out).toHaveLength(1);
    expect(out[0].path).toBe("/api/orders");
  });

  it("filters by pathPrefix", () => {
    const out = filterDiffResults(results, { pathPrefix: "/api/users" });
    expect(out).toHaveLength(2);
  });

  it("filters by minSeverity medium", () => {
    const out = filterDiffResults(results, { minSeverity: "medium" });
    expect(out).toHaveLength(2);
    expect(out.map((r) => r.severity)).toEqual(
      expect.arrayContaining(["high", "medium"])
    );
  });

  it("combines multiple filters", () => {
    const out = filterDiffResults(results, {
      pathPrefix: "/api",
      minSeverity: "medium",
    });
    expect(out).toHaveLength(2);
  });

  it("returns all results when no options given", () => {
    const out = filterDiffResults(results, {});
    expect(out).toHaveLength(results.length);
  });
});

describe("groupByStatus", () => {
  it("groups results by status key", () => {
    const results: DiffResult[] = [
      makeDiff({ status: "changed" }),
      makeDiff({ status: "changed" }),
      makeDiff({ status: "added" }),
    ];
    const grouped = groupByStatus(results);
    expect(grouped["changed"]).toHaveLength(2);
    expect(grouped["added"]).toHaveLength(1);
    expect(grouped["removed"]).toBeUndefined();
  });
});
