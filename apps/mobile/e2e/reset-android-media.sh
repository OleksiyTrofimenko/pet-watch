#!/bin/sh
# Before Maestro runs on Android: drop photos added by earlier runs (addMedia) and rescan.
# Stale/duplicate MediaStore entries crash Google's system photo picker
# ("Key ... was already used"), which pets.yaml uses. No-op without an Android device.
command -v adb >/dev/null 2>&1 || exit 0
adb get-state >/dev/null 2>&1 || exit 0
adb shell 'rm -f /sdcard/Pictures/*.jpg /sdcard/DCIM/*.jpg' >/dev/null 2>&1
adb shell pm clear com.android.providers.media.module >/dev/null 2>&1
adb shell pm clear com.google.android.photopicker >/dev/null 2>&1
adb shell content call --method scan_volume --uri content://media --arg external_primary >/dev/null 2>&1
exit 0
