# BUILD INVITATION FROM SCRATCH

Single-file HTML. All CSS inline in `<style>`. All JS inline in `<script>`. No build tools. No frameworks. Adapt every selector, color, and copy to the specific invitation.

---

## 1. REQUIRED HEAD

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>[Names] — [Event]</title>
  <meta name="description" content="[Description]">

  <!-- OG tags for WhatsApp/Facebook preview card -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="[Names] — [Event]">
  <meta property="og:description" content="[Description]">
  <meta property="og:image" content="images/og_image.png"> <!-- 1200×630px -->
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="images/og_image.png">

  <!-- Preload hero image and video thumbnail -->
  <link rel="preload" href="images/hero.webp" as="image" fetchpriority="high">
  <link rel="preload" href="images/intro_thumb.webp" as="image" fetchpriority="high">
  <!-- If responsive assets: -->
  <!-- <link rel="preload" href="images/hero_mobile.webp" as="image" media="(max-width:767px)" fetchpriority="high"> -->
  <!-- <link rel="preload" href="images/hero_desktop.webp" as="image" media="(min-width:768px)" fetchpriority="high"> -->

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&family=Great+Vibes&display=swap" rel="stylesheet">

  <!-- Embla Carousel (only if using photo gallery) -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/embla-carousel@8.5.2/embla-carousel.umd.js"></script> -->

  <!-- Fancybox (only if using lightbox gallery) -->
  <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css"> -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js"></script> -->

  <style>
    /* === DESIGN TOKENS — change these per invitation === */
    :root {
      --primary: #e7bf85;       /* main accent color */
      --primary-light: #fcf6ba;
      --primary-dark: #b38728;
      --bg: #0b162c;            /* page/card background */
      --bg-outer: #111111;      /* body background outside card */
      --text: #ffffff;
      --text-muted: rgba(255,255,255,0.65);
      --serif: 'Playfair Display', serif;
      --script: 'Great Vibes', cursive;
      --sans: 'Montserrat', sans-serif;
      --card-width: 480px;      /* mobile-only column width */
    }
```

---

## 2. BASE CSS

```css
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    body {
      background: var(--bg-outer);
      font-family: var(--sans);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      overflow: hidden; /* scroll-locked until intro completes */
    }
    body.unlocked {
      overflow-x: hidden;
      overflow-y: auto;
    }

    /* Petals canvas — full viewport, behind everything */
    #petals-canvas {
      position: fixed;
      top: 0; left: 50%;
      transform: translateX(-50%);
      width: 100%; max-width: var(--card-width); /* remove max-width for full-responsive */
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    /* Main card container */
    #app {
      width: 100%;
      max-width: var(--card-width); /* remove for full-responsive */
      margin: 0 auto;
      background: var(--bg);
      position: relative;
      z-index: 2;
      min-height: 100vh;
      min-height: -webkit-fill-available;
      min-height: 100svh;
      min-height: 100dvh;
      min-height: calc(var(--actual-vh, 1vh) * 100);
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 60px rgba(0,0,0,0.8);
    }

    /* Landscape warning — mobile-only builds only, remove for full-responsive */
    #landscape-warning {
      display: none;
      position: fixed;
      inset: 0;
      height: 100vh; height: -webkit-fill-available; height: 100svh; height: 100dvh;
      height: calc(var(--actual-vh, 1vh) * 100);
      background: var(--bg-outer);
      color: var(--primary);
      z-index: 999999;
      flex-direction: column; align-items: center; justify-content: center;
      text-align: center; gap: 16px; padding: 24px;
    }
    @media screen and (orientation: landscape) and (max-height: 500px) {
      #landscape-warning { display: flex !important; }
      #app { display: none !important; }
    }
```

---

## 3. INTRO LAYER — CHOOSE ONE TYPE

### 3A — VIDEO INTRO

```css
    /* === VIDEO INTRO === */
    #intro-layer {
      position: fixed;
      top: 0; left: 50%; transform: translateX(-50%);
      width: 100%; max-width: var(--card-width);
      height: 100vh; height: -webkit-fill-available; height: 100svh; height: 100dvh;
      height: calc(var(--actual-vh, 1vh) * 100);
      z-index: 100;
      background: #000;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: opacity 1s ease;
    }
    #intro-video {
      width: 100%; height: 100%;
      object-fit: cover;
      pointer-events: none;
    }
    #tap-prompt {
      position: absolute;
      z-index: 10;
      text-align: center;
      padding: 16px 28px;
      border: 1px solid var(--primary);
      border-radius: 40px;
      background: rgba(0,0,0,0.6);
      color: var(--primary-light);
      font-family: var(--serif);
      font-size: clamp(1rem, 4vw, 1.4rem);
      letter-spacing: 0.08em;
      animation: tap-pulse 2s ease-in-out infinite;
    }
    @keyframes tap-pulse {
      0%,100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.04); opacity: 0.8; }
    }
