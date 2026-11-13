(function () {
  'use strict';

  function init() {
    const base = (document.querySelector('meta[name="base-url"]')?.content || '').replace(/\/$/, '');
    const palette = document.createElement('div');
    palette.id = 'search-palette';
    palette.className = 'search-palette';
    palette.hidden = true;

    const dialog = document.createElement('div');
    dialog.className = 'search-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'search-dialog-title');

    const header = document.createElement('div');
    header.className = 'search-dialog__header';
    const title = document.createElement('h2');
    title.id = 'search-dialog-title';
    title.className = 'search-dialog__title';
    title.textContent = '搜索文章';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'search-close';
    closeButton.textContent = 'Esc 关闭';
    closeButton.setAttribute('aria-label', '关闭搜索');
    header.append(title, closeButton);

    const input = document.createElement('input');
    input.id = 'search-palette-input';
    input.className = 'search-input';
    input.type = 'search';
    input.placeholder = '搜索标题、标签或内容…';
    input.maxLength = 200;
    input.setAttribute('aria-label', '搜索文章');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', 'search-results');
    input.setAttribute('aria-expanded', 'true');

    const status = document.createElement('div');
    status.className = 'search-dialog__status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const resultViewport = document.createElement('div');
    resultViewport.className = 'search-dialog__results';
    const resultList = document.createElement('div');
    resultList.id = 'search-results';
    resultList.className = 'search-results-list';
    resultList.setAttribute('role', 'listbox');
    resultList.setAttribute('aria-label', '搜索结果');
    resultViewport.appendChild(resultList);
    dialog.append(header, input, status, resultViewport);
    palette.appendChild(dialog);
    document.body.appendChild(palette);
    document.querySelectorAll('[data-search-open]').forEach(function (button) {
      button.setAttribute('aria-controls', palette.id);
      button.setAttribute('aria-expanded', 'false');
    });

    let posts = null;
    let loadPromise = null;
    let loadError = false;
    let currentResults = [];
    let selectedIndex = -1;
    let previousFocus = null;
    let lastTrigger = null;

    function isOpen() {
      return !palette.hidden;
    }

    function isUsableFocusTarget(target) {
      return target instanceof HTMLElement &&
        target.isConnected &&
        !target.closest('[inert], [hidden]') &&
        target.getClientRects().length > 0;
    }

    function restoreFocus() {
      const candidates = [
        lastTrigger,
        previousFocus,
        document.querySelector('.topbar-search'),
        document.querySelector('.sidebar-search-trigger'),
        document.getElementById('sidebar-toggle'),
        document.getElementById('main')
      ];
      const target = candidates.find(isUsableFocusTarget);
      if (target) target.focus();
    }

    function openPalette(trigger) {
      if (isOpen()) {
        input.focus();
        return;
      }
      previousFocus = document.activeElement;
      lastTrigger = trigger instanceof HTMLElement ? trigger : null;
      if (document.body.classList.contains('drawer-open')) {
        document.getElementById('menu-toggle')?.click();
      }
      palette.hidden = false;
      document.body.classList.add('search-open');
      document.querySelectorAll('[data-search-open]').forEach(function (button) {
        button.setAttribute('aria-controls', palette.id);
        button.setAttribute('aria-expanded', 'true');
      });
      input.value = '';
      selectedIndex = -1;
      render();
      input.focus();
      loadIndex();
    }

    function closePalette() {
      if (!isOpen()) return;
      palette.hidden = true;
      document.body.classList.remove('search-open');
      document.querySelectorAll('[data-search-open]').forEach(function (button) {
        button.setAttribute('aria-expanded', 'false');
      });
      input.removeAttribute('aria-activedescendant');
      restoreFocus();
    }

    function validPost(item) {
      return item &&
        typeof item.title === 'string' &&
        typeof item.url === 'string' &&
        item.url.startsWith('/') &&
        !item.url.startsWith('//');
    }

    function normalizePost(item) {
      const tags = Array.isArray(item.tags) ? item.tags.filter(function (tag) {
        return typeof tag === 'string';
      }) : [];
      const content = typeof item.content === 'string' ? item.content.replace(/\s+/g, ' ').trim() : '';
      const date = typeof item.date === 'string' ? item.date : '';
      return {
        title: item.title,
        url: item.url,
        date: date,
        tags: tags,
        content: content,
        titleLower: item.title.toLocaleLowerCase(),
        tagsLower: tags.join(' ').toLocaleLowerCase(),
        contentLower: content.toLocaleLowerCase()
      };
    }

    function loadIndex() {
      if (posts || loadPromise) return loadPromise;
      loadError = false;
      render();
      loadPromise = fetch(base + '/search.json', { credentials: 'same-origin' })
        .then(function (response) {
          if (!response.ok) throw new Error('Search index unavailable');
          return response.json();
        })
        .then(function (data) {
          if (!Array.isArray(data)) throw new Error('Invalid search index');
          posts = data.filter(validPost).map(normalizePost);
          posts.sort(function (a, b) {
            return b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'zh-CN');
          });
          render();
          return posts;
        })
        .catch(function () {
          loadError = true;
          loadPromise = null;
          render();
          return null;
        });
      return loadPromise;
    }

    function termsFor(query) {
      return query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    }

    function scorePost(post, terms) {
      const score = [0, 0, 0];
      for (const term of terms) {
        const titleMatch = post.titleLower.includes(term);
        const tagMatch = post.tagsLower.includes(term);
        const contentMatch = post.contentLower.includes(term);
        if (!titleMatch && !tagMatch && !contentMatch) return null;
        if (titleMatch) score[0]++;
        if (tagMatch) score[1]++;
        if (contentMatch) score[2]++;
      }
      return score;
    }

    function rankedResults(terms) {
      return posts.map(function (post) {
        return { post: post, score: scorePost(post, terms) };
      }).filter(function (entry) {
        return entry.score !== null;
      }).sort(function (a, b) {
        return b.score[0] - a.score[0] ||
          b.score[1] - a.score[1] ||
          b.score[2] - a.score[2] ||
          b.post.date.localeCompare(a.post.date) ||
          a.post.title.localeCompare(b.post.title, 'zh-CN');
      }).slice(0, 20).map(function (entry) {
        return entry.post;
      });
    }

    function appendHighlights(container, value, terms) {
      const source = String(value || '');
      if (!terms.length) {
        container.textContent = source;
        return;
      }
      const ordered = [...new Set(terms)].sort(function (a, b) { return b.length - a.length; });
      const pattern = new RegExp(ordered.map(function (term) {
        return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }).join('|'), 'gi');
      let cursor = 0;
      for (const match of source.matchAll(pattern)) {
        const start = match.index;
        if (start > cursor) container.appendChild(document.createTextNode(source.slice(cursor, start)));
        const mark = document.createElement('mark');
        mark.textContent = match[0];
        container.appendChild(mark);
        cursor = start + match[0].length;
      }
      if (cursor < source.length) container.appendChild(document.createTextNode(source.slice(cursor)));
    }

    function excerptAroundMatch(post, terms) {
      const content = post.content;
      if (!content) return '';
      let first = -1;
      for (const term of terms) {
        const position = post.contentLower.indexOf(term);
        if (position !== -1 && (first === -1 || position < first)) first = position;
      }
      const start = first < 0 ? 0 : Math.max(0, first - 30);
      const end = Math.min(content.length, start + 80);
      return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '');
    }

    function addResult(post, index, terms) {
      const link = document.createElement('a');
      link.id = 'search-result-' + index;
      link.className = 'search-result';
      link.href = post.url;
      link.setAttribute('role', 'option');
      link.setAttribute('aria-selected', 'false');

      const resultTitle = document.createElement('span');
      resultTitle.className = 'search-result__title';
      appendHighlights(resultTitle, post.title, terms);
      const meta = document.createElement('span');
      meta.className = 'search-result__meta';
      const date = document.createElement('time');
      date.dateTime = post.date;
      date.textContent = post.date;
      meta.appendChild(date);
      if (post.tags.length) {
        const tags = document.createElement('span');
        tags.className = 'search-result__tags';
        post.tags.forEach(function (tag) {
          const pill = document.createElement('span');
          pill.className = 'search-result__tag';
          pill.textContent = tag;
          tags.appendChild(pill);
        });
        meta.appendChild(tags);
      }
      link.append(resultTitle, meta);
      const snippetText = excerptAroundMatch(post, terms);
      if (snippetText) {
        const snippet = document.createElement('span');
        snippet.className = 'search-result__snippet';
        appendHighlights(snippet, snippetText, terms);
        link.appendChild(snippet);
      }
      link.addEventListener('mouseenter', function () {
        selectResult(index, false);
      });
      resultList.appendChild(link);
    }

    function selectResult(index, scroll) {
      if (!currentResults.length) return;
      selectedIndex = (index + currentResults.length) % currentResults.length;
      resultList.querySelectorAll('.search-result').forEach(function (link, position) {
        const active = position === selectedIndex;
        link.classList.toggle('is-selected', active);
        link.setAttribute('aria-selected', String(active));
        if (active && scroll) link.scrollIntoView({ block: 'nearest' });
      });
      input.setAttribute('aria-activedescendant', 'search-result-' + selectedIndex);
    }

    function render() {
      if (!isOpen()) return;
      resultList.replaceChildren();
      input.removeAttribute('aria-activedescendant');
      selectedIndex = -1;
      if (loadError) {
        status.textContent = '';
        const message = document.createElement('p');
        message.className = 'search-empty';
        message.textContent = '搜索暂时不可用，请稍后重试。';
        resultList.appendChild(message);
        return;
      }
      if (!posts) {
        status.textContent = '正在加载文章…';
        return;
      }
      const terms = termsFor(input.value);
      currentResults = terms.length ? rankedResults(terms) : posts.slice(0, 5);
      status.textContent = terms.length ? currentResults.length + ' 篇结果' : '最近文章';
      if (!currentResults.length) {
        const message = document.createElement('p');
        message.className = 'search-empty';
        message.textContent = '没有找到相关文章，换个关键词试试。';
        resultList.appendChild(message);
        return;
      }
      currentResults.forEach(function (post, index) {
        addResult(post, index, terms);
      });
      selectResult(0, false);
    }

    function typingInField(target) {
      if (!(target instanceof Element)) return false;
      return !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
    }

    document.addEventListener('click', function (event) {
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest('[data-search-open]');
      if (!trigger) return;
      event.preventDefault();
      openPalette(trigger);
    });
    palette.addEventListener('click', function (event) {
      if (event.target === palette) closePalette();
    });
    closeButton.addEventListener('click', closePalette);
    input.addEventListener('input', render);

    document.addEventListener('keydown', function (event) {
      const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (shortcut || (!isOpen() && event.key === '/' && !event.metaKey && !event.ctrlKey &&
        !event.altKey && !typingInField(event.target))) {
        event.preventDefault();
        openPalette(null);
        return;
      }
      if (!isOpen()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        closePalette();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        selectResult(selectedIndex + (event.key === 'ArrowDown' ? 1 : -1), true);
      } else if (event.key === 'Enter' && event.target === input && selectedIndex >= 0) {
        event.preventDefault();
        window.location.assign(currentResults[selectedIndex].url);
      } else if (event.key === 'Tab') {
        const focusable = Array.from(dialog.querySelectorAll('button, input, a[href]')).filter(isUsableFocusTarget);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
