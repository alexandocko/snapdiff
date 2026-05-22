import { validateAuthConfig, validateEndpointConfig, getAuthSummary } from './auth.config';
import { AuthConfig } from './auth.types';

describe('validateAuthConfig', () => {
  it('accepts none type', () => {
    expect(validateAuthConfig({ type: 'none' })).toBe(true);
  });

  it('accepts valid bearer config', () => {
    expect(validateAuthConfig({ type: 'bearer', token: 'tok' })).toBe(true);
  });

  it('rejects bearer without token', () => {
    expect(validateAuthConfig({ type: 'bearer', token: '' })).toBe(false);
  });

  it('accepts valid basic config', () => {
    expect(validateAuthConfig({ type: 'basic', username: 'u', password: 'p' })).toBe(true);
  });

  it('accepts valid apikey config', () => {
    expect(validateAuthConfig({ type: 'apikey', header: 'X-Key', key: 'val' })).toBe(true);
  });

  it('rejects unknown type', () => {
    expect(validateAuthConfig({ type: 'oauth' })).toBe(false);
  });

  it('rejects non-object', () => {
    expect(validateAuthConfig(null)).toBe(false);
    expect(validateAuthConfig('bearer')).toBe(false);
  });
});

describe('validateEndpointConfig', () => {
  it('accepts valid config without auth', () => {
    expect(validateEndpointConfig({ baseUrl: 'http://example.com' })).toBe(true);
  });

  it('throws on missing baseUrl', () => {
    expect(() => validateEndpointConfig({ auth: { type: 'none' } })).toThrow('Missing or invalid baseUrl');
  });

  it('throws on invalid auth type', () => {
    expect(() => validateEndpointConfig({ baseUrl: 'http://x.com', auth: { type: 'magic' } })).toThrow('Invalid auth config');
  });
});

describe('getAuthSummary', () => {
  it('returns none for undefined', () => {
    expect(getAuthSummary(undefined)).toBe('none');
  });

  it('returns bearer token', () => {
    expect(getAuthSummary({ type: 'bearer', token: 't' } as AuthConfig)).toBe('bearer token');
  });

  it('returns basic with username', () => {
    expect(getAuthSummary({ type: 'basic', username: 'admin', password: 'x' } as AuthConfig)).toBe('basic (admin)');
  });

  it('returns apikey with header name', () => {
    expect(getAuthSummary({ type: 'apikey', header: 'X-API-Key', key: 'k' } as AuthConfig)).toBe('apikey (X-API-Key)');
  });
});
