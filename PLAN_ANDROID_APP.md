# ২ndBrain Android Native App — প্ল্যান (Bangla)

> **ভিত্তি:** WebView wrapper (মূল সাইট দ্রুত চলবে) + আলাদা native layer
> (app usage / screen time tracking যা WebView একা পারে না)।
> **SDK:** Kotlin + WebView (Android Studio) · টার্গেট: minSdk 26 / targetSdk 34
> **মূল সাইট:** `second-brain-64aa3` Firebase Hosting URL

---

## ০. চাহিদা এক নজরে (আপনার উত্তর থেকে)

| # | চাহিদা | কোথায় হবে |
|---|---|---|
| 1 | WebView দিয়ে main site — দ্রুত, লেগ-ফ্রি, native feel | অ্যান্ড্রয়েড অ্যাপ (Kotlin) |
| 2 | Blank UI না দেখাবে — কখনো দুইবার loading হবে না | WebView cache + skeleton + prewarm |
| 3 | Main site এ auto-update — বারবার app update না দিয়ে | নতুন কোড সবসময় server থেকে |
| 4 | Real-time screen time: কোন app কতক্ষণ চলছে | `UsageStatsManager` (native) |
| 5 | ২৪/৭ live: বর্তমানে কোন app ইউজ হচ্ছে | অ্যাপ থেকে heartbeat → Firestore |
| 6 | Admin panel-এ live দেখা যাবে কে কোন app চালাচ্ছে | নতুন admin tab |
| 7 | ইউজার প্যানেলে নিজের usage history + কার কোন app চলছে | নতুন section |
| 8 | Leaderboard: অন্য app-এ **সবচেয়ে কম** স্ক্রিনটাইম = শীর্ষ | বিদ্যমান leaderboard-এ নতুন metric |
| 9 | অ্যাপটা নিজের (২ndBrain) টাইম গণনায় ধরা হবে না | whitelist `com.secondbrain.app` |

**শর্ত:** এই সব feature নিতে হলে ইউজারকে **Usage Access** পারমিশন দিতে হবে
(Android Settings → Usage access) — এটা বাধ্যতামূলক, কেউ bypass করতে পারে না।

---

## ১. Architecture (দুই layer)

```
┌─────────────────────────────────────────────────┐
│            ২ndBrain Android App (Kotlin)         │
│                                                  │
│  ┌──────────────────────┐  ┌──────────────────┐  │
│  │   MAIN UI            │  │  NATIVE LAYER    │  │
│  │  WebView             │  │  - UsageTracker  │  │
│  │  (সব UI/feature)     │  │  - HeartbeatSvc  │  │
│  │  └ JS Bridge         │←─│  - WorkManager   │  │
│  └──────────┬───────────┘  └────────┬─────────┘  │
└─────────────┼───────────────────────┼────────────┘
              ↓                       ↓
   Firebase Hosting (main site)   Firestore
   ┌────────────────────┐    users/{uid}/usage_stats
   │ index.html + PWA   │    users/{uid}/live_usage
   │ auto-update ↑      │    (admin + leaderboard reads)
   └────────────────────┘
```

- **UI-এর ৯৯% WebView-এ থাকবে** (কোড আলাদা করা লাগবে না)
- **Native শুধু** permission, usage stats, background heartbeat নামে
- WebView↔Native bridge: `@JavascriptInterface`

---

## ২. WebView (smooth + fast + no blank)

### ২.১ কখনো blank না দেখানো
1. **Preloaded WebView**: splash/activity-তেই background-এ WebView বানানো +
   প্রথম page ইতিমধ্যে render — user tap করলে সঙ্গে সঙ্গে UI
2. **Skeleton overlay**: সাদা/ডার্ক skeleton card দেখানো, HTML আসলে fade-out
   (৩০০ms) — কখনো সাদা স্ক্রিন না
3. **Cache-first (সবসময় দ্রুত paint)**: `loadUrl` না — আগে থেকে cache থেকে
   `WebViewClient.shouldInterceptRequest` দিয়ে serve করা; network থেকে
   background refresh (app খুলেই নতুন ভার্সন আসবে)
4. **Pull-to-refresh** চালু, কিন্তু auto-refresh নেই (ব্যাটারি + smoothness)

### ২.২ Auto-update ব্যবস্থা (মূল চাহিদা)
- অ্যাপের WebView শুধু **shell** — পুরো app সবসময় server থেকে আসে
- Server-এ নতুন deploy করলেই পরবর্তী app-open-এ নতুন UI (cache+background refresh)
- **APK update দরকার নেই** শুধু permission/usage-tracking feature বদলালে
- Version check: অ্যাপ খুলতেই একটা `version.json` check → মিললে cache
  invalidate → নতুন shell pull (১০-২০ms)

