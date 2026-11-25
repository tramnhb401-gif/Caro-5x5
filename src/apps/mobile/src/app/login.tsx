import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LoginScreen } from '../screens/LoginScreen';
import { useAuth } from '../hooks/useAuth';

export default function LoginRoute() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  return <LoginScreen />;
}