```

HTML:
```html
<div id="intro-layer">
  <video id="intro-video"
    playsinline webkit-playsinline
    preload="auto"
    poster="images/intro_thumb.webp"
    disablePictureInPicture>
    <source src="video/intro.mp4" type="video/mp4">
  </video>
  <div id="tap-prompt">Tap to Open</div>
</div>
```

### 3B — CSS ENVELOPE INTRO

```css
    /* === CSS ENVELOPE INTRO === */
    #intro-layer {
      position: fixed;
      inset: 0;
      height: 100vh; height: -webkit-fill-available; height: 100svh; height: 100dvh;
      height: calc(var(--actual-vh, 1vh) * 100);
      z-index: 100;
      display: grid; place-items: center;
      background: linear-gradient(135deg, #f8f3ea, #efe8db); /* adapt to theme */
      cursor: pointer;
      transition: opacity 0.7s ease, visibility 0.7s ease;
    }
    #intro-layer.is-hidden {
      opacity: 0; visibility: hidden; pointer-events: none;
    }

    /* Envelope parts */
    .envelope {
      position: relative;
      width: min(82vw, 340px);
      height: 230px;
      perspective: 900px;
      filter: drop-shadow(0 18px 16px rgba(0,0,0,0.2));
    }
    .env-back, .env-front, .env-flap, .env-letter {
      position: absolute; left: 0; width: 100%;
    }
    .env-back {
      bottom: 0; height: 185px;
      background: #e8c4a0; border: 1px solid #d4a070;
    }
    .env-letter {
      bottom: 22px; left: 7%; width: 86%; height: 160px;
      background: #fffdf8; border: 1px solid #e8dfd0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--serif); text-align: center;
      transition: transform 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s;
    }
    .env-flap {
      top: 45px; height: 140px; z-index: 4;
      clip-path: polygon(0 0, 50% 77%, 100% 0);
      transform-origin: top center;
      background: #f0cba8;
      transition: transform 0.95s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .env-front {
      bottom: 0; z-index: 5; height: 185px;
      clip-path: polygon(0 0, 50% 48%, 100% 0, 100% 100%, 0 100%);
      background: linear-gradient(135deg, #f5d4be, #e8b898);
    }

    /* Opening state — add class via JS on tap */
    #intro-layer.is-opening .env-flap {
      transform: rotateX(178deg);
    }
    #intro-layer.is-opening .env-letter {
      transform: translateY(-82px);
    }

    /* Tap prompt below envelope */
    #tap-prompt {
      position: absolute;
      bottom: max(36px, 8vh);
      font-family: var(--sans); font-size: 0.64rem;
      font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--bg); /* dark text on light envelope background */
      display: flex; align-items: center; gap: 8px;
      animation: tap-pulse 1.8s ease-in-out infinite;
      transition: opacity 0.3s;
    }
    #intro-layer.is-opening #tap-prompt { opacity: 0; }
    @keyframes tap-pulse { 50% { transform: translateY(-5px); opacity: 0.6; } }
```

HTML:
```html
<div id="intro-layer">
  <div class="envelope">
    <div class="env-back"></div>
    <div class="env-letter">
      <span>[Couple Names]</span>
    </div>
    <div class="env-flap"></div>
    <div class="env-front"></div>
  </div>
  <button id="tap-prompt" type="button" aria-label="Open invitation">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M7 17l10-10M7 7h10v10"/></svg>
    Tap to Open
  </button>
