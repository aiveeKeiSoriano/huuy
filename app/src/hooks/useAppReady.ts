import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { useFonts, LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';

import { checkNotificationGranted, requestNotificationPermission } from '../utils/requestNotificationPermission';
import { canUseFullScreenIntent } from '../services/alarmService';
import { getSettings } from '../services/storageService';
import i18n from '../i18n';

const SKIP_SPLASH_ROUTES = ['huuy://alarm', 'huuy://create'];


export function useAppReady() {
  const [fontsLoaded] = useFonts({ LilitaOne_400Regular });
  const [showSplash, setShowSplash] = useState(true);
  const [skipSplash, setSkipSplash] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [needsFullScreenPermission, setNeedsFullScreenPermission] = useState(false);
  const [needsNotificationPermission, setNeedsNotificationPermission] = useState(false);

  useEffect(() => {
    async function init() {
      const { granted: notifGranted } = await requestNotificationPermission();
      const [url, settings] = await Promise.all([
        Linking.getInitialURL(),
        getSettings(),
      ]);
      const isAlarmFlow = SKIP_SPLASH_ROUTES.some((route) => url?.startsWith(route));
      if (isAlarmFlow) setSkipSplash(true);
      await i18n.changeLanguage(settings.language);
      if (Platform.OS === 'android' && !isAlarmFlow) {
        if (!notifGranted) setNeedsNotificationPermission(true);
        const fsiGranted = await canUseFullScreenIntent();
        if (!fsiGranted) setNeedsFullScreenPermission(true);
      }
      setAppInitialized(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !appInitialized || skipSplash) return;
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, [fontsLoaded, appInitialized, skipSplash]);

  const recheckPermissions = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    const notifGranted = await checkNotificationGranted();
    setNeedsNotificationPermission(!notifGranted);
    const fsiGranted = await canUseFullScreenIntent();
    setNeedsFullScreenPermission(!fsiGranted);
  }, []);

  return {
    fontsLoaded,
    appInitialized,
    showSplash: !skipSplash && showSplash,
    needsFullScreenPermission,
    needsNotificationPermission,
    recheckPermissions,
  };
}
