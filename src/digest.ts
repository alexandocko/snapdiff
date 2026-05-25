import { createHash } from "crypto";

export interface DigestOptions {
  algorithm?: "md5" | "sha1" | "sha256" | "sha512";
  encoding?: "hex" | "base64";
  includeKeys?: boolean;
}

export interface DigestResult {
  value: string;
  algorithm: string;
  encoding: string;
  inputSize: number;
}

const DEFAULT_ALGORITHM = "sha256";
const DEFAULT_ENCODING = "hex";

export function digestData(
  data: unknown,
  options: DigestOptions = {}
): DigestResult {
  const algorithm = options.algorithm ?? DEFAULT_ALGORITHM;
  const encoding = options.encoding ?? "hex";
  const normalized = options.includeKeys === false
    ? stableStringifyValues(data)
    : stableStringify(data);

  const hash = createHash(algorithm)
    .update(normalized, "utf8")
    .digest(encoding as BufferEncoding);

  return {
    value: hash,
    algorithm,
    encoding,
    inputSize: normalized.length,
  };
}

export function compareDigests(a: DigestResult, b: DigestResult): boolean {
  return a.algorithm === b.algorithm &&
    a.encoding === b.encoding &&
    a.value === b.value;
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "";
  }
  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const pairs = keys.map(
    (k) => JSON.stringify(k) + ":" + stableStringify((value as Record<string, unknown>)[k])
  );
  return "{" + pairs.join(",") + "}";
}

function stableStringifyValues(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "";
  }
  if (Array.isArray(value)) {
    return "[" + value.map(stableStringifyValues).join(",") + "]";
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const vals = keys.map((k) => stableStringifyValues((value as Record<string, unknown>)[k]));
  return "[" + vals.join(",") + "]";
}

export function getDigestSummary(result: DigestResult): string {
  return `digest(${result.algorithm}/${result.encoding}) = ${result.value.slice(0, 12)}... [${result.inputSize}B]`;
}
