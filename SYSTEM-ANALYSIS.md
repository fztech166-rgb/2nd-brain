# Second Brain v3 — সম্পূর্ণ সিস্টেম এনালাইসিস (System Analysis)

> বিশ্লেষণ তারিখ: 2026-08-18 | প্রকল্প: `second-brain-64aa3` (Firebase) / `fwvggwfempaxmcilbsjo` (Supabase backup)
> এই ফাইলে প্রজেক্টের ডেটাবেস, আর্কিটেকচার, সব ফিচার সিস্টেমের লজিক, সিকিউরিটি থ্রেট, লুপহোল ও দুর্বলতার সম্পূর্ণ ইন-ডেপথ বিশ্লেষণ আছে।

## ফিক্স লগ (2026-08-18 — বাস্তবায়িত)

| ID | ফিক্স | ফাইল |
|---|---|---|
| C1 | ✅ Admin অ্যাকাউন্ট auto-creation সম্পূর্ণ বাদ — এখন Firebase Console-এ manual তৈরি করতে হবে | `admin/js/admin.js` |
| C2 | ✅ Admin AI key আর ব্রাউজারে sync হয় না — `syncAdminKeyToClient()` এখন ডক **ডিলিট** করে; `system_client/aikey` rules-এ client read ব্লকড; `ai.js`/`system-settings.js`/`store.js` থেকে admin-key path সরানো; অ্যাডমিন UI থেকে "admin key for all" টগল রিমুভড | `admin/js/admin.js`, `js/ai.js`, `js/system-settings.js`, `js/store.js`, `admin/admin.html`, `firestore.rules` |
| H1 | ✅ Plan/entitlement ফিল্ড (`plan,trialStart,trialEnd,planEnd,rewardEnd,packageId,aiPlan,credits,freeAiLocked`) এখন **admin-only** — owner create/update-এ rules ব্লক; trial/credits সিডিং সার্ভার-সাইড (নতুন `seedUserProfile` auth trigger + `grantLegacyTrial` callable); `auth.js` ও `settings.js` থেকে ক্লায়েন্ট-রাইট সরানো; settings-এ AI Plan selector read-only; `payment.js` (payment_requests-এ packageId) অক্ষত — সেটি users ডক নয় | `firestore.rules`, `functions/index.js`, `js/auth.js`, `js/settings.js`, `index.html` |
| H2 | ✅ কুইজের সঠিক উত্তর আর DOM-এ নেই (`data-correct` attribute রিমুভড) — উত্তর শুধু in-memory array-তে, `data-qidx` দিয়ে চেক | `js/ui.js` (২টি সাইট) |

> ⚠️ **ডিপ্লয় নোট:** `firestore.rules` + `functions` একসাথে ডিপ্লয় করুন (function আগে হলে নিউ-ইউজার সিডিং আগে চালু হবে)। ইতোমধ্যে বিদ্যমান `system_client/aikey` ডকটি অ্যাডমিন AI সেটিংস save করলে অটো-ডিলিট হবে। নতুন-ইউজার ট্রায়াল সিডিং এখন auth trigger-এ — প্রথম সেশানের ১-২ সেকেন্ড plan ফিল্ড না-থাকা ট্রানজিয়েন্ট (পরের load-এ ঠিক)। এখনো খোলা: H3 (XP/points/study-time ক্লায়েন্ট-অ্যাসার্টেড), H4 (escUrl), M1-M8।

---

## ১. প্রজেক্ট ওভারভিউ

**Second Brain v3** — বাংলাদেশি শিক্ষার্থীদের (Class 9–12 / SSC / HSC) জন্য একটি ফ্রি-মিয়াম PWA (Progressive Web App)। প্রধান ফিচার: নোট, AI চ্যাট/অ্যাসিস্ট্যান্ট, সিলেবাস প্ল্যানার, কুইজ, কোশ্চেন ব্যাংক, মাইন্ড ম্যাপ, ফোকাস টাইমার, সোশ্যাল (ফ্রেন্ড/ডুয়েল/কমিউনিটি), গেমিফিকেশন (XP/লিডারবোর্ড/স্ট্রিক), স্কুল ওয়ার, লাইভ স্টাডি রুম, পেমেন্ট/প্যাকেজ সিস্টেম, রেফারেল, পুশ নোটিফিকেশন, অফলাইন সাপোর্ট, TTS (টেক্সট-টু-স্পিচ)।