</div>
```

---

## 4. SCROLL DOWN INDICATOR

```css
    #scroll-indicator {
      display: flex; flex-direction: column; align-items: center;
      gap: 4px; padding: 12px 0;
      color: var(--primary);
      opacity: 0; pointer-events: none;
      transition: opacity 0.5s ease;
    }
    #scroll-indicator.visible { opacity: 1; pointer-events: auto; cursor: pointer; }
    #scroll-indicator.hidden  { opacity: 0 !important; pointer-events: none; }
    #scroll-indicator span {
      font-size: 0.6rem; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700;
    }
    #scroll-indicator svg {
      animation: scroll-bounce 1.8s ease-in-out infinite;
    }
    @keyframes scroll-bounce {
      0%,100% { transform: translateY(0); opacity: 0.7; }
      50%      { transform: translateY(6px); opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      #scroll-indicator svg { animation: none; }
    }
```

HTML (place at bottom of hero section):
```html
<div id="scroll-indicator" role="button" tabindex="0" aria-label="Scroll to content">
  <span>Scroll</span>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
    <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
  </svg>
</div>
```

---

## 5. MUSIC FAB

```css
    #music-fab {
      position: fixed;
      bottom: max(72px, calc(env(safe-area-inset-bottom, 0px) + 38px));
      right: max(20px, calc(env(safe-area-inset-right, 0px) + 16px));
      /* For mobile-only column builds — keep inside the column at wide viewports: */
      /* right: max(calc(50vw - 240px + 20px), 20px); */
      width: 48px; height: 48px;
      border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, var(--primary-dark), var(--primary), var(--primary-light));
      color: var(--bg);
      display: flex; align-items: center; justify-content: center;
      z-index: 200;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      opacity: 0; pointer-events: none;
      transition: opacity 0.4s ease;
    }
    #music-fab.visible { opacity: 1; pointer-events: auto; }
    #music-fab svg { width: 22px; height: 22px; fill: currentColor; }
```

HTML (place outside `#app`, directly in `<body>`):
```html
<button id="music-fab" type="button" aria-label="Play background music">
  <!-- Speaker ON icon — shown when playing -->
  <svg id="fab-icon-on" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
  <!-- Speaker OFF/MUTED icon — shown when paused -->
  <svg id="fab-icon-off" viewBox="0 0 24 24" aria-hidden="true" style="display:none">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
</button>
<audio id="bg-music" loop preload="auto" playsinline webkit-playsinline>
  <source src="audio/background.mp3" type="audio/mpeg">
</audio>
```

---

## 6. HERO SECTION

```css
    .hero-section {
      min-height: 100vh; min-height: -webkit-fill-available;
      min-height: 100svh; min-height: 100dvh;
      min-height: calc(var(--actual-vh, 1vh) * 100);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center;
      padding: clamp(40px, 6vh, 80px) clamp(20px, 5vw, 40px);
      position: relative; overflow: hidden;
      /* If using background image: */
      /* background: url('images/hero.webp') center/cover no-repeat; */
    }

    /* For responsive builds — swap background image at desktop: */
    /* @media (min-width: 768px) { .hero-section { background-image: url('images/hero_desktop.webp'); } } */

    .hero-names {
      font-family: var(--script);
      font-size: clamp(2.8rem, 10vw, 6rem);
      color: var(--primary-light);
      line-height: 1.1;
    }
    .hero-tagline {
      font-family: var(--serif);
      font-size: clamp(0.7rem, 2vw, 1rem);
      letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--text-muted); margin-top: 8px;
    }
    .hero-photo-frame {
      width: min(82vw, 320px);
      border-radius: 180px 180px 0 0;
      overflow: hidden;
      border: 2px solid var(--primary);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      margin: 24px auto;
    }
    .hero-photo-frame img { width: 100%; height: auto; display: block; }
```

---

## 7. SECTION TITLE PATTERN

Reuse for every section heading:

```css
    .section-head {
      text-align: center;
      margin-bottom: clamp(32px, 5vw, 64px);
    }
    .section-overline {
      display: block;
      font-size: clamp(0.6rem, 1.2vw, 0.75rem);
      letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--text-muted); margin-bottom: 8px;
    }
    .section-title {
      font-family: var(--script);
      font-size: clamp(2rem, 6vw, 4rem);
      color: var(--primary);
    }
    .section-divider {
      width: 60px; height: 1px;
      background: var(--primary);
      margin: 16px auto 0; opacity: 0.5;
    }
```

---

## 8. EVENT CARDS / ITINERARY

```css
    .events-section { padding: clamp(48px, 8vh, 100px) clamp(16px, 5vw, 60px); }

    .events-list { display: flex; flex-direction: column; gap: clamp(48px, 6vh, 80px); }

    .event-row {
      display: flex; align-items: center;
      gap: clamp(16px, 4vw, 48px);
    }
    .event-row:nth-child(even) { flex-direction: row-reverse; }

    .event-text { flex: 1; }
    .event-time-label {
      font-family: var(--script);
      font-size: clamp(1.8rem, 5vw, 2.8rem);
      color: var(--primary);
    }
    .event-name {
      font-family: var(--serif);
      font-size: clamp(1rem, 2.5vw, 1.4rem);
      color: var(--primary-light);
      margin-top: 4px;
    }
    .event-desc { color: var(--text-muted); font-size: clamp(0.8rem, 1.5vw, 0.95rem); margin-top: 8px; }

    .event-icon { flex: 1; display: flex; justify-content: center; }
    .event-icon img { max-height: 140px; width: auto; object-fit: contain; }

    /* Desktop: more breathing room */
    @media (min-width: 768px) {
      .events-list { max-width: 800px; margin: 0 auto; }
    }
```

