/**
 * Safely parse JSON from a fetch Response.
 * Avoids "Unexpected end of JSON input" when the server returns empty body or non-JSON (e.g. 500 HTML).
 */
export async function safeParseJson<T = Record<string, unknown>>(
  response: Response
): Promise<T> {
  const text = await response.text();
  if (!text || !text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}
