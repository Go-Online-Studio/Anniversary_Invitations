# 📋 Master SOP: Converting Mobile-Only Invitations to Fully Responsive

This guide provides a standardized, repeatable blueprint to convert mobile-only digital wedding invitation templates into fluid, responsive, multi-device experiences (Mobile, Tablet, Desktop, and 4K Displays).

---

## 📑 Summary of Key Changes

1. **Responsive Asset Loading**: Dynamically serving desktop & mobile video intros, video poster thumbnails, and hero background images using CSS media queries and JS viewport detection.
2. **Adaptive `<head>` Preloads**: Preloading assets matching device viewports using `media="(max-width: 767.98px)"` and `media="(min-width: 768px)"`.
3. **Fluid Layout Architecture**: Uncapped `#app` max-width, removed landscape warnings, and applied CSS Grid / Flexbox wrapping across all sections.
4. **Component Stability**:
   - **Hero Banner**: Vertically and horizontally bound in a 100vh viewport container.
   - **Scratch Card**: Responsive dynamic canvas sizing to avoid stretching.
   - **Swiper Slide**: Integer slide breakpoints and overflow masking to prevent infinite-loop glitching.
   - **RSVP Form**: 2-column desktop grid.

---

## 🛠️ Step-by-Step Implementation Guide

### Step 1: Responsive Preloads (`<head>`)

Add media-conditioned preloads in the `<head>` of `index.html` so users only download assets for their screen resolution:

```html
<!-- 1. Responsive Curtain Videos -->
<link
  rel="preload"
  href="URL_TO_MOBILE_VIDEO.mp4"
  as="video"
  type="video/mp4"
  media="(max-width: 767.98px)"
  fetchpriority="high"
/>
<link
  rel="preload"
  href="URL_TO_DESKTOP_VIDEO.mp4"
  as="video"
  type="video/mp4"
  media="(min-width: 768px)"
  fetchpriority="high"
/>

<!-- 2. Responsive Thumbnails / Posters -->
<link
  rel="preload"
  href="images/ThumbMobile.webp"
  as="image"
  media="(max-width: 767.98px)"
  fetchpriority="high"
/>
<link
  rel="preload"
  href="images/ThumbDesktop.webp"
  as="image"
  media="(min-width: 768px)"
  fetchpriority="high"
/>

<!-- 3. Responsive Banner Backgrounds -->
<link
  rel="preload"
  href="images/BannerBG.avif"
  as="image"
  media="(max-width: 767.98px)"
  fetchpriority="high"
/>
<link
  rel="preload"
  href="images/BannerBG_Desktop.avif"
  as="image"
  media="(min-width: 768px)"
  fetchpriority="high"
/>
```

---

### Step 2: Global Constraints & Typography (CSS)

1. **Uncap Container Width**:
   ```css
   /* Change from max-width: 480px to full fluid width */
   #app {
     width: 100%;
     min-height: 100vh;
     margin: 0 auto;
     background: var(--off-white);
     position: relative;
   }
   ```
2. **Remove Landscape Blocker**: Remove `#landscape-warning` element and its CSS.
3. **Fluid Typography & Spacing**:
   ```css
   .hero-names {
     font-size: clamp(2.8rem, 9vw, 6.5rem);
   } /*similar not same*/
   .section-title {
     font-size: clamp(2.4rem, 6vw, 4.5rem);
   } /*similar not same*/
   .section-subtitle {
     font-size: clamp(0.65rem, 1.5vw, 0.85rem);
   } /*similar not same*/
   ```

---

### Step 3: Hero Section & Background Setup

```css
/* ── Hero ── */
.hero-sec {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 4vh, 4rem) clamp(1.5rem, 4vw, 3rem);
  background: url("images/BannerBG.avif") center/cover no-repeat;
  position: relative;
  overflow: hidden;
  text-align: center;
  transition: background-image 0.3s ease;
}

@media (min-width: 768px) {
  .hero-sec {
    background-image: url("images/BannerBG_Desktop.avif");
  }
}

.hero-content-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 900px;
  margin: auto;
  position: relative;
  z-index: 2;
}
```

