import { runHook, resolveHookScript, getHookSummary, HookConfig } from "./hooks";
import { parseHookConfig, validateHookConfig, hasHooks } from "./hooks.config";
import * as fs from "fs";

jest.mock("fs");

const mockFs = fs as jest.Mocked<typeof fs>;

describe("runHook", () => {
  it("returns success for a valid command", () => {
    const result = runHook("echo hello");
    expect(result.success).toBe(true);
    expect(result.output).toBe("hello");
  });

  it("returns failure for an invalid command", () => {
    const result = runHook("exit 1", {}, 5000);
    expect(result.success).toBe(false);
  });

  it("passes context as environment variables", () => {
    const result = runHook("echo $SNAPDIFF_STATUS", { status: "changed" });
    expect(result.success).toBe(true);
    expect(result.output).toBe("changed");
  });
});

describe("resolveHookScript", () => {
  it("returns plain commands as-is", () => {
    expect(resolveHookScript("npm run check")).toBe("npm run check");
  });

  it("resolves relative paths if file exists", () => {
    mockFs.existsSync.mockReturnValue(true);
    const result = resolveHookScript("./scripts/check.sh");
    expect(result).toContain("check.sh");
  });

  it("throws if relative path does not exist", () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(() => resolveHookScript("./missing.sh")).toThrow("Hook script not found");
  });
});

describe("getHookSummary", () => {
  it("returns none when no hooks configured", () => {
    expect(getHookSummary({})).toBe("hooks(none)");
  });

  it("includes configured hooks in summary", () => {
    const config: HookConfig = { pre: "echo pre", onDiff: "notify.sh" };
    const summary = getHookSummary(config);
    expect(summary).toContain("pre: echo pre");
    expect(summary).toContain("onDiff: notify.sh");
  });
});

describe("parseHookConfig", () => {
  it("maps raw options to HookConfig", () => {
    const config = parseHookConfig({ preHook: "echo pre", hookTimeout: 5000 });
    expect(config.pre).toBe("echo pre");
    expect(config.timeout).toBe(5000);
  });
});

describe("validateHookConfig", () => {
  it("returns no errors for valid config", () => {
    expect(validateHookConfig({ pre: "echo ok", timeout: 5000 })).toHaveLength(0);
  });

  it("rejects non-positive timeout", () => {
    const errors = validateHookConfig({ timeout: -1 });
    expect(errors.some((e) => e.includes("positive integer"))).toBe(true);
  });

  it("rejects timeout over 60 seconds", () => {
    const errors = validateHookConfig({ timeout: 90000 });
    expect(errors.some((e) => e.includes("60000ms"))).toBe(true);
  });

  it("rejects empty hook command", () => {
    const errors = validateHookConfig({ pre: "   " });
    expect(errors.some((e) => e.includes("must not be empty"))).toBe(true);
  });
});

describe("hasHooks", () => {
  it("returns false when no hooks defined", () => {
    expect(hasHooks({})).toBe(false);
  });

  it("returns true when any hook is defined", () => {
    expect(hasHooks({ post: "echo done" })).toBe(true);
  });
});
