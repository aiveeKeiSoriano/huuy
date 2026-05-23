# Project Stories

A log of struggles, discoveries, and decisions made throughout this project.

---

## Story 1: App Icon and Splash Screen

### The Icon Problem

On the first build, the launcher icon looked tiny and was contained inside a white circle. The initial icon generation only targeted **Android 12 and below**, which didn't produce the correct adaptive icon format.

**Fix:** Created a `mipmap-anydpi-v26` folder with the background and foreground icon as separate layers. This is the adaptive icon format Android uses to render the launcher icon properly across different devices and launchers.

### The Splash Screen Problem

The splash screen also had an Android version split. The base `values/styles.xml` (Android 11 and below) shows the icon as the splash background. A `values-v31` folder was added for Android 12+ to suppress the default behavior. `values-v31` sets the splash screen icon to a blank image instead.

### Animated Splash Screen

Wanted the splash screen to have an animation, but the native splash screen API gives no control over display duration — it just shows and disappears on its own.

**Decision:** Changed the native splash screen to be blank (solid color), then built a fake splash screen inside the app using an animated text sequence. This custom screen shows on app open, giving full control over timing and animation style.

---

## Story 2: Notification Buttons That Wasn't Worth It

### The Notification Button Trap

The idea was to add Snooze and Delete action buttons directly on the notification — so you could handle an alarm without opening the app. The approaches was:

A new `AlarmActionReceiver` in Kotlin would catch the button taps and handle snooze/delete entirely natively — updating SQLite directly, rescheduling or cancelling AlarmManager, and dismissing the notification without touching the app.

But it was trashed because the snooze and delete logic already lives in the JS action layer — coordinating AlarmManager, SQLite, and any future concerns. Doing it again in Kotlin means maintaining two implementations of the same thing. If snooze duration changes, or the reminder schema changes, or the AlarmManager call changes, that's two places to update.

**The accepted UX:** Dismissing the notification is fine. If the user doesn't want to deal with the alarm screen, they swipe the notification away. The reminder stays in the list with a missed alarm marker. They open the app later, see it, and snooze or delete from there. That flow already works. A notification without actions is still enough to remind the user.

---
