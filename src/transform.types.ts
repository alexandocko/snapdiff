/**
 * Describes a single field-level transformation rule.
 */
export interface FieldTransformRule {
  /** Dot-separated path to the field, e.g. "user.address.zip" */
  path: string;
  action: 'strip' | 'mask';
  maskValue?: string;
}

/**
 * Full transform pipeline configuration attached to an endpoint.
 */
export interface EndpointTransformConfig {
  /** Fields to remove entirely before diffing */
  stripFields?: string[];
  /** Fields to replace with a placeholder value */
  maskFields?: string[];
  /** Replacement string for masked fields (default: "***") */
  maskValue?: string;
  /** Whether to sort all arrays before diffing for stable comparison */
  sortArrays?: boolean;
}

/**
 * Result of applying transforms to a snapshot payload.
 */
export interface TransformResult {
  original: unknown;
  transformed: unknown;
  appliedRules: string[];
}

/**
 * Maps endpoint URL patterns to their transform configs.
 */
export type TransformMap = Record<string, EndpointTransformConfig>;
