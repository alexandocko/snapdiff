import {
  parseRedactConfig,
  getRedactSummary,
  validateRedactConfig,
} from './redact.config';

describe('parseRedactConfig', () => {
  it('uses provided fields and patterns', () => {
    const config = parseRedactConfig({
      fields: ['token', 'key'],
      patterns: ['\\d{4}-\\d{4}'],
      replacement: '***',
    });
    expect(config.fields).toEqual(['token', 'key']);
    expect(config.patterns).toEqual(['\\d{4}-\\d{4}']);
    expect(config.replacement).toBe('***');
  });

  it('falls back to default sensitive fields when none provided', () => {
    const config = parseRedactConfig({});
    expect(config.fields).toContain('password');
    expect(config.fields).toContain('token');
    expect(config.replacement).toBe('[REDACTED]');
  });

  it('defaults recursive to true', () => {
    const config = parseRedactConfig({});
    expect(config.recursive).toBe(true);
  });

  it('respects recursive: false', () => {
    const config = parseRedactConfig({ recursive: false });
    expect(config.recursive).toBe(false);
  });
});

describe('getRedactSummary', () => {
  it('reports enabled when fields are configured', () => {
    const summary = getRedactSummary({ fields: ['token'], patterns: [] });
    expect(summary.enabled).toBe(true);
    expect(summary.fieldCount).toBe(1);
  });

  it('reports disabled when no fields or patterns', () => {
    const summary = getRedactSummary({ fields: [], patterns: [] });
    expect(summary.enabled).toBe(false);
  });
});

describe('validateRedactConfig', () => {
  it('returns no errors for valid config', () => {
    const errors = validateRedactConfig({
      fields: ['password'],
      patterns: ['\\d+'],
    });
    expect(errors).toHaveLength(0);
  });

  it('returns error for invalid regex pattern', () => {
    const errors = validateRedactConfig({
      fields: [],
      patterns: ['[invalid('],
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/Invalid redact pattern/);
  });

  it('returns error for empty string field', () => {
    const errors = validateRedactConfig({ fields: [''] });
    expect(errors.length).toBeGreaterThan(0);
  });
});
