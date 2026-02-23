# Android Signing & Publishing (React Native)

Android requires all apps to be digitally signed before installation. Google Play uses [App Signing by Google Play](https://developer.android.com/studio/publish/app-signing#app-signing-google-play) to manage signing automatically, but you must sign with an upload key first.

## Generate Upload Key

### macOS
```shell
# Find JDK path
/usr/libexec/java_home

# Generate key (navigate to JDK bin directory first)
sudo keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Windows
Run from `C:\Program Files\Java\jdkx.x.x_x\bin` as administrator:
```shell
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Valid for 10,000 days. Save the alias for later use.

**Keep the keystore file private.** If compromised, [follow Google's reset instructions](https://support.google.com/googleplay/android-developer/answer/7384423#reset).

## Configure Gradle Variables

1. Place `my-upload-key.keystore` in `android/app/`

2. Add to `~/.gradle/gradle.properties` (preferred, avoids Git commits) or `android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

On macOS, you can store credentials in Keychain Access instead.

## Add Signing Config to Gradle

Edit `android/app/build.gradle`:
```groovy
android {
    ...
    defaultConfig { ... }
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

## Build Release AAB

```shell
npx react-native build-android --mode=release
```

Generates Android App Bundle at: `android/app/build/outputs/bundle/release/app-release.aab`

**Important**: Ensure `gradle.properties` does NOT contain `org.gradle.configureondemand=true` — this skips JS and asset bundling.

## Test Release Build

Uninstall any previous version first:
```shell
npx react-native run-android --mode=release
```

All JS code is bundled in the APK — no need for Metro bundler.

## Architecture-Specific APKs

For stores supporting device targeting (Amazon AppStore, F-Droid):
```groovy
android {
    splits {
        abi {
            reset()
            enable true
            universalApk false
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }
}
```

Set `universalApk true` for stores without multiple APK support.

Configure distinct version codes per [Android documentation](https://developer.android.com/studio/build/configure-apk-splits#configure-APK-versions).

## ProGuard (Optional)

Reduces APK size by stripping unused Java bytecode. Enable in `android/app/build.gradle`:
```groovy
def enableProguardInReleaseBuilds = true
```

**Test thoroughly** — ProGuard requires configuration for each native library.

## Migrating to App Signing by Google Play

1. Generate a new upload key
2. Update `android/app/build.gradle` to use the new upload key
3. Follow [Google's migration instructions](https://support.google.com/googleplay/android-developer/answer/7384423) to send original release key to Google Play

## Default Permissions

- `INTERNET` — added by default (required for most apps)
- `SYSTEM_ALERT_WINDOW` — debug mode only, removed in production
