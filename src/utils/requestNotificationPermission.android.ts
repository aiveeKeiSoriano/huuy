import { PermissionsAndroid, Platform } from 'react-native';

import { makeLogger } from './log';

const log = makeLogger('permissions');

export type NotificationPermissionResult = { granted: boolean; neverAskAgain: boolean };

export async function checkNotificationGranted(): Promise<boolean> {
  if (Number(Platform.Version) < 33) return true;
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
}

export async function requestNotificationPermission(): Promise<NotificationPermissionResult> {
  if (Number(Platform.Version) < 33) return { granted: true, neverAskAgain: false };
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  log.info(`POST_NOTIFICATIONS: ${result}`);
  return {
    granted: result === PermissionsAndroid.RESULTS.GRANTED,
    neverAskAgain: result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  };
}
