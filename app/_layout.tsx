import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Splash } from '../src/components/Splash';

import { useAppReady } from '@/hooks/useAppReady';
import { colors } from '@/theme';

export default function RootLayout() {
  const { fontsLoaded, showSplash } = useAppReady();

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
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