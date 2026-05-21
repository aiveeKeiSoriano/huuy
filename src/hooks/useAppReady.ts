// hooks/useAppReady.ts
import { useEffect, useState } from 'react';
import { useFonts, LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export function useAppReady() {
  const [fontsLoaded] = useFonts({ LilitaOne_400Regular });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!fontsLoaded) return;

    SplashScreen.hideAsync();
    const timer = setTimeout(() => setShowSplash(false), 2500);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  return { fontsLoaded, showSplash };
}