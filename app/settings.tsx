import { useCallback, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';

import { Text } from '../src/components/Text';
import { ArrowLeftIcon } from '../src/components/Icons';
import { getSettings, saveSettings } from '../src/services/storageService';
import { colors, spacing, radii, fonts } from '../src/theme';
import i18n from '../src/i18n';
import type { Language } from '../src/types/settings';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [language, setLanguage] = useState<Language>('tl');
  const [snoozeDuration, setSnoozeDuration] = useState(5);
  const [snoozeInput, setSnoozeInput] = useState('5');

  useFocusEffect(
    useCallback(() => {
      getSettings().then((s) => {
        setLanguage(s.language);
        setSnoozeDuration(s.snoozeDuration);
        setSnoozeInput(String(s.snoozeDuration));
      });
    }, []),
  );

  const handleLanguageChange = async (lang: Language) => {
    setLanguage(lang);
    await i18n.changeLanguage(lang);
    const settings = await getSettings();
    await saveSettings({ ...settings, language: lang });
  };

  const handleSnoozeBlur = async () => {
    const parsed = parseInt(snoozeInput, 10);
    const minutes = isNaN(parsed) || parsed < 1 ? snoozeDuration : parsed;
    setSnoozeInput(String(minutes));
    setSnoozeDuration(minutes);
    const settings = await getSettings();
    await saveSettings({ ...settings, snoozeDuration: minutes });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.back}
      >
        <ArrowLeftIcon size={28} color={colors.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
        <View style={styles.options}>
          <TouchableOpacity
            style={[styles.option, language === 'tl' && styles.optionActive]}
            onPress={() => handleLanguageChange('tl')}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, language === 'tl' && styles.optionTextActive]}>
              {t('settings.tagalog')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, language === 'en' && styles.optionActive]}
            onPress={() => handleLanguageChange('en')}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>
              {t('settings.english')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.snooze')}</Text>
        <View style={styles.snoozeRow}>
          <TextInput
            style={styles.snoozeInput}
            value={snoozeInput}
            onChangeText={(v) => setSnoozeInput(v.replace(/[^0-9]/g, ''))}
            onBlur={handleSnoozeBlur}
            keyboardType="number-pad"
            maxLength={3}
            selectTextOnFocus
          />
          <Text style={styles.snoozeUnit}>min</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  back: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.highlight,
    fontSize: 32,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.highlight,
    fontSize: 14,
    marginBottom: spacing.sm,
    opacity: 0.5,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  snoozeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  snoozeInput: {
    backgroundColor: colors.tertiary,
    borderRadius: radii.md,
    color: colors.highlight,
    fontFamily: fonts.lilita,
    fontSize: 24,
    width: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  snoozeUnit: {
    color: colors.highlight,
    fontSize: 16,
    opacity: 0.5,
  },
  option: {
    backgroundColor: colors.tertiary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.highlight,
    fontSize: 16,
  },
  optionTextActive: {
    color: colors.background,
  },
});
