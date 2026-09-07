# FIX EXISTING INVITATION — RESPONSIVE UPGRADE

Read the file first. Match patterns by function, not class name. All code here is reference — adapt selectors to what exists in the file.

---

## 1. META TAG — MUST CHECK FIRST

If `viewport-fit=cover` is missing, add it. Without it, `env()` returns 0 on iOS and nothing below works.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

---

## 2. CSS CUSTOM PROPERTY — RUN BEFORE EVERYTHING

Must be the first script in the file, before DOMContentLoaded, before any other JS:

```js
function setActualVh() {
  const h = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--actual-vh', `${h * 0.01}px`);
}
setActualVh();
(window.visualViewport ?? window).addEventListener('resize', setActualVh);
```

---

## 3. SCROLL RESET — ALSO MUST BE AT TOP OF SCRIPT

```js
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
```

---

## 4. CONTAINER — TWO STRATEGIES

### Strategy A — Keep mobile column, fix wide-screen letterbox

Find the main `#app` / container element. It likely has `max-width: 480px` and `margin: 0 auto`. Keep this. Just fix the body background so the letterbox looks intentional:

```css
body { background: #111; } /* or match the dark/muted bg the design uses */
```

This is the right choice if the invitation is intentionally a phone-format card.

### Strategy B — Full responsive (remove max-width cap)

If the client wants the page to fill any screen:

```css
/* Find the container — it has max-width: 480px or similar. Remove that cap. */
#app {
  width: 100%;
  max-width: none; /* remove the cap */
  margin: 0 auto;
}

/* Remove landscape warning entirely — not needed for responsive builds */
#landscape-warning { display: none !important; }
@media screen and (orientation: landscape) { /* remove the #app hide rule */ }
```

Then continue with sections below.

---

## 5. FAB / AUDIO BUTTON — HIDDEN BEHIND NAVIGATION

This is the most common bug. Find the fixed audio/music button. It probably has `bottom: 25px` or `bottom: 28px` which gets clipped under the Android nav bar.

**Pattern 1 — button is inside the 480px mobile container (like index.html):**
The file uses `right: calc(50% - 240px + 25px)` to position inside the column. Keep this logic but fix the bottom:

```css
/* Find the audio/music FAB — adapt selector */
.audio-ctrl,
#audio-ctrl,
#mfab,
.music-fab {
  /* Keep existing right positioning logic */
  /* Only fix the bottom: */
  bottom: max(72px, calc(env(safe-area-inset-bottom, 0px) + 38px));
}
```

**Pattern 2 — button is viewport-fixed with simple `right: 20px`:**

```css
.audio-ctrl {
  bottom: max(72px, calc(env(safe-area-inset-bottom, 0px) + 38px));
  right: max(20px, calc(env(safe-area-inset-right, 0px) + 16px));
}

/* For mobile-only column builds: keep button inside the column at wide viewports */
@media (min-width: 520px) {
  .audio-ctrl {
    right: max(calc(50vw - 240px + 20px), 20px);
  }
}
```

**Why 72px minimum:** Android 3-button nav bar is ~48px. `env()` returns 0 on most Android devices regardless. The `max()` floor is what actually saves it.

---

## 6. FULL-SCREEN OVERLAYS — CURTAIN / ENVELOPE / INTRO LAYER

Find the intro overlay (video curtain, envelope screen). It has `height: 100vh` or similar. Apply the full cascade:

```css
/* Find the full-screen intro layer — adapt selector */
#curtain-layer,
.entry,
#envelope-overlay {
  position: fixed;
  inset: 0;
  height: 100vh;
  height: -webkit-fill-available;
  height: 100svh;
  height: 100dvh;
  height: calc(var(--actual-vh, 1vh) * 100);
}
```

Same for landscape warning and any other fixed full-screen element.

---

## 7. HERO SECTION HEIGHT

Find the hero/banner section. Apply same cascade so it fills the visible screen exactly:

```css
/* Find hero section — adapt selector */
.hero-sec,
.hero-section,
.banner-sec {
  min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100svh;
  min-height: 100dvh;
  min-height: calc(var(--actual-vh, 1vh) * 100);
}
```

---

## 8. TYPOGRAPHY — REPLACE FIXED PX WITH CLAMP

Find all fixed `font-size` values on headline/title elements. Replace:

