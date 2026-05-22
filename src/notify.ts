import https from 'https';
import http from 'http';
import { NotifyConfig, NotifyPayload, NotifyResult } from './notify.types';

export function buildNotifyPayload(
  summary: { total: number; changed: number; errors: number },
  runId?: string
): NotifyPayload {
  return {
    title: 'snapdiff run complete',
    summary: `${summary.changed} changed, ${summary.errors} errors out of ${summary.total} endpoints`,
    totalEndpoints: summary.total,
    changedEndpoints: summary.changed,
    errorEndpoints: summary.errors,
    timestamp: new Date().toISOString(),
    runId,
  };
}

export async function sendNotification(
  config: NotifyConfig,
  payload: NotifyPayload
): Promise<NotifyResult> {
  try {
    if (config.channel === 'console') {
      console.log(`[snapdiff notify] ${payload.title}: ${payload.summary}`);
      return { channel: 'console', success: true };
    }

    if (config.channel === 'slack') {
      const body = JSON.stringify({
        username: config.username ?? 'snapdiff',
        icon_emoji: config.iconEmoji ?? ':bar_chart:',
        text: `*${payload.title}*\n${payload.summary}`,
      });
      await postJson(config.webhookUrl, body);
      return { channel: 'slack', success: true };
    }

    if (config.channel === 'webhook') {
      const body = JSON.stringify(payload);
      await postJson(config.url, body, config.headers, config.method ?? 'POST');
      return { channel: 'webhook', success: true };
    }

    return { channel: 'console', success: false, error: 'Unknown channel' };
  } catch (err) {
    const channel = config.channel;
    const error = err instanceof Error ? err.message : String(err);
    return { channel, success: false, error };
  }
}

function postJson(
  url: string,
  body: string,
  extraHeaders: Record<string, string> = {},
  method = 'POST'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method, headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...extraHeaders } },
      (res) => { res.resume(); res.on('end', resolve); }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
