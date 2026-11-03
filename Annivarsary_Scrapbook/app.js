/* ==========================================================================
   ANNIVERSARY INVITATION — JAVASCRIPT LOGIC
   Vanilla JS with Container Queries, Video Intro, Canvas Petals & RSVP Routing
   ========================================================================== */

/* --------------------------------------------------------------------------
   0. Minimal Preloader (Tracks Critical Intro & First Section Assets, Max 3s)
   -------------------------------------------------------------------------- */
(function initMinimalLoader() {
  const loader = document.getElementById('minimal-loader');
  const progressBar = document.getElementById('loader-progress-bar');
  if (!loader) return;

  let isDismissed = false;
  let loadedCount = 0;
  const TOTAL_ASSETS = 4; // 1. Tap poster, 2. Section 1 image, 3. Fonts, 4. Video ready

  function updateProgress() {
    loadedCount++;
    const percent = Math.min(Math.round((loadedCount / TOTAL_ASSETS) * 100), 100);
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (loadedCount >= TOTAL_ASSETS) {
      setTimeout(dismissLoader, 160);
    }
  }

  function dismissLoader() {
    if (isDismissed) return;
    isDismissed = true;
    if (progressBar) {
      progressBar.style.width = '100%';
    }
    loader.classList.add('loader-hidden');
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 600);
  }

  // Guaranteed Maximum Loader Display Time: 3.0 Seconds
  const maxTimer = setTimeout(dismissLoader, 3000);

  // Asset 1: Tap Screen Poster Image
  const imgTap = new Image();
  imgTap.onload = imgTap.onerror = () => updateProgress();
  imgTap.src = 'images/vlcsnap-2026-11-03-10h18m28s743.webp';

  // Asset 2: Section 1 Hero Cover Background Image
  const imgSec1 = new Image();
  imgSec1.onload = imgSec1.onerror = () => updateProgress();
  imgSec1.src = 'images/Sec1.webp';

  // Asset 3: Typography & Google Fonts
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateProgress).catch(updateProgress);
  } else {
    updateProgress();
  }

  // Asset 4: Intro Video readiness
  const videoElem = document.getElementById('intro-video');
  if (videoElem) {
    if (videoElem.readyState >= 2) {
      updateProgress();
    } else {
      const onVideoReady = () => {
        videoElem.removeEventListener('loadeddata', onVideoReady);
        videoElem.removeEventListener('canplay', onVideoReady);
        videoElem.removeEventListener('error', onVideoReady);
        updateProgress();
      };
      videoElem.addEventListener('loadeddata', onVideoReady, { once: true });
      videoElem.addEventListener('canplay', onVideoReady, { once: true });
      videoElem.addEventListener('error', onVideoReady, { once: true });
    }
  } else {
    updateProgress();
  }
})();

/* --------------------------------------------------------------------------
   1. Viewport Height Fix (MUST EXECUTE IMMEDIATELY)
   Calculates exact window height to prevent mobile browser URL bar jumps
   -------------------------------------------------------------------------- */
function setActualVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setActualVh();

/* --------------------------------------------------------------------------
   2. Scroll Restoration & State Reset on Page Load
   -------------------------------------------------------------------------- */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
window.addEventListener('resize', () => {
  setActualVh();
  if (!document.body.classList.contains('unlocked')) {
    window.scrollTo(0, 0);
  }
});
window.addEventListener('orientationchange', () => {
  setTimeout(setActualVh, 200);
  if (!document.body.classList.contains('unlocked')) {
    window.scrollTo(0, 0);
  }
});

/* --------------------------------------------------------------------------
   3. Configuration & State Variables
   -------------------------------------------------------------------------- */
const WHATSAPP_PHONE = '918200482291'; // Target WhatsApp recipient phone number
let isMusicPlaying = false;
let isAppRevealed = false;

// DOM Elements
const introLayer = document.getElementById('intro-layer');
const introVideo = document.getElementById('intro-video');
const tapScreen = document.getElementById('tap-screen');
const mfab = document.getElementById('mfab');
const scrollInd = document.getElementById('scroll-indicator');
const bgAudio = document.getElementById('bg-music');
const globalCanvas = document.getElementById('global-petals');

