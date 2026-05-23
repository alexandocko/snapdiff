import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface HookConfig {
  pre?: string;
  post?: string;
  onDiff?: string;
  timeout?: number;
}

export interface HookContext {
  endpoint?: string;
  status?: "changed" | "unchanged" | "error";
  diffCount?: number;
  outputPath?: string;
}

export function runHook(
  command: string,
  context: HookContext = {},
  timeout = 10000
): { success: boolean; output: string } {
  const env = {
    ...process.env,
    SNAPDIFF_ENDPOINT: context.endpoint ?? "",
    SNAPDIFF_STATUS: context.status ?? "",
    SNAPDIFF_DIFF_COUNT: String(context.diffCount ?? 0),
    SNAPDIFF_OUTPUT_PATH: context.outputPath ?? "",
  };

  try {
    const output = execSync(command, {
      env,
      timeout,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { success: true, output: output.trim() };
  } catch (err: any) {
    const output = err.stderr?.toString().trim() ?? err.message ?? "";
    return { success: false, output };
  }
}

export function resolveHookScript(command: string): string {
  if (command.startsWith("./") || command.startsWith("/")) {
    const resolved = path.resolve(command);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Hook script not found: ${resolved}`);
    }
    return resolved;
  }
  return command;
}

export function getHookSummary(config: HookConfig): string {
  const parts: string[] = [];
  if (config.pre) parts.push(`pre: ${config.pre}`);
  if (config.post) parts.push(`post: ${config.post}`);
  if (config.onDiff) parts.push(`onDiff: ${config.onDiff}`);
  return parts.length > 0 ? `hooks(${parts.join(", ")})` : "hooks(none)";
}
