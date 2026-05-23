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

class AlarmModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "Huuy"
        @Volatile var pendingAlarmActivity: AlarmActivity? = null
    }

    override fun getName(): String = "AlarmModule"

    private fun buildPendingIntent(id: String): PendingIntent {
        val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
            putExtra("reminderId", id)
        }
        return PendingIntent.getBroadcast(
            reactContext,
            id.hashCode(),
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
    }

    @ReactMethod
    fun scheduleAlarm(id: String, triggerTime: Double, promise: Promise) {
        Log.d(TAG, "scheduleAlarm called — id=$id triggerTime=$triggerTime")
        val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            Log.e(TAG, "scheduleAlarm FAILED — exact alarm permission not granted")
            promise.reject("PERMISSION_DENIED", "Exact alarm permission not granted")
            return
        }

        val pendingIntent = buildPendingIntent(id)
        alarmManager.setAlarmClock(AlarmManager.AlarmClockInfo(triggerTime.toLong(), pendingIntent), pendingIntent)
        Log.d(TAG, "scheduleAlarm registered with AlarmManager — id=$id")
        promise.resolve(null)
    }

    @ReactMethod
    fun cancelAlarm(id: String) {
        Log.d(TAG, "cancelAlarm called — id=$id")
        val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarmManager.cancel(buildPendingIntent(id))
        Log.d(TAG, "cancelAlarm done — id=$id")
    }

    @ReactMethod
    fun notifyAlarmReady() {
        Log.d(TAG, "notifyAlarmReady called — pendingAlarmActivity=$pendingAlarmActivity")
        val activity = pendingAlarmActivity ?: run {
            Log.w(TAG, "notifyAlarmReady — no pending AlarmActivity to finish")
            return
        }
        Handler(Looper.getMainLooper()).post {
            Log.d(TAG, "notifyAlarmReady — finishing AlarmActivity")
            activity.finish()
        }
    }
}