/* --------------------------------------------------------------------------
   4. Video Intro Logic (One-Tap, Non-pauseable, Unlocks App on Finish)
   -------------------------------------------------------------------------- */
function safePlayVideo() {
  if (!introVideo) return;
  introVideo.muted = false;
  introVideo.volume = 1.0;

  if (bgAudio) {
    bgAudio.pause();
    bgAudio.currentTime = 0;
  }

  const playPromise = introVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Autoplay with sound blocked fallback: play unmuted again on interaction
      introVideo.play().catch(() => {
        revealApp();
      });
    });
  }
}

// User taps on the initial cover overlay
if (tapScreen) {
  tapScreen.addEventListener('click', () => {
    // Prime the audio context so background music can autoplay smoothly later
    if (bgAudio) {
      bgAudio.muted = true;
      bgAudio.play()
        .then(() => {
          bgAudio.pause();
          bgAudio.muted = false;
          bgAudio.currentTime = 0;
        })
        .catch(() => {});
    }

    if (introLayer) {
      introLayer.classList.add('video-playing');
    }

    if (introVideo) {
      introVideo.classList.add('playing');
      safePlayVideo();
    }

    tapScreen.style.opacity = '0';
    tapScreen.style.pointerEvents = 'none';
    setTimeout(() => {
      tapScreen.classList.add('hidden');
    }, 800);
  }, { once: true });
}

// Video playback and seamless crossfade directly into the first screen
if (introVideo) {
  introVideo.addEventListener('pause', () => {
    if (!isAppRevealed && !introVideo.ended && introVideo.classList.contains('playing')) {
      introVideo.play().catch(() => {});
    }
  });

  // Crossfade directly into first screen slightly before video ends (NO black screen)
  let isCrossfading = false;
  introVideo.addEventListener('timeupdate', () => {
    if (!introVideo.duration) return;
    const remaining = introVideo.duration - introVideo.currentTime;
    if (remaining <= 0.6 && introVideo.duration > 1.5 && !isCrossfading) {
      isCrossfading = true;
      revealApp();
    }
  });

  introVideo.addEventListener('ended', () => {
    introVideo.pause(); // Retain final frame during crossfade
    revealApp();
  });

  introVideo.addEventListener('error', () => {
    revealApp();
  });
}

/**
 * Reveals the main application, dissolves intro directly into first screen, unlocks scrolling
 */
function revealApp() {
  if (isAppRevealed) return;
  isAppRevealed = true;

  // 1. Fade the intro layer directly into the first screen
  if (introLayer) {
    introLayer.classList.add('fade-out');
    setTimeout(() => {
      introLayer.classList.add('hidden');
    }, 1100);
  }

  // 2. Unlock scroll & immediately animate first screen hero elements
  document.body.classList.add('unlocked');
  initScrollReveal();

  // 3. Activate ambient features as first screen appears
  setTimeout(() => {
    if (mfab) mfab.classList.add('visible');
    if (scrollInd) scrollInd.classList.add('visible');

    startGlobalPetals();
    startBgMusic();
    initGalleryFancybox();
  }, 300);
}

/* --------------------------------------------------------------------------
   5. Background Music FAB (Floating Action Button)
   -------------------------------------------------------------------------- */
function startBgMusic() {
  if (!bgAudio) return;
  bgAudio.volume = 0.5;
  bgAudio.play()
    .then(() => {
      isMusicPlaying = true;
      updateFabIcon(true);
    })
    .catch(() => {
      isMusicPlaying = false;
      updateFabIcon(false);
    });
}

function updateFabIcon(isPlaying) {
  const iconOn = document.getElementById('icon-on');
  const iconOff = document.getElementById('icon-off');

  if (isPlaying) {
    if (mfab) mfab.classList.add('playing');
    if (iconOn) iconOn.style.display = 'block';
    if (iconOff) iconOff.style.display = 'none';
  } else {
    if (mfab) mfab.classList.remove('playing');
    if (iconOn) iconOn.style.display = 'none';
    if (iconOff) iconOff.style.display = 'block';
  }
}

window.toggleMusic = function () {
  if (!bgAudio) return;

  if (isMusicPlaying) {
    bgAudio.pause();
    isMusicPlaying = false;
    updateFabIcon(false);
  } else {
    bgAudio.play()
      .then(() => {
        isMusicPlaying = true;
        updateFabIcon(true);
      })
      .catch(() => {
        isMusicPlaying = false;
        updateFabIcon(false);
      });
  }
};