### প্রযুক্তি স্ট্যাক

| লেয়ার | টেকনোলজি |
|---|---|
| Frontend | Vanilla JS (ES Modules, ~100 ফাইল), Firebase JS compat SDK v10.12.2 |
| ডেটাবেস (লাইভ) | Firebase Firestore + Firebase Auth + Firebase Hosting |
| ডেটাবেস (লিগ্যাসি) | Firebase Realtime Database (database.rules.json — পুরনো, এখনো ডিপ্লয়ড) |
| ডেটাবেস (ব্যাকআপ/মাইগ্রেশন) | Supabase + RLS (`supabase-backup/` — **নিষ্ক্রিয়**, placeholder anon key) |
| Serverless | `functions/index.js` — aiChatProxy (Cloud Function, Node 20) |
| AI Proxy | `proxy/worker.js` — Cloudflare Worker (Gemini/Groq/OpenRouter failover, Firebase JWT verification) |
| TTS | `tts-server/server.py` — FastAPI + edge-tts (ফ্রি, Bangla voice সহ) |
| Data Pipeline | `scripts/` — scraper + seeder + question-bank builder (puppeteer-core) |
| স্ট্যাটিক ডেটা | `data/class{9,10,11,12}/{subject}.json` — কোশ্চেন ব্যাংক (৩,৮৪৫+ প্রশ্ন), `papers/` — বোর্ড প্রশ্ন PDF |
| অফলাইন | Service Worker (`sw.js`, cache `sb-shell-v42`) + IndexedDB + localStorage |

### ডিরেক্টরি মানচিত্র

```
├── index.html            ← অ্যাপ শেল + Firebase config (window.__FIREBASE__)
├── admin/                ← অ্যাডমিন প্যানেল (admin.html + js/admin.js — 154KB)
├── js/                   ← ~100 ফিচার মডিউল
├── functions/            ← Cloud Function AI proxy
├── proxy/                ← Cloudflare Worker AI proxy
├── tts-server/           ← Python TTS সার্ভার
├── data/                 ← স্ট্যাটিক কোশ্চেন ব্যাংক (class9–12)
├── papers/               ← বোর্ড প্রশ্ন PDF + manifest.json
├── scripts/              ← scrape/seed/build পাইপলাইন
├── db/, supabase-backup/ ← Supabase স্কিমা + অ্যাডাপ্টার
├── firestore.rules       ← Firestore সিকিউরিটি রুলস (মূল নিরাপত্তা)
├── database.rules.json   ← RTDB রুলস (লিগ্যাসি)
└── sw.js                 ← Service Worker
```

---

## ২. ডেটাবেস ডিজাইন (Firestore)

### ২.১ Root Collections

