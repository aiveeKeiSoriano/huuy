import uuid from 'react-native-uuid';

import { saveReminder, deleteReminder } from '../services/storageService';
import { scheduleAlarm } from '../services/alarmService';
import type { Result } from '../types/result';
import { ERRORS } from '../constants';

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
    return { success: false, error: ERRORS.CREATE_REMINDER };
  }

  try {
    await scheduleAlarm(reminder);
    return { success: true, data: undefined };
  } catch {
    await deleteReminder(reminder.id).catch(() => {});
    return { success: false, error: ERRORS.SCHEDULE_ALARM };
  }
}
