package com.huuy

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
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

    private fun buildPendingIntent(id: String, title: String = ""): PendingIntent {
        val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
            putExtra(EXTRA_REMINDER_ID, id)
            if (title.isNotEmpty()) putExtra(EXTRA_REMINDER_TITLE, title)
        }
        return PendingIntent.getBroadcast(reactContext, id.hashCode(), intent, PENDING_INTENT_FLAGS)
    }

    @ReactMethod
    fun scheduleAlarm(id: String, title: String, triggerTime: Double, promise: Promise) {
        Log.d(TAG, "scheduleAlarm called — id=$id triggerTime=$triggerTime")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            Log.e(TAG, "scheduleAlarm FAILED — exact alarm permission not granted")
            promise.reject("PERMISSION_DENIED", "Exact alarm permission not granted")
            return
        }

        val pendingIntent = buildPendingIntent(id, title)
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
