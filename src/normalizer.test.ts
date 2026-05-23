import { normalizeData, getNormalizerSummary } from './normalizer';
import { NormalizerConfig } from './normalizer.types';

describe('normalizeData', () => {
  it('trims string values when trimStrings is enabled', () => {
    const { data, changes } = normalizeData({ name: '  alice  ' }, { trimStrings: true });
    expect((data as any).name).toBe('alice');
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe('trim');
  });

  it('lowercases object keys when lowercaseKeys is enabled', () => {
    const { data, changes } = normalizeData({ Name: 'alice', AGE: 30 }, { lowercaseKeys: true });
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('age');
    expect(changes.every(c => c.type === 'lowercase_key')).toBe(true);
  });

  it('removes null fields when removeNullFields is enabled', () => {
    const { data, changes } = normalizeData({ a: 1, b: null }, { removeNullFields: true });
    expect(data).not.toHaveProperty('b');
    expect(changes[0].type).toBe('remove_null');
  });

  it('removes empty arrays when removeEmptyArrays is enabled', () => {
    const { data } = normalizeData({ items: [] }, { removeEmptyArrays: true });
    expect((data as any).items).toBeUndefined();
  });

  it('coerces numeric strings when coerceNumbers is enabled', () => {
    const { data, changes } = normalizeData({ count: '42' }, { coerceNumbers: true });
    expect((data as any).count).toBe(42);
    expect(changes[0].type).toBe('coerce_number');
  });

  it('handles nested objects recursively', () => {
    const input = { user: { name: '  bob  ', score: '99' } };
    const { data } = normalizeData(input, { trimStrings: true, coerceNumbers: true });
    expect((data as any).user.name).toBe('bob');
    expect((data as any).user.score).toBe(99);
  });

  it('handles arrays of objects', () => {
    const input = [{ val: '  x  ' }, { val: '  y  ' }];
    const { data } = normalizeData(input, { trimStrings: true });
    expect((data as any)[0].val).toBe('x');
    expect((data as any)[1].val).toBe('y');
  });

  it('returns no changes when no options are set', () => {
    const { data, changes } = normalizeData({ a: 1 }, {});
    expect(data).toEqual({ a: 1 });
    expect(changes).toHaveLength(0);
  });
});

describe('getNormalizerSummary', () => {
  it('lists enabled flags', () => {
    const config: NormalizerConfig = { trimStrings: true, removeNullFields: true };
    expect(getNormalizerSummary(config)).toBe('normalizer: [trim-strings, remove-nulls]');
  });

  it('returns disabled when no flags set', () => {
    expect(getNormalizerSummary({})).toBe('normalizer: disabled');
  });
});
