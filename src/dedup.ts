import { createHash } from "crypto";
import type { DedupEntry, DedupOptions, DedupResult, DedupStats } from "./dedup.types";

const store = new Map<string, DedupEntry>();

export function buildDedupKey(url: string, body: unknown, options: DedupOptions): string {
  if (options.strategy === "url") {
    return url;
  }
  if (options.strategy === "custom" && options.customKey) {
    return options.customKey;
  }
  // default: hash
  const payload = JSON.stringify({ url, body });
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function checkDuplicate(key: string, hash: string, url: string, options: DedupOptions): DedupResult {
  const now = Date.now();
  const existing = store.get(key);

  if (existing) {
    const expired = options.ttl != null && now - existing.seenAt > options.ttl * 1000;
    if (!expired && existing.hash === hash) {
      existing.count += 1;
      return { key, isDuplicate: true, original: existing };
    }
  }

  const entry: DedupEntry = { key, hash, url, seenAt: now, count: 1 };
  store.set(key, entry);
  return { key, isDuplicate: false };
}

export function clearDedupStore(): void {
  store.clear();
}

export function getDedupStats(): DedupStats {
  let duplicates = 0;
  let total = 0;
  for (const entry of store.values()) {
    total += entry.count;
    duplicates += entry.count - 1;
  }
  return { total, duplicates, unique: store.size };
}

export function formatDedupStats(stats: DedupStats): string {
  return `dedup: ${stats.unique} unique, ${stats.duplicates} duplicate(s) skipped out of ${stats.total} total`;
}
