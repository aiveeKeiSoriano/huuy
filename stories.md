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
