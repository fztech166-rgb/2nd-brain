# Dridhota AI (দৃঢ়তা) — Flutter Mobile App PRD
### Product Requirements Document — Vibe Coding + Build + Debug + APK Deploy Guide

| | |
|---|---|
| **Product** | Dridhota AI — Your AI Guardian for Focus, Performance & Protection |
| **Company** | NFZ (NexDiv) |
| **Platform** | Android (Flutter) + Web (existing Vanilla JS PWA, shared Firebase backend) |
| **Target users** | Bangladeshi SSC/HSC students (Class 9–12), many are minors (13–18) |
| **Beta launch target** | September 1, 2026 (Class XI admission cycle) |
| **Firebase project** | `second-brain-64aa3` (shared between Web + App) |
| **Document version** | v1.0 — draft for AI-assisted ("vibe coding") build |

> এই ডকুমেন্ট AI কোডিং এজেন্ট (Claude Code / Cursor / Trae) কে দিয়ে স্ক্রিন-বাই-স্ক্রিন প্রম্পট বানানোর বেস। প্রতিটা বড় ফিচার সেকশন-এ ভাঙা আছে যাতে আলাদা করে প্রম্পট করা যায়।

---

## ১. Executive Summary

Dridhota AI (আগে "Second Brain v3") একটা বাংলাদেশি SSC/HSC ছাত্র-ছাত্রীদের জন্য AI স্টাডি প্ল্যাটফর্ম, যেটা এখন ওয়েব (PWA) থেকে একটা native Android app-এ রিবিল্ড হচ্ছে Flutter দিয়ে। বর্তমান ওয়েব অ্যাপে নোটস, সিলেবাস+AI, গেমিফিকেশন, সোশ্যাল ফিচার আছে (বিস্তারিত §৫)। নতুন Flutter অ্যাপে তিনটা বড় সংযোজন হচ্ছে:

1. **রিয়েল-টাইম স্ক্রিন-টাইম ট্র্যাকিং + "কম ব্যবহার = বেশি র‍্যাঙ্ক"** লিডারবোর্ড।
2. **স্মার্ট অ্যালার্ম** — গণিত/পাজল সল্ভ না করলে বন্ধ হবে না, ম্যাক্স ২ বার স্নুজ।
3. **ফোকাস মোড + অ্যাপ ব্লকিং** — সোশ্যাল মিডিয়া অটো-ব্লক, রিওয়ার্ড দিয়ে আনলক, দৈনিক ৫টা ইমার্জেন্সি এক্সেস।

দুটো ক্লায়েন্ট (Web + App) একই Firebase backend এবং **একটাই Admin Panel** থেকে কন্ট্রোল হবে — প্ল্যান, কুইজ, ব্লক-লিস্ট লিমিট, নোটিফিকেশন সব জায়গা থেকেই।

---

## ২. Goals & Non-Goals

### ২.১ Goals
- বিদ্যমান Second Brain ওয়েব-অ্যাপের সব ফিচার (নোটস, সিলেবাস AI, গেমিফিকেশন, সোশ্যাল) Flutter-এ ১:১ প্যারিটি সহ আনা।
- ডিভাইস-লেভেল স্ক্রিন-টাইম + ফোকাস-মোড ফিচার যোগ করা যা শুধু **নেটিভ মোবাইল অ্যাপেই সম্ভব** (ওয়েব PWA-তে না)।
- ওয়েব ও অ্যাপ — দুই ক্লায়েন্টের ডিজাইন-ভাষা একই রাখা (§৩-এর টোকেন ব্যবহার করে)।
- Google Play নীতিমালা মেনে APK/AAB বানানো ও পাবলিশযোগ্য করা।
- কমান্ড-লাইন-নির্ভর ডেভ ওয়ার্কফ্লো (দুর্বল কনফিগ কম্পিউটারের জন্য) — Android Studio GUI ছাড়াই।

### ২.২ Non-Goals (এই ভার্সনে না)
- iOS বিল্ড (পরে আলাদা ফেজ)।
- অন্য মানুষের ডিভাইস দূর থেকে মনিটর করা (parental remote control) — **এই অ্যাপ শুধু নিজের ডিভাইসের নিজের ব্যবহার ট্র্যাক করে, self-accountability টুল, surveillance টুল না।**
- পেমেন্ট গেটওয়ে (bKash/Nagad API) সরাসরি ইন্টিগ্রেশন — আপাতত ম্যানুয়াল trxId ফর্মই থাকবে (Web-এর মতো)।

---

## ৩. Design System (Web থেকে সরাসরি ইনহেরিট)

Flutter অ্যাপ **হুবহু একই টোকেন** ব্যবহার করবে যা ওয়েবের `css/*.css`-এ আছে, যাতে ব্র্যান্ড কনসিসটেন্ট থাকে। `theme/app_theme.dart`-এ এভাবে ম্যাপ করুন:

### ৩.১ কালার টোকেন → Flutter `ThemeData`

