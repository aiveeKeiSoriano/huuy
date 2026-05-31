import * as SQLite from 'expo-sqlite';

import type { Reminder } from '../types/reminder';
import type { Settings } from '../types/settings';
import { DEFAULT_SNOOZE_DURATION } from '../constants';

type ReminderRow = {
  id: string;
  title: string;
  trigger_time: number;
  missed_alarm: number;
};

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (!initPromise) {
    initPromise = (async () => {
      const database = await SQLite.openDatabaseAsync('huuy.db');
      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS reminders (id TEXT PRIMARY KEY, title TEXT NOT NULL, trigger_time INTEGER NOT NULL, missed_alarm INTEGER NOT NULL DEFAULT 0);',
      );
      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);',
      );
      db = database;
      return database;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

function rowToReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    title: row.title,
    triggerTime: row.trigger_time,
    missedAlarm: row.missed_alarm === 1,
  };
}

export async function saveReminder(reminder: Reminder): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    'INSERT OR REPLACE INTO reminders (id, title, trigger_time, missed_alarm) VALUES (?, ?, ?, ?)',
    reminder.id,
    reminder.title,
    reminder.triggerTime,
    reminder.missedAlarm ? 1 : 0,
  );
}

export async function getReminders(): Promise<Reminder[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<ReminderRow>(
    'SELECT * FROM reminders ORDER BY trigger_time ASC',
  );
  return rows.map(rowToReminder);
}

export async function markMissedAlarms(): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    'UPDATE reminders SET missed_alarm = 1 WHERE trigger_time < ? AND missed_alarm = 0',
    Date.now(),
  );
}

export async function getReminderById(id: string): Promise<Reminder | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<ReminderRow>(
    'SELECT * FROM reminders WHERE id = ?',
    id,
  );
  return row ? rowToReminder(row) : null;
}

export async function deleteReminder(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM reminders WHERE id = ?', id);
}

export async function snoozeReminder(id: string, newTriggerTime: number): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    'UPDATE reminders SET trigger_time = ?, missed_alarm = 0 WHERE id = ?',
    newTriggerTime,
    id,
  );
}

export async function getSettings(): Promise<Settings> {
  const database = await getDb();
  const [snoozeRow, langRow] = await Promise.all([
    database.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'snooze_duration'),
    database.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'language'),
  ]);
  return {
    snoozeDuration: snoozeRow ? parseInt(snoozeRow.value, 10) : DEFAULT_SNOOZE_DURATION,
    language: (langRow?.value ?? 'tl') as Settings['language'],
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const database = await getDb();
  await Promise.all([
    database.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'snooze_duration', String(settings.snoozeDuration)),
    database.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'language', settings.language),
  ]);
}
