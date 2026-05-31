import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Splash } from '../src/components/Splash';
import { useAlert } from '../src/components/Alert';

import { useAppReady } from '@/hooks/useAppReady';
import { openFullScreenIntentSettings } from '@/services/alarmService';
import { colors } from '@/theme';
import { requestNotificationPermission } from '@/utils/requestNotificationPermission';

export default function RootLayout() {
  const { t } = useTranslation();
  const {
    fontsLoaded,
    appInitialized,
    showSplash,
    needsFullScreenPermission,
    needsNotificationPermission,
    recheckPermissions,
  } = useAppReady();
  const { alert, showAlert, dismiss } = useAlert();
  const [notifNeverAskAgain, setNotifNeverAskAgain] = useState(false);

  const requestNotification = useCallback(async () => {
    const { neverAskAgain } = await requestNotificationPermission();
    if (neverAskAgain) setNotifNeverAskAgain(true);
    await recheckPermissions();
  }, [recheckPermissions]);

  useEffect(() => {
    if (!appInitialized || showSplash) return;

    if (needsNotificationPermission) {
      if (notifNeverAskAgain) {
        showAlert(t('permissions.notificationMessage'), [
          { label: t('permissions.openSettings'), onPress: () => Linking.openSettings() },
        ]);
      } else {
        showAlert(t('permissions.notificationMessage'), [
          { label: t('permissions.allow'), onPress: requestNotification },
        ]);
      }
    } else if (needsFullScreenPermission) {
      showAlert(t('permissions.fullScreenMessage'), [
        { label: t('permissions.openSettings'), onPress: openFullScreenIntentSettings },
      ]);
    } else {
      dismiss();
    }
  }, [needsNotificationPermission, needsFullScreenPermission, notifNeverAskAgain, appInitialized, showSplash, showAlert, dismiss, requestNotification, t]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recheckPermissions();
    });
    return () => sub.remove();
  }, [recheckPermissions]);

  if (!fontsLoaded || !appInitialized) return null;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {showSplash ? <Splash /> : <Stack screenOptions={{ headerShown: false }} />}
      {alert}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