---

## 9. PHOTO GALLERY (EMBLA)

```css
    .gallery-section { padding: clamp(48px, 8vh, 100px) 0; } /* no horizontal padding — carousel bleeds */

    .embla { overflow: hidden; }
    .embla-container { display: flex; gap: 16px; padding: 0 clamp(16px, 5vw, 32px); }
    .embla-slide {
      flex: 0 0 auto;
      width: clamp(240px, 70vw, 300px);
      border: 2px solid var(--primary);
      overflow: hidden;
    }
    .embla-slide img { width: 100%; height: 260px; object-fit: cover; display: block; }

    .carousel-dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
    .carousel-dot {
      width: 8px; height: 8px; border-radius: 50%;
      border: 1px solid var(--primary); background: transparent;
      cursor: pointer; transition: background 0.3s;
    }
    .carousel-dot.active { background: var(--primary); }
```

HTML:
```html
<section class="gallery-section">
  <div class="section-head">...</div>
  <div id="photo-carousel" class="embla">
    <div class="embla-container">
      <div class="embla-slide"><a href="images/p1.webp" data-fancybox="gallery"><img src="images/p1.webp" alt="" loading="lazy"></a></div>
      <div class="embla-slide"><a href="images/p2.webp" data-fancybox="gallery"><img src="images/p2.webp" alt="" loading="lazy"></a></div>
      <!-- more slides -->
    </div>
  </div>
  <div id="carousel-dots" class="carousel-dots"></div>
</section>
```

---

## 10. COUNTDOWN TIMER

```css
    .countdown-wrap { display: flex; gap: clamp(16px, 4vw, 32px); justify-content: center; flex-wrap: wrap; }
    .countdown-unit { text-align: center; min-width: 60px; }
    .countdown-num {
      font-family: var(--serif);
      font-size: clamp(2rem, 7vw, 4rem);
      color: var(--primary); display: block; line-height: 1;
    }
    .countdown-label {
      font-size: clamp(0.6rem, 1.2vw, 0.75rem);
      letter-spacing: 0.15em; text-transform: uppercase;
      color: var(--text-muted);
    }
```

JS:
```js
function startCountdown(targetISO) {
  const target = new Date(targetISO).getTime();
  const els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs'),
  };
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { Object.values(els).forEach(el => { if (el) el.textContent = '00'; }); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (els.d) els.d.textContent = String(d).padStart(2, '0');
    if (els.h) els.h.textContent = String(h).padStart(2, '0');
    if (els.m) els.m.textContent = String(m).padStart(2, '0');
    if (els.s) els.s.textContent = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}
// Usage: startCountdown('2026-10-24T18:00:00+05:30');
```

---

## 11. CANVAS FALLING PETALS

HTML (first child of `<body>` or inside `#app` before content):
```html
<canvas id="petals-canvas" aria-hidden="true"></canvas>
```

JS:
```js
(function() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, petals;

  // Adapt colors to the invitation theme
  const COLORS = [
    'rgba(231,191,133,0.35)',
    'rgba(252,246,186,0.28)',
    'rgba(179,135,40,0.22)',
  ];

  function Petal(init) {
    this.reset(init);
  }
  Petal.prototype.reset = function(init) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : -20;
    this.size = 3 + Math.random() * 5;
    this.ratio = 0.35 + Math.random() * 0.25;
    this.speed = 0.15 + Math.random() * 0.35;
    this.drift = (Math.random() - 0.5) * 0.3;
    this.phase = Math.random() * Math.PI * 2;
    this.angle = Math.random() * Math.PI;
    this.spin  = (Math.random() - 0.5) * 0.025;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  };
  Petal.prototype.update = function() {
    this.phase += 0.018;
    this.x += this.drift + Math.sin(this.phase) * 0.25;
    this.y += this.speed;
    this.angle += this.spin;
    if (this.y > H + 20 || this.x < -30 || this.x > W + 30) this.reset(false);
  };
  Petal.prototype.draw = function() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * this.ratio, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  function resize() {
    const app = document.getElementById('app');
    W = app ? app.offsetWidth : window.innerWidth;
    H = window.visualViewport?.height ?? window.innerHeight;
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.max(10, Math.min(30, Math.round(W / 55)));
    petals = Array.from({ length: count }, (_, i) => new Petal(i < count * 0.7));
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  resize();
  loop();
  window.addEventListener('resize', resize, { passive: true });
})();
```

