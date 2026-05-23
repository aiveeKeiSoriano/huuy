# Huuy — Build Progress

## Setup Steps (Plan Section 2–3)

- [x] **Step 1** — Initialize bare Expo project
- [x] **Step 2** — Install dependencies (`expo-font`, `@react-native-community/datetimepicker`, `react-native-svg`, `@expo-google-fonts/lilita-one`, `react-native-uuid`)
- [x] **Step 3** — Install linting dependencies + configure `.eslintrc.js`, `.eslintignore`, `tsconfig.json`, lint scripts in `package.json` — verified working
- [x] **Step 4** — Configure permissions: `AndroidManifest.xml` updated directly (bare workflow — `app.json` permissions don't auto-apply without prebuild); removed unneeded `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`; added 5 alarm permissions; dropped `DISABLE_KEYGUARD` — not needed because `AlarmActivity.kt` uses `setShowWhenLocked()`/`setTurnScreenOn()` (API 27+) which handle lock screen display without requiring the permission
- [x] **Step 5** — Set up assets: all SVGs and PNGs confirmed in `src/assets/`; `icon.png` wired in `app.json`; `button.png` copied to `android/app/src/main/res/drawable/` for widget use
- [x] **Step 6** — Set up folder structure: all directories and stub files created (`app/`, `src/components/`, `src/actions/`, `src/services/`, `src/types/`, `src/constants/`)
- [x] **Step 7** — Create `src/theme.ts` — colors renamed to semantic tokens (highlight, primary, secondary, tertiary, background)
- [x] **Step 8** — Define core types (`src/types/reminder.ts`, `src/types/settings.ts`)
- [x] **Extra** — Install `expo-splash-screen`; implement `app/_layout.tsx` — font loading, splash held until fonts ready, light status bar
- [x] **Extra** — Create `src/components/Text.tsx` — global font wrapper so `fontFamily` never needs to be repeated per component
- [x] **Extra** — Create `src/components/Splash.tsx` — animated wave splash screen; each letter of "huuuuyyy" bounces in sequence with a staggered 200ms delay using `Animated.sequence` + `Easing.inOut(Easing.sin)`
- [x] **Extra** — EAS integration: added `eas.json` with development (internal), preview (internal), and production (auto-increment) build profiles; added `.easignore`

---

## Build Order (Plan Section 6)

- [x] 1. `src/types/reminder.ts`
- [x] 2. `src/types/settings.ts`
- [x] 2a. `src/types/result.ts` — `Result<T = void>` discriminated union; all actions return this
- [x] 3. `src/theme.ts`
- [x] 3a. `src/components/Text.tsx` — custom Text wrapper (added to plan)
- [x] 3b. `app/_layout.tsx` — font loading + splash screen + Stack navigator
- [x] 4. `src/services/storageService.ts`
- [x] 4a. `src/actions/loadRemindersAction.ts`
- [x] 4b. Jest setup — `jest-expo`, `jest`, `@types/jest`, `@testing-library/react-native` installed; `src/services/__tests__/storageService-test.ts` — 11 tests
- [x] 5. `app/index.tsx` — HomeScreen
- [x] 6. `src/components/ReminderCard.tsx`
- [x] 7. `AlarmModule.kt` + `NavigationModule.kt` + `AlarmPackage.kt` — registered in `MainApplication`; `AlarmReceiver.kt` stub added so module compiles
- [x] 8. `src/services/alarmService.ts`
- [x] 9. `src/actions/createReminderAction.ts`
- [x] 10. `src/actions/editReminderAction.ts`
- [x] 11. `src/actions/deleteReminderAction.ts`
- [x] 12. `src/actions/snoozeReminderAction.ts`
- [x] 13. `app/create.tsx` — CreateScreen
- [x] **Extra** — `src/components/Alert.tsx` — `useAlert()` hook; modal confirmation dialog for destructive actions (trash)
- [x] **Extra** — `src/components/Toast.tsx` — `useToast()` hook; auto-dismiss pill toast + persistent mode for validation errors
- [x] **Extra** — `src/assets/arrow-left.svg` — back arrow icon for screen headers
- [x] **Extra** — `ERRORS` map added to `src/constants/index.ts` — single source of truth for all error strings; all action files and `app/create.tsx` import from here instead of using inline strings
- [x] **Extra** — `src/utils/log.ts` — `makeLogger` structured logging utility; used by `alarmService.ts` and `app/alarm.tsx`
- [x] **Extra** — `src/hooks/useAppReady.ts` — font loading + splash timing logic extracted from `app/_layout.tsx`
- [x] **Extra** — `src/components/Loading.tsx` — centered activity indicator; used by `HomeScreen` and `AlarmScreen`
- [x] **Extra** — `HomeScreen` additions: "huuy" app name text in header; pull-to-refresh via `RefreshControl`; delete confirmation dialog via `useAlert` before calling `deleteReminderAction`; `useFocusEffect` for automatic refresh on screen focus
- [x] **Extra** — `createReminderAction` two-stage error handling: separate try/catch for `saveReminder` and `scheduleAlarm`; rolls back via `deleteReminder` if scheduling fails after save succeeds
- [x] 14. `AlarmReceiver.kt` — extracts `reminderId` from Intent extras; creates notification channel `huuy_alarms`; posts a `CATEGORY_ALARM` full-screen notification with `fullScreenIntent` pointing to `AlarmActivity` (direct `startActivity` from a background receiver is blocked on Android 10+); checks `POST_NOTIFICATIONS` on Android 13+, `canUseFullScreenIntent()` on Android 14+; `notificationId()` companion function shared with `AlarmActivity` for cancellation; registered in manifest with `android:exported="true"`
- [x] 15. `AlarmActivity.kt` — `setShowWhenLocked`/`setTurnScreenOn` in `onCreate` (API 27+) + same attributes in manifest as fallback for older APIs; fires `huuy://alarm?reminderId=...` deep link; 5s `Handler` timeout fallback; registers self in `AlarmModule.pendingAlarmActivity`; clears ref and cancels timeout in `onDestroy`; `onDestroy` also cancels the notification via `NotificationManager.cancel(notificationId(reminderId))`; `AlarmModule.notifyAlarmReady()` finishes via `pendingAlarmActivity` (not `currentActivity`) on the main looper
- [x] 16. `app/alarm.tsx` — loading state (`Loading`), null error state (`ERRORS.REMINDER_GONE` + close button), "huuuyyyy yung ano" label, title, clock, snooze + trash buttons; `notifyAlarmReady()` on mount; `BackHandler` blocks back; `BackHandler.exitApp()` after each action; `SnoozeIcon` added to `Icons.tsx` from `snooze.svg`
- [ ] 17. `BootReceiver.kt`
- [ ] 18. `app/settings.tsx` — SettingsScreen
- [ ] 19. `WidgetProvider.kt` + widget XML + copy `button.png` to `drawable/`
