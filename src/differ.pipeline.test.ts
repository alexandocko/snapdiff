import { runDiffPipeline, runPipelineOnAll, getPipelineSummary, PipelineConfig } from './differ.pipeline';
import { parsePipelineConfig, validatePipelineConfig, getPipelineConfigSummary } from './differ.pipeline.config';
import { DiffResult } from './types';

function makeDiffResult(overrides: Partial<DiffResult> = {}): DiffResult {
  return {
    url: 'https://example.com/api',
    status: 'changed',
    actual: { name: 'Alice', token: 'secret123', score: 99 },
    expected: { name: 'Alice', token: 'secret456', score: 99 },
    diffs: [],
    ...overrides,
  };
}

describe('runDiffPipeline', () => {
  it('returns result unchanged when config is empty', () => {
    const result = makeDiffResult();
    const { result: out, appliedStages } = runDiffPipeline(result, {});
    expect(out.actual).toEqual(result.actual);
    expect(appliedStages).toHaveLength(0);
  });

  it('applies normalize stage', () => {
    const result = makeDiffResult();
    const { appliedStages } = runDiffPipeline(result, { normalize: true });
    expect(appliedStages).toContain('normalize');
  });

  it('applies redact stage', () => {
    const result = makeDiffResult();
    const config: PipelineConfig = { redact: { fields: ['token'] } };
    const { result: out, appliedStages } = runDiffPipeline(result, config);
    expect(appliedStages).toContain('redact');
    expect(out.actual['token']).not.toBe('secret123');
  });

  it('applies truncate stage', () => {
    const result = makeDiffResult();
    const { appliedStages } = runDiffPipeline(result, { truncateDepth: 2 });
    expect(appliedStages).toContain('truncate');
  });

  it('tracks multiple stages in order', () => {
    const result = makeDiffResult();
    const config: PipelineConfig = { normalize: true, truncateDepth: 3 };
    const { appliedStages } = runDiffPipeline(result, config);
    expect(appliedStages).toContain('normalize');
    expect(appliedStages).toContain('truncate');
    expect(appliedStages.indexOf('normalize')).toBeLessThan(appliedStages.indexOf('truncate'));
  });
});

describe('runPipelineOnAll', () => {
  it('processes all results', () => {
    const results = [makeDiffResult(), makeDiffResult({ url: 'https://example.com/b' })];
    const out = runPipelineOnAll(results, { normalize: true });
    expect(out).toHaveLength(2);
    out.forEach((r) => expect(r.appliedStages).toContain('normalize'));
  });
});

describe('getPipelineSummary', () => {
  it('returns summary for empty results', () => {
    expect(getPipelineSummary([])).toMatch(/no results/);
  });

  it('includes stage names in summary', () => {
    const result = makeDiffResult();
    const pipelineResults = runPipelineOnAll([result], { normalize: true });
    const summary = getPipelineSummary(pipelineResults);
    expect(summary).toContain('normalize');
    expect(summary).toContain('1 result');
  });
});

describe('parsePipelineConfig', () => {
  it('parses truncateDepth as number', () => {
    const config = parsePipelineConfig({ truncateDepth: '4' });
    expect(config.truncateDepth).toBe(4);
  });

  it('builds transform config from strip/mask fields', () => {
    const config = parsePipelineConfig({ stripFields: ['id'], maskFields: ['token'] });
    expect(config.transform?.strip).toContain('id');
    expect(config.transform?.mask).toContain('token');
  });

  it('omits transform when no fields provided', () => {
    const config = parsePipelineConfig({});
    expect(config.transform).toBeUndefined();
  });
});

describe('validatePipelineConfig', () => {
  it('returns error for non-integer truncateDepth', () => {
    const errors = validatePipelineConfig({ truncateDepth: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('returns no errors for valid config', () => {
    const errors = validatePipelineConfig({ truncateDepth: 3, normalize: true });
    expect(errors).toHaveLength(0);
  });
});

describe('getPipelineConfigSummary', () => {
  it('returns no-stages message for empty config', () => {
    expect(getPipelineConfigSummary({})).toMatch(/no stages/);
  });

  it('lists configured stages', () => {
    const summary = getPipelineConfigSummary({ normalize: true, truncateDepth: 2 });
    expect(summary).toContain('normalize');
    expect(summary).toContain('truncate');
  });
});