| Collection | অ্যাক্সেস (firestore.rules) | উদ্দেশ্য |
|---|---|---|
| `users/{uid}` | owner/admin | প্রোফাইল: name, email, plan, trialEnd, credits, apiKeys, parentPhone ইত্যাদি |
| `users/{uid}/notes` | owner (সবসময় খোলা) | নোট — ফ্রি ফিচার |
| `users/{uid}/syllabus, tasks, mindmaps, study_logs, quiz_attempts, qb_bookmarks, active_syllabus` | owner, write = plan-gated | প্রিমিয়াম ডেটা |
| `users/{uid}/shared_with_me, shared_mindmaps, shared_resources, notifications` | create = যেকোনো signed-in | ইনবক্স/শেয়ারিং |
| `public_profiles/{uid}` | signed-in read, owner write | লিডারবোর্ড, লাইভ রুম, ফ্রেন্ড সার্চ |
| `system/{doc}`, `system_client/{doc}` | public / signed-in read, admin write | সেটিংস + ক্লায়েন্ট কী (imgbb, YouTube) |
| `system_private/{doc}` | admin only | AI provider keys, PIN hash, turnstileSecret, groqKey |
| `packages/{pkg}` | public read | প্যাকেজ কার্ড (promoCode সহ) |
| `payment_requests/{id}` | owner+admin | Bkash/Nagad ম্যানুয়াল পেমেন্ট |
| `referrals/{code}` | public read | রেফারেল কোড → uid |
| `user_ids/{id}` | public read | ইউনিক ইউজার আইডি → uid |
| `schools, school_requests` | public/admin | স্কুল রেজিস্ট্রি |
| `friend_requests, friendships, buddy_requests, webrtc` | participants | সোশ্যাল গ্রাফ + WebRTC সিগন্যালিং |
| `direct_messages/{id}` | participants (uids) | DM — `uids array-contains` কুয়েরি |
| `study_groups/{id}` | signed-in read | গ্রুপ (memberIds ডিফ = join/leave) |
| `class_communities/{classKey}/messages, /members` | signed-in | ক্লাস কমিউনিটি চ্যাট |
| `quiz_campaigns/{id}` | public read | মাসিক কুইজ (**প্রশ্নের উত্তরসহ!**) |
| `quiz_attempts/{id}` (top-level) | owner read, admin update | কুইজ স্কোর |
| `study_logs/{id}` (top-level) | admin read | গ্লোবাল অ্যানালিটিক্স |
| `notices, admin_features, admin_notifications, resources, question_banks` | admin write, user read | অ্যাডমিন কনটেন্ট |
| `devices/{deviceId}` | user self-add | ডিভাইস-ভিত্তিক ফ্রি-ক্রেডিট লিমিট (সফট) |
| `password_reset_requests/{id}` | create: anyone | পাসওয়ার্ড রিসেট রিকোয়েস্ট লগ |
| `emergency_skips/{id}` | owner+admin | স্কুল ওয়ারের ইমার্জেন্সি স্কিপ |
| `duels/{id}` | playerIds | নলেজ ডুয়েল স্টেট |
| `syllabus_questions/{cacheId}` | signed-in read, plan write | AI প্রশ্ন ক্যাশ |
| `textbook_db/{docId}` | signed-in read, admin write | NCTB রেফারেন্স ডেটাবেস |
| `question_bank_meta/{docId}` | signed-in read, admin write | ব্যাংক ভার্সন মেটা |
| `support_chats/{msgId}` | owner+admin | সাপোর্ট চ্যাট (অ্যানোনিমাসও পারবে) |
| `focus_sessions/{id}` | owner read, plan create | ফোকাস সেশন লগ |
| `notif_disable_requests`, `user_rev_settings`, `user_tasks` | owner+admin | মিসক. |
| `system/announcements_queue/pending/{doc}` | user update sentAt only | পুশ অ্যানাউন্সমেন্ট |

### ২.২ প্ল্যান গেট (hasActivePlan) — firestore.rules:61-72

```js
function hasActivePlan(uid) {
  let doc = get(/databases/$(database)/documents/users/$(uid));
  return d != null && (
    ('trialEnd' in d && d.trialEnd > now) ||
    ('rewardEnd' in d && d.rewardEnd > now) ||
    (plan == 'pro'|'paid' && (!planEnd || planEnd > now)));
}
```

**কেন্দ্রীয় সিকিউরিটি ডিজাইন ফ্লো:** trial শেষে প্রিমিয়াম collection-এ write ব্লক হয়; নোট ও পেমেন্ট সবসময় খোলা। অ্যাডমিন পেমেন্ট অ্যাপ্রুভ করে `users/{uid}`-এ `{plan:'paid', planEnd}` সেট করে।

### ২.৩ Supabase ভ্যারিয়েন্ট (নিষ্ক্রিয়)

- `db/supabase-schema.sql` (৯৩ লাইন): `question_bank_meta`, `quiz_attempts`, `qb_bookmarks` + RLS
- `supabase-backup/supabase-schema.sql` (২৮৮ লাইন): জেনেরিক `kv(scope, doc, data jsonb)` টেবিল + PL/pgSQL `kv_can_*` ফাংশন যা firestore.rules মিরর করে
- `supabase-init.js`: Firestore-compatible অ্যাডাপ্টার, **আনন কী placeholder** (`REPLACE_WITH_SUPABASE_ANON_KEY`) — `index.html` কখনোই `window.__SUPABASE__` সেট করে না → **লাইভে নিষ্ক্রিয়**

### ২.৪ RTDB (লিগ্যাসি, এখনো ডিপ্লয়ড)

