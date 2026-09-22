# ২ndBrain v3 — Web App সম্পূর্ণ প্ল্যান (Bangla)

> Status: **Active Development** · Version 3.0 · সেপ্টেম্বর ২০২৬
> App: PWA + Firebase (Hosting, Firestore, Auth, Functions) · Offline-first

---

## ১. বর্তমান অবস্থা

| মডিউল | অবস্থা | মন্তব্য |
|---|---|---|
| Notes / Note Images | ✅ সম্পন্ন | IndexedDB blob + Firestore metadata, offline-first |
| Projects Management | ✅ | Planning→Active→On Hold→Completed→Archived |
| Task Management (PRD §12) | ✅ | Priority, Due Date, Project link, Tags, Status (Todo/In Progress/Completed/Archived), Filter tabs, Start button |
| Folders & Collections | ✅ | CRUD + color, note picker, sidebar filter, count sync |
| AI Brain | ✅ | Cross-context prompt (notes/syllabus/projects/tasks), chat + note chat |
| AI Conversations sync | ✅ | Firestore mirror `users/{uid}/conversations/ai_history`, cross-device merge by `mid` |
| AI Prompt Templates (PRD §6.8) | ✅ | ৮টা PRD category + ৪টা study helper, category chips, save modal |
| Unified Search | ✅ | Notes/Tasks/Files/Projects/Conversations + tags |
| File Upload & Management | ✅ | IndexedDB blob + Firestore metadata, 25MB cap, drag-drop, thumbnails |
| Storage Quota warning | ✅ | `navigator.storage.estimate()` — ৭৫% amber / ৯০% red banner + cleanup advise |
| Favorites & Archive | ✅ | |
| Notifications Center | ✅ | |
| Usage Statistics / Dashboard | ✅ | |
| Quick Actions bar (PRD ৬.১) | ✅ | Add Task / Upload File যোগ হয়েছে |
| Account Deletion | ✅ | Cloud Function `deleteAccount` + Danger Zone + confirm-typing modal |
| Gamification / Streak / XP | ✅ | |
| Social (friends, groups, duels) | ✅ | |
| Scheduler / Syllabus / Revision | ✅ | |
| Focus Timer / Study Logs | ✅ | |

**মোট গ্যাপ: ০** (১০টি PRD feature + ৬টি gap item সব done)

---

## ২. ডিপ্লয়মেন্ট সেটআপ (একবার করতে হবে)

### ২.১ আগে যা লাগবে
```bash
npm install -g firebase-tools
firebase login
firebase use second-brain-64aa3   # বা .firebaserc-এ set থাকলে skip
```

### ২.২ ডিপ্লয় অর্ডার (এই ORDER মানতে হবে — শেষ ২টা মিস করলে new feature ব্রেক করবে)
```bash
# ১। Security Rules (প্রথমে — নতুন conversations rule + admin functions)
firebase deploy --only firestore:rules

# ২। Cloud Functions (শুধু নতুন function দ্রুত পরীক্ষা করতে চাইলে)
firebase deploy --only functions:deleteAccount

# ৩। Hosting (PWA files — শেষে, কারণ পুরনো ক্যাশ ট্রিকরি)
firebase deploy --only hosting
```
> ⚠️ `firebase deploy` একসাথে সব deploy করলেও হবে, তবে নিচের ২টা ভুলে গেলে হবে না:
> 1. `firestore.rules`-এ **conversations** subcollection rule যোগ হয়েছে
> 2. **`deleteAccount`** function (functions/index.js) deploy করা

### ২.৩ Admin Panel-এর rules sync
- `admin/admin.html`-এ একটা "Deploy Rules" বাটন আছে (প্রজেক্ট কনভেনশন) — কোনো rules edit করলে console থেকেও একই /push করতে হবে।

### ২.৪ Indexes
`firestore.indexes.json` — নতুন compound query (যেমন `user_tasks` orderBy) deployed হলে single-field indexes auto হয়; scroll/FAILED status নজরে রাখুন।

---

## ৩. টেস্টিং চেকলিস্ট (মডিউল ভিত্তিক)

### ৩.১ Core
- [ ] Login/Register (Email + Google) + password reset
- [ ] Guest mode → anonymous support chat
- [ ] Offline: ফাইল/net বন্ধ করে PWA reload — আগের section-এ ফেরা + notes পড়া
- [ ] Service worker cache update (ইউজারকে force-refresh)

### ৩.২ Tasks (PRD §12)
- [ ] Priority/Date/Project/Tags দিয়ে add
- [ ] Status flow: ▶ Start → In Progress → Done → Completed
- [ ] Filter tabs + priority filter একসাথে কাজ
- [ ] Overdue badge লাল, today/tomorrow/N দিন
- [ ] Daily repeat reset পরের দিন

