(function () {
  'use strict';

  function initShare() {
    const slot = document.getElementById('post-share-slot');
    if (!slot || slot.querySelector('.article-share-container')) return;

    const block = document.createElement('section');
    block.className = 'article-share-container';
    block.setAttribute('aria-label', '分享这篇文章');

    const title = document.createElement('h2');
    title.className = 'share-title';
    title.textContent = '分享这篇文章';
    block.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'share-buttons';
    block.appendChild(actions);

    const status = document.createElement('span');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    block.appendChild(status);

    function button(label, className) {
      const control = document.createElement('button');
      control.type = 'button';
      control.className = className;
      control.textContent = label;
      actions.appendChild(control);
      return control;
    }

    async function copyLink() {
      const url = window.location.href;
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(url);
          return true;
        } catch (error) { /* Use the local textarea fallback. */ }
      }

      const previousFocus = document.activeElement;
      const field = document.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.className = 'share-copy-fallback';
      document.body.appendChild(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (error) { /* Clipboard access can be denied. */ }
      field.remove();
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
      return copied;
    }

    if (typeof navigator.share === 'function') {
      const shareButton = button('分享文章', 'share-btn');
      shareButton.addEventListener('click', async function () {
        try {
          const heading = document.querySelector('article.posts h1');
          await navigator.share({
            title: heading ? heading.textContent.trim() : document.title,
            url: window.location.href
          });
          status.textContent = '分享已打开';
        } catch (error) {
          if (error && error.name !== 'AbortError') status.textContent = '暂时无法分享，请复制链接';
        }
      });
    }

    const copyButton = button('复制链接', 'copy-link-btn');
    let resetTimer;
    copyButton.addEventListener('click', async function () {
      const copied = await copyLink();
      clearTimeout(resetTimer);
      copyButton.textContent = copied ? '已复制' : '复制失败';
      status.textContent = copied ? '链接已复制' : '无法访问剪贴板';
      copyButton.classList.toggle('copied', copied);
      resetTimer = setTimeout(function () {
        copyButton.textContent = '复制链接';
        copyButton.classList.remove('copied');
      }, 1500);
    });

    slot.appendChild(block);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initShare);
  else initShare();
})();
