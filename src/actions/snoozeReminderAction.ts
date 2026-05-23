import { getSettings, snoozeReminder } from '../services/storageService';
import { cancelAlarm, scheduleAlarm } from '../services/alarmService';
import type { Result } from '../types/result';
import { ERRORS } from '../constants';

export async function snoozeReminderAction(reminderId: string): Promise<Result> {
  try {
    const { snoozeDuration } = await getSettings();
    const newTriggerTime = Date.now() + snoozeDuration * 60_000;

    cancelAlarm(reminderId);
    await scheduleAlarm({ id: reminderId, title: '', triggerTime: newTriggerTime, missedAlarm: false });
    await snoozeReminder(reminderId, newTriggerTime);

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: ERRORS.SNOOZE_REMINDER };
  }
}