`database.rules.json` — `users/`, `direct_messages/`, `duels/`, `friend_requests/`, `friendships/`, `system_private/` ইত্যাদি। একই অ্যাডমিন ইমেইল allow-list। ব্যবহার এখন নেই বললেই চলে — অ্যাটাক সারফেস হিসেবে রয়েছে।

---

## ৩. ফিচার সিস্টেম — লজিক বিশ্লেষণ

### ৩.১ অথেনটিকেশন (`js/auth.js`)

1. Email/password বা Google sign-in; `onAuthStateChanged` → banned চেক → `ensureProfile()`
2. New user → profile seed: `trialEnd = now + 15 দিন` (admin ট্রায়াল টগল থাকলে), `credits` (ডিভাইস-লিমিটে বাঁধা থাকলে 0), `referralCode`
3. ডিভাইস সফট-লিমিট: `localStorage.sb-device-id` → `devices/{deviceId}.uids` — ৩য়+ অ্যাকাউন্টে ফ্রি AI ক্রেডিট বন্ধ (`auth.js:119-131`)
4. Anonymous sign-in শুধু সাপোর্ট চ্যাটের জন্য (`auth.js:49-53`) — profile skip
5. লগইন থ্রটল (৫ ব্যর্থ → ৫ মিনিট লক) — **localStorage-এ** (`auth.js:565-584`)

### ৩.২ AI সিস্টেম (`js/ai.js` + proxy + functions)

**কী সিলেকশন প্রায়োরিটি:**
1. ইউজারের নিজের key (Settings → profile.apiKeys)
2. Admin key (`system_client/aikey`) — শুধু `useAdminKeyForAll` + aiPlan !== 'full' হলে
3. Admin proxy (Cloud Function `aiChatProxy` বা Cloudflare Worker) — trial/credit/full প্ল্যান

**Flow:** `aiChat()` → quota চেক → proxy হলে `chatViaProxy` (Bearer idToken) → ব্যর্থ হলে নিজের key → সরাসরি Gemini/Groq call। Vision (OCR) একই প্যাটার্নে।

**functions/index.js:** idToken verify → `system_private/settings` থেকে provider chain → Gemini/Groq/OpenAI call → প্রতি কল ১ credit কাটে। **ক্রেডিট চেক:** `credits <= 0` হলে 402। Credits না থাকা user (undefined) → ব্লকও না, কাটও না।

### ৩.৩ মনিটাইজেশন ফ্লো

```
Free user → trialEnd (15d) → ট্রায়াল শেষে premium write ব্লক (rules)
        ↓
Payment: user → payment_requests (trxId) → ADMIN approve
        → admin users/{uid} আপডেট: plan:'paid', planEnd, packageId, aiPlan, credits
        → (রেফারেল হলে referrer-এ rewardEnd +30d)
        → hasActivePlan() → premium সবকিছু খুলে যায়
```

`quota.js` — ক্লায়েন্ট-সাইড `effectivePlan()/hasFeature()/featureOn()`; `featureOn` ডিফল্ট `true` (permissive) যখন config নেই। প্ল্যান গেটের **আসল প্রয়োগ Firestore rules-এ**, UI গেট কসমেটিক।

### ৩.৪ কুইজ সিস্টেম (`js/quiz.js`, `qb-class.js`, `ai-questions.js`)

- কুইজ ক্যাম্পেইন ডক `quiz_campaigns/{id}` — `questions[].a` = সঠিক উত্তরের index **ক্লায়েন্টের কাছে যায়**
- ক্লাস ব্যাংক: `data/class{9..12}/*.json` — `q.ans` প্লেইনটেক্সটে; localStorage-এ ক্যাশ
- স্কোরিং ও স্কোর রাইট (quiz_attempts) — সম্পূর্ণ ক্লায়েন্ট-সাইড
- `qb-class.js:39` — `fsBlocked` ল্যাচ: একবার Firestore error হলে পুরো সেশন FS বন্ধ

### ৩.৫ সোশ্যাল (`friends.js`, `dm.js`, `community.js`, `live-rooms.js`, `knowledge-duels.js`, `study-buddy.js`)

