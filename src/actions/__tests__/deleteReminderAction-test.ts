import * as storage from '../../services/storageService';
import * as alarm from '../../services/alarmService';
import { deleteReminderAction } from '../deleteReminderAction';

jest.mock('../../services/storageService');
jest.mock('../../services/alarmService');
jest.mock('../../i18n', () => ({ __esModule: true, default: { t: (k: string) => k } }));

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockAlarm = alarm as jest.Mocked<typeof alarm>;

describe('deleteReminderAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.deleteReminder.mockResolvedValue(undefined);
  });

  it('calls cancelAlarm and removeAlarmForBoot before deleteReminder', async () => {
    const order: string[] = [];
    mockAlarm.cancelAlarm.mockImplementation(() => { order.push('cancel'); });
    mockAlarm.removeAlarmForBoot.mockImplementation(() => { order.push('removeboot'); });
    mockStorage.deleteReminder.mockImplementation(async () => { order.push('delete'); });

    await deleteReminderAction('r1');

    expect(order.indexOf('cancel')).toBeLessThan(order.indexOf('delete'));
    expect(order.indexOf('removeboot')).toBeLessThan(order.indexOf('delete'));
  });

  it('passes the id to cancelAlarm, removeAlarmForBoot, and deleteReminder', async () => {
    await deleteReminderAction('r1');

    expect(mockAlarm.cancelAlarm).toHaveBeenCalledWith('r1');
    expect(mockAlarm.removeAlarmForBoot).toHaveBeenCalledWith('r1');
    expect(mockStorage.deleteReminder).toHaveBeenCalledWith('r1');
  });

  it('returns success', async () => {
    const result = await deleteReminderAction('r1');

    expect(result).toEqual({ success: true, data: undefined });
  });

  it('returns deleteReminder error if deleteReminder throws', async () => {
    mockStorage.deleteReminder.mockRejectedValue(new Error('db'));

    const result = await deleteReminderAction('r1');

    expect(result).toEqual({ success: false, error: 'errors.deleteReminder' });
  });
});
