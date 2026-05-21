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
- [x] 3. `src/theme.ts`
- [x] 3a. `src/components/Text.tsx` — custom Text wrapper (added to plan)
- [x] 3b. `app/_layout.tsx` — font loading + splash screen + Stack navigator
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
