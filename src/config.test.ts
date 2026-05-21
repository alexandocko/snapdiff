import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './config';

const VALID_CONFIG = {
  staging: { baseUrl: 'https://staging.example.com', headers: { 'X-Env': 'staging' } },
  production: { baseUrl: 'https://api.example.com' },
  endpoints: [{ path: '/users', method: 'GET' }],
  timeout: 5000,
  ignoreKeys: ['updatedAt'],
};

describe('loadConfig', () => {
  const tmpFile = path.join(__dirname, '__test_snapdiff.config.json');

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  function writeConfig(data: unknown): void {
    fs.writeFileSync(tmpFile, JSON.stringify(data), 'utf-8');
  }

  it('loads and validates a valid config file', () => {
    writeConfig(VALID_CONFIG);
    const config = loadConfig(tmpFile);
    expect(config.staging.baseUrl).toBe('https://staging.example.com');
    expect(config.production.baseUrl).toBe('https://api.example.com');
    expect(config.endpoints).toHaveLength(1);
    expect(config.timeout).toBe(5000);
    expect(config.ignoreKeys).toEqual(['updatedAt']);
  });

  it('applies default values for optional fields', () => {
    const minimal = {
      staging: { baseUrl: 'https://staging.example.com' },
      production: { baseUrl: 'https://api.example.com' },
      endpoints: [{ path: '/health' }],
    };
    writeConfig(minimal);
    const config = loadConfig(tmpFile);
    expect(config.timeout).toBe(10000);
    expect(config.ignoreKeys).toEqual([]);
    expect(config.staging.headers).toEqual({});
    expect(config.endpoints[0].method).toBe('GET');
  });

  it('throws when config file does not exist', () => {
    expect(() => loadConfig('/nonexistent/path.json')).toThrow('Config file not found');
  });

  it('throws on invalid JSON', () => {
    fs.writeFileSync(tmpFile, '{ invalid json }', 'utf-8');
    expect(() => loadConfig(tmpFile)).toThrow('Failed to parse config file');
  });

  it('throws on schema validation failure', () => {
    writeConfig({ staging: { baseUrl: 'not-a-url' }, endpoints: [] });
    expect(() => loadConfig(tmpFile)).toThrow('Invalid config');
  });
});
