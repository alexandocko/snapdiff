import { aggregateData, getAggregatorSummary } from './aggregator';
import { AggregatorConfig } from './aggregator.types';

const items = [
  { region: 'us', latency: 120, status: 200 },
  { region: 'us', latency: 80, status: 200 },
  { region: 'eu', latency: 200, status: 500 },
  { region: 'eu', latency: 150, status: 200 },
];

describe('aggregateData', () => {
  it('computes avg grouped by field', () => {
    const config: AggregatorConfig = {
      groupBy: ['region'],
      fields: [{ field: 'latency', op: 'avg', alias: 'avg_latency' }],
    };
    const results = aggregateData(items, config);
    expect(results).toHaveLength(2);
    const us = results.find(r => r.group['region'] === 'us')!;
    expect(us.values['avg_latency']).toBe(100);
  });

  it('computes sum without grouping', () => {
    const config: AggregatorConfig = {
      fields: [{ field: 'latency', op: 'sum' }],
    };
    const results = aggregateData(items, config);
    expect(results).toHaveLength(1);
    expect(results[0].values['sum_latency']).toBe(550);
  });

  it('computes min and max', () => {
    const config: AggregatorConfig = {
      fields: [
        { field: 'latency', op: 'min', alias: 'min_l' },
        { field: 'latency', op: 'max', alias: 'max_l' },
      ],
    };
    const [result] = aggregateData(items, config);
    expect(result.values['min_l']).toBe(80);
    expect(result.values['max_l']).toBe(200);
  });

  it('tracks count per group', () => {
    const config: AggregatorConfig = {
      groupBy: ['region'],
      fields: [{ field: 'latency', op: 'count' }],
    };
    const results = aggregateData(items, config);
    const eu = results.find(r => r.group['region'] === 'eu')!;
    expect(eu.count).toBe(2);
  });

  it('returns first and last values', () => {
    const config: AggregatorConfig = {
      fields: [
        { field: 'latency', op: 'first', alias: 'first_l' },
        { field: 'latency', op: 'last', alias: 'last_l' },
      ],
    };
    const [result] = aggregateData(items, config);
    expect(result.values['first_l']).toBe(120);
    expect(result.values['last_l']).toBe(150);
  });
});

describe('getAggregatorSummary', () => {
  it('returns summary string', () => {
    const config: AggregatorConfig = { fields: [{ field: 'latency', op: 'avg' }] };
    const results = aggregateData(items, config);
    expect(getAggregatorSummary(results)).toMatch(/1 group/);
  });
});
