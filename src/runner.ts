/**
 * runner.ts
 *
 * Orchestrates the full snapdiff pipeline: fetch, transform, diff, validate,
 * report, notify, and hook execution. Called by the CLI entry point.
 */

import { loadConfig } from "./config";
import { loadSnapshot } from "./snapshot";
import { diffSnapshots, formatDiffResults } from "./differ";
import { generateReport } from "./reporter";
import { filterDiffResults } from "./filter";
import { writeOutput } from "./output";
import { applyTransforms } from "./transform";
import { buildAuthHeaders } from "./auth";
import { buildPagedUrls } from "./paginator";
import { saveBaseline, diffAgainstBaseline } from "./baseline";
import { validateSchema } from "./schema";
import { redactData } from "./redact";
import { recordMetric, buildMetricsReport } from "./metrics";
import { buildNotifyPayload, postJson } from "./notify";
import { runHook } from "./hooks";
import { startTimer, stopTimer, formatDuration } from "./duration";
import { applyEnvOverrides } from "./env";
import { createThrottle } from "./throttle";
import { resolveCliOptions } from "./cli.config";
import type { SnapdiffConfig, RunOptions, RunResult } from "./types";

/**
 * Execute the full snapdiff pipeline for a given config and CLI options.
 */
export async function runPipeline(
  configPath: string,
  cliArgs: Partial<RunOptions> = {}
): Promise<RunResult> {
  startTimer("total");

  // Load and merge configuration
  const rawConfig = await loadConfig(configPath);
  const config: SnapdiffConfig = applyEnvOverrides(rawConfig);
  const options = resolveCliOptions(config, cliArgs);

  await runHook("before", config);

  const throttle = createThrottle(options.throttle);
  const authHeaders = buildAuthHeaders(config.auth);

  const endpoints = buildPagedUrls(config.endpoints, options.pagination);

  const results: RunResult["diffs"] = [];

  for (const endpoint of endpoints) {
    startTimer(`fetch:${endpoint.name}`);

    await throttle.acquire();

    // Fetch snapshots from both environments
    const [stagingSnap, productionSnap] = await Promise.all([
      loadSnapshot(endpoint, config.staging, authHeaders, options),
      loadSnapshot(endpoint, config.production, authHeaders, options),
    ]);

    stopTimer(`fetch:${endpoint.name}`);
    recordMetric("fetch", endpoint.name, {
      duration: stopTimer(`fetch:${endpoint.name}`) ?? 0,
    });

    // Apply transforms and redaction
    const stagingData = redactData(
      applyTransforms(stagingSnap.data, config.transforms),
      config.redact
    );
    const productionData = redactData(
      applyTransforms(productionSnap.data, config.transforms),
      config.redact
    );

    // Diff the two snapshots
    const rawDiffs = diffSnapshots(stagingData, productionData, endpoint);
    const filtered = filterDiffResults(rawDiffs, options.filter);
    const formatted = formatDiffResults(filtered);

    // Optional schema validation
    if (config.schema) {
      const violations = validateSchema(stagingData, config.schema);
      recordMetric("schema", endpoint.name, { violations: violations.length });
      formatted.schemaViolations = violations;
    }

    // Optional baseline comparison
    if (options.baseline?.enabled) {
      const baselineDiff = await diffAgainstBaseline(endpoint.name, stagingData, options.baseline);
      formatted.baselineDiff = baselineDiff;
      if (options.baseline.save) {
        await saveBaseline(endpoint.name, stagingData, options.baseline);
      }
    }

    results.push({ endpoint: endpoint.name, ...formatted });
    recordMetric("diffs", endpoint.name, { count: filtered.length });
  }

  // Generate and write report
  const report = generateReport(results, options);
  await writeOutput(report, options.output);

  // Send notifications if configured
  if (config.notify?.url) {
    const payload = buildNotifyPayload(results, config.notify);
    await postJson(config.notify.url, payload, authHeaders);
  }

  await runHook("after", config);

  const totalMs = stopTimer("total") ?? 0;
  const metricsReport = buildMetricsReport();

  return {
    diffs: results,
    summary: report.summary,
    metrics: metricsReport,
    duration: formatDuration(totalMs),
    exitCode: results.some((r) => r.hasDiffs) ? 1 : 0,
  };
}
