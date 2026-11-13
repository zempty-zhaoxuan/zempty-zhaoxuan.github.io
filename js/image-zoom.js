(function () {
  'use strict';

  function init() {
    const entry = document.querySelector('.posts .entry');
    if (!entry) return;

    let overlay = null;
    let previousOverflow = '';
    let sourceImage = null;

    function close() {
      if (!overlay) return;
      overlay.remove();
      overlay = null;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeydown);
      if (sourceImage) sourceImage.focus();
      sourceImage = null;
    }

    function onKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        overlay.querySelector('button').focus();
      }
    }

    function open(image) {
      if (overlay) close();
      sourceImage = image;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      overlay = document.createElement('div');
      overlay.className = 'image-zoom-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', image.alt || '放大图片');

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'image-zoom-close';
      closeButton.textContent = '×';
      closeButton.setAttribute('aria-label', '关闭放大图片');
      closeButton.addEventListener('click', close);

      const enlarged = document.createElement('img');
      enlarged.src = image.currentSrc || image.src;
      enlarged.alt = image.alt;
      enlarged.decoding = 'async';
      overlay.appendChild(closeButton);
      overlay.appendChild(enlarged);
      overlay.addEventListener('click', function (event) {
        if (event.target !== closeButton) close();
      });
      document.body.appendChild(overlay);
      document.addEventListener('keydown', onKeydown);
      closeButton.focus();
    }

    entry.querySelectorAll('img').forEach(function (image) {
      if (image.closest('a')) return;
      image.classList.add('zoomable-image');
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', (image.alt ? image.alt + '，' : '') + '点击放大图片');
      image.addEventListener('click', function () { open(image); });
      image.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(image);
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
