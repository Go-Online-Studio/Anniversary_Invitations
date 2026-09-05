# 📱 Mobile Viewport Fix Guide
### General Instructions for HTML Invitations

> **Target:** Any invitation `index.html` experiencing viewport cropping.
> **Symptoms:** Hero banner cropped, FAB audio button hidden behind Android nav bar,
> `env()` safe-area values returning 0 on iOS.

---

## Table of Contents

1. [Common Issues to Fix](#1-common-issues-to-fix)
2. [Step-by-Step Fixes](#2-step-by-step-fixes)
3. [How `viewport-fit=cover` Works](#3-how-viewport-fitcover-works)
4. [How `env()` and Safe Area Insets Work](#4-how-env-and-safe-area-insets-work)
5. [How `svh` Works](#5-how-svh-works)
6. [How `dvh` Works](#6-how-dvh-works)
7. [The CSS Height Cascade — All Together](#7-the-css-height-cascade--all-together)
8. [The JS `visualViewport` Fallback](#8-the-js-visualviewport-fallback)
9. [Browser Support Table](#9-browser-support-table)
10. [Debugging Checklist](#10-debugging-checklist)
11. [Quick Reference Cheatsheet](#11-quick-reference-cheatsheet)

---

## 1. Common Issues to Fix

### Bug 1 — `viewport-fit=cover` missing (Critical)

```html
<!-- ❌ Broken Meta Tag -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- ✅ Fixed Meta Tag -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

**Impact:** Without `viewport-fit=cover`, iOS Safari returns `0` for ALL
`env(safe-area-inset-*)` values. Every `env()` call in the CSS will silently return 0.
The banner padding and FAB positioning will do nothing on iPhones.

This is a hard requirement — `env()` is completely non-functional without it on iOS.

---

### Bug 2 — FAB button clipped behind Android 3-button nav bar

```css
/* ❌ Broken — max floor of 28px, Android nav bar is ≈48px tall */
bottom: max(28px, calc(20px + env(safe-area-inset-bottom, 0px)));

/* ✅ Fixed — max floor of 72px, always clears the nav bar */
bottom: max(72px, calc(env(safe-area-inset-bottom, 0px) + 38px));
```

Android devices with the 3-button navigation bar (Back / Home / Recents) have a bar
that is approximately **48px tall**. If the `max()` floor is lower than the
nav bar, the FAB button renders **underneath** it — invisible and untappable.

Note: On Android, `env(safe-area-inset-bottom)` often returns 0 (it is unreliable unless
the device has a display cutout AND the browser explicitly supports it). The `max()` floor
is what actually saves it on Android — not `env()`.

---

### Bug 3 — No JS fallback for older browsers

Chrome < 108, Samsung Internet < 21, and other older Android browsers do not support
`dvh` or `svh`. On those browsers, `100vh` is used — which is the full screen height
including the browser toolbar. Content at the bottom gets clipped.

**Fix:** Add a JavaScript `visualViewport` API listener that sets a CSS custom property
`--actual-vh` which CSS then uses as the last (highest priority) height value.

---

## 2. Step-by-Step Fixes

Apply these changes to **each invitation HTML file** to fix viewport cropping issues:

| Step | Action | Target Location |
|---|------|--------------|
| 1 | Add `viewport-fit=cover` to the viewport meta tag | `<head>` -> `<meta name="viewport">` |
| 2 | Update FAB bottom positioning to use a higher `max()` floor (e.g., `max(72px, ...)`) | CSS (e.g., `#mfab`, `.fab-container`) |
| 3 | Apply progressive height cascade (`100vh`, `100svh`, `100dvh`, `calc(var(--actual-vh, 1vh) * 100)`) | CSS (e.g., `.hero-banner-sec`, `#curtain-layer`, `#app`) |
| 4 | Ensure all padding for safe areas uses `max()` instead of just `calc()` to prevent zero-padding | CSS |
| 5 | Add the `setActualVh()` JS snippet utilizing `visualViewport` API | Top of the main `<script>` tag |

---

## 3. How `viewport-fit=cover` Works

### The Problem It Solves

Modern phones have non-rectangular screens:
- **Notches** at the top (camera cutout)
- **Rounded corners** at all four corners
- **Home indicator bar** at the bottom (iPhone X and newer)
- **Punch-hole cameras** on Android flagships

Without `viewport-fit=cover`, browsers **letterbox** the page — they shrink the layout
into a safe rectangle in the middle of the screen to avoid the cutouts, and they refuse
to tell you how big those cutouts are (`env()` returns 0).

### Visual Diagram

```
Without viewport-fit=cover:          With viewport-fit=cover:

+----------------------+             +----------------------+
|   ██████ (notch)     |             |   ██████ (notch)     |
| +------------------+ |             | PAGE RENDERS HERE    |
| |                  | |             |                      |
| |  your page only  | |             |  your page           |
| |  renders here    | |             |                      |
| |                  | |             | PAGE RENDERS HERE    |
| +------------------+ |             | ▬▬▬ (home bar)       |
|   ▬▬▬ (home bar)     |             +----------------------+
+----------------------+
  env() always = 0                     env() = actual inset px
```

With `viewport-fit=cover`, the page renders edge-to-edge. You then use `env()` to
**push your content away** from the unsafe areas manually.

### Values

| Value | Behavior |
|-------|----------|
| `auto` (default) | Browser letterboxes the page into the safe rectangle |
| `contain` | Same as auto — page contained within safe area |
| `cover` | Page fills the entire screen including unsafe areas. `env()` becomes active. |

---

## 4. How `env()` and Safe Area Insets Work

### Syntax

```css
/* Basic */
padding-bottom: env(safe-area-inset-bottom);

/* With fallback (strongly recommended) */
padding-bottom: env(safe-area-inset-bottom, 0px);

/* Combined with max() to guarantee a minimum */
bottom: max(72px, calc(env(safe-area-inset-bottom, 0px) + 38px));

/* Combined with calc() */
padding: calc(env(safe-area-inset-top, 0px) + 14px) 16px
         calc(env(safe-area-inset-bottom, 0px) + 14px);
```

### The Four Insets

| Property | What it measures | Typical value |
|----------|-----------------|---------------|
| `env(safe-area-inset-top)` | Notch / status bar height | iPhone 14: ~59px |
| `env(safe-area-inset-bottom)` | Home bar / gesture strip | iPhone 14: ~34px |
| `env(safe-area-inset-left)` | Left notch in landscape | varies |
| `env(safe-area-inset-right)` | Right notch in landscape | varies |

### Real Device Values

| Device | inset-top | inset-bottom |
|--------|-----------|--------------|
| iPhone SE (3rd gen) | 20px | 0px (physical home button) |
| iPhone 13 mini | 50px | 34px |
| iPhone 14 Pro | 59px | 34px |
| iPhone 15 Pro Max | 59px | 34px |
| Android Pixel 7 | 0px | 0px (uses gesture nav) |

> **Note:** Android `env()` support is inconsistent. Many Androids return 0 even with
> `viewport-fit=cover`. The `max()` floor values are what save the layout on Android.

### Why `max()` is Better than `calc()` for Padding

```css
/* ❌ calc() alone — if env() returns 0, padding is just 14px. No safety floor. */
padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 14px);

/* ✅ max() — result is always at least 22px, no matter what env() returns */
padding-bottom: max(22px, calc(env(safe-area-inset-bottom, 0px) + 14px));
```

---

## 5. How `svh` Works

`svh` = **Small Viewport Height**

1 `svh` = 1% of the viewport height measured when browser chrome is **fully expanded**
(address bar fully visible, toolbars fully shown). This is the smallest the viewport ever is.

```css
height: 100svh; /* Always the MINIMUM visible height */
```

### Behaviour

```
Browser toolbar OPEN:              Browser toolbar HIDDEN (scrolled down):
+-------------------+              +-------------------+
|  [address bar]    |              |                   |
+-------------------+              |                   |
|                   |              |                   |
|  100svh = this    |              |  100svh = same    |  <- does NOT grow
|  (stable value)   |              |  (stays same)     |
|                   |              |                   |
|  [home bar]       |              |  [home bar]       |
+-------------------+              +-------------------+
```

`svh` is **stable** — its value is locked to the smallest viewport (toolbar open).

**Use when:** Content must be fully visible even with address bar open. Good safe default.

---

## 6. How `dvh` Works

`dvh` = **Dynamic Viewport Height**

1 `dvh` = 1% of the **current** visible viewport height, updated in real-time as the
browser chrome shows or hides.

```css
height: 100dvh; /* Always fills the CURRENT visible area exactly */
```

### Behaviour

```
Browser toolbar OPEN:              Browser toolbar HIDDEN (scrolled down):
+-------------------+              +-------------------+
|  [address bar]    |              |                   |
+-------------------+              |                   |
|                   |              |                   |
|  100dvh = this    |              |  100dvh = this    | <- GROWS when toolbar hides
|  (smaller)        |              |  (larger now)     |
|                   |              |                   |
|  [home bar]       |              |  [home bar]       |
+-------------------+              +-------------------+
```

`dvh` **changes** as the user scrolls. Great for fixed overlays and curtain layers.

**Use when:** Full-screen overlays, video curtains, modals that must fill exactly the visible area.

---

## 7. The CSS Height Cascade — All Together

```css
.hero-banner-sec {
    height: 100vh;
    /*
     * Baseline for all browsers. May clip behind toolbar/nav bar.
     * Used by: IE11, Chrome < 56, very old browsers.
     */

    height: -webkit-fill-available;
    /*
     * Old Safari/WebKit specific. Partially respects the visible area.
     * Used by: Safari < 15.4 on iOS.
     */

    height: 100svh;
    /*
     * Stable viewport height. Excludes browser toolbar from measurement.
     * Used by: iOS Safari 15.4+, Chrome 108+, Firefox 101+.
     */

    height: 100dvh;
    /*
     * Dynamic viewport height. Updates as toolbar shows/hides.
     * Wins over svh in same browser since it comes after.
     * Used by: iOS Safari 15.4+, Chrome 108+, Firefox 101+.
     */

    height: calc(var(--actual-vh, 1vh) * 100);
    /*
     * JS-powered override via visualViewport API.
     * The `1vh` fallback means CSS degrades gracefully if JS hasn't run.
     * This is the most accurate value of all when JS runs.
     */
}
```

The cascade rule: CSS applies each line and the **last one the browser understands wins**.

---

## 8. The JS `visualViewport` Fallback

### Why It's Needed

Even `dvh` and `svh` have gaps:
- Not supported in Chrome < 108
- Not supported in Samsung Internet < 21
- Unreliable in in-app browsers / WebViews (Instagram, WhatsApp, etc.)

The `visualViewport` API is supported much more broadly (Chrome 61+, Safari 13+).

### The Code

```js
function setActualVh() {
    // visualViewport.height excludes:
    //   - Android 3-button navigation bar
    //   - iOS browser toolbar and address bar
    //   - On-screen keyboard (when open)
    //   - iOS home indicator bar
    const h = window.visualViewport
        ? window.visualViewport.height  // Most accurate
        : window.innerHeight;           // Fallback

    // Store as px per 1vh equivalent
    // e.g., height = 723px → --actual-vh = 7.23px
    // then calc(var(--actual-vh) * 100) = 723px (exact visible height)
    document.documentElement.style.setProperty('--actual-vh', `${h * 0.01}px`);
}

// Run immediately — so CSS is correct before first paint
setActualVh();

// Update whenever visible area changes:
// - Orientation change, toolbar show/hide, keyboard open/close
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setActualVh);
} else {
    window.addEventListener('resize', setActualVh);
}
```

### `visualViewport` vs `window.innerHeight`

| API | Excludes OS nav bar? | Excludes keyboard? | Excludes browser toolbar? |
|-----|---------------------|--------------------|-----------------------------|
| `window.innerHeight` | Sometimes | No | Partly |
| `window.visualViewport.height` | Yes | Yes | Yes |

---

## 9. Browser Support Table

| Feature | Chrome | Firefox | Safari iOS | Samsung Internet | WebView Android |
|---------|--------|---------|-----------|-----------------|----------------|
| `viewport-fit=cover` | 69+ | 105+ | 11+ | 10.1+ | 69+ |
| `env(safe-area-inset-*)` | 69+ | 65+ | 11.2+ | 10.1+ | 69+ |
| `svh` | 108+ | 101+ | 15.4+ | 21+ | 108+ |
| `dvh` | 108+ | 101+ | 15.4+ | 21+ | 108+ |
| `visualViewport` API | 61+ | 91+ | 13+ | 8.2+ | 61+ |
| CSS `max()` function | 79+ | 75+ | 11.1+ | 12.1+ | 79+ |

> Takeaway: `viewport-fit=cover` + `env()` have the widest support. `dvh`/`svh` are
> the modern standard but still need JS fallback for Chrome < 108 and WebViews.

---

## 10. Debugging Checklist

### Step 1 — Verify `viewport-fit=cover` is present
```html
<meta name="viewport" content="..., viewport-fit=cover">
```
If missing, `env()` will silently return 0 on iOS.

### Step 2 — Check `--actual-vh` is being set by JS
```js
console.log(document.documentElement.style.getPropertyValue('--actual-vh'));
// Expected: "7.23px" (or similar px value)
// If empty: JS setActualVh() did not run
```

### Step 3 — Compare visualViewport vs innerHeight
```js
console.log({
    innerHeight: window.innerHeight,
    visualViewportHeight: window.visualViewport?.height,
    diff: window.innerHeight - (window.visualViewport?.height ?? window.innerHeight)
});
// diff ≈ 48px on Android 3-button nav
// diff ≈ 50-70px on iOS Safari with toolbar visible
```

### Step 4 — Check FAB position on Android
```js
const fab = document.getElementById('mfab'); // or whatever your FAB ID is
const rect = fab.getBoundingClientRect();
console.log(`FAB bottom edge: ${window.innerHeight - rect.bottom}px from viewport bottom`);
// Should be at least 72px
```

---

## 11. Quick Reference Cheatsheet

```css
/* Full-screen element on mobile — correct pattern */
.fullscreen-element {
    position: fixed;
    inset: 0;
    height: 100vh;
    height: -webkit-fill-available;
    height: 100svh;
    height: 100dvh;
    height: calc(var(--actual-vh, 1vh) * 100);
    padding-top: max(20px, env(safe-area-inset-top, 0px));
    padding-bottom: max(20px, env(safe-area-inset-bottom, 0px));
}

/* FAB above Android nav bar — correct pattern */
.fab-button {
    position: fixed;
    bottom: max(72px, calc(env(safe-area-inset-bottom, 0px) + 38px));
    right: max(20px, calc(env(safe-area-inset-right, 0px) + 16px));
}
```

```js
/* JS viewport height fix — copy this into any project */
function setActualVh() {
    const h = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty('--actual-vh', `${h * 0.01}px`);
}
setActualVh();
(window.visualViewport ?? window).addEventListener('resize', setActualVh);
```

```html
<!-- Required meta tag — viewport-fit=cover is REQUIRED for env() on iOS -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
```
