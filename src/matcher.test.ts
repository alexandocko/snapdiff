import { matchesRule, applyMatcher, parseMatcherConfig, getMatcherSummary } from "./matcher";
import { MatcherConfig } from "./matcher.types";

describe("matchesRule", () => {
  it("matches exact mode", () => {
    expect(matchesRule("hello", { pattern: "hello", mode: "exact" })).toBe(true);
    expect(matchesRule("hello", { pattern: "world", mode: "exact" })).toBe(false);
  });

  it("matches prefix mode", () => {
    expect(matchesRule("/api/users", { pattern: "/api", mode: "prefix" })).toBe(true);
    expect(matchesRule("/v2/users", { pattern: "/api", mode: "prefix" })).toBe(false);
  });

  it("matches suffix mode", () => {
    expect(matchesRule("report.json", { pattern: ".json", mode: "suffix" })).toBe(true);
    expect(matchesRule("report.csv", { pattern: ".json", mode: "suffix" })).toBe(false);
  });

  it("matches glob mode", () => {
    expect(matchesRule("/api/users/123", { pattern: "/api/users/*", mode: "glob" })).toBe(true);
    expect(matchesRule("/api/items/123", { pattern: "/api/users/*", mode: "glob" })).toBe(false);
  });

  it("matches regex mode", () => {
    expect(matchesRule("user_123", { pattern: "^user_\\d+$", mode: "regex" })).toBe(true);
    expect(matchesRule("admin_123", { pattern: "^user_\\d+$", mode: "regex" })).toBe(false);
  });

  it("respects caseSensitive flag", () => {
    expect(matchesRule("Hello", { pattern: "hello", mode: "exact", caseSensitive: false })).toBe(true);
    expect(matchesRule("Hello", { pattern: "hello", mode: "exact", caseSensitive: true })).toBe(false);
  });
});

describe("applyMatcher", () => {
  const config: MatcherConfig = {
    rules: [
      { pattern: "/api", mode: "prefix" },
      { pattern: "*.json", mode: "glob" },
    ],
    matchAll: false,
  };

  it("returns matched=true when any rule matches", () => {
    const result = applyMatcher("/api/users", config);
    expect(result.matched).toBe(true);
    expect(result.matchedRules).toHaveLength(1);
  });

  it("returns matched=false when no rules match", () => {
    const result = applyMatcher("/v2/items", config);
    expect(result.matched).toBe(false);
  });

  it("requires all rules when matchAll=true", () => {
    const strict: MatcherConfig = { ...config, matchAll: true };
    expect(applyMatcher("/api/data.json", strict).matched).toBe(true);
    expect(applyMatcher("/api/data.csv", strict).matched).toBe(false);
  });
});

describe("parseMatcherConfig", () => {
  it("returns empty config for invalid input", () => {
    expect(parseMatcherConfig(null)).toEqual({ rules: [] });
    expect(parseMatcherConfig("bad")).toEqual({ rules: [] });
  });

  it("parses valid config", () => {
    const cfg = parseMatcherConfig({ rules: [{ pattern: "/api", mode: "prefix" }], matchAll: true });
    expect(cfg.rules).toHaveLength(1);
    expect(cfg.matchAll).toBe(true);
  });
});

describe("getMatcherSummary", () => {
  it("describes no rules", () => {
    expect(getMatcherSummary({ rules: [] })).toBe("matcher: no rules configured");
  });

  it("describes rules with match mode", () => {
    const summary = getMatcherSummary({ rules: [{ pattern: "x", mode: "exact" }], matchAll: true });
    expect(summary).toBe("matcher: 1 rule(s), match-all");
  });
});
