---
name: mobile-app-distribution
description: Mobile app distribution for iOS App Store and Google Play Store. Covers React Native signing, building, publishing, Apple App Store review guidelines, and pre-submission checklists. Use when preparing apps for release, configuring signing, or troubleshooting review rejections.
---

# Mobile App Distribution

Publish React Native apps to Apple App Store and Google Play Store. Covers signing, building, submitting, and passing review.

## Quick Reference

| Topic | Reference |
|-------|-----------|
| [Android Signing & Publishing](references/android-signing.md) | Upload key, Gradle config, AAB/APK, ProGuard, Google Play |
| [iOS Publishing](references/ios-publishing.md) | Xcode release scheme, archiving, App Store Connect, TestFlight |
| [App Store Review Guidelines](references/app-store-guidelines.md) | Apple's review rules — safety, performance, business, design, legal |
| [Pre-Submission Checklist](references/pre-submission-checklist.md) | Both platforms — signing, metadata, screenshots, compliance |

## Android: Key Steps

### 1. Generate upload key
```shell
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Gradle signing
Add to `~/.gradle/gradle.properties` (not project, to avoid Git commits):
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

Add signing config to `android/app/build.gradle`:
```groovy
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
        signingConfig signingConfigs.release
    }
}
```

### 3. Build release AAB
```shell
npx react-native build-android --mode=release
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 4. Test release build
```shell
npx react-native run-android --mode=release
```

## iOS: Key Steps

### 1. Configure release scheme
Xcode: **Product > Scheme > Edit Scheme > Run > Build Configuration > Release**

### 2. Build and archive
- Set device to **Any iOS Device (arm64)**
- **Product > Archive**
- Verify Bundle Identifier matches Apple Developer Dashboard

### 3. Submit
- Archive window: **Distribute App > App Store Connect > Upload**
- Find build in App Store Connect under TestFlight
- Fill metadata, select build, **Submit For Review**

### CLI alternative
```shell
npx react-native run-ios --mode=Release
```

## Apple Review: Common Rejection Reasons

| Reason | Guideline | Fix |
|--------|-----------|-----|
| Crashes/bugs | 2.1 | Test thoroughly, fix all crashes before submission |
| Incomplete metadata | 2.3 | Complete all fields, accurate screenshots showing app in use |
| Login required without demo | 2.1 | Provide demo account in App Review notes |
| Missing privacy policy | 5.1.1 | Add privacy policy link in App Store Connect and within app |
| Requesting unnecessary permissions | 5.1.1(iii) | Only request data relevant to core functionality |
| Hidden features | 2.3.1 | Describe all features in Notes for Review |
| In-app purchase bypass | 3.1.1 | Use Apple IAP for digital content/features |
| No account deletion | 5.1.1(v) | Offer account deletion if supporting account creation |
| Minimum functionality | 4.2 | App must be more than a repackaged website |
| Missing Sign in with Apple | 4.8 | Required when offering third-party social login |

## Key Rules

- **Keep keystore private** — if Android upload key is compromised, follow Google's reset process
- **Never commit signing credentials** to Git — use `~/.gradle/gradle.properties` or CI secrets
- **Ensure `gradle.properties` does not have `org.gradle.configureondemand=true`** — breaks JS bundling
- **Test release builds on device** before submitting
- **Screenshots must show app in use** — not splash screens or login pages
- **Privacy policy is mandatory** for both platforms
- **Expo users**: Use `expo build` or EAS Build for automated distribution
