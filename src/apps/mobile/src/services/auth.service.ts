import { UserProfile } from '@caro/shared';
import { httpClient } from '../core/http/client';
import { setHttpAuthToken } from '../core/http/interceptors';
import {
  loadAccessToken,
  removeAccessToken,
  saveAccessToken,
} from '../core/auth/session-storage';
import { mapUserProfileDtoToDomain } from '../mappers/auth.mapper';
import { AuthResponseDto, UserProfileDto } from '../types/auth.dto';

const hasRemoteApi = () => Boolean(process.env.EXPO_PUBLIC_API_URL);

async function rememberAccessToken(token: string): Promise<void> {
  setHttpAuthToken(token);
  try {
    await saveAccessToken(token);
  } catch (error) {
    console.warn('Không thể lưu phiên đăng nhập trên thiết bị.', error);
  }
}

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 401
  );
}

export const authService = {
  async restoreSession(): Promise<UserProfile | null> {
    if (!hasRemoteApi()) return null;

    let token: string | null;
    try {
      token = await loadAccessToken();
    } catch {
      return null;
    }
    if (!token) return null;

    setHttpAuthToken(token);
    try {
      const dto = await httpClient.get<UserProfileDto>('/api/v1/auth/me');
      return mapUserProfileDtoToDomain(dto);
    } catch (error) {
      if (isUnauthorized(error)) {
        setHttpAuthToken(null);
        try {
          await removeAccessToken();
        } catch {
          // Ignore storage cleanup errors for an expired server session.
        }
        return null;
      }
      throw error;
    }
  },

  async login(email: string, password: string): Promise<UserProfile> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.includes('@')) {
      throw new Error('Email không hợp lệ.');
    }
    if (password.length < 4) {
      throw new Error('Mật khẩu phải từ 4 ký tự trở lên.');
    }

    if (hasRemoteApi()) {
      const dto = await httpClient.post<AuthResponseDto>('/api/v1/auth/login', {
        email: trimmedEmail,
        password,
      });
      await rememberAccessToken(dto.accessToken);
      return mapUserProfileDtoToDomain(dto.user);
    }

    const fallbackDto: AuthResponseDto = {
      accessToken: `local_token_${Date.now()}`,
      user: {
        id: `user_${Date.now()}`,
        username: trimmedEmail.split('@')[0],
        email: trimmedEmail,
        elo: 1000,
        wins: 0,
        losses: 0,
        draws: 0,
      },
    };
    setHttpAuthToken(fallbackDto.accessToken);
    return mapUserProfileDtoToDomain(fallbackDto.user);
  },

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<UserProfile> {
    const trimmedName = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedName.length < 2) {
      throw new Error('Tên người chơi phải từ 2 ký tự.');
    }
    if (!trimmedEmail.includes('@')) {
      throw new Error('Email không hợp lệ.');
    }
    if (password.length < 4) {
      throw new Error('Mật khẩu phải từ 4 ký tự trở lên.');
    }

    if (hasRemoteApi()) {
      const dto = await httpClient.post<AuthResponseDto>(
        '/api/v1/auth/register',
        {
          username: trimmedName,
          email: trimmedEmail,
          password,
        },
      );
      await rememberAccessToken(dto.accessToken);
      return mapUserProfileDtoToDomain(dto.user);
    }

    const fallbackDto: AuthResponseDto = {
      accessToken: `local_token_${Date.now()}`,
      user: {
        id: `user_${Date.now()}`,
        username: trimmedName,
        email: trimmedEmail,
        elo: 1000,
        wins: 0,
        losses: 0,
        draws: 0,
      },
    };
    setHttpAuthToken(fallbackDto.accessToken);
    return mapUserProfileDtoToDomain(fallbackDto.user);
  },

  async logout(): Promise<void> {
    try {
      if (hasRemoteApi()) {
        await httpClient.post('/api/v1/auth/logout', {});
      }
    } finally {
      setHttpAuthToken(null);
      try {
        await removeAccessToken();
      } catch {
        // Still end the in-memory session if local storage is unavailable.
      }
    }
  },
};
