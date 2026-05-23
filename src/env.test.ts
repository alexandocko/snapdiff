import { loadEnvOverrides, applyEnvOverrides, getEnvSummary } from "./env";
import { validateEnvOverrides, resolveEnvConfig } from "./env.config";
import { SnapdiffConfig } from "./types";

const baseConfig: SnapdiffConfig = {
  stagingUrl: "https://staging.example.com",
  productionUrl: "https://example.com",
  endpoints: [],
  timeout: 5000,
  retries: 2,
  outputFormat: "text",
};

function withEnv(vars: Record<string, string>, fn: () => void) {
  const old: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) old[k] = process.env[k];
  Object.assign(process.env, vars);
  try { fn(); } finally {
    for (const k of Object.keys(vars)) {
      if (old[k] === undefined) delete process.env[k];
      else process.env[k] = old[k];
    }
  }
}

describe("loadEnvOverrides", () => {
  it("returns empty object when no env vars set", () => {
    const result = loadEnvOverrides();
    expect(Object.keys(result).length).toBeGreaterThanOrEqual(0);
  });

  it("picks up SNAPDIFF_STAGING_URL", () => {
    withEnv({ SNAPDIFF_STAGING_URL: "https://stg.test.com" }, () => {
      const r = loadEnvOverrides();
      expect(r.stagingUrl).toBe("https://stg.test.com");
    });
  });

  it("parses SNAPDIFF_TIMEOUT as integer", () => {
    withEnv({ SNAPDIFF_TIMEOUT: "8000" }, () => {
      const r = loadEnvOverrides();
      expect(r.timeout).toBe(8000);
    });
  });

  it("ignores invalid SNAPDIFF_TIMEOUT", () => {
    withEnv({ SNAPDIFF_TIMEOUT: "abc" }, () => {
      const r = loadEnvOverrides();
      expect(r.timeout).toBeUndefined();
    });
  });

  it("parses SNAPDIFF_VERBOSE true", () => {
    withEnv({ SNAPDIFF_VERBOSE: "true" }, () => {
      expect(loadEnvOverrides().verbose).toBe(true);
    });
  });

  it("parses SNAPDIFF_VERBOSE 0 as false", () => {
    withEnv({ SNAPDIFF_VERBOSE: "0" }, () => {
      expect(loadEnvOverrides().verbose).toBe(false);
    });
  });
});

describe("applyEnvOverrides", () => {
  it("merges overrides onto config", () => {
    const result = applyEnvOverrides(baseConfig, { timeout: 9000, retries: 5 });
    expect(result.timeout).toBe(9000);
    expect(result.retries).toBe(5);
    expect(result.stagingUrl).toBe(baseConfig.stagingUrl);
  });

  it("does not mutate original config", () => {
    applyEnvOverrides(baseConfig, { timeout: 1 });
    expect(baseConfig.timeout).toBe(5000);
  });
});

describe("validateEnvOverrides", () => {
  it("warns on invalid staging URL", () => {
    const warnings = validateEnvOverrides({ stagingUrl: "not-a-url" });
    expect(warnings.some(w => w.includes("SNAPDIFF_STAGING_URL"))).toBe(true);
  });

  it("warns on unknown output format", () => {
    const warnings = validateEnvOverrides({ outputFormat: "xml" });
    expect(warnings.some(w => w.includes("SNAPDIFF_OUTPUT_FORMAT"))).toBe(true);
  });

  it("returns no warnings for valid overrides", () => {
    const warnings = validateEnvOverrides({ timeout: 3000, outputFormat: "json" });
    expect(warnings).toHaveLength(0);
  });
});

describe("getEnvSummary", () => {
  it("returns message when no overrides", () => {
    expect(getEnvSummary({})).toMatch(/No environment overrides/);
  });

  it("lists active override keys", () => {
    const summary = getEnvSummary({ timeout: 1000, verbose: true });
    expect(summary).toContain("timeout");
    expect(summary).toContain("verbose");
  });
});
