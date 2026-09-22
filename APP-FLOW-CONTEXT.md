# Second Brain v3 — সম্পূর্ণ ইউজার ফ্লো ও টেকনিক্যাল কনটেক্সট (Flutter Rebuild-এর জন্য)

> এই ফাইলটি অ্যাপের প্রতিটি ফিচারে ইউজার কীভাবে ক্লিক করে কাজ করে (user journey) এবং প্রতিটি ক্লিকে ব্যাকএন্ডে কী ঘটে (Firestore/Functions/AI/Quota) — সম্পূর্ণ বিবরণ। এই কনটেক্সট পড়েই Flutter অ্যাপের জন্য প্রম্পট বানাবেন।
> প্রজেক্ট: `second-brain-64aa3` (Firebase) | টার্গেট: বাংলাদেশ, Class 9–12 শিক্ষার্থী (SSC/HSC + School/College) | ফ্রি-মডেল: Trial + Free tier + Paid packages

---

## ০. আর্কিটেকচার ওয়ান-লাইনার

- **Frontend:** Vanilla JS (ES Modules) + Firebase SDK v9 modular (`compat` + modular mix), PWA (Service Worker + offline cache), localStorage caching layer (offline-first), ১০০+ মডিউল।
- **Backend:** Firebase Auth (email/password), Cloud Firestore (সব ডেটা), Cloud Functions (auth trigger + callable, region `us-central1`), Firebase Cloud Messaging (push), Cloudflare Worker proxy (`https://<worker>.workers.dev/ai`) — AI-এর গেটওয়ে, এখানেই Gemini API key রাখা।
- **AI Stack:** Google Gemini (Flash model), client-side পদ্ধতি: ইউজার নিজের API key দিতে পারে, নাহলে **server-side proxy** (worker) দিয়ে কাজ করে — admin AI key কখনো ব্রাউজারে যায় না।
- **Quota/Payment:** ফ্রি ইউজারদের monthly API quota (apiUsage counter), paid user প্রিমিয়াম এক্সেস। পেমেন্ট ম্যানুয়াল (bKash/Nagad → admin approve) — payment_requests collection।
- **TTS:** Python local server (Browser Speech Synthesis fallback)।

---

## ১. অ্যাপ খোলা (Boot Flow)

**ইউজারের কাজ:** URL খুলবে / PWA install করে খুলবে।

**টেকনিক্যাল:**
1. `index.html` লোড → `js/app.js` (orchestrator) `type="module"` দিয়ে সব মডিউল import।
2. `document.body`-তে `app-loading` ক্লাস → skeleton loader দেখায়; **boot watchdog 5 সেকেন্ড**: নেটওয়ার্ক/ক্যাশ সমস্যা হলেও shell ৫ সেকেন্ডে রিভিল হয় (ইউজার কখনো blank screen-এ আটকে থাকে না)।
3. `sanitizeLocalStorage()` — localStorage corruption/অবৈধ এন্ট্রি ক্লিন (never blocks render)।
4. অগ্রাধিকার: `initTheme()` (dark/light — localStorage `sb_theme` + prefers-color-scheme) → `initOffline()` → `registerSW()` (Service Worker) → `initInstallNotification()` (PWA install prompt, `beforeinstallprompt`) → `initNotifications()` → `initUI()` (section router) → `initLanguage()` (বাংলা/English, `data-i18n-key`)।
5. Non-blocking parallel: chat, voice, AI questions, settings, profile, payment, class dropdown, school dropdown, header bind।
6. Low-priority (requestIdleCallback): বাকি সব init — study tracker, leaderboard, schools, class community, friends, DM, quiz, shared notes, notifications, mobile UI, admin features, dashboard previews, revision notif, note images, syllabus OCR, practice center, YouTube courses, push notifications, onboarding tour, TTS, question bank, class QB, board PDFs, mind map, calendar, resources, pinned sites, UX, daily target, syllabus planner, answer check, points, motivational messages, streak, live rooms, gamification, streak wars, war engine, knowledge duels, revision race, target race, offline warrior, study buddy, perf monitoring।
7. Auth স্টেট ওয়াচ: `onAuthStateChanged` — login হলে dashboard, না হলে auth view।

**PWA:** `manifest.webmanifest` + icon set; install prompt "Add to Home Screen"; offline mode ব্যানার দেখায়।

