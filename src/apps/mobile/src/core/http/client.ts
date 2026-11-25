import { buildHeaders, handleHttpResponse } from './interceptors';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 8000;

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  return envUrl && envUrl.trim().length > 0
    ? envUrl.trim().replace(/\/+$/, '')
    : DEFAULT_BASE_URL;
}

async function requestWithTimeout<T>(
  path: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path}`;
    const response = await fetch(url, {
      ...init,
      headers: buildHeaders(init.headers),
      signal: controller.signal,
    });
    return await handleHttpResponse<T>(response);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw {
        status: 408,
        message: 'Yêu cầu hết thời gian chờ phản hồi từ máy chủ.',
      };
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const httpClient = {
  get: <T>(path: string, timeoutMs?: number): Promise<T> =>
    requestWithTimeout<T>(path, { method: 'GET' }, timeoutMs),

  post: <T, B = unknown>(
    path: string,
    body: B,
    timeoutMs?: number,
  ): Promise<T> =>
    requestWithTimeout<T>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      timeoutMs,
    ),

  delete: <T>(path: string, timeoutMs?: number): Promise<T> =>
    requestWithTimeout<T>(path, { method: 'DELETE' }, timeoutMs),
};
