import { diffSnapshots, formatDiffResults, DiffResult } from "./differ";
import { Snapshot } from "./types";

const makeSnapshot = (overrides: Partial<Snapshot> = {}): Snapshot => ({
  endpoint: "/api/users",
  hash: "abc123",
  body: { users: [{ id: 1, name: "Alice" }] },
  capturedAt: new Date().toISOString(),
  ...overrides,
});

describe("diffSnapshots", () => {
  it("returns no changes when hashes match", () => {
    const staging = makeSnapshot({ hash: "same" });
    const production = makeSnapshot({ hash: "same" });

    const result = diffSnapshots(staging, production);

    expect(result.hasChanges).toBe(false);
    expect(result.details).toBeNull();
    expect(result.endpoint).toBe("/api/users");
  });

  it("detects changes when hashes differ", () => {
    const staging = makeSnapshot({
      hash: "hash-staging",
      body: { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }] },
    });
    const production = makeSnapshot({
      hash: "hash-production",
      body: { users: [{ id: 1, name: "Alice" }] },
    });

    const result = diffSnapshots(staging, production);

    expect(result.hasChanges).toBe(true);
    expect(result.details).not.toBeNull();
    expect(result.summary).toContain("/api/users");
    expect(result.stagingHash).toBe("hash-staging");
    expect(result.productionHash).toBe("hash-production");
  });

  it("throws when endpoints do not match", () => {
    const staging = makeSnapshot({ endpoint: "/api/users" });
    const production = makeSnapshot({ endpoint: "/api/products" });

    expect(() => diffSnapshots(staging, production)).toThrow(
      "Endpoint mismatch"
    );
  });
});

describe("formatDiffResults", () => {
  it("formats a report with changed and unchanged endpoints", () => {
    const results: DiffResult[] = [
      {
        endpoint: "/api/users",
        hasChanges: true,
        summary: "Changes detected for /api/users",
        details: "- old\n+ new",
        stagingHash: "aaa",
        productionHash: "bbb",
      },
      {
        endpoint: "/api/health",
        hasChanges: false,
        summary: "No changes detected for /api/health",
        details: null,
        stagingHash: "ccc",
        productionHash: "ccc",
      },
    ];

    const output = formatDiffResults(results);

    expect(output).toContain("snapdiff report");
    expect(output).toContain("Changed: 1");
    expect(output).toContain("Unchanged: 1");
    expect(output).toContain("/api/health");
    expect(output).toContain("- old");
  });

  it("shows all unchanged when nothing changed", () => {
    const results: DiffResult[] = [
      {
        endpoint: "/api/status",
        hasChanges: false,
        summary: "No changes",
        details: null,
        stagingHash: "xyz",
        productionHash: "xyz",
      },
    ];

    const output = formatDiffResults(results);
    expect(output).toContain("Changed: 0");
    expect(output).toContain("✓ /api/status");
  });
});