---

## 12. WHATSAPP RSVP FORM

HTML:
```html
<section class="rsvp-section">
  <div class="section-head">...</div>
  <form id="rsvp-form" novalidate>

    <div class="field" data-field>
      <label for="f-name">Full Name *</label>
      <input type="text" id="f-name" name="name" placeholder="Your full name" autocomplete="name">
      <span class="field-error">Please enter your name</span>
    </div>

    <div class="field" data-field>
      <label for="f-phone">Phone *</label>
      <input type="tel" id="f-phone" name="phone" placeholder="Your phone number" autocomplete="tel">
      <span class="field-error">Please enter your phone number</span>
    </div>

    <!-- Attendance toggle -->
    <div class="field">
      <label>Will you attend?</label>
      <div class="toggle-group">
        <label class="toggle-btn"><input type="radio" name="attend" value="Joyfully Attending" checked><span>Joyfully Attending</span></label>
        <label class="toggle-btn"><input type="radio" name="attend" value="Regretfully Declining"><span>Regretfully Declining</span></label>
      </div>
    </div>

    <!-- Guest count — hide when declining via JS -->
    <div class="field" id="extra-fields">
      <label for="f-count">Number of Guests</label>
      <select id="f-count" name="count">
        <option value="1">1</option><option value="2">2</option>
        <option value="3">3</option><option value="4">4</option><option value="5+">5+</option>
      </select>

      <!-- Event checkboxes — adapt to actual events -->
      <label>Events Attending</label>
      <label class="check-item"><input type="checkbox" name="events" value="Ceremony" checked><span>Ceremony</span></label>
      <label class="check-item"><input type="checkbox" name="events" value="Dinner" checked><span>Dinner</span></label>
    </div>

    <div class="field">
      <label for="f-note">Message (optional)</label>
      <textarea id="f-note" name="note" rows="3" placeholder="Wishes or a note..."></textarea>
    </div>

    <div id="rsvp-status" role="alert" aria-live="polite"></div>
    <button type="submit" id="rsvp-submit">Send RSVP via WhatsApp</button>
  </form>
</section>
```

CSS:
```css
    .rsvp-section { padding: clamp(48px, 8vh, 100px) clamp(16px, 6vw, 40px); }
    #rsvp-form { max-width: 540px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }

    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { color: var(--primary); font-family: var(--serif); font-size: clamp(1rem, 2vw, 1.1rem); }
    .field input, .field select, .field textarea {
      width: 100%; padding: 12px 16px;
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(231,191,133,0.35);
      border-radius: 8px; color: var(--text);
      font-family: var(--sans); font-size: 0.95rem; outline: none;
      transition: border-color 0.25s;
    }
    .field input:focus, .field select, .field textarea:focus { border-color: var(--primary); }
    .field input::placeholder, .field textarea::placeholder { color: rgba(255,255,255,0.35); }
    .field textarea { min-height: 80px; resize: vertical; }

    .field.is-invalid input, .field.is-invalid textarea { border-color: #e74c3c; }
    .field-error { display: none; font-size: 0.8rem; color: #e74c3c; }
    .field.is-invalid .field-error { display: block; }

    .toggle-group { display: flex; gap: 10px; }
    .toggle-btn { flex: 1; text-align: center; cursor: pointer; }
    .toggle-btn input { display: none; }
    .toggle-btn span {
      display: block; padding: 10px 6px; border-radius: 8px;
      border: 1px solid rgba(231,191,133,0.4);
      color: var(--text-muted); font-size: 0.85rem; transition: 0.25s;
    }
    .toggle-btn input:checked + span {
      background: linear-gradient(135deg, var(--primary-dark), var(--primary));
      color: var(--bg); border-color: var(--primary); font-weight: 600;
    }
    .check-item { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 4px 0; }
    .check-item input { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; }
    .check-item span { color: var(--text); font-size: 0.9rem; }

    #rsvp-status { font-size: 0.85rem; min-height: 24px; }
    #rsvp-status.success { color: #2ecc71; }
    #rsvp-status.error   { color: #e74c3c; }

    #rsvp-submit {
      width: 100%; padding: 15px;
      background: linear-gradient(135deg, var(--primary-dark), var(--primary), var(--primary-light));
      color: var(--bg); border: none; border-radius: 30px;
      font-family: var(--sans); font-size: 1rem; font-weight: 600;
      letter-spacing: 0.05em; cursor: pointer;
      box-shadow: 0 5px 20px rgba(231,191,133,0.3);
      transition: transform 0.2s;
    }
    #rsvp-submit:active { transform: scale(0.98); }

    @media (min-width: 700px) {
      /* Desktop: name + phone side by side — wrap them in .field-row div in HTML */
      /* .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } */
    }
```