| Token | Light | Dark | Flutter var |
|---|---|---|---|
| bg | `#faf8ff` | `#2d303d` | `colorScheme.background` |
| surface | `#FFFFFF` | `#2d303d` | `colorScheme.surface` |
| surface2 | `#ebedfe` | `#383c4a` | custom `surfaceVariant2` |
| border | `#c2c6d5` | `#424753` | `colorScheme.outline` |
| accent (primary) | `#0059ba` | `#acc7ff` | `colorScheme.primary` |
| accent2 | `#00696b` | `#4bdadc` | `colorScheme.secondary` |
| accent3 | `#2c72d9` | `#6df7f8` | `colorScheme.tertiary` |
| warn | `#D97706` | `#FBBF24` | custom |
| danger | `#DC2626` | `#F87171` | `colorScheme.error` |
| text/text2/text3 | `#181b27`/`#424753`/`#727784` | `#eff0ff`/`#c2c6d5`/`#727784` | text theme levels |

**Brand gradient** (`--brand-grad`): `LinearGradient(colors:[Color(0xFF0059BA), Color(0xFF00696B)], begin: Alignment.topLeft, end: Alignment.bottomRight)` — লোগো, hero, AI বাটনে ব্যবহার করুন।

৮টা appearance template (calm/ocean/forest/rose/sunrise/graphite/mono/midnight) একটা `AppearanceTemplate` enum + `ColorScheme` factory হিসেবে পোর্ট করুন যাতে ইউজার Settings থেকে বদলাতে পারে (Web-এর প্যারিটি)।

### ৩.২ টাইপোগ্রাফি
- Font: Google Fonts প্যাকেজ দিয়ে `Plus Jakarta Sans` (lat) + `Noto Sans Bengali` (বাংলা টেক্সটের জন্য) fallback চেইন।
- Weight: body 500 · nav/label 600 · title/button 700 · logo 800।
- বাংলা সংখ্যা রেন্ডারের জন্য `Noto Sans Bengali`-তে locale-aware number formatting (`intl` প্যাকেজ, `bn_BD` locale)।

### ৩.৩ Radius / Spacing / Motion
- Card radius: `16.0` (soft `14`, crisp `8`) — `BorderRadius.circular` টোকেনাইজ করুন `AppRadius.card`।
- Control radius: `10.0`।
- Density multiplier টোকেন রাখুন (compact `.82` / normal `1` / spacious `1.16`) — padding calc-এ গুণ করুন।
- Motion durations: fast `120ms` · base `200ms` · slow `320ms`; curves: standard `Curves.easeInOutCubic`-সদৃশ কাস্টম cubic-bezier(.4,0,.2,1)।
- **Reduced motion:** system accessibility "disable animations" flag চেক করে সব animation duration 0-তে নামিয়ে দিন (`MediaQuery.disableAnimations`)।

### ৩.৪ কম্পোনেন্ট প্যারিটি চেকলিস্ট
বাটন (pill radius 999px, primary/secondary/ghost/success/danger/ai/warn variants), কার্ড, ইনপুট (focus ring = primary at 12% opacity), মডাল (max-width 560/760, radius card token), টোস্ট (top-right, 340px max, left-border 3px status color), toggle (44×24, knob 18), progress bar (h6, radius6), avatar sizes (26/30/32/34/36/42/44/46/88/92px অনুযায়ী কনটেক্সট), আইকন স্কেল (sm14/base18/lg22/xl28) — সব বিস্তারিত রেফারেন্স ফাইল **"Second Brain — Frontend Design System"** (attached spec) থেকে সরাসরি কপি করুন; Flutter widget lib বানানোর সময় প্রতিটা টেবিল-রো একটা reusable widget/constant হবে।

---

## ৪. High-Level Architecture

```
┌─────────────────────────┐        ┌──────────────────────────┐
│   Flutter App (Android) │        │  Existing Web PWA (JS)   │
│   - UI (Riverpod/Bloc)  │        │  - Vanilla JS modules    │
│   - Local: Hive/Sembast │        │  - localStorage cache    │
│   - Native: UsageStats, │        └──────────────┬───────────┘
│     AlarmManager, FGS   │                       │
└────────────┬─────────────┘                       │
             │            both clients             │
             └───────────────┬───────────────────────┘
                              ▼
                 ┌─────────────────────────┐
                 │   Firebase (shared)     │
                 │  Auth · Firestore · FCM │
                 │  Cloud Functions        │
                 └────────────┬─────────────┘
                              ▼
                 ┌─────────────────────────┐
                 │ Cloudflare Worker Proxy │
                 │  (Gemini AI gateway,    │
                 │   key never client-side)│
                 └─────────────────────────┘
                              ▼
                         Google Gemini API
```

**Single source of truth:** Firestore rules + Cloud Functions (§৭-এর নিরাপত্তা নিয়ম Web-এর মতোই অ্যাপেও বাধ্যতামূলক — client কখনো `plan/credits/aiPlan/isAdmin` লিখতে পারবে না)।

