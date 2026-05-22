import { describe, it, expect } from 'vitest';
import {
  buildPagedUrls,
  parsePaginationConfig,
  getPaginationSummary,
} from './paginator';
import type { EndpointConfig } from './types';

const endpoint: EndpointConfig = {
  path: '/api/items',
  method: 'GET',
};

describe('buildPagedUrls', () => {
  it('generates correct number of pages', () => {
    const results = buildPagedUrls(endpoint, { pageParam: 'page', maxPages: 3 });
    expect(results).toHaveLength(3);
  });

  it('sets page param correctly', () => {
    const results = buildPagedUrls(endpoint, { pageParam: 'page', maxPages: 2, startPage: 1 });
    expect(results[0].url).toContain('page=1');
    expect(results[1].url).toContain('page=2');
  });

  it('includes pageSize param when provided', () => {
    const results = buildPagedUrls(endpoint, {
      pageParam: 'page',
      pageSizeParam: 'limit',
      pageSize: 20,
      maxPages: 1,
    });
    expect(results[0].url).toContain('limit=20');
  });

  it('respects custom startPage', () => {
    const results = buildPagedUrls(endpoint, { pageParam: 'p', maxPages: 2, startPage: 5 });
    expect(results[0].page).toBe(5);
    expect(results[1].page).toBe(6);
  });
});

describe('parsePaginationConfig', () => {
  it('returns null for invalid input', () => {
    expect(parsePaginationConfig({})).toBeNull();
    expect(parsePaginationConfig(null as any)).toBeNull();
  });

  it('parses valid config', () => {
    const result = parsePaginationConfig({ pageParam: 'page', maxPages: 10, pageSize: 25, pageSizeParam: 'limit' });
    expect(result).not.toBeNull();
    expect(result?.pageParam).toBe('page');
    expect(result?.maxPages).toBe(10);
    expect(result?.pageSize).toBe(25);
  });

  it('uses defaults for optional fields', () => {
    const result = parsePaginationConfig({ pageParam: 'page' });
    expect(result?.maxPages).toBe(5);
    expect(result?.startPage).toBe(1);
    expect(result?.pageSizeParam).toBeUndefined();
  });
});

describe('getPaginationSummary', () => {
  it('includes all relevant fields', () => {
    const summary = getPaginationSummary({ pageParam: 'page', pageSizeParam: 'limit', pageSize: 10, maxPages: 3, startPage: 1 });
    expect(summary).toContain('pageParam=page');
    expect(summary).toContain('pageSizeParam=limit');
    expect(summary).toContain('pageSize=10');
    expect(summary).toContain('maxPages=3');
  });
});
