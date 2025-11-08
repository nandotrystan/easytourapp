// app/index.tsx
import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for router to be ready AND auth to be loaded
    if (!rootNavigationState?.key || isLoading) return;

    if (!user) {
      router.replace('/modal');
    } else {
      router.replace('/(tabs)');
    }
  }, [user, rootNavigationState?.key, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