**Admin Panel:** বর্তমান Web Admin Panel-ই primary — নতুন নিচের সেকশন যোগ হবে যাতে অ্যাপ-স্পেসিফিক ফিচার (স্ক্রিন-টাইম লিডারবোর্ড কনফিগ, ব্লক-লিস্ট ডিফল্ট, ইমার্জেন্সি-এক্সেস লিমিট, অ্যালার্ম পাজল ডিফিকাল্টি) এক জায়গা থেকে কন্ট্রোল হয় — আলাদা কোনো নতুন অ্যাডমিন অ্যাপ বানানো লাগবে না।

---

## ৫. Feature Set A — Existing Second Brain Features (Flutter Parity)

সংক্ষেপে (বিস্তারিত §-ওয়াইজ ইউজার-ফ্লো ডকুমেন্ট থেকেই নেওয়া, প্রতিটাকে আলাদা Flutter স্ক্রিন + provider হিসেবে ধরুন):

| মডিউল | মূল স্ক্রিন | ব্যাকএন্ড |
|---|---|---|
| Auth | Login/Register/Verify/Forgot | Firebase Auth + `seedUserProfile` CF trigger |
| Dashboard | Home (streak, XP, target, previews) | Firestore streams |
| Notes | List/Add/Edit/Viewer/Revision/Shared | `notes/{id}`, spaced-repetition scheduler |
| Syllabus+AI | Class→Subject→Chapter→AI Qs | Worker proxy → Gemini, quota check |
| Practice Center | MCQ/CQ/Board sets + Answer Check | AI grading, quota-metered |
| Tasks/Target/Calendar | Task CRUD, daily target, month view | `tasks/{id}` |
| Focus Timer | Pomodoro + tab-blur watchdog | `study_tracker` log |
| Prayer Times | District/Upazila prayer schedule | calc API |
| YouTube Courses | Playlist→course converter | YouTube data |
| Mind Map | AI-generated tree, share | Gemini, `mind_maps/{id}` |
| Resources/Pinned Sites | Study material browser, shortcuts | `resources/{id}` |
| Leaderboard (study) | Daily/Weekly/Monthly, class/national | live snapshot listener |
| Streak/XP/Points/Seasons | gamification engine | `study_streak`, `system_settings` |
| School | Search/request/auto-join | `schools/{id}` |
| Class Community + DM | Group chat + 1:1 chat | `communities/{id}`, `dms/{threadId}` |
| Quiz Campaigns | Live-window MCQ campaigns | `quiz_attempts/{id}` |
| Question Bank/Class QB/Board PDFs | Filterable Q lists | `question_bank/`, `board_pdfs/` |
| Knowledge Duels | 1v1 timed match | `duels/{id}` |
| Revision/Target Race | Live-race progress | race collections |
| Study Buddy | Pairing + invite | `study_buddy/{id}` |
| Live Rooms | Group study room + live minute leaderboard | `live_rooms/{id}` |
| Streak Wars / School Wars | Team competition + anti-cheat flags | war collections |
| Offline Warrior | Buffered offline streak/points sync | local queue |
| Monetization | Packages, manual bKash/Nagad, referral | `payment_requests/{id}` |
| Settings | Profile/School/Language/Theme/AI key/Quota/Danger zone | `users/{uid}` (non-plan fields only) |
| Push Notifications | FCM token reg + rich payload | `push-notifications-enhanced` |
| Offline-first | Local cache + sync queue | Hive/Sembast + connectivity_plus |

> **Rule (Web parity):** কুইজের সঠিক উত্তর Flutter widget tree/state-এও কখনো আগেভাগে রাখা যাবে না — শুধু সার্ভার/in-memory, reveal শেষেই।

---

## ৬. Feature Set B — NEW: Screen Time Tracking + Usage Leaderboard

### ৬.১ ইউজার স্টোরি
> "আমি চাই আমার স্ক্রিন-টাইম রিয়েল-টাইমে ট্র্যাক হোক, ওয়েবসাইটেও দেখা যাক, আর যে যত কম ফোন ইউজ করবে তার র‍্যাঙ্ক তত বেশি হবে — যাতে কম ব্যবহার করতে মোটিভেশন পাই।"

