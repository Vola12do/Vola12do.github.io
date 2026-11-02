/* ==========================================================================
   VISHWASH TANK (@VOLA12DO) — PERSONAL PORTFOLIO SCRIPTS
   Minimalist · Doodly · Chromatic · Retro-Styled
   ========================================================================== */
(function () {
  'use strict';

  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const themeText = document.getElementById('theme-toggle-text');

  function setTheme(mode) {
    const target = mode === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', target);
    if (themeIcon && themeText) {
      themeIcon.textContent = target === 'dark' ? '☾' : '☀';
      themeText.textContent = target === 'dark' ? 'CRT Night' : 'Paper';
    }
    try {
      localStorage.setItem('vola12do_theme', target);
    } catch (_) {}
  }

  try {
    const saved = localStorage.getItem('vola12do_theme');
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    }
  } catch (_) {}

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* Mascot Polaroid Click — Cycles subtle tilt & chromatic accent */
  const mascotCard = document.getElementById('mascot-card');
  const accents = ['#ff5a36', '#3b6ef6', '#1fa372', '#9b5de5', '#e11d48'];
  let accentIdx = 0;
  if (mascotCard) {
    mascotCard.addEventListener('click', () => {
      accentIdx = (accentIdx + 1) % accents.length;
      root.style.setProperty('--c-red', accents[accentIdx]);
    });
  }

  /* Expandable Vulnerability Tickets (#01 to #05) */
  const tickets = Array.from(document.querySelectorAll('.vuln-ticket'));
  tickets.forEach((ticket) => {
    function toggleTicket(e) {
      if (e.target && e.target.closest('a')) return;
      const open = ticket.classList.toggle('is-open');
      ticket.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    ticket.addEventListener('click', toggleTicket);
    ticket.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTicket(e);
      }
    });
  });

  /* One-Click Email Copy */
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  copyBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-copy-email') || 'vishwashtank@gmail.com';
      const label = btn.querySelector('[data-copy-label]');
      const prev = label ? label.textContent : '';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        }
      } catch (_) {}
      if (label) {
        label.textContent = 'Copied vishwashtank@gmail.com ✓';
        setTimeout(() => {
          label.textContent = prev;
        }, 2000);
      }
    });
  });

  /* Active Nav Link on Scroll */
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  window.addEventListener(
    'scroll',
    () => {
      const pos = window.scrollY + 180;
      let activeId = 'about';
      sections.forEach((sec) => {
        if (sec.offsetTop <= pos) activeId = sec.id;
      });
      navLinks.forEach((l) => {
        l.classList.toggle('is-active', l.getAttribute('href') === '#' + activeId);
      });
    },
    { passive: true }
  );
})();
