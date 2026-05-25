import { getReminderById, saveReminder } from '../services/storageService';
import { cancelAlarm, scheduleAlarm, saveAlarmForBoot } from '../services/alarmService';
import type { Result } from '../types/result';
import i18n from '../i18n';

export async function editReminderAction(id: string, title: string, triggerTime: number): Promise<Result> {
  try {
    const existing = await getReminderById(id);
    if (!existing) return { success: false, error: i18n.t('errors.reminderNotFound') };

    cancelAlarm(id);
    await saveReminder({ id, title, triggerTime, missedAlarm: false });
    await scheduleAlarm({ id, title, triggerTime, missedAlarm: false }, i18n.t('notificationTitle'));
    saveAlarmForBoot(id, triggerTime, title, i18n.t('notificationTitle'));
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: i18n.t('errors.editReminder') };
  }
}
