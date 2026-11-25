export interface ApiError {
  status: number;
  message: string;
}

let authToken: string | null = null;

export function setHttpAuthToken(token: string | null): void {
  authToken = token;
}

export function getHttpAuthToken(): string | null {
  return authToken;
}

export function buildHeaders(extraHeaders?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  return headers;
}

export async function handleHttpResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        message = String(errorBody.message);
      }
    } catch {
      // Giữ thông báo mặc định nếu response không phải JSON
    }

    const apiError: ApiError = {
      status: response.status,
      message,
    };
    throw apiError;
  }

  return (await response.json()) as T;
}
