#!/usr/bin/env node
import { program } from 'commander';
import { loadConfig } from './config';
import { fetchSnapshot } from './fetcher';
import { diffSnapshots, formatDiffResults } from './differ';
import { generateReport } from './reporter';
import { loadSnapshot } from './snapshot';
import * as fs from 'fs';
import * as path from 'path';

program
  .name('snapdiff')
  .description('Diff JSON API responses across staging and production')
  .version('1.0.0');

program
  .command('run')
  .description('Fetch snapshots and diff staging vs production')
  .option('-c, --config <path>', 'Path to config file', 'snapdiff.config.json')
  .option('-o, --output <path>', 'Output report file path')
  .option('--format <type>', 'Report format: text | json', 'text')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      console.log(`Running snapdiff for ${config.endpoints.length} endpoint(s)...\n`);

      const results = [];
      for (const endpoint of config.endpoints) {
        const [staging, production] = await Promise.all([
          fetchSnapshot(endpoint, config.staging),
          fetchSnapshot(endpoint, config.production),
        ]);
        const diff = diffSnapshots(staging, production);
        results.push({ endpoint: endpoint.name, diff });
      }

      const report = generateReport(results, options.format);

      if (options.output) {
        const outPath = path.resolve(options.output);
        fs.writeFileSync(outPath, report, 'utf-8');
        console.log(`Report written to ${outPath}`);
      } else {
        console.log(report);
      }

      const hasDiffs = results.some((r) => r.diff.hasDifferences);
      process.exit(hasDiffs ? 1 : 0);
    } catch (err: any) {
      console.error('Error:', err.message);
      process.exit(2);
    }
  });

program
  .command('snapshot')
  .description('Load and display a saved snapshot file')
  .argument('<file>', 'Path to snapshot JSON file')
  .action(async (file) => {
    try {
      const snapshot = await loadSnapshot(path.resolve(file));
      console.log(JSON.stringify(snapshot, null, 2));
    } catch (err: any) {
      console.error('Error:', err.message);
      process.exit(2);
    }
  });

program.parse(process.argv);