---

## ২. অ্যাকাউন্ট তৈরি (Registration) — Auth Flow

**ইউজারের কাজ:**
1. প্রথমে লগইন/রেজিস্ট্রেশন স্ক্রিন।
2. **রেজিস্টার ফর্ম:** নাম, ইমেইল, পাসওয়ার্ড, ক্লাস (Class dropdown 9–12), স্কুল/কলেজ (search + pick + custom request), জেলা/উপজেলা (district/upazila dropdown), (ঐচ্ছিক) Referral code।
3. Submit → verify email লিঙ্ক যায় (Firebase)। মেইল verify না করলে কিছু ফিচার লক থাকে।
4. লগইন: ইমেইল + পাসওয়ার্ড; অথবা **"পাসওয়ার্ড ভুলে গেছেন"** → Firebase password reset email।

**টেকনিক্যাল (এই ফ্লোতে ব্যাকএন্ডে যা ঘটে):**
1. `createUserWithEmailAndPassword` → Auth user তৈরি।
2. **Cloud Function `seedUserProfile` (auth `onCreate` trigger)** সার্ভার-টাইমে `users/{uid}` ডক সিড করে:
   ```json
   { name, email, classLevel, school, district, upazila, createdAt,
     isAdmin: false, plan: "trial", trialStart: <now>, trialEnd: <now+7d>,
     planEnd: null, rewardEnd: null, packageId: null, aiPlan: "free",
     credits: <trial_credits>, freeAiLocked: false,
     referralCode: <auto-gen>, referredBy: <code হলে>, points: 0, xp: 0 }
   ```
   (নতুন ইউজারের প্রথম ১–২ সেকেন্ড plan ফিল্ড না-থাকা ট্রানজিয়েন্ট — পরের লোডে ঠিক।)
3. Client `ensureProfile()`-এ `merge:true` দিয়ে নিজের profile ডক নিশ্চিত করে, **কখনো plan/credits লিখতে পারে না** — এগুলো rules-এ admin-only।
4. **Legacy ইউজার (আগে থেকে অ্যাকাউন্ট আছে, trialEnd নেই):** client `requestLegacyTrial()` call করে Cloud Function `grantLegacyTrial`-এ (Bearer idToken) — function চেক করে trialEnd মিসিং থাকলে সার্ভার-টাইম trial grant + নতুন ফিল্ড (rewardEnd ইত্যাদি) যোগ করে।
5. **Firestore Rules গেট:** `users/{uid}` — owner read; owner create/update শুধু `[name, email, classLevel, school, district, upazila, avatar, bio, referralCode, referredBy, points, xp, streak...]`-জাতীয় নন-প্ল্যান ফিল্ড; **`plan/trialStart/trialEnd/planEnd/rewardEnd/packageId/aiPlan/credits/freeAiLocked/isAdmin` — owner-লিখতে সম্পূর্ণ ব্লকড** (এগুলো admin panel/Cloud Function ছাড়া কেউ বদলাতে পারে না)।
6. **Device-register:** `registerDeviceAccount(uid)` → `devices/{uid}` ডক (appInstanceId) — ডিভাইস ম্যানেজমেন্ট/রিপোর্টিং-এর জন্য। (পুরনো ৩-ডিভাইস lock লজিক বন্ধ — এখন সার্ভার-সাইডে নতুন করে বানানো যাবে।)

**Rule of thumb (Flutter-এ strictly follow):**
- Client কখনো plan/credits/aiPlan/packageId/isAdmin লিখবে না।
- trial/credit গাণিতিক শুধু Server Function/Admin-এ।
- সব client write `merge`।

---

## ৩. অনবোর্ডিং (প্রথম লগইন)

- `initOnboardingTour()` — প্রথম লগইনে টুলটিপ ট্যুর: Add notes → Syllabus+AI → YouTube courses → Leaderboard → Prayer times — প্রতিটি নেভ আইটেমে pointer টুলটিপ, "Next/শুরু করুন"।
- Dashboard-এ greeting + motivational message রোটেট হয়।

---

## ৪. Dashboard (হোম)

**ইউজারের কাজ (ক্লিক ফ্লো):** সাইডবার (desktop) / বটম-নেভ (mobile: Home, Notes, Revise, Rank, More)।

