# iOS App Store Publishing (React Native)

Publishing React Native apps to the App Store follows the same process as native iOS apps with a few extra considerations.

**Expo users**: Refer to [Expo Deploying to App Stores](https://docs.expo.dev/distribution/app-stores/) for automated distribution.

## Step 1: Configure Release Scheme

Release builds:
- Disable the in-app Dev Menu (prevents user access in production)
- Bundle JavaScript locally (app works without computer connection)

**In Xcode:**
1. **Product > Scheme > Edit Scheme**
2. Select **Run** tab
3. Set Build Configuration to **Release**

### Skip Bundling in Debug Builds

Add to Xcode Build Phase script (`Bundle React Native code and images`):
```shell
if [ "${CONFIGURATION}" == "Debug" ]; then
  export SKIP_BUNDLING=true
fi
```

## Step 2: Build for Release

### Using Xcode
1. **Cmd+B** or **Product > Build**
2. Once built, distribute to beta testers or submit to App Store

### Using CLI
```shell
npx react-native run-ios --mode=Release
```

## Step 3: Archive and Submit

1. Open the `.xcworkspace` file in Xcode
2. Set device to **Any iOS Device (arm64)**
3. **Product > Archive**
4. **Verify Bundle Identifier** matches Apple Developer Dashboard Identifiers exactly
5. In Archive window: **Distribute App**
6. Select **App Store Connect**
7. Click **Upload** — ensure all checkboxes selected, then **Next**
8. Choose signing method:
   - **Automatically manage signing** (recommended)
   - **Manually manage signing**
9. Click **Upload**
10. Find your build in **App Store Connect** under **TestFlight**

## Step 4: Submit for Review

1. In App Store Connect, fill in required metadata
2. In the Build Section, select your uploaded build
3. **Save > Submit For Review**

## Screenshots

Required for App Store listing.

- Must show the app in use (not splash screens, login pages, or title art)
- Reference [Apple's Screenshot Specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/) for device sizes
- Some display sizes share screenshots — not all sizes required individually

## Common Issues

| Issue | Fix |
|-------|-----|
| Archive greyed out | Set device to "Any iOS Device (arm64)", not a simulator |
| Bundle ID mismatch | Match exactly with Apple Developer Dashboard Identifiers |
| Signing errors | Check provisioning profiles in Apple Developer portal |
| Build not appearing in TestFlight | Wait a few minutes; check for processing errors in App Store Connect |
| JS bundle missing | Ensure SKIP_BUNDLING is only set for Debug configuration |

## TestFlight

- Upload builds to TestFlight for beta testing before App Store submission
- Internal testers (up to 100): no review needed
- External testers (up to 10,000): requires brief Beta App Review
- TestFlight builds expire after 90 days

## Certificates and Provisioning

- **Development certificate**: For running on devices during development
- **Distribution certificate**: Required for App Store and TestFlight
- **Provisioning profiles**: Link certificates to app IDs and devices
- Use **Automatic signing** in Xcode when possible
- Certificates expire annually — renew before expiration