### ৬.২ ফাংশনাল রিকোয়ারমেন্ট
1. **অন-ডিভাইস ট্র্যাকিং:** Android-এর `UsageStatsManager` API (permission: `PACKAGE_USAGE_STATS`, special "Usage Access" সেটিংসে ম্যানুয়াল গ্র্যান্ট) দিয়ে প্রতি অ্যাপের foreground সময় রিড করা। `usage_stats` (pub.dev) বা native `MethodChannel` দিয়ে wrap করুন।
2. **২৪-ঘণ্টা রোলিং উইন্ডো:** প্রতিদিন মধ্যরাতে রিসেট, কিন্তু "গত ২৪ ঘণ্টা" ভিউও দেখানো যাবে (dual view: "আজ" বনাম "রোলিং ২৪ঘ")।
3. **Foreground Service** (Android) — ব্যাকগ্রাউন্ডে প্রতি ৫-১৫ মিনিটে usage sync করবে (battery-friendly WorkManager periodic task হিসেবেও করা যায়, কিন্তু "রিয়েল-টাইম" claim-এর জন্য foreground service + `flutter_foreground_task` প্যাকেজ recommended)।
4. **Firestore sync:** `screen_time/{uid}/daily/{date}` ডকে অ্যাপ-ওয়াইজ ব্রেকডাউন + total minutes আপডেট হবে (batched writes, প্রতি 5-min-এ একবার, না যে প্রতি সেকেন্ডে — quota বাঁচাতে)।
5. **লিডারবোর্ড লজিক (ইনভার্স):** কম স্ক্রিন-টাইম = বেশি র‍্যাঙ্ক পয়েন্ট। ফর্মুলা: `usageScore = max(0, dailyTargetMinutes - actualMinutes)` — অথবা percentile-based (নিচের যে কম টাইম, তার rank বেশি)। এটা Cloud Function (`recomputeUsageLeaderboard`, স্কেজুলড প্রতি ঘণ্টায়) দিয়ে সার্ভার-সাইডে ক্যালকুলেট করুন যাতে client manipulation না হয়।
6. **Web-এ লাইভ দেখা:** যেহেতু ওয়েব PWA থেকে ডিভাইস usage রিড করা যায় না, ওয়েব ড্যাশবোর্ডে শুধু Firestore থেকে (`screen_time/{uid}/daily/{today}`) snapshot listener দিয়ে "live" আপডেট দেখাবে — অ্যাপ যখন sync করবে তখনই ওয়েবে রিফ্লেক্ট হবে।
7. **Anti-cheat:** usage data client-reported (Android API সীমাবদ্ধতা — root ছাড়া সার্ভার-ভেরিফাই সম্ভব না), তাই war/streak engine-এর মতো একই "spike/pattern flag" admin monitor যোগ করুন (§Admin)।

### ৬.৩ ডেটা মডেল
```
screen_time/{uid}/daily/{yyyy-mm-dd}
  totalMinutes: number
  byApp: { packageName: minutes }
  lastSyncAt: timestamp
  target: number         // ইউজারের সেট করা ডেইলি লক্ষ্য
  rankScore: number       // Cloud Function কর্তৃক কম্পিউটেড

leaderboard_usage/{scope}/{period}   // scope: class/school/national, period: daily/weekly
  entries: [{ uid, rankScore, totalMinutes }]
  computedAt: timestamp
```

### ৬.৪ প্রাইভেসি নোট (গুরুত্বপূর্ণ)
- শুধু **টোটাল মিনিট + ক্যাটাগরি** (social/productivity/entertainment) শেয়ার হবে, individual app-level breakdown by-default **প্রাইভেট** (শুধু ইউজার নিজে দেখবে); লিডারবোর্ডে অন্যরা শুধু agregate rank score দেখবে, ব্যক্তিগত অ্যাপ লিস্ট না।
- Play Store-এর Usage Access ডেক্লারেশন ফর্মে স্পষ্ট justification দিতে হবে (§৯.২)।

---

## ৭. Feature Set C — NEW: Smart Wake-up Alarm

### ৭.১ ইউজার স্টোরি
> "নির্দিষ্ট সময় অ্যালার্ম বাজবে, সহজে বন্ধ করা যাবে না — অংক/পাজল সল্ভ করতে হবে, স্নুজ ম্যাক্স ২ বার।"

### ৭.২ ফাংশনাল রিকোয়ারমেন্ট
1. Alarm scheduling: `android_alarm_manager_plus` বা native `AlarmManager` (`setExactAndAllowWhileIdle`) — Doze mode-এও exact time-এ ট্রিগার হতে হবে।
2. অ্যালার্ম বাজলে **full-screen intent notification** (lock screen-এর ওপরে দেখাবে, `USE_FULL_SCREEN_INTENT` permission — Android 14+ এ রানটাইমে আলাদা রিকোয়েস্ট লাগে)।
3. **Dismiss চ্যালেঞ্জ:** এলার্ম বন্ধ করতে হলে একটা টাস্ক সল্ভ করতেই হবে:
   - সহজ: ২-অঙ্কের যোগ/বিয়োগ
   - মাঝারি: multi-step arithmetic (২টা অপারেশন)
   - কঠিন: শাফলড-শব্দ পাজল / সিকোয়েন্স ম্যাচিং / মিনি সুডোকু-স্টাইল গ্রিড
   - ডিফিকাল্টি লেভেল Settings থেকে ইউজার সিলেক্ট করবে, ডিফল্ট অ্যাডমিন-কনফিগারেবল।
4. **স্নুজ:** ম্যাক্স ২ বার, প্রতিবার ৫-১০ মিনিট (কনফিগারেবল); ৩য় বার স্নুজ বাটন hide/disabled হয়ে যাবে — তখন শুধু পাজল সল্ভ করেই বন্ধ করা যাবে।
5. পাজল সঠিক হলে অ্যালার্ম সাউন্ড স্টপ + অ্যাপ Home/Dashboard-এ ল্যান্ড করবে **এবং সেখানে সাথে সাথে আজকের টাস্ক লিস্ট + দৈনিক লক্ষ্য দেখাবে** (§৮.৪-এর সাথে যুক্ত)।
6. একাধিক অ্যালার্ম সাপোর্ট (repeat days, label, sound pick, vibration pattern)।

