import { scoreResults, resolveGrade, getScorerSummary } from './scorer';
import { DiffResult } from './types';

function makeDiffResult(status: string): DiffResult {
  return { endpoint: '/test', status: status as DiffResult['status'], diff: null };
}

describe('scoreResults', () => {
  it('returns zero score for all unchanged', () => {
    const results = [makeDiffResult('unchanged'), makeDiffResult('unchanged')];
    const result = scoreResults(results);
    expect(result.score).toBe(0);
    expect(result.grade).toBe('A');
  });

  it('scores added and removed equally with default weights', () => {
    const results = [makeDiffResult('added'), makeDiffResult('removed')];
    const result = scoreResults(results);
    expect(result.breakdown.added).toBe(1);
    expect(result.breakdown.removed).toBe(1);
    expect(result.score).toBeGreaterThan(0);
  });

  it('applies custom weights', () => {
    const results = [makeDiffResult('added')];
    const low = scoreResults(results, { weights: { added: 0.1 } });
    const high = scoreResults(results, { weights: { added: 2.0 } });
    expect(high.score).toBeGreaterThan(low.score);
  });

  it('respects maxScore cap', () => {
    const results = Array.from({ length: 10 }, () => makeDiffResult('added'));
    const result = scoreResults(results, { maxScore: 50 });
    expect(result.score).toBeLessThanOrEqual(50);
  });

  it('handles empty results without dividing by zero', () => {
    const result = scoreResults([]);
    expect(result.score).toBe(0);
  });
});

describe('resolveGrade', () => {
  it('returns A for zero score', () => {
    expect(resolveGrade(0, 100)).toBe('A');
  });

  it('returns F for high score', () => {
    expect(resolveGrade(80, 100)).toBe('F');
  });

  it('returns B for low score', () => {
    expect(resolveGrade(5, 100)).toBe('B');
  });
});

describe('getScorerSummary', () => {
  it('returns a formatted summary string', () => {
    const result = scoreResults([makeDiffResult('changed'), makeDiffResult('unchanged')]);
    const summary = getScorerSummary(result);
    expect(summary).toContain('Score:');
    expect(summary).toContain('changed: 1');
    expect(summary).toContain('unchanged: 1');
  });
});
