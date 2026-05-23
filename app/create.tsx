import { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import type { Reminder } from "../src/types/reminder";
import { Text } from "../src/components/Text";
import { ArrowLeftIcon } from "../src/components/Icons";
import { useToast } from "../src/components/Toast";
import { getReminderById, getReminders } from "../src/services/storageService";
import { goHome } from "../src/services/alarmService";
import { createReminderAction } from "../src/actions/createReminderAction";
import { editReminderAction } from "../src/actions/editReminderAction";
import { colors, spacing, radii, fonts } from "../src/theme";
import {
  MIN_REMINDER_LEAD_MS,
  DEFAULT_REMINDER_LEAD_MS,
  REMINDER_CONFLICT_WINDOW_MS,
  ERRORS,
} from "../src/constants";

function computeNextOccurrence(hours: number, minutes: number): number {
  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(hours, minutes, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate.getTime();
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CreateScreen() {
  const router = useRouter();
  const { id, source } = useLocalSearchParams<{
    id?: string;
    source?: string;
  }>();

  const [title, setTitle] = useState("");
  const [triggerTime, setTriggerTime] = useState<number | null>(() =>
    id ? null : Date.now() + DEFAULT_REMINDER_LEAD_MS,
  );
  const [titleError, setTitleError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const { toast, showToast } = useToast();

  const onReminderLoaded = useCallback(
    (reminder: Reminder | null) => {
      if (!reminder) {
        showToast(ERRORS.REMINDER_GONE, { persistent: true });
        router.back();
        return;
      }
      setTitle(reminder.title);
      setTriggerTime(reminder.triggerTime);
      setLoading(false);
    },
    [router, showToast],
  );

  useEffect(() => {
    if (id) getReminderById(id).then(onReminderLoaded);
  }, [id, onReminderLoaded]);

  const openTimePicker = () => {
    DateTimePickerAndroid.open({
      mode: "time",
      value: triggerTime ? new Date(triggerTime) : new Date(),
      onChange: (event, date) => {
        if (event.type === "set" && date) {
          setTriggerTime(
            computeNextOccurrence(date.getHours(), date.getMinutes()),
          );
          setTimeError("");
        }
      },
    });
  };

  async function validateReminder(
    t: string,
    time: number | null,
  ): Promise<boolean> {
    if (!t.trim()) {
      setTitleError(ERRORS.TITLE_REQUIRED);
      return false;
    }
    if (time === null) {
      setTimeError(ERRORS.TIME_REQUIRED);
      return false;
    }
    if (time - Date.now() < MIN_REMINDER_LEAD_MS) {
      setTimeError(ERRORS.TIME_TOO_SOON);
      return false;
    }

    const reminders = await getReminders();
    const conflict = reminders.some((r) => {
      if (id && r.id === id) return false;
      return Math.abs(r.triggerTime - time) < REMINDER_CONFLICT_WINDOW_MS;
    });
    if (conflict) {
      setTimeError(ERRORS.TIME_CONFLICT);
      return false;
    }

    return true;
  }

  const handleSave = async () => {
    setTitleError("");
    setTimeError("");

    const isValid = await validateReminder(title, triggerTime);
    if (!isValid) return;

    setSaving(true);
    const result = id
      ? await editReminderAction(id, title.trim(), triggerTime!)
      : await createReminderAction(title.trim(), triggerTime!);
    setSaving(false);

    if (!result.success) {
      showToast(result.error, { persistent: true });
      return;
    }

    if (source === "widget") {
      goHome();
    } else {
      router.back();
    }
  };

  if (loading) return null;

  return (
    <KeyboardAvoidingView style={styles.outer} behavior="padding">
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.back}
        >
          <ArrowLeftIcon size={28} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.label}>huuy remind mo nga sakin yung:</Text>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            setTitleError("");
          }}
          multiline
          autoFocus={!id}
          placeholder="..."
          placeholderTextColor={colors.highlight + "55"}
        />
        {titleError ? <Text style={styles.error}>{titleError}</Text> : null}

        <TouchableOpacity onPress={openTimePicker} style={styles.timeButton}>
          <Text
            style={[styles.timeText, !triggerTime && styles.timePlaceholder]}
          >
            {triggerTime ? formatTime(triggerTime) : "pick a time"}
          </Text>
        </TouchableOpacity>
        {timeError ? <Text style={styles.error}>{timeError}</Text> : null}

        {toast}
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.saveText}>save</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  back: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.highlight,
    fontSize: 18,
    marginBottom: spacing.sm,
    opacity: 0.7,
  },
  input: {
    backgroundColor: colors.tertiary,
    borderRadius: radii.md,
    color: colors.highlight,
    fontFamily: fonts.lilita,
    fontSize: 28,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: "center",
  },
  timeButton: {
    backgroundColor: colors.tertiary,
    borderRadius: radii.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  timeText: {
    color: colors.highlight,
    fontSize: 32,
    textAlign: "center",
  },
  timePlaceholder: {
    opacity: 0.4,
  },
  error: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 4,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    elevation: 4,
    justifyContent: "center",
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: colors.background,
    fontSize: 20,
  },
});
