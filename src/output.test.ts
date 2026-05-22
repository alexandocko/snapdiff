import { formatOutput, writeOutput, OutputFormat } from "./output";
import { Report } from "./types";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const mockReport: Report = {
  timestamp: 1700000000000,
  summary: { total: 3, matched: 1, changed: 1, missing: 1 },
  diffs: [
    { endpoint: "/api/users", status: "changed", diff: [] },
    { endpoint: "/api/orders", status: "missing", diff: [] },
  ],
};

describe("formatOutput", () => {
  it("returns valid JSON for json format", () => {
    const result = formatOutput(mockReport, "json");
    const parsed = JSON.parse(result);
    expect(parsed.summary.total).toBe(3);
  });

  it("includes summary counts in text format", () => {
    const result = formatOutput(mockReport, "text");
    expect(result).toContain("Total endpoints: 3");
    expect(result).toContain("Changed : 1");
    expect(result).toContain("Missing : 1");
  });

  it("lists changed endpoints in text format", () => {
    const result = formatOutput(mockReport, "text");
    expect(result).toContain("[CHANGED] /api/users");
    expect(result).toContain("[MISSING] /api/orders");
  });

  it("produces markdown headers", () => {
    const result = formatOutput(mockReport, "markdown");
    expect(result).toContain("# Snapdiff Report");
    expect(result).toContain("## Summary");
    expect(result).toContain("## Changes");
  });

  it("markdown contains table rows", () => {
    const result = formatOutput(mockReport, "markdown");
    expect(result).toContain("| Total | 3 |");
    expect(result).toContain("| Changed | 1 |");
  });

  it("defaults to text format for unknown format", () => {
    const result = formatOutput(mockReport, "text");
    expect(result).toContain("Snapdiff Report");
  });
});

describe("writeOutput", () => {
  it("writes file to specified path", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "snapdiff-"));
    const outPath = path.join(tmpDir, "report.json");
    writeOutput(mockReport, "json", outPath);
    const content = fs.readFileSync(outPath, "utf-8");
    const parsed = JSON.parse(content);
    expect(parsed.summary.total).toBe(3);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("creates nested directories if needed", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "snapdiff-"));
    const outPath = path.join(tmpDir, "nested", "dir", "report.txt");
    writeOutput(mockReport, "text", outPath);
    expect(fs.existsSync(outPath)).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });
});
