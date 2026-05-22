import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildNotifyPayload, sendNotification } from './notify';
import type { NotifyConfig } from './notify.types';

const baseSummary = { total: 10, changed: 2, errors: 1 };

describe('buildNotifyPayload', () => {
  it('includes correct counts', () => {
    const payload = buildNotifyPayload(baseSummary, 'run-42');
    expect(payload.totalEndpoints).toBe(10);
    expect(payload.changedEndpoints).toBe(2);
    expect(payload.errorEndpoints).toBe(1);
    expect(payload.runId).toBe('run-42');
  });

  it('sets a timestamp', () => {
    const payload = buildNotifyPayload(baseSummary);
    expect(new Date(payload.timestamp).getTime()).toBeGreaterThan(0);
  });

  it('builds summary string', () => {
    const payload = buildNotifyPayload(baseSummary);
    expect(payload.summary).toContain('2 changed');
    expect(payload.summary).toContain('1 errors');
  });
});

describe('sendNotification – console', () => {
  it('returns success and logs', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const config: NotifyConfig = { channel: 'console' };
    const payload = buildNotifyPayload(baseSummary);
    const result = await sendNotification(config, payload);
    expect(result.success).toBe(true);
    expect(result.channel).toBe('console');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('sendNotification – slack/webhook error handling', () => {
  it('returns failure when slack webhook url is invalid', async () => {
    const config: NotifyConfig = { channel: 'slack', webhookUrl: 'http://localhost:0/bad' };
    const payload = buildNotifyPayload(baseSummary);
    const result = await sendNotification(config, payload);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns failure when webhook url is invalid', async () => {
    const config: NotifyConfig = { channel: 'webhook', url: 'http://localhost:0/bad' };
    const payload = buildNotifyPayload(baseSummary);
    const result = await sendNotification(config, payload);
    expect(result.success).toBe(false);
  });
});
