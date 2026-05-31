import * as storage from '../../services/storageService';
import { loadRemindersAction } from '../loadRemindersAction';

jest.mock('../../services/storageService');
jest.mock('../../i18n', () => ({ __esModule: true, default: { t: (k: string) => k } }));

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('loadRemindersAction', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls markMissedAlarms before getReminders', async () => {
    const order: string[] = [];
    mockStorage.markMissedAlarms.mockImplementation(async () => { order.push('mark'); });
    mockStorage.getReminders.mockImplementation(async () => { order.push('get'); return []; });

    await loadRemindersAction();

    expect(order).toEqual(['mark', 'get']);
  });

  it('returns reminders on success', async () => {
    const reminders = [{ id: '1', title: 'test', triggerTime: 1000, missedAlarm: false }];
    mockStorage.markMissedAlarms.mockResolvedValue(undefined);
    mockStorage.getReminders.mockResolvedValue(reminders);

    const result = await loadRemindersAction();

    expect(result).toEqual({ success: true, data: reminders });
  });

  it('proceeds even if markMissedAlarms throws', async () => {
    mockStorage.markMissedAlarms.mockRejectedValue(new Error('mark fail'));
    mockStorage.getReminders.mockResolvedValue([]);

    const result = await loadRemindersAction();

    expect(result).toEqual({ success: true, data: [] });
  });

  it('returns error if getReminders throws', async () => {
    mockStorage.markMissedAlarms.mockResolvedValue(undefined);
    mockStorage.getReminders.mockRejectedValue(new Error('db fail'));

    const result = await loadRemindersAction();

    expect(result).toEqual({ success: false, error: 'errors.loadReminders' });
  });
});
