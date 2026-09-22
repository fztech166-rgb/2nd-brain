/* sw.js â€” PWA service worker.
 * Strategy:
 *   - HTML navigation â€” CACHE-FIRST with background refresh. Serving the
 *     cached shell immediately (even online) means the app paints on the
 *     very first frame â€” no white blank page. Freshness is guaranteed by
 *     the versioned cache name (bumped per deploy); the network refresh
 *     keeps the cache warm for the next visit.
 *   - Other same-origin static assets (CSS/JS/icons) â€” cache-first with
 *     background refresh.
 *   - cloud data traffic â€” never intercepted; the SDK handles its own offline cache.
 *   - Other GET requests (fonts, prayer API) â€” network-first with cache fallback.
 */
const CACHE = 'sb-shell-v43';
const SHELL = [
  './',
  './index.html',
  './admin/admin.html',
  './manifest.webmanifest',
  './assets/icons.svg',
  './assets/logo.svg',
  './assets/icon-192.png.svg',
  // Supabase client (pinned immutable versioned CDN URL) â€” pre-cached so the
  // app boots OFFLINE without waiting for the network. The +esm entry pulls
  // further chunk files at runtime; those get cached by the jsdelivr branch
  // below on first load.
  './css/base.css','./css/components.css','./css/auth.css','./css/dashboard.css',
  './css/notes.css','./css/prayer.css','./css/focus.css','./css/syllabus.css',
  './css/chat.css','./css/saas.css','./css/social.css',  './css/mobile-ui.css','./css/mind-map.css','./css/calendar.css','./css/responsive.css','./css/ux.css',
  './css/perf.css',
  './js/app.js','./js/backend-init.js','./js/firebase-init.js','./js/store.js','./js/toast.js','./js/theme.js',
  './js/offline.js','./js/pwa.js','./js/auth.js','./js/notes.js','./js/syllabus.js',
  './js/security.js',
  './js/tasks.js','./js/focus-timer.js','./js/prayer.js','./js/ai.js','./js/chat.js',
  './js/daily-target.js','./js/motivational-messages.js','./js/streak.js',
  './js/subjects.js',
  './js/voice.js','./js/ai-questions.js','./js/settings.js','./js/payment.js',
  './js/system-settings.js','./js/ui.js',
  './js/branding.js','./js/community.js','./js/packages.js','./js/quota.js','./js/referral.js',
  './js/notices.js','./js/profile.js',
  './js/admin-features.js','./js/api-usage.js','./js/class-community.js',
  './js/dashboard-previews.js','./js/dm.js','./js/friends.js','./js/leaderboard.js',
  './js/mobile-ui.js','./js/note-share.js','./js/quiz.js','./js/revision-notif.js',
  './js/schools.js','./js/study-tracker.js','./js/quota.js','./js/public-profile.js',
  './js/idb-storage.js','./js/note-images.js','./js/syllabus-ocr.js','./js/tts.js',
  './js/youtube-courses.js','./js/push-notifications.js','./js/push-notifications-enhanced.js','./js/onboarding-tour.js',
  './js/question-bank.js',
  './js/notifications.js','./js/webrtc-img.js',
  './js/mind-map.js','./js/calendar.js',
  './js/ux.js',
  './js/screen-time.js',
  './js/language.js','./js/perf.js','./js/pinned-sites.js','./js/resources.js','./js/user-activity.js',
  './js/qb-class.js',
    './js/qb-data-inline.js',
    './js/board-pdfs.js',
  // Static class question-bank data — pre-cached so class resources load
  // fully OFFLINE on the very first visit after install.
  './data/meta.json',
    './data/class10/physics.json',
    './data/class10/bangla-1st.json',
  // Board exam PDF library index.
  './papers/manifest.json',
  // pdf.js — local copy so syllabus OCR works OFFLINE and never depends on
  // a third-party CDN being reachable.
  './vendor/pdfjs/pdf.min.mjs',
  './vendor/pdfjs/pdf.worker.min.mjs',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  // Tolerant install: cache every file INDEPENDENTLY, and RETRY each failed
  // URL once â€” a single transient hiccup (e.g. one gstatic timeout) must
  // never permanently leave a file missing from the offline shell, or the
  // app cannot boot offline. allSettled keeps per-file results.
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(SHELL.map(async url => {
      for(let attempt = 1; attempt <= 2; attempt++){
        try {
          const res = await fetch(url, { cache: 'reload' });
          if(res.ok){ await cache.put(url, res); return; }
        } catch(err){ /* fall through to retry */ }
        if(attempt < 2) await new Promise(r => setTimeout(r, 400 * attempt));
      }
    }));
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  // Don't intercept backend data â€” let the SDK manage offline.

  // Supabase / CDN module chunks are immutable versioned URLs â€” cache-first
  // so offline boot never blocks on a network round-trip.
  if(url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'esm.sh'){
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(r => {
        if(r.ok){
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return r;
      }))
    );
    return;
  }

  // Same-origin â€” HTML is cache-first + background refresh (instant paint,
  // no white blank page while the network round-trip happens); other assets
  // are cache-first too.
  if(url.origin === self.location.origin){
    if(req.destination === 'document' || req.mode === 'navigate'){
      event.respondWith(
        caches.match(req).then(hit => {
          // Background refresh: pull the latest shell into this versioned
          // cache for the NEXT visit. Errors are safe to ignore â€” the
          // cache name is bumped per deploy, so stale shells never survive.
          const refresh = fetch(req).then(r => {
            if(r.ok){
              const copy = r.clone();
              caches.open(CACHE).then(c => c.put(req, copy));
            }
            return r;
          }).catch(() => null);
          if(hit){
            // Instant paint from cache; let the refresh run in background.
            refresh.catch(()=>{});
            return hit;
          }
          // First ever visit (nothing cached yet) â€” straight to network;
          // if that fails too, fall back to the cached shell entry.
          return refresh.then(r => r || caches.match('./index.html'));
        })
      );
      return;
    }
    event.respondWith(
      caches.match(req).then(hit => {
        if(hit){
          // Background refresh â€” only overwrite the cached copy with a
          // genuinely successful response (never cache errors/redirects).
          fetch(req).then(r => {
            if(r.ok){
              const copy = r.clone();
              caches.open(CACHE).then(c => c.put(req, copy));
            }
          }).catch(()=>{});
          return hit;
        }
        return fetch(req).then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return r;
        }).catch(() => {
          // Never substitute HTML for a script/style â€” browsers reject it
          // with a MIME error and the whole ES-module graph dies. A clean
          // 504 keeps the rest of the app alive.
          if(req.destination === 'script' || req.destination === 'style' || url.pathname.endsWith('.js')){
            return new Response('', { status: 504, headers: { 'Content-Type': 'text/plain' } });
          }
          return caches.match('./index.html');
        });
      })
    );
    return;
  }

// Cross-origin (fonts, prayer API) â€” network-first w/ cache fallback.
  event.respondWith(
    fetch(req).then(r => {
      if(r.ok && /^https?:$/.test(new URL(req.url).protocol)){
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return r;
    }).catch(() => caches.match(req))
  );
});

// Notification click â€” focus an existing app tab or open a new one.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const path = event.notification?.data?.path || '/';
  event.waitUntil(
    self.clients.matchAll({ type:'window', includeUncontrolled: true }).then(list => {
      for(const c of list){
        if(c.url.includes(self.location.origin)){
          c.focus();
          if(path && c.navigate) c.navigate(path).catch(()=>{});
          return;
        }
      }
      return self.clients.openWindow(path);
    })
  );
});

// Server-side Web Push / FCM payload support. This is what allows
// notifications to appear even when no app tab is open, as long as a backend
// sends a push message to the saved subscription/token.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch(e){ data = { title:'Second Brain', body:event.data?.text?.() || '' }; }
  const title = data.title || 'Second Brain';
  const opts = {
    body: data.body || '',
    icon: data.icon || './assets/logo.svg',
    badge: data.badge || './assets/logo.svg',
    tag: data.tag || 'sb-push',
    data: data.data || { path:data.path || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

