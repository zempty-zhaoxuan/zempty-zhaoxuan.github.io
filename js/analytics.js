(function () {
  'use strict';

  const script = document.currentScript;
  if (!script || !script.dataset.id) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', script.dataset.id, {
    page_path: script.dataset.pagePath || '/',
    page_title: script.dataset.pageTitle || ''
  });
})();
