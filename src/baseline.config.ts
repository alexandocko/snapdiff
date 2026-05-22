export interface BaselineOptions {
  name: string;
  label?: string;
  overwrite?: boolean;
}

export function parseBaselineOptions(args: Record<string, unknown>): BaselineOptions {
  const name = typeof args.baseline === "string" && args.baseline.trim()
    ? args.baseline.trim()
    : "default";

  const label = typeof args.label === "string" ? args.label.trim() : undefined;
  const overwrite = args.overwrite === true || args.overwrite === "true";

  return { name, label, overwrite };
}

export function getBaselineSummary(options: BaselineOptions): string {
  const parts = [`baseline: "${options.name}"`];
  if (options.label) parts.push(`label: "${options.label}"`);
  if (options.overwrite) parts.push("overwrite: true");
  return parts.join(", ");
}

export function validateBaselineOptions(options: BaselineOptions): string[] {
  const errors: string[] = [];
  if (!options.name || options.name.length === 0) {
    errors.push("Baseline name must not be empty.");
  }
  if (/[^a-zA-Z0-9_\-]/.test(options.name)) {
    errors.push(`Baseline name "${options.name}" contains invalid characters. Use only alphanumeric, dash, or underscore.`);
  }
  return errors;
}
