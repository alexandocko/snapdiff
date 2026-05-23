import { parseAggregatorConfig, validateAggregatorConfig, getAggregatorConfigSummary } from './aggregator.config';

describe('parseAggregatorConfig', () => {
  it('parses valid config', () => {
    const raw = { fields: [{ field: 'latency', op: 'avg', alias: 'avg_l' }], groupBy: ['region'] };
    const config = parseAggregatorConfig(raw);
    expect(config.fields).toHaveLength(1);
    expect(config.fields[0].alias).toBe('avg_l');
    expect(config.groupBy).toEqual(['region']);
  });

  it('throws on missing fields', () => {
    expect(() => parseAggregatorConfig({ fields: [] })).toThrow('at least one field');
  });

  it('throws on invalid op', () => {
    expect(() => parseAggregatorConfig({ fields: [{ field: 'x', op: 'median' }] })).toThrow('op must be one of');
  });

  it('throws on non-object input', () => {
    expect(() => parseAggregatorConfig(null)).toThrow('must be an object');
  });

  it('throws on non-string groupBy entry', () => {
    expect(() => parseAggregatorConfig({ fields: [{ field: 'x', op: 'sum' }], groupBy: [42] })).toThrow('groupBy[0] must be a string');
  });
});

describe('validateAggregatorConfig', () => {
  it('returns no errors for valid config', () => {
    const config = parseAggregatorConfig({ fields: [{ field: 'latency', op: 'sum' }] });
    expect(validateAggregatorConfig(config)).toHaveLength(0);
  });

  it('returns error for empty field name', () => {
    const errors = validateAggregatorConfig({ fields: [{ field: '', op: 'sum' }] });
    expect(errors).toContain('Aggregate field name cannot be empty');
  });
});

describe('getAggregatorConfigSummary', () => {
  it('includes op and field in summary', () => {
    const config = parseAggregatorConfig({ fields: [{ field: 'latency', op: 'avg' }], groupBy: ['region'] });
    const summary = getAggregatorConfigSummary(config);
    expect(summary).toContain('avg(latency)');
    expect(summary).toContain('region');
  });

  it('omits group clause when no groupBy', () => {
    const config = parseAggregatorConfig({ fields: [{ field: 'score', op: 'max' }] });
    expect(getAggregatorConfigSummary(config)).not.toContain('grouped');
  });
});
