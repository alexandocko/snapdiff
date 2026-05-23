import { loadEnvOverrides, EnvOverrides } from "./env";

export interface EnvConfigResult {
  overrides: EnvOverrides;
  warnings: string[];
}

const VALID_FORMATS = ["text", "json", "markdown"];

export function validateEnvOverrides(overrides: EnvOverrides): string[] {
  const warnings: string[] = [];

  if (overrides.stagingUrl && !isValidUrl(overrides.stagingUrl)) {
    warnings.push(`SNAPDIFF_STAGING_URL is not a valid URL: ${overrides.stagingUrl}`);
  }
  if (overrides.productionUrl && !isValidUrl(overrides.productionUrl)) {
    warnings.push(`SNAPDIFF_PRODUCTION_URL is not a valid URL: ${overrides.productionUrl}`);
  }
  if (overrides.timeout !== undefined && overrides.timeout > 60000) {
    warnings.push(`SNAPDIFF_TIMEOUT is unusually large: ${overrides.timeout}ms`);
  }
  if (overrides.retries !== undefined && overrides.retries > 10) {
    warnings.push(`SNAPDIFF_RETRIES exceeds recommended maximum of 10: ${overrides.retries}`);
  }
  if (overrides.outputFormat && !VALID_FORMATS.includes(overrides.outputFormat)) {
    warnings.push(
      `SNAPDIFF_OUTPUT_FORMAT "${overrides.outputFormat}" is not valid. Use one of: ${VALID_FORMATS.join(", ")}`
    );
  }

  return warnings;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function resolveEnvConfig(): EnvConfigResult {
  const overrides = loadEnvOverrides();
  const warnings = validateEnvOverrides(overrides);
  return { overrides, warnings };
}

export function describeEnvVar(key: keyof EnvOverrides): string {
  const descriptions: Record<keyof EnvOverrides, string> = {
    stagingUrl: "SNAPDIFF_STAGING_URL — override staging base URL",
    productionUrl: "SNAPDIFF_PRODUCTION_URL — override production base URL",
    timeout: "SNAPDIFF_TIMEOUT — request timeout in milliseconds",
    retries: "SNAPDIFF_RETRIES — number of retry attempts",
    outputFormat: "SNAPDIFF_OUTPUT_FORMAT — output format (text|json|markdown)",
    outputFile: "SNAPDIFF_OUTPUT_FILE — path to write output file",
    cacheDir: "SNAPDIFF_CACHE_DIR — directory for cache storage",
    verbose: "SNAPDIFF_VERBOSE — enable verbose logging (1|true)",
  };
  return descriptions[key] ?? key;
}
