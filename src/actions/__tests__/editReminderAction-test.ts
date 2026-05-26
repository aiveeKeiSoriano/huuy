import * as storage from '../../services/storageService';
import * as alarm from '../../services/alarmService';
import { editReminderAction } from '../editReminderAction';
import { ERRORS } from '../../constants';

jest.mock('../../services/storageService');
jest.mock('../../services/alarmService');
jest.mock('../../i18n', () => ({ __esModule: true, default: { t: (k: string) => k } }));

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockAlarm = alarm as jest.Mocked<typeof alarm>;

const existing = { id: 'r1', title: 'old title', triggerTime: 1000, missedAlarm: false };

describe('editReminderAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlarm.canScheduleExactAlarms.mockResolvedValue(true);
    mockStorage.getReminderById.mockResolvedValue(existing);
    mockStorage.saveReminder.mockResolvedValue(undefined);
    mockAlarm.scheduleAlarm.mockResolvedValue(undefined);
  });

  it('returns EXACT_ALARM_PERMISSION without touching state if permission denied', async () => {
    mockAlarm.canScheduleExactAlarms.mockResolvedValue(false);

    const result = await editReminderAction('r1', 'new', 9999999);

    expect(result).toEqual({ success: false, error: ERRORS.EXACT_ALARM_PERMISSION });
    expect(mockAlarm.cancelAlarm).not.toHaveBeenCalled();
    expect(mockStorage.saveReminder).not.toHaveBeenCalled();
  });

  it('returns reminderNotFound error if reminder does not exist', async () => {
    mockStorage.getReminderById.mockResolvedValue(null);

    const result = await editReminderAction('r1', 'new', 9999999);

    expect(result).toEqual({ success: false, error: 'errors.reminderNotFound' });
    expect(mockAlarm.cancelAlarm).not.toHaveBeenCalled();
  });

  it('calls cancelAlarm before scheduleAlarm', async () => {
    const order: string[] = [];
    mockAlarm.cancelAlarm.mockImplementation(() => { order.push('cancel'); });
    mockAlarm.scheduleAlarm.mockImplementation(async () => { order.push('schedule'); return undefined; });

    await editReminderAction('r1', 'new', 9999999);

    expect(order).toEqual(['cancel', 'schedule']);
  });

  it('passes missedAlarm: false to saveReminder', async () => {
    await editReminderAction('r1', 'new title', 9999999);

    expect(mockStorage.saveReminder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'r1', title: 'new title', triggerTime: 9999999, missedAlarm: false }),
    );
  });

  it('returns EXACT_ALARM_PERMISSION if scheduleAlarm rejects with PERMISSION_DENIED', async () => {
    const err = Object.assign(new Error('denied'), { code: 'PERMISSION_DENIED' });
    mockAlarm.scheduleAlarm.mockRejectedValue(err);

    const result = await editReminderAction('r1', 'new', 9999999);

    expect(result).toEqual({ success: false, error: ERRORS.EXACT_ALARM_PERMISSION });
  });

  it('calls saveAlarmForBoot and returns success', async () => {
    const result = await editReminderAction('r1', 'new title', 9999999);

    expect(mockAlarm.saveAlarmForBoot).toHaveBeenCalledWith('r1', 9999999, 'new title', expect.any(String));
    expect(result).toEqual({ success: true, data: undefined });
  });

  it('returns editReminder error on unexpected throw', async () => {
    mockAlarm.scheduleAlarm.mockRejectedValue(new Error('unexpected'));

    const result = await editReminderAction('r1', 'new', 9999999);

    expect(result).toEqual({ success: false, error: 'errors.editReminder' });
  });
});