**Dashboard-এ যা থাকে:**
1. **Streak card** (🔥 daily streak) — study streak count + streak wars এন্ট্রি।
2. **XP / Points ব্যাজ** — header-এ points counter; ক্লিক করলে gamification detail (settings → rank details)।
3. **Daily Target** — আজকের লক্ষ্য (প্রশ্ন সংখ্যা/মিনিট), progress bar; manage → tasks।
4. **Recent Notes** — শেষ ৫টি নোট, ক্লিক → notes; "All →" বাটন → notes section।
5. **Upcoming Tasks** — আজকের টাস্ক, Manage → tasks।
6. **Revision count** ব্যাজ (সাইডবারে, overdue revision warning) → revision।
7. **Class QB widget** — ক্লাস কোর্স/বোর্ড পেপারের কুইজ → open → class-qb।
8. **Class Community preview** — ক্লাস চ্যাটের শেষ মেসেজ; ক্লিক → class-chat।
9. **DM preview** — সাম্প্রতিক DM থ্রেড; ক্লিক → dm।
10. **Gamification card** — লেভেল/XP/সিজন; "Settings →" rank details।
11. **Trial banner** (যদি trial চলছে) — "আপনার ট্রায়াল X দিন বাকি" → Subscribe (payment section)।
12. **Referral card** — বন্ধু রেফার করলে ১ মাস ফ্রি → refer।

**টেকনিক্যাল:** dashboard-previews.js আগের সেশন স্টেট + Firestore snapshot থেকে previews রেন্ডার; trial banner `paintTrialBanner()` plan/planEnd থেকে হিসাব করে; points badge `paintPointsBadge()`।

---

## ৫. Notes (নোট) — মূল ফিচার

**সেকশন:** All Notes / Add Note / Revision / Shared Notes।

### ৫.১ Add Note (নোট তৈরি)
**ইউজারের ক্লিক ফ্লো:**
1. Sidebar → **Add Note** (বা Dashboard-এ + বাটন)।
2. মোডালে: **টাইটেল** + **বিষয়/ক্লাস** + **সিলেবাস চ্যাপ্টার লিংক** (ঐচ্ছিক — সিলেবাস থেকে chapter pick করলে AI কনটেক্সট পায়)।
3. নোট বডি লিখবে (textarea, rich text/simple) — অথবা **🎤 ভয়েস দিয়ে বলবে** (Web Speech API → speech-to-text, বাংলা support)।
4. **📷 ছবি/PDF আপলোড** (ঐচ্ছিক) — `note-images`/`syllabus-ocr` — OCR দিয়ে লেখা extract করে নোটে append (ব্যাকএন্ডে Gemini vision → text)।
5. **Save** → নোট `notes/{noteId}`-এ:
   ```json
   { uid, title, content, classLevel, subject, chapterId, chapterTitle,
     tags[], createdAt, updatedAt, pinned: false, shareKey: null, imgUrls[] }
   ```
   → list-এ যোগ, sidebar count আপডেট, dashboard recent notes আপডেট।

### ৫.২ All Notes
- সার্চ বার (title/content live filter) + subject filter chips + sort (newest/pinned)।
- কার্ড ক্লিক → **Note Viewer** (পূর্ণ স্ক্রিন)।
- Note viewer-এ টুলবার: ✏️ Edit | 🗑️ Delete | 📌 Pin | 🔗 Share (shareKey gen → copyable link) | 🔊 TTS read aloud (tts.js, Python server) | 🧠 "AI সাজেস্ট" (AI থেকে improve/explain)।

### ৫.৩ Edit/Delete
- Edit → মোডাল prefilled → save → `updatedAt` update।
- Delete → confirm → `deleteDoc` (localStorage cache sync)।

### ৫.৪ Revision (রিভিশন)
- প্রতিটি নোটের জন্য revision সিডিউল: "Learn" মোডে নোট পড়ে **"আমি শিখেছি (Revise)"** বাটন → next revision date = spaced repetition (১ দিন, ৩ দিন, ৭ দিন, ১৫ দিন...)।
- **Revision list:** আজ/আগামীকালের জন্য পড়ার টাইমআউট (overdue = yellow/red ব্যাজ, sidebar count)।
- **Revision session:** নোট + টাইমার + quiz (নোটের কনটেন্ট থেকে AI প্রশ্ন — নিচে Quiz দেখুন)।
- **Revision Notif:** আগামী revision-এর reminder (notification permission)।
- **Motivational message** প্রতিটি session শেষে।

