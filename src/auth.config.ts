import { AuthConfig, EnvEndpointConfig } from './auth.types';

export function validateAuthConfig(auth: unknown): auth is AuthConfig {
  if (!auth || typeof auth !== 'object') return false;
  const a = auth as Record<string, unknown>;

  if (a.type === 'none') return true;

  if (a.type === 'bearer') {
    return typeof a.token === 'string' && a.token.length > 0;
  }

  if (a.type === 'basic') {
    return typeof a.username === 'string' && typeof a.password === 'string';
  }

  if (a.type === 'apikey') {
    return typeof a.header === 'string' && typeof a.key === 'string';
  }

  return false;
}

export function validateEndpointConfig(config: unknown): config is EnvEndpointConfig {
  if (!config || typeof config !== 'object') return false;
  const c = config as Record<string, unknown>;

  if (typeof c.baseUrl !== 'string' || !c.baseUrl) {
    throw new Error('Missing or invalid baseUrl in endpoint config');
  }

  if (c.auth !== undefined && !validateAuthConfig(c.auth)) {
    throw new Error(`Invalid auth config: unsupported type '${(c.auth as Record<string, unknown>)?.type}'`);
  }

  return true;
}

export function getAuthSummary(auth?: AuthConfig): string {
  if (!auth || auth.type === 'none') return 'none';
  if (auth.type === 'bearer') return 'bearer token';
  if (auth.type === 'basic') return `basic (${auth.username})`;
  if (auth.type === 'apikey') return `apikey (${auth.header})`;
  return 'unknown';
}
