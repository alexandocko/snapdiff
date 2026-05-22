import * as fs from "fs";
import * as path from "path";
import {
  buildBaselineEntry,
  saveBaseline,
  loadBaseline,
  diffAgainstBaseline,
  getBaselinePath,
  BaselineManifest,
} from "./baseline";
import { parseBaselineOptions, validateBaselineOptions, getBaselineSummary } from "./baseline.config";

jest.mock("./cache", () => ({
  getCacheDir: () => "/tmp/snapdiff-test-cache",
  ensureCacheDir: jest.fn(),
}));

jest.mock("fs");

const mockFs = fs as jest.Mocked<typeof fs>;

describe("buildBaselineEntry", () => {
  it("returns an entry with hash and url", () => {
    const entry = buildBaselineEntry("https://api.example.com/users", { id: 1 }, "prod");
    expect(entry.url).toBe("https://api.example.com/users");
    expect(typeof entry.hash).toBe("string");
    expect(entry.hash.length).toBeGreaterThan(0);
    expect(entry.label).toBe("prod");
  });
});

describe("saveBaseline / loadBaseline", () => {
  it("saves and loads a manifest", () => {
    const entries = [buildBaselineEntry("https://api.example.com/items", [1, 2, 3])];
    let written = "";
    mockFs.writeFileSync.mockImplementation((_p, data) => { written = data as string; });
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockImplementation(() => written);

    saveBaseline("test", entries);
    const manifest = loadBaseline("test");

    expect(manifest).not.toBeNull();
    expect(manifest!.entries).toHaveLength(1);
    expect(manifest!.version).toBe(1);
  });

  it("returns null when file does not exist", () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(loadBaseline("missing")).toBeNull();
  });
});

describe("diffAgainstBaseline", () => {
  const baseline: BaselineManifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    entries: [
      { url: "https://api.example.com/a", hash: "abc", capturedAt: "" },
      { url: "https://api.example.com/b", hash: "def", capturedAt: "" },
    ],
  };

  it("detects changed, new, removed, and unchanged entries", () => {
    const current = [
      { url: "https://api.example.com/a", hash: "xyz", capturedAt: "" },
      { url: "https://api.example.com/c", hash: "ghi", capturedAt: "" },
    ];
    const results = diffAgainstBaseline(baseline, current);
    const byUrl = Object.fromEntries(results.map((r) => [r.url, r.status]));
    expect(byUrl["https://api.example.com/a"]).toBe("changed");
    expect(byUrl["https://api.example.com/b"]).toBe("removed");
    expect(byUrl["https://api.example.com/c"]).toBe("new");
  });
});

describe("parseBaselineOptions", () => {
  it("uses default name when not provided", () => {
    expect(parseBaselineOptions({}).name).toBe("default");
  });

  it("parses overwrite flag", () => {
    expect(parseBaselineOptions({ baseline: "v1", overwrite: true }).overwrite).toBe(true);
  });
});

describe("validateBaselineOptions", () => {
  it("rejects names with special characters", () => {
    const errs = validateBaselineOptions({ name: "my baseline!" });
    expect(errs.length).toBeGreaterThan(0);
  });

  it("accepts valid names", () => {
    expect(validateBaselineOptions({ name: "v1-prod" })).toHaveLength(0);
  });
});

describe("getBaselineSummary", () => {
  it("includes name and label", () => {
    const summary = getBaselineSummary({ name: "v2", label: "staging", overwrite: false });
    expect(summary).toContain("v2");
    expect(summary).toContain("staging");
  });
});
