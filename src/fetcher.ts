import fetch from 'node-fetch';
import { writeCache, readCache } from './cache';

export interface FetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  useCache?: boolean;
  cacheMaxAgeMs?: number;
}

export interface FetchResult {
  url: string;
  env: string;
  status: number;
  body: unknown;
  durationMs: number;
  fromCache: boolean;
}

export async function fetchEndpoint(
  url: string,
  env: string,
  options: FetchOptions = {}
): Promise<FetchResult> {
  const {
    headers = {},
    timeoutMs = 10_000,
    useCache = false,
    cacheMaxAgeMs = 60_000,
  } = options;

  if (useCache) {
    const cached = readCache(url, env, cacheMaxAgeMs);
    if (cached) {
      return {
        url,
        env,
        status: 200,
        body: cached.body,
        durationMs: 0,
        fromCache: true,
      };
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal as never,
    });
    const durationMs = Date.now() - start;
    const body = await response.json().catch(() => null);

    if (useCache && response.ok) {
      writeCache(url, env, body);
    }

    return { url, env, status: response.status, body, durationMs, fromCache: false };
  } finally {
    clearTimeout(timer);
  }
}