---

### Step 4: Curtain Intro Video & Thumbnail Switching

#### A. HTML (`#curtain-layer`)

```html
<div id="curtain-layer" onclick="openCurtain()">
  <video
    id="curtain-video"
    playsinline
    webkit-playsinline
    disablePictureInPicture
    preload="auto"
    poster="images/ThumbMobile.webp"
>
    <source
      src="URL_TO_DESKTOP_VIDEO.mp4"
      type="video/mp4"
      media="(min-width: 768px)"
    />
    <source src="URL_TO_MOBILE_VIDEO.mp4" type="video/mp4" />
  </video>
  <div class="tap-overlay">
    <div class="tap-btn">
      <span>TAP TO OPEN</span>
    </div>
    <p class="tap-subtext">Touch anywhere to reveal invitation</p>
  </div>
</div>
```

#### B. JavaScript Setup

```javascript
/* ════════════════════════════════════════
   CURTAIN / VIDEO INTRO
════════════════════════════════════════ */
let curtainOpened = false;
const MOBILE_VIDEO_SRC = "URL_TO_MOBILE_VIDEO.mp4";
const DESKTOP_VIDEO_SRC = "URL_TO_DESKTOP_VIDEO.mp4";
const MOBILE_POSTER_SRC = "images/ThumbMobile.webp";
const DESKTOP_POSTER_SRC = "images/ThumbDesktop.webp";

function checkIsMobileView() {
  const isLandscape = window.matchMedia && window.matchMedia('(orientation: landscape)').matches;
  if (isLandscape && window.innerWidth >= 480) {
    return false; // use horizontal/desktop 16:9 video on phones rotated to landscape
  }
  return window.innerWidth < 768;
}

function updateVideoSourceAndPoster() {
  if (curtainOpened) return;
  const video = document.getElementById("curtain-video");
  if (!video) return;

  const isMobile = checkIsMobileView();
  const targetSrc = isMobile ? MOBILE_VIDEO_SRC : DESKTOP_VIDEO_SRC;
  const targetPoster = isMobile ? MOBILE_POSTER_SRC : DESKTOP_POSTER_SRC;

  // 1. Update poster first before reload
  if (targetPoster && video.getAttribute("poster") !== targetPoster) {
    video.poster = targetPoster;
    video.setAttribute("poster", targetPoster);
  }

  // 2. Update source and video element
  if (video.getAttribute("data-active-src") !== targetSrc) {
    video.setAttribute("data-active-src", targetSrc);
    const source = video.querySelector("source");
    if (source) {
      source.src = targetSrc;
    }
    video.src = targetSrc;
    video.load();
  }
}

// Initial load check
window.addEventListener("DOMContentLoaded", updateVideoSourceAndPoster);

// Fast resize debounce (120ms)
let videoResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(videoResizeTimer);
  videoResizeTimer = setTimeout(updateVideoSourceAndPoster, 120);
});

// Device rotation / orientation support
window.addEventListener("orientationchange", () => {
  updateVideoSourceAndPoster();
  setTimeout(updateVideoSourceAndPoster, 150);
  setTimeout(updateVideoSourceAndPoster, 350);
});
if (window.screen && window.screen.orientation) {
  window.screen.orientation.addEventListener("change", () => {
    updateVideoSourceAndPoster();
    setTimeout(updateVideoSourceAndPoster, 150);
    setTimeout(updateVideoSourceAndPoster, 350);
  });
}

function openCurtain() {
  if (curtainOpened) return;
  curtainOpened = true;

  const layer = document.getElementById("curtain-layer");
  const video = document.getElementById("curtain-video");
  const tapEl = document.querySelector(".tap-overlay");
  const audio = document.getElementById("bg-music");

  if (tapEl) tapEl.style.display = "none";

  if (video && !video.src) {
    updateVideoSourceAndPoster();
  }

  if (audio) {
    audio.muted = true;
    audio
      .play()
      .then(() => audio.pause())
      .catch(() => {});
    audio.muted = false;
    audio.currentTime = 0;
    audio.volume = 0.5;
  }

  if (video) {
    video.muted = false;
    video.volume = 1.0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.warn("Unmuted playback error, falling back to muted:", e);
        video.muted = true;
        video.play().catch((err) => console.log("Video play failed:", err));
      });
    }
  }

  let revealed = false;
  function revealContent() {
    if (revealed) return;
    revealed = true;

    if (layer) layer.classList.add("fading");
    if (typeof tryAutoPlayMusic === "function") tryAutoPlayMusic();

    const audioCtrl = document.getElementById("audio-ctrl") || document.getElementById("music-fab");
    if (audioCtrl) audioCtrl.classList.add("visible");

    setTimeout(() => {
      if (layer) layer.style.display = "none";
      document.body.classList.add("unlocked");
      if (typeof initAOS === "function") initAOS();
      if (typeof initCeremonySwiper === "function") initCeremonySwiper();
      const ind = document.getElementById("scroll-down-indicator");
      if (ind) ind.classList.add("visible");
      if (video) {
        try {
          video.pause();
        } catch (e) {}
      }
    }, 1200);
  }

  if (video) {
    video.ontimeupdate = () => {
      if (video.duration && video.currentTime >= video.duration - 1.4)
        revealContent();
    };
    video.onended = revealContent;
  }

  // Safety fallback
  setTimeout(() => {
    if (!revealed) revealContent();
  }, 8000);
}
```

