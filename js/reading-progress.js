(function () {
  'use strict';

  function init() {
    const bar = document.getElementById('reading-progress');
    const entry = document.querySelector('.posts .entry');
    if (!bar || !entry) return;

    let frameRequested = false;
    function update() {
      const top = entry.getBoundingClientRect().top + window.scrollY;
      const bottom = entry.getBoundingClientRect().bottom + window.scrollY;
      const distance = Math.max(1, bottom - top - window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.scrollY - top) / distance));
      bar.style.width = (progress * 100).toFixed(2) + '%';
      frameRequested = false;
    }
    function requestUpdate() {
      if (!frameRequested) {
        frameRequested = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
