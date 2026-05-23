import { deleteReminder } from '../services/storageService';
import { cancelAlarm } from '../services/alarmService';
import type { Result } from '../types/result';
import { ERRORS } from '../constants';

export async function deleteReminderAction(id: string): Promise<Result> {
  try {
    cancelAlarm(id);
    await deleteReminder(id);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: ERRORS.DELETE_REMINDER };
  }
}
