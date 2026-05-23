import { DiffOptions } from "./types";

export interface DiffConfig {
  ignoreKeys?: string[];
  ignoreOrder?: boolean;
  numericTolerance?: number;
  strictTypes?: boolean;
}

export function parseDiffConfig(raw: Record<string, unknown>): DiffConfig {
  const config: DiffConfig = {};

  if (Array.isArray(raw.ignoreKeys)) {
    config.ignoreKeys = raw.ignoreKeys.filter((k) => typeof k === "string");
  }

  if (typeof raw.ignoreOrder === "boolean") {
    config.ignoreOrder = raw.ignoreOrder;
  }

  if (typeof raw.numericTolerance === "number") {
    if (raw.numericTolerance < 0) {
      throw new Error("numericTolerance must be >= 0");
    }
    config.numericTolerance = raw.numericTolerance;
  }

  if (typeof raw.strictTypes === "boolean") {
    config.strictTypes = raw.strictTypes;
  }

  return config;
}

export function validateDiffConfig(config: DiffConfig): string[] {
  const errors: string[] = [];

  if (config.numericTolerance !== undefined && config.numericTolerance < 0) {
    errors.push("numericTolerance must be a non-negative number");
  }

  if (config.ignoreKeys && config.ignoreKeys.some((k) => k.trim() === "")) {
    errors.push("ignoreKeys must not contain empty strings");
  }

  return errors;
}

export function getDiffConfigSummary(config: DiffConfig): string {
  const parts: string[] = [];

  if (config.ignoreKeys && config.ignoreKeys.length > 0) {
    parts.push(`ignoreKeys=[${config.ignoreKeys.join(", ")}]`);
  }
  if (config.ignoreOrder) {
    parts.push("ignoreOrder=true");
  }
  if (config.numericTolerance !== undefined) {
    parts.push(`numericTolerance=${config.numericTolerance}`);
  }
  if (config.strictTypes) {
    parts.push("strictTypes=true");
  }

  return parts.length > 0 ? `diff config: ${parts.join(", ")}` : "diff config: defaults";
}
