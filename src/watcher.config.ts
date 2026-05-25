import { WatcherOptions } from './watcher.types';

export function parseWatcherConfig(
  raw: Record<string, unknown>
): Partial<WatcherOptions> {
  const out: Partial<WatcherOptions> = {};

  if (typeof raw.interval === 'number') out.interval = raw.interval;
  if (typeof raw.maxRuns === 'number') out.maxRuns = raw.maxRuns;
  if (raw.maxRuns === null) out.maxRuns = null;
  if (typeof raw.exitOnChange === 'boolean') out.exitOnChange = raw.exitOnChange;
  if (typeof raw.silent === 'boolean') out.silent = raw.silent;

  return out;
}

export function validateWatcherConfig(
  opts: Partial<WatcherOptions>
): string[] {
  const errors: string[] = [];

  if (opts.interval !== undefined && opts.interval < 1000) {
    errors.push('watcher.interval must be at least 1000ms');
  }
  if (
    opts.maxRuns !== undefined &&
    opts.maxRuns !== null &&
    opts.maxRuns < 1
  ) {
    errors.push('watcher.maxRuns must be a positive integer or null');
  }

  return errors;
}

export function getWatcherConfigSummary(
  opts: Partial<WatcherOptions>
): string {
  const parts: string[] = [];
  if (opts.interval !== undefined) parts.push(`interval=${opts.interval}ms`);
  if (opts.maxRuns !== undefined)
    parts.push(`maxRuns=${opts.maxRuns ?? 'unlimited'}`);
  if (opts.exitOnChange) parts.push('exitOnChange=true');
  if (opts.silent) parts.push('silent=true');
  return parts.length ? `Watcher config: ${parts.join(', ')}` : 'Watcher config: defaults';
}
