import { HookConfig } from "./hooks";

export interface RawHookOptions {
  preHook?: string;
  postHook?: string;
  onDiffHook?: string;
  hookTimeout?: number;
}

export function parseHookConfig(options: RawHookOptions): HookConfig {
  const config: HookConfig = {};

  if (options.preHook) config.pre = options.preHook;
  if (options.postHook) config.post = options.postHook;
  if (options.onDiffHook) config.onDiff = options.onDiffHook;
  if (options.hookTimeout !== undefined) {
    config.timeout = options.hookTimeout;
  }

  return config;
}

export function validateHookConfig(config: HookConfig): string[] {
  const errors: string[] = [];

  if (config.timeout !== undefined) {
    if (!Number.isInteger(config.timeout) || config.timeout <= 0) {
      errors.push("hookTimeout must be a positive integer (milliseconds)");
    }
    if (config.timeout > 60000) {
      errors.push("hookTimeout must not exceed 60000ms (60 seconds)");
    }
  }

  for (const [key, cmd] of Object.entries({
    pre: config.pre,
    post: config.post,
    onDiff: config.onDiff,
  })) {
    if (cmd !== undefined && typeof cmd !== "string") {
      errors.push(`Hook '${key}' must be a string command`);
    }
    if (cmd !== undefined && cmd.trim() === "") {
      errors.push(`Hook '${key}' command must not be empty`);
    }
  }

  return errors;
}

export function hasHooks(config: HookConfig): boolean {
  return !!(config.pre || config.post || config.onDiff);
}
