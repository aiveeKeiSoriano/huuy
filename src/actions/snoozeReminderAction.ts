import { getSettings, getReminderById, snoozeReminder } from '../services/storageService';
import { cancelAlarm, scheduleAlarm, saveAlarmForBoot } from '../services/alarmService';
import type { Result } from '../types/result';
import i18n from '../i18n';

export async function snoozeReminderAction(reminderId: string): Promise<Result> {
  try {
    const { snoozeDuration } = await getSettings();
    const newTriggerTime = Date.now() + snoozeDuration * 60_000;

    const reminder = await getReminderById(reminderId);
    cancelAlarm(reminderId);
    await scheduleAlarm(
      { id: reminderId, title: reminder?.title ?? '', triggerTime: newTriggerTime, missedAlarm: false },
      i18n.t('notificationTitle'),
    );
    await snoozeReminder(reminderId, newTriggerTime);
    saveAlarmForBoot(reminderId, newTriggerTime, reminder?.title ?? '', i18n.t('notificationTitle'));

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: i18n.t('errors.snoozeReminder') };
  }
}
