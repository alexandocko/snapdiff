import { withRetry, isRetryableError, RetryOptions } from './retry';
import { FetchError } from './types';

describe('isRetryableError', () => {
  const retryableCodes = [429, 500, 502, 503, 504];

  it('returns true for retryable status codes', () => {
    expect(isRetryableError(new FetchError('rate limited', 429), retryableCodes)).toBe(true);
    expect(isRetryableError(new FetchError('server error', 500), retryableCodes)).toBe(true);
  });

  it('returns false for non-retryable status codes', () => {
    expect(isRetryableError(new FetchError('not found', 404), retryableCodes)).toBe(false);
    expect(isRetryableError(new FetchError('bad request', 400), retryableCodes)).toBe(false);
  });

  it('returns true for network errors without status code', () => {
    expect(isRetryableError(new FetchError('network error'), retryableCodes)).toBe(true);
  });

  it('returns false for non-FetchError errors', () => {
    expect(isRetryableError(new Error('generic error'), retryableCodes)).toBe(false);
  });
});

describe('withRetry', () => {
  const fastOptions: Partial<RetryOptions> = { delayMs: 0, maxAttempts: 3 };

  it('returns result immediately on success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, fastOptions);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors and eventually succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new FetchError('server error', 500))
      .mockResolvedValue('ok');
    const result = await withRetry(fn, fastOptions);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting all attempts', async () => {
    const error = new FetchError('server error', 500);
    const fn = jest.fn().mockRejectedValue(error);
    await expect(withRetry(fn, fastOptions)).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-retryable errors', async () => {
    const error = new FetchError('not found', 404);
    const fn = jest.fn().mockRejectedValue(error);
    await expect(withRetry(fn, fastOptions)).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry generic errors', async () => {
    const error = new Error('unexpected');
    const fn = jest.fn().mockRejectedValue(error);
    await expect(withRetry(fn, fastOptions)).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