/* --------------------------------------------------------------------------
   6. Scroll Down Indicator & Smooth Navigation
   -------------------------------------------------------------------------- */
window.scrollToSection = function (selector) {
  const target = document.querySelector(selector);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.addEventListener('scroll', () => {
  if (!scrollInd) return;
  if (window.scrollY > 60) {
    scrollInd.classList.add('hidden-after-scroll');
  } else {
    scrollInd.classList.remove('hidden-after-scroll');
  }
}, { passive: true });

/* --------------------------------------------------------------------------
   7. Scroll Reveal (IntersectionObserver with Staggered Delays)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  if (!revealItems.length) return;

  if (reduceMotion) {
    revealItems.forEach(el => el.classList.add('active'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealItems.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   7b. Gallery Fancybox Lightbox & Tap-to-Open Hint
   -------------------------------------------------------------------------- */
let isGalleryInitialized = false;

function initGalleryFancybox() {
  if (isGalleryInitialized) return;
  isGalleryInitialized = true;

  // Initialize Fancybox 5 with luxury romance settings
  if (typeof Fancybox !== 'undefined') {
    Fancybox.bind('[data-fancybox="gallery"]', {
      hideScrollbar: false,
      autoFocus: true,
      trapFocus: true,
      placeFocusBack: true,
      wheel: 'slide',
      Thumbs: false,
      Toolbar: {
        display: {
          left: ['infobar'],
          middle: [],
          right: ['iterateZoom', 'close'],
        },
      },
      Images: {
        zoom: true,
      },
      on: {
        reveal: () => {
          dismissGalleryHint();
        },
      },
    });
  }

  const hint = document.getElementById('gallery-tap-hint');
  const gallerySec = document.getElementById('sec-gallery');
  const firstPhotoLink = document.querySelector('.polaroid-item.polaroid-1');

  if (hint) {
    // Clicking the hint triggers the first photo in full view
    hint.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dismissGalleryHint();
      if (firstPhotoLink) {
        firstPhotoLink.click();
      } else if (typeof Fancybox !== 'undefined') {
        Fancybox.show([
          { src: 'images/photo1.webp', caption: 'Our Beautiful Memories — Two Rings, One Lifetime 💕' },
          { src: 'images/photo2.webp', caption: 'Our Beautiful Memories — Where Forever Began 🌸' },
          { src: 'images/photo3.webp', caption: 'Our Beautiful Memories — Showered with Love & Blessings ✨' },
          { src: 'images/photo4.webp', caption: 'Our Beautiful Memories — Endless Joy, Laughter & Love 🎈' },
        ]);
      }
    });

    hint.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hint.click();
      }
    });
  }

  // Dismiss hint as soon as user clicks ANY polaroid
  document.querySelectorAll('.polaroid-item').forEach(item => {
    item.addEventListener('click', () => {
      dismissGalleryHint();
    });
  });

  // IntersectionObserver to show the hint ONCE when user reaches Section 3
  if (gallerySec && hint && !sessionStorage.getItem('gallery_tap_hint_seen')) {
    const hintObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !sessionStorage.getItem('gallery_tap_hint_seen')) {
          sessionStorage.setItem('gallery_tap_hint_seen', 'true');
          hint.classList.add('show');

          // Auto-hide after 5.5s so it never permanently covers any photo
          setTimeout(() => {
            dismissGalleryHint();
          }, 5500);

          obs.unobserve(gallerySec);
        }
      });
    }, {
      threshold: 0.35
    });

    hintObserver.observe(gallerySec);
  }
}

function dismissGalleryHint() {
  const hint = document.getElementById('gallery-tap-hint');
  if (hint) {
    hint.classList.remove('show');
    hint.classList.add('hidden');
    sessionStorage.setItem('gallery_tap_hint_seen', 'true');
  }
}

// Development / Testing helper to test the hint again
window.resetGalleryHint = function () {
  sessionStorage.removeItem('gallery_tap_hint_seen');
  const hint = document.getElementById('gallery-tap-hint');
  if (hint) {
    hint.classList.remove('hidden');
    hint.classList.add('show');
  }
};

