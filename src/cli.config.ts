import { OutputFormat } from "./output";

export interface CliOptions {
  config?: string;
  output?: string;
  format: OutputFormat;
  filter?: string;
  failOnChange: boolean;
  verbose: boolean;
  noCache: boolean;
}

export function resolveCliOptions(argv: Record<string, unknown>): CliOptions {
  const format = resolveFormat(argv.format as string | undefined);
  return {
    config: argv.config as string | undefined,
    output: argv.output as string | undefined,
    format,
    filter: argv.filter as string | undefined,
    failOnChange: Boolean(argv["fail-on-change"] ?? argv.failOnChange ?? false),
    verbose: Boolean(argv.verbose ?? false),
    noCache: Boolean(argv["no-cache"] ?? argv.noCache ?? false),
  };
}

function resolveFormat(raw: string | undefined): OutputFormat {
  if (raw === "json" || raw === "markdown" || raw === "text") {
    return raw;
  }
  return "text";
}

export function resolveExitCode(
  changed: number,
  missing: number,
  failOnChange: boolean
): number {
  if (failOnChange && (changed > 0 || missing > 0)) {
    return 1;
  }
  return 0;
}