- DM: `direct_messages/{id}` — `uids: [me, friend]`, query `uids array-contains me`
- DM লিমিট (daily/monthly) — ক্লায়েন্ট-সাইড `getDocs` গণনা + **offline bypass** (`dm.js:283`)
- Duels: `duels/{id}` — host create, playerIds-এ থাকলে update; স্কোর ক্লায়েন্ট-সাইড লেখা
- Live rooms: `public_profiles`-এ presence ফিল্ড ক্লায়েন্ট-সাইড
- WebRTC img: `webrtc/{id}` সিগন্যালিং ডক (SDP/ICE টেক্সট)

### ৩.৬ গেমিফিকেশন (`gamification.js`, `points.js`, `leaderboard.js`, `streak*.js`, `war-engine.js`)

- XP: `public_profiles`-এ increment — ফোকাস সেশন, নোট ডিফ, কুইজ, টাস্ক ইভেন্ট থেকে (সব ক্লায়েন্ট-অ্যাসার্টেড)
- Points: **localStorage-ই source of truth** (`points.js:24`)
- Streak/offline minutes: ক্লায়েন্ট ইভেন্ট → localStorage queue → Firestore flush
- School Wars: দলভিত্তিক পয়েন্ট, emergency_skips (reason 20-1500 chars), রিস্ক স্কোর — rules-এ validate

### ৩.৭ PWA/অফলাইন

- `sw.js`: cache-first + background refresh; SHELL প্রিক্যাশ তালিকা **ম্যানুয়াল** (নতুন মডিউল বাদ)
- `idb-storage.js`: DB_VERSION=1, শুধু `note-images`+`syllabus-files` স্টোর — **`offline-warrior` স্টোর তৈরি হয়ই না** কিন্তু `offline-warrior.js:58` সেখানে লেখার চেষ্টা করে (সাইলেন্ট fail)
- Firestore native offline sync ব্যবহার হয়

### ৩.৮ TTS (`tts-server/server.py` + `js/tts.js`)

FastAPI + edge-tts (ফ্রি)। Bearer token (ঐচ্ছিক), in-memory rate limit 30/min/IP, MAX_CHARS 4000। `js/tts.js` ইউজার-কনফিগারড সার্ভার URL-এ কল; fallback = Web Speech API।

---

## ৪. সিকিউরিটি থ্রেট ও লুপহোল (র‍্যাংকড)

### 🔴 CRITICAL

| # | সমস্যা | অবস্থান | শোষণ পথ | ফিক্স |
|---|---|---|---|---|
| C1 | **Admin অ্যাকাউন্ট অটো-ক্রিয়েশন** — অ্যাডমিন লগইন ফর্মে `auth/user-not-found` পেলে প্যানেল নিজেই `fztech166@gmail.com` অ্যাকাউন্ট **যেকোনো পাসওয়ার্ডে তৈরি করে ফেলে**। অ্যাডমিন আগে না থাকলে (নতুন ডিপ্লয়), **প্রথম ভিজিটরই অ্যাডমিন** হয়ে যায়। | `admin/js/admin.js:106-117` | `/admin/admin.html` খুলে → যেকোনো পাসওয়ার্ড → অ্যাকাউন্ট নিজে তৈরি → সম্পূর্ণ কন্ট্রোল | Firebase Console থেকে ম্যানুয়ালি অ্যাডমিন অ্যাকাউন্ট তৈরি করুন; auto-create সম্পূর্ণ বাদ দিন |
| C2 | **Admin AI কী ব্রাউজারে লিক** — `system_client/aikey` (Gemini/Groq admin key) **যেকোনো signed-in ইউজার পড়তে পারে** (`firestore.rules:223-226`), এবং `ai.js:21-23, 312-313` তা সরাসরি ব্রাউজার fetch-এ ব্যবহার করে (Gemini `?key=` URL-এ → history/proxy log-এ যায়)। `ai.js:2-3` কমেন্ট নিজেই বলে "must never be exposed to browser" — বাস্তবে উল্টো। imgbbKey/youtubeApiKey/ttsServerToken-ও ক্লায়েন্টে যায়। | `admin.js:988-1009`, `ai.js:21-23, 312-313`, `system-settings.js:49-54`, rules:223-226 | ফ্রি অ্যাকাউন্ট খুলে → network tab বা Firestore থেকে key তুলে → admin-এর খরচে unlimited AI | সব key শুধু সার্ভার-সাইড (proxy); `system_client/aikey` ডক মুছুন; rules-এ শুধু hash প্রকাশ করুন |

