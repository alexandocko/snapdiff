import { fetchSnapshot, Snapshot, SnapshotOptions } from './snapshot';

export interface FetchPairOptions {
  stagingUrl: string;
  productionUrl: string;
  outputDir: string;
}

export interface SnapshotPair {
  staging: Snapshot;
  production: Snapshot;
}

export async function fetchPair(
  options: FetchPairOptions
): Promise<SnapshotPair> {
  const stagingOptions: SnapshotOptions = {
    outputDir: options.outputDir,
    environment: 'staging',
  };

  const productionOptions: SnapshotOptions = {
    outputDir: options.outputDir,
    environment: 'production',
  };

  const [staging, production] = await Promise.all([
    fetchSnapshot(options.stagingUrl, stagingOptions),
    fetchSnapshot(options.productionUrl, productionOptions),
  ]);

  return { staging, production };
}

export async function fetchPairSequential(
  options: FetchPairOptions
): Promise<SnapshotPair> {
  const stagingOptions: SnapshotOptions = {
    outputDir: options.outputDir,
    environment: 'staging',
  };

  const productionOptions: SnapshotOptions = {
    outputDir: options.outputDir,
    environment: 'production',
  };

  const staging = await fetchSnapshot(options.stagingUrl, stagingOptions);
  const production = await fetchSnapshot(options.productionUrl, productionOptions);

  return { staging, production };
}
