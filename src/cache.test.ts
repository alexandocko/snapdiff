import * as fs from 'fs';
import * as path from 'path';
import {
  cacheKey,
  writeCache,
  readCache,
  clearCache,
  getCacheDir,
} from './cache';

const TEST_URL = 'https://api.example.com/users';
const TEST_ENV = 'staging';

afterEach(() => {
  clearCache();
});

describe('cacheKey', () => {
  it('returns a string containing the env prefix', () => {
    const key = cacheKey(TEST_URL, TEST_ENV);
    expect(key.startsWith('staging-')).toBe(true);
    expect(key.endsWith('.json')).toBe(true);
  });

  it('returns different keys for different envs', () => {
    const a = cacheKey(TEST_URL, 'staging');
    const b = cacheKey(TEST_URL, 'production');
    expect(a).not.toBe(b);
  });

  it('returns different keys for different urls', () => {
    const a = cacheKey('https://api.example.com/a', TEST_ENV);
    const b = cacheKey('https://api.example.com/b', TEST_ENV);
    expect(a).not.toBe(b);
  });
});

describe('writeCache / readCache', () => {
  it('writes and reads back a cache entry', () => {
    const body = { id: 1, name: 'Alice' };
    writeCache(TEST_URL, TEST_ENV, body);
    const entry = readCache(TEST_URL, TEST_ENV);
    expect(entry).not.toBeNull();
    expect(entry!.body).toEqual(body);
    expect(entry!.env).toBe(TEST_ENV);
    expect(entry!.url).toBe(TEST_URL);
  });

  it('returns null when entry is older than maxAgeMs', () => {
    writeCache(TEST_URL, TEST_ENV, { ok: true });
    const entry = readCache(TEST_URL, TEST_ENV, 0);
    expect(entry).toBeNull();
  });

  it('returns null when no cache file exists', () => {
    const entry = readCache('https://no-such-url.example.com', TEST_ENV);
    expect(entry).toBeNull();
  });
});

describe('clearCache', () => {
  it('removes all cached files', () => {
    writeCache(TEST_URL, 'staging', { a: 1 });
    writeCache(TEST_URL, 'production', { b: 2 });
    clearCache();
    const files = fs.existsSync(getCacheDir())
      ? fs.readdirSync(getCacheDir())
      : [];
    expect(files).toHaveLength(0);
  });

  it('does not throw when cache dir does not exist', () => {
    expect(() => clearCache()).not.toThrow();
  });
});
