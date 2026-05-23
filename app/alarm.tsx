import { useCallback, useEffect, useState } from "react";
import { BackHandler, StyleSheet, TouchableOpacity, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { Text } from "../src/components/Text";
import { Loading } from "../src/components/Loading";
import { SnoozeIcon, TrashIcon } from "../src/components/Icons";
import { getReminderById } from "../src/services/storageService";
import { notifyAlarmReady } from "../src/services/alarmService";
import { snoozeReminderAction } from "../src/actions/snoozeReminderAction";
import { deleteReminderAction } from "../src/actions/deleteReminderAction";
import { colors, spacing, radii } from "../src/theme";
import { makeLogger } from "../src/utils/log";
import type { Reminder } from "../src/types/reminder";

const log = makeLogger("alarm");

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AlarmScreen() {
  const { reminderId } = useLocalSearchParams<{ reminderId: string }>();
  const { t } = useTranslation();
  const [reminder, setReminder] = useState<Reminder | null | undefined>(
    reminderId ? undefined : null,
  );
  const [now, setNow] = useState(() => Date.now());
  const [acting, setActing] = useState(false);

  // Signal AlarmActivity that JS has mounted — it will finish itself immediately
  useEffect(() => {
    log.info("mounted");
    notifyAlarmReady();
  }, []);

  // Block hardware back button — user must snooze or trash to exit
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  // Keep the displayed time current, updating every minute
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function fetchReminder(id: string) {
    log.info(`fetching id=${id}`);
    try {
      const result = await getReminderById(id);
      if (result) log.info(`loaded "${result.title}"`);
      else log.error(`not found id=${id}`);
      setReminder(result);
    } catch (err: unknown) {
      log.error(`fetch threw id=${id}`, err);
      setReminder(null);
    }
  }

  // Fetch the reminder details from SQLite
  useFocusEffect(
    useCallback(() => {
      if (!reminderId) return;
      fetchReminder(reminderId);
    }, [reminderId]),
  );
  
  const handleSnooze = async () => {
    if (acting || !reminder) return;
    setActing(true);
    log.info(`snooze id=${reminder.id}`);
    const result = await snoozeReminderAction(reminder.id);
    if (!result.success) log.error(`snooze failed: ${result.error}`);
    BackHandler.exitApp();
  };

  const handleDelete = async () => {
    if (acting || !reminder) return;
    setActing(true);
    log.info(`delete id=${reminder.id}`);
    const result = await deleteReminderAction(reminder.id);
    if (!result.success) log.error(`delete failed: ${result.error}`);
    BackHandler.exitApp();
  };

  if (reminder === undefined) return <Loading />;

  if (reminder === null) {
    return (
      <>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <View style={[styles.container, styles.center]}>
          <Text style={styles.errorText}>{t('errors.reminderGone')}</Text>
          <TouchableOpacity
            onPress={() => BackHandler.exitApp()}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Text style={styles.closeText}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.label}>{t('alarmLabel')}</Text>
          <Text style={styles.title}>{reminder.title}</Text>
          <Text style={styles.currentTime}>{formatTime(now)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleSnooze}
            disabled={acting}
            style={[styles.actionButton, styles.snoozeButton]}
            activeOpacity={0.8}
          >
            <SnoozeIcon size={40} color={colors.background} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={acting}
            style={[styles.actionButton, styles.trashButton]}
            activeOpacity={0.8}
          >
            <TrashIcon size={38} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  currentTime: {
    color: colors.secondary,
    fontSize: 20,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  label: {
    color: colors.highlight,
    fontSize: 16,
    marginBottom: spacing.sm,
    opacity: 0.4,
    textAlign: "center",
  },
  title: {
    color: colors.highlight,
    fontSize: 52,
    lineHeight: 60,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: radii.full,
    elevation: 4,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  snoozeButton: {
    backgroundColor: colors.secondary,
  },
  trashButton: {
    backgroundColor: colors.primary,
  },
  errorText: {
    color: colors.highlight,
    fontSize: 16,
    opacity: 0.5,
  },
  closeButton: {
    backgroundColor: colors.tertiary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeText: {
    color: colors.highlight,
    fontSize: 16,
  },
});