### ৫.৫ Shared Notes
- অন্যের `shareKey` দিয়ে পাবলিক শেয়ার লিংক → read-only view।
- SharedNotes তালিকা: community থেকে শেয়ার করা নোট ব্রাউজ + download।

**লোকাল ক্যাশিং:** প্রতিটি নোট read/write-এ localStorage mirror (`sb_notes_*`) — অফলাইনে নোট পড়া যায়; online হলে sync।

---

## ৬. Syllabus + AI (সিলেবাস)

**ইউজারের ক্লিক ফ্লো:**
1. **Syllabus + AI** খুলবে → "Class 10" সিলেক্ট → "বিজ্ঞান" সাবজেক্ট → অধ্যায় লিস্ট (ফ্রি ইউজার: ১ম ৩ অধ্যায়; paid: সব)।
2. **অধ্যায় খুললে:** chapter detail — ভিডিও? নোট? প্রশ্ন?
3. **AI Questions:** "এ অধ্যায়ের ১০টি প্রশ্ন চাই" → AI দিয়ে প্রশ্ন তৈরি (Flash): MCQ + creative প্রশ্ন; প্রতি প্রশ্নে hint/answer।
4. **PDF/ইমেজ আপলোড:** সিলেবাস PDF দিলে `syllabus-ocr` → Gemini দিয়ে chapters auto-extract → chapter list তৈরি।
5. **Syllabus Planner:** অধ্যায়গুলোর জন্য "Target Date" সেট (exam আগে শেষ করার পরিকল্পনা) → Calendar-এ দেখায় + daily target হিসাব।

**টেকনিক্যাল (AI call flow — গুরুত্বপূর্ণ):**
1. `ai.js` `getActiveKey()`: (a) ইউজার নিজের Gemini key settings-এ দিলে তা ব্যবহার; (b) নাহলে **proxy**: `POST https://<worker>.workers.dev/ai` → Cloudflare Worker → Gemini (server-side key, ব্রাউজারে কখনো আসে না)।
2. **Quota চেক:** `apiUsage` counter (monthly) — ফ্রি limit পেরোলে "Quota শেষ — upgrade করুন / নিজের key দিন"।
3. **AI Cache:** `system_client/ai_cache` — একই কুয়েরির ফলাফল ক্যাশ (admin "AI Cache" সেকশনে inspect/clear করা যায়) — কোস্ট কমায়।
4. `aiAccess()` লজিক: plan (`free/pro/trial`) + aiPlan (`free/paid`) + credits বান্ডেল হিসাব; প্ল্যান শেষে `freeAiLocked` চেক।

**Rule of thumb (Flutter):** সব AI call-এর আগে quota/plan/credits চেক; AI key কখনো হোম-স্ক্রিন/ক্লায়েন্ট-স্টোরেজে রাখা যাবে না; শুধু session-এ।

---

## ৭. Practice Center (প্র্যাকটিস)

- **Type:** MCQ + CQ (creative) + board question সেট — ক্লাস/সাবজেক্ট/চ্যাপ্টার ফিল্টার।
- **Answer Check (answer-check.js):** নিজে লিখে উত্তর দিলে AI দিয়ে চেক/স্কোর + সাজেশন (quota খরচ হয়)।
- প্রতিটি correct → points/XP + streak bump (নিচে Gamification)।

---

## ৮. Tasks + Daily Target + Calendar

1. **Tasks:** টাস্ক add (টাইটেল, সাবজেক্ট, ডেডলাইন, priority) → `tasks/{id}`; টাস্ক সম্পন্ন চেক → streak + XP; overdue হলে highlight। Quick-add header-এ।
2. **Daily Target:** দৈনিক প্রশ্ন-সংখ্যা বা মিনিট-লক্ষ্য; progress bar dashboard + section-এ; পূরণ হলে streak + বোনাস।
3. **Calendar:** মাসিক ভিউ — টাস্ক ডেডলাইন + revision dates + target dates; দিনে ক্লিক → details।

---

## ৯. Focus Timer