### 🟠 HIGH

| # | সমস্যা | অবস্থান | শোষণ পথ | ফিক্স |
|---|---|---|---|---|
| H1 | **প্ল্যান গেট সম্পূর্ণ বাইপাসযোগ্য** — `hasActivePlan()` rules **সেই users/{uid} ডক পড়ে যেটা ইউজার নিজেই এডিট করতে পারে** (isAdmin ফিল্ড ছাড়া সব অনুমোদিত)। ইউজার নিজের `trialEnd`/`planEnd` ভবিষ্যতে সেট করলেই সব প্রিমিয়াম write খুলে যায়। | rules:61-72, 80-85, 91-98 | `updateDoc(users/{uid}, {trialEnd: 4102444800000})` → সব unlock | plan/reward ফিল্ড rules-এ user-write ব্লক; অথবা signed plan ডক (admin-only write) ব্যবহার |
| H2 | **সব কুইজ উত্তর ক্লায়েন্ট-ভিজিবল + স্কোর ক্লায়েন্ট-রাইট** — ক্যাম্পেইন ডকে `a` (সঠিক index), স্ট্যাটিক ব্যাংকে `ans`, এমনকি DOM-এ `data-correct` (`ui.js:417`)। স্কোর, XP, লিডারবোর্ড, সার্টিফিকেট — সব forgeable। | `quiz.js:120-144`, `qb-class.js:369,501,831`, `ui.js:417`, `ai-questions.js:396` | DevTools দিয়ে স্কোর এডিট → র‍্যাঙ্ক/সার্টিফিকেট ফার্মিং | স্কোর সার্ভার-সাইড রিস্কোর/ভেরিফাই; উত্তর এনক্রিপ্ট বা সার্ভার-সাইড grading |
| H3 | **Monetization স্টেট সম্পূর্ণ ক্লায়েন্ট-কন্ট্রোলড** — credits (localStorage-মিরর), apiUsage কাউন্টার, trial ঘড়ি (ডিভাইস clock), device-limit (`sb-device-id` ক্লিয়ার = রিসেট), DM লিমিট (offline bypass), points (localStorage)। সব ফার্মযোগ্য। | `ai.js:28-32,361-382`, `auth.js:106-131,565-584`, `dm.js:268-284`, `points.js:24` | ক্লক পেছানো, localStorage ক্লিয়ার, ইভেন্ট ফার্মিং | সার্ভার-সাইড টাইমস্ট্যাম্প, সার্ভার-ভেরিফাইড সেশান/স্কোর, rate limit |
| H4 | **XSS-এর মাঝারি সারফেস** — ~২৫টি href/src রেন্ডার সাইটে `esc()` ব্যবহৃত (কোশ্চেন: `escUrl()` মাত্র ১ জায়গায়, `app.js:515`), যেখানে `escUrl()` `javascript:`/`data:` ব্লক করে কিন্তু `esc()` করে না। অ্যাডমিন ডক/কনটেন্ট আপস হলে `javascript:` লিংক ক্লিকযোগ্য। | `community.js:24,49`, `payment.js:110`, `notices.js:202`, `onboarding-tour.js:69,206`, `resources.js:97,259`, `admin-features.js:61`, `dm.js:187` | অ্যাডমিন প্যানেল কম্প্রমাইজ হলে রেডি XSS | সব href/src-এ `escUrl()` + scheme allow-list (http/https শুধু) |
| H5 | **Admin PIN শুধু UX** — PBKDF2 verify ব্রাউজারে, unlock স্টেট `sessionStorage.adminPinVerified` → DevTools দিয়ে সেট করা যায়। আসল গেট কেবল Firebase email/password। | `admin.js:76-94,128-148,217` | `sessionStorage.setItem('adminPinVerified','...')` → গেট স্কিপ | PIN চেক সার্ভার-সাইড (Cloud Function) বা অতিরিক্ত ফ্যাক্টর |

### 🟡 MEDIUM

