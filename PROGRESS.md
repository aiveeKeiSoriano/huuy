# Huuy — Build Progress

## Setup Steps (Plan Section 2–3)

- [x] **Step 1** — Initialize bare Expo project
- [x] **Step 2** — Install dependencies (`expo-font`, `@react-native-community/datetimepicker`, `react-native-svg`, `@expo-google-fonts/lilita-one`, `react-native-uuid`)
- [x] **Step 3** — Install linting dependencies + configure `.eslintrc.js`, `.eslintignore`, `tsconfig.json`, lint scripts in `package.json` — verified working
- [x] **Step 4** — Configure permissions: `AndroidManifest.xml` updated directly (bare workflow — `app.json` permissions don't auto-apply without prebuild); removed unneeded `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`; added 5 alarm permissions; dropped `DISABLE_KEYGUARD` — not needed because `AlarmActivity.kt` uses `setShowWhenLocked()`/`setTurnScreenOn()` (API 27+) which handle lock screen display without requiring the permission
- [x] **Step 5** — Set up assets: all SVGs and PNGs confirmed in `src/assets/`; `icon.png` wired in `app.json`; `button.png` copied to `android/app/src/main/res/drawable/` for widget use
- [x] **Step 6** — Set up folder structure: all directories and stub files created (`app/`, `src/components/`, `src/actions/`, `src/services/`, `src/types/`, `src/constants/`)
- [ ] **Step 7** — Create `src/theme.ts`
- [ ] **Step 8** — Define core types (`src/types/reminder.ts`, `src/types/settings.ts`)

---

## Build Order (Plan Section 6)

- [ ] 1. `src/types/reminder.ts`
- [ ] 2. `src/types/settings.ts`
- [ ] 3. `src/theme.ts`
- [ ] 4. `src/services/storageService.ts`
- [ ] 5. `app/index.tsx` — HomeScreen
- [ ] 6. `src/components/ReminderCard.tsx`
- [ ] 7. `AlarmModule.kt` + `NavigationModule.kt` + `AlarmPackage.kt`
- [ ] 8. `src/services/alarmService.ts`
- [ ] 9. `src/actions/createReminderAction.ts`
- [ ] 10. `src/actions/editReminderAction.ts`
- [ ] 11. `src/actions/deleteReminderAction.ts`
- [ ] 12. `src/actions/snoozeReminderAction.ts`
- [ ] 13. `app/create.tsx` — CreateScreen
- [ ] 14. `AlarmReceiver.kt`
- [ ] 15. `AlarmActivity.kt`
- [ ] 16. `app/alarm.tsx` — AlarmScreen
- [ ] 17. `BootReceiver.kt`
- [ ] 18. `app/settings.tsx` — SettingsScreen
- [ ] 19. `WidgetProvider.kt` + widget XML + copy `button.png` to `drawable/`