JS:
```js
(function() {
  const form    = document.getElementById('rsvp-form');
  const status  = document.getElementById('rsvp-status');
  const extra   = document.getElementById('extra-fields');
  const HOST_PHONE = '918200482291'; // full number with country code, no +

  // Show/hide extra fields based on attendance toggle
  form.querySelectorAll('[name="attend"]').forEach(r => {
    r.addEventListener('change', () => {
      if (extra) extra.style.display = r.value.toLowerCase().includes('declin') ? 'none' : '';
    });
  });

  function fieldEl(input) { return input.closest('[data-field]'); }
  function validate() {
    let ok = true;
    ['f-name', 'f-phone'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const parent = fieldEl(el);
      if (!el.value.trim()) {
        if (parent) parent.classList.add('is-invalid');
        ok = false;
        el.addEventListener('input', () => { if (el.value.trim() && parent) parent.classList.remove('is-invalid'); }, { once: true });
      } else {
        if (parent) parent.classList.remove('is-invalid');
      }
    });
    return ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) {
      status.className = 'error';
      status.textContent = 'Please fill in your name and phone number.';
      return;
    }

    const name    = document.getElementById('f-name').value.trim();
    const phone   = document.getElementById('f-phone').value.trim();
    const attend  = (form.querySelector('[name="attend"]:checked')?.value) || '';
    const count   = document.getElementById('f-count')?.value || '1';
    const events  = [...form.querySelectorAll('[name="events"]:checked')].map(el => el.value).join(', ') || 'None';
    const note    = document.getElementById('f-note')?.value.trim() || '';

    // ── STYLIZED LUXURY WHATSAPP MESSAGE ──
    const isAccepting = !attend.toLowerCase().includes('declin');
    const attendBadge = isAccepting ? '✅ *Joyfully Accept* 🥂' : '🕊️ *Regretfully Decline*';

    let msg = `✨ *[Event Name] — RSVP* ✨\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `👤 *Guest:* ${name}\n`;
    msg += `📞 *Phone:* ${phone}\n`;
    msg += `💌 *Response:* ${attendBadge}\n`;

    if (isAccepting) {
      msg += `👥 *Total Guests:* ${count}\n`;
      if (events && events !== 'None') {
        msg += `🗓️ *Events Attending:* ${events}\n`;
      }
    }

    if (note) {
      msg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `💬 *Personal Note:*\n_${note}_\n`;
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_Sent via Digital Invitation_`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 900;
    const base = isMobile ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
    window.open(`${base}?phone=${HOST_PHONE}&text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');

    status.className = 'success';
    status.textContent = '✓ Opening WhatsApp with your RSVP…';
    setTimeout(() => { form.reset(); status.textContent = ''; if (extra) extra.style.display = ''; }, 2000);
  });
})();
```

> [!TIP]
> **WhatsApp RSVP Message Styling Rules:**
> - Never send raw plain text like `Name: John`.
> - Always wrap headlines with decorative emojis (`✨ *Event Name — RSVP* ✨`).
> - Use visual divider lines (`━━━━━━━━━━━━━━━━━━━━━━`) to structure sections neatly.
> - Use contextual emojis for labels (`👤 Guest:`, `📞 Phone:`, `💌 Response:`, `👥 Guests:`, `🗓️ Events:`, `💬 Note:`).
> - Format notes and quotes in italics `_“message”_` for a heartfelt handwritten look.
> - Format attendance badges clearly (`✅ *Joyfully Accept* 🥂` vs `🕊️ *Regretfully Decline*`).

---

## 13. SCROLL REVEAL (IntersectionObserver)

CSS:
```css
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .reveal.revealed { opacity: 1; transform: translateY(0); }

    /* Stagger siblings */
    .reveal:nth-child(2) { transition-delay: 80ms; }
    .reveal:nth-child(3) { transition-delay: 160ms; }
    .reveal:nth-child(4) { transition-delay: 240ms; }

    @media (prefers-reduced-motion: reduce) {
      .reveal { opacity: 1; transform: none; transition: none; }
    }