### ৭.৩ টেকনিক্যাল নোট
- Flutter-এ alarm firing মূলত native side (Kotlin) হ্যান্ডল করা উচিত — `MethodChannel`/`flutter_local_notifications` দিয়ে full-screen alarm activity লঞ্চ করুন, কারণ Dart isolate কিল হয়ে গেলেও alarm reliably বাজতে হবে।
- Battery optimization exemption রিকোয়েস্ট করুন (`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`) — না হলে OEM (Xiaomi/Oppo ইত্যাদি) অ্যালার্ম কিল করে দিতে পারে; onboarding-এ ইউজারকে এই সেটিংস অন করতে গাইড করুন।
- পাজল-লজিক pure Dart (কোনো নেটওয়ার্ক কল না) — অফলাইনেও কাজ করবে।

---

## ৮. Feature Set D — NEW: Focus Mode + App Blocking

### ৮.১ ইউজার স্টোরি
> "ফোকাস টাইমে সোশ্যাল মিডিয়া অটো-ব্লক থাকবে, শুধু আমাদের অ্যাপ চলবে; আমি চাইলে নির্দিষ্ট অ্যাপ সবসময়ের জন্য ব্লক রাখতে পারি; ফোকাস সেশন/নোট/কুইজ থেকে অর্জিত রিওয়ার্ড দিয়ে নির্দিষ্ট সময় সোশ্যাল মিডিয়া আনলক করতে পারি; দিনে ৫ বার ইমার্জেন্সি এক্সেস বাটন থাকবে।"

### ৮.২ ফাংশনাল রিকোয়ারমেন্ট
1. **ব্লক ইঞ্জিন:** `UsageStatsManager` + `AccessibilityService` (foreground app detect) দিয়ে monitor করা — টার্গেট অ্যাপ (Facebook, Instagram, TikTok, YouTube ইত্যাদি প্রি-সেট + ইউজার কাস্টম লিস্ট) foreground এলে ওভারলে দিয়ে ব্লক-স্ক্রিন দেখানো (`SYSTEM_ALERT_WINDOW` overlay permission)।
   > **Note:** AccessibilityService ব্যবহার করলে Play Store-এ কড়া রিভিউ হয় (§৯.২) — বিকল্প হিসেবে `UsageStatsManager` পোলিং (প্রতি ১-২ সেকেন্ডে ফোরগ্রাউন্ড অ্যাপ চেক) + overlay দিয়েও কাজ চলে, কম ঝুঁকিপূর্ণ। প্রথম রিলিজে এই পদ্ধতিতেই যান, প্রয়োজনে পরে Accessibility-তে upgrade করুন।
2. **ফোকাস টাইম কাউন্ট শর্ত:** শুধু তখনই ফোকাস মিনিট কাউন্ট হবে যখন **Dridhota AI অ্যাপ নিজেই ফোরগ্রাউন্ডে** এবং অন্য কোনো অ্যাপ চলছে না (স্ক্রিন-অন + আমাদের অ্যাপ active detection)।
3. **অটো-ব্লক শিডিউল:** ইউজার "Focus Session Start" করলে সোশ্যাল মিডিয়া লিস্ট অটো-ব্লক; সেশন শেষ/স্টপ করলে আনব্লক।
4. **পার্মানেন্ট ব্লক:** Settings → App Blocklist-এ ইউজার নির্দিষ্ট অ্যাপ সবসময় ব্লক করে রাখতে পারবে (ফোকাস সেশনের বাইরেও)।
5. **রিওয়ার্ড-বেসড আনলক:** ফোকাস মিনিট/নোট লেখা/কুইজ কমপ্লিশন থেকে অর্জিত "Unlock Credits" (rewards ledger) খরচ করে নির্দিষ্ট সময়ের (যেমন ১৫/৩০ মিনিট) জন্য ব্লক করা অ্যাপ সাময়িক আনলক করা যাবে।
6. **ইমার্জেন্সি এক্সেস:** প্রতিটা ব্লক করা অ্যাপে একটা "🚨 Emergency Access" বাটন থাকবে ব্লক-স্ক্রিনে — দিনে সর্বোচ্চ **৫ বার** (per app অথবা total — Admin কনফিগারেবল, ডিফল্ট per-app) ব্যবহার করে সরাসরি অ্যাপ খোলা যাবে, প্রতিবার ব্যবহারে লগ হবে (`emergency_access_log`)।
7. **Admin-controlled limits:** ইমার্জেন্সি এক্সেস সংখ্যা, রিওয়ার্ড রেট (কত মিনিট ফোকাস = কত আনলক-ক্রেডিট), স্নুজ সময়, ডিফল্ট ব্লকলিস্ট — সব `system_settings/focus_config` ডকে থাকবে, Admin Panel থেকে বদলানো যাবে, app real-time snapshot listen করবে।

