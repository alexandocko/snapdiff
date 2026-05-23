import { sortResults, getSorterSummary } from './sorter';
import { parseSorterConfig, validateSorterConfig, getSorterConfigSummary } from './sorter.config';

const items = [
  { name: 'charlie', age: 30, score: null },
  { name: 'alice', age: 25, score: 90 },
  { name: 'bob', age: 35, score: 70 },
];

describe('sortResults', () => {
  it('sorts by a single string field asc', () => {
    const { sorted } = sortResults(items, { fields: [{ key: 'name', order: 'asc' }] });
    expect(sorted.map(i => i.name)).toEqual(['alice', 'bob', 'charlie']);
  });

  it('sorts by a single numeric field desc', () => {
    const { sorted } = sortResults(items, { fields: [{ key: 'age', order: 'desc' }] });
    expect(sorted.map(i => i.age)).toEqual([35, 30, 25]);
  });

  it('tracks applied and skipped fields', () => {
    const { appliedFields, skippedFields } = sortResults(items, {
      fields: [{ key: 'name', order: 'asc' }, { key: 'missing', order: 'asc' }],
    });
    expect(appliedFields).toContain('name');
    expect(skippedFields).toContain('missing');
  });

  it('handles nulls last by default', () => {
    const { sorted } = sortResults(items, { fields: [{ key: 'score', order: 'asc' }] });
    expect(sorted[sorted.length - 1].score).toBeNull();
  });

  it('handles nulls first when configured', () => {
    const { sorted } = sortResults(items, {
      fields: [{ key: 'score', order: 'asc' }],
      nullsFirst: true,
    });
    expect(sorted[0].score).toBeNull();
  });

  it('returns copy of items unchanged when no fields', () => {
    const { sorted } = sortResults(items, { fields: [] });
    expect(sorted).toEqual(items);
  });
});

describe('getSorterSummary', () => {
  it('describes configured fields', () => {
    const summary = getSorterSummary({ fields: [{ key: 'name', order: 'asc' }] });
    expect(summary).toContain('name:asc');
  });

  it('returns no-config message when empty', () => {
    expect(getSorterSummary({ fields: [] })).toMatch(/no sort fields/);
  });
});

describe('parseSorterConfig', () => {
  it('parses shorthand string fields', () => {
    const cfg = parseSorterConfig({ fields: ['name', 'age'] });
    expect(cfg.fields).toEqual([
      { key: 'name', order: 'asc' },
      { key: 'age', order: 'asc' },
    ]);
  });

  it('parses object fields with order', () => {
    const cfg = parseSorterConfig({ fields: [{ key: 'score', order: 'desc' }] });
    expect(cfg.fields[0]).toEqual({ key: 'score', order: 'desc' });
  });

  it('defaults to empty config for null input', () => {
    expect(parseSorterConfig(null)).toEqual({ fields: [] });
  });
});

describe('validateSorterConfig', () => {
  it('returns no errors for valid config', () => {
    const errors = validateSorterConfig({ fields: [{ key: 'name', order: 'asc' }] });
    expect(errors).toHaveLength(0);
  });

  it('reports invalid order values', () => {
    const errors = validateSorterConfig({ fields: [{ key: 'name', order: 'random' as any }] });
    expect(errors.some(e => e.includes('invalid order'))).toBe(true);
  });
});

describe('getSorterConfigSummary', () => {
  it('returns disabled when no fields', () => {
    expect(getSorterConfigSummary({ fields: [] })).toMatch(/disabled/);
  });

  it('lists fields with order', () => {
    const summary = getSorterConfigSummary({ fields: [{ key: 'name', order: 'desc' }] });
    expect(summary).toContain('name(desc)');
  });
});
