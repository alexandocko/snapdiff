import { SnapdiffConfig } from './types';

export interface AuthHeaders {
  [key: string]: string;
}

export function buildAuthHeaders(config: SnapdiffConfig, env: 'staging' | 'production'): AuthHeaders {
  const headers: AuthHeaders = {};
  const envConfig = env === 'staging' ? config.staging : config.production;

  if (!envConfig?.auth) {
    return headers;
  }

  const { auth } = envConfig;

  if (auth.type === 'bearer' && auth.token) {
    headers['Authorization'] = `Bearer ${resolveEnvVar(auth.token)}`;
  } else if (auth.type === 'basic' && auth.username && auth.password) {
    const credentials = Buffer.from(
      `${resolveEnvVar(auth.username)}:${resolveEnvVar(auth.password)}`
    ).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  } else if (auth.type === 'apikey' && auth.header && auth.key) {
    headers[auth.header] = resolveEnvVar(auth.key);
  }

  return headers;
}

export function resolveEnvVar(value: string): string {
  if (value.startsWith('$')) {
    const envKey = value.slice(1);
    const resolved = process.env[envKey];
    if (!resolved) {
      throw new Error(`Environment variable '${envKey}' is not set`);
    }
    return resolved;
  }
  return value;
}

export function mergeHeaders(base: AuthHeaders, override: AuthHeaders): AuthHeaders {
  return { ...base, ...override };
}
