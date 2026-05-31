export type NotificationPermissionResult = { granted: boolean; neverAskAgain: boolean };

export async function checkNotificationGranted(): Promise<boolean> {
  return true;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionResult> {
  return { granted: true, neverAskAgain: false };
}
