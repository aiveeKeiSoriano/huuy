# HUUY — Project Plan
> One-Time Reminder Alarm App · Android · React Native / Expo Bare Workflow

---

## 1. Project Overview

Huuy ("hey" in Filipino) is a focused Android alarm app with a single core feature: one-time reminders that fire with an alarm-style full-screen takeover. No push notifications. No recurring schedules. Just set it, and it alerts you exactly when you need it.

| Field | Value |
|---|---|
| App Name | Huuy |
| Platform | Android (React Native / Expo Bare Workflow) |
| Stack | React Native + Expo Router + Kotlin native modules |
| Alarm Engine | Android `AlarmManager.setAlarmClock()` — highest OS priority |
| Storage | `expo-sqlite` for both reminders and settings — single storage solution |
| Snooze | Unlimited — default 5 minutes, configurable in Settings |
| Font | `@expo-google-fonts/lilita-one` |
| Color Palette | `#fbbbad` `#ee8695` `#4a7a96` `#333f58` `#292831` |

---

## 2. Project Setup Steps

### Step 1 — Initialize Bare Expo Project
1. Run: `npx create-expo-app Huuy --template bare-minimum`
2. Navigate into the project: `cd Huuy`
3. Install Expo Router and its peer dependencies
4. Configure `app.json` with name, slug, scheme (`huuy`), and android package name

### Step 2 — Install Dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based routing — all screens live in `app/` |
| `expo-sqlite` | All local storage — reminders and settings |
| `@expo-google-fonts/lilita-one` | App font |
| `expo-font` | Font loading support |
| `@react-native-community/datetimepicker` | Native Android time picker dialog |
| `expo-constants` | App config access |
| `expo-linking` | Deep link handling |
| `react-native-screens` | Native screen containers |
| `react-native-safe-area-context` | Safe area layout |
| `react-native-svg` | Render SVG icon files |

No `expo-notifications` and no `expo-task-manager` needed. Alarm triggering is handled entirely by native Kotlin.

### Step 3 — Install Linting Dependencies

| Package | Purpose |
|---|---|
| `eslint-plugin-react` | JSX and component rules |
| `eslint-plugin-react-hooks` | Enforces hooks rules |
| `@typescript-eslint/eslint-plugin` | TypeScript linting |
| `eslint-plugin-react-native` | RN-specific rules (no inline styles, etc.) |
| `eslint-plugin-import` | Import ordering and resolution |
| `eslint-plugin-react-native-a11y` | Accessibility rules for RN components |

### Step 4 — Configure app.json Permissions
- `SCHEDULE_EXACT_ALARM` — required to call `setAlarmClock()`
- `USE_EXACT_ALARM` — supplemental exact alarm permission (Android 13+)
- `RECEIVE_BOOT_COMPLETED` — reschedule alarms after phone restart
- `WAKE_LOCK` — keep CPU alive when alarm fires
- `USE_FULL_SCREEN_INTENT` — show alarm UI over the lock screen
- `DISABLE_KEYGUARD` — dismiss lock screen when alarm fires

### Step 5 — Set Up Assets

All assets live in `src/assets/`.

| File | Purpose |
|---|---|
| `src/assets/button.png` | Widget icon — copied to android drawable, not used in JS |
| `src/assets/icon.png` | App icon shown on install and in app drawer |
| `src/assets/settings.svg` | Settings icon in HomeScreen header |
| `src/assets/edit.svg` | Edit button in ReminderCard |
| `src/assets/trash.svg` | Trash button in ReminderCard and AlarmScreen |
| `src/assets/plus.svg` | Plus icon inside the FAB button |
| `src/assets/snooze.svg` | Snooze button in AlarmScreen |
| `src/assets/exclamation.svg` | Missed alarm marker in ReminderCard |

- Point `app.json` `icon` field to `src/assets/icon.png`
- Use `button.png` in the FAB via `require('../assets/button.png')`
- SVG files are rendered via `react-native-svg`
- For the Android widget, copy `button.png` into `android/app/src/main/res/drawable/` — widgets are native and cannot access the JS assets folder directly

