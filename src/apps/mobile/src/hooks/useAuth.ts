import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');
  }
  return fallback;
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const applyMatchOutcome = useAuthStore((state) => state.applyMatchOutcome);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (profile) => setUser(profile),
  });

  const registerMutation = useMutation({
    mutationFn: ({
      username,
      email,
      password,
    }: {
      username: string;
      email: string;
      password: string;
    }) => authService.register(username, email, password),
    onSuccess: (profile) => setUser(profile),
  });

  const login = async (
    email: string,
    password: string,
  ): Promise<string | null> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return null;
    } catch (err) {
      return getErrorMessage(err, 'Đăng nhập thất bại.');
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ): Promise<string | null> => {
    try {
      await registerMutation.mutateAsync({ username, email, password });
      return null;
    } catch (err) {
      return getErrorMessage(err, 'Đăng ký thất bại.');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      clearUser();
    }
  };

  return {
    user,
    isAuthReady,
    isSubmitting: loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
    applyMatchOutcome,
  };
}
