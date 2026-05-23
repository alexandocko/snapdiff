import type { DedupOptions } from "./dedup.types";

const VALID_STRATEGIES = ["hash", "url", "custom"] as const;

export function parseDedupConfig(raw: Record<string, unknown>): DedupOptions {
  const enabled = raw.enabled !== false;
  const strategy = (raw.strategy as string) ?? "hash";

  if (!VALID_STRATEGIES.includes(strategy as DedupOptions["strategy"])) {
    throw new Error(`dedup: invalid strategy "${strategy}". Must be one of: ${VALID_STRATEGIES.join(", ")}`);
  }

  const customKey = typeof raw.customKey === "string" ? raw.customKey : undefined;
  const ttl = typeof raw.ttl === "number" ? raw.ttl : undefined;

  if (strategy === "custom" && !customKey) {
    throw new Error(`dedup: strategy "custom" requires a customKey`);
  }

  if (ttl !== undefined && (ttl <= 0 || !Number.isFinite(ttl))) {
    throw new Error(`dedup: ttl must be a positive finite number`);
  }

  return { enabled, strategy: strategy as DedupOptions["strategy"], customKey, ttl };
}

export function validateDedupConfig(options: DedupOptions): string[] {
  const errors: string[] = [];
  if (!VALID_STRATEGIES.includes(options.strategy)) {
    errors.push(`Invalid strategy: ${options.strategy}`);
  }
  if (options.strategy === "custom" && !options.customKey) {
    errors.push("customKey is required when strategy is 'custom'");
  }
  return errors;
}

export function getDedupSummary(options: DedupOptions): string {
  if (!options.enabled) return "dedup: disabled";
  const parts = [`strategy=${options.strategy}`];
  if (options.ttl != null) parts.push(`ttl=${options.ttl}s`);
  if (options.customKey) parts.push(`key=${options.customKey}`);
  return `dedup: ${parts.join(", ")}`;
}
