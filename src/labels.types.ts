export type LabelColor = "red" | "green" | "yellow" | "blue" | "gray";

export interface LabelRule {
  field: string;
  pattern?: string;
  value?: string;
  label: string;
  color?: LabelColor;
}

export interface LabelConfig {
  rules: LabelRule[];
  defaultLabel?: string;
  defaultColor?: LabelColor;
}

export interface AppliedLabel {
  label: string;
  color: LabelColor;
  matchedRule?: LabelRule;
}

export interface LabeledResult {
  key: string;
  labels: AppliedLabel[];
}
