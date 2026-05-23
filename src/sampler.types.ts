export type SamplingStrategy = "random" | "first" | "last" | "nth";

export interface SamplerConfig {
  strategy: SamplingStrategy;
  rate?: number;      // 0.0 - 1.0 for "random"
  n?: number;         // step size for "nth", or count for "first"/"last"
  seed?: number;      // optional seed for reproducible random sampling
}

export interface SamplerResult<T> {
  items: T[];
  originalCount: number;
  sampledCount: number;
  strategy: SamplingStrategy;
}