### ২.৩ Performance (কোনো lag নয়)
```kotlin
settings.apply {
  javaScriptEnabled = true
  domStorageEnabled = true
  databaseEnabled = true
  cacheMode = LOAD_DEFAULT          // প্রথমে cache, সঙ্গে background revalidate
  setRenderPriority(WebSettings.RenderPriority.HIGH)
  setSupportZoom(false)
  mediaPlaybackRequiresUserGesture = false  // (যদি লাগে)
}
webView.settings.setSupportMultipleWindows(false)
// Hardware accel + smooth scroll
webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
// Back button = WebView history (SPA-এও কাজ করবে)
```
- **HTTP cache headers**: `Cache-Control: max-age=...` (firebase.json-এ already no-cache
  শুধু html-এ; বাকি asset immutable করা ভালো)
- Service worker অ্যাপেই আছে — WebView তা support করে, তাই offline-এও চলবে

### ২.৪ Native feel
- Back button → `webView.goBack()`, না থাকলে minimize
- Splash: brand logo (≤800ms বা first paint হলেই hide)
- Status bar color = app theme (`windowInsetsController`)
- Swipe from edge → pull-to-refresh
- File chooser / camera upload → `WebChromeClient.onShowFileChooser`
  (index.html-এর upload এখানেই কাজ করবে)
- Download links → `DownloadManager`
- External links (YouTube, payment) → Custom Tab / browser open
- `console.log` dev-এ logcat-এ পাঠানো (debug সহজ)

---

## ৩. Screen Time / App Usage (native feature)

### ৩.১ পারমিশন ফ্লো
1. অ্যাপ প্রথমবার খুললেই **onboarding screen**: "আপনার screen time track করতে
   Usage Access লাগবে" + কেন লাগবে ব্যাখ্যা (leaderboard + নিজের অভ্যাস)
2. বাটন → Android Settings `ACTION_USAGE_ACCESS_SETTINGS`
3. ফিরে এসে check: `UsageStatsManager.queryUsageStats` data আসছে কিনা
4. **দেই না চাইলে** চলবে শুধু WebView app (tracking feature off) — জোর নেই
5. Admin panel-এ দেখানো যাবে কার permission আছে/নেই

### ৩.২ কী কী track হবে
| ডেটা | সোর্স | ফ্রিকোয়েন্সি |
|---|---|---|
| বর্তমান foreground app | `UsageEvents` (EVENT_MOVE_TO_FOREGROUND) | প্রতি ১৫-৩০ সেকেন্ড পোল + event-driven |
| প্রতি app-এ আজকের মোট টাইম | `queryUsageStats(TIME_TODAY)` | প্রতি ৫ মিনিট aggregate |
| মোট স্ক্রিনটাইম (আমাদের অ্যাপ বাদ) | উপরের দুইটা থেকে গণনা | aggregate সঙ্গে |
| ঘুম/idle (screen off) | `queryEvents` SCREEN_NON_INTERACTIVE | aggregate |

**Whitelist:** `com.secondbrain.app` (আমাদের অ্যাপ) leaderboard ও মোট টাইমে
**বাদ** দেওয়া হবে — এটাই আপনার শর্ত ("আমদের আপ বাদে")।

### ৩.৩ Data model (Firestore)

```
users/{uid}/usage_stats/{YYYY-MM-DD}
  {
    day: "2026-09-22",
    totalMs: 14520000,          // সব app মিলে (আমাদের অ্যাপ বাদ)
    byApp: {
      "com.instagram.android": 3120000,
      "com.facebook.katana": 1800000,
      ...
    },
    updatedAt: serverTimestamp
  }

users/{uid}/live_usage/current        // একটাই doc (heartbeat overwrite)
  {
    uid, appName, package,
    sinceMs,                         // কখন থেকে চলছে
    heartbeatAt: serverTimestamp,     // সর্বশেষ ping
    permsGranted: true
  }

users/{uid}/history_events/{auto}     // (ঐচ্ছিক) app-switch event log
  { from, to, at }                    // admin drill-down হলে
```

- **সর্বশেষ app খুঁজতে** `users/{uid}/live_usage/current` একটাই read — cheap
- **Daily aggregate** ১টা doc — leaderboard query-friendly
- Rate limit: প্রতি app-এর জন্য ≥৫ মিনিট না গেলে update করবে না (write storm আটকাতে)

