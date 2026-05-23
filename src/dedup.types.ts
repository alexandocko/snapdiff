export interface DedupOptions {
  enabled: boolean;
  strategy: "hash" | "url" | "custom";
  customKey?: string;
  ttl?: number; // seconds
}

export interface DedupEntry {
  key: string;
  hash: string;
  url: string;
  seenAt: number; // epoch ms
  count: number;
}

export interface DedupResult {
  key: string;
  isDuplicate: boolean;
  original?: DedupEntry;
}

export interface DedupStats {
  total: number;
  duplicates: number;
  unique: number;
}
