import { DiffResult } from './types';
import * as fs from 'fs';
import * as path from 'path';

export type ReportFormat = 'json' | 'text' | 'summary';

export interface ReportOptions {
  format: ReportFormat;
  outputPath?: string;
  includeUnchanged?: boolean;
}

export function generateReport(
  results: DiffResult[],
  options: ReportOptions
): string {
  const { format, includeUnchanged = false } = options;

  const filtered = includeUnchanged
    ? results
    : results.filter((r) => r.status !== 'unchanged');

  let output: string;

  switch (format) {
    case 'json':
      output = JSON.stringify(filtered, null, 2);
      break;
    case 'summary':
      output = buildSummary(filtered, results.length);
      break;
    case 'text':
    default:
      output = buildTextReport(filtered);
      break;
  }

  if (options.outputPath) {
    const dir = path.dirname(options.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(options.outputPath, output, 'utf-8');
  }

  return output;
}

function buildSummary(filtered: DiffResult[], total: number): string {
  const added = filtered.filter((r) => r.status === 'added').length;
  const removed = filtered.filter((r) => r.status === 'removed').length;
  const changed = filtered.filter((r) => r.status === 'changed').length;
  const unchanged = total - added - removed - changed;

  return [
    `Snapshot Diff Summary`,
    `---------------------`,
    `Total endpoints : ${total}`,
    `Changed         : ${changed}`,
    `Added           : ${added}`,
    `Removed         : ${removed}`,
    `Unchanged       : ${unchanged}`,
  ].join('\n');
}

function buildTextReport(results: DiffResult[]): string {
  if (results.length === 0) {
    return 'No differences found.';
  }
  return results
    .map((r) => {
      const lines = [`[${r.status.toUpperCase()}] ${r.endpoint}`];
      if (r.diff) {
        lines.push(r.diff);
      }
      return lines.join('\n');
    })
    .join('\n\n');
}