### ৩.৪ Background worker (২৪/৭ live)
- `WorkManager` periodic work (১৫ মিনিট — Android minimum) **+**
  foreground service যদি সর্বশেষ app real-time লাগে (৩০ সেকেন্ড heartbeat)
- Battery: শুধু `UsageEvents` পড়া + একটা Firestore write — হালকা
- Doze mode: `setExact` নয়, flex window ১৫-৩০ মিনিট
- **Doze-তে থাকলে** heartbeat বন্ধ হতে পারে → `heartbeatAt` stale দেখালে
  admin "idle/unknown" দেখাবে (ঠিক করে দেখানো, ভুল নয়)

### ৩.৫ Privacy (গুরুত্বপূর্ণ)
- Usage data শুধু **নিজের ডিভাইসের** — অন্যের private app টাইম
  আলাদা করে দেখানো হবে না (whitelist + permission gate)
- Onboarding-এ consent: "আপনার নিজের app usage শুধু আপনার profile ও leaderboard-এ যাবে"
- Leaderboard-এ শুধু **মোট সময় (আমাদের অ্যাপ বাদ)** — কোন কোন app তা আলাদা দেখানো হবে না
- যে ইউজার permission দেয় না তার ডেটা নেই — leaderboard-এ তাকে "no data" দেখানো

---

## ৪. Admin Panel — Live App View

### ৪.১ নতুন admin tab: "Live Usage"
- **সব অ্যাকটিভ ইউজারের টেবিল**: নাম | বর্তমান app (icon+package) | since | heartbeat age
- **Auto-refresh ৩০ সেকেন্ডে** (onSnapshot or poll)
- Stale heartbeat >৫ মিনিট → ধূসর "idle"
- Filter: class level, plan type, search
- Drill-down: ক্লিক → সেই ইউজারের আজকের `byApp` bar chart

### ৪.২ Aggregates (admin dashboard-এ)
- দৈনিক গড় স্ক্রিনটাইম (আমাদের অ্যাপ বাদ)
- Top distracting apps (সব ইউজার মিলে)
- অ্যাপ কতজন ইউজ করছে (retention signal)

**Implementation:** `admin/admin.html` + `admin/js/admin.js`-তে নতুন
`sec-live-usage` section (একই pattern: query → render → ৩০s interval)

---

## ৫. User Panel — নিজের ও অন্যের view

### ৫.১ নতুন section: "My Screen Time"
- আজকের মোট টাইম (মূল অ্যাপ বাদ) + গত ৭ দিনের bar chart
- Per-app breakdown (শুধু নিজের ডেটা)
- Trend: গতকালের চেয়ে বেশি/কম
- অনুমতি না থাকলে onboarding CTA

### ৫.২ Leaderboard — "Least Screen Time"
- বিদ্যমান leaderboard ট্যাবে **নতুন metric**: "স্ক্রিনটাইম (আমাদের অ্যাপ বাদ)"
- র‍্যাঙ্ক: **কম সময় = শীর্ষ** (আপনার শর্ত অনুযায়ী)
- শুধু যাদের tracking permission আছে তাদেরই র‍্যাঙ্ক
- নিজের position highlight
- Daily reset (মিডনাইট BST)

### ৫.৩ "কে কোন app চালাচ্ছে" (আপনার শর্ত: পরজন দেখতে পারবে)
> ⚠️ **এখানে একটা সীমা আছে** — অন্যের ডিভাইসে কোন app চলছে তা **real-time**
> জানার একমাত্র উপায় সেই অ্যাপ থেকে কোনো না কোনো heartbeat — তাই যা সম্ভব:
- **Live list**: সব friends-এর `live_usage/current` দেখা (৩০-৬০ সেকেন্ড delay)
- **একই class/group filter** করে "এখন কে online + কোন app" দেখা
- Privacy: শুধু **consent দেওয়া ইউজার** দেখাবে; অনুমতি না দিলে "hidden"
- UI: একটা "Activity" panel — নাম + app icon + "২ মিনিট আগে"

---

## ৬. Implementation Phases

### Phase 1 — WebView shell (সপ্তাহ ১)
- [ ] Android Studio project (`android/`) + Kotlin
- [ ] MainActivity: WebView + settings (fast/cache) + back handling
- [ ] Splash → prewarm WebView → skeleton overlay (no blank)
- [ ] file chooser + download + external link handling
- [ ] version.json check → cache invalidate (auto-update)
- [ ] Firebase Hosting URL config + release keystore
- [ ] **Gate:** cold start <১.৫s, scroll ৬০fps, কখনো blank screen নেই