// Also auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGalleryFancybox);
} else {
  initGalleryFancybox();
}

/* --------------------------------------------------------------------------
   8. Single Global Canvas: Falling Rose Petals
   Fixed overlay, 3D fluttering, organic swaying, performant rendering
   -------------------------------------------------------------------------- */
function startGlobalPetals() {
  if (!globalCanvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const ctx = globalCanvas.getContext('2d');
  if (!ctx) return;

  let width = window.innerWidth;
  let height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  globalCanvas.width = width;
  globalCanvas.height = height;

  const petalColors = [
    'rgba(196, 26, 49, 0.88)',  // Deep ruby red
    'rgba(224, 46, 73, 0.82)',  // Romantic velvet rose
    'rgba(162, 16, 36, 0.92)',  // Wine crimson
    'rgba(240, 85, 110, 0.75)', // Rose petal pink highlight
    'rgba(210, 35, 60, 0.85)'   // Classic scarlet rose
  ];

  const PETAL_COUNT = Math.min(Math.max(Math.floor(width / 16), 16), 32);

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -35;
      this.vy = 1.1 + Math.random() * 1.6;
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.035;
      this.flip = Math.random() * Math.PI * 2;
      this.flipSpeed = 0.02 + Math.random() * 0.03;
      this.scale = 0.18 + Math.random() * 0.22;
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.swaySpeed = 0.015 + Math.random() * 0.02;
      this.swayAmount = 0.8 + Math.random() * 1.4;
      this.swayOffset = Math.random() * Math.PI * 2;
    }

    update() {
      this.y += this.vy;
      this.x += Math.sin(this.y * this.swaySpeed + this.swayOffset) * this.swayAmount;
      this.rot += this.rotSpeed;
      this.flip += this.flipSpeed;

      // Wrap horizontal edges softly
      if (this.x < -30) this.x = width + 20;
      else if (this.x > width + 30) this.x = -20;

      // Reset when falling past the bottom of viewport
      if (this.y > height + 40) {
        this.reset(false);
      }
    }

    draw() {
      // Smooth fade-out near bottom of screen
      let alpha = 1;
      const fadeStart = height * 0.82;
      if (this.y > fadeStart) {
        alpha = Math.max(0, 1 - (this.y - fadeStart) / (height - fadeStart));
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      // 3D fluttering projection
      ctx.scale(this.scale * Math.cos(this.flip), this.scale);

      // Organic rose petal bezier curve
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-14, -10, -16, -32, 0, -40);
      ctx.bezierCurveTo(16, -32, 14, -10, 0, 0);
      ctx.fillStyle = this.color;
      ctx.fill();

      ctx.restore();
    }
  }

  const petals = Array.from({ length: PETAL_COUNT }, () => new Petal());

  let animFrameId;
  function renderLoop() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => {
      p.update();
      p.draw();
    });
    animFrameId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // Resize handler
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    globalCanvas.width = width;
    globalCanvas.height = height;
  });
}

/* --------------------------------------------------------------------------
   9. RSVP Form Interactions & Validation
   -------------------------------------------------------------------------- */
let currentAttendance = 'accept';
let tooltipTimers = {};

window.handleAttendanceChange = function (value) {
  currentAttendance = value;
  const chipAccept = document.getElementById('chip-accept');
  const chipDecline = document.getElementById('chip-decline');
  const guestsRow = document.getElementById('guests-row');
  const eventsRow = document.getElementById('events-row');
  const guestsInput = document.getElementById('rsvp-guests');
  const eventCheckboxes = document.querySelectorAll('input[name="events_attending"]');

  if (value === 'accept') {
    chipAccept?.classList.add('active');
    chipDecline?.classList.remove('active');
    if (guestsRow) {
      guestsRow.classList.remove('is-disabled');
      guestsRow.style.display = '';
    }
    if (eventsRow) {
      eventsRow.classList.remove('is-disabled');
      eventsRow.style.display = '';
    }
    if (guestsInput) guestsInput.disabled = false;
    eventCheckboxes.forEach(cb => { cb.disabled = false; });
  } else {
    chipDecline?.classList.add('active');
    chipAccept?.classList.remove('active');
    // Keep displayed in place, but disable and apply disabled style
    if (guestsRow) {
      guestsRow.classList.add('is-disabled');
      guestsRow.style.display = '';
    }
    if (eventsRow) {
      eventsRow.classList.add('is-disabled');
      eventsRow.style.display = '';
    }
    if (guestsInput) guestsInput.disabled = true;
    eventCheckboxes.forEach(cb => { cb.disabled = true; });
  }
};