| # | সমস্যা | অবস্থান | নোট |
|---|---|---|---|
| M1 | **No CSP / security headers / rewrites** — `firebase.json`-এ শুধু no-cache headers; hosting root = পুরো রিপো (`public: "."`), admin/ public-এ ডিপ্লয়। XSS পেলে full account access। | `firebase.json:43-68` | CSP হেডার + `X-Frame-Options` + `Referrer-Policy` যোগ করুন |
| M2 | **ফাংশন প্রক্সিতে rate limit/সাইজ লিমিট নেই** — যেকোনো authenticated user unlimited কল করতে পারে; credit=undefined হলে চেকই হয় না; প্রতিটি কল ১ credit যেকোনো সাইজে। | `functions/index.js:77-139` | per-user rate limit, max_tokens/input clamp, credits ডিফল্ট 0 |
| M3 | **স্প্যাম ভেক্টর** — যেকোনো signed-in user কারো `shared_with_me`, `notifications`, `direct_messages`, `duels`, `buddy_requests`, `friend_requests`-এ তৈরি করতে পারে (rules-এ শুধু uid-match, rate limit নেই)। | rules:108-129, 368-380, 525-552 | Rate limiting layer (Firestore timestamp check বা functions) |
| M4 | **TTS token localStorage + ইউজার-কনফিগারড URL** — `sb-tts-server-token` প্লেইনটেক্সটে localStorage; ম্যালিশিয়াস URL দিলে token চুরি। CORS default `*`। | `settings.js:201`, `tts.js:317-322`, `server.py:58-62` | টোকেন শুধু https সার্ভার allow-list; CORS সীমিত |
| M5 | **`password_reset_requests` create: true** — email স্প্যাম লগ + রিসেট রিকোয়েস্ট flood। | rules:483-486 | rate limit / captcha |
| M6 | **`system_client` পুরনো ডক থেকে imgbb/youtube key** — ব্রাউজারে fetch, referrer/network tab-এ। | `profile.js:51`, `youtube-courses.js` | imgbb key-কে domain-restrict, YouTube key-কে referer/IP restrict; ভবিষ্যতে server-side upload |
| M7 | **RTDB এখনো ডিপ্লয়ড** — `database.rules.json`-এ `referrals`/`user_ids` read:true; কিছু শাখা অ্যাপ-কভারেজের বাইরে। | `database.rules.json`, `firebase.json:10-12` | RTDB ব্যান্ড করুন (Firebase Console) |
| M8 | **Supabase ফোল্ডারে ফায়ারবেস প্রজেক্ট ref** — `export-firebase-data.mjs`-এ `focosmood` default projectId; উল্টো project-এ ডেটা এক্সপোর্টের ঝুঁকি। | `supabase-backup/supabase-tooling/export-firebase-data.mjs:38` | Env-ভিত্তিক projectId বাধ্যতামূলক |

### 🟢 LOW / রোবাস্টনেস

| # | সমস্যা | অবস্থান |
|---|---|---|
| L1 | `offline-warrior` IndexedDB store কখনো তৈরি হয় না — write সবসময় fail (সাইলেন্ট) | `idb-storage.js:11` vs `offline-warrior.js:58-61` |
| L2 | `fsBlocked` ল্যাচ — এক নেটওয়ার্ক এররেই পুরো সেশান Firestore বন্ধ, attempts/bookmarks চুপচাপ localStorage-তে পড়ে যায় | `qb-class.js:39,221,367,392` |
| L3 | SW precache তালিকা ম্যানুয়াল — `streak-wars`, `knowledge-duels`, `war-engine` ইত্যাদি প্রিক্যাশে নেই; অফলাইন first-visit ব্যর্থ | `sw.js:14-65` |
| L4 | অ্যাপ রুটে ChatGPT ইমেজ, `.ipynb`, test ফাইল, `.megaignore`-এর মতো মিস-ফাইল ডিপ্লয় হয় | `firebase.json` ignore তালিকা |
| L5 | Referral কোড `Math.random` (CSPRNG নয়); DM-এ inline onclick; শেয়ার append-only কনভেনশন ক্লায়েন্ট-সাইড | `store.js:136`, `dm.js:187`, rules:108-118 |
| L6 | Admin প্যানেলে ইউজার-কনটেন্ট (সাপোর্ট মেসেজ, নোট, emergency reason) রেন্ডারিং escaping-এর জন্য **অডিট করা হয়নি** — অ্যাডমিন-কনটেক্সট stored XSS-এর ঝুঁকি পরীক্ষা করুন | `admin/js/admin.js` (পুরো) |
| L7 | ফাংশন প্রক্সি CORS `*` | `functions/index.js:78` |

