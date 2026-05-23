import { LabelConfig, LabelRule, AppliedLabel, LabeledResult, LabelColor } from "./labels.types";
import { DiffResult } from "./types";

const DEFAULT_COLOR: LabelColor = "gray";

export function matchesRule(value: unknown, rule: LabelRule): boolean {
  const strVal = typeof value === "string" ? value : JSON.stringify(value ?? "");
  if (rule.pattern) {
    try {
      return new RegExp(rule.pattern).test(strVal);
    } catch {
      return false;
    }
  }
  if (rule.value !== undefined) {
    return strVal === rule.value;
  }
  return false;
}

export function resolveFieldValue(obj: unknown, field: string): unknown {
  if (typeof obj !== "object" || obj === null) return undefined;
  const parts = field.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function applyLabels(
  result: DiffResult,
  config: LabelConfig
): LabeledResult {
  const applied: AppliedLabel[] = [];
  const target = result.staging ?? result.production ?? {};

  for (const rule of config.rules) {
    const fieldVal = resolveFieldValue(target, rule.field);
    if (matchesRule(fieldVal, rule)) {
      applied.push({
        label: rule.label,
        color: rule.color ?? DEFAULT_COLOR,
        matchedRule: rule,
      });
    }
  }

  if (applied.length === 0 && config.defaultLabel) {
    applied.push({
      label: config.defaultLabel,
      color: config.defaultColor ?? DEFAULT_COLOR,
    });
  }

  return { key: result.key, labels: applied };
}

export function applyLabelsToAll(
  results: DiffResult[],
  config: LabelConfig
): LabeledResult[] {
  return results.map((r) => applyLabels(r, config));
}

export function getLabelsSummary(labeled: LabeledResult[]): string {
  const counts: Record<string, number> = {};
  for (const r of labeled) {
    for (const l of r.labels) {
      counts[l.label] = (counts[l.label] ?? 0) + 1;
    }
  }
  const parts = Object.entries(counts).map(([k, v]) => `${k}: ${v}`);
  return parts.length > 0 ? `Labels — ${parts.join(", ")}` : "Labels — none applied";
}
