import type { Plan, PlanStep, PlannerOptions } from './planner.types.js';

export function buildPlan(
  steps: Omit<PlanStep, 'weight'>[],
  options: PlannerOptions = {}
): Plan {
  const { maxSteps, minWeight = 0, tags, shuffle = false } = options;

  let weighted: PlanStep[] = steps.map((step, i) => ({
    ...step,
    weight: step.tags?.length ? step.tags.length * 10 : 10 - i,
  }));

  if (tags && tags.length > 0) {
    weighted = weighted.filter((s) =>
      s.tags.some((t) => tags.includes(t))
    );
  }

  weighted = weighted.filter((s) => s.weight >= minWeight);

  if (shuffle) {
    weighted = shuffleArray(weighted);
  } else {
    weighted = weighted.sort((a, b) => b.weight - a.weight);
  }

  if (maxSteps !== undefined) {
    weighted = weighted.slice(0, maxSteps);
  }

  const totalWeight = weighted.reduce((sum, s) => sum + s.weight, 0);

  return {
    steps: weighted,
    totalWeight,
    estimatedRequests: weighted.length,
  };
}

export function getPlanSummary(plan: Plan): string {
  if (plan.steps.length === 0) return 'Plan: no steps';
  return `Plan: ${plan.steps.length} step(s), total weight ${plan.totalWeight}, ~${plan.estimatedRequests} request(s)`;
}

export function validatePlannerOptions(options: PlannerOptions): string[] {
  const errors: string[] = [];
  if (options.maxSteps !== undefined && options.maxSteps < 1) {
    errors.push('maxSteps must be >= 1');
  }
  if (options.minWeight !== undefined && options.minWeight < 0) {
    errors.push('minWeight must be >= 0');
  }
  return errors;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
