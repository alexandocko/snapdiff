import { diff } from "jest-diff";
import { Snapshot } from "./types";

export interface DiffResult {
  endpoint: string;
  hasChanges: boolean;
  summary: string;
  details: string | null;
  stagingHash: string;
  productionHash: string;
}

export function diffSnapshots(
  staging: Snapshot,
  production: Snapshot
): DiffResult {
  if (staging.endpoint !== production.endpoint) {
    throw new Error(
      `Endpoint mismatch: staging=${staging.endpoint}, production=${production.endpoint}`
    );
  }

  const hasChanges = staging.hash !== production.hash;

  if (!hasChanges) {
    return {
      endpoint: staging.endpoint,
      hasChanges: false,
      summary: `No changes detected for ${staging.endpoint}`,
      details: null,
      stagingHash: staging.hash,
      productionHash: production.hash,
    };
  }

  const stagingJson = JSON.stringify(staging.body, null, 2);
  const productionJson = JSON.stringify(production.body, null, 2);

  const diffOutput = diff(productionJson, stagingJson, {
    aAnnotation: "Production",
    bAnnotation: "Staging",
    expand: false,
  });

  return {
    endpoint: staging.endpoint,
    hasChanges: true,
    summary: `Changes detected for ${staging.endpoint} (staging: ${staging.hash.slice(0, 8)}, production: ${production.hash.slice(0, 8)})`,
    details: diffOutput ?? null,
    stagingHash: staging.hash,
    productionHash: production.hash,
  };
}

export function formatDiffResults(results: DiffResult[]): string {
  const changed = results.filter((r) => r.hasChanges);
  const unchanged = results.filter((r) => !r.hasChanges);

  const lines: string[] = [];
  lines.push(`=== snapdiff report ===`);
  lines.push(`Total endpoints: ${results.length}`);
  lines.push(`Changed: ${changed.length} | Unchanged: ${unchanged.length}`);
  lines.push("");

  for (const result of changed) {
    lines.push(`--- ${result.summary} ---`);
    if (result.details) {
      lines.push(result.details);
    }
    lines.push("");
  }

  if (unchanged.length > 0) {
    lines.push("Unchanged endpoints:");
    for (const result of unchanged) {
      lines.push(`  ✓ ${result.endpoint}`);
    }
  }

  return lines.join("\n");
}
