# Second Brain — Frontend Design System (সাইজ · ডিসপ্লে · ডিজাইন · এনিমেশন স্পেক)

> এই ডকুমেন্টটি হলো পুরো ফ্রন্টএন্ডের **একমাত্র রেফারেন্স স্পেক**। এখানে সব ভ্যালু সরাসরি
> বর্তমান `css/*.css` ফাইল থেকে নেওয়া (audit করা) হয়েছে — নতুন কোনো ফিচার বানালে বা
> CSS বদলালে এই টেবিলগুলোর সাথে মিলিয়ে নিবেন, যেন গোটা অ্যাপ একই "ভাষা" বলে।

---

## ১. আর্কিটেকচার — CSS ফাইল ম্যাপ

| ফাইল | ভূমিকা |
|---|---|
| `base.css` | ভেরিয়েবল, রিসেট, টাইপোগ্রাফি, layout shell (header/sidebar/bottom-nav) |
| `components.css` | বাটন, ফর্ম, কার্ড, ব্যাজ, মডাল, টোস্ট, টগল, সার্চ |
| `ux.css` | UX ডিটেইল — palette picker, skeleton, toast bar, section transitions, theme spin |
| `responsive.css` | সব ব্রেকপয়েন্ট + reduced-motion |
| `auth.css`, `saas.css`, `dashboard.css`, `notes.css`, `syllabus.css`, `prayer.css`, `focus.css`, `settings-ui.css`, `social.css`, `chat.css`, `dm.css`(—), `calendar.css`, `mind-map.css`, `live-rooms.css`, `knowledge-duels.css`, `gamification.css`, `streak-wars.css`, `revision-race.css`, `target-race.css`, `study-buddy.css`, `question-bank.css`, `mobile-ui.css`, `collect.css`, `perf.css` | ফিচার-নির্দিষ্ট স্টাইল |

Load order: `base.css` → `components.css` → `responsive.css` + ফিচার CSS (index.html-এ)।

---

## ২. ডিজাইন টোকেন (Tokens)

### ২.১ কালার — Theme `[data-theme="light"|"dark"]`

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#faf8ff` | `#2d303d` |
| `--surface` | `#FFFFFF` | `#2d303d` |
| `--surface2` | `#ebedfe` | `#383c4a` |
| `--border` | `#c2c6d5` | `#424753` |
| `--accent` | `#0059ba` | `#acc7ff` |
| `--accent2` | `#00696b` | `#4bdadc` |
| `--accent3` | `#2c72d9` | `#6df7f8` |
| `--hover` | `#0059ba` | `#4bdadc` |
| `--warn` | `#D97706` | `#FBBF24` |
| `--danger` | `#DC2626` | `#F87171` |
| `--text` / `--text2` / `--text3` | `#181b27` / `#424753` / `#727784` | `#eff0ff` / `#c2c6d5` / `#727784` |
| `--glass` | `rgba(255,255,255,.94)` | `rgba(45,48,61,.85)` |
| `--shadow` | `0 4px 12px rgba(26,29,41,.04), 0 8px 28px ...` | `0 4px 24px rgba(0,0,0,.4)` |
| `--chat-user` / `--chat-ai` | `#e8f0fd` / `#e5f7f7` | `#1a2540` / `#143535` |

### ২.২ Appearance টেমপ্লেট (৮টি) — `[data-appearance-template=…]`

`calm`, `ocean`, `forest`, `rose`, `sunrise`, `graphite`, `mono` (light) + `midnight` (dark)।
প্রতিটা টেমপ্লেট নিজের `--bg/--surface/--surface2/--border/--accent2/--accent3/--text2/--text3/--glass/--header-bg/--chat-*` রিডিক্লেয়ার করে — **`--accent` সবসময় `--user-accent`** (= `#0059ba`)।

### ২.৩ গ্রেডিয়েন্ট

| Token | মান |
|---|---|
| `--brand-grad` | `linear-gradient(135deg,#0059ba,#00696b)` |
| `--cta-grad` | `linear-gradient(135deg,#0059ba,#1e88c7)` |
| `--cta-soft` | `rgba(0,89,186,.12)` |

