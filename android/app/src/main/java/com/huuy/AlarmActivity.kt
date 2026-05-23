package com.huuy

import android.app.Activity
import android.app.KeyguardManager
import android.app.NotificationManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log

class AlarmActivity : Activity() {

    companion object {
        private const val TAG = "Huuy"
    }

    private val handler = Handler(Looper.getMainLooper())
    private val finishRunnable = Runnable {
        Log.w(TAG, "AlarmActivity — 5s timeout fired, JS never called notifyAlarmReady")
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "AlarmActivity.onCreate")

        val keyguardManager = getSystemService(KEYGUARD_SERVICE) as KeyguardManager
        Log.d(TAG, "AlarmActivity — isLocked=${keyguardManager.isKeyguardLocked}, isSecure=${keyguardManager.isKeyguardSecure}")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            Log.d(TAG, "AlarmActivity — setShowWhenLocked + setTurnScreenOn applied")
        } else {
            Log.w(TAG, "AlarmActivity — API < 27, window flags not applied (setShowWhenLocked unavailable)")
        }

        AlarmModule.pendingAlarmActivity = this
        Log.d(TAG, "AlarmActivity — registered as pendingAlarmActivity")

        val reminderId = intent.getStringExtra("reminderId") ?: run {
            Log.e(TAG, "AlarmActivity — reminderId extra missing, finishing")
            finish()
            return
        }

        Log.d(TAG, "AlarmActivity — reminderId=$reminderId, firing deep link")

        try {
            val deepLinkIntent = Intent(Intent.ACTION_VIEW, Uri.parse("huuy://alarm?reminderId=$reminderId")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(deepLinkIntent)
            Log.d(TAG, "AlarmActivity — deep link fired successfully")
        } catch (e: Exception) {
            Log.e(TAG, "AlarmActivity — failed to fire deep link: ${e.message}", e)
            finish()
            return
        }

        Log.d(TAG, "AlarmActivity — starting 5s timeout")
        handler.postDelayed(finishRunnable, 5_000)
    }

    override fun onDestroy() {
        Log.d(TAG, "AlarmActivity.onDestroy")
        handler.removeCallbacks(finishRunnable)
        if (AlarmModule.pendingAlarmActivity === this) {
            AlarmModule.pendingAlarmActivity = null
            Log.d(TAG, "AlarmActivity — cleared pendingAlarmActivity")
        }
        val reminderId = intent.getStringExtra("reminderId")
        if (reminderId != null) {
            try {
                val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
                nm.cancel(AlarmReceiver.notificationId(reminderId))
                Log.d(TAG, "AlarmActivity — notification cancelled for reminderId=$reminderId")
            } catch (e: Exception) {
                Log.e(TAG, "AlarmActivity — failed to cancel notification: ${e.message}", e)
            }
        }
        super.onDestroy()
    }
}