- Pomodoro-style: সেশন দৈর্ঘ্য সেট (default 25 মিনিট) → Start → **অন্য ট্যাব গেলেই পজ/স্টপ ডিটেক্ট** (focus-timer watchdog)।
- সেশন শেষ → **study_time-log**: `study_tracker` ডক-এ মিনিট যোগ → XP/streak/leaderboard update।
- সেশনের পর "মাইন্ড ম্যাপ বানাও" সাজেশন বাটন।

---

## ১০. Prayer Times

- জেলা/উপজেলা সিলেক্ট → daily prayer time list (API/calc), auto-location default; সতর্কতা: আজান সময় notification (ঐচ্ছিক)।

---

## ১১. YouTube Courses

- ইউজার প্লেলিস্ট লিংক পেস্ট → মডিউল কোর্সে রূপান্তর (videos list, টপিক ফিল্টার) → ভিডিও দেখার লিংক + ভিডিও-নোট নেওয়ার ফ্লো।

---

## ১২. Mind Map (AI)

- টপিক লিখে "Generate" → AI গাছ-আকৃতির mind map (branch hierarchy) → drag/expand node → **শেয়ার** (public shareKey) → অন্যদের shared maps ব্রাউজ।

---

## ১৩. Resources + Pinned Sites

- **Resources:** ইউজার/অ্যাডমিন আপলোড করা স্টাডি ম্যাটেরিয়াল (PDF/লিংক) — category filter, download/view, শেয়ার করা যায়। (Admin Resources সেকশনে মডারেট।)
- **Pinned Sites:** ইউজারের দরকারি ওয়েবসাইট শর্টকাট (নাম+URL) — icon grid, ক্লিক → new tab।

---

## ১৪. Social / Gamification (নতুন সেকশন)

### ১৪.১ Leaderboard (Rank)
- **Daily/Weekly/Monthly** ট্যাব; সাজানো: study minutes + XP + streak।
- Class-এর ফ্রেন্ড + সারাদেশ ট্যাব; নিজের র‍্যাঙ্ক হাইলাইট; podium (Top 3)।
- লাইভ-আপডেট (snapshot listener) — প্রতিযোগিতার উত্তেজনার জন্য।

### ১৪.২ Streak + XP + Points
- দৈনিক ১ম স্টাডি সেশন → streak++ (streak.js, `study_streak` field / subcollection)।
- XP: প্রতি নোট/কুইজ/টাস্ক-কমপ্লিশন-এ xp += N (client-accepted, H3 — ভবিষ্যতে server-verify)।
- Points: quiz correct, revision done ইত্যাদি → points (redeem? no — rank only)।
- **Seasons:** admin-defined সিজন (মাস) → season ranking + শেষে বিজয়ী ব্যাজ (gamification.js, system_settings-এ config)।

### ১৪.৩ School (স্কুল/কলেজ)
- রেজিস্ট্রেশনে স্কুল বাছাই (searchable list, `schools` collection) অথবা **অনুপস্থিত স্কুল → submitSchoolRequest** (admin approve করে add করে)।
- স্কুল অনুযায়ী: class community auto-join (`autoEnroll`), leaderboard filtering, **School Wars**।

### ১৪.৪ Class Community (ক্লাস চ্যাট)
- ক্লাস+স্কুল কম্বো অনুযায়ী গ্রুপ চ্যাট (auto-join) — messages collection (live listener), notification ব্যাজ; moderation (admin/teacher flags)। Member list + ক্লাস QB shortcut।

### ১৪.৫ Friends + DM
1. **Friends:** ইউজার সার্চ → Add friend (request/accept) — `friends/{uid}` (pending/accepted)।
2. ফ্রেন্ড লিস্ট থেকে **Chat** বাটন → DM।
3. **DM:** এক-এক chat থ্রেড `dms/{threadId}/messages/{id}` (typing indicator, read receipts, last message preview dashboard-এ); block/report।
- Admin সাইডে "Friends & DM Mod" — বিতর্কিত মেসেজ রিপোর্ট রিভিউ।

