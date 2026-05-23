import { NativeModules } from 'react-native';

import type { Reminder } from '../types/reminder';
import { makeLogger } from '../utils/log';

const { AlarmModule, NavigationModule } = NativeModules;
const log = makeLogger('alarmService');

export async function scheduleAlarm(reminder: Reminder, notificationTitle = ''): Promise<void> {
  log.info(`schedule id=${reminder.id} at=${reminder.triggerTime}`);
  try {
    await AlarmModule.scheduleAlarm(reminder.id, reminder.title, reminder.triggerTime, notificationTitle);
  } catch (err) {
    log.error(`schedule failed id=${reminder.id}`, err);
    throw err;
  }
}

export function cancelAlarm(reminderId: string): void {
  log.info(`cancel id=${reminderId}`);
  try {
    AlarmModule.cancelAlarm(reminderId);
  } catch (err) {
    log.error(`cancel failed id=${reminderId}`, err);
  }
}

export function notifyAlarmReady(): void {
  log.info('notifyAlarmReady');
  try {
    AlarmModule.notifyAlarmReady();
  } catch (err) {
    log.error('notifyAlarmReady failed', err);
  }
}

export function goHome(): void {
  log.info('goHome');
  try {
    NavigationModule.goHome();
  } catch (err) {
    log.error('goHome failed', err);
  }
}
