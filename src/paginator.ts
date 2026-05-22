import type { SnapdiffConfig, EndpointConfig } from './types';

export interface PaginationOptions {
  pageParam: string;
  pageSizeParam?: string;
  pageSize?: number;
  maxPages?: number;
  startPage?: number;
}

export interface PagedResult {
  url: string;
  page: number;
}

export function buildPagedUrls(
  endpoint: EndpointConfig,
  options: PaginationOptions
): PagedResult[] {
  const {
    pageParam,
    pageSizeParam,
    pageSize,
    maxPages = 5,
    startPage = 1,
  } = options;

  const results: PagedResult[] = [];

  for (let page = startPage; page < startPage + maxPages; page++) {
    const url = new URL(endpoint.path, 'http://placeholder');
    url.searchParams.set(pageParam, String(page));
    if (pageSizeParam && pageSize !== undefined) {
      url.searchParams.set(pageSizeParam, String(pageSize));
    }
    // Reconstruct just the path + query
    const relative = url.pathname + url.search;
    results.push({ url: relative, page });
  }

  return results;
}

export function parsePaginationConfig(
  raw: Record<string, unknown>
): PaginationOptions | null {
  if (!raw || typeof raw !== 'object') return null;

  const pageParam = raw['pageParam'];
  if (typeof pageParam !== 'string' || !pageParam) return null;

  return {
    pageParam,
    pageSizeParam: typeof raw['pageSizeParam'] === 'string' ? raw['pageSizeParam'] : undefined,
    pageSize: typeof raw['pageSize'] === 'number' ? raw['pageSize'] : undefined,
    maxPages: typeof raw['maxPages'] === 'number' ? raw['maxPages'] : 5,
    startPage: typeof raw['startPage'] === 'number' ? raw['startPage'] : 1,
  };
}

export function getPaginationSummary(options: PaginationOptions): string {
  const parts: string[] = [`pageParam=${options.pageParam}`];
  if (options.pageSizeParam) parts.push(`pageSizeParam=${options.pageSizeParam}`);
  if (options.pageSize !== undefined) parts.push(`pageSize=${options.pageSize}`);
  parts.push(`maxPages=${options.maxPages ?? 5}`);
  parts.push(`startPage=${options.startPage ?? 1}`);
  return `Pagination(${parts.join(', ')})`;
}
