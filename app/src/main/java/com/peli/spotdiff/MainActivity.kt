package com.peli.spotdiff

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.Settings
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.webkit.WebViewAssetLoader
import java.io.File

class MainActivity : Activity() {

    private lateinit var web: WebView
    private val ui = Handler(Looper.getMainLooper())
    private var exiting = false
    private var waitingPermission = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        applyLockScreenFlags()

        web = WebView(this)
        setContentView(web)
        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .addPathHandler("/ota/", WebViewAssetLoader.InternalStoragePathHandler(this, otaDir()))
            .build()
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            textZoom = 100
        }
        web.overScrollMode = View.OVER_SCROLL_NEVER
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                loader.shouldInterceptRequest(request.url)
        }
        web.addJavascriptInterface(Bridge(), "AndroidBridge")
        loadGame()

        syncService()
        // 관제의 '앱 띄우기/숨기기' 가 동작하려면 '다른 앱 위에 표시' 권한이 필요
        if (!canOverlay()) askOverlayPermission()
    }

    // ---------- 게임 자동 업데이트(OTA) ----------
    private fun otaDir(): File = File(filesDir, "ota").apply { mkdirs() }
    private fun otaFile() = File(otaDir(), "index.html")
    private fun otaVer(): String = if (otaFile().exists()) Prefs.sp(this).getString("ota_ver", "") ?: "" else ""

    private fun loadGame() {
        val useOta = otaFile().exists() && otaVer().isNotEmpty()
        if (useOta) {
            // 새 버전이 25초 안에 정상 시작(gameOk)하지 못하면 내장 버전으로 되돌림
            gameAlive = false
            ui.postDelayed({
                if (!gameAlive && otaFile().exists()) { dropOta(); loadGame() }
            }, 25000)
            web.loadUrl("https://appassets.androidplatform.net/ota/index.html")
        } else {
            web.loadUrl("https://appassets.androidplatform.net/assets/game/index.html")
        }
    }

    private fun dropOta() {
        try { otaFile().delete() } catch (_: Exception) { }
        Prefs.sp(this).edit().remove("ota_ver").apply()
    }

    // ---------- 항상 위 ----------
    private fun applyLockScreenFlags() {
        val on = Prefs.alwaysOnTop(this)
        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(on); setTurnScreenOn(on)
        }
    }

    private fun canOverlay() = Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(this)

    private fun askOverlayPermission() {
        if (waitingPermission) return
        waitingPermission = true
        Toast.makeText(this, "'다른 앱 위에 표시' 권한을 허용해 주세요", Toast.LENGTH_LONG).show()
        try {
            startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")))
        } catch (e: Exception) {
            startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION))
        }
    }

    private fun syncService() {
        val need = canOverlay()
        val i = Intent(this, FloatingService::class.java)
        if (need) {
            if (Build.VERSION.SDK_INT >= 26) startForegroundService(i) else startService(i)
        } else {
            stopService(i)
        }
        FloatingService.instance?.refresh()
    }

    private fun pushSettingsToJs() {
        val js = "window.onNativeSettings && window.onNativeSettings(${Prefs.alwaysOnTop(this)}, ${Prefs.floating(this)})"
        web.evaluateJavascript(js, null)
    }

    override fun onResume() {
        super.onResume()
        hideSystemUi()
        exiting = false
        // 게임 화면이 앞에 떠 있는 동안에는 플로팅 아이콘을 숨김
        minimized = false
        iconSuppressed = false
        foreground = true
        FloatingService.instance?.setBubbleVisible(false)
        if (::web.isInitialized) web.evaluateJavascript("window.onAppShown && window.onAppShown()", null)
        if (waitingPermission) {
            waitingPermission = false
            if (!canOverlay()) {
                Toast.makeText(this, "권한이 없으면 관제의 '앱 띄우기'가 동작하지 않아요", Toast.LENGTH_LONG).show()
            }
            applyLockScreenFlags()
            syncService()
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemUi()
    }

    override fun onPause() {
        super.onPause()
        foreground = false
        // 게임 화면이 뒤로 가면 플로팅 아이콘을 다시 표시
        FloatingService.instance?.setBubbleVisible(true)
    }

    override fun onStop() {
        super.onStop()
        // 항상 위: 다른 앱/홈으로 나가면 다시 앞으로 가져옴 (자동으로 아이콘으로 돌아간 경우는 제외)
        if (Prefs.alwaysOnTop(this) && !minimized && !exiting && !waitingPermission && !isFinishing && canOverlay()) {
            ui.postDelayed({ bringToFront(this) }, 600)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        web.evaluateJavascript("window.onAndroidBack && window.onAndroidBack()", null)
    }

    private fun hideSystemUi() {
        if (Build.VERSION.SDK_INT >= 30) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let {
                it.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN)
        }
    }

    // ---------- JS 브리지 ----------
    inner class Bridge {
        private val sp = Prefs.sp(this@MainActivity)

        @JavascriptInterface fun getItem(k: String): String? = sp.getString("js_$k", null)
        @JavascriptInterface fun setItem(k: String, v: String) { sp.edit().putString("js_$k", v).apply() }

        @JavascriptInterface fun setAlwaysOnTop(on: Boolean) = ui.post {
            Prefs.setAlwaysOnTop(this@MainActivity, on)
            applyLockScreenFlags()
            if (on && !canOverlay()) askOverlayPermission() else syncService()
        }

        @JavascriptInterface fun setFloatingIcon(on: Boolean) = ui.post {
            Prefs.setFloating(this@MainActivity, on)
            if (on && !canOverlay()) askOverlayPermission() else syncService()
        }

        @Suppress("DEPRECATION")
        @JavascriptInterface fun vibrate(ms: Int) {
            val v = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(ms.toLong(), VibrationEffect.DEFAULT_AMPLITUDE))
            else v.vibrate(ms.toLong())
        }

        /** 게임 화면을 뒤로 보내고(뒤의 태블릿오더가 보임) 플로팅 아이콘 상태로 돌아감 */
        @JavascriptInterface fun minimize() = ui.post {
            minimized = true
            iconSuppressed = false
            syncService()
            FloatingService.instance?.setBubbleVisible(true)
            moveTaskToBack(true)
        }

        /** 뒤로 보내고 플로팅 아이콘도 숨김 (관제의 '앱 숨기기', 성공 후 잠금 상태) */
        @JavascriptInterface fun hideAll() = ui.post {
            minimized = true
            iconSuppressed = true
            syncService()
            FloatingService.instance?.setBubbleVisible(true)
            moveTaskToBack(true)
        }

        /** 게임 화면을 다시 맨 앞으로 (관제의 '앱 띄우기') */
        @JavascriptInterface fun show() = ui.post {
            minimized = false
            iconSuppressed = false
            bringToFront(this@MainActivity)
        }

        @JavascriptInterface fun getGameVer(): String = otaVer()
        @JavascriptInterface fun getAppVer(): String = try { packageManager.getPackageInfo(packageName, 0).versionName ?: "" } catch (_: Exception) { "" }
        @JavascriptInterface fun isForeground(): Boolean = foreground

        /** 내려받은 게임 HTML 저장 (적용은 reloadGame 호출 때) */
        @JavascriptInterface fun saveGame(html: String, ver: String): Boolean = try {
            if (html.length < 2000 || ver.isEmpty()) false else {
                val tmp = File(otaDir(), "index.tmp"); tmp.writeText(html, Charsets.UTF_8)
                val f = otaFile(); if (f.exists()) f.delete()
                if (!tmp.renameTo(f)) false else { Prefs.sp(this@MainActivity).edit().putString("ota_ver", ver).apply(); true }
            }
        } catch (_: Exception) { false }

        @JavascriptInterface fun clearGame() { dropOta() }
        @JavascriptInterface fun reloadGame() = ui.post { loadGame() }
        @JavascriptInterface fun gameOk() { gameAlive = true }

        @JavascriptInterface fun exitApp() = ui.post {
            exiting = true
            stopService(Intent(this@MainActivity, FloatingService::class.java))
            finishAndRemoveTask()
        }
    }

    companion object {
        /** JS가 자동으로 아이콘 상태로 보낸 경우 true (항상 위 기능이 다시 끌어올리지 않도록) */
        @Volatile var minimized = false
        @Volatile var foreground = false
        @Volatile var gameAlive = false
        /** true 이면 게임이 뒤에 있어도 플로팅 아이콘을 보이지 않게 함 */
        @Volatile var iconSuppressed = false

        fun bringToFront(c: Context) {
            val i = Intent(c, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            try { c.startActivity(i) } catch (_: Exception) { }
        }
    }
}
