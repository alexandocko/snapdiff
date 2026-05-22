import { describe, it, expect } from 'vitest';
import {
  parseTransformConfig,
  getTransformSummary,
  TransformConfigSchema,
} from './transform.config';

describe('parseTransformConfig', () => {
  it('parses a valid config with all fields', () => {
    const result = parseTransformConfig({
      stripFields: ['ts', 'updatedAt'],
      maskFields: ['token'],
      sortArrays: true,
      maskValue: '[HIDDEN]',
    });
    expect(result.stripFields).toEqual(['ts', 'updatedAt']);
    expect(result.maskValue).toBe('[HIDDEN]');
    expect(result.sortArrays).toBe(true);
  });

  it('applies defaults for missing fields', () => {
    const result = parseTransformConfig({});
    expect(result.stripFields).toEqual([]);
    expect(result.maskFields).toEqual([]);
    expect(result.sortArrays).toBe(false);
    expect(result.maskValue).toBe('***');
  });

  it('throws on invalid stripFields type', () => {
    expect(() =>
      parseTransformConfig({ stripFields: 'not-an-array' as unknown as string[] })
    ).toThrow('Invalid transform config');
  });

  it('throws on invalid sortArrays type', () => {
    expect(() =>
      parseTransformConfig({ sortArrays: 'yes' as unknown as boolean })
    ).toThrow('Invalid transform config');
  });
});

describe('getTransformSummary', () => {
  it('returns "no transforms" when nothing is configured', () => {
    const config = TransformConfigSchema.parse({});
    expect(getTransformSummary(config)).toBe('no transforms');
  });

  it('includes strip info', () => {
    const config = TransformConfigSchema.parse({ stripFields: ['ts'] });
    expect(getTransformSummary(config)).toContain('strip: [ts]');
  });

  it('includes mask info with mask value', () => {
    const config = TransformConfigSchema.parse({
      maskFields: ['token'],
      maskValue: '[X]',
    });
    expect(getTransformSummary(config)).toContain('mask: [token] → "[X]"');
  });

  it('includes sortArrays info', () => {
    const config = TransformConfigSchema.parse({ sortArrays: true });
    expect(getTransformSummary(config)).toContain('sortArrays: true');
  });

  it('combines multiple transforms', () => {
    const config = TransformConfigSchema.parse({
      stripFields: ['ts'],
      sortArrays: true,
    });
    const summary = getTransformSummary(config);
    expect(summary).toContain('strip');
    expect(summary).toContain('sortArrays');
  });
});
