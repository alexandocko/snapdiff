import { describe, it, expect } from 'vitest';
import {
  stripFields,
  maskFields,
  sortArraysDeep,
  applyTransforms,
} from './transform';
import { SnapshotData } from './types';

const makeSnapshot = (data: unknown): SnapshotData => ({
  url: 'https://example.com/api',
  data,
  hash: 'abc123',
  timestamp: Date.now(),
});

describe('stripFields', () => {
  it('removes top-level fields', () => {
    const result = stripFields({ a: 1, b: 2, c: 3 }, ['b']);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('removes nested fields recursively', () => {
    const result = stripFields({ a: { b: 1, c: 2 }, d: 3 }, ['b']);
    expect(result).toEqual({ a: { c: 2 }, d: 3 });
  });

  it('removes fields inside arrays', () => {
    const result = stripFields([{ id: 1, secret: 'x' }, { id: 2, secret: 'y' }], ['secret']);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('returns primitives unchanged', () => {
    expect(stripFields(42, ['a'])).toBe(42);
  });
});

describe('maskFields', () => {
  it('replaces field values with mask', () => {
    const result = maskFields({ token: 'secret', name: 'alice' }, ['token'], '***');
    expect(result).toEqual({ token: '***', name: 'alice' });
  });

  it('uses custom mask value', () => {
    const result = maskFields({ pw: '1234' }, ['pw'], '[REDACTED]');
    expect(result).toEqual({ pw: '[REDACTED]' });
  });

  it('masks fields inside arrays', () => {
    const result = maskFields([{ pw: 'a' }, { pw: 'b' }], ['pw'], '***');
    expect(result).toEqual([{ pw: '***' }, { pw: '***' }]);
  });
});

describe('sortArraysDeep', () => {
  it('sorts a flat array of primitives', () => {
    expect(sortArraysDeep([3, 1, 2])).toEqual([1, 2, 3]);
  });

  it('sorts arrays of objects by JSON representation', () => {
    const input = [{ id: 2 }, { id: 1 }];
    const result = sortArraysDeep(input) as { id: number }[];
    expect(result[0].id).toBe(1);
  });
});

describe('applyTransforms', () => {
  it('applies strip and mask together', () => {
    const snap = makeSnapshot({ id: 1, ts: 'now', token: 'abc' });
    const result = applyTransforms(snap, { stripFields: ['ts'], maskFields: ['token'] });
    expect(result.data).toEqual({ id: 1, token: '***' });
  });

  it('does not mutate original snapshot', () => {
    const snap = makeSnapshot({ a: 1 });
    applyTransforms(snap, { stripFields: ['a'] });
    expect((snap.data as Record<string, unknown>).a).toBe(1);
  });
});
