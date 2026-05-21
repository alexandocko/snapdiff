import { generateReport, ReportOptions } from './reporter';
import { DiffResult } from './types';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const mockResults: DiffResult[] = [
  { endpoint: '/api/users', status: 'changed', diff: '- name: Alice\n+ name: Bob' },
  { endpoint: '/api/products', status: 'unchanged', diff: null },
  { endpoint: '/api/orders', status: 'added', diff: null },
  { endpoint: '/api/legacy', status: 'removed', diff: null },
];

describe('generateReport', () => {
  it('returns json format with all results when includeUnchanged is true', () => {
    const options: ReportOptions = { format: 'json', includeUnchanged: true };
    const output = generateReport(mockResults, options);
    const parsed = JSON.parse(output);
    expect(parsed).toHaveLength(4);
  });

  it('filters unchanged results by default', () => {
    const options: ReportOptions = { format: 'json' };
    const output = generateReport(mockResults, options);
    const parsed = JSON.parse(output);
    expect(parsed.every((r: DiffResult) => r.status !== 'unchanged')).toBe(true);
  });

  it('generates summary report with correct counts', () => {
    const options: ReportOptions = { format: 'summary' };
    const output = generateReport(mockResults, options);
    expect(output).toContain('Total endpoints : 4');
    expect(output).toContain('Changed         : 1');
    expect(output).toContain('Added           : 1');
    expect(output).toContain('Removed         : 1');
    expect(output).toContain('Unchanged       : 1');
  });

  it('generates text report showing endpoint and diff', () => {
    const options: ReportOptions = { format: 'text' };
    const output = generateReport(mockResults, options);
    expect(output).toContain('[CHANGED] /api/users');
    expect(output).toContain('- name: Alice');
    expect(output).toContain('[ADDED] /api/orders');
  });

  it('returns no differences message when all are unchanged', () => {
    const unchanged: DiffResult[] = [
      { endpoint: '/api/health', status: 'unchanged', diff: null },
    ];
    const options: ReportOptions = { format: 'text' };
    const output = generateReport(unchanged, options);
    expect(output).toBe('No differences found.');
  });

  it('writes output to file when outputPath is provided', () => {
    const tmpDir = os.tmpdir();
    const outputPath = path.join(tmpDir, 'snapdiff-test', 'report.json');
    const options: ReportOptions = { format: 'json', outputPath };
    generateReport(mockResults, options);
    expect(fs.existsSync(outputPath)).toBe(true);
    const content = fs.readFileSync(outputPath, 'utf-8');
    expect(JSON.parse(content)).toBeDefined();
    fs.rmSync(path.dirname(outputPath), { recursive: true });
  });
});
