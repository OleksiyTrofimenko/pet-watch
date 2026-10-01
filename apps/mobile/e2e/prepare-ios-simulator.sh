#!/bin/sh
# Before Maestro runs on the iOS simulator: typing must land exactly as sent. Turn off autocorrect and
# predictive text (they rewrite input, e.g. "Labrador" + "The") and mark the slide-to-type tip as seen
# (its sheet covers the keyboard on a fresh simulator). Turn off password AutoFill: on a new-password
# field iOS's strong-password handling keeps only the last typed character, and it prompts
# "Save Password?" after every sign-in. Optional arg: the simulator UDID when several are booted.
# No-op without a booted simulator.
xcrun simctl list devices booted 2>/dev/null | grep -q Booted || exit 0
DEVICE="${1:-booted}"
prefs() { xcrun simctl spawn "$DEVICE" defaults write com.apple.Preferences "$@"; }
prefs KeyboardAutocorrection -bool NO
prefs KeyboardPrediction -bool NO
prefs KeyboardContinuousPathEnabled -bool NO
prefs DidShowContinuousPathIntroduction -bool YES
xcrun simctl spawn "$DEVICE" defaults write com.apple.WebUI AutoFillPasswords -bool NO
xcrun simctl spawn "$DEVICE" defaults write com.apple.mobilesafari EnableAutomaticStrongPasswords -bool NO
exit 0
