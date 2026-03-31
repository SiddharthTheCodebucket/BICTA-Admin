package com.bipardadmin

import android.app.Activity
import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.view.WindowManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class KioskModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "KioskModule"

    private fun getActivity(): Activity? = reactContext.currentActivity

    /**
     * Start Lock Task Mode (screen pinning / kiosk mode).
     */
    @ReactMethod
    fun startKioskMode(promise: Promise) {
        val activity = getActivity()
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not available")
            return
        }

        try {
            activity.runOnUiThread {
                // Keep screen always on
                activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

                // Start lock task (screen pinning)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    activity.startLockTask()
                }
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("KIOSK_ERROR", e.message)
        }
    }

    /**
     * Stop Lock Task Mode and restore normal behavior.
     */
    @ReactMethod
    fun stopKioskMode(promise: Promise) {
        val activity = getActivity()
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not available")
            return
        }

        try {
            activity.runOnUiThread {
                // Remove keep-screen-on flag
                activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

                // Stop lock task
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    activity.stopLockTask()
                }
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("KIOSK_ERROR", e.message)
        }
    }

    /**
     * Check if lock task mode is currently active.
     */
    @ReactMethod
    fun isInKioskMode(promise: Promise) {
        try {
            val activityManager =
                reactContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val lockTaskMode = activityManager.lockTaskModeState
                promise.resolve(lockTaskMode != ActivityManager.LOCK_TASK_MODE_NONE)
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                @Suppress("DEPRECATION")
                promise.resolve(activityManager.isInLockTaskMode)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Keep the screen always on (without lock task).
     */
    @ReactMethod
    fun keepScreenOn(promise: Promise) {
        val activity = getActivity()
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not available")
            return
        }

        activity.runOnUiThread {
            activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }
        promise.resolve(true)
    }

    /**
     * Allow screen to turn off normally again.
     */
    @ReactMethod
    fun allowScreenOff(promise: Promise) {
        val activity = getActivity()
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not available")
            return
        }

        activity.runOnUiThread {
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }
        promise.resolve(true)
    }
}
