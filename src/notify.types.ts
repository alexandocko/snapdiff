export type NotifyChannel = 'slack' | 'webhook' | 'console';

export interface SlackNotifyConfig {
  channel: 'slack';
  webhookUrl: string;
  username?: string;
  iconEmoji?: string;
}

export interface WebhookNotifyConfig {
  channel: 'webhook';
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
}

export interface ConsoleNotifyConfig {
  channel: 'console';
}

export type NotifyConfig =
  | SlackNotifyConfig
  | WebhookNotifyConfig
  | ConsoleNotifyConfig;

export interface NotifyPayload {
  title: string;
  summary: string;
  totalEndpoints: number;
  changedEndpoints: number;
  errorEndpoints: number;
  timestamp: string;
  runId?: string;
}

export interface NotifyResult {
  channel: NotifyChannel;
  success: boolean;
  error?: string;
}