---

### Step 5: Essential Checks for Remaining Sections

#### 1. Scratch Card (Dynamic Canvas Resizing)
```javascript
function resizeScratchCanvas() {
  const container = document.querySelector(".scratch-container");
  const canvas = document.getElementById("scratch-canvas");
  if (!container || !canvas) return;
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  // Re-draw scratch overlay here
}
window.addEventListener("resize", resizeScratchCanvas);
```

#### 2. Swiper Breakpoints
```javascript
new Swiper(".ceremony-swiper", {
  slidesPerView: 1,
  spaceBetween: 24,
  grabCursor: true,
  loop: true,
  speed: 600,
  breakpoints: {
    640: { slidesPerView: 1, spaceBetween: 24 },
    768: { slidesPerView: 2, spaceBetween: 28 },
    1024: { slidesPerView: 3, spaceBetween: 32 },
  },
});
```

#### 3. Video Intro & Device Rotation Rules
- **Fast Debounce (100–150ms)**: Implement a fast debounce (120ms) on `resize` to prevent video reload lag while user drags browser borders.
- **Orientation & Rotation Support**: Always listen to `orientationchange` and `screen.orientation.change` with staggered timeouts (0ms, 150ms, 350ms) because mobile browsers (iOS Safari, Android Chrome) take 100–200ms to complete layout reflow after rotation.
- **Landscape Detection**: Do not rely purely on `window.innerWidth < 768`. If a phone is turned to landscape (`orientation: landscape` and `innerWidth >= 480`), serve the horizontal (desktop/16:9) video.
- **Pre-set Poster & Sync `<source>`**: Update `video.poster` before `video.load()`, and sync the child `<source>` element's `src` along with `video.src` to prevent HTMLMediaElement desynchronization.

---

## ⚡ Quick Conversion Checklist for Future Templates
- [ ] **Assets**: Add Desktop & Mobile video URLs and poster thumbnails in JS constants.
- [ ] **Preloads**: Add responsive `<link rel="preload" />` in `<head>`.
- [ ] **Banner**: Add `@media (min-width: 768px)` background image in CSS.
- [ ] **Video Intro**: Verify the responsive video loader logic runs on load, resize, and rotation, and ensure `resize` listener is debounced (120ms).
- [ ] **Swiper**: Check `overflow: hidden !important;` and slide breakpoints (1, 2, 3).
- [ ] **RSVP**: Check grid structure.
