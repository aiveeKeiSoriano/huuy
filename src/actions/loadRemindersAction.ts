import { markMissedAlarms, getReminders, saveReminder } from '../services/storageService';
import type { Reminder } from '../types/reminder';

if (__DEV__) {
  const now = Date.now();
  const DEV_SEEDS: Reminder[] = [
    { id: 'dev-1', title: 'Lorem ipsum dolor sit amet consectetur adipiscing elit ac, senectus vulputate aptent hac nostra curabitur etiam, torquent netus mauris sollicitudin interdum nec rhoncus.', triggerTime: now + 1 * 60 * 60 * 1000, missedAlarm: true },
    { id: 'dev-2', title: 'tubig', triggerTime: now + 25 * 60 * 60 * 1000, missedAlarm: false },
    { id: 'dev-3', title: 'dogfood', triggerTime: now - 1 * 60 * 60 * 1000, missedAlarm: true },
  ];
  DEV_SEEDS.forEach((r) => saveReminder(r));
}

export async function loadRemindersAction(): Promise<Reminder[]> {
  await markMissedAlarms();
  return getReminders();
}