### ১৪.৬ Quizzes (ক্যাম্পেইন)
- **Quiz campaigns** (admin-নির্ধারিত): ক্লাস+সাবজেক্ট+টাইম (live window) + prize points/XP।
- ক্লিক → প্রশ্ন সিরিজ (MCQ, ধাপে ধাপে, টাইমার) → **সঠিক উত্তর শুধু in-memory** (DOM-এ কখনো নেই) → স্কোর + answer key দেখানো হয় শেষে → attempt log `quiz_attempts` + leaderboard/points।
- পুনরায় অংশ নেওয়া সীমিত (per-campaign limit)।

### ১৪.৭ Question Bank + Class QB + Board PDFs
- **Question Bank:** ক্লাস/সাবজেক্ট/চ্যাপ্টার/বছর ফিল্টার → প্রশ্ন লিস্ট (MCQ/CQ), উত্তর-চেক।
- **Class QB (qb-class.js):** ক্লাস/স্কুল-ভিত্তিক পেপার-প্রশ্ন প্যাক — dashboard widget + নিজস্ব সেকশন।
- **Board PDFs:** SSC/HSC বোর্ড প্রশ্ন PDF — বছর/বোর্ড ফিল্টার, view/download; admin-আপলোড।

### ১৪.৮ Knowledge Duels (১v১)
1. লবি: খেলোয়াড় লিস্ট → চ্যালেঞ্জ পাঠাও (friend) / random।
2. Match: দুজনেই একই প্রশ্নসেট (timed, MCQ) — রাউন্ডভিত্তিক (৩/৫ রাউন্ড)।
3. স্কোর কম্পেয়ার → বিজয়ী XP/points + duel log; rematch বাটন।
- `duels/{id}` collection, টাইমআউট/ড্র হ্যান্ডলিং।

### ১৪.৯ Revision Race / Daily Target Race
- লবি → নিজের revision-লক্ষ্য বা daily target-কে "race" ঘোষণা → অন্যরা জয়েন/চ্যালেঞ্জ → যে আগে শেষ করবে জিতবে (live progress bar)।

### ১৪.১০ Study Buddy
- মিলে পড়ার পেয়ারিং (ক্লাস/সাবজেক্ট পছন্দ) → buddy কার্ড → chat/study session invite, মোটিভেশনাল push।

### ১৪.১১ Live Rooms (লাইভ স্টাডি রুম)
- রুম তৈরি (টপিক + সময়) / জয়েন → ঘড়ি + সদস্য + মিনিট-বর্ধমান live leaderboard (নিজেদের মাঝে) → রুম শেষে XP।
- ২-৩ জনের ছোট রুম থেকে বড় সেশন-রুম — dashboard/leaderboard-এ এন্ট্রি পয়েন্ট।

### ১৪.১২ Streak Wars + School Wars (War Engine)
- **Streak Wars:** দুই ইউজার/দল streak রক্ষার যুদ্ধ — daily check-in, ভাঙলে হার।
- **School Wars:** দুই স্কুল/কলেজের সারাবছর লড়াই — মোট study minutes/XP/participants scoreboard, সিজন শেষে বিজয়ী স্কুল ব্যাজ (admin-monitored, anti-cheat flags)।
- **War Monitor (admin):** অস্বাভাবিক স্পাইক/সন্দেহজনক অ্যাক্টিভিটি ফ্ল্যাগ।

### ১৪.১৩ Offline Warrior
- অফলাইন মোডেও streak/points জমা হয় (locally buffered) → অনলাইনে sync (catch-up)।

---

## ১৫. Monetization (Subscribe / Refer & Earn)

### ১৫.১ Packages (payment section)
- **Packages লিস্ট** (system থেকে admin-defined, `packages` collection): monthly/6-month/yearly; প্রতিটিতে: AI quota, সিলেবাস আনলক, premium quiz ইত্যাদি।
- ট্রায়াল শেষ / quota শেষ হলে "View packages" CTA।
- **Payment flow (manual):** প্যাকেজ সিলেক্ট → ফোন নাম্বার + transaction ID (bKash/Nagad/Rocket) → **`payment_requests/{id}`** ডক: `{ uid, packageId, amount, trxId, method, status:"pending", createdAt }` → কনফার্মেশন মেসেজ।
- **Admin approve:** payments সেকশন → verify → status "approved" → admin panel-এ packageId/planEnd সেট (সার্ভার-সাইড বা admin rule) → user plan live → আনলক + congratulation notification।
- **Trial:** নতুন user ৭ দিন trial (`trialStart/End`) — ব্যানার কাউন্টডাউন; শেষে ফ্রি-tier (৩ চ্যাপ্টার, সীমিত AI quota)।

