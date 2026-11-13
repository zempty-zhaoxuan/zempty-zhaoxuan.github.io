(function () {
  'use strict';

  function initGiscus() {
    const container = document.querySelector('.giscus-container');
    if (!container || container.querySelector('script[src="https://giscus.app/client.js"]')) return;

    function currentTheme() {
      return document.documentElement.classList.contains('dark-theme') ? 'dark' : 'noborder_light';
    }

    function syncTheme() {
      container.querySelectorAll('.giscus-frame').forEach(function (frame) {
        if (!frame.contentWindow) return;
        frame.contentWindow.postMessage({ giscus: { setConfig: { theme: currentTheme() } } }, 'https://giscus.app');
      });
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', container.dataset.repo);
    script.setAttribute('data-repo-id', container.dataset.repoId);
    script.setAttribute('data-category', container.dataset.category);
    script.setAttribute('data-category-id', container.dataset.categoryId);
    script.setAttribute('data-mapping', container.dataset.mapping);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', container.dataset.reactionsEnabled);
    script.setAttribute('data-emit-metadata', container.dataset.emitMetadata);
    script.setAttribute('data-input-position', container.dataset.inputPosition);
    script.setAttribute('data-theme', currentTheme());
    script.setAttribute('data-lang', container.dataset.lang);
    script.setAttribute('data-loading', 'lazy');
    container.appendChild(script);

    const observer = new MutationObserver(function () {
      container.querySelectorAll('.giscus-frame').forEach(function (frame) {
        if (frame.dataset.themeListenerAdded) return;
        frame.dataset.themeListenerAdded = 'true';
        frame.addEventListener('load', syncTheme);
        syncTheme();
      });
    });
    observer.observe(container, { childList: true, subtree: true });

    document.addEventListener('themechange', syncTheme);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGiscus);
  else initGiscus();
})();
