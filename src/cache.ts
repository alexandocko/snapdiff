import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const CACHE_DIR = '.snapdiff-cache';

export function getCacheDir(): string {
  return path.resolve(process.cwd(), CACHE_DIR);
}

export function ensureCacheDir(): void {
  const dir = getCacheDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function cacheKey(url: string, env: string): string {
  const hash = crypto.createHash('sha1').update(`${env}:${url}`).digest('hex').slice(0, 12);
  return `${env}-${hash}.json`;
}

export interface CacheEntry {
  url: string;
  env: string;
  body: unknown;
  cachedAt: string;
}

export function writeCache(url: string, env: string, body: unknown): void {
  ensureCacheDir();
  const key = cacheKey(url, env);
  const entry: CacheEntry = {
    url,
    env,
    body,
    cachedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(getCacheDir(), key), JSON.stringify(entry, null, 2), 'utf-8');
}

export function readCache(url: string, env: string, maxAgeMs = 60_000): CacheEntry | null {
  const key = cacheKey(url, env);
  const filePath = path.join(getCacheDir(), key);
  if (!fs.existsSync(filePath)) return null;
  const entry: CacheEntry = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const age = Date.now() - new Date(entry.cachedAt).getTime();
  if (age > maxAgeMs) return null;
  return entry;
}

export function clearCache(): void {
  const dir = getCacheDir();
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    fs.unlinkSync(path.join(dir, file));
  }
}
