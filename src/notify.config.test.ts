import { describe, it, expect } from 'vitest';
import { parseNotifyConfig, validateNotifyConfig, getNotifySummary } from './notify.config';

describe('parseNotifyConfig', () => {
  it('returns null for non-object', () => {
    expect(parseNotifyConfig(null)).toBeNull();
    expect(parseNotifyConfig('slack')).toBeNull();
  });

  it('parses console channel', () => {
    const result = parseNotifyConfig({ channel: 'console' });
    expect(result).toEqual({ channel: 'console' });
  });

  it('parses slack channel', () => {
    const result = parseNotifyConfig({ channel: 'slack', webhookUrl: 'https://hooks.slack.com/x', username: 'bot' });
    expect(result).toMatchObject({ channel: 'slack', webhookUrl: 'https://hooks.slack.com/x', username: 'bot' });
  });

  it('returns null for slack without webhookUrl', () => {
    expect(parseNotifyConfig({ channel: 'slack' })).toBeNull();
  });

  it('parses webhook channel with defaults', () => {
    const result = parseNotifyConfig({ channel: 'webhook', url: 'https://example.com/hook' });
    expect(result).toMatchObject({ channel: 'webhook', url: 'https://example.com/hook', method: 'POST' });
  });

  it('returns null for webhook without url', () => {
    expect(parseNotifyConfig({ channel: 'webhook' })).toBeNull();
  });
});

describe('validateNotifyConfig', () => {
  it('returns no errors for valid console config', () => {
    expect(validateNotifyConfig({ channel: 'console' })).toHaveLength(0);
  });

  it('returns error for slack missing webhookUrl', () => {
    const errors = validateNotifyConfig({ channel: 'slack', webhookUrl: '' });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('getNotifySummary', () => {
  it('summarises slack config', () => {
    const s = getNotifySummary({ channel: 'slack', webhookUrl: 'https://x' });
    expect(s).toContain('slack');
    expect(s).toContain('https://x');
  });

  it('summarises webhook config', () => {
    const s = getNotifySummary({ channel: 'webhook', url: 'https://y', method: 'PUT' });
    expect(s).toContain('PUT');
    expect(s).toContain('https://y');
  });

  it('summarises console config', () => {
    expect(getNotifySummary({ channel: 'console' })).toBe('console');
  });
});
