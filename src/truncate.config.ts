import { TruncateConfig, DEFAULT_TRUNCATE_CONFIG } from "./truncate.types";

export function parseTruncateConfig(raw: Record<string, unknown>): TruncateConfig {
  const config: TruncateConfig = {};

  if (raw.maxDepth !== undefined) {
    config.maxDepth = Number(raw.maxDepth);
  }
  if (raw.maxArrayLength !== undefined) {
    config.maxArrayLength = Number(raw.maxArrayLength);
  }
  if (raw.maxStringLength !== undefined) {
    config.maxStringLength = Number(raw.maxStringLength);
  }
  if (typeof raw.placeholder === "string") {
    config.placeholder = raw.placeholder;
  }

  return config;
}

export function validateTruncateConfig(config: TruncateConfig): string[] {
  const errors: string[] = [];

  if (config.maxDepth !== undefined && (config.maxDepth < 1 || !Number.isInteger(config.maxDepth))) {
    errors.push("maxDepth must be a positive integer");
  }
  if (config.maxArrayLength !== undefined && (config.maxArrayLength < 1 || !Number.isInteger(config.maxArrayLength))) {
    errors.push("maxArrayLength must be a positive integer");
  }
  if (config.maxStringLength !== undefined && (config.maxStringLength < 1 || !Number.isInteger(config.maxStringLength))) {
    errors.push("maxStringLength must be a positive integer");
  }
  if (config.placeholder !== undefined && config.placeholder.trim() === "") {
    errors.push("placeholder must not be empty");
  }

  return errors;
}

export function getTruncateConfigSummary(config: TruncateConfig): string {
  const cfg = { ...DEFAULT_TRUNCATE_CONFIG, ...config };
  return [
    `maxDepth=${cfg.maxDepth}`,
    `maxArrayLength=${cfg.maxArrayLength}`,
    `maxStringLength=${cfg.maxStringLength}`,
  ].join(", ");
}