### ২.৪ টাইপোগ্রাফি

| ভূমিকা | Font stack |
|---|---|
| Default | `'Plus Jakarta Sans','Inter','Noto Sans Bengali','Hind Siliguri',system-ui,sans-serif` |
| বাংলা সংখ্যা (০-৯) | `'Noto Sans Bengali','Hind Siliguri'` + `font-feature-settings:'bnum' 1` |
| Font টেমপ্লেট | `clean`(Default) · `bangla` · `rounded` · `serif` (Georgia) |

**Font size scale (rem):** `.62` bottom-nav লেবেল → `.69` section-label → `.7` badge → `.74` mini-note/label → `.78` btn-sm → `.8` toast → `.82`-`.86` nav/btn/body → `.9` input/list-title → `.92` input → `.95` card-title → `1.0` modal-title → `1.05` logo → `1.2` section-title → `1.3`-`1.6` stat numbers।

Font weight: body `500`, nav/label `600`, title/button `700`, logo `800`।

### ২.৫ Radius, Spacing (Density), Shadow

| Token | মান | মন্তব্য |
|---|---|---|
| `--radius-card` | `16px` (soft: 14, crisp: 8) | appearance-radius দ্বারা বদলায় |
| `--radius-control` | `10px` (soft: 10, crisp: 7) | input/button/search |
| `--density-pad` | `1` (compact `.82`, spacious `1.16`) | card/input/button padding-এ গুণ হয় |
| Card padding | `16px × 1` vertical, `18px × 1` horizontal | |
| Input padding | `10px × 1` vertical, `12px` horizontal | |
| Btn padding | `9px × 1` / 14px | sm: 6px/10px · lg: 12px/18px |
| Shadow (base) | `--shadow` token | hover: `0 12px 32px rgba(26,29,41,.10)` |

### ২.৬ Motion টোকেন (পুরো অ্যাপ এই টোকেনই ব্যবহার করে)

