import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fetchPair } from './fetcher';
import { fetchSnapshot } from './snapshot';

jest.mock('./snapshot', () => ({
  ...jest.requireActual('./snapshot'),
  fetchSnapshot: jest.fn(),
}));

const mockFetchSnapshot = fetchSnapshot as jest.MockedFunction<typeof fetchSnapshot>;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapdiff-fetcher-'));

const makeSnap = (env: string) => ({
  url: `https://${env}.example.com/api`,
  timestamp: new Date().toISOString(),
  statusCode: 200,
  headers: {},
  body: { env },
  hash: 'abc123def456',
});

describe('fetchPair', () => {
  beforeEach(() => {
    mockFetchSnapshot.mockReset();
  });

  it('fetches both staging and production snapshots', async () => {
    mockFetchSnapshot
      .mockResolvedValueOnce(makeSnap('staging') as any)
      .mockResolvedValueOnce(makeSnap('production') as any);

    const result = await fetchPair({
      stagingUrl: 'https://staging.example.com/api',
      productionUrl: 'https://production.example.com/api',
      outputDir: tmpDir,
    });

    expect(result.staging.body).toEqual({ env: 'staging' });
    expect(result.production.body).toEqual({ env: 'production' });
    expect(mockFetchSnapshot).toHaveBeenCalledTimes(2);
  });

  it('propagates errors from fetchSnapshot', async () => {
    mockFetchSnapshot.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      fetchPair({
        stagingUrl: 'https://staging.example.com/api',
        productionUrl: 'https://production.example.com/api',
        outputDir: tmpDir,
      })
    ).rejects.toThrow('Network error');
  });
});
