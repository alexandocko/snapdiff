import { RedactConfig, RedactSummary } from './redact.types';

const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'access_token',
  'refresh_token',
];

export function parseRedactConfig(raw: Record<string, unknown>): RedactConfig {
  const fields = Array.isArray(raw.fields)
    ? (raw.fields as string[])
    : DEFAULT_SENSITIVE_FIELDS;

  const patterns = Array.isArray(raw.patterns)
    ? (raw.patterns as string[])
    : [];

  return {
    fields,
    patterns,
    replacement: typeof raw.replacement === 'string' ? raw.replacement : '[REDACTED]',
    recursive: raw.recursive !== false,
  };
}

export function getRedactSummary(config: RedactConfig): RedactSummary {
  return {
    enabled: (config.fields?.length ?? 0) > 0 || (config.patterns?.length ?? 0) > 0,
    fieldCount: config.fields?.length ?? 0,
    patternCount: config.patterns?.length ?? 0,
    replacement: config.replacement ?? '[REDACTED]',
  };
}

export function validateRedactConfig(config: RedactConfig): string[] {
  const errors: string[] = [];

  if (config.fields) {
    for (const field of config.fields) {
      if (typeof field !== 'string' || field.trim() === '') {
        errors.push(`Invalid redact field: ${JSON.stringify(field)}`);
      }
    }
  }

  if (config.patterns) {
    for (const pattern of config.patterns) {
      try {
        new RegExp(pattern);
      } catch {
        errors.push(`Invalid redact pattern: ${pattern}`);
      }
    }
  }

  return errors;
}
