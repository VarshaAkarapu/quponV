# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html
 
# Add any project specific keep options here:
 
# Firebase ProGuard Rules
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
 
# React Native Firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**
 
# Keep Firebase Auth classes
-keep class com.google.firebase.auth.** { *; }
-keep class com.google.android.gms.auth.** { *; }
 
# Keep Firebase App classes
-keep class com.google.firebase.FirebaseApp { *; }
-keep class com.google.firebase.FirebaseOptions { *; }
 
# Keep JSON classes for Firebase config
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
 
# Keep AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**
 
# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
 
# Additional Firebase rules for release builds
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
 
# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
 
# Keep Firebase Analytics
-keep class com.google.firebase.analytics.** { *; }
-keep class com.google.android.gms.measurement.** { *; }
 
# Keep Firebase Crashlytics
-keep class com.google.firebase.crashlytics.** { *; }
 
# Keep Firebase Performance
-keep class com.google.firebase.perf.** { *; }
 
# Keep Firebase Remote Config
-keep class com.google.firebase.remoteconfig.** { *; }
 
# Keep Firebase Cloud Messaging
-keep class com.google.firebase.messaging.** { *; }
 
# Keep Firebase Dynamic Links
-keep class com.google.firebase.dynamiclinks.** { *; }
 
# Keep Firebase In-App Messaging
-keep class com.google.firebase.inappmessaging.** { *; }
 
# Keep Firebase ML Kit
-keep class com.google.firebase.ml.** { *; }
 
# Keep Firebase Storage
-keep class com.google.firebase.storage.** { *; }
 
# Keep Firebase Firestore
-keep class com.google.firebase.firestore.** { *; }
 
# Keep Firebase Functions
-keep class com.google.firebase.functions.** { *; }
 
# Keep Firebase Hosting
-keep class com.google.firebase.hosting.** { *; }
 
# Keep Firebase Realtime Database
-keep class com.google.firebase.database.** { *; }
 
# Keep Firebase A/B Testing
-keep class com.google.firebase.abt.** { *; }
 
# Keep Firebase App Check
-keep class com.google.firebase.appcheck.** { *; }
 
# Keep Firebase App Distribution
-keep class com.google.firebase.appdistribution.** { *; }
 
# Keep Firebase Extensions
-keep class com.google.firebase.extensions.** { *; }
 
# Keep Firebase Installations
-keep class com.google.firebase.installations.** { *; }
 
# Keep Firebase Instance ID
-keep class com.google.firebase.iid.** { *; }
 
# Keep Firebase Project Management
-keep class com.google.firebase.projects.** { *; }
 
# Keep Firebase SDK
-keep class com.google.firebase.** { *; }
-keep interface com.google.firebase.** { *; }
 
# Keep Google Play Services
-keep class com.google.android.gms.** { *; }
-keep interface com.google.android.gms.** { *; }
 
# Razorpay ProGuard Rules
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**
 
# Missing ProGuard classes
-dontwarn proguard.annotation.Keep
-dontwarn proguard.annotation.KeepClassMembers
 
# React Navigation
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
 
# Keep all React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
 
# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
 
# Keep all classes with @ReactMethod annotation
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}
 
# Keep all classes with @ReactModule annotation
-keep @com.facebook.react.bridge.annotations.ReactModule class *

# Additional React Native ProGuard rules for production
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.views.** { *; }

# Keep React Native Image Picker
-keep class com.imagepicker.** { *; }
-dontwarn com.imagepicker.**

# Keep React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.gesturehandler.**

# Keep React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# Keep React Native Screens
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# Keep React Native Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }
-dontwarn com.th3rdwave.safeareacontext.**

# Keep React Native Picker
-keep class com.reactnativepicker.** { *; }
-dontwarn com.reactnativepicker.**

# Keep React Native DateTime Picker
-keep class com.reactcommunity.rndatetimepicker.** { *; }
-dontwarn com.reactcommunity.rndatetimepicker.**

# General React Native rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep JavaScript interface
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep all classes with @Keep annotation
-keep @androidx.annotation.Keep class *
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}