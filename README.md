# Acerola - Adult Manhwa Reader (NSFW)

Acerola is a React Native mobile app for reading adult Manhwa (Pornhwa). Currently, only an Android version is available via APK.

# Backend & Infrastructure

- Images: Hosted and delivered by Cloudflare.

- Database: Uses a free Supabase instance (may be upgraded as the project grows).

- Local First: A local database with over 570 manhwas is stored on the device to ensure fast performance.

- Sync: Tap the sync button on the home page to fetch the latest data from the cloud.

# Permissions (Android)

The Bug Report feature allows users to attach images. Only the images you choose to send will be accessed.

    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
    <uses-permission android:name="android.permission.VIBRATE"/>

# APK

To use the Acerola app, download and install the latest APK from the "Releases" tab on GitHub. You can verify the APK with online analysis tools such as https://www.androidfreeware.net/apk-check or https://sisik.eu/apk-tool. Alternatively, use an Android emulator to safely test the app.

# Safe Mode

When Safe Mode is enabled, the app behaves like a simple to-do list, and you can only access the pornhwas with a password you set yourself. Safe Mode can be enabled in the settings.

If you forget the password, it cannot be reset or recovered. You must clear the app's data via your Android settings to regain access to the main content.

<div style="display: flex; flex-wrap: wrap; gap: 2%;">
  <img style='max-width: 720px' src="github/images/settings.webp" width="49%" alt="Academy Image 1" />
  <img style='max-width: 720px' src="github/images/todo.webp" width="49%" alt="Academy Image 2" />
</div>

# Support the Project
 
Acerola is free to use.

If you’d like to help cover server costs, donations are welcome. Details are available in the app’s menu.

# Usability

The interface is in English and designed for intuitive navigation. Screenshots are included below for a preview.

<img src="github/images/home.webp" style='max-width: 720px' />

<div style="display: flex; flex-wrap: wrap; gap: 2%;">
  <img style='max-width: 720px' src="github/images/academy.webp" width="49%" alt="Academy Image 1" />
  <img style='max-width: 720px' src="github/images/academy2.webp" width="49%" alt="Academy Image 2" />
</div>

<img src="github/images/library.webp" style='max-width: 720px' />

<img src="github/images/chapter.webp" style='max-width: 720px' />

<img src="github/images/menu.webp" style='max-width: 720px' />

<img src="github/images/random.webp" style='max-width: 720px' />