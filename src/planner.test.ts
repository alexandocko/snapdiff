import { describe, it, expect } from 'vitest';
import { buildPlan, getPlanSummary, validatePlannerOptions } from './planner.js';

const baseSteps = [
  { id: 'a', url: '/api/a', tags: ['prod', 'critical'] },
  { id: 'b', url: '/api/b', tags: ['prod'] },
  { id: 'c', url: '/api/c', tags: ['staging'] },
];

describe('buildPlan', () => {
  it('returns all steps when no options given', () => {
    const plan = buildPlan(baseSteps);
    expect(plan.steps).toHaveLength(3);
    expect(plan.estimatedRequests).toBe(3);
  });

  it('filters by tag', () => {
    const plan = buildPlan(baseSteps, { tags: ['staging'] });
    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0].id).toBe('c');
  });

  it('limits by maxSteps', () => {
    const plan = buildPlan(baseSteps, { maxSteps: 2 });
    expect(plan.steps).toHaveLength(2);
  });

  it('sorts by weight descending by default', () => {
    const plan = buildPlan(baseSteps);
    expect(plan.steps[0].weight).toBeGreaterThanOrEqual(plan.steps[1].weight);
  });

  it('filters by minWeight', () => {
    const plan = buildPlan(baseSteps, { minWeight: 15 });
    plan.steps.forEach((s) => expect(s.weight).toBeGreaterThanOrEqual(15));
  });

  it('computes totalWeight correctly', () => {
    const plan = buildPlan(baseSteps);
    const expected = plan.steps.reduce((sum, s) => sum + s.weight, 0);
    expect(plan.totalWeight).toBe(expected);
  });

  it('returns empty plan when no steps match tags', () => {
    const plan = buildPlan(baseSteps, { tags: ['nonexistent'] });
    expect(plan.steps).toHaveLength(0);
    expect(plan.totalWeight).toBe(0);
  });
});

describe('getPlanSummary', () => {
  it('returns no-steps message for empty plan', () => {
    const plan = buildPlan([], {});
    expect(getPlanSummary(plan)).toMatch(/no steps/);
  });

  it('includes step count and weight in summary', () => {
    const plan = buildPlan(baseSteps);
    const summary = getPlanSummary(plan);
    expect(summary).toMatch(/3 step/);
    expect(summary).toMatch(/total weight/);
  });
});

describe('validatePlannerOptions', () => {
  it('returns no errors for valid options', () => {
    expect(validatePlannerOptions({ maxSteps: 5, minWeight: 1 })).toHaveLength(0);
  });

  it('errors on maxSteps < 1', () => {
    const errs = validatePlannerOptions({ maxSteps: 0 });
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatch(/maxSteps/);
  });

  it('errors on negative minWeight', () => {
    const errs = validatePlannerOptions({ minWeight: -1 });
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatch(/minWeight/);
  });
});
