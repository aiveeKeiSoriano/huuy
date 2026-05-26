import * as storage from '../../services/storageService';
import * as alarm from '../../services/alarmService';
import { createReminderAction } from '../createReminderAction';
import { ERRORS } from '../../constants';

jest.mock('react-native-uuid', () => ({ v4: () => 'test-uuid' }));
jest.mock('../../services/storageService');
jest.mock('../../services/alarmService');
jest.mock('../../i18n', () => ({ __esModule: true, default: { t: (k: string) => k } }));

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockAlarm = alarm as jest.Mocked<typeof alarm>;

describe('createReminderAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlarm.canScheduleExactAlarms.mockResolvedValue(true);
    mockStorage.saveReminder.mockResolvedValue(undefined);
    mockAlarm.scheduleAlarm.mockResolvedValue(undefined);
    mockStorage.deleteReminder.mockResolvedValue(undefined);
  });

  it('returns EXACT_ALARM_PERMISSION without touching storage if permission denied', async () => {
    mockAlarm.canScheduleExactAlarms.mockResolvedValue(false);

    const result = await createReminderAction('title', 9999999);

    expect(result).toEqual({ success: false, error: ERRORS.EXACT_ALARM_PERMISSION });
    expect(mockStorage.saveReminder).not.toHaveBeenCalled();
  });

  it('generates a uuid and passes it to saveReminder', async () => {
    await createReminderAction('test title', 9999999);

    expect(mockStorage.saveReminder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-uuid', title: 'test title', triggerTime: 9999999, missedAlarm: false }),
    );
  });

  it('calls saveReminder before scheduleAlarm', async () => {
    const order: string[] = [];
    mockStorage.saveReminder.mockImplementation(async () => { order.push('save'); });
    mockAlarm.scheduleAlarm.mockImplementation(async () => { order.push('schedule'); return undefined; });

    await createReminderAction('title', 9999999);

    expect(order).toEqual(['save', 'schedule']);
  });

  it('returns createReminder error if saveReminder throws', async () => {
    mockStorage.saveReminder.mockRejectedValue(new Error('db'));

    const result = await createReminderAction('title', 9999999);

    expect(result).toEqual({ success: false, error: 'errors.createReminder' });
  });

  it('rolls back saveReminder and returns scheduleAlarm error if scheduleAlarm throws', async () => {
    mockAlarm.scheduleAlarm.mockRejectedValue(new Error('alarm'));

    const result = await createReminderAction('title', 9999999);

    expect(mockStorage.deleteReminder).toHaveBeenCalledWith('test-uuid');
    expect(result).toEqual({ success: false, error: 'errors.scheduleAlarm' });
  });

  it('returns EXACT_ALARM_PERMISSION and rolls back if scheduleAlarm rejects with PERMISSION_DENIED', async () => {
    const err = Object.assign(new Error('denied'), { code: 'PERMISSION_DENIED' });
    mockAlarm.scheduleAlarm.mockRejectedValue(err);

    const result = await createReminderAction('title', 9999999);

    expect(mockStorage.deleteReminder).toHaveBeenCalledWith('test-uuid');
    expect(result).toEqual({ success: false, error: ERRORS.EXACT_ALARM_PERMISSION });
  });

  it('calls saveAlarmForBoot and returns success', async () => {
    const result = await createReminderAction('title', 9999999);

    expect(mockAlarm.saveAlarmForBoot).toHaveBeenCalledWith('test-uuid', 9999999, 'title', expect.any(String));
    expect(result).toEqual({ success: true, data: undefined });
  });
});
