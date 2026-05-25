import uuid from 'react-native-uuid';

import { saveReminder, deleteReminder } from '../services/storageService';
import { scheduleAlarm, saveAlarmForBoot } from '../services/alarmService';
import type { Result } from '../types/result';
import i18n from '../i18n';

export async function createReminderAction(title: string, triggerTime: number): Promise<Result> {
  const reminder = {
    id: uuid.v4() as string,
    title,
    triggerTime,
    missedAlarm: false,
  };

  try {
    await saveReminder(reminder);
  } catch {
    return { success: false, error: i18n.t('errors.createReminder') };
  }

  try {
    await scheduleAlarm(reminder, i18n.t('notificationTitle'));
    saveAlarmForBoot(reminder.id, reminder.triggerTime, reminder.title, i18n.t('notificationTitle'));
    return { success: true, data: undefined };
  } catch {
    await deleteReminder(reminder.id).catch(() => {});
    return { success: false, error: i18n.t('errors.scheduleAlarm') };
  }
}
