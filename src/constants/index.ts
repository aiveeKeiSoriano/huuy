export const DEFAULT_SNOOZE_DURATION = 5;
export const DEEP_LINK_SCHEME = 'huuy';
export const MIN_REMINDER_LEAD_MS = 0.5 * 60_000;
export const DEFAULT_REMINDER_LEAD_MS = 1 * 60_000;
export const REMINDER_CONFLICT_WINDOW_MS = 0.5 * 60_000;

const _minLeadMinutes = MIN_REMINDER_LEAD_MS / 60_000;

export const ERRORS = {
  REMINDER_NOT_FOUND: 'Reminder not found',
  REMINDER_GONE: 'Reminder no longer exists',
  LOAD_REMINDERS: 'Failed to load reminders',
  CREATE_REMINDER: 'Failed to create reminder',
  SCHEDULE_ALARM: 'Failed to schedule alarm',
  EDIT_REMINDER: 'Failed to edit reminder',
  DELETE_REMINDER: 'Failed to delete reminder',
  SNOOZE_REMINDER: 'Failed to snooze reminder',
  TITLE_REQUIRED: 'yung alin?',
  TIME_REQUIRED: 'kelan?',
  TIME_TOO_SOON: `pick a time at least ${_minLeadMinutes} minutes from now`,
  TIME_CONFLICT: 'you already have a reminder around that time',
} as const;
