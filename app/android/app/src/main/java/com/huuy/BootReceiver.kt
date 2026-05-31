package com.huuy

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        Log.d(TAG, "BootReceiver.onReceive — rescheduling alarms after boot")

        val prefs = context.getSharedPreferences("huuy_alarms", Context.MODE_PRIVATE)
        val ids = prefs.getStringSet("alarm_ids", emptySet())?.toSet() ?: return
        if (ids.isEmpty()) {
            Log.d(TAG, "BootReceiver — no alarms to reschedule")
            return
        }

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val now = System.currentTimeMillis()
        val expired = mutableSetOf<String>()

        ids.forEach { id ->
            val triggerTime = prefs.getLong("${id}_time", 0L)

            if (triggerTime <= now) {
                Log.d(TAG, "BootReceiver — skipping expired alarm id=$id")
                expired.add(id)
                return@forEach
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                Log.e(TAG, "BootReceiver — exact alarm permission not granted, skipping id=$id")
                return@forEach
            }

            val title = prefs.getString("${id}_title", "") ?: ""
            val notificationTitle = prefs.getString("${id}_notif", "Huuuuy yung") ?: "Huuuuy yung"

            val broadcastIntent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra(EXTRA_REMINDER_ID, id)
                putExtra(EXTRA_REMINDER_TITLE, title)
                putExtra(EXTRA_NOTIFICATION_TITLE, notificationTitle)
            }
            val pendingIntent = PendingIntent.getBroadcast(context, id.hashCode(), broadcastIntent, PENDING_INTENT_FLAGS)
            alarmManager.setAlarmClock(AlarmManager.AlarmClockInfo(triggerTime, pendingIntent), pendingIntent)
            Log.d(TAG, "BootReceiver — rescheduled alarm id=$id at=$triggerTime")
        }

        if (expired.isNotEmpty()) {
            val editor = prefs.edit()
            expired.forEach { id ->
                editor.remove("${id}_time")
                editor.remove("${id}_title")
                editor.remove("${id}_notif")
            }
            editor.putStringSet("alarm_ids", ids - expired)
            editor.apply()
            Log.d(TAG, "BootReceiver — cleaned up ${expired.size} expired alarm(s)")
        }
    }
}
