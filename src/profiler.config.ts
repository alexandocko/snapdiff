import { ProfilerOptions } from './profiler.types';

export function parseProfilerConfig(raw: Record<string, unknown>): ProfilerOptions {
  const enabled = raw.profilerEnabled !== undefined ? Boolean(raw.profilerEnabled) : false;
  const minDurationMs = typeof raw.profilerMinDurationMs === 'number' ? raw.profilerMinDurationMs : 0;
  const tags =
    raw.profilerTags && typeof raw.profilerTags === 'object' && !Array.isArray(raw.profilerTags)
      ? (raw.profilerTags as Record<string, string>)
      : undefined;
  return { enabled, minDurationMs, tags };
}

export function validateProfilerConfig(options: ProfilerOptions): string[] {
  const errors: string[] = [];
  if (options.minDurationMs !== undefined && options.minDurationMs < 0) {
    errors.push('profilerMinDurationMs must be >= 0');
  }
  if (options.tags) {
    for (const [k, v] of Object.entries(options.tags)) {
      if (typeof v !== 'string') {
        errors.push(`profilerTags.${k} must be a string`);
      }
    }
  }
  return errors;
}

export function getProfilerConfigSummary(options: ProfilerOptions): string {
  if (!options.enabled) return 'Profiler: disabled';
  const parts = ['Profiler: enabled'];
  if (options.minDurationMs) parts.push(`minDuration=${options.minDurationMs}ms`);
  if (options.tags) parts.push(`tags=${Object.keys(options.tags).join(',')}`);
  return parts.join(', ');
}
