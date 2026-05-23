export type MatchMode = "exact" | "glob" | "regex" | "prefix" | "suffix";

export interface MatchRule {
  pattern: string;
  mode: MatchMode;
  caseSensitive?: boolean;
}

export interface MatcherConfig {
  rules: MatchRule[];
  matchAll?: boolean; // if true, all rules must match; if false, any rule matches
}

export interface MatchResult {
  matched: boolean;
  matchedRules: MatchRule[];
  input: string;
}
