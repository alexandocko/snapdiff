import { flattenObject, getFlattenSummary } from './flatten';
import { parseFlattenConfig, validateFlattenConfig, getFlattenConfigSummary } from './flatten.config';

describe('flattenObject', () => {
  it('flattens a nested object with default options', () => {
    const input = { a: { b: { c: 1 } }, d: 2 };
    const { data } = flattenObject(input);
    expect(data).toEqual({ 'a.b.c': 1, d: 2 });
  });

  it('uses a custom delimiter', () => {
    const { data } = flattenObject({ x: { y: 3 } }, { delimiter: '/' });
    expect(data).toEqual({ 'x/y': 3 });
  });

  it('flattens arrays by index when preserveArrays is false', () => {
    const { data } = flattenObject({ items: [1, 2] });
    expect(data).toEqual({ 'items.0': 1, 'items.1': 2 });
  });

  it('preserves arrays when preserveArrays is true', () => {
    const { data } = flattenObject({ items: [1, 2] }, { preserveArrays: true });
    expect(data['items']).toEqual([1, 2]);
  });

  it('respects maxDepth and records truncated keys', () => {
    const input = { a: { b: { c: { d: 99 } } } };
    const result = flattenObject(input, { maxDepth: 2 });
    expect(result.truncatedKeys.length).toBeGreaterThan(0);
  });

  it('handles empty objects', () => {
    const { data, keyCount } = flattenObject({});
    expect(data).toEqual({});
    expect(keyCount).toBe(0);
  });

  it('handles primitive input', () => {
    const { data } = flattenObject(42);
    expect(data['']).toBe(42);
  });
});

describe('getFlattenSummary', () => {
  it('returns a summary string', () => {
    const result = flattenObject({ a: { b: 1 } });
    const summary = getFlattenSummary(result);
    expect(summary).toMatch(/keys=/);
    expect(summary).toMatch(/depth=/);
  });
});

describe('parseFlattenConfig', () => {
  it('returns disabled config when flatten key is absent', () => {
    expect(parseFlattenConfig({}).enabled).toBe(false);
  });

  it('parses enabled config with options', () => {
    const cfg = parseFlattenConfig({ flatten: { delimiter: '/', maxDepth: 8, preserveArrays: true } });
    expect(cfg.enabled).toBe(true);
    expect(cfg.options.delimiter).toBe('/');
    expect(cfg.options.maxDepth).toBe(8);
    expect(cfg.options.preserveArrays).toBe(true);
  });
});

describe('validateFlattenConfig', () => {
  it('returns no errors for valid config', () => {
    const cfg = parseFlattenConfig({ flatten: { delimiter: '.', maxDepth: 10 } });
    expect(validateFlattenConfig(cfg)).toEqual([]);
  });

  it('returns error for unsupported delimiter', () => {
    const cfg = parseFlattenConfig({ flatten: { delimiter: '|' } });
    const errors = validateFlattenConfig(cfg);
    expect(errors.some(e => e.includes('delimiter'))).toBe(true);
  });

  it('returns error for maxDepth out of range', () => {
    const cfg = parseFlattenConfig({ flatten: { maxDepth: 0 } });
    const errors = validateFlattenConfig(cfg);
    expect(errors.some(e => e.includes('maxDepth'))).toBe(true);
  });
});

describe('getFlattenConfigSummary', () => {
  it('returns disabled string when not enabled', () => {
    expect(getFlattenConfigSummary({ enabled: false, options: {} })).toContain('disabled');
  });

  it('returns config details when enabled', () => {
    const cfg = parseFlattenConfig({ flatten: { delimiter: '_' } });
    const summary = getFlattenConfigSummary(cfg);
    expect(summary).toContain('delimiter="_"');
  });
});
