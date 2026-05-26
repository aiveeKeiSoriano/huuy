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

export async function canScheduleExactAlarms(): Promise<boolean> {
  try {
    return await AlarmModule.canScheduleExactAlarms();
  } catch (err) {
    log.error('canScheduleExactAlarms failed', err);
    return true;
  }
}

export async function canUseFullScreenIntent(): Promise<boolean> {
  try {
    return await AlarmModule.canUseFullScreenIntent();
  } catch (err) {
    log.error('canUseFullScreenIntent failed', err);
    return true;
  }
}

export function openExactAlarmSettings(): void {
  try {
    AlarmModule.openExactAlarmSettings();
  } catch (err) {
    log.error('openExactAlarmSettings failed', err);
  }
}

export function openFullScreenIntentSettings(): void {
  try {
    AlarmModule.openFullScreenIntentSettings();
  } catch (err) {
    log.error('openFullScreenIntentSettings failed', err);
  }
}

export function saveAlarmForBoot(id: string, triggerTime: number, title: string, notificationTitle: string): void {
  log.info(`saveAlarmForBoot id=${id}`);
  try {
    AlarmModule.saveAlarmForBoot(id, triggerTime, title, notificationTitle);
  } catch (err) {
    log.error(`saveAlarmForBoot failed id=${id}`, err);
  }
}

export function removeAlarmForBoot(id: string): void {
  log.info(`removeAlarmForBoot id=${id}`);
  try {
    AlarmModule.removeAlarmForBoot(id);
  } catch (err) {
    log.error(`removeAlarmForBoot failed id=${id}`, err);
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
