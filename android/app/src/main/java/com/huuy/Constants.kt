package com.huuy

import android.app.PendingIntent

internal const val TAG = "Huuy"
internal const val EXTRA_REMINDER_ID = "reminderId"
internal const val EXTRA_REMINDER_TITLE = "reminderTitle"
internal const val ALARM_DEEP_LINK_BASE = "huuy://alarm?reminderId="
internal val PENDING_INTENT_FLAGS = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
