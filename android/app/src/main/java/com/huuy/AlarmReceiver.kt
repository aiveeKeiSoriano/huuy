package com.huuy

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {

    companion object {
        const val CHANNEL_ID = "huuy_alarms"

        fun notificationId(reminderId: String) = reminderId.hashCode()
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "AlarmReceiver.onReceive fired — action=${intent.action}")

        val reminderId = intent.getStringExtra(EXTRA_REMINDER_ID) ?: run {
            Log.e(TAG, "AlarmReceiver — reminderId extra missing, aborting")
            return
        }
        val reminderTitle = intent.getStringExtra(EXTRA_REMINDER_TITLE) ?: ""

        Log.d(TAG, "AlarmReceiver — reminderId=$reminderId title=$reminderTitle")

        if (!checkPermissions(context)) return

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        setupChannel(notificationManager)
        postNotification(context, notificationManager, reminderId, reminderTitle)
    }

    private fun checkPermissions(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
            Log.d(TAG, "AlarmReceiver — POST_NOTIFICATIONS granted=$granted")
            if (!granted) {
                Log.e(TAG, "AlarmReceiver — POST_NOTIFICATIONS not granted, notification will be silently dropped")
                return false
            }
        }
        return true
    }

    private fun setupChannel(notificationManager: NotificationManager) {
        try {
            val channel = NotificationChannel(CHANNEL_ID, "Alarms", NotificationManager.IMPORTANCE_MAX).apply {
                setBypassDnd(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 400, 200, 400)
            }
            notificationManager.createNotificationChannel(channel)
            Log.d(TAG, "AlarmReceiver — notification channel created/updated")
        } catch (e: Exception) {
            Log.e(TAG, "AlarmReceiver — failed to create notification channel: ${e.message}", e)
        }
    }

    private fun postNotification(context: Context, notificationManager: NotificationManager, reminderId: String, reminderTitle: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            val canUse = notificationManager.canUseFullScreenIntent()
            Log.d(TAG, "AlarmReceiver — canUseFullScreenIntent=$canUse")
            if (!canUse) {
                Log.e(TAG, "AlarmReceiver — USE_FULL_SCREEN_INTENT not granted, alarm screen will not appear over lock screen")
            }
        }

        try {
            val nId = notificationId(reminderId)
            val fullScreenPendingIntent = PendingIntent.getActivity(
                context,
                nId,
                Intent(context, AlarmActivity::class.java).apply {
                    putExtra(EXTRA_REMINDER_ID, reminderId)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                },
                PENDING_INTENT_FLAGS
            )

            val notification = Notification.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle("Huuuuy yung")
                .setContentText(reminderTitle.ifEmpty { "ano!" })
                .setCategory(Notification.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setOngoing(true)
                .setAutoCancel(false)
                .build()

            notificationManager.notify(nId, notification)
            Log.d(TAG, "AlarmReceiver — notification posted id=$nId")
        } catch (e: Exception) {
            Log.e(TAG, "AlarmReceiver — failed to post notification: ${e.message}", e)
        }
    }
}