---

## ৫. ইতিবাচক দিক (যা ঠিক আছে)

1. ✅ **XSS-এর বিরুদ্ধে শৃঙ্খলা** — ইউজার-কনটেন্ট রেন্ডারে `esc()` সর্বত্র; কোনো `eval()`/`document.write()`/`new Function()` নেই
2. ✅ **`isAdmin` ফিল্ড self-set করলে কিছুই হয় না** — অ্যাডমিন গেট একমাত্র Firebase email-token allow-list (rules:32-36)
3. ✅ **isBanned** প্রতিটি user-কন্ট্রোলড write-এ checked
4. ✅ **প্রক্সি ডিজাইন** — Cloud Function + Cloudflare Worker দুটোই idToken verify করে; admin keys-এর জন্য সঠিক আর্কিটেকচার (কেবল বাস্তবায়ন লিক করছে)
5. ✅ **পেমেন্ট অ্যাপ্রুভাল admin-সাইড** — একমাত্র সত্যিকারের সার্ভার-এনফোর্সড path
6. ✅ অ্যাডমিন-push অ্যানাউন্সমেন্ট `sentAt`-অনলি update রুল; `textbook_db`-তে ফিল্ড-কন্ট্রাক্ট ভ্যালিডেশন; `school_requests`/`emergency_skips`-এ ফিল্ড allow-list
7. ✅ কোশ্চেন ব্যাংক স্ট্যাটিক ফাইল (Firestore খরচ বাঁচানো) — ডিজাইন ভালো

---

## ৬. প্রস্তাবিত ফিক্স প্ল্যান (প্রায়োরিটি অর্ডারে)

**অবিলম্বে (এই সপ্তাহ):**
1. `admin.js:106-117`-এর auto-create সরান; Firebase Console থেকে অ্যাডমিন অ্যাকাউন্ট নিশ্চিত করুন
2. `system_client/aikey` + `system_client/keys` থেকে key সরান; `system_client` rules-এ শুধু non-secret অনুমতি দিন; AI সব proxy দিয়ে
3. rules-এ `users/{uid}` আপডেট থেকে `trialEnd/planEnd/rewardEnd/plan/packageId/aiPlan/credits` বাদ দিন (admin-only) — H1 বন্ধ

**শীঘ্রই (এই মাস):**
4. কুইজ স্কোর সার্ভার-সাইড রিস্কোর (functions) বা scoring token; UI থেকে `data-correct` সরান
5. `firebase.json`-এ CSP + security headers; অ্যাডমিন প্যানেল আলাদা subpath+headers
6. ফাংশন প্রক্সিতে rate limit + input clamp + credit ডিফল্ট
7. সব URL রেন্ডার সাইটে `escUrl()`

**পরবর্তী:**
8. XP/points/study-time/streak সার্ভার-সাইড ভেরিফিকেশন (ইভেন্ট স্ট্রাকচার), ডিভাইস-লিমিট সার্ভার-সাইড (idToken-এ device claim)
9. `offline-warrior` IDB store ফিক্স, `fsBlocked` ল্যাচ রিমুভ, SW precache অটো-জেনারেট
10. RTDB ব্যান, Supabase ফোল্ডার ক্লিনআপ/নথিভুক্তি, অ্যাডমিন-panel অ্যাডিশনাল অডিট

---

## ৭. এক-লাইন সারাংশ

> **ভালো:** আর্কিটেকচার সুষ্ঠু (প্রক্সি, rules-ভিত্তিক plan gate, escaping শৃঙ্খলা)।
> **দুর্বল:** অ্যাডমিন বুটস্ট্র্যাপ (C1) ও admin-key লিক (C2) অবিলম্বে ঠিক করতে হবে; **সব monetization/anti-cheat ক্লায়েন্ট-ট্রাস্টেড** (H1-H3) যার মানে trial/credit/quiz/leaderboard সব ফার্মযোগ্য — সার্ভার-সাইড এনফোর্সমেন্ট ছাড়া এগুলো কেবল "cosmetic gate"।