### ৮.৩ ডেটা মডেল
```
users/{uid}/focus_blocklist   // permanent + session blocklist (array of package names + mode)
rewards_ledger/{uid}/entries/{id}   // earned via focus/notes/quiz, spent via unlock
  { source: "focus_session"|"note"|"quiz", amount, ts }
  { type: "spend", packageName, minutesUnlocked, ts }
emergency_access_log/{uid}/{date}
  { packageName, usedAt, count }
system_settings/focus_config   // admin-controlled: dailyEmergencyLimit, rewardRate, snoozeMinutes, defaultBlockedApps[]
```

### ৮.৪ App-open → Daily Tasks Quick View
- অ্যাপ প্রতিবার ওপেন হলে (cold start অথবা অ্যালার্ম dismiss-এর পর) একটা **"Today" বটম-শিট/হোম কার্ড** দেখাবে: আজকের টাস্ক, revision due, daily target progress — যাতে ইউজার সাথে সাথে বুঝে আজ কী করতে হবে (Dashboard-এর সাবসেট, quick-glance কার্ড হিসেবে)।

### ৮.৫ ২৪+ বয়স-সংবেদনশীলতা নোট
যেহেতু ইউজারবেস মূলত মাইনর (SSC/HSC), ব্লকিং ও ইমার্জেন্সি-এক্সেস ফিচার **সেলফ-রেগুলেশন টুল** হিসেবে ডিজাইন করা হয়েছে (ইউজার নিজের ডিভাইসে নিজের ওপর প্রয়োগ করে) — কোনো তৃতীয় পক্ষ (অভিভাবক/অ্যাডমিন) দূর থেকে অন্য কারো ডিভাইস কন্ট্রোল করছে না। অ্যাডমিন শুধু গ্লোবাল ডিফল্ট কনফিগ সেট করে, ইনডিভিজুয়াল ইউজার ডেটা মনিটর/কন্ট্রোল করে না।

---

## ৯. Privacy, Security & Google Play Compliance

### ৯.১ প্রাইভেসি প্রিন্সিপাল
- **Data minimization:** স্ক্রিন-টাইম raw per-app data by-default ডিভাইসেই থাকবে; সার্ভারে শুধু aggregate (total minutes + category, per-app না) sync হবে যদি না ইউজার এক্সপ্লিসিটলি per-app শেয়ারিং অন করে (ভবিষ্যতের "compare with friends" ফিচারের জন্য, opt-in)।
- **কোনো ডিভাইস-রিস্ক ডেটা** (কন্টাক্টস, SMS, কল লগ, লোকেশন হিস্টোরি) কালেক্ট করা হবে না — শুধু app-usage duration + package name।
- **অ্যাকাউন্ট ডিলিট = সব ডেটা মুছে যাওয়া** (Settings → Danger Zone → Cloud Function `deleteUserData` — সব সাব-কালেকশন cascade delete)।
- Privacy Policy পেজ (web + in-app) স্ক্রিন-টাইম/ফোকাস-মোড ফিচার স্পষ্ট ব্যাখ্যা করবে।

### ৯.২ Google Play বিশেষ পারমিশন ডেক্লারেশন
| Permission | কেন লাগবে | Play Console ফর্ম |
|---|---|---|
| `PACKAGE_USAGE_STATS` | স্ক্রিন-টাইম ট্র্যাক | "Usage Access" permission declaration — বিস্তারিত justification + ডেমো ভিডিও লাগবে |
| `SYSTEM_ALERT_WINDOW` | ব্লক-স্ক্রিন ওভারলে | "Display over other apps" — justification |
| `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` | নির্ভুল সময়ে অ্যালার্ম | Android 12+ এ আলাদা declare |
| `USE_FULL_SCREEN_INTENT` | লক-স্ক্রিনে অ্যালার্ম | Android 14+ রানটাইম রিকোয়েস্ট |
| `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_SPECIAL_USE` | রিয়েল-টাইম sync/ব্লক মনিটরিং | foreground service type ডিক্লেয়ার করতে হবে |
| `POST_NOTIFICATIONS` | রিমাইন্ডার/অ্যালার্ম নোটিফিকেশন | Android 13+ রানটাইম রিকোয়েস্ট |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | অ্যালার্ম রিলায়েবিলিটি | optional, in-app গাইডেড flow |

- **Data Safety Form** (Play Console): usage-data collection, encryption in transit (HTTPS/Firebase default), no sale of data, data deletion request পথ উল্লেখ করতে হবে।
- **১৮+ কন্টেন্ট নীতি:** যেহেতু বড় অংশ ইউজার মাইনর, অ্যাপ **Families policy** বা কমপক্ষে "Teacher approved"/general audience গাইডলাইন মেনে চলবে — কোনো ম্যাচিউর কন্টেন্ট, বিজ্ঞাপন নেটওয়ার্ক অনুপযুক্ত হলে সরাতে হবে, এবং target_sdk/age-rating সততার সাথে পূরণ করতে হবে।
- **Malware/abuse প্রতিরোধ:** কোনো থার্ড-পার্টি অ্যাড SDK বা অস্বচ্ছ ট্র্যাকার ইনক্লুড করবেন না; সব ডিপেন্ডেন্সি pub.dev-এর verified প্যাকেজ থেকে নিন; ProGuard/R8 দিয়ে রিলিজ বিল্ড obfuscate করুন যাতে রিভার্স-ইঞ্জিনিয়ারিং কঠিন হয়।

