// Defensive JSON fetch: never throws "Unexpected token ... is not valid JSON"
// when the server returns a non-JSON body (e.g. an HTML 500 error page).

export async function fetchJson<T = unknown>(
  input: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error: string | null }> {
  try {
    const res = await fetch(input, init);
    const text = await res.text();

    let data: T | null = null;
    let parseError: string | null = null;

    if (text.trim().length > 0) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        parseError = text.slice(0, 200);
      }
    }

    if (!res.ok) {
      const serverMsg =
        (data && typeof data === "object" && "error" in data
          ? String((data as Record<string, unknown>).error)
          : null) ?? parseError ?? `Request failed (${res.status})`;
      return { ok: false, status: res.status, data: null, error: serverMsg };
    }

    if (parseError) {
      return { ok: false, status: res.status, data: null, error: `Invalid response: ${parseError}` };
    }

    return { ok: true, status: res.status, data, error: null };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
