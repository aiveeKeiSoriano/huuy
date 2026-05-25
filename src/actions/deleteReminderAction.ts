import { deleteReminder } from '../services/storageService';
import { cancelAlarm, removeAlarmForBoot } from '../services/alarmService';
import type { Result } from '../types/result';
import i18n from '../i18n';

export async function deleteReminderAction(id: string): Promise<Result> {
  try {
    cancelAlarm(id);
    removeAlarmForBoot(id);
    await deleteReminder(id);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: i18n.t('errors.deleteReminder') };
  }
}
