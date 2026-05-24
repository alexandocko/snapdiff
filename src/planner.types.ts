export type PlanStep = {
  id: string;
  url: string;
  label?: string;
  weight: number;
  tags: string[];
};

export type Plan = {
  steps: PlanStep[];
  totalWeight: number;
  estimatedRequests: number;
};

export type PlannerOptions = {
  maxSteps?: number;
  minWeight?: number;
  tags?: string[];
  shuffle?: boolean;
};