### Phase 2 — Usage tracking (সপ্তাহ ২)
- [ ] Usage Access onboarding + permission check
- [ ] `UsageTracker`: poll foreground app (৩০s) + daily aggregate (৫ মিনিট)
- [ ] Firestore writes: `usage_stats/{day}` + `live_usage/current`
- [ ] WorkManager background sync + battery test
- [ ] **Gate:** ফোন বন্ধ/চালু রেখে ১ দিন test → ডেটা accurate

### Phase 3 — Panels (সপ্তাহ ৩)
- [ ] User: "My Screen Time" section + ৭ দিন chart
- [ ] Leaderboard: least screen time metric (আমাদের অ্যাপ বাদ)
- [ ] Activity/friend live view (consent-gated)
- [ ] Admin: "Live Usage" tab + drill-down
- [ ] **Gate:** admin-এ live app দেখা যায়, leaderboard-এ rank ঠিক

### Phase 4 — Polish + Release (সপ্তাহ ৪)
- [ ] Privacy consent text + settings toggle (tracking off/on)
- [ ] Edge cases: permission revoked, stale heartbeat, no data
- [ ] Play Store: privacy policy URL, usage-access declaration
- [ ] Internal test → closed testing → production
- [ ] **Gate:** Play review pass, battery drain <৩%/ঘণ্টা

---

## ৭. ফাইল structure (নতুন)

```
android/                          ← git-এ নতুন folder
├── settings.gradle.kts
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml   (permissions + service)
│       ├── java/com/secondbrain/app/
│       │   ├── MainActivity.kt        # WebView + bridge
│       │   ├── SplashActivity.kt
│       │   ├── bridge/WebAppBridge.kt # @JavascriptInterface
│       │   ├── usage/UsageTracker.kt  # UsageStats polling
│       │   ├── usage/UsageWorker.kt   # WorkManager
│       │   └── usage/PermissionFlow.kt
│       └── res/ (splash, icons, skeleton)
PLAN_ANDROID_APP.md             ← এই ফাইল
```

মূল সাইটের JS-এ (ঐচ্ছিক bridge helper):
```js
// js/native-bridge.js — শুধু অ্যান্ড্রয়েড WebView-তে active
window.Native?.getUid?.() ?? null
```
Firebase Auth token WebView-এ নিজে থেকেই কাজ করবে (same origin) —
backend-init অপরিবর্তিত থাকবে।

---

## ৮. Play Store নীতিমালা — যা লক্ষ্য রাখতে হবে

| বিষয় | সমাধান |
|---|---|
| Usage access declare করতে হবে | Data safety form-এ "app activity" + privacy policy-তে ব্যাখ্যা |
| Privacy policy | নতুন পেজ `/privacy` — "শুধু নিজের ডিভাইসের usage, leaderboard-এ শুধু মোট সময়" |
| Family/education declare | শিক্ষামূলক অ্যাপ — policy compliant |
| Background service | Foreground service notification দিখাতে হবে (Android 14+) |
| WebView policy | শুধু own content — allowed |

---

## ৯. Risks + বাস্তবতা

1. **Usage Access deny করলে** feature off — অ্যাপ তবু চলবে (graceful)
2. **Real-time ১০০% নয়** — heartbeat delay ১৫-৬০ সেকেন্ড; "near-live" বলা ঠিক
3. **Battery**: aggressive polling কম রাখা — ৩০s foreground + ৫m aggregate
4. **Leaderboard fairness**: permission না দেওয়া ইউজার র‍্যাঙ্কে নেই (ভুল নয়)
5. **iOS**: Usage access iOS-এ নেই — এই feature শুধু Android
6. **Cheating**: অ্যাপ বন্ধ রাখলে heartbeat থামবে → stale = honest signal

---

## ১০. সারাংশ

| Layer | কী করবে | Tech |
|---|---|---|
| WebView shell | দ্রুত, smooth, no-blank, auto-update | Kotlin + WebView + cache |
| Usage native | screen time + live app + heartbeat | UsageStatsManager + WorkManager |
| Server | daily stats + live presence | Firestore (২টা path) |
| User UI | my time + leaderboard + activity | মূল সাইটে নতুন sections (auto-deploy) |
| Admin UI | live user apps + aggregates | admin panel tab |

**মূল সুবিধা:** সব UI feature মূল সাইটে থাকায় নতুন feature বানালেই
**app update ছাড়াই** সব ইউজারে পৌঁছে যাবে — ঠিক যেমন আপনি চেয়েছেন।