### Step 6 — Set Up Folder Structure
Establish the structure before writing any screen or service code. See [Section 4](#4-folder-structure).

### Step 7 — Create the Theme File
Before writing any component, create `src/theme.ts`. All components import from here — never hardcode colors, fonts, spacing, or border radii anywhere else.

The theme should define:
- **colors** — the five-color palette (see overview table)
- **fonts** — Lilita One family name
- **spacing** — generous scale with thick padding values to match Lilita One personality (e.g. `sm: 12`, `md: 20`, `lg: 32`)
- **radii** — rounded values for cards, buttons, inputs (e.g. `sm: 12`, `md: 20`, `full: 9999`)
- **borderWidth** — thick (2–3px) for visible borders that complement Lilita One

The overall style should feel bold and chunky — generous padding, visible rounded borders, strong contrast between elements.

### Step 8 — Define the Core Types
Before any UI or service, define the types in `src/types/`.

**`src/types/reminder.ts`**
- `id` — unique string identifier
- `title` — the reminder label set by the user
- `triggerTime` — Unix timestamp in milliseconds
- `missedAlarm` — `boolean`, defaults to `false`. Set to `true` by `storageService.getReminders()` on app open when `triggerTime < Date.now()`. Indicates the alarm fired but the user did not snooze or trash it (pressed home, pressed power, or screen timed out). Never set by native Kotlin — computed purely in JS on app open.

**`src/types/settings.ts`**
- `snoozeDuration` — number of minutes to snooze (default 5)

> There is no `isActive` flag and no `snoozeCount`. A reminder either exists in storage (active) or it does not (trashed). Snoozing is unlimited. The only way to remove a reminder is the trash button. Missed reminders stay in the list with `exclamation.svg` as a visual marker until the user manually trashes them.

---

## 3. Main Components

### 3A. Screens (`app/`)

Expo Router requires all routes to live in `app/`. Each file in `app/` is both a screen and a route. All non-screen code lives in `src/`.

---

#### `app/index.tsx` — HomeScreen
- Displays all reminders as a list of `ReminderCard` components
- On app open, calls `storageService.getReminders()` which flags any reminder with `triggerTime < Date.now()` as `missedAlarm = true`
- Missed reminders remain in the list with `exclamation.svg` visible — user must manually trash them
- When no reminders exist, shows faded centered text: **"wala langgg"**
- FAB in the bottom right using `plus.svg` — navigates to CreateScreen with no params (`router.push('/create')`)
- Settings icon (`settings.svg`) in the top right header — navigates to `app/settings.tsx`

---

#### `app/create.tsx` — CreateScreen
- Input label reads: **"paalala mo nga sakin yung:"**
- Time picker using `@react-native-community/datetimepicker` — opens the native Android time picker dialog, calculates next occurrence of the selected time same as a standard alarm
- Save button behavior:
  - `source=widget` — calls `createReminderAction` then `NavigationModule.goHome()` — sends app to background and returns user to phone home screen without closing the app
  - No `source` param (FAB or edit) — calls `createReminderAction` or `editReminderAction` then `router.back()` — returns to HomeScreen
- Edit mode is detected by the presence of `id` param — fetches reminder from SQLite via `storageService.getReminderById(id)` and pre-fills the form
- Widget is the only case that passes `source` — everything else defaults to `router.back()` after save

> **How navigation works:** The widget deep link fires `huuy://create?source=widget`. The FAB calls `router.push('/create')` — no params. The edit button calls `router.push('/create?id=123')` — only the id, title and time are fetched from SQLite.

---

#### `app/alarm.tsx` — AlarmScreen
Launched by `AlarmActivity.kt` via deep link `huuy://alarm?reminderId=123` when an alarm fires. `alarm.tsx` fetches the full reminder from SQLite using `storageService.getReminderById(reminderId)` — title is never passed through the URL.

**Same UI for both locked and unlocked screen.** `AlarmActivity.kt` always fires the same deep link regardless of screen state. `setShowWhenLocked` and `setTurnScreenOn` are flags to the OS about window layering — they do not affect what React Native renders. When the screen is already on and unlocked, Android ignores those flags and simply launches the activity on top of whatever the user was doing. The OS may show its own lock screen elements briefly before the activity takes over when the screen was off — this is standard behavior and cannot be controlled.

- Small faded text above the title reads: **"huuuyyyy yung ano"**
- Reminder title displayed prominently below the faded label
- Shows current time
- Snooze button (`snooze.svg`) — calls `snoozeReminderAction`
- Trash button (`trash.svg`) — calls `deleteReminderAction`
- No back navigation — user must choose snooze or trash

---

#### `app/settings.tsx` — SettingsScreen
- Single setting: snooze duration in minutes (default 5)
- Stored in `expo-sqlite` — same storage solution as reminders, no extra dependency
- Accessible from the HomeScreen header settings icon

---

### 3B. Components (`src/components/`)

#### ReminderCard
- Small faded text at the top reads: **"yung"**
- Reminder title displayed prominently below the label
- Scheduled time shown below the title
- When `missedAlarm === true`, shows `exclamation.svg` as a visual marker next to the title — indicates the alarm fired but was not acted on
- Right side contains two icon buttons: `trash.svg` and `edit.svg` — both available regardless of `missedAlarm` state
- Trash calls `deleteReminderAction`
- Edit calls `router.push('/create?id=123')` — screen fetches full reminder from SQLite
- Accepts `onDelete` and `onEdit` callback props — logic stays in the screen

---

### 3C. Theme (`src/theme.ts`)
Single source of truth for all visual styling. Every component imports from here.

| Token | Value |
|---|---|
| `colors.salmon` | `#fbbbad` — lightest, backgrounds and highlights |
| `colors.rose` | `#ee8695` — accents, FAB, active states |
| `colors.blue` | `#4a7a96` — primary action buttons, headers |
| `colors.navy` | `#333f58` — text, card backgrounds |
| `colors.dark` | `#292831` — deepest background, alarm screen |
| `fonts.lilita` | `'LilitaOne_400Regular'` |
| `spacing` | `sm: 12`, `md: 20`, `lg: 32` |
| `radii` | `sm: 12`, `md: 20`, `full: 9999` |
| `borderWidth` | `2`–`3` |

---

### 3D. Services (`src/services/`)
Services talk to external systems only — SQLite, AlarmManager. They have no knowledge of each other. Coordination is handled by actions.

#### `storageService.ts`
- `saveReminder(reminder)` — handles both insert and edit of a reminder that has not yet fired
- `getReminders()` — fetches all reminders from SQLite, then for each reminder where `triggerTime < Date.now()` sets `missedAlarm = true` and updates the row before returning — this is where missed alarm detection happens
- `getReminderById(id)` — fetch a single reminder by id — used by `app/create.tsx` in edit mode and `app/alarm.tsx` on load
- `deleteReminder(id)` — remove by id
- `snoozeReminder(id, newTriggerTime)` — updates `triggerTime` in SQLite and sets `missedAlarm = false`
- `getSettings()` / `saveSettings()` — read and write `snoozeDuration` via a `settings` key-value table in SQLite

#### `alarmService.ts`
- `scheduleAlarm(reminder)` — calls `AlarmModule.scheduleAlarm()` via `NativeModules` bridge → `AlarmManager.setAlarmClock()` in Kotlin
- `cancelAlarm(reminderId)` — calls `AlarmModule.cancelAlarm()`

---

### 3E. Actions (`src/actions/`)
Actions coordinate multiple services. Screens call actions, not services directly.

#### `createReminderAction.ts`
- Receives `title` and `triggerTime` from `app/create.tsx`
- Calls `storageService.saveReminder()` to persist to SQLite
- Saves `id` + `triggerTime` to `SharedPreferences` for boot recovery
- Calls `alarmService.scheduleAlarm()` to register with AlarmManager

#### `editReminderAction.ts`
Used when user edits any reminder — including missed alarms. Handles full rescheduling in AlarmManager and resets missed alarm state.
- Calls `alarmService.cancelAlarm()` on the old alarm first — removes old `PendingIntent` from AlarmManager
- Calls `storageService.saveReminder()` with updated `title`, `triggerTime`, and `missedAlarm: false` — clears the missed state so `exclamation.svg` no longer shows
- Updates `SharedPreferences` with new `triggerTime` for boot recovery
- Calls `alarmService.scheduleAlarm()` with new `triggerTime` — registers new `PendingIntent` in AlarmManager

> Cancel must happen before reschedule. Android identifies alarms by their `PendingIntent` hash — calling `setAlarmClock()` with the same id would overwrite automatically, but explicit cancel + reschedule is cleaner and easier to reason about.

#### `deleteReminderAction.ts`
- Calls `alarmService.cancelAlarm()` first — removes `PendingIntent` from AlarmManager
- Calls `storageService.deleteReminder()` — removes from SQLite
- Removes entry from `SharedPreferences`
- Used by both `app/index.tsx` (trash on `ReminderCard`) and `app/alarm.tsx` (trash button)

#### `snoozeReminderAction.ts`
- Calls `alarmService.cancelAlarm()` to remove the current alarm
- Computes new trigger time: `Date.now() + snoozeMinutes * 60000`
- Calls `alarmService.scheduleAlarm()` with the new trigger time
- Calls `storageService.snoozeReminder()` to update `triggerTime` in SQLite
- Updates `SharedPreferences` with new trigger time for boot recovery

---

### 3F. Native Kotlin (`android/`)

#### `AlarmModule.kt` — JS Bridge
- Extends `ReactContextBaseJavaModule`
- Exposes `scheduleAlarm(id, triggerTime, title)` to JavaScript
- Exposes `cancelAlarm(id)` to JavaScript
- Calls `AlarmManager.setAlarmClock()` — highest priority alarm tier on Android
- Registered via `AlarmPackage.kt` in `MainApplication.kt`

#### `NavigationModule.kt` — Home Navigation Bridge
- Extends `ReactContextBaseJavaModule`
- Exposes `goHome()` to JavaScript
- Fires `Intent(Intent.ACTION_MAIN)` with `CATEGORY_HOME` and `FLAG_ACTIVITY_NEW_TASK`
- Sends the app to background and returns user to the phone launcher — does not close the app
- Used by `app/create.tsx` when `source=widget` after saving

#### `AlarmReceiver.kt` — Broadcast Receiver
- Wakes when the OS fires the `PendingIntent` at trigger time
- Extracts `reminderId` from the Intent extras — title is not needed, `alarm.tsx` fetches from SQLite
- Starts `AlarmActivity` with `FLAG_ACTIVITY_NEW_TASK`
- Registered in `AndroidManifest.xml` with `android:exported="true"`

#### `AlarmActivity.kt` — Lock Screen Launcher
- `setShowWhenLocked(true)` and `setTurnScreenOn(true)` called in `onCreate()` — at alarm firing time, not at creation time
- When screen is locked: flags wake the screen and show the activity over the lock screen
- When screen is already on: OS ignores the flags and launches the activity normally on top of the current app
- Fires deep link: `huuy://alarm?reminderId=123` — only the id, title is fetched from SQLite by `alarm.tsx`
- Starts `MainActivity` with the deep link then calls `finish()`

#### `AlarmPackage.kt` — Module Registration
- Implements `ReactPackage`
- Returns both `AlarmModule` and `NavigationModule` in `createNativeModules()`
- Added to `getPackages()` list in `MainApplication.kt`

#### `BootReceiver.kt` — Device Restart Handler
- Listens for `ACTION_BOOT_COMPLETED` broadcast
- Reads active alarms from `SharedPreferences`
- Reschedules all active alarms via `AlarmManager.setAlarmClock()`
- Entries whose trigger time has already passed are cleaned up

#### `WidgetProvider.kt` — Home Screen Widget
- Extends `AppWidgetProvider`
- Uses `button.png` from `android/app/src/main/res/drawable/`
- On tap, fires a `PendingIntent` with deep link `huuy://create?source=widget`
- Registered in `AndroidManifest` as a receiver with `APPWIDGET_UPDATE` intent filter

---

## 4. Folder Structure

```
Huuy/
├── app/
│   ├── _layout.tsx               # Root layout, deep link config, font loading, Expo Router entry
│   ├── index.tsx                 # HomeScreen — "wala langgg", FAB, settings icon, ReminderCard list
│   ├── create.tsx                # CreateScreen — "paalala mo nga sakin yung:", time picker, source param
│   ├── alarm.tsx                 # AlarmScreen — "huuuyyyy yung ano", title, snooze, trash
│   └── settings.tsx              # SettingsScreen — snooze duration
│
├── src/
│   ├── assets/
│   │   ├── button.png            # Widget icon only — copied to android/res/drawable/, never imported in JS
│   │   ├── icon.png              # App icon — referenced in app.json
│   │   ├── settings.svg          # Settings icon in HomeScreen header
│   │   ├── edit.svg              # Edit button in ReminderCard
│   │   ├── trash.svg             # Trash button in ReminderCard and AlarmScreen
│   │   ├── plus.svg              # Plus icon inside FAB button
│   │   ├── snooze.svg            # Snooze button in AlarmScreen
│   │   └── exclamation.svg       # Missed alarm marker in ReminderCard
│   │
│   ├── theme.ts                  # Colors, fonts, spacing, radii, border widths — single source of truth
│   │
│   ├── components/
│   │   └── ReminderCard.tsx      # "yung" label, title, time, exclamation.svg for missed, trash.svg and edit.svg
│   │
│   ├── actions/
│   │   ├── createReminderAction.ts   # Coordinates save + schedule
│   │   ├── editReminderAction.ts     # Coordinates cancel old + save updated + reschedule in AlarmManager
│   │   ├── deleteReminderAction.ts   # Coordinates cancel alarm + delete from storage
│   │   └── snoozeReminderAction.ts   # Coordinates cancel + reschedule + update storage
│   │
│   ├── services/
│   │   ├── alarmService.ts       # scheduleAlarm and cancelAlarm — wraps AlarmModule
│   │   └── storageService.ts     # SQLite CRUD for reminders and settings
│   │
│   ├── types/
│   │   ├── reminder.ts           # Reminder type: id, title, triggerTime, missedAlarm
│   │   └── settings.ts           # Settings type: snoozeDuration
│   │
│   └── constants/
│       └── index.ts              # Default snooze duration, deep link scheme
│
├── android/
│   └── app/src/main/
│       ├── java/.../
│       │   ├── AlarmModule.kt        # JS to native bridge for AlarmManager
│       │   ├── NavigationModule.kt   # JS to native bridge for goHome()
│       │   ├── AlarmReceiver.kt      # BroadcastReceiver — catches alarm fires
│       │   ├── AlarmActivity.kt      # Wakes screen and launches deep link at alarm fire time
│       │   ├── AlarmPackage.kt       # Registers AlarmModule + NavigationModule with React Native
│       │   ├── BootReceiver.kt       # Reschedules alarms after device restart
│       │   └── WidgetProvider.kt     # Home screen widget — fires huuy://create?source=widget
│       │
│       └── res/
│           ├── drawable/
│           │   └── button.png        # Copy of src/assets/button.png for native widget use
│           ├── layout/
│           │   └── widget.xml        # Widget layout referencing button.png drawable
│           └── xml/
│               └── widget_info.xml   # Widget size and update metadata
│
├── PLAN.md                       # This file
└── README.md                     # Setup and scripts (see Section 8)
```

---

## 5. Full Alarm Flow

### 5A. Reminder Creation — via FAB

| # | Actor | Action |
|---|---|---|
| 1 | User | Taps FAB on HomeScreen |
| 2 | App | Calls `router.push('/create')` — no params needed |
| 3 | User | Types in "paalala mo nga sakin yung:" input and selects time via native dialog |
| 4 | create.tsx | Calculates next Unix timestamp for the selected time |
| 5 | createReminderAction | Calls `storageService.saveReminder()` — persists to SQLite |
| 6 | createReminderAction | Saves `id` + `triggerTime` to `SharedPreferences` for boot recovery |
| 7 | createReminderAction | Calls `alarmService.scheduleAlarm()` → `AlarmModule.kt` → `AlarmManager.setAlarmClock()` |
| 8 | create.tsx | No source — calls `router.back()` — returns to HomeScreen |

### 5B. Reminder Creation — via Widget

| # | Actor | Action |
|---|---|---|
| 1 | User | Taps widget on phone home screen |
| 2 | WidgetProvider.kt | Fires deep link `huuy://create?source=widget` |
| 3 | App | Opens `app/create.tsx` with `source=widget` |
| 4 | User | Types in input and selects time |
| 5 | createReminderAction | Saves reminder and schedules alarm (same as FAB flow steps 5–7) |
| 6 | create.tsx | `source=widget` — calls `NavigationModule.goHome()` |
| 7 | NavigationModule.kt | Fires `ACTION_MAIN` + `CATEGORY_HOME` intent — sends app to background |
| 8 | Phone | Returns to launcher — app is still alive in background |

### 5C. Edit Unfired Reminder Flow

| # | Actor | Action |
|---|---|---|
| 1 | User | Taps `edit.svg` on a `ReminderCard` |
| 2 | App | Calls `router.push('/create?id=123')` — only the id |
| 3 | create.tsx | Fetches full reminder from SQLite via `storageService.getReminderById(id)` — pre-fills form |
| 4 | User | Updates title and/or time and taps Save |
| 5 | editReminderAction | Calls `alarmService.cancelAlarm()` — removes old `PendingIntent` from AlarmManager |
| 6 | editReminderAction | Calls `storageService.saveReminder()` with updated data and `missedAlarm: false` |
| 7 | editReminderAction | Updates `SharedPreferences` with new `triggerTime` |
| 8 | editReminderAction | Calls `alarmService.scheduleAlarm()` — registers new `PendingIntent` in AlarmManager |
| 9 | create.tsx | Calls `router.back()` — returns to HomeScreen |

### 5D. Alarm Firing Flow

| # | Actor | Action |
|---|---|---|
| 1 | Android OS | Trigger time reached — OS fires the `PendingIntent` |
| 2 | AlarmReceiver.kt | `onReceive()` fires — extracts `reminderId` and `title` |
| 3 | AlarmReceiver.kt | Starts `AlarmActivity` with `FLAG_ACTIVITY_NEW_TASK` |
| 4 | AlarmActivity.kt | `onCreate()` calls `setShowWhenLocked(true)` and `setTurnScreenOn(true)` |
| 5 | AlarmActivity.kt | Fires deep link: `huuy://alarm?reminderId=123` — only the id |
| 6 | Expo Router | Routes deep link to `app/alarm.tsx` |
| 7 | alarm.tsx | Fetches reminder via `storageService.getReminderById(reminderId)` then renders UI |
| 8 | AlarmActivity.kt | Calls `finish()` — hands off entirely to React Native |

> `alarm.tsx` renders the same UI regardless of whether the screen was locked or unlocked. `setShowWhenLocked` and `setTurnScreenOn` are OS window flags — they do not change what React Native renders. When the screen is already on, Android ignores those flags entirely.

### 5E. Snooze Flow
- User taps Snooze on `app/alarm.tsx`
- `alarm.tsx` calls `snoozeReminderAction(reminderId, snoozeMinutes)`
- `snoozeReminderAction` calls `alarmService.cancelAlarm()`
- `snoozeReminderAction` computes new trigger: `Date.now() + snoozeMinutes * 60000`
- `snoozeReminderAction` calls `alarmService.scheduleAlarm()` with new trigger time
- `snoozeReminderAction` calls `storageService.snoozeReminder()` — updates `triggerTime` and sets `missedAlarm = false` in SQLite
- `SharedPreferences` updated with new trigger time for boot recovery
- `alarm.tsx` navigates back to HomeScreen

### 5F. Trash Flow
- User taps `trash.svg` on `app/alarm.tsx` or on a `ReminderCard` in HomeScreen
- Screen calls `deleteReminderAction(reminderId)`
- `deleteReminderAction` calls `alarmService.cancelAlarm()` first
- `deleteReminderAction` calls `storageService.deleteReminder()`
- `deleteReminderAction` removes entry from `SharedPreferences`
- Screen navigates to HomeScreen or refreshes the list

### 5G. Device Restart Recovery Flow
- Phone restarts — all `AlarmManager` entries are wiped by Android
- `BootReceiver.kt` receives `ACTION_BOOT_COMPLETED` broadcast
- Reads all active reminder ids and trigger times from `SharedPreferences`
- For each entry, calls `AlarmManager.setAlarmClock()` to reschedule
- Entries whose trigger time has already passed are deleted from both stores

---

## 6. Recommended Build Order

- [ ] 1. `src/types/reminder.ts` — `id`, `title`, `triggerTime`, `missedAlarm`
- [ ] 2. `src/types/settings.ts` — `snoozeDuration`
- [ ] 3. `src/theme.ts` — colors, fonts, spacing, radii, border widths
- [ ] 4. `src/services/storageService.ts` — `saveReminder`, `getReminders` (with missed alarm flagging), `deleteReminder`, `snoozeReminder`, `getSettings`/`saveSettings`
- [ ] 5. `app/index.tsx` — HomeScreen: FAB with `plus.svg`, `settings.svg` icon, "wala langgg" empty state, missed alarm handling
- [ ] 6. `src/components/ReminderCard.tsx` — "yung" label, title, time, `exclamation.svg` for missed alarms, `trash.svg` and `edit.svg` buttons
- [ ] 7. `app/create.tsx` — "paalala mo nga sakin yung:" input, native time picker, `source` param handling
- [ ] 8. `AlarmModule.kt` + `NavigationModule.kt` + `AlarmPackage.kt` — native bridges, register in `MainApplication`
- [ ] 9. `src/services/alarmService.ts` — JS side wrapping `AlarmModule`
- [ ] 10. `src/actions/createReminderAction.ts` — wire `app/create.tsx` to both services
- [ ] 11. `src/actions/editReminderAction.ts` — wire edit button in `ReminderCard`
- [ ] 12. `AlarmReceiver.kt` — catches the broadcast when alarm fires
- [ ] 13. `AlarmActivity.kt` — wakes screen, handles locked/unlocked via window flags, launches deep link
- [ ] 14. `app/alarm.tsx` — "huuuyyyy yung ano" label, title, `snooze.svg` and `trash.svg` buttons
- [ ] 15. `src/actions/deleteReminderAction.ts` — used by `app/alarm.tsx` trash and `ReminderCard` trash
- [ ] 16. `src/actions/snoozeReminderAction.ts` — used by `app/alarm.tsx` snooze button
- [ ] 17. `BootReceiver.kt` — reschedule on device restart
- [ ] 18. `app/settings.tsx` — snooze duration config
- [ ] 19. `WidgetProvider.kt` + widget XML + copy `button.png` to `drawable/` — home screen widget, build last

---

## 7. Testing with Expo Go

Before involving any emulator or real device, all screens and navigation can be tested directly using Expo Go. This covers UI layout, screen transitions, form inputs, storage reads and writes, and deep link routing. The native modules are mocked at this stage.

### 7A. Setup
1. Install Expo Go on your Android phone from the Play Store
2. Run `npx expo start` in your project directory
3. Scan the QR code with your phone camera or the Expo Go app
4. The app loads over your local network — no build or install needed

`AlarmModule` and `NavigationModule` will be `undefined` in Expo Go since the native Kotlin is not compiled. Add mocks at the top of each service:

```typescript
// alarmService.ts
const AlarmModule = NativeModules.AlarmModule ?? {
  scheduleAlarm: () => console.log('[mock] scheduleAlarm'),
  cancelAlarm:   () => console.log('[mock] cancelAlarm'),
}

// app/create.tsx or a navigationService.ts
const NavigationModule = NativeModules.NavigationModule ?? {
  goHome: () => console.log('[mock] goHome — would return to phone home screen'),
}
```

### 7B. Screen Checklist

#### HomeScreen (`app/index.tsx`)
- [ ] App loads and HomeScreen is the first screen shown
- [ ] "wala langgg" appears faded and centered when there are no reminders
- [ ] FAB with `plus.svg` is visible in the bottom right corner
- [ ] `settings.svg` icon is visible in the top right header
- [ ] Tapping FAB navigates to CreateScreen
- [ ] Tapping Settings icon navigates to SettingsScreen
- [ ] After creating a reminder, it appears in the list on return
- [ ] ReminderCard shows "yung" label, title, time, and `trash.svg` + `edit.svg` buttons
- [ ] ReminderCard shows `exclamation.svg` for reminders with `missedAlarm === true`
- [ ] Both trash and edit buttons are visible on missed alarm cards
- [ ] Tapping trash on a ReminderCard removes it from the list
- [ ] Tapping edit on a ReminderCard opens CreateScreen pre-filled
- [ ] Saving an edited missed alarm clears `exclamation.svg` and reschedules the alarm

#### CreateScreen (`app/create.tsx`)
- [ ] Input label reads "paalala mo nga sakin yung:"
- [ ] Title input accepts text
- [ ] Time picker opens the native Android time picker dialog on tap
- [ ] Selected time is displayed correctly after picking
- [ ] Save button shows validation or is disabled when title is empty
- [ ] Tapping Save (no source — FAB) creates the reminder and navigates back to HomeScreen
- [ ] Tapping Save (`source=widget`) logs `[mock] goHome` in console
- [ ] Console shows `[mock] scheduleAlarm` confirming alarmService was called
- [ ] New reminder appears in the HomeScreen list after returning
- [ ] When opened from edit (id param present), existing title and time are fetched from SQLite and pre-filled
- [ ] Saving an edited reminder shows `[mock] cancelAlarm` then `[mock] scheduleAlarm` in console

#### AlarmScreen (`app/alarm.tsx`)
AlarmScreen cannot be triggered by a real alarm in Expo Go. Navigate to it directly via deep link:

```bash
npx uri-scheme open 'huuy://alarm?reminderId=test' --android
```

> Make sure a reminder with id `test` exists in SQLite first, or mock `getReminderById` to return a test reminder.

- [ ] Small faded "huuuyyyy yung ano" label appears above the title
- [ ] Reminder title from the deep link params is displayed prominently
- [ ] `snooze.svg` button and `trash.svg` button are both visible and tappable
- [ ] Tapping Snooze logs `[mock] cancelAlarm` and `[mock] scheduleAlarm` in console
- [ ] Tapping Snooze navigates back to HomeScreen
- [ ] Tapping Trash logs `[mock] cancelAlarm` in console
- [ ] Tapping Trash removes the reminder and navigates back to HomeScreen
- [ ] No back button or swipe-back exits the screen without choosing an action

#### SettingsScreen (`app/settings.tsx`)
- [ ] Snooze duration input shows the current saved value — default is 5
- [ ] Changing the value and saving persists it — confirmed by reopening Settings
- [ ] Snooze action in AlarmScreen uses the updated duration — confirmed in console log

### 7C. Navigation and Deep Link Checklist
- [ ] FAB on HomeScreen opens CreateScreen with no params
- [ ] Back from CreateScreen returns to HomeScreen without saving
- [ ] Save on CreateScreen (FAB) returns to HomeScreen with new reminder in list
- [ ] Edit on ReminderCard opens CreateScreen with only `id` param — title and time loaded from SQLite
- [ ] Save on CreateScreen (edit) returns to HomeScreen with updated reminder and no `exclamation.svg`
- [ ] `huuy://create?source=widget` deep link opens CreateScreen
- [ ] Save on CreateScreen (`source=widget`) logs `[mock] goHome` in console
- [ ] `huuy://alarm?reminderId=123` deep link opens AlarmScreen — title loaded from SQLite
- [ ] Settings icon opens SettingsScreen
- [ ] Back from SettingsScreen returns to HomeScreen

### 7D. Storage Persistence Checklist
- [ ] Create a reminder — close and reopen the app — reminder still appears in the list
- [ ] Change snooze duration in Settings — close and reopen — value is preserved
- [ ] Delete a reminder — close and reopen — reminder is gone from the list
- [ ] Edit a reminder — close and reopen — updated title and time are shown
- [ ] Create multiple reminders — all appear in the list in the correct order
- [ ] A reminder whose `triggerTime` has passed shows `exclamation.svg` on next app open

---

## 8. README

> This section defines what goes in `README.md` at the project root.

### Requirements
- Node.js 20.x (LTS) or higher
- npm 10.x or higher
- Android Studio with Android SDK installed
- Java JDK 17 (required for Gradle and Kotlin compilation)
- Expo CLI: `npm install -g expo-cli`
- An Android device or AVD emulator for testing native features

### Local Setup Steps
1. Clone the repo
2. Run `npm install`
3. Run `npx expo install` to sync Expo managed dependencies
4. Copy `.env.example` to `.env` and fill in any required values
5. For native build: open the `android/` folder in Android Studio and let Gradle sync

### Scripts

| Script | What it does |
|---|---|
| `npx expo start` | Start Metro bundler — scan QR with Expo Go to test on device |
| `npx expo start --android` | Start and launch on connected Android device or emulator |
| `npx expo run:android` | Full native build and install on device (required for alarm testing) |
| `npm run lint` | Run ESLint across all source files |
| `npm run lint:fix` | Run ESLint and auto-fix fixable issues |
| `npm test` | Run Jest unit tests |
| `npm run type-check` | Run TypeScript compiler check without emitting files |
| `npx uri-scheme open 'huuy://alarm?reminderId=test' --android` | Trigger AlarmScreen deep link for manual UI testing |
| `npx uri-scheme open 'huuy://create?source=widget' --android` | Simulate widget tap for CreateScreen testing |

### Key Notes for Contributors
- Never hardcode colors, fonts, or spacing — import from `src/theme.ts`
- All routes live in `app/` — all other code lives in `src/`
- Screens call actions, not services directly
- `AlarmModule` and `NavigationModule` are mocked in Expo Go — check console for `[mock]` logs
- `button.png` lives in `src/assets/` as the source file but is only used natively — copy it to `android/res/drawable/` for the widget, never import it in JS
- `icon.png` in `src/assets/` is the app icon — referenced in `app.json`
- SVG icons (`settings.svg`, `edit.svg`, `trash.svg`, `plus.svg`, `snooze.svg`, `exclamation.svg`) are rendered via `react-native-svg`
- `missedAlarm` is never set by native Kotlin — it is computed in `storageService.getReminders()` when `triggerTime < Date.now()`
- Always cancel alarm before deleting or editing a reminder — never delete or reschedule without cancelling first
- `goHome()` sends the app to background — it does not close the app

---

## 9. Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Alarm API | `setAlarmClock()` | Highest OS priority, used by clock apps, exempt from Doze |
| Workflow | Expo Bare | Needed for native Kotlin while keeping Expo Router |
| Alert style | Full screen Activity | No notifications — alarm-style takeover only |
| Storage | `expo-sqlite` only | Single solution for reminders and settings — no extra dependency |
| Reminder state | Exists or trashed | No `isActive` flag — presence in storage means active |
| Missed alarm | `missedAlarm` flag in type | Computed on app open from stale `triggerTime` — no native involvement, no auto-delete, user trashes manually |
| Snooze limit | Unlimited | User can snooze as many times as needed |
| Coordination | Actions layer | Keeps services single-responsibility, screens stay clean |
| Edit action | `editReminderAction` | Cancel old alarm + save + reschedule as one coordinated operation in AlarmManager |
| Time picker | `@react-native-community/datetimepicker` | Native Android dialog — familiar to users, handles locale and accessibility |
| Source detection | `source` only for widget | Widget passes `source=widget`, FAB passes no params, edit passes only `id` — cleaner URLs, no data leaking into navigation |
| Home navigation | `NavigationModule.goHome()` | Reliable across all Android versions — sends app to background without closing |
| AlarmScreen UI | Single `app/alarm.tsx` for both states | `setShowWhenLocked` and `setTurnScreenOn` are OS window flags, not UI flags — same screen renders regardless |
| Font | Lilita One | Bold, rounded — matches chunky UI with thick borders and padding |
| FAB icon | `src/assets/plus.svg` | SVG rendered directly — no PNG background |
| App icon | `src/assets/icon.png` | Dedicated app icon for install and app drawer |
| Widget icon | `src/assets/button.png` | Copied to `android/res/drawable/` — only used natively, never in JS |
| SVG icons | `src/assets/*.svg` via `react-native-svg` | Settings, edit, trash, plus, snooze, exclamation — scalable and consistent with theme |
| Widget | Native Kotlin `AppWidgetProvider` | React Native has no widget support |
| Routing | Expo Router in `app/` | Convention required by Expo Router — all routes must be in `app/` |