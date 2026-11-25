import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'caro.access-token';

export async function loadAccessToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined'
      ? null
      : window.localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveAccessToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function removeAccessToken(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
