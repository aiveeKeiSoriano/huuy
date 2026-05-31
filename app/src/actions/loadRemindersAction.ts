import { markMissedAlarms, getReminders } from '../services/storageService';
import type { Reminder } from '../types/reminder';
import type { Result } from '../types/result';
import i18n from '../i18n';

export async function loadRemindersAction(): Promise<Result<Reminder[]>> {
  try {
    await markMissedAlarms().catch(() => {});
    return { success: true, data: await getReminders() };
  } catch {
    return { success: false, error: i18n.t('errors.loadReminders') };
  }
}
