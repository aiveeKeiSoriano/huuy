import { markMissedAlarms, getReminders } from '../services/storageService';
import type { Reminder } from '../types/reminder';
import type { Result } from '../types/result';
import { ERRORS } from '../constants';

export async function loadRemindersAction(): Promise<Result<Reminder[]>> {
  try {
    await markMissedAlarms().catch(() => {});
    return { success: true, data: await getReminders() };
  } catch {
    return { success: false, error: ERRORS.LOAD_REMINDERS };
  }
}
