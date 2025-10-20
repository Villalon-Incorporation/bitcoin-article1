// script.js (simplified)
// - lightweight image-error fallback for all images
// - scroll reveal using IntersectionObserver (fallback shows immediately)
// - link click feedback + ripple effect
(() => {
  const FALLBACK_IMG = 'images/fallback.jpg';

  // Add error fallback for images to avoid broken icons
  function initImageErrorHandlers() {
    const images = Array.from(document.querySelectorAll('img'));
    images.forEach(img => {
      if (img.dataset.errorHandled) return;
      img.dataset.errorHandled = '1';

      img.addEventListener('error', function onError() {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = '1';
        const dataFallback = img.getAttribute('data-fallback');
        const fallback = dataFallback || FALLBACK_IMG;
        try {
          img.src = fallback;
          if (img.hasAttribute('srcset')) img.removeAttribute('srcset');
        } catch (e) { /* ignore */ }
      }, { passive: true });
    });
  }

  // Scroll reveal using IntersectionObserver (graceful fallback)
  function initReveal() {
    const revealElems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealElems.forEach(el => obs.observe(el));
    } else {
      revealElems.forEach(el => el.classList.add('visible'));
    }
  }

  // Link click animation + smooth scroll for internal anchors
  function initLinkEffects() {
    document.querySelectorAll('.anim-link').forEach(link => {
      if (link.dataset.animInit) return;
      link.dataset.animInit = '1';

      link.addEventListener('click', (e) => {
        link.style.transition = 'transform 160ms ease';
        link.style.transform = 'scale(0.985)';
        setTimeout(() => { link.style.transform = ''; }, 160);

        const href = link.getAttribute('href') || '';
        if (href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
      }, { passive: true });

      link.addEventListener('pointerdown', (ev) => {
        const rect = link.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        const size = Math.max(rect.width, rect.height) * 1.4;
        ripple.style.position = 'absolute';
        ripple.style.left = (ev.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (ev.clientY - rect.top - size / 2) + 'px';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(247,147,26,0.12)';
        ripple.style.pointerEvents = 'none';
        ripple.style.transform = 'scale(0.2)';
        ripple.style.transition = 'transform 420ms cubic-bezier(.2,.9,.3,1), opacity 420ms';
        ripple.style.zIndex = 1;
        link.style.position = link.style.position || 'relative';
        link.appendChild(ripple);
        requestAnimationFrame(() => { ripple.style.transform = 'scale(1)'; ripple.style.opacity = '1'; });
        setTimeout(() => {
          ripple.style.opacity = '0';
          ripple.style.transform = 'scale(1.6)';
        }, 220);
        setTimeout(() => ripple.remove(), 580);
      }, { passive: true });
    });
  }

  // Respect prefers-reduced-motion
  function applyReducedMotion() {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      document.documentElement.style.scrollBehavior = 'auto';
    } else {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }

  // On DOM ready
  function onReady() {
    // small entrance for article
    document.querySelectorAll('.article-card').forEach(card => {
      requestAnimationFrame(() => card.classList.add('revealed'));
    });

    initImageErrorHandlers();
    initReveal();
    initLinkEffects();
    applyReducedMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // Re-run image error setup when new images are added dynamically
  if ('MutationObserver' in window) {
    const mo = new MutationObserver((mutations) => {
      let added = false;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) { added = true; break; }
      }
      if (added) initImageErrorHandlers();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
})();