```

JS (run after intro completes, not before):
```js
const revealObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
```

Add `.reveal` class to any section, card, or element that should animate in on scroll.

---

## 14. COMPLETE JS BLOCK — STRUCTURE

All JS goes in one `<script>` at bottom of `<body>`. Order matters:

```js
// ── 1. VIEWPORT HEIGHT — RUNS IMMEDIATELY ──
function setActualVh() {
  const h = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--actual-vh', `${h * 0.01}px`);
}
setActualVh();
(window.visualViewport ?? window).addEventListener('resize', setActualVh);

// ── 2. SCROLL RESET — RUNS IMMEDIATELY ──
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ── 3. MUSIC STATE ──
const bgm      = document.getElementById('bg-music');
const fab      = document.getElementById('music-fab');
const fabOn    = document.getElementById('fab-icon-on');
const fabOff   = document.getElementById('fab-icon-off');
bgm.volume = 0.35;

function updateFab(playing) {
  if (fabOn)  fabOn.style.display  = playing ? '' : 'none';
  if (fabOff) fabOff.style.display = playing ? 'none' : '';
  if (fab) fab.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
}

function startMusic() {
  if (!bgm.paused) return;
  bgm.play().then(() => updateFab(true)).catch(() => updateFab(false));
}

if (fab) {
  fab.addEventListener('click', e => {
    e.stopPropagation();
    bgm.paused ? startMusic() : (bgm.pause(), updateFab(false));
  });
}
bgm.addEventListener('pause', () => updateFab(false));
bgm.addEventListener('play',  () => updateFab(true));

// ── 4. INTRO ── (choose 4A or 4B below)

// ── 4A — VIDEO INTRO ──
(function() {
  const layer     = document.getElementById('intro-layer');
  const video     = document.getElementById('intro-video');
  const tapPrompt = document.getElementById('tap-prompt');
  const scrollInd = document.getElementById('scroll-indicator');
  let opened = false;

  function reveal() {
    if (opened) return;
    opened = true;
    layer.style.opacity = '0';
    startMusic(); // music starts AFTER video — not on tap
    if (fab) fab.classList.add('visible');
    setTimeout(() => {
      layer.style.display = 'none';
      document.body.classList.add('unlocked');
      if (scrollInd) scrollInd.classList.add('visible');
      initScrollReveal(); // start IntersectionObserver after unlock
    }, 1200);
  }

  layer.addEventListener('click', () => {
    if (opened) return;
    if (tapPrompt) tapPrompt.style.display = 'none';

    // Pre-unlock audio context on this gesture
    bgm.muted = true;
    bgm.play().then(() => bgm.pause()).catch(() => {});
    bgm.muted = false; bgm.currentTime = 0;

    video.muted = false; video.volume = 1.0;
    video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });

    video.addEventListener('ended', reveal, { once: true });
    video.addEventListener('timeupdate', () => {
      if (video.duration && video.currentTime >= video.duration - 1.4) reveal();
    });
    setTimeout(() => { if (!opened) reveal(); }, 10000); // safety fallback
  });
})();

// ── 4B — CSS ENVELOPE INTRO ──
// (function() {
//   const layer     = document.getElementById('intro-layer');
//   const scrollInd = document.getElementById('scroll-indicator');
//   let opened = false;
//
//   function reveal() {
//     layer.classList.add('is-hidden');
//     if (fab) fab.classList.add('visible');
//     setTimeout(() => {
//       layer.style.display = 'none';
//       document.body.classList.add('unlocked');
//       if (scrollInd) scrollInd.classList.add('visible');
//       initScrollReveal();
//     }, 800); // after fade-out
//   }
//
//   layer.addEventListener('click', () => {
//     if (opened) return;
//     opened = true;
//     layer.classList.add('is-opening'); // triggers CSS envelope animation
//     startMusic(); // music starts immediately — envelope has no sound
//     setTimeout(reveal, 2800); // after animation completes
//   }, { once: true });
// })();

// ── 5. SCROLL INDICATOR ──
const scrollInd = document.getElementById('scroll-indicator');
if (scrollInd) {
  scrollInd.addEventListener('click', () => {
    // Scroll to first section after hero
    const firstSection = document.querySelector('main > section:nth-child(2), #app > section:nth-child(2)');
    if (firstSection) firstSection.scrollIntoView({ behavior: 'smooth' });
  });
  window.addEventListener('scroll', () => {
    scrollInd.classList.toggle('hidden', window.scrollY > 50);
  }, { passive: true });
}