| Token | মান |
|---|---|
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` |
| `--ease-decel` | `cubic-bezier(0,0,.2,1)` |
| `--ease-accel` | `cubic-bezier(.4,0,1,1)` |
| `--dur-fast` | `120ms` |
| `--dur-base` | `200ms` |
| `--dur-slow` | `320ms` |

---

## ৩. Layout / ডিসপ্লে সিস্টেম

### ৩.১ App Shell (ডেস্কটপ)

| অংশ | সাইজ |
|---|---|
| `header` | height `60px`, sticky top, padding `0 18px`, backdrop-blur `18px` |
| `.main-layout` | `grid-template-columns: 260px 1fr` |
| `.sidebar` | width `260px`, sticky `top:60px`, height `calc(100vh - 60px)` |
| `.content` | padding `18px 22px 80px` |
| `.nav-item` | padding `9px 12px`, radius `--radius-control`, font `.86rem/600`; active-এ বামে `2px` accent বার |

### ৩.২ Breakpoints (responsive.css)

| Breakpoint | কী বদলায় |
|---|---|
| `≤980px` (tablet) | sidebar লুকায়, bottom-nav আসে, content padding `14px 14px 90px`, hero-orb `110px` |
| `≤768px` | সব grid 1-col (auth, package, community, manage, yt-player) |
| `≤600px` | floating overlay গুলো (chat panel/hub, toast) প্রায় full-width — `left/right 8px`, radius `18px`, `min(78vh,600px)` |
| `≤560px` | form-row 1-col, modal radius `14px`, section-title `1.05rem`, stats 2-col |
| `prefers-reduced-motion` | সব animation/transition `0.001ms` |

### ৩.৩ Bottom Nav (mobile)

`bottom-nav` item: `flex:1`, icon `20px` (mobile-ui-তে `22px`), font `.62rem`, padding `6px 4px`।

---

## ৪. কম্পোনেন্ট সাইজ স্পেক (Box/Div)

### ৪.১ বাটন (`components.css`)

| Variant | ব্যাকগ্রাউন্ড |
|---|---|
| `btn-primary` | `--cta-grad`, white text, shadow `0 8px 20px rgba(0,89,186,.28)` |
| `btn-secondary` / `btn-ghost` | glass gradient + border, blur 10px |
| `btn-success` | `linear-gradient(135deg,var(--accent3),#10b981)` |
| `btn-danger` | `var(--danger)` |
| `btn-ai` | `--brand-grad` |
| `btn-warn` | `var(--warn)` |
| `btn-google` | white `#fff`, text `#1f2937` |

Size: **sm** `.78rem`/6-10px · **base** `.86rem`/9-14px · **lg** `.95rem`/12-18px · **block** 100% ·
radius সব `999px` (pill)। Hover: `translateY(-1px)` + brightness `1.05` + bigger shadow; Active: `translateY(0)`, brightness `.95`; Disabled: `opacity .5`।

### ৪.২ কার্ড

`.card`/`.manage-card`: radius `--radius-card`, padding `16/18px` (density-aware), border `1px var(--border)`।
`.resource-card`: radius `12px`, padding `16px`। `.list-item`: radius `12px`, padding `10px 12px`, bg `surface2`।

### ৪.৩ ফর্ম

- `input/select/textarea`: radius `--radius-control`, padding `10px 12px`, font `.92rem`, full-width; hover `translateY(-1px)`; focus ring `0 0 0 3px rgba(0,89,186,.12)`
- `textarea`: `min-height 88px`, vertical resize
- `.form-row`: 2-col grid, gap `12px` (≤560px: 1-col)
- label: `.74rem/700`, uppercase, `letter-spacing .06em`

### ৪.৪ মডাল

| অংশ | সাইজ |
|---|---|
| `modal` | `max-width 560px`, `max-height 90vh`, radius `--radius-card` |
| `modal.lg` | `max-width 760px` |
| Overlay | `fixed inset:0`, `rgba(15,23,42,.55)`, blur 10px, z-index `900` |
| Header/Footer | padding `14/18px` / `12/18px` |
| Footer button | `min-width 92px` (≤480px: full-width column-reverse) |

### ৪.৫ টোস্ট

`toast-container`: `fixed top:78px right:18px`, `max-width 340px`, z `2000`।
`toast`: radius `--radius-control`, padding `10px 14px`, blur 16px, left-border 3px (success `accent3` / error `danger` / warn / info)। Progress bar: height `3px`।

### ৪.৬ মিসেলেনিয়াস

| কম্পোনেন্ট | সাইজ |
|---|---|
| Toggle `.tgl` | `44×24px`, knob `18px`, travel `20px` |
| `.progress-bar` | height `6px`, radius 6px |
| `.btn-icon` | `36×36px` circle (mobile 32px) |
| `.user-avatar` | `34×34px` circle (mobile 30px) |
| `.logo-img` | `36×36px`, radius `11px` (mobile 30px) |
| Badge | padding `3px 9px`, font `.7rem`, radius `20px` |
| Filter-tab | padding `6px 12px`, radius `99px`, font `.78rem/600` |
| FAQ | radius `12px`, max-height `300px` expand |
| Spinner | `14×14px`, border 2px |
| Skeleton | radius `8px`, shimmer `1.4s` |
| Mic pulse | ring `0→6px rgba(239,68,68,…)`, `1.4s` loop |

---

## ৫. ইমেজ / আইকন সাইজ স্পেক

### ৫.১ আইকন স্কেল (`.ico` — currentColor SVG)

| ক্লাস | সাইজ |
|---|---|
| `.ico.sm` | `14×14` |
| `.ico` | `18×18` |
| `.ico.lg` | `22×22` |
| `.ico.xl` | `28×28` |

### ৫.২ অ্যাভাটার সাইজ (সব circular + `object-fit:cover`)

| সাইজ | ব্যবহার |
|---|---|
| `26px` | streak-wars ছোট avatar |
| `30px` | preview avatar |
| `32px` | DM/chat list, social |
| `34px` | header user-avatar, study-buddy, revision-race row |
| `36px` | social chat, live-rooms |
| `42px` | friend card, chat bubble, study-buddy hero |
| `44px` | revision-race hero, FAB (mobile) |
| `46px` | streak-wars hero, collect file thumb |
| `88px` | boot logo orb |
| `92px` | social app logo |

### ৫.৩ ইমেজ নিয়ম

- Global: `img,svg{display:block;max-width:100%}`
- Avatar/thumb: `border-radius:50%` (অথবা নির্ধারিত) + `object-fit:cover`
- Logo: `object-fit:contain` (logo-img, auth-brand-icon, app-skeleton-logo 64px)
- Dashboard banner: `width:100%; max-height:220px; object-fit:contain; radius 10px`
- YouTube thumb: `80×60px`, radius 8px; playlist card img `aspect-ratio:16/9; object-fit:cover`; player frame `aspect-ratio:16/9`
- Collect file: `46×46px`, radius 8px, cover
- Payment method logo: `34×34px`, contain, white bg, padding 3px

---

## ৬. এনিমেশন স্পেক (সম্পূর্ণ তালিকা — 64টি keyframes)

### ৬.১ Entrance / Transition (কার্ড, সেকশন, মডাল)

| Keyframe | আচরণ | Duration |
|---|---|---|
| `fadeIn` | `translateY(4px)→0`, opacity | `.2s` (section-view) |
| `sectionIn` | `translateY(8px)→0` | — (ux.css) |
| `itemIn` | `translateY(8px) scale(.98)→none` | — |
| `modalIn` | `translateY(14px) scale(.96)→none` | `--dur-slow` decel |
| `toastIn` | `translateX(20px) scale(.95)→none` | `.2s` |
| `sheetIn` | `translateY(24px)→none` | — (focus) |
| `mmIn` | `scale(.97)→1` | — (mind-map) |
| `paletteIn` / `tipIn` | `translateY(-10px/-8px) scale(.98)→none` | — |
| `hub-fade` / `hub-slide` | opacity / `translateY(20px)→0` | — (mobile-ui) |
| `sb-install-in` | `translateY(24px)→0` | `.35s` |
| `saveBarUp` | `translateY(14px)→0` | — (settings) |
| `tabBarIn` | tab bar slide-in | — |

### ৬.২ Feedback / Micro-interaction

| Keyframe | আচরণ |
|---|---|
| `checkPop` | scale `.6→1.18→1` |
| `toastIconPop` | `scale(.4) rotate(-12deg)` + overshoot |
| `bnPop` | `scale 1→1.12→1` |
| `hfpPop` | `scale .55→1.35→1` |
| `pill-breathe` | `scale 1↔1.15` |
| `themeSpin` | rotate `0→180deg` |
| `tglSpring` | knob `3px→23px→20px` spring |
| `gatePulse` | `scale 1↔1.07` |
| `mcqCorrectPop` / `mcqWrongShake` | সঠিক pop / ভুল shake (syllabus) |
| `stepPulse` | `scale 1↔1.14` |
| `bar-grow` / `bar-live` | scaleY grow + brightness pulse (focus) |
| `mpStreakBounce` | streak bounce (focus) |

### ৬.৩ Loading / Skeleton / Spinner

| Keyframe | আচরণ | Duration |
|---|---|---|
| `spin` (×5 ফাইল) | rotate 360° | `.6s` linear |
| `slow-spin` / `spin-fast` | dashboard orbs | — |
| `shimmer` | `background-position 200%→-200%` | `1.4s` |
| `skeletonOut` | fade out | — |
| `app-progress` | `translateX(-130%→240%)` | — |
| `dot` | typing dots (notes) | `1s` |
| `pulse` (×3) | opacity/scale pulse | — |
| `collect pulse` | `opacity .4` | — |

### ৬.৪ Decorative / Status (গ্লো, পলস, বব)

| Keyframe | আচরণ | Duration |
|---|---|---|
| `floatGlow` | body backdrop বা-গ্লো float | `9s` ease-in-out infinite |
| `brain-bob` / `app-logo-bob` | `translateY -7px` bob | `1.1s` |
| `swBob` | `-4px` bob | — |
| `fire-flicker` | orange glow flicker | — |
| `target-glow` | green glow `8px↔16px` | — |
| `sonar` / `pulse-track` | expanding ring `scale .85→1.45` | — |
| `flame-pulse` | `scale .92↔1.08` | — |
| `lrPulse` | live-room presence | — |
| `kdpulse` | duel live dot opacity | `1.2s` |
| `micPulse` / `mic-pulse` | recording ring | `1.4s` |
| `install-pulse` | install FAB glow | — |
| `nexusGlow` | NEXUS hero | — |
| `gmRankUp` | rank-up animation | — |
| `badgePop` / `bellShake` | badge + notification bell | — |
| `swLogoGlow` | streak logo | — |
| `armPulse` (মুছে ফেলা হয়েছে) | — | — |

### ৬.৫ এনিমেশন নিয়ম

1. সব duration **মোশন টোকেন** দিয়ে (hardcode নিষেধ) — `--dur-fast/base/slow` + `--ease-*`
2. Transitions: `transform`/`box-shadow`/`filter`/`background`/`color`/`border-color` — layout property animate নিষেধ
3. Card hover: `translateY(-2px)` + `0 12px 32px` shadow, `--dur-base`
4. Button hover: `translateY(-1px)` + brightness, `120ms`
5. **Reduced motion**: `prefers-reduced-motion:reduce` হলে সব `0.001ms` — একটাই global rule (responsive.css)

---

## ৭. ফিচার-নির্দিষ্ট সাইজ রেফারেন্স (দ্রুত লুকআপ)

| ফিচার | মূল সাইজ |
|---|---|
| Dashboard | banner img max-h `220px`; hero-orb `110px` (mobile) / icon `48px`; brain-bob |
| Notes | FAB `48×48` (mobile `44×44`); thinking dots `5px`; subject-color picker `24×24` |
| Syllabus | chapter checkbox `16×16`; class-head icon `16px`; counters `min-width 22px, h 18px` |
| Focus | bars `scaleY` grow; sheet `translateY(24px)` |
| Mind Map | empty icon `42×42`; toolbar icon `16px` |
| Live Rooms | avatar `36px`; presence dot `8px` green |
| Duels | live dot `8px`; player avatar `22px` |
| Streak Wars | avatar `26px`; hero logo `58×58` radius `16px` + glow; risk dot `10px` |
| Revision Race | avatar `44px` hero / `34px` row |
| Target Race | avatar `32px`; subject tile `40×40` radius `12px` |
| Study Buddy | avatar `42px` hero / `34px` list |
| Social | avatar `36px` chat / `32px` list / `42px` friend; badge `17×17` top-right |
| Gamification | squad icon `18px` |
| Chat hub | `78vh` max, `600px` max-height, radius `18px` (mobile) |
| YT Courses | thumb `80×60`; player `16/9`; playlist card img `16/9` cover |
| Settings | tab icon `18px`; appearance preview `96px` high |
| Prayer | card icon `30px`, mini `14px` |
| Collect | file thumb `46×46` |
| Calendar | — (base tokens) |
| Admin panel | নিজস্ব `admin.css` — একই color tokens, `--radius-card` ব্যবহার করে |

---

## ৮. দ্রুত চেকলিস্ট (নতুন UI বানানোর সময়)

- [ ] রং: `var(--accent)` family — hardcode hex নয় (শুধু brand-grad/gradients)
- [ ] রেডিয়াস: কার্ড `--radius-card`, কন্ট্রোল `--radius-control`
- [ ] প্যাডিং: density token ব্যবহার (`calc(… * var(--density-pad))`)
- [ ] আইকন: `.ico` / `.ico.sm/lg/xl` স্কেল
- [ ] মোশন: `--dur-*` + `--ease-*` token; hover = transform/shadow পরিবর্তন
- [ ] রেসপনসিভ: 980/768/600/560 ব্রেকপয়েন্টে পরীক্ষা
- [ ] ইমেজ: `object-fit` + `aspect-ratio`; avatar circular
- [ ] ফোকাস রিং: `:focus-visible` (অ্যাক্সেসিবিলিটি)
- [ ] Reduced-motion কম্প্যাট
- [ ] বাংলা সংখ্যা: `.bangla-num` বা `[data-lang="bn"]` context
