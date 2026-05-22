import * as fs from "fs";
import * as path from "path";
import { Report } from "./types";

export type OutputFormat = "text" | "json" | "markdown";

export function writeOutput(
  report: Report,
  format: OutputFormat,
  outputPath?: string
): void {
  const content = formatOutput(report, format);
  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (dir && dir !== ".") {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, content, "utf-8");
  } else {
    process.stdout.write(content + "\n");
  }
}

export function formatOutput(report: Report, format: OutputFormat): string {
  switch (format) {
    case "json":
      return JSON.stringify(report, null, 2);
    case "markdown":
      return buildMarkdownReport(report);
    case "text":
    default:
      return buildPlainTextReport(report);
  }
}

function buildPlainTextReport(report: Report): string {
  const lines: string[] = [];
  lines.push(`Snapdiff Report — ${new Date(report.timestamp).toISOString()}`);
  lines.push(`Total endpoints: ${report.summary.total}`);
  lines.push(`  Matched : ${report.summary.matched}`);
  lines.push(`  Changed : ${report.summary.changed}`);
  lines.push(`  Missing : ${report.summary.missing}`);
  if (report.diffs.length > 0) {
    lines.push("");
    lines.push("Changes:");
    for (const diff of report.diffs) {
      lines.push(`  [${diff.status.toUpperCase()}] ${diff.endpoint}`);
    }
  }
  return lines.join("\n");
}

function buildMarkdownReport(report: Report): string {
  const lines: string[] = [];
  lines.push(`# Snapdiff Report`);
  lines.push(`**Generated:** ${new Date(report.timestamp).toISOString()}`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push(`| Status | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total | ${report.summary.total} |`);
  lines.push(`| Matched | ${report.summary.matched} |`);
  lines.push(`| Changed | ${report.summary.changed} |`);
  lines.push(`| Missing | ${report.summary.missing} |`);
  if (report.diffs.length > 0) {
    lines.push("");
    lines.push(`## Changes`);
    for (const diff of report.diffs) {
      lines.push(`- **[${diff.status.toUpperCase()}]** \`${diff.endpoint}\``);
    }
  }
  return lines.join("\n");
}
