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
        private const val TAG = "Huuy"
        const val CHANNEL_ID = "huuy_alarms"

        fun notificationId(reminderId: String) = reminderId.hashCode()
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "AlarmReceiver.onReceive fired — action=${intent.action}")

        val reminderId = intent.getStringExtra("reminderId") ?: run {
            Log.e(TAG, "AlarmReceiver — reminderId extra missing, aborting")
            return
        }

        Log.d(TAG, "AlarmReceiver — reminderId=$reminderId")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
            Log.d(TAG, "AlarmReceiver — POST_NOTIFICATIONS granted=$granted")
            if (!granted) {
                Log.e(TAG, "AlarmReceiver — POST_NOTIFICATIONS not granted, notification will be silently dropped")
                return
            }
        }

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            val canUse = notificationManager.canUseFullScreenIntent()
            Log.d(TAG, "AlarmReceiver — canUseFullScreenIntent=$canUse")
            if (!canUse) {
                Log.e(TAG, "AlarmReceiver — USE_FULL_SCREEN_INTENT not granted, alarm screen will not appear over lock screen")
            }
        }

        try {
            val channel = NotificationChannel(CHANNEL_ID, "Alarms", NotificationManager.IMPORTANCE_HIGH).apply {
                setBypassDnd(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            notificationManager.createNotificationChannel(channel)
            Log.d(TAG, "AlarmReceiver — notification channel created/updated")
        } catch (e: Exception) {
            Log.e(TAG, "AlarmReceiver — failed to create notification channel: ${e.message}", e)
        }

        try {
            val fullScreenIntent = Intent(context, AlarmActivity::class.java).apply {
                putExtra("reminderId", reminderId)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val fullScreenPendingIntent = PendingIntent.getActivity(
                context,
                notificationId(reminderId),
                fullScreenIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val notification = Notification.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle("Huuy")
                .setContentText("huuuyyyy!")
                .setCategory(Notification.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setOngoing(true)
                .setAutoCancel(false)
                .build()

            val nId = notificationId(reminderId)
            notificationManager.notify(nId, notification)
            Log.d(TAG, "AlarmReceiver — notification posted id=$nId")
        } catch (e: Exception) {
            Log.e(TAG, "AlarmReceiver — failed to post notification: ${e.message}", e)
        }
    }
}
