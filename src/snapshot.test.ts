import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { computeHash, saveSnapshot, loadSnapshot, Snapshot } from './snapshot';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapdiff-test-'));

const mockSnapshot: Snapshot = {
  url: 'https://api.example.com/users',
  timestamp: '2024-01-01T00:00:00.000Z',
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: { users: [{ id: 1, name: 'Alice' }] },
  hash: '',
};

describe('computeHash', () => {
  it('returns a 12-character hex string', () => {
    const hash = computeHash({ foo: 'bar' });
    expect(hash).toHaveLength(12);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('returns the same hash for identical data', () => {
    const a = computeHash({ key: 'value' });
    const b = computeHash({ key: 'value' });
    expect(a).toBe(b);
  });

  it('returns different hashes for different data', () => {
    const a = computeHash({ key: 'value1' });
    const b = computeHash({ key: 'value2' });
    expect(a).not.toBe(b);
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  it('saves and reloads a snapshot correctly', async () => {
    const snap = { ...mockSnapshot, hash: computeHash(mockSnapshot.body) };
    const filepath = await saveSnapshot(snap, {
      outputDir: tmpDir,
      environment: 'staging',
    });

    expect(fs.existsSync(filepath)).toBe(true);

    const loaded = loadSnapshot(filepath);
    expect(loaded.url).toBe(snap.url);
    expect(loaded.statusCode).toBe(200);
    expect(loaded.body).toEqual(snap.body);
  });

  it('creates environment subdirectory if missing', async () => {
    const snap = { ...mockSnapshot, hash: computeHash(mockSnapshot.body) };
    await saveSnapshot(snap, { outputDir: tmpDir, environment: 'production' });
    expect(fs.existsSync(path.join(tmpDir, 'production'))).toBe(true);
  });
});
