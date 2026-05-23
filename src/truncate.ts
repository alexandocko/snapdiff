import { TruncateConfig, TruncateResult, DEFAULT_TRUNCATE_CONFIG } from "./truncate.types";

let lastResult: TruncateResult = { truncated: false, arraysTruncated: 0, stringsTruncated: 0, depthTruncated: 0 };

export function truncateData(
  data: unknown,
  config: TruncateConfig = {}
): unknown {
  const cfg = { ...DEFAULT_TRUNCATE_CONFIG, ...config };
  lastResult = { truncated: false, arraysTruncated: 0, stringsTruncated: 0, depthTruncated: 0 };
  const result = truncateValue(data, cfg, 0);
  return result;
}

function truncateValue(
  value: unknown,
  cfg: Required<TruncateConfig>,
  depth: number
): unknown {
  if (depth > cfg.maxDepth) {
    lastResult.truncated = true;
    lastResult.depthTruncated++;
    return cfg.placeholder;
  }

  if (typeof value === "string" && value.length > cfg.maxStringLength) {
    lastResult.truncated = true;
    lastResult.stringsTruncated++;
    return value.slice(0, cfg.maxStringLength) + cfg.placeholder;
  }

  if (Array.isArray(value)) {
    const arr = value.slice(0, cfg.maxArrayLength).map((item) =>
      truncateValue(item, cfg, depth + 1)
    );
    if (value.length > cfg.maxArrayLength) {
      lastResult.truncated = true;
      lastResult.arraysTruncated++;
      arr.push(cfg.placeholder);
    }
    return arr;
  }

  if (value !== null && typeof value === "object") {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      obj[k] = truncateValue(v, cfg, depth + 1);
    }
    return obj;
  }

  return value;
}

export function getTruncateResult(): TruncateResult {
  return { ...lastResult };
}

export function buildTruncateSummary(result: TruncateResult): string {
  if (!result.truncated) return "No truncation applied";
  const parts: string[] = [];
  if (result.arraysTruncated > 0) parts.push(`${result.arraysTruncated} array(s) truncated`);
  if (result.stringsTruncated > 0) parts.push(`${result.stringsTruncated} string(s) truncated`);
  if (result.depthTruncated > 0) parts.push(`${result.depthTruncated} value(s) exceeded max depth`);
  return parts.join(", ");
}
