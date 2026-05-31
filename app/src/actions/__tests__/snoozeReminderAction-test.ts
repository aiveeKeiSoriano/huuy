import * as storage from '../../services/storageService';
import * as alarm from '../../services/alarmService';
import { snoozeReminderAction } from '../snoozeReminderAction';

jest.mock('../../services/storageService');
jest.mock('../../services/alarmService');
jest.mock('../../i18n', () => ({ __esModule: true, default: { t: (k: string) => k } }));

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockAlarm = alarm as jest.Mocked<typeof alarm>;

const reminder = { id: 'r1', title: 'buy milk', triggerTime: 1000, missedAlarm: false };

describe('snoozeReminderAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getSettings.mockResolvedValue({ snoozeDuration: 5, language: 'en' });
    mockStorage.getReminderById.mockResolvedValue(reminder);
    mockAlarm.scheduleAlarm.mockResolvedValue(undefined);
    mockStorage.snoozeReminder.mockResolvedValue(undefined);
  });

  it('reads snoozeDuration from settings', async () => {
    await snoozeReminderAction('r1');

    expect(mockStorage.getSettings).toHaveBeenCalled();
  });

  it('new trigger time is Date.now() + snoozeDuration * 60000', async () => {
    const now = 5_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);
    mockStorage.getSettings.mockResolvedValue({ snoozeDuration: 10, language: 'en' });

    await snoozeReminderAction('r1');

    expect(mockAlarm.scheduleAlarm).toHaveBeenCalledWith(
      expect.objectContaining({ triggerTime: now + 10 * 60_000 }),
      expect.any(String),
    );

    jest.spyOn(Date, 'now').mockRestore();
  });

  it('calls cancelAlarm before scheduleAlarm', async () => {
    const order: string[] = [];
    mockAlarm.cancelAlarm.mockImplementation(() => { order.push('cancel'); });
    mockAlarm.scheduleAlarm.mockImplementation(async () => { order.push('schedule'); return undefined; });

    await snoozeReminderAction('r1');

    expect(order).toEqual(['cancel', 'schedule']);
  });

  it('calls saveAlarmForBoot with the new trigger time and reminder title', async () => {
    const now = 5_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    await snoozeReminderAction('r1');

    expect(mockAlarm.saveAlarmForBoot).toHaveBeenCalledWith(
      'r1', now + 5 * 60_000, reminder.title, expect.any(String),
    );

    jest.spyOn(Date, 'now').mockRestore();
  });

  it('returns success', async () => {
    const result = await snoozeReminderAction('r1');

    expect(result).toEqual({ success: true, data: undefined });
  });

  it('returns snoozeReminder error if action throws', async () => {
    mockStorage.getSettings.mockRejectedValue(new Error('fail'));

    const result = await snoozeReminderAction('r1');

    expect(result).toEqual({ success: false, error: 'errors.snoozeReminder' });
  });
});
