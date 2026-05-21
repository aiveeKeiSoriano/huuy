import * as SQLite from 'expo-sqlite';

import {
  saveReminder,
  getReminders,
  markMissedAlarms,
  getReminderById,
  deleteReminder,
  snoozeReminder,
  getSettings,
  saveSettings,
} from '../storageService';
import { DEFAULT_SNOOZE_DURATION } from '../../constants';

// --- mock setup ---

type Row = Record<string, unknown>;

let mockRows: Row[] = [];

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn().mockImplementation(() => Promise.resolve(mockRows)),
  getFirstAsync: jest.fn().mockImplementation((sql: string, ...params: unknown[]) => {
    if (sql.includes('reminders')) {
      const id = params[0];
      return Promise.resolve(mockRows.find((r) => r.id === id) ?? null);
    }
    return Promise.resolve(null);
  }),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

beforeEach(() => {
  mockRows = [];
  jest.clearAllMocks();
  (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
  jest.resetModules();
});

// --- tests ---

describe('saveReminder', () => {
  it('calls INSERT OR REPLACE with correct snake_case columns', async () => {
    await saveReminder({ id: '1', title: 'test', triggerTime: 1000, missedAlarm: false });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO reminders'),
      '1', 'test', 1000, 0,
    );
  });
});

describe('getReminders', () => {
  it('maps snake_case row to camelCase Reminder', async () => {
    mockRows = [{ id: 'a', title: 'hey', trigger_time: 5000, missed_alarm: 0 }];
    const results = await getReminders();
    expect(results).toEqual([{ id: 'a', title: 'hey', triggerTime: 5000, missedAlarm: false }]);
  });

  it('maps missed_alarm 1 to missedAlarm true', async () => {
    mockRows = [{ id: 'b', title: 'yo', trigger_time: 1000, missed_alarm: 1 }];
    const [reminder] = await getReminders();
    expect(reminder.missedAlarm).toBe(true);
  });
});

describe('markMissedAlarms', () => {
  it('calls UPDATE with trigger_time < now check', async () => {
    await markMissedAlarms();
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE reminders SET missed_alarm = 1'),
      expect.any(Number),
    );
  });
});

describe('getReminderById', () => {
  it('returns null when no row found', async () => {
    const result = await getReminderById('nonexistent');
    expect(result).toBeNull();
  });

  it('returns mapped reminder when row exists', async () => {
    // mockDb.getFirstAsync searches mockRows by id — see mock setup above
    mockRows = [{ id: 'x', title: 'hello', trigger_time: 9000, missed_alarm: 0 }];
    const result = await getReminderById('x');
    expect(result).toEqual({ id: 'x', title: 'hello', triggerTime: 9000, missedAlarm: false });
  });
});

describe('deleteReminder', () => {
  it('calls DELETE with the correct id', async () => {
    await deleteReminder('abc');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM reminders'),
      'abc',
    );
  });
});

describe('snoozeReminder', () => {
  it('updates trigger_time and resets missed_alarm to 0', async () => {
    await snoozeReminder('r1', 99999);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('missed_alarm = 0'),
      99999, 'r1',
    );
  });
});

describe('getSettings', () => {
  it('returns DEFAULT_SNOOZE_DURATION when no row exists', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(null);
    const settings = await getSettings();
    expect(settings.snoozeDuration).toBe(DEFAULT_SNOOZE_DURATION);
  });

  it('parses stored value from settings table', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce({ value: '10' });
    const settings = await getSettings();
    expect(settings.snoozeDuration).toBe(10);
  });
});

describe('saveSettings', () => {
  it('stores snoozeDuration as a string under snooze_duration key', async () => {
    await saveSettings({ snoozeDuration: 15 });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO settings'),
      'snooze_duration', '15',
    );
  });
});
