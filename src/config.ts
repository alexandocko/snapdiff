import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const ConfigSchema = z.object({
  staging: z.object({
    baseUrl: z.string().url(),
    headers: z.record(z.string()).optional().default({}),
  }),
  production: z.object({
    baseUrl: z.string().url(),
    headers: z.record(z.string()).optional().default({}),
  }),
  endpoints: z.array(
    z.object({
      path: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
      body: z.record(z.unknown()).optional(),
    })
  ).min(1),
  timeout: z.number().int().positive().default(10000),
  ignoreKeys: z.array(z.string()).optional().default([]),
});

export type SnapdiffConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(configPath?: string): SnapdiffConfig {
  const resolvedPath = configPath
    ? path.resolve(configPath)
    : path.resolve(process.cwd(), 'snapdiff.config.json');

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  let raw: unknown;
  try {
    const content = fs.readFileSync(resolvedPath, 'utf-8');
    raw = JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse config file: ${(err as Error).message}`);
  }

  const result = ConfigSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid config:\n${issues}`);
  }

  return result.data;
}
