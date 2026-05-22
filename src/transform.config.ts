import { z } from 'zod';

export const TransformConfigSchema = z.object({
  stripFields: z.array(z.string()).optional().default([]),
  maskFields: z.array(z.string()).optional().default([]),
  sortArrays: z.boolean().optional().default(false),
  maskValue: z.string().optional().default('***'),
});

export type TransformConfigInput = z.input<typeof TransformConfigSchema>;
export type TransformConfigParsed = z.output<typeof TransformConfigSchema>;

export function parseTransformConfig(
  raw: TransformConfigInput
): TransformConfigParsed {
  const result = TransformConfigSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid transform config:\n${issues}`);
  }
  return result.data;
}

export function getTransformSummary(config: TransformConfigParsed): string {
  const parts: string[] = [];
  if (config.stripFields.length) {
    parts.push(`strip: [${config.stripFields.join(', ')}]`);
  }
  if (config.maskFields.length) {
    parts.push(`mask: [${config.maskFields.join(', ')}] → "${config.maskValue}"`);
  }
  if (config.sortArrays) {
    parts.push('sortArrays: true');
  }
  return parts.length ? parts.join(', ') : 'no transforms';
}
