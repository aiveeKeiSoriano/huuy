package com.huuy

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.RemoteViews

class WidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        appWidgetIds.forEach { id -> updateWidget(context, appWidgetManager, id) }
    }

    private fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("huuy://create?source=widget")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        val pendingIntent = PendingIntent.getActivity(context, appWidgetId, intent, PENDING_INTENT_FLAGS)

        val views = RemoteViews(context.packageName, R.layout.widget).apply {
            setOnClickPendingIntent(R.id.widget_button, pendingIntent)
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
        Log.d(TAG, "WidgetProvider — updated widget id=$appWidgetId")
    }
}
