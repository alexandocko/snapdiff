import { LabelConfig, LabelRule } from "./labels.types";

function isValidRule(rule: unknown): rule is LabelRule {
  if (typeof rule !== "object" || rule === null) return false;
  const r = rule as Record<string, unknown>;
  if (typeof r.field !== "string" || r.field.trim() === "") return false;
  if (typeof r.label !== "string" || r.label.trim() === "") return false;
  if (r.pattern !== undefined && typeof r.pattern !== "string") return false;
  if (r.value !== undefined && typeof r.value !== "string") return false;
  return true;
}

export function parseLabelConfig(raw: unknown): LabelConfig {
  if (typeof raw !== "object" || raw === null) {
    return { rules: [] };
  }
  const obj = raw as Record<string, unknown>;
  const rawRules = Array.isArray(obj.rules) ? obj.rules : [];
  const rules: LabelRule[] = rawRules.filter(isValidRule);

  return {
    rules,
    defaultLabel: typeof obj.defaultLabel === "string" ? obj.defaultLabel : undefined,
    defaultColor: typeof obj.defaultColor === "string" ? (obj.defaultColor as LabelConfig["defaultColor"]) : undefined,
  };
}

export function validateLabelConfig(config: LabelConfig): string[] {
  const errors: string[] = [];
  config.rules.forEach((rule, i) => {
    if (!rule.pattern && rule.value === undefined) {
      errors.push(`Rule[${i}] ("${rule.label}"): must define either 'pattern' or 'value'.`);
    }
    if (rule.pattern) {
      try { new RegExp(rule.pattern); } catch {
        errors.push(`Rule[${i}] ("${rule.label}"): invalid regex pattern "${rule.pattern}".`);
      }
    }
  });
  return errors;
}

export function getLabelConfigSummary(config: LabelConfig): string {
  const count = config.rules.length;
  const def = config.defaultLabel ? ` | default: "${config.defaultLabel}"` : "";
  return `LabelConfig: ${count} rule${count !== 1 ? "s" : ""}${def}`;
}
