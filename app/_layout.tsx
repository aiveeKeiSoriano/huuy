import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Splash } from '../src/components/Splash';

import { useAppReady } from '@/hooks/useAppReady';
import { openFullScreenIntentSettings } from '@/services/alarmService';
import { colors } from '@/theme';

export default function RootLayout() {
  const { fontsLoaded, appInitialized, showSplash, needsFullScreenPermission } = useAppReady();

  useEffect(() => {
    if (!needsFullScreenPermission || showSplash) return;
    Alert.alert(
      'Permission needed',
      'Allow Huuy to show full-screen alerts so your alarm can wake the screen.',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Open Settings', onPress: openFullScreenIntentSettings },
      ],
    );
  }, [needsFullScreenPermission, showSplash]);

  if (!fontsLoaded || !appInitialized) return null;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {showSplash ? <Splash /> : <Stack screenOptions={{ headerShown: false }} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
});