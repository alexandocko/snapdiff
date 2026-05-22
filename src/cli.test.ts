import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CLI_PATH = path.resolve(__dirname, '../src/cli.ts');
const RUN_CMD = `ts-node ${CLI_PATH}`;

describe('CLI', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapdiff-cli-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('exits with code 2 when config file is missing', () => {
    const result = spawnSync(
      'ts-node',
      [CLI_PATH, 'run', '--config', path.join(tmpDir, 'nonexistent.json')],
      { encoding: 'utf-8' }
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/Error/);
  });

  it('prints version flag', () => {
    const result = spawnSync('ts-node', [CLI_PATH, '--version'], {
      encoding: 'utf-8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toMatch(/\d+\.\d+\.\d+/);
  });

  it('prints help flag', () => {
    const result = spawnSync('ts-node', [CLI_PATH, '--help'], {
      encoding: 'utf-8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('snapdiff');
    expect(result.stdout).toContain('run');
    expect(result.stdout).toContain('snapshot');
  });

  it('snapshot command exits with code 2 for missing file', () => {
    const result = spawnSync(
      'ts-node',
      [CLI_PATH, 'snapshot', path.join(tmpDir, 'missing.json')],
      { encoding: 'utf-8' }
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/Error/);
  });
});