---

## ১০. Tech Stack & Key Packages

| স্তর | চয়েস |
|---|---|
| Framework | Flutter (stable channel) |
| State management | Riverpod (অথবা Bloc, টিমের পছন্দমতো — সামঞ্জস্যের জন্য একটাই বেছে নিন) |
| Local storage | `hive` / `sembast` (offline notes/tasks cache) + `shared_preferences` (সেটিংস) |
| Firebase | `firebase_core`, `firebase_auth`, `cloud_firestore`, `firebase_messaging`, `cloud_functions` |
| Screen time | `usage_stats` / কাস্টম `MethodChannel` (Kotlin `UsageStatsManager`) |
| Alarm | `android_alarm_manager_plus` + native full-screen intent (Kotlin) |
| Foreground service | `flutter_foreground_task` |
| Notifications | `flutter_local_notifications` |
| Overlay (block screen) | `flutter_overlay_window` বা native `WindowManager` overlay |
| Connectivity | `connectivity_plus` |
| i18n | `flutter_localizations` + `intl`, বাংলা/English ARB ফাইল |
| Fonts | `google_fonts` (Plus Jakarta Sans + Noto Sans Bengali) |
| Charts (leaderboard/usage graph) | `fl_chart` |
| Image caching | `cached_network_image` |
| Testing | `flutter_test`, `integration_test`, `mockito`/`mocktail` |

---

## ১১. Development Workflow (CLI-only, Vibe-Coding Friendly)

যেহেতু কম্পিউটার কনফিগারেশন দুর্বল — Android Studio GUI এড়িয়ে পুরোপুরি **CLI + USB debugging** ওয়ার্কফ্লো:

```bash
# ১. প্রজেক্ট বানানো
flutter create dridhota_ai --org com.nfz --platforms=android

# ২. ডিভাইস কানেক্ট চেক (USB debugging অন থাকা মোবাইলে)
flutter devices

# ৩. লাইভ ডিবাগ (hot reload) সরাসরি ফিজিক্যাল ডিভাইসে
flutter run -d <device_id>

# ৪. স্ট্যাটিক অ্যানালাইসিস + লিন্ট (প্রতিটা প্রম্পট/কমিটের আগে)
flutter analyze

# ৫. ইউনিট + উইজেট টেস্ট
flutter test

# ৬. রিলিজ APK বিল্ড (সাইন করা, split-per-abi সাইজ কমাতে)
flutter build apk --release --split-per-abi

# ৭. Play Store-এর জন্য AAB (recommended format)
flutter build appbundle --release

# ৮. সাইনিং কনফিগ — android/key.properties + android/app/build.gradle-এ
#    keytool দিয়ে upload keystore বানান:
keytool -genkey -v -keystore ~/dridhota-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias dridhota
```

**Edge/Preview debugging (লাইভ কম্পিউট):** `flutter run --web-renderer canvaskit -d chrome` দিয়ে UI-অংশ দ্রুত প্রিভিউ করা যায় (Firebase mock/emulator সহ), কিন্তু স্ক্রিন-টাইম/অ্যালার্ম/ব্লকিং নেটিভ ফিচার শুধু **রিয়েল Android ডিভাইসেই** টেস্ট করা যাবে (emulator-এ `UsageStatsManager` limited কাজ করে)।

**Firebase Emulator Suite** ব্যবহার করুন lokal dev-এ (Auth+Firestore+Functions emulator) যাতে প্রোডাকশন ডেটা না ঘাঁটে:
```bash
firebase emulators:start --only auth,firestore,functions
```

---

## ১২. Automated Bug Hunting / QA Strategy

1. **CI pipeline** (GitHub Actions): প্রতি push-এ `flutter analyze` + `flutter test` + build চেক।
2. **Crash reporting:** Firebase Crashlytics ইন্টিগ্রেট করুন — রিয়েল-টাইম ক্র্যাশ/ANR অ্যালার্ট, স্ট্যাক ট্রেস grouping।
3. **Performance monitoring:** Firebase Performance Monitoring (cold-start time, network trace)।
4. **Static analysis:** `flutter analyze` + কাস্টম lint rules (`analysis_options.yaml`-এ strict মোড অন)।
5. **Widget/Golden tests:** ডিজাইন-সিস্টেম কম্পোনেন্টের জন্য golden test রাখুন যাতে ভবিষ্যতে UI regression ধরা পড়ে।
6. **Manual QA checklist (প্রতি রিলিজ আগে):**
   - [ ] Doze mode-এ অ্যালার্ম বাজছে কিনা (ডিভাইস idle করে টেস্ট)
   - [ ] বিভিন্ন OEM (Xiaomi/Oppo/Realme battery-aggressive) তে foreground service বেঁচে থাকছে কিনা
   - [ ] Offline → Online sync conflict-free কিনা
   - [ ] পারমিশন deny করলে graceful fallback (crash না করে)
   - [ ] Screen reader/accessibility বেসিক সাপোর্ট
