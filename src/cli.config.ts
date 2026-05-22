/**
 * CLI-specific configuration defaults and helpers.
 * Separates CLI concerns from core config loading logic.
 */

export const CLI_DEFAULTS = {
  configFile: 'snapdiff.config.json',
  outputFormat: 'text' as 'text' | 'json',
  exitOnDiff: true,
} as const;

export type OutputFormat = typeof CLI_DEFAULTS.outputFormat;

export interface CliOptions {
  config: string;
  output?: string;
  format: OutputFormat;
  exitOnDiff: boolean;
}

/**
 * Merges partial CLI options with defaults.
 */
export function resolveCliOptions(partial: Partial<CliOptions>): CliOptions {
  return {
    config: partial.config ?? CLI_DEFAULTS.configFile,
    output: partial.output,
    format: partial.format ?? CLI_DEFAULTS.outputFormat,
    exitOnDiff: partial.exitOnDiff ?? CLI_DEFAULTS.exitOnDiff,
  };
}

/**
 * Returns the appropriate process exit code based on diff results.
 * 0 = no differences, 1 = differences found, 2 = error
 */
export function resolveExitCode(
  hasDifferences: boolean,
  exitOnDiff: boolean
): number {
  if (!exitOnDiff) return 0;
  return hasDifferences ? 1 : 0;
}
