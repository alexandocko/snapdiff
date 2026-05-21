import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface Snapshot {
  url: string;
  timestamp: string;
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  hash: string;
}

export interface SnapshotOptions {
  outputDir: string;
  environment: 'staging' | 'production';
}

export function computeHash(data: unknown): string {
  const json = JSON.stringify(data, null, 0);
  return crypto.createHash('sha256').update(json).digest('hex').slice(0, 12);
}

export async function fetchSnapshot(
  url: string,
  options: SnapshotOptions
): Promise<Snapshot> {
  const response = await fetch(url);
  const body = await response.json();

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const snapshot: Snapshot = {
    url,
    timestamp: new Date().toISOString(),
    statusCode: response.status,
    headers,
    body,
    hash: computeHash(body),
  };

  await saveSnapshot(snapshot, options);
  return snapshot;
}

export async function saveSnapshot(
  snapshot: Snapshot,
  options: SnapshotOptions
): Promise<string> {
  const { outputDir, environment } = options;
  const dir = path.join(outputDir, environment);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const safeName = snapshot.url.replace(/[^a-z0-9]/gi, '_').slice(0, 64);
  const filename = `${safeName}_${snapshot.hash}.json`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return filepath;
}

export function loadSnapshot(filepath: string): Snapshot {
  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw) as Snapshot;
}
