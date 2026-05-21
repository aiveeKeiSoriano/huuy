import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Splash } from '../src/components/Splash';

import { useAppReady } from '@/hooks/useAppReady';

export default function RootLayout() {
  const { fontsLoaded, isReady } = useAppReady();

  if (!fontsLoaded) return null;   // native splash still showing
  if (!isReady) return <Splash />; // JS splash for 2.5s
  
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}