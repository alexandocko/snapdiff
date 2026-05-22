import { redactData } from './redact';
import { RedactConfig } from './redact.types';

describe('redactData', () => {
  const baseConfig: RedactConfig = {
    fields: ['password', 'token'],
    replacement: '[REDACTED]',
    recursive: true,
  };

  it('redacts top-level fields by name', () => {
    const data = { username: 'alice', password: 'secret123' };
    const result = redactData(data, baseConfig);
    expect((result.data as any).password).toBe('[REDACTED]');
    expect((result.data as any).username).toBe('alice');
    expect(result.redactedCount).toBe(1);
    expect(result.redactedPaths).toContain('password');
  });

  it('redacts nested fields recursively', () => {
    const data = { user: { token: 'abc123', name: 'bob' } };
    const result = redactData(data, baseConfig);
    expect((result.data as any).user.token).toBe('[REDACTED]');
    expect((result.data as any).user.name).toBe('bob');
    expect(result.redactedPaths).toContain('user.token');
  });

  it('redacts fields within arrays', () => {
    const data = { users: [{ password: 'x' }, { password: 'y' }] };
    const result = redactData(data, baseConfig);
    expect((result.data as any).users[0].password).toBe('[REDACTED]');
    expect((result.data as any).users[1].password).toBe('[REDACTED]');
    expect(result.redactedCount).toBe(2);
  });

  it('respects custom replacement string', () => {
    const config: RedactConfig = { fields: ['secret'], replacement: '***' };
    const data = { secret: 'value' };
    const result = redactData(data, config);
    expect((result.data as any).secret).toBe('***');
  });

  it('redacts string values matching patterns', () => {
    const config: RedactConfig = {
      fields: [],
      patterns: ['Bearer\\s+\\S+'],
      replacement: '[REDACTED]',
    };
    const data = { header: 'Bearer eyJhbGciOiJIUzI1NiJ9' };
    const result = redactData(data, config);
    expect((result.data as any).header).toBe('[REDACTED]');
    expect(result.redactedCount).toBe(1);
  });

  it('returns unchanged data when no fields match', () => {
    const data = { name: 'alice', age: 30 };
    const result = redactData(data, baseConfig);
    expect(result.data).toEqual(data);
    expect(result.redactedCount).toBe(0);
  });

  it('handles null and primitive values gracefully', () => {
    expect(redactData(null, baseConfig).data).toBeNull();
    expect(redactData(42, baseConfig).data).toBe(42);
    expect(redactData('hello', baseConfig).data).toBe('hello');
  });
});
