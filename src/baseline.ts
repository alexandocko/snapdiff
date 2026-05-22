import * as fs from "fs";
import * as path from "path";
import { getCacheDir, ensureCacheDir } from "./cache";
import { computeHash } from "./snapshot";

export interface BaselineEntry {
  url: string;
  hash: string;
  capturedAt: string;
  label?: string;
}

export interface BaselineManifest {
  version: number;
  createdAt: string;
  entries: BaselineEntry[];
}

export function getBaselinePath(name: string): string {
  return path.join(getCacheDir(), `baseline-${name}.json`);
}

export function saveBaseline(name: string, entries: BaselineEntry[]): void {
  ensureCacheDir();
  const manifest: BaselineManifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    entries,
  };
  fs.writeFileSync(getBaselinePath(name), JSON.stringify(manifest, null, 2), "utf-8");
}

export function loadBaseline(name: string): BaselineManifest | null {
  const filePath = getBaselinePath(name);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as BaselineManifest;
  } catch {
    return null;
  }
}

export function buildBaselineEntry(
  url: string,
  body: unknown,
  label?: string
): BaselineEntry {
  return {
    url,
    hash: computeHash(body),
    capturedAt: new Date().toISOString(),
    label,
  };
}

export function diffAgainstBaseline(
  baseline: BaselineManifest,
  current: BaselineEntry[]
): { url: string; status: "unchanged" | "changed" | "new" | "removed" }[] {
  const baselineMap = new Map(baseline.entries.map((e) => [e.url, e.hash]));
  const currentMap = new Map(current.map((e) => [e.url, e.hash]));

  const results: { url: string; status: "unchanged" | "changed" | "new" | "removed" }[] = [];

  for (const [url, hash] of currentMap) {
    if (!baselineMap.has(url)) {
      results.push({ url, status: "new" });
    } else if (baselineMap.get(url) !== hash) {
      results.push({ url, status: "changed" });
    } else {
      results.push({ url, status: "unchanged" });
    }
  }

  for (const [url] of baselineMap) {
    if (!currentMap.has(url)) {
      results.push({ url, status: "removed" });
    }
  }

  return results;
}
