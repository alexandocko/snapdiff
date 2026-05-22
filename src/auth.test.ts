import { buildAuthHeaders, resolveEnvVar, mergeHeaders } from './auth';
import { SnapdiffConfig } from './types';

function makeConfig(authOverride: Record<string, unknown>, env: 'staging' | 'production' = 'staging'): SnapdiffConfig {
  return {
    [env]: { baseUrl: 'http://example.com', auth: authOverride },
  } as unknown as SnapdiffConfig;
}

describe('buildAuthHeaders', () => {
  it('returns empty headers when no auth config', () => {
    const config = { staging: { baseUrl: 'http://example.com' } } as unknown as SnapdiffConfig;
    expect(buildAuthHeaders(config, 'staging')).toEqual({});
  });

  it('builds bearer token header', () => {
    const config = makeConfig({ type: 'bearer', token: 'mytoken' });
    expect(buildAuthHeaders(config, 'staging')).toEqual({ Authorization: 'Bearer mytoken' });
  });

  it('builds basic auth header', () => {
    const config = makeConfig({ type: 'basic', username: 'user', password: 'pass' });
    const expected = `Basic ${Buffer.from('user:pass').toString('base64')}`;
    expect(buildAuthHeaders(config, 'staging')).toEqual({ Authorization: expected });
  });

  it('builds apikey header', () => {
    const config = makeConfig({ type: 'apikey', header: 'X-API-Key', key: 'secret' });
    expect(buildAuthHeaders(config, 'staging')).toEqual({ 'X-API-Key': 'secret' });
  });

  it('resolves env variable for bearer token', () => {
    process.env.TEST_TOKEN = 'env-token';
    const config = makeConfig({ type: 'bearer', token: '$TEST_TOKEN' });
    expect(buildAuthHeaders(config, 'staging')).toEqual({ Authorization: 'Bearer env-token' });
    delete process.env.TEST_TOKEN;
  });
});

describe('resolveEnvVar', () => {
  it('returns plain value as-is', () => {
    expect(resolveEnvVar('plainvalue')).toBe('plainvalue');
  });

  it('resolves environment variable', () => {
    process.env.MY_SECRET = 'resolved';
    expect(resolveEnvVar('$MY_SECRET')).toBe('resolved');
    delete process.env.MY_SECRET;
  });

  it('throws when env variable is not set', () => {
    expect(() => resolveEnvVar('$MISSING_VAR_XYZ')).toThrow("Environment variable 'MISSING_VAR_XYZ' is not set");
  });
});

describe('mergeHeaders', () => {
  it('merges two header objects', () => {
    expect(mergeHeaders({ A: '1' }, { B: '2' })).toEqual({ A: '1', B: '2' });
  });

  it('override takes precedence', () => {
    expect(mergeHeaders({ A: '1' }, { A: '2' })).toEqual({ A: '2' });
  });
});
