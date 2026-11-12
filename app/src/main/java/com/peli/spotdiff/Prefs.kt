package com.peli.spotdiff

import android.content.Context

object Prefs {
    private const val FILE = "peli"
    fun sp(c: Context) = c.getSharedPreferences(FILE, Context.MODE_PRIVATE)
    fun alwaysOnTop(c: Context) = sp(c).getBoolean("alwaysOnTop", false)
    fun floating(c: Context) = sp(c).getBoolean("floating", false)
    fun setAlwaysOnTop(c: Context, v: Boolean) = sp(c).edit().putBoolean("alwaysOnTop", v).apply()
    fun setFloating(c: Context, v: Boolean) = sp(c).edit().putBoolean("floating", v).apply()
}
