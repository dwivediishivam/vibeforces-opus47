export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function ensureJsonObject<T extends Record<string, any>>(
  value: string,
  fallback: T,
) {
  return safeJsonParse(value, fallback);
}
