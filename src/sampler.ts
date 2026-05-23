import { SamplerConfig, SamplerResult, SamplingStrategy } from "./sampler.types";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function sampleItems<T>(items: T[], config: SamplerConfig): SamplerResult<T> {
  const originalCount = items.length;
  let sampled: T[];

  switch (config.strategy) {
    case "first": {
      const n = config.n ?? 1;
      sampled = items.slice(0, n);
      break;
    }
    case "last": {
      const n = config.n ?? 1;
      sampled = items.slice(-n);
      break;
    }
    case "nth": {
      const step = config.n ?? 2;
      sampled = items.filter((_, i) => i % step === 0);
      break;
    }
    case "random": {
      const rate = config.rate ?? 1.0;
      const rand = config.seed !== undefined ? seededRandom(config.seed) : Math.random;
      sampled = items.filter(() => rand() < rate);
      break;
    }
    default:
      sampled = items;
  }

  return {
    items: sampled,
    originalCount,
    sampledCount: sampled.length,
    strategy: config.strategy,
  };
}

export function getSamplerSummary(result: SamplerResult<unknown>): string {
  const pct = result.originalCount > 0
    ? ((result.sampledCount / result.originalCount) * 100).toFixed(1)
    : "0.0";
  return `sampler: ${result.sampledCount}/${result.originalCount} items (${pct}%) via "${result.strategy}" strategy`;
}

export function parseSamplerConfig(raw: Record<string, unknown>): SamplerConfig {
  const strategy = (raw.strategy as SamplingStrategy) ?? "random";
  return {
    strategy,
    rate: typeof raw.rate === "number" ? raw.rate : undefined,
    n: typeof raw.n === "number" ? raw.n : undefined,
    seed: typeof raw.seed === "number" ? raw.seed : undefined,
  };
}

export function validateSamplerConfig(config: SamplerConfig): string[] {
  const errors: string[] = [];
  const validStrategies: SamplingStrategy[] = ["random", "first", "last", "nth"];
  if (!validStrategies.includes(config.strategy)) {
    errors.push(`invalid strategy "${config.strategy}"; must be one of: ${validStrategies.join(", ")}`);
  }
  if (config.strategy === "random" && config.rate !== undefined) {
    if (config.rate < 0 || config.rate > 1) {
      errors.push(`rate must be between 0.0 and 1.0, got ${config.rate}`);
    }
  }
  if ((config.strategy === "nth" || config.strategy === "first" || config.strategy === "last") && config.n !== undefined) {
    if (!Number.isInteger(config.n) || config.n < 1) {
      errors.push(`n must be a positive integer, got ${config.n}`);
    }
  }
  return errors;
}
