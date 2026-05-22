import { DiffResult } from "./types";

export type FilterOptions = {
  status?: "added" | "removed" | "changed" | "unchanged";
  pathPrefix?: string;
  minSeverity?: "low" | "medium" | "high";
};

const severityRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function filterDiffResults(
  results: DiffResult[],
  options: FilterOptions
): DiffResult[] {
  let filtered = [...results];

  if (options.status) {
    filtered = filtered.filter((r) => r.status === options.status);
  }

  if (options.pathPrefix) {
    const prefix = options.pathPrefix.toLowerCase();
    filtered = filtered.filter((r) =>
      r.path.toLowerCase().startsWith(prefix)
    );
  }

  if (options.minSeverity) {
    const minRank = severityRank[options.minSeverity] ?? 0;
    filtered = filtered.filter((r) => {
      const rank = severityRank[r.severity ?? "low"] ?? 0;
      return rank >= minRank;
    });
  }

  return filtered;
}

export function groupByStatus(
  results: DiffResult[]
): Record<string, DiffResult[]> {
  return results.reduce<Record<string, DiffResult[]>>((acc, result) => {
    const key = result.status ?? "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {});
}
