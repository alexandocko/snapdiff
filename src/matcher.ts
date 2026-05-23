import { MatchRule, MatcherConfig, MatchResult, MatchMode } from "./matcher.types";

export function matchesRule(input: string, rule: MatchRule): boolean {
  const haystack = rule.caseSensitive ? input : input.toLowerCase();
  const pattern = rule.caseSensitive ? rule.pattern : rule.pattern.toLowerCase();

  switch (rule.mode) {
    case "exact":
      return haystack === pattern;

    case "prefix":
      return haystack.startsWith(pattern);

    case "suffix":
      return haystack.endsWith(pattern);

    case "glob": {
      const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
      const regexStr = escaped.replace(/\*/g, ".*").replace(/\?/g, ".");
      return new RegExp(`^${regexStr}$`).test(haystack);
    }

    case "regex": {
      const flags = rule.caseSensitive ? "" : "i";
      return new RegExp(rule.pattern, flags).test(input);
    }

    default:
      return false;
  }
}

export function applyMatcher(input: string, config: MatcherConfig): MatchResult {
  const matchedRules: MatchRule[] = [];

  for (const rule of config.rules) {
    if (matchesRule(input, rule)) {
      matchedRules.push(rule);
    }
  }

  const matched = config.matchAll
    ? matchedRules.length === config.rules.length
    : matchedRules.length > 0;

  return { matched, matchedRules, input };
}

export function parseMatcherConfig(raw: unknown): MatcherConfig {
  if (!raw || typeof raw !== "object") {
    return { rules: [] };
  }
  const obj = raw as Record<string, unknown>;
  const rules = Array.isArray(obj.rules)
    ? (obj.rules as MatchRule[])
    : [];
  return {
    rules,
    matchAll: obj.matchAll === true,
  };
}

export function getMatcherSummary(config: MatcherConfig): string {
  if (config.rules.length === 0) return "matcher: no rules configured";
  const modeLabel = config.matchAll ? "all" : "any";
  return `matcher: ${config.rules.length} rule(s), match-${modeLabel}`;
}