### ১৫.২ Refer & Earn
- শেয়ারযোগ্য রেফারাল লিংক (`?ref=<code>`)/code → ফ্রেন্ড রেজিস্টার করলে দুজনেই বোনাস (referrer: **+১ মাস ফ্রি** = `rewardEnd` extension; referee: extra credits) — approval সার্ভার-সাইড/প্রপার ভেরিফাইড।

### ১৫.৩ Payment Methods (admin): bkash/nagad নম্বর, instructions — settings।

---

## ১৬. Settings (More)

1. **Profile:** নাম, ফোন, avatar (upload → Storage URL), bio।
2. **School:** স্কুল বদল/রিকোয়েস্ট (নতুন স্কুল → admin approve)।
3. **Language:** বাংলা / English (live translate, i18n keys)।
4. **Theme:** Light / Dark / Auto।
5. **Notifications:** push permission টগল, category (revision, community, war, promo); **enhanced push** (custom payload — সার্ভার থেকে notification push, admin custom-notif-ও এখানে)।
6. **AI Settings:** নিজের **Gemini API key** দেওয়ার অপশন (proxy খরচ বাঁচায়) + AI plan দেখায় — **AI Plan selector read-only** (admin সেট করে; user বদলাতে পারে না)।
7. **Quota:** মাসিক AI usage বার + রিসেট তারিখ।
8. **Rank details:** XP/points/streak/season breakdown (gamification)।
9. **Danger zone:** অ্যাকাউন্ট ডিলিট (request)।

---

## ১৭. Notifications (Push)

- **Firebase Messaging (FCM):** token registration → push-notifications-enhanced (custom data → notification, action buttons)।
- **Initiatives:** revision reminder, streak অ্যালার্ট, duel invite, live room invite, quiz start, school war result, admin custom notification, promo।
- Permission deny হলে in-app fallback (banner/toast)।

---

## ১৮. Offline Mode (Offline-First)

- **Service Worker** cache: app shell + assets (v3 ক্যাশ পলিসি)।
- **Data cache:** notes/tasks/syllabus/quiz-cache localStorage mirror — অফলাইনে read/write → queue → online-এ bulk sync (offline.js, offline-warrior.js)।
- **Watchdog:** ৫-সেকেন্ড boot নিয়ম + offline ব্যানার + "এখনো অফলাইন, পরিবর্তন সেভ হবে পরে" টোস্ট।
- কোনো নেটওয়ার্ক অপারেশন ব্যর্থ হলে auto-retry (retry-queue)।

---

## ১৯. Security Rules (Firestore) — সিস্টেম গেটসম্যান

- **Auth gate:** সব collection-এ `request.auth != null`।
- `users/{uid}`: owner read; **plan-gate ফিল্ড admin-only write** (নিচের তালিকা client-এ denied); profile update → limited fields।
- `system_client/`: admin-only write; **`aikey` read client-এ blocked** (কী কখনো ব্রাউজারে নেই); `ai_cache` — owner/any logged-in read (cache), admin write.
- `system_settings/`, `packages/`, `branding/`, `notices/`: client read-only; admin (isAdmin) write।
- `notes/`, `tasks/`, `study_tracker/` ইত্যাদি: owner-scoped (uid == request.auth.uid) read/write; shareKey পাবলিক-ভিউ আলাদা path।
- `friends/`, `dms/`, `communities/`, `live_rooms/`, `duels/`: member-scoped access।
- `payment_requests/`: creator write (own), admin read-all/update status।
- `schools/`, `question_bank/`, `board_pdfs/`: read authenticated, write admin (+ request flow).

---

## ২০. Admin Panel (সংক্ষেপ — Flutter-এ admin web/cms বানালে)

Dashboard, Users (plan/edit/ban), Payments (approve/reject → plan grant), Features toggle, App Settings, **AI Management** (test key, প্রোডাকশন key **শুধু সার্ভারে** — sync শুধু ডিলিট করে), Branding, Packages CRUD, Trial/Free config, Textbook DB, Pay Methods, Community & Social moderation, Notices, Gamification config, Competitions config, **War Monitor** (cheat flags), Custom Notifications (push), Reset Requests, Schools approve, Quiz Campaigns, Question Bank, Board PDFs, Friends/DM mod, Finance, Resources, Support Inbox, AI Cache.

