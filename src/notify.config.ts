import { NotifyConfig, NotifyChannel } from './notify.types';

export function parseNotifyConfig(raw: unknown): NotifyConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const channel = obj['channel'] as NotifyChannel;

  if (channel === 'console') return { channel };

  if (channel === 'slack') {
    if (typeof obj['webhookUrl'] !== 'string') return null;
    return {
      channel,
      webhookUrl: obj['webhookUrl'],
      username: typeof obj['username'] === 'string' ? obj['username'] : undefined,
      iconEmoji: typeof obj['iconEmoji'] === 'string' ? obj['iconEmoji'] : undefined,
    };
  }

  if (channel === 'webhook') {
    if (typeof obj['url'] !== 'string') return null;
    const method = obj['method'] === 'PUT' ? 'PUT' : 'POST';
    const headers =
      obj['headers'] && typeof obj['headers'] === 'object'
        ? (obj['headers'] as Record<string, string>)
        : undefined;
    return { channel, url: obj['url'], method, headers };
  }

  return null;
}

export function validateNotifyConfig(config: NotifyConfig): string[] {
  const errors: string[] = [];
  if (config.channel === 'slack' && !config.webhookUrl)
    errors.push('slack notify requires webhookUrl');
  if (config.channel === 'webhook' && !config.url)
    errors.push('webhook notify requires url');
  return errors;
}

export function getNotifySummary(config: NotifyConfig): string {
  if (config.channel === 'slack') return `slack → ${config.webhookUrl}`;
  if (config.channel === 'webhook') return `webhook [${config.method ?? 'POST'}] → ${config.url}`;
  return 'console';
}