| Current | Replace with |
|---------|-------------|
| `font-size: 2.8rem` (couple name) | `font-size: clamp(2rem, 7vw, 4.5rem)` |
| `font-size: 3rem` (section title) | `font-size: clamp(2rem, 6vw, 3.5rem)` |
| `font-size: 2.5rem` (footer heading) | `font-size: clamp(1.8rem, 5vw, 3rem)` |
| `font-size: 2.2rem` (card heading) | `font-size: clamp(1.5rem, 4vw, 2.5rem)` |
| `font-size: 1.5rem` (subheading) | `font-size: clamp(1.1rem, 3vw, 1.8rem)` |
| `font-size: 1.1rem` (body) | `font-size: clamp(0.9rem, 1.8vw, 1.1rem)` |
| `font-size: 0.9rem` (small/label) | `font-size: clamp(0.8rem, 1.4vw, 0.95rem)` |

**Rule:** Keep mobile min around what it is now. Max is 1.2–1.6× the current value. The `vw` fluid middle is `current_size / 480 * 100` (for 480px base).

Script/cursive fonts (couple names, section decoratives) can scale more aggressively — up to 8–10vw fluid with a large max.

---

## 9. SECTION PADDING — REPLACE FIXED WITH CLAMP

Find `padding` on section elements that uses fixed px. Replace:

```css
/* Find each section — adapt selectors */
.some-section {
  /* Before: padding: 60px 20px; */
  padding: clamp(40px, 8vh, 100px) clamp(16px, 5vw, 60px);
}
```

---

## 10. CONTENT SECTIONS — GRID UPGRADE

### Memory grid / Photo grid (vertical stack → grid at desktop)

Find a section where items are stacked vertically (flex-direction: column or a single column). Make it grid:

```css
/* Find the memories/photos grid container — adapt selector */
.memories-grid,
.gallery-grid,
.cards-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(40px, 6vw, 80px);
  justify-items: center;
}

@media (min-width: 700px) {
  .memories-grid,
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1100px) {
  .memories-grid,
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Note on fixed-width items:** If the file has items with `width: 280px` (like `.memory-item { width: 280px }`), change to `width: 100%; max-width: 320px;` so they scale in the grid.

### Event / Itinerary items (alternating left-right layout)

These often use `display: flex; flex-direction: row` alternating with `row-reverse`. This is fine on mobile. On desktop, add more breathing room:

```css
/* Find event row items — adapt selector */
.event-item {
  gap: clamp(20px, 4vw, 60px);
}

@media (min-width: 768px) {
  .event-item {
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
}
```

### Glass boxes / RSVP / Info cards (stacked → side by side at desktop)

```css
/* Find section with stacked glass boxes — adapt selector */
.glass-sec,
.rsvp-sec,
.info-sec {
  padding: clamp(40px, 6vw, 80px) clamp(16px, 8vw, 120px);
}

@media (min-width: 900px) {
  /* If there are 2+ card boxes, put them side by side */
  .glass-sec-inner,
  .cards-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
    max-width: 1000px;
    margin: 0 auto;
  }
}
```

### RSVP form — constrain at desktop

```css
/* Find the RSVP form container */
#rsvpForm,
.rsvp-form {
  max-width: 560px;
  margin: 0 auto;
}

@media (min-width: 800px) {
  /* Name + phone fields side by side */
  .form-row-two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}
```

---

## 11. CANVAS / PARTICLES — FIX RESIZE

Find the canvas element and its resize handler. The common bug is `canvas.height = window.innerHeight` which doesn't account for browser toolbar. Fix:

```js
function resizeCanvas() {
  const appEl = document.getElementById('app'); // or main container
  const w = appEl ? appEl.offsetWidth : window.innerWidth;
  const h = window.visualViewport?.height ?? window.innerHeight; // FIX: was window.innerHeight
  
  canvas.width  = Math.floor(w * DPR);
  canvas.height = Math.floor(h * DPR);
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px'; // FIX: keep canvas CSS size in sync
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  
  // Recalculate particle count based on new width
  // cap between 10–30 particles
}
window.addEventListener('resize', resizeCanvas, { passive: true });
```

For responsive builds where canvas is not constrained to 480px column, remove `max-width` from canvas CSS and let it use `window.innerWidth`.

---

## 12. SCROLL INDICATOR POSITIONING

If the scroll indicator is inside the hero section (not fixed), it's fine. If it's `position: fixed`, apply safe-area padding:

```css
.scroll-down-indicator {
  /* If position: fixed */
  bottom: max(28px, calc(env(safe-area-inset-bottom, 0px) + 20px));
  left: 50%;
  transform: translateX(-50%);
}
```

If inside a 480px column and fixed:
```css
@media (min-width: 520px) {
  .scroll-down-indicator {
    /* Center it within the column, not the viewport */
    left: 50%; /* stays centered on viewport — works if column is centered */
  }
}
```

---

## 13. BACKGROUND IMAGES — RESPONSIVE SWAP

If the hero has a background image, add desktop version:

```css
.hero-sec {
  background-image: url('images/hero_mobile.webp');
  background-size: cover;
  background-position: center;
}