7. **AI-assisted bug hunt loop:** প্রতিটা ফিচার merge-এর পর AI এজেন্টকে দিয়ে diff রিভিউ করান (edge case, null-safety, memory leak প্যাটার্ন) — Claude Code/Cursor-এ automated review প্রম্পট রুটিন করুন।

---

## ১৩. Unified Admin Panel — নতুন সেকশন যোগ

বিদ্যমান Web Admin Panel-এ যোগ করুন (আলাদা অ্যাডমিন অ্যাপ না বানিয়ে):

| নতুন সেকশন | কাজ |
|---|---|
| **Screen-Time Leaderboard Config** | rankScore ফর্মুলা প্যারামিটার, scope (class/school/national) টগল, রিকম্পিউট শিডিউল |
| **Focus/Blocklist Config** | default blocked apps list, reward rate, snooze minutes, emergency access daily limit |
| **Alarm Puzzle Config** | ডিফল্ট ডিফিকাল্টি, পাজল টাইপ enable/disable |
| **App Version/Force Update** | মিনিমাম সাপোর্টেড app version, ফোর্স-আপডেট ব্যানার |
| **Usage Anomaly Monitor** | স্পাইক/সাসপিশাস প্যাটার্ন ফ্ল্যাগ (existing War Monitor-এর প্যাটার্নে) |
| **Emergency Access Audit Log** | প্রতিদিনের ব্যবহারের অ্যাগ্রিগেট ভিউ (privacy-সংরক্ষিত, ব্যক্তিগত না) |

---

## ১৪. Milestones (High-level)

| ফেজ | স্কোপ | টার্গেট |
|---|---|---|
| M1 — Foundation | Flutter project setup, Firebase wiring, design-system widgets, Auth flow | সেপ্টেম্বর বেটার আগে |
| M2 — Core Parity | Notes, Syllabus+AI, Tasks, Dashboard, Settings | M1 + ২-৩ সপ্তাহ |
| M3 — Social/Gamification | Leaderboard, Streak, Community, DM, Quizzes | সমান্তরালে চলবে |
| M4 — New Features | Screen-time tracking, Alarm, Focus-mode blocking | M2-র পরে, সবচেয়ে রিস্কি অংশ — বেশি বাফার রাখুন |
| M5 — Admin Panel Extension | নতুন সেকশন যোগ | M4-র সাথে সমান্তরাল |
| M6 — QA + Play Store Prep | Crashlytics, permission testing, Data Safety form, internal testing track | লঞ্চের ২ সপ্তাহ আগে |
| M7 — Beta Launch | Closed/Open testing track → Sept 1 admission-cycle টাইমিং | Sept 1, 2026 |

> **রিস্ক নোট:** স্ক্রিন-টাইম + ব্লকিং ফিচার OEM battery-management ও Android পারমিশন মডেলের কারণে সবচেয়ে বেশি ডিভাইস-স্পেসিফিক বাগ আনবে — M4-এর জন্য বাফার টাইম বাড়িয়ে রাখুন এবং একাধিক রিয়েল ডিভাইসে (Samsung/Xiaomi/Realme অন্তত) টেস্ট করুন।

---

## ১৫. Open Questions (ডেভ শুরুর আগে ঠিক করে নিন)

1. State management: Riverpod না Bloc — টিম কনভেনশন?
2. স্ক্রিন-টাইম "friends compare" ফিচার ভবিষ্যতে চাই কিনা (এখন aggregate-only না per-app opt-in)?
3. AccessibilityService যাব কিনা (আরও রিলায়েবল ব্লকিং কিন্তু Play রিভিউ রিস্ক বেশি) নাকি UsageStats-পোলিং দিয়েই প্রথম রিলিজ?
4. iOS ভার্সন রোডম্যাপে কবে (Screen Time API iOS-এ Apple-এর নিজস্ব Family Controls framework লাগবে, সম্পূর্ণ আলাদা ইমপ্লিমেন্টেশন)?

---

### শেষ নোট (AI প্রম্পটিং-এর জন্য)
প্রতিটা ফিচার সেকশন (§৫–§৮) থেকে আলাদা করে Claude Code/Cursor প্রম্পট বানান — প্রতিটার শেষে এই লাইন যোগ করুন:

> *"এই স্ক্রিন/ফিচারের জন্য §৩-এর ডিজাইন টোকেন ব্যবহার করো, plan/credits/isAdmin ফিল্ড কখনো client-এ লিখো না, Firestore rules-ই সোর্স অফ ট্রুথ, আর নতুন যেকোনো পারমিশন যোগ করলে §৯.২-এর টেবিলে এন্ট্রি রাখো।"*