// Checkbox logic for Dinner / Dancing / Both
const eventCheckboxes = document.querySelectorAll('input[name="events_attending"]');
eventCheckboxes.forEach(cb => {
  cb.addEventListener('change', (e) => {
    const val = e.target.value;
    const isChecked = e.target.checked;
    if (val === 'Both') {
      eventCheckboxes.forEach(item => {
        if (item.value !== 'Both') item.checked = isChecked;
      });
    } else {
      const dinnerCb = Array.from(eventCheckboxes).find(i => i.value === 'Dinner');
      const dancingCb = Array.from(eventCheckboxes).find(i => i.value === 'Dancing');
      const bothCb = Array.from(eventCheckboxes).find(i => i.value === 'Both');
      if (bothCb) {
        bothCb.checked = (dinnerCb?.checked && dancingCb?.checked);
      }
    }
  });
});

/* Validation UI Helpers */
function hideAllTooltips() {
  document.querySelectorAll('.input-tooltip').forEach(tt => tt.classList.remove('show'));
  const alertBox = document.getElementById('rsvp-alert');
  if (alertBox) alertBox.classList.remove('show');
}

function setFieldValidation(fieldId, status, message = '', showTooltip = true) {
  const capsule = document.getElementById(`capsule-${fieldId}`);
  const tooltip = document.getElementById(`tooltip-${fieldId}`);
  if (!capsule) return;

  if (status === 'valid') {
    capsule.classList.remove('is-invalid');
    capsule.classList.add('is-valid');
    if (tooltip) tooltip.classList.remove('show');
  } else if (status === 'invalid') {
    capsule.classList.remove('is-valid');
    capsule.classList.add('is-invalid');

    // Trigger replay of shake animation without layout jump
    capsule.style.animation = 'none';
    capsule.offsetHeight; // trigger reflow
    capsule.style.animation = '';

    if (tooltip && showTooltip) {
      if (message) tooltip.textContent = message;
      tooltip.classList.add('show');
      if (tooltipTimers[fieldId]) clearTimeout(tooltipTimers[fieldId]);
      tooltipTimers[fieldId] = setTimeout(() => {
        tooltip.classList.remove('show');
      }, 4000);
    }
  } else {
    // Neutral reset
    capsule.classList.remove('is-valid', 'is-invalid');
    if (tooltip) tooltip.classList.remove('show');
  }
}

// Real-time input listeners
const rsvpNameInput = document.getElementById('rsvp-name');
const rsvpPhoneInput = document.getElementById('rsvp-phone');

if (rsvpNameInput) {
  rsvpNameInput.addEventListener('input', () => {
    const val = rsvpNameInput.value.trim();
    if (val.length >= 2) {
      setFieldValidation('rsvp-name', 'valid');
    } else if (val.length === 0) {
      setFieldValidation('rsvp-name', 'neutral');
    } else {
      const tooltip = document.getElementById('tooltip-rsvp-name');
      if (tooltip) tooltip.classList.remove('show');
    }
  });

  rsvpNameInput.addEventListener('blur', () => {
    const val = rsvpNameInput.value.trim();
    if (val.length >= 2) {
      setFieldValidation('rsvp-name', 'valid');
    } else if (val.length > 0) {
      setFieldValidation('rsvp-name', 'invalid', 'Please enter your Full Name to proceed.', true);
    }
  });
}

if (rsvpPhoneInput) {
  rsvpPhoneInput.addEventListener('input', () => {
    const digits = rsvpPhoneInput.value.replace(/\D/g, '');
    if (digits.length >= 7) {
      setFieldValidation('rsvp-phone', 'valid');
    } else if (rsvpPhoneInput.value.trim().length === 0) {
      setFieldValidation('rsvp-phone', 'neutral');
    } else {
      const tooltip = document.getElementById('tooltip-rsvp-phone');
      if (tooltip) tooltip.classList.remove('show');
    }
  });

  rsvpPhoneInput.addEventListener('blur', () => {
    const digits = rsvpPhoneInput.value.replace(/\D/g, '');
    if (digits.length >= 7) {
      setFieldValidation('rsvp-phone', 'valid');
    } else if (rsvpPhoneInput.value.trim().length > 0) {
      setFieldValidation('rsvp-phone', 'invalid', 'Please enter a valid Phone Number to proceed.', true);
    }
  });
}

