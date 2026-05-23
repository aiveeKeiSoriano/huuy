export const DEFAULT_SNOOZE_DURATION = 5;
export const DEEP_LINK_SCHEME = 'huuy';
export const MIN_REMINDER_LEAD_MS = 0.1 * 60_000;
export const DEFAULT_REMINDER_LEAD_MS = 1 * 60_000;
export const REMINDER_CONFLICT_WINDOW_MS = 0.5 * 60_000;

export function minLeadLabel(): string {
  return MIN_REMINDER_LEAD_MS < 60_000
    ? `${MIN_REMINDER_LEAD_MS / 1_000} seconds`
    : `${MIN_REMINDER_LEAD_MS / 60_000} minutes`;
}
