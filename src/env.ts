import { SnapdiffConfig } from "./types";

export interface EnvOverrides {
  stagingUrl?: string;
  productionUrl?: string;
  timeout?: number;
  retries?: number;
  outputFormat?: string;
  outputFile?: string;
  cacheDir?: string;
  verbose?: boolean;
}

export function loadEnvOverrides(): EnvOverrides {
  const overrides: EnvOverrides = {};

  if (process.env.SNAPDIFF_STAGING_URL) {
    overrides.stagingUrl = process.env.SNAPDIFF_STAGING_URL;
  }
  if (process.env.SNAPDIFF_PRODUCTION_URL) {
    overrides.productionUrl = process.env.SNAPDIFF_PRODUCTION_URL;
  }
  if (process.env.SNAPDIFF_TIMEOUT) {
    const t = parseInt(process.env.SNAPDIFF_TIMEOUT, 10);
    if (!isNaN(t) && t > 0) overrides.timeout = t;
  }
  if (process.env.SNAPDIFF_RETRIES) {
    const r = parseInt(process.env.SNAPDIFF_RETRIES, 10);
    if (!isNaN(r) && r >= 0) overrides.retries = r;
  }
  if (process.env.SNAPDIFF_OUTPUT_FORMAT) {
    overrides.outputFormat = process.env.SNAPDIFF_OUTPUT_FORMAT;
  }
  if (process.env.SNAPDIFF_OUTPUT_FILE) {
    overrides.outputFile = process.env.SNAPDIFF_OUTPUT_FILE;
  }
  if (process.env.SNAPDIFF_CACHE_DIR) {
    overrides.cacheDir = process.env.SNAPDIFF_CACHE_DIR;
  }
  if (process.env.SNAPDIFF_VERBOSE) {
    overrides.verbose = process.env.SNAPDIFF_VERBOSE === "1" || process.env.SNAPDIFF_VERBOSE === "true";
  }

  return overrides;
}

export function applyEnvOverrides(
  config: SnapdiffConfig,
  overrides: EnvOverrides
): SnapdiffConfig {
  const merged = { ...config };

  if (overrides.stagingUrl) merged.stagingUrl = overrides.stagingUrl;
  if (overrides.productionUrl) merged.productionUrl = overrides.productionUrl;
  if (overrides.timeout !== undefined) merged.timeout = overrides.timeout;
  if (overrides.retries !== undefined) merged.retries = overrides.retries;
  if (overrides.outputFormat) merged.outputFormat = overrides.outputFormat as SnapdiffConfig["outputFormat"];
  if (overrides.outputFile) merged.outputFile = overrides.outputFile;
  if (overrides.cacheDir) merged.cacheDir = overrides.cacheDir;
  if (overrides.verbose !== undefined) merged.verbose = overrides.verbose;

  return merged;
}

export function getEnvSummary(overrides: EnvOverrides): string {
  const keys = Object.keys(overrides);
  if (keys.length === 0) return "No environment overrides active.";
  return `Env overrides: ${keys.join(", ")}`;
}
