import { PermissionsAndroid, Platform } from 'react-native';

import { makeLogger } from './log';

const log = makeLogger('permissions');

export async function requestNotificationPermission(): Promise<void> {
  if (Number(Platform.Version) < 33) return;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  log.info(`POST_NOTIFICATIONS: ${result}`);
}
