import { buildGroupKey, groupItems, getGrouperSummary } from './grouper';

const items = [
  { env: 'prod', status: 'ok', id: 1 },
  { env: 'prod', status: 'fail', id: 2 },
  { env: 'staging', status: 'ok', id: 3 },
  { env: 'prod', status: 'ok', id: 4 },
];

describe('buildGroupKey', () => {
  it('builds key from single field', () => {
    expect(buildGroupKey({ env: 'prod' }, ['env'])).toBe('prod');
  });

  it('builds composite key from multiple fields', () => {
    expect(buildGroupKey({ env: 'prod', status: 'ok' }, ['env', 'status'])).toBe('prod|ok');
  });

  it('uses __undefined__ for missing fields', () => {
    expect(buildGroupKey({ env: 'prod' }, ['env', 'status'])).toBe('prod|__undefined__');
  });
});

describe('groupItems', () => {
  it('groups by single field', () => {
    const result = groupItems(items, { groupBy: 'env' });
    const keys = result.map((g) => g.key).sort();
    expect(keys).toEqual(['prod', 'staging']);
    const prod = result.find((g) => g.key === 'prod');
    expect(prod?.count).toBe(3);
  });

  it('groups by multiple fields', () => {
    const result = groupItems(items, { groupBy: ['env', 'status'] });
    expect(result.length).toBe(3);
  });

  it('respects maxGroupSize', () => {
    const result = groupItems(items, { groupBy: 'env', maxGroupSize: 2 });
    const prod = result.find((g) => g.key === 'prod');
    expect(prod?.items.length).toBe(2);
  });

  it('excludes ungrouped when includeUngrouped is false', () => {
    const mixed = [...items, { id: 99 } as Record<string, unknown>];
    const result = groupItems(mixed as any, { groupBy: 'env', includeUngrouped: false });
    const hasUndefined = result.some((g) => g.key.includes('__undefined__'));
    expect(hasUndefined).toBe(false);
  });
});

describe('getGrouperSummary', () => {
  it('returns correct summary', () => {
    const groups = groupItems(items, { groupBy: 'env' });
    const summary = getGrouperSummary(groups);
    expect(summary.totalGroups).toBe(2);
    expect(summary.totalItems).toBe(4);
    expect(summary.largestGroup).toBe(3);
    expect(summary.ungroupedCount).toBe(0);
  });

  it('includes ungrouped count', () => {
    const groups = groupItems(items, { groupBy: 'env' });
    const summary = getGrouperSummary(groups, 5);
    expect(summary.ungroupedCount).toBe(5);
  });
});