### ৩.৩ Conversations sync (cross-device)
- [ ] ডিভাইস A-তে চ্যাট → ডিভাইস B (সেম লোকালস্টোরেজ না)-তে panel খুললে message আসে
- [ ] দুটো ডিভাইস offline-এ আলাদা কথা → merge done (duplicate হয় না — `mid`)
- [ ] Fresh device (খালি localStorage) → cloud copy মুছে যায় না

### ৩.৪ Files + Quota
- [ ] ২৫MB-র বেশি reject
- [ ] Upload → download → delete (blobও মুছে যায়)
- [ ] Quota: একটা large file fill করে ৯০% দেখানো + banner firm ও dismiss
- [ ] Drag & drop + thumbnail preview

### ৩.৫ Templates (PRD §6.8)
- [ ] ৮ category chip filter + search
- [ ] Save template → new category dropdown → reuse
- [ ] Delete user template (default-এর delete বাটন নেই)

### ৩.৬ Account Deletion
- [ ] ভুল email টাইপ করলে button disabled
- [ ] ভুল password → error
- [ ] সঠিক confirm → account + auth user মুছে যায়; login আবার করতে হয়
- [ ] Firestore console-এ `users/{uid}` গাছ + user_tasks + public_profiles মুছে গেছে
- [ ] `payment_requests` থাকলে `accountDeleted:true`

### ৩.৭ Admin
- [ ] Admin panel-এ support chat, package approve, rules deploy কাজ করছে
- [ ] Firestore rules: অন্যের data পড়া/লেখা blocked (নিচে §৪)

---

## ৪. সিকিউরিটি ভেরিফিকেশন

| চেক | অবস্থা |
|---|---|
| Firestore rules সব সংবেদনশীল collection-এ আছে | ✅ |
| `hasActivePlan()` plan-gate (premium writes) | ✅ |
| файл blobs সার্ভারে নেই (metadata only) | ✅ |
| AI keys শুধু `/system_private` + server proxy | ✅ |
| `isAdmin` field client-side set করা যায় না | ✅ |
| Anonymous login শুধু support chat-বিস্তারিত | ✅ |
| Cloud Function: token verify + rate limit | ✅ |
| Account delete শুধু নিজেরই (token uid == target) | ✅ |

**လျ Factory বাকি:** App Check (optional) — production-এ add করলে AI proxy/function-এ কার্যকর protect।

---

## ৫. পারফরম্যান্স / UX অপটিমাইজেশন

- [ ] `navigator.storage.estimate()` read-টা শুধু files view/ট্রিগারে (24/7 নয়) — বর্তমানে okay
- [ ] Firestore reads কমানো: dashboard-এ aggregate বনাম অনেক docs
- [ ] Chat history 40 messages cap — ইতোমধ্যে bounded ✅
- [ ] Lazy-load heavy modules (`import()` pattern — ইতোমধ্যে ব্যবহার আছে)
- [ ] Images: imgbb upload (সংকোচন) — Settings থেকে
- [ ] PWA install banner + Update available notification
- [ ] Lighthouse audit (desktop + mobile) — target ≥ 90 performance

---

## ৬. রিলিজ / রোলআউট

1. **Internal build** — developer-এ QA (§৩ চেকলিস্ট) + Lighthouse
2. **Beta** — ১০-২০ জন রিয়েল ইউজার → feedback fixes (২ সপ্তাহ)
3. **Staging** — `second-brain-64aa3`-এর staging subdomain হলে rules test
4. **Public release** — চালু করা হলে:
   - config active → packages visible
   - Referral / monetization শেষ পরীক্ষা
   - Google Play/Chrome install + Apple touch icon check

---

## ৭. পোস্ট-লঞ্চ মনিটরিং

- **Admin panel** — поддержка chat, payment requests, announcements, duplicate account checks
- **Firebase console** — crash reporting, performance traces, Firestore usage/cost (ব্রেকপয়েন্ট: প্রতি ইউজার doc count)
- **Function logs** — `deleteAccount`, `aiChatProxy` error rate
- **Usage-stats** — active user, study seconds, streak, 파일 usage
- **Quota watch** — per-user IndexedDB usage trend

---

## ৮. ICEBOX / ভবিষ্যৎ (অ-প্রয়োজনীয়)

- Browser Extension (PRD §6.9) — page/seltext/link save → project
- AI semantic search (vector)
- Conversations in admin analytics
- Scheduler auto-notif graduation
- Flutter (/ Dridhota) অ্যাপর জন্য PRD হাতে ভিত্তিতে পোর্ট

---

## ৯. দলের নিয়ম (এই সেশনে follow করা হবে)

- সব user-data per-user isolated: `users/{uid}/...`
- Firebase v10 compat SDK ব্যবহার
- Offline-first: blob → IndexedDB, metadata → Firestore
- Safe/optimistic UI + `serverTimestamp()` for docs
- Rules/Admin panels একই file থেকে sync (console-এ নয়)
- Test: `node --check <file>.js` (প্রতিটি edit-এর পর) + real-browser QA