# Apple App Store Review Guidelines

Complete reference for Apple's App Store review rules. Apps must comply to be accepted.

## Before Submitting

- Test for crashes and bugs
- Complete all metadata
- Update contact information
- Provide full access to App Review (demo accounts, backend services live)
- Explain non-obvious features in App Review notes

## 1. Safety

### 1.1 Objectionable Content
No defamatory, discriminatory, violent, sexual, or misleading content. No false information or trick functionality.

### 1.2 User-Generated Content
Apps with UGC must include:
- Content filtering mechanism
- Reporting mechanism with timely responses
- User blocking capability
- Published contact information

Creator apps must provide age restriction mechanisms.

### 1.3 Kids Category
- No links out of app (except behind parental gate)
- No purchasing opportunities outside parental gate
- No third-party advertising
- No collecting personally identifiable information from children

### 1.4 Physical Harm
- Medical apps must disclose data and methodology
- No apps claiming x-ray, BP, temperature, glucose, or SpO2 via sensors alone
- Drug dosage calculators require manufacturer/FDA approval
- No encouraging tobacco, drugs, or excessive alcohol

### 1.6 Data Security
Implement appropriate security for user data handling. Prevent unauthorized access.

## 2. Performance

### 2.1 App Completeness
- Final version, fully functional, all metadata present
- Include demo account if login required
- In-app purchases must be complete and visible to reviewer

### 2.2 Beta Testing
Use TestFlight, not the App Store. No compensation for testers.

### 2.3 Accurate Metadata
- No hidden or undocumented features
- Screenshots must show app in use (not splash screens)
- App names limited to 30 characters
- Metadata must be appropriate for all audiences (4+ rating)
- Clearly describe changes in "What's New"

### 2.4 Hardware Compatibility
- iPhone apps should run on iPad when possible
- Use power efficiently — no crypto mining or unnecessary background processes
- Never suggest device restart or system setting changes

### 2.5 Software Requirements
- Use only public APIs; run on current OS
- Apps must be self-contained — no downloading/executing external code
- Must work on IPv6-only networks
- Web browsing must use WebKit
- Must get explicit consent before recording/logging user activity

## 3. Business

### 3.1 Payments

**In-App Purchase required** for unlocking features, subscriptions, in-game currency, premium content.

Exceptions:
- **Reader apps**: Access previously purchased content (magazines, books, music, video)
- **Multiplatform services**: Access content acquired on other platforms
- **Physical goods/services**: Must use alternative payment (Apple Pay, etc.)
- **Person-to-person services**: Real-time services may use alternative payments
- **Free standalone companion apps**

**Subscriptions**:
- Must provide ongoing value
- Minimum 7-day period
- Must work across all user devices
- Clearly describe what users get before subscribing
- Seamless upgrades/downgrades
- Loot boxes must disclose odds

**Cryptocurrencies**: Wallets allowed (organization enrollees), no on-device mining, exchanges on approved platforms only.

### 3.2 Other Business Rules
- No App Store-like interfaces for third-party apps
- No artificial ad impression/click inflation
- Loan apps must disclose terms, cap APR at 36%
- Cannot force ratings/reviews for functionality access

## 4. Design

### 4.1 Copycats
Don't copy popular apps. No impersonation. Don't use another developer's icon/brand without permission.

### 4.2 Minimum Functionality
- Must be more than a repackaged website
- Must work standalone (no requiring other apps)
- Commercialized template apps rejected unless from content provider

### 4.3 Spam
No duplicate Bundle IDs. Don't saturate categories.

### 4.7 Mini Apps, Games, Chatbots, Emulators
Allowed but must follow all guidelines including privacy, content filtering, and payment rules.

### 4.8 Login Services (Sign in with Apple)
**Required** when offering third-party social login (Facebook, Google, Twitter, etc.).

Exceptions: company-only account systems, education/enterprise apps, government ID systems.

### 4.9 Apple Pay
Disclose all purchase info before sale. For recurring payments: disclose term, charges, cancellation.

## 5. Legal

### 5.1 Privacy

**5.1.1 Data Collection:**
- Privacy policy required (in App Store Connect and within app)
- Must clearly identify what data is collected and how it's used
- Request only data relevant to core functionality
- If supporting account creation, must offer account deletion
- Don't require login unless app has significant account-based features
- Don't compile personal info from sources other than the user

**5.1.2 Data Use:**
- Don't repurpose data without consent
- Don't build user profiles from collected data
- Don't use Contacts/Photos APIs to build databases
- HealthKit, HomeKit, ClassKit data: no marketing/advertising use
- Use App Tracking Transparency for user tracking

**5.1.4 Kids:**
- Review COPPA, GDPR for children's data
- Kids Category apps must include privacy policy

**5.1.5 Location:**
Only use when directly relevant. Obtain consent. Explain purpose.

### 5.2 Intellectual Property
Don't use protected material without permission. Respect third-party Terms of Use.

### 5.3 Gambling
Real money gaming requires licensing, geo-restriction, and free app. No in-app purchase for gambling.

### 5.4 VPN Apps
Must use NEVPNManager API. Organization-enrolled developers only. Must declare data collection.

### 5.5 MDM
Must be offered by commercial enterprises, educational institutions, or government agencies.