---

## ২১. Flutter Rebuild-এর জন্য করণীয় টেকনিক্যাল লিস্ট (checklist)

1. **Auth:** `firebase_auth` (email/password, verify email, reset) + Cloud Function trigger-নির্ভর profile seed — Flutter-এও `users/{uid}`-এ plan-ফিল্ড কখনো client-write করবেন না।
2. **State:** `Riverpod/Bloc`-এ reactive Firestore streams (বর্তমানে snapshot listeners-এর সমতুল্য); localStorage → `shared_preferences`/`hive`; offline-queue → `sembast/hive` + connectivity_plus + retry।
3. **AI proxy:** ডায়মন্ড সেফটি — Gemini key শুধু Worker-এ; Flutter থেকে `http` দিয়ে `POST <worker>/ai`; quota চেক আগে; cache-hit আগে। ইউজারের নিজের key session-মেমরিতে (মনে রাখবেন না/বাম সিকিউরিটিতে save optional)।
4. **UI:** bottom nav ৫ ট্যাব (Home/Notes/Revise/Rank/More) + drawer; i18n (বাংলা/English); dark/light theme।
5. **Push:** FCM (`firebase_messaging`); notification click → deep-link routing।
6. **Quizzes:** উত্তর কখনো widget tree/DOM-এ রাখবেন না — শুধু state/সার্ভারে; reveal শেষে।
7. **Payment:** ম্যানুয়াল trxId ফর্ম + status polling (payment_requests) — gateways (bKash API) পরে যুক্ত করা যাবে।
8. **Offline:** পূর্ন offline-first: সব write queue → sync; PWA আর্কিটেকচার তুলে native offline।
9. **Security:** Firestore rules-ই source of truth — Flutter-এও একই rules গেটে সাবজেক্ট; client-side কোনও price/credit যুক্তি নেই।
10. **Performance:** পেজিনেশন (list), lazy video, image caching (cached_network_image)।

---

## ২২. ডেটা মডেল সংক্ষেপ (collection → fields)

| Collection | Key fields |
|---|---|
| `users/{uid}` | name, email, classLevel, school, district, upazila, isAdmin, plan, trialStart/End, planEnd, rewardEnd, packageId, aiPlan, credits, freeAiLocked, referralCode, referredBy, points, xp, streak, avatar, bio, deviceIds |
| `devices/{uid}` | appInstanceId, lastActive |
| `notes/{id}` | uid, title, content, classLevel, subject, chapterId/Title, tags, pinned, shareKey, imgUrls, timestamps |
| `tasks/{id}` | uid, title, subject, deadline, priority, done |
| `study_tracker/{uid}` (or /records) | daily minutes, xp-log, streak log |
| `syllabus/{...}` | class, subject, chapters[{id,title,locked}] |
| `friends/{uid}` | friends[]/requests, status |
| `dms/{threadId}/messages/{id}` | from, to, text, ts, read |
| `communities/{id}` | class, school, messages/{id} |
| `quiz_attempts/{id}` | uid, campaignId, score, ts |
| `question_bank/`, `board_pdfs/`, `resources/` | class, subject, chapter, fileUrl |
| `duels/{id}`, `live_rooms/{id}`, `streak_wars/{id}`, `school_wars/{id}` | players, scores, status, season |
| `payments/payment_requests/{id}` | uid, packageId, amount, trxId, method, status |
| `packages/{id}` | name, price, duration, features |
| `system_client/` | aikey (admin-only, read-blocked), ai_cache, flags |
| `system_settings/`, `branding/`, `notices/`, `schools/` | config docs (client read-only) |

> শেষ নোট: এই কনটেক্সট ফাইল থেকে প্রতি ফিচারকে আলাদা Flutter প্রম্পট (খুলে একেকটি স্ক্রিন + state + ব্যাকএন্ড call) বানিয়ে নিন; প্রতিটি প্রম্পটের শেষে যোগ করুন: *"Firestore rules-এর গেট ও সার্ভার-ভেরিফাইড plan logic মেনে চলতে হবে; admin-শুধু ফিল্ড client-এ লেখা যাবে না।"*
