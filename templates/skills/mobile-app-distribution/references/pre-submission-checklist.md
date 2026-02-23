# Pre-Submission Checklist

## Both Platforms

- [ ] App tested thoroughly — no crashes or obvious bugs
- [ ] All features working in release/production build
- [ ] Privacy policy accessible within app and in store listing
- [ ] All third-party licenses properly attributed
- [ ] App version and build numbers incremented
- [ ] Release notes written for "What's New"
- [ ] Analytics/crash reporting configured for production
- [ ] Debug logging disabled
- [ ] All environment variables pointing to production

## Android (Google Play)

### Signing
- [ ] Upload key generated (`keytool -genkeypair`)
- [ ] Keystore file stored securely (not in Git)
- [ ] Gradle variables in `~/.gradle/gradle.properties` (not project)
- [ ] Signing config added to `android/app/build.gradle`
- [ ] `gradle.properties` does NOT have `org.gradle.configureondemand=true`

### Build
- [ ] Release AAB built: `npx react-native build-android --mode=release`
- [ ] Release build tested on physical device
- [ ] ProGuard tested if enabled
- [ ] APK splits configured if targeting multiple stores

### Store Listing
- [ ] App title and description complete
- [ ] Screenshots for required device sizes
- [ ] Feature graphic (1024x500) uploaded
- [ ] Content rating questionnaire completed
- [ ] Target audience and content declarations set
- [ ] Data safety section completed (privacy declarations)
- [ ] App category selected

### Compliance
- [ ] Permissions declared in Play Console match app usage
- [ ] `INTERNET` permission present (default)
- [ ] `SYSTEM_ALERT_WINDOW` removed from production (default behavior)
- [ ] Target API level meets Google Play requirements

## iOS (App Store)

### Signing & Certificates
- [ ] Valid Apple Developer Program membership
- [ ] Distribution certificate active and not expired
- [ ] Provisioning profile matches Bundle Identifier
- [ ] Bundle Identifier matches Apple Developer Dashboard exactly
- [ ] Automatic or manual signing configured in Xcode

### Build
- [ ] Release scheme configured in Xcode
- [ ] SKIP_BUNDLING set only for Debug configuration
- [ ] Archive created with device set to "Any iOS Device (arm64)"
- [ ] Build uploaded to App Store Connect
- [ ] Build processed successfully (check for processing errors)

### App Store Connect
- [ ] App name, subtitle, description complete
- [ ] Keywords optimized (100 character limit)
- [ ] Screenshots for required device sizes (show app in use, not splash)
- [ ] App previews (optional but recommended)
- [ ] App icon meets specifications (1024x1024, no alpha)
- [ ] Age rating questionnaire completed honestly
- [ ] Privacy policy URL set
- [ ] App privacy details (nutrition labels) completed
- [ ] Support URL provided
- [ ] Contact information up to date

### Apple-Specific Compliance
- [ ] Sign in with Apple implemented (if using third-party social login)
- [ ] Account deletion offered (if account creation supported)
- [ ] In-app purchases use Apple IAP (for digital content)
- [ ] No references to other mobile platforms in app or metadata
- [ ] No hidden or undocumented features
- [ ] Demo account provided in App Review notes (if login required)
- [ ] Non-obvious features explained in App Review notes
- [ ] App works on IPv6-only networks
- [ ] User-generated content has filtering, reporting, and blocking
- [ ] ATT prompt shown before tracking (if applicable)

### TestFlight
- [ ] Internal testing completed
- [ ] External beta testing completed (if applicable)
- [ ] Beta feedback addressed

## Post-Submission

- [ ] Monitor review status in App Store Connect / Play Console
- [ ] Respond promptly to any review team questions
- [ ] If rejected, read rejection reason carefully and address specific guideline
- [ ] Plan phased rollout if available (Google Play staged rollout, App Store phased release)
