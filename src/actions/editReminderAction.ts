import { getReminderById, saveReminder } from '../services/storageService';
import { cancelAlarm, scheduleAlarm } from '../services/alarmService';
import type { Result } from '../types/result';
import { ERRORS } from '../constants';

export async function editReminderAction(id: string, title: string, triggerTime: number): Promise<Result> {
  try {
    const existing = await getReminderById(id);
    if (!existing) return { success: false, error: ERRORS.REMINDER_NOT_FOUND };

    cancelAlarm(id);
    await saveReminder({ id, title, triggerTime, missedAlarm: false });
    await scheduleAlarm({ id, title, triggerTime, missedAlarm: false });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: ERRORS.EDIT_REMINDER };
  }
}