@media (min-width: 768px) {
  .hero-sec {
    background-image: url('images/hero_desktop.webp');
  }
}
```

---

## 14. VIDEO INTRO — RESPONSIVE SOURCE SWAP

If the file has a single video source and needs mobile/desktop variants, add this JS. If it only has one video for all sizes, skip this section.

```js
const MOBILE_SRC  = 'video/mobile.mp4';
const DESKTOP_SRC = 'video/desktop.mp4';
let introOpened = false;

function isMobileView() {
  if (window.matchMedia('(orientation: landscape)').matches && window.innerWidth >= 480) return false;
  return window.innerWidth < 768;
}

function syncVideoSrc() {
  if (introOpened) return;
  const video = document.querySelector('#curtain-video, video'); // adapt
  if (!video) return;
  const target = isMobileView() ? MOBILE_SRC : DESKTOP_SRC;
  if (video.getAttribute('data-src') === target) return;
  video.setAttribute('data-src', target);
  video.src = target;
  video.load();
}

document.addEventListener('DOMContentLoaded', syncVideoSrc);

let rsz;
window.addEventListener('resize', () => { clearTimeout(rsz); rsz = setTimeout(syncVideoSrc, 120); });

window.addEventListener('orientationchange', () => {
  syncVideoSrc();
  setTimeout(syncVideoSrc, 150);
  setTimeout(syncVideoSrc, 350);
});
```

---

## 15. PREFERS-REDUCED-MOTION

Add this to CSS. Find animation-heavy elements and disable when needed:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable canvas petal animation — stop the JS loop via a flag */
  /* Disable scroll bounce */
  .scroll-down-indicator svg { animation: none; }
  /* Disable section reveal transitions — just make them visible */
  .memory-item,
  .invite-box,
  .glass-box,
  .venue-sec,
  .event-item {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    animation: none !important;
  }
}
```

In JS, before starting the canvas animation loop:
```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // don't start loop
```

---

## 16. PRELOAD TAGS — ADD FOR RESPONSIVE BUILDS

In `<head>`, replace single preload with responsive preloads if desktop/mobile assets differ:

```html
<!-- Remove single preload, add responsive pair -->
<link rel="preload" href="images/hero_mobile.webp" as="image" media="(max-width: 767px)" fetchpriority="high">
<link rel="preload" href="images/hero_desktop.webp" as="image" media="(min-width: 768px)" fetchpriority="high">
```

---

## 17. FIX CHECKLIST FOR EXISTING FILES

- [ ] `viewport-fit=cover` in meta tag
- [ ] `setActualVh()` runs first before any other script
- [ ] `scrollRestoration = 'manual'` + `scrollTo(0,0)` at top of JS
- [ ] FAB button: `bottom: max(72px, calc(env(safe-area-inset-bottom, 0px) + 38px))`
- [ ] Full-screen overlays: 5-line height cascade (`100vh → -webkit-fill-available → 100svh → 100dvh → calc(var(--actual-vh,1vh)*100)`)
- [ ] Hero section: same 5-line min-height cascade
- [ ] All headline font-sizes converted to `clamp()`
- [ ] Section padding converted to `clamp()`
- [ ] Canvas resize uses `visualViewport?.height` not `innerHeight`
- [ ] Memory/gallery grid: `grid-template-columns` upgrades at 700px and 1100px
- [ ] `prefers-reduced-motion` disables canvas loop and transitions
- [ ] Remove landscape warning for Strategy B (full responsive)
