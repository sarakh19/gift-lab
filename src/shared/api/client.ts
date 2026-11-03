// Reusable JSON-over-HTTP client. Knows nothing about products or the DOM.

export type ApiErrorKind =
  'network' | 'timeout' | 'http' | 'parse' | 'validation';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;

  constructor(
    kind: ApiErrorKind,
    message: string,
    details: { status?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: details.cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.status = details.status;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

// Fetches JSON and hands it to `parse`, which validates the unknown data and returns
// the typed result (or throws). The caller decides what a valid response looks like.
export async function getJson<T>(
  url: string,
  parse: (data: unknown) => T,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === 'TimeoutError';
    throw new ApiError(
      timedOut ? 'timeout' : 'network',
      timedOut ? `Request timed out: ${url}` : `Network error: ${url}`,
      { cause: error },
    );
  }
  if (!response.ok)
    throw new ApiError('http', `HTTP ${response.status} from ${url}`, {
      status: response.status,
    });
  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError('parse', `Response is not valid JSON: ${url}`, {
      cause: error,
    });
  }
  return parse(data);
}
