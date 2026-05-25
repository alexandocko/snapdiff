import { describe, it, expect } from "vitest";
import {
  digestData,
  compareDigests,
  stableStringify,
  getDigestSummary,
} from "./digest";

describe("stableStringify", () => {
  it("produces consistent output regardless of key order", () => {
    const a = stableStringify({ b: 2, a: 1 });
    const b = stableStringify({ a: 1, b: 2 });
    expect(a).toBe(b);
  });

  it("handles nested objects", () => {
    const result = stableStringify({ z: { b: 2, a: 1 }, a: [3, 1, 2] });
    expect(result).toBe('{"a":[3,1,2],"z":{"a":1,"b":2}}');
  });

  it("handles primitives", () => {
    expect(stableStringify(42)).toBe("42");
    expect(stableStringify("hello")).toBe('"hello"');
    expect(stableStringify(null)).toBe("null");
    expect(stableStringify(true)).toBe("true");
  });
});

describe("digestData", () => {
  it("returns a sha256 hex digest by default", () => {
    const result = digestData({ foo: "bar" });
    expect(result.algorithm).toBe("sha256");
    expect(result.encoding).toBe("hex");
    expect(result.value).toHaveLength(64);
    expect(result.inputSize).toBeGreaterThan(0);
  });

  it("produces identical digests for equivalent objects", () => {
    const a = digestData({ b: 2, a: 1 });
    const b = digestData({ a: 1, b: 2 });
    expect(a.value).toBe(b.value);
  });

  it("produces different digests for different data", () => {
    const a = digestData({ x: 1 });
    const b = digestData({ x: 2 });
    expect(a.value).not.toBe(b.value);
  });

  it("supports sha512 and base64 encoding", () => {
    const result = digestData({ key: "value" }, { algorithm: "sha512", encoding: "base64" });
    expect(result.algorithm).toBe("sha512");
    expect(result.encoding).toBe("base64");
    expect(result.value.length).toBeGreaterThan(64);
  });

  it("ignores keys when includeKeys is false", () => {
    const a = digestData({ x: 1, y: 2 }, { includeKeys: false });
    const b = digestData({ a: 1, b: 2 }, { includeKeys: false });
    expect(a.value).toBe(b.value);
  });
});

describe("compareDigests", () => {
  it("returns true for identical digests", () => {
    const a = digestData({ foo: 1 });
    const b = digestData({ foo: 1 });
    expect(compareDigests(a, b)).toBe(true);
  });

  it("returns false when values differ", () => {
    const a = digestData({ foo: 1 });
    const b = digestData({ foo: 2 });
    expect(compareDigests(a, b)).toBe(false);
  });
});

describe("getDigestSummary", () => {
  it("returns a readable summary string", () => {
    const result = digestData({ test: true });
    const summary = getDigestSummary(result);
    expect(summary).toMatch(/digest\(sha256\/hex\) = [a-f0-9]{12}\.\.\. \[\d+B\]/);
  });
});
