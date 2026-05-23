import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { useFonts, LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';

import { requestNotificationPermission } from '../utils/requestNotificationPermission';
import { getSettings } from '../services/storageService';
import i18n from '../i18n';

const SKIP_SPLASH_ROUTES = ['huuy://alarm', 'huuy://create'];

export function useAppReady() {
  const [fontsLoaded] = useFonts({ LilitaOne_400Regular });
  const [showSplash, setShowSplash] = useState(true);
  const [skipSplash, setSkipSplash] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      requestNotificationPermission();
      const [url, settings] = await Promise.all([
        Linking.getInitialURL(),
        getSettings(),
      ]);
      if (SKIP_SPLASH_ROUTES.some((route) => url?.startsWith(route))) setSkipSplash(true);
      await i18n.changeLanguage(settings.language);
      setAppInitialized(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !appInitialized || skipSplash) return;
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, [fontsLoaded, appInitialized, skipSplash]);

  return { fontsLoaded, appInitialized, showSplash: !skipSplash && showSplash };
}