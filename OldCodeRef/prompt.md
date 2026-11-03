**Prompt for Antigravity AI**

Act as an expert frontend developer and GSAP animation specialist. Your task is to build a highly immersive, mobile-optimized, animated wedding invitation in a single-file HTML format. All CSS must be inline within `<style>` tags, all JavaScript must be inline within `<script>` tags, and you must not use any build tools or frameworks. Adapt all selectors, CSS variables (`:root`), and copy to the specific sections described below.

Build the application following this strict structural and visual breakdown:

**1. Technical Architecture & Setup**

* **Document Structure:** Use a main card container (`#app`) constrained to a mobile width (e.g., `--card-width: 480px`).


* **Landscape Warning:** Implement a `#landscape-warning` overlay that displays only on screens where `orientation: landscape` and `max-height: 500px`, hiding the main app.


* **Viewport Handling:** Ensure `viewport-fit=cover` is in the meta tag. The very first piece of JS executed must be `setActualVh()` to calculate exact window height.


* **Scroll Locking:** The `body` must have `overflow: hidden` on initial load. Only add the `unlocked` class to allow scrolling after the intro sequence completes.



**2. Visual Sections & Animations**

* **Hero / Section 1:**
* *Assets:* Use `BG_sec1.webp` (Cover). Place `BellDecorSec1.webp` (4 copies) at the top, animating like a pendulum using 3D rotation. Place `BottomDecorSec1.webp` at the bottom (100% width).
* *Subject:* Wrap `Elephant.webp` and `FlowerOverlaySec1.webp` in a compact container positioned over the bottom decor. Replicate this on both sides facing inward. Animate the elephant with a slow, cinematic jump every 4 seconds.


* **Mehndi Section:**
* *Assets:* `MehndiBg.webp` (Cover), `TopDecorMehndi.webp` at the top, `MehndiCouple.webp` at the bottom.
* *Animation:* Implement an HTML5 canvas layer for falling marigold petals.


* **Haldi Section:**
* *Assets:* `BG_Haldi.webp` (Cover), `FlowerDecorTopHaldi.webp` at top center. Place 4 copies of `FlowerDecorLatkanHaldi.webp` hanging from the top.
* *Animation:* Wave the hanging decor gently with a continuous "calm wind" staggered flow. Implement the falling canvas petals over `HaldiLady.webp` at the bottom.


* **Sangeet / Dance Section:**
* *Assets:* `BgSangeet.webp` (Cover), `River.webp` (Static foreground), `CoupleDance.webp` behind the river layer.
* *Animation:* Create a continuous, infinite marquee animation over the river using multiple copies of `Swan.webp` and `LotusFloting.webp` floating left to right at varying speeds.


* **AI-Designed Wedding Date Reveal:**
* Design a custom section centered around a couple and a "vow fire". Generate custom particle/canvas animations (e.g., rose petals) triggered on scroll.



**3. Interactive Elements & JavaScript Logic**

* **Video Intro Logic:** Build a full-screen video intro overlay (`#intro-layer`). It must require one tap to play and must not be pauseable. Scrolling remains locked until the video ends. Once the video finishes, fade out the overlay(fade out and while fading first section should appear not black screen), add the `.unlocked` class to the body, and make the Music FAB and Scroll Down indicator visible.


* **Music FAB:** Position the floating action button dynamically using `bottom: max(72px, calc(env(safe-area-inset-bottom, 0px) + 38px))`. It must toggle the background audio and switch between SVG on/off icons.


* **Canvas Petal Animation:** Calculate canvas size using `window.visualViewport?.height`. Cap the petal count between 10 and 30 for performance. You must check for `(prefers-reduced-motion: reduce)` and disable the canvas loop if matched.


* **Scroll Reveal:** Implement an `IntersectionObserver` to fade and slide elements up on scroll. Stagger sibling elements using CSS transition delays (`.reveal:nth-child(n)`). Ensure `initScrollReveal()` is called *only after* the intro finishes and the body is unlocked.



**4. RSVP Form & WhatsApp Integration**

* **Validation:** The form must validate that the user's Full Name and Phone Number are entered before submission.


* **Message Formatting:** The generated WhatsApp message must be stylized for luxury. Use visual divider lines (`━━━━━━━━━━━━━━━━━━━━━━`), decorative headers (`✨ *[Event Name] — RSVP* ✨`), and contextual emojis (`👤 *Guest:*`, `💌 *Response:*`).


* **Routing:** Detect mobile vs. desktop to route to `[https://api.whatsapp.com/send](https://api.whatsapp.com/send)` or `[https://web.whatsapp.com/send](https://web.whatsapp.com/send)` respectively.



**5. Strict Footer Implementation**
You must include the exact footer below to handle iOS home indicators and Android gesture navigation safely:

```html
<footer class="footer" style="padding: 8px 12px max(8px, env(safe-area-inset-left, 0px)); text-align: center; border-top: 1px solid rgba(231,191,133,0.2);">
  <p style="font-size:0.75rem; color:var(--text-muted);">
    Designed by <a href="https://invitebox.in/" target="_blank" rel="noreferrer" style="color:var(--primary); text-decoration:none; font-weight:600;">Invite&nbsp;Box</a>
  </p>
</footer>

```

**BUILD CHECKLIST (Must Verify All Before Completion):**

* [ ] `viewport-fit=cover` included in meta tags.


* [ ] `setActualVh()` runs immediately as the first JS command.


* [ ] `history.scrollRestoration = 'manual'` and `scrollTo(0,0)` execute on load.


* [ ] `body` defaults to `overflow: hidden`; `.unlocked` is added only after intro.


* [ ] FAB and Scroll Indicator remain hidden until `reveal()` is called.


* [ ] WhatsApp message uses visual borders and bold/italic markdown.


* [ ] `initScrollReveal()` called after `.unlocked` is added.


* [ ] All icons are inline SVGs.