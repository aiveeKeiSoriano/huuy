import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { useFonts, LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';

import { requestNotificationPermission } from '../utils/requestNotificationPermission';

const SKIP_SPLASH_ROUTES = ['huuy://alarm', 'huuy://create'];

export function useAppReady() {
  const [fontsLoaded] = useFonts({ LilitaOne_400Regular });
  const [showSplash, setShowSplash] = useState(true);
  const [skipSplash, setSkipSplash] = useState(false);

  useEffect(() => {
    requestNotificationPermission();
    Linking.getInitialURL().then((url) => {
      if (SKIP_SPLASH_ROUTES.some((route) => url?.startsWith(route))) setSkipSplash(true);
    });
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    const timer = setTimeout(() => setShowSplash(false), skipSplash ? 0 : 2500);
    return () => clearTimeout(timer);
  }, [fontsLoaded, skipSplash]);

  return { fontsLoaded, showSplash };
}