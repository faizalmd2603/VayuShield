import { NetworkError } from '../types/errors';

interface CacheEntry<T> {
  readonly data: T;
  readonly expiresAt: number;
}

export interface FetchOptions {
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  readonly cacheTtlMs?: number;
  readonly headers?: Record<string, string>;
}

class HttpClient {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  /**
   * Clears all in-memory cached responses.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Retrieves an item from the cache if not expired.
   */
  private getFromCache(cacheKey: string): unknown {
    const entry = this.cache.get(cacheKey);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      return undefined;
    }
    return entry.data;
  }

  /**
   * Stores an item into the cache.
   */
  private setInCache(cacheKey: string, data: unknown, ttlMs: number): void {
    if (ttlMs <= 0) return;
    this.cache.set(cacheKey, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Performs an HTTP GET request with caching, timeout, and in-flight deduplication.
   *
   * @param url Request URL
   * @param options Request configuration options
   * @returns Typed response payload
   */
  public async get<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const { timeoutMs = 15_000, signal, cacheTtlMs = 0, headers = {} } = options;

    if (cacheTtlMs > 0) {
      const cached = this.getFromCache(url) as T | undefined;
      if (cached !== undefined) {
        return cached;
      }
    }

    const pending = this.inFlight.get(url) as Promise<T> | undefined;
    if (pending) {
      return pending;
    }

    const requestPromise = this.executeFetch<T>(url, headers, timeoutMs, signal)
      .then((data) => {
        if (cacheTtlMs > 0) {
          this.setInCache(url, data, cacheTtlMs);
        }
        return data;
      })
      .finally(() => {
        this.inFlight.delete(url);
      });

    this.inFlight.set(url, requestPromise);
    return requestPromise;
  }

  /**
   * Internal fetch executor handling timeouts and network errors.
   */
  private async executeFetch<T>(
    url: string,
    headers: Record<string, string>,
    timeoutMs: number,
    signal?: AbortSignal
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const onExternalAbort = (): void => {
      controller.abort();
    };

    if (signal) {
      signal.addEventListener('abort', onExternalAbort, { once: true });
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new NetworkError(
          `HTTP Error ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof NetworkError) throw err;
      const isAbort =
        (err instanceof DOMException && err.name === 'AbortError') ||
        controller.signal.aborted;
      if (isAbort) {
        throw new NetworkError('Request timed out or was cancelled', 408);
      }
      const msg = err instanceof Error ? err.message : 'Network fetch failed';
      throw new NetworkError(msg);
    } finally {
      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener('abort', onExternalAbort);
      }
    }
  }
}

export const httpClient = new HttpClient();
