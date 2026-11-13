(function () {
  'use strict';

  function languageFor(pre, code) {
    const candidates = [pre, code, pre.parentElement, pre.closest('.highlighter-rouge')];
    for (const element of candidates) {
      if (!element) continue;
      const languageClass = Array.from(element.classList).find(function (name) {
        return name.startsWith('language-');
      });
      if (languageClass) return languageClass.slice('language-'.length);
    }
    return 'code';
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;inset:0;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let succeeded = false;
    try { succeeded = document.execCommand('copy'); }
    catch (error) { succeeded = false; }
    finally { textarea.remove(); }
    return succeeded;
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) { /* The fallback works in older or restricted browsers. */ }
    }
    return fallbackCopy(text);
  }

  function init() {
    document.querySelectorAll('.posts .entry pre').forEach(function (pre) {
      const code = pre.querySelector('code');
      if (!code || pre.parentElement.classList.contains('code-block-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const label = document.createElement('span');
      label.className = 'code-language';
      label.textContent = languageFor(pre, code);
      wrapper.appendChild(label);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code-button';
      button.textContent = '复制';
      button.setAttribute('aria-label', '复制代码');
      wrapper.appendChild(button);

      let resetTimer;
      button.addEventListener('click', async function () {
        const succeeded = await copyText(code.textContent);
        clearTimeout(resetTimer);
        button.textContent = succeeded ? '已复制' : '复制失败';
        button.classList.toggle('copied', succeeded);
        button.focus();
        resetTimer = setTimeout(function () {
          button.textContent = '复制';
          button.classList.remove('copied');
        }, 1500);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
