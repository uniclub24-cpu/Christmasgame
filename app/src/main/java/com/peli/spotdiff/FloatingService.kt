package com.peli.spotdiff

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.MotionEvent
import android.view.WindowManager
import android.widget.ImageView
import kotlin.math.abs

/**
 * 플로팅 아이콘(다른 앱 위에 떠 있는 페리 버튼)을 띄우고,
 * '항상 위' 사용 시 앱이 백그라운드로 가지 않도록 돕는 포그라운드 서비스.
 */
class FloatingService : Service() {

    private var wm: WindowManager? = null
    private var bubble: ImageView? = null
    private var bubbleLp: WindowManager.LayoutParams? = null
    private var wantVisible = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        wm = getSystemService(WINDOW_SERVICE) as WindowManager
        startAsForeground()
        refresh()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        refresh()
        return START_STICKY
    }

    override fun onDestroy() {
        removeBubble()
        instance = null
        super.onDestroy()
    }

    fun refresh() {
        val canOverlay = Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(this)
        // 오버레이 창은 항상 유지(보이지 않을 때는 1px 투명) — 백그라운드에서 앱을 다시 띄우려면 필요
        if (canOverlay) { addBubble(); applyLook() } else removeBubble()
    }

    @Suppress("DEPRECATION")
    private fun startAsForeground() {
        val chId = "peli_float"
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(NotificationChannel(chId, "페리 플로팅", NotificationManager.IMPORTANCE_MIN))
        }
        val pi = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val b = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(this, chId) else Notification.Builder(this)
        val n = b.setSmallIcon(R.drawable.ic_stat_peli)
            .setContentTitle(getString(R.string.app_name))
            .setContentText("실행 중 (원격 띄우기/숨기기 대기)")
            .setContentIntent(pi)
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= 34) startForeground(7, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        else startForeground(7, n)
    }

    @Suppress("DEPRECATION")
    @SuppressLint("ClickableViewAccessibility")
    private fun addBubble() {
        if (bubble != null) return
        val size = (64 * resources.displayMetrics.density).toInt()
        val type = if (Build.VERSION.SDK_INT >= 26) WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else WindowManager.LayoutParams.TYPE_PHONE
        val lp = WindowManager.LayoutParams(
            size, size, type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            val sp = Prefs.sp(this@FloatingService)
            x = sp.getInt("bubbleX", 24); y = sp.getInt("bubbleY", 200)
        }
        val v = ImageView(this).apply {
            setImageResource(R.drawable.peli_float)
            elevation = 8f
        }
        var sx = 0; var sy = 0; var tx = 0f; var ty = 0f; var moved = false
        v.setOnTouchListener { _, e ->
            when (e.action) {
                MotionEvent.ACTION_DOWN -> { sx = lp.x; sy = lp.y; tx = e.rawX; ty = e.rawY; moved = false; true }
                MotionEvent.ACTION_MOVE -> {
                    val dx = e.rawX - tx; val dy = e.rawY - ty
                    if (abs(dx) > 10 || abs(dy) > 10) moved = true
                    lp.x = sx + dx.toInt(); lp.y = sy + dy.toInt()
                    wm?.updateViewLayout(v, lp); true
                }
                MotionEvent.ACTION_UP -> {
                    if (!moved) {
                        // 아이콘 탭 → 게임 화면을 전체화면으로 최상단에 띄움
                        MainActivity.minimized = false
                        setBubbleVisible(false)
                        MainActivity.bringToFront(this)
                    } else Prefs.sp(this).edit().putInt("bubbleX", lp.x).putInt("bubbleY", lp.y).apply()
                    true
                }
                else -> false
            }
        }
        try { wm?.addView(v, lp); bubble = v; bubbleLp = lp; setBubbleVisible(!MainActivity.foreground) } catch (_: Exception) { }
    }

    /** 게임 화면이 앞에 있을 때는 아이콘을 숨기고, 뒤로 가면 다시 보여줌 */
    fun setBubbleVisible(show: Boolean) {
        wantVisible = show
        applyLook()
    }

    /** 실제로 보일 때만 64dp 아이콘, 아니면 1px 투명 창(창은 유지) */
    private fun applyLook() {
        val b = bubble ?: return
        val lp = bubbleLp ?: return
        val real = wantVisible && Prefs.floating(this) && !MainActivity.iconSuppressed
        val size = (64 * resources.displayMetrics.density).toInt()
        lp.width = if (real) size else 1
        lp.height = if (real) size else 1
        lp.flags = if (real) {
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        } else {
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS or
                WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
        }
        b.alpha = if (real) 1f else 0f
        try { wm?.updateViewLayout(b, lp) } catch (_: Exception) { }
    }

    private fun removeBubble() {
        bubble?.let { try { wm?.removeView(it) } catch (_: Exception) { } }
        bubble = null
        bubbleLp = null
    }

    companion object {
        var instance: FloatingService? = null
    }
}
