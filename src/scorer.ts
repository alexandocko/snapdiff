import { DiffResult } from './types';

export interface ScorerOptions {
  weights?: {
    added?: number;
    removed?: number;
    changed?: number;
    unchanged?: number;
  };
  maxScore?: number;
}

export interface ScoreResult {
  score: number;
  normalized: number;
  breakdown: Record<string, number>;
  grade: string;
}

const DEFAULT_WEIGHTS = {
  added: 1.0,
  removed: 1.0,
  changed: 0.5,
  unchanged: 0.0,
};

export function scoreResults(
  results: DiffResult[],
  options: ScorerOptions = {}
): ScoreResult {
  const weights = { ...DEFAULT_WEIGHTS, ...options.weights };
  const maxScore = options.maxScore ?? 100;

  const counts: Record<string, number> = {
    added: 0,
    removed: 0,
    changed: 0,
    unchanged: 0,
  };

  for (const result of results) {
    const status = result.status ?? 'unchanged';
    if (status in counts) {
      counts[status]++;
    }
  }

  const total = results.length || 1;
  const rawScore =
    (counts.added * weights.added +
      counts.removed * weights.removed +
      counts.changed * weights.changed +
      counts.unchanged * weights.unchanged) /
    total;

  const normalized = Math.min(rawScore * maxScore, maxScore);
  const score = Math.round(normalized * 100) / 100;

  return {
    score,
    normalized: Math.round((normalized / maxScore) * 100) / 100,
    breakdown: { ...counts },
    grade: resolveGrade(normalized, maxScore),
  };
}

export function resolveGrade(score: number, maxScore: number): string {
  const pct = (score / maxScore) * 100;
  if (pct === 0) return 'A';
  if (pct < 10) return 'B';
  if (pct < 30) return 'C';
  if (pct < 60) return 'D';
  return 'F';
}

export function getScorerSummary(result: ScoreResult): string {
  return `Score: ${result.score} (${result.grade}) — added: ${result.breakdown.added}, removed: ${result.breakdown.removed}, changed: ${result.breakdown.changed}, unchanged: ${result.breakdown.unchanged}`;
}
