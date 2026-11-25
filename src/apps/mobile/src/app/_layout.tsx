import '../../global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

function RootStackNav() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthReady } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthReady = useAuthStore((state) => state.setAuthReady);

  useEffect(() => {
    let active = true;
    void authService
      .restoreSession()
      .then((profile) => {
        if (active && profile) setUser(profile);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setAuthReady(true);
      });
    return () => {
      active = false;
    };
  }, [setAuthReady, setUser]);

  useEffect(() => {
    if (!isAuthReady) return;
    const inLoginRoute = segments[0] === 'login';

    if (!user && !inLoginRoute) {
      router.replace('/login');
    } else if (user && inLoginRoute) {
      router.replace('/');
    }
  }, [isAuthReady, user, segments, router]);

  if (!isAuthReady) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 30,
          },
        },
      }),
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootStackNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
