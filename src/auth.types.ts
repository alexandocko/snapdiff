export type AuthType = 'bearer' | 'basic' | 'apikey' | 'none';

export interface BearerAuth {
  type: 'bearer';
  /** Token value or env var reference like $MY_TOKEN */
  token: string;
}

export interface BasicAuth {
  type: 'basic';
  /** Username or env var reference */
  username: string;
  /** Password or env var reference */
  password: string;
}

export interface ApiKeyAuth {
  type: 'apikey';
  /** Header name, e.g. X-API-Key */
  header: string;
  /** Key value or env var reference */
  key: string;
}

export interface NoAuth {
  type: 'none';
}

export type AuthConfig = BearerAuth | BasicAuth | ApiKeyAuth | NoAuth;

export interface EnvEndpointConfig {
  baseUrl: string;
  auth?: AuthConfig;
  headers?: Record<string, string>;
}

/**
 * Returns true if the given AuthConfig requires credentials to be present
 * (i.e. is not a 'none' auth type).
 */
export function requiresCredentials(auth: AuthConfig): auth is BearerAuth | BasicAuth | ApiKeyAuth {
  return auth.type !== 'none';
}
