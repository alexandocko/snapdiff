import { sampleItems, getSamplerSummary, parseSamplerConfig, validateSamplerConfig } from "./sampler";

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe("sampleItems", () => {
  it("first strategy returns first n items", () => {
    const result = sampleItems(items, { strategy: "first", n: 3 });
    expect(result.items).toEqual([1, 2, 3]);
    expect(result.sampledCount).toBe(3);
    expect(result.originalCount).toBe(10);
  });

  it("last strategy returns last n items", () => {
    const result = sampleItems(items, { strategy: "last", n: 2 });
    expect(result.items).toEqual([9, 10]);
  });

  it("nth strategy returns every nth item", () => {
    const result = sampleItems(items, { strategy: "nth", n: 3 });
    expect(result.items).toEqual([1, 4, 7, 10]);
  });

  it("random strategy with rate=1.0 returns all items", () => {
    const result = sampleItems(items, { strategy: "random", rate: 1.0, seed: 42 });
    expect(result.sampledCount).toBe(10);
  });

  it("random strategy with rate=0.0 returns no items", () => {
    const result = sampleItems(items, { strategy: "random", rate: 0.0, seed: 1 });
    expect(result.sampledCount).toBe(0);
  });

  it("random strategy with seed is reproducible", () => {
    const r1 = sampleItems(items, { strategy: "random", rate: 0.5, seed: 99 });
    const r2 = sampleItems(items, { strategy: "random", rate: 0.5, seed: 99 });
    expect(r1.items).toEqual(r2.items);
  });

  it("returns correct strategy in result", () => {
    const result = sampleItems(items, { strategy: "first", n: 1 });
    expect(result.strategy).toBe("first");
  });
});

describe("getSamplerSummary", () => {
  it("formats summary correctly", () => {
    const result = sampleItems(items, { strategy: "nth", n: 2 });
    const summary = getSamplerSummary(result);
    expect(summary).toContain("nth");
    expect(summary).toContain(`${result.sampledCount}/${result.originalCount}`);
  });
});

describe("parseSamplerConfig", () => {
  it("parses all fields", () => {
    const cfg = parseSamplerConfig({ strategy: "random", rate: 0.5, seed: 7 });
    expect(cfg).toEqual({ strategy: "random", rate: 0.5, seed: 7, n: undefined });
  });

  it("defaults to random strategy", () => {
    const cfg = parseSamplerConfig({});
    expect(cfg.strategy).toBe("random");
  });
});

describe("validateSamplerConfig", () => {
  it("returns no errors for valid config", () => {
    expect(validateSamplerConfig({ strategy: "first", n: 5 })).toHaveLength(0);
  });

  it("errors on invalid strategy", () => {
    const errors = validateSamplerConfig({ strategy: "bogus" as any });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("errors on out-of-range rate", () => {
    const errors = validateSamplerConfig({ strategy: "random", rate: 1.5 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("errors on non-positive n", () => {
    const errors = validateSamplerConfig({ strategy: "nth", n: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });
});