// ── 6. SCROLL REVEAL ──
function initScrollReveal() {
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); o.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── 7. EMBLA CAROUSEL (if used) ──
// (function() {
//   const root = document.getElementById('photo-carousel');
//   const dots = document.getElementById('carousel-dots');
//   if (!window.EmblaCarousel || !root) return;
//   const embla = EmblaCarousel(root, { align: 'start', containScroll: 'trimSnaps', loop: false });
//   let dotEls = [], timer;
//
//   function buildDots() {
//     dots.innerHTML = '';
//     dotEls = embla.scrollSnapList().map((_, i) => {
//       const b = document.createElement('button');
//       b.type = 'button'; b.className = 'carousel-dot';
//       b.addEventListener('click', () => embla.scrollTo(i));
//       dots.appendChild(b); return b;
//     });
//     updateDots();
//   }
//   function updateDots() {
//     const s = embla.selectedScrollSnap();
//     dotEls.forEach((d, i) => d.classList.toggle('active', i === s));
//   }
//   function stopAuto() { clearInterval(timer); timer = null; }
//   function startAuto() {
//     stopAuto();
//     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
//     timer = setInterval(() => embla.canScrollNext() ? embla.scrollNext() : embla.scrollTo(0), 4000);
//   }
//   embla.on('select', updateDots);
//   embla.on('reInit', buildDots);
//   buildDots();
//   root.addEventListener('pointerdown', stopAuto);
//   root.addEventListener('pointerup', () => setTimeout(startAuto, 1200));
//   new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting ? startAuto() : stopAuto()), { threshold: 0.25 }).observe(root);
// })();

// ── 8. CANVAS PETALS — see Section 11 above ──

// ── 9. COUNTDOWN TIMER — see Section 10 above ──

// ── 10. WHATSAPP RSVP — see Section 12 above ──

// ── 11. FANCYBOX (if used) ──
// if (typeof Fancybox !== 'undefined') Fancybox.bind('[data-fancybox]', { Hash: false });
```

---

## 15. FOOTER

Always include safe area padding so home indicators on iPhone and gesture navigation on Android do not collide with footer text:

```html
<footer class="footer" style="padding: clamp(40px,6vh,80px) max(20px, env(safe-area-inset-right, 0px)) calc(clamp(40px,6vh,80px) + env(safe-area-inset-bottom, 0px)) max(20px, env(safe-area-inset-left, 0px)); text-align: center; border-top: 1px solid rgba(231,191,133,0.2);">
  <p style="font-family:var(--script); font-size:clamp(1.8rem,5vw,2.8rem); color:var(--primary);">Thank You</p>
  <p style="color:var(--text-muted); font-size:0.85rem; margin-top:8px; letter-spacing:0.05em;">With the blessings of our elders and the warmth of your presence</p>
  <p style="margin-top:24px; font-size:0.75rem; color:var(--text-muted);">
    Designed by <a href="https://invitebox.in/" target="_blank" rel="noreferrer" style="color:var(--primary); text-decoration:none; font-weight:600;">Invite&nbsp;Box</a>
  </p>
</footer>
```

---

## 16. BUILD CHECKLIST

- [ ] `viewport-fit=cover` in meta tag
- [ ] `setActualVh()` is first code in script block
- [ ] `scrollRestoration = 'manual'` + `scrollTo(0,0)` at top
- [ ] `body { overflow: hidden }` on load; `body.unlocked` added only when intro ends
- [ ] Intro type decided: video (music after video) or envelope (music on tap)
- [ ] FAB: `bottom: max(72px, calc(env(safe-area-inset-bottom,0px) + 38px))`
- [ ] Footer safe area padding: `padding-bottom` includes `env(safe-area-inset-bottom, 0px)`
- [ ] FAB hidden initially, `.visible` added in `reveal()` function
- [ ] Scroll indicator hidden initially, `.visible` added in `reveal()` function
- [ ] All overlays use 5-line height cascade
- [ ] Hero section uses 5-line min-height cascade
- [ ] All headline sizes use `clamp()`
- [ ] All section padding uses `clamp()`
- [ ] Canvas: petal count capped 10–30, resize uses `visualViewport?.height`
- [ ] `prefers-reduced-motion` skips canvas loop and disables transitions
- [ ] RSVP validates name + phone before sending
- [ ] WhatsApp message properly encoded with stylized emojis and borders
- [ ] WhatsApp URL: `api.whatsapp.com` for mobile, `web.whatsapp.com` for desktop
- [ ] `initScrollReveal()` called AFTER `body.unlocked` — not before
- [ ] Embla autoplay pauses via IntersectionObserver when off-screen
- [ ] All icons are inline SVG — no icon fonts
- [ ] Gallery images have `loading="lazy"`; hero/above-fold images do NOT
- [ ] Invite Box credit link in footer
- [ ] OG image is 1200×630px WebP or PNG