window.showRsvpAlert = function (message) {
  const msgLower = (message || '').toLowerCase();
  if (msgLower.includes('name')) {
    setFieldValidation('rsvp-name', 'invalid', message, true);
    if (rsvpNameInput) rsvpNameInput.focus();
  } else if (msgLower.includes('phone')) {
    setFieldValidation('rsvp-phone', 'invalid', message, true);
    if (rsvpPhoneInput) rsvpPhoneInput.focus();
  } else {
    const alertBox = document.getElementById('rsvp-alert');
    const alertText = document.getElementById('rsvp-alert-text');
    if (alertBox && alertText) {
      alertText.textContent = message;
      alertBox.classList.add('show');
      if (tooltipTimers['alert']) clearTimeout(tooltipTimers['alert']);
      tooltipTimers['alert'] = setTimeout(() => {
        alertBox.classList.remove('show');
      }, 4000);
    }
  }
};

window.closeRsvpAlert = function () {
  hideAllTooltips();
};

/* --------------------------------------------------------------------------
   10. Send RSVP to WhatsApp (Formatted with luxury borders & emojis)
   -------------------------------------------------------------------------- */
window.sendRSVP = function () {
  const nameInput = document.getElementById('rsvp-name');
  const phoneInput = document.getElementById('rsvp-phone');
  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const phoneDigits = phone.replace(/\D/g, '');

  let firstInvalid = null;

  // Validate Name
  if (!name || name.length < 2) {
    setFieldValidation('rsvp-name', 'invalid', 'Please enter your Full Name to proceed.', true);
    firstInvalid = nameInput;
  } else {
    setFieldValidation('rsvp-name', 'valid');
  }

  // Validate Phone
  if (!phone || phoneDigits.length < 7) {
    const showPhoneTooltip = !firstInvalid;
    setFieldValidation('rsvp-phone', 'invalid', 'Please enter a valid Phone Number to proceed.', showPhoneTooltip);
    if (!firstInvalid) firstInvalid = phoneInput;
  } else {
    setFieldValidation('rsvp-phone', 'valid');
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  window.closeRsvpAlert();

  const isAttending = currentAttendance === 'accept';
  const guests = isAttending
    ? (document.getElementById('rsvp-guests')?.value || '1')
    : '0';

  const selectedEvents = isAttending
    ? Array.from(document.querySelectorAll('input[name="events_attending"]:checked'))
        .map(cb => cb.value)
        .join(', ') || 'Celebration'
    : '—';

  const divider = '━━━━━━━━━━━━━━━━━━━━━━';

  let msg = '';
  msg += `✨ *6th ANNIVERSARY CELEBRATION — RSVP* ✨\n`;
  msg += `${divider}\n\n`;
  msg += `👤 *Guest Name:* ${name}\n`;
  msg += `📱 *Phone:* ${phone}\n\n`;
  msg += `💌 *Attendance:* ${isAttending ? '🎉 Joyfully Accepting with Love!' : '🥺 Regretfully Declining'}\n`;

  if (isAttending) {
    msg += `👥 *Number of Guests:* ${guests}\n`;
    msg += `🥂 *Attending Events:* ${selectedEvents}\n`;
  }

  msg += `\n${divider}\n`;
  msg += `_Sent via the 6th Anniversary Invitation of_\n`;
  msg += `_[Name 1] & [Name 2] • Celebrating Our Love_\n`;
  msg += `${divider}`;

  // Device detection: Mobile opens WhatsApp app directly, Desktop opens WhatsApp Web
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const waBase = isMobile ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
  const waUrl = `${waBase}?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(msg)}`;

  window.open(waUrl, '_blank');

  // Reset form inputs & validation states after submission
  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';
  setFieldValidation('rsvp-name', 'neutral');
  setFieldValidation('rsvp-phone', 'neutral');
  const guestsIn = document.getElementById('rsvp-guests');
  if (guestsIn) guestsIn.value = '1';
};

