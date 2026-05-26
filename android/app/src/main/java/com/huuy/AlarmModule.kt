package com.huuy

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.lang.ref.WeakReference

class AlarmModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        @Volatile var pendingAlarmActivity: WeakReference<AlarmActivity>? = null
    }

    override fun getName(): String = "AlarmModule"

    private val alarmManager get() =
        reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    private fun buildPendingIntent(id: String, title: String = "", notificationTitle: String = ""): PendingIntent {
        val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
            putExtra(EXTRA_REMINDER_ID, id)
            if (title.isNotEmpty()) putExtra(EXTRA_REMINDER_TITLE, title)
            if (notificationTitle.isNotEmpty()) putExtra(EXTRA_NOTIFICATION_TITLE, notificationTitle)
        }
        return PendingIntent.getBroadcast(reactContext, id.hashCode(), intent, PENDING_INTENT_FLAGS)
    }

    @ReactMethod
    fun scheduleAlarm(id: String, title: String, triggerTime: Double, notificationTitle: String, promise: Promise) {
        Log.d(TAG, "scheduleAlarm called — id=$id triggerTime=$triggerTime")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            Log.e(TAG, "scheduleAlarm FAILED — exact alarm permission not granted")
            promise.reject("PERMISSION_DENIED", "Exact alarm permission not granted")
            return
        }

        val pendingIntent = buildPendingIntent(id, title, notificationTitle)
        alarmManager.setAlarmClock(AlarmManager.AlarmClockInfo(triggerTime.toLong(), pendingIntent), pendingIntent)
        Log.d(TAG, "scheduleAlarm registered with AlarmManager — id=$id")
        promise.resolve(null)
    }

    @ReactMethod
    fun cancelAlarm(id: String) {
        Log.d(TAG, "cancelAlarm called — id=$id")
        alarmManager.cancel(buildPendingIntent(id))
        Log.d(TAG, "cancelAlarm done — id=$id")
    }

    @ReactMethod
    fun canUseFullScreenIntent(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            val nm = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            promise.resolve(nm.canUseFullScreenIntent())
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            promise.resolve(alarmManager.canScheduleExactAlarms())
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun openExactAlarmSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                data = Uri.parse("package:${reactContext.packageName}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun openFullScreenIntentSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            val intent = Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT).apply {
                data = Uri.parse("package:${reactContext.packageName}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
        }
    }

    private fun bootPrefs() = reactContext.getSharedPreferences("huuy_alarms", Context.MODE_PRIVATE)

    @ReactMethod
    fun saveAlarmForBoot(id: String, triggerTime: Double, title: String, notificationTitle: String) {
        val prefs = bootPrefs()
        val ids = prefs.getStringSet("alarm_ids", emptySet())!!.toMutableSet().also { it.add(id) }
        prefs.edit()
            .putStringSet("alarm_ids", ids)
            .putLong("${id}_time", triggerTime.toLong())
            .putString("${id}_title", title)
            .putString("${id}_notif", notificationTitle)
            .apply()
        Log.d(TAG, "saveAlarmForBoot — id=$id triggerTime=$triggerTime")
    }

    @ReactMethod
    fun removeAlarmForBoot(id: String) {
        val prefs = bootPrefs()
        val ids = prefs.getStringSet("alarm_ids", emptySet())!!.toMutableSet().also { it.remove(id) }
        prefs.edit()
            .putStringSet("alarm_ids", ids)
            .remove("${id}_time")
            .remove("${id}_title")
            .remove("${id}_notif")
            .apply()
        Log.d(TAG, "removeAlarmForBoot — id=$id")
    }

    @ReactMethod
    fun notifyAlarmReady() {
        Log.d(TAG, "notifyAlarmReady called — pendingAlarmActivity=$pendingAlarmActivity")
        val activity = pendingAlarmActivity?.get() ?: run {
            Log.w(TAG, "notifyAlarmReady — no pending AlarmActivity to finish")
            return
        }
        Handler(Looper.getMainLooper()).post {
            Log.d(TAG, "notifyAlarmReady — finishing AlarmActivity")
            activity.finish()
        }
    }
}
