/* ==========================================================================
   VISHWASH TANK (@VOLA12DO) — CHROMATIC EDITORIAL INTERACTION ENGINE
   Inspired by https://huyml.co/
   Zero external dependencies · Pure vanilla ES6
   ========================================================================== */
(function () {
  'use strict';

  const root = document.documentElement;

  /* ------------------------------------------------------------------------
     1. Subtle Acoustic Tick (WebAudio API — Off by default, matches HuyML Audio On/Off)
     ------------------------------------------------------------------------ */
  let audioEnabled = false;
  let audioCtx = null;

  function playSoftTick(freq = 520, duration = 0.018) {
    if (!audioEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {
      /* Ignore audio restrictions */
    }
  }

  const audioOnBtn = document.getElementById('audio-on-btn');
  const audioOffBtn = document.getElementById('audio-off-btn');

  if (audioOnBtn && audioOffBtn) {
    audioOnBtn.addEventListener('click', () => {
      audioEnabled = true;
      audioOnBtn.classList.add('is-on');
      audioOffBtn.classList.remove('is-on');
      playSoftTick(660, 0.025);
    });
    audioOffBtn.addEventListener('click', () => {
      audioEnabled = false;
      audioOffBtn.classList.add('is-on');
      audioOnBtn.classList.remove('is-on');
    });
  }

  /* ------------------------------------------------------------------------
     2. Surface Theme Switcher (Light #ECECEC Default / Dark #111111)
     ------------------------------------------------------------------------ */
  const themeLightBtn = document.getElementById('theme-light-btn');
  const themeDarkBtn = document.getElementById('theme-dark-btn');

  function applyTheme(mode) {
    const target = mode === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', target);
    if (themeLightBtn && themeDarkBtn) {
      themeLightBtn.classList.toggle('is-on', target === 'light');
      themeDarkBtn.classList.toggle('is-on', target === 'dark');
    }
    try {
      localStorage.setItem('vola12do_surface', target);
    } catch (_) {}
  }

  try {
    const saved = localStorage.getItem('vola12do_surface');
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    }
  } catch (_) {}

  if (themeLightBtn && themeDarkBtn) {
    themeLightBtn.addEventListener('click', () => {
      applyTheme('light');
      playSoftTick(580);
    });
    themeDarkBtn.addEventListener('click', () => {
      applyTheme('dark');
      playSoftTick(440);
    });
  }

  /* ------------------------------------------------------------------------
     3. Live Location Clock ("JAIPUR, HH:MM" in IST)
     ------------------------------------------------------------------------ */
  const clockEl = document.getElementById('live-location-time');

  function updateClock() {
    if (!clockEl) return;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      clockEl.textContent = 'JAIPUR, ' + formatter.format(now);
    } catch (_) {
      clockEl.textContent = 'JAIPUR, IST';
    }
  }
  updateClock();
  setInterval(updateClock, 15000);

  /* ------------------------------------------------------------------------
     4. One-Click Email Copy ("For inquiries · Click to copy" -> "Copied")
     ------------------------------------------------------------------------ */
  const copyButtons = document.querySelectorAll('[data-copy-email]');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-copy-email') || 'vishwashtank@gmail.com';
      const labelEl = btn.querySelector('[data-copy-label]');
      const originalText = labelEl ? labelEl.textContent : '';

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        }
      } catch (_) {}

      playSoftTick(720, 0.025);
      if (labelEl) {
        labelEl.textContent = 'Copied to clipboard ✓';
        setTimeout(() => {
          labelEl.textContent = originalText;
        }, 2200);
      }
    });
  });

  /* ------------------------------------------------------------------------
     5. Chromatic Work Engine (Updates CSS tokens, Hero Stage & Ruler Ticks)
     ------------------------------------------------------------------------ */
  const workRows = Array.from(document.querySelectorAll('#work .work-row'));
  const rulerTicks = Array.from(document.querySelectorAll('#hero-ruler .ruler-tick'));

  const stageHex1 = document.getElementById('stage-hex-1');
  const stageHex2 = document.getElementById('stage-hex-2');
  const stageHex3 = document.getElementById('stage-hex-3');
  const heroDot1 = document.getElementById('hero-dot-1');
  const heroDot2 = document.getElementById('hero-dot-2');
  const heroDot3 = document.getElementById('hero-dot-3');

  const stageCat = document.getElementById('stage-category');
  const stageTitle = document.getElementById('stage-title');
  const stageDesc = document.getElementById('stage-desc');
  const stageIndex = document.getElementById('stage-index');
  const heroCounterCurrent = document.getElementById('hero-counter-current');

  function hexToRgba(hex, alpha) {
    const clean = (hex || '#ff5a36').replace('#', '').trim();
    if (clean.length !== 6) return 'rgba(255, 90, 54, ' + alpha + ')';
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  }

  function activateWorkRow(row, idx) {
    if (!row) return;
    workRows.forEach((r) => r.classList.toggle('is-active', r === row));

    const c1 = row.getAttribute('data-c1') || '#171717';
    const c2 = row.getAttribute('data-c2') || '#D8D4CB';
    const c3 = row.getAttribute('data-c3') || '#FF5A36';
    const indexStr = row.getAttribute('data-index') || '01';
    const title = row.getAttribute('data-title') || '';
    const catLabel = row.getAttribute('data-cat-label') || '';
    const desc = row.getAttribute('data-desc') || '';

    root.style.setProperty('--chroma-1', c1);
    root.style.setProperty('--chroma-2', c2);
    root.style.setProperty('--chroma-3', c3);
    root.style.setProperty('--chroma-ambient', hexToRgba(c3, 0.12));

    if (stageHex1) stageHex1.textContent = c1.toUpperCase();
    if (stageHex2) stageHex2.textContent = c2.toUpperCase();
    if (stageHex3) stageHex3.textContent = c3.toUpperCase();

    if (heroDot1) heroDot1.style.backgroundColor = c1;
    if (heroDot2) heroDot2.style.backgroundColor = c2;
    if (heroDot3) heroDot3.style.backgroundColor = c3;

    if (stageCat) stageCat.textContent = catLabel;
    if (stageTitle) stageTitle.textContent = title;
    if (stageDesc) stageDesc.textContent = desc;
    if (stageIndex) stageIndex.innerHTML = indexStr + ' <span class="muted">/08</span>';
    if (heroCounterCurrent) heroCounterCurrent.textContent = indexStr;

    rulerTicks.forEach((tick, tIdx) => {
      tick.classList.toggle('is-active', tIdx === idx);
    });
  }

  workRows.forEach((row, idx) => {
    row.addEventListener('mouseenter', () => {
      activateWorkRow(row, idx);
      playSoftTick(480 + idx * 22, 0.014);
    });
    row.addEventListener('click', () => {
      activateWorkRow(row, idx);
    });

    const swatches = row.querySelectorAll('.swatch-23[data-swatch]');
    swatches.forEach((sw) => {
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        const chosen = sw.getAttribute('data-swatch');
        if (chosen) {
          root.style.setProperty('--chroma-3', chosen);
          root.style.setProperty('--chroma-ambient', hexToRgba(chosen, 0.16));
          if (stageHex3) stageHex3.textContent = chosen.toUpperCase();
          playSoftTick(640, 0.02);
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     6. Project Filter Tabs (All / Software & Forensics / Hardware & RF)
     ------------------------------------------------------------------------ */
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn[data-filter]'));
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || 'all';
      filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      workRows.forEach((row) => {
        const cat = row.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;
        row.style.display = show ? '' : 'none';
      });
      playSoftTick(540);
    });
  });

  /* ------------------------------------------------------------------------
     7. Expandable Vulnerability Advisory Drawers (01 - 05)
     ------------------------------------------------------------------------ */
  const vulnRows = Array.from(document.querySelectorAll('.vuln-row'));
  vulnRows.forEach((row) => {
    function toggleVuln(e) {
      if (e.target && e.target.closest('a')) return;
      const isOpen = row.classList.toggle('is-open');
      row.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      playSoftTick(isOpen ? 600 : 450, 0.018);
    }

    row.addEventListener('click', toggleVuln);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleVuln(e);
      }
    });
  });

  /* ------------------------------------------------------------------------
     8. Active Header Navigation Highlight on Scroll
     ------------------------------------------------------------------------ */
  const navLinks = Array.from(document.querySelectorAll('.hdr-nav a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  window.addEventListener(
    'scroll',
    () => {
      const scrollPos = window.scrollY + 220;
      let currentId = 'work';
      sections.forEach((sec) => {
        if (sec.offsetTop <= scrollPos) {
          currentId = sec.id;
        }
      });
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + currentId);
      });
    },
    { passive: true }
  );
})();
