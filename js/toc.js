(function () {
  'use strict';

  function init() {
    const entry = document.querySelector('.posts .entry');
    if (!entry) return;

    const headings = Array.from(entry.querySelectorAll('h2[id], h3[id], h4[id]'));
    headings.forEach(function (heading) {
      if (heading.querySelector('.heading-anchor')) return;
      const anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = '#' + encodeURIComponent(heading.id);
      anchor.textContent = '#';
      anchor.setAttribute('aria-label', '链接到本节：' + heading.textContent.trim());
      heading.appendChild(anchor);
    });

    const tocLinks = Array.from(document.querySelectorAll('.post-toc .toc-list a[href^="#"]'));
    if (!tocLinks.length) return;

    const tocHeadings = tocLinks.map(function (link) {
      try { return document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1))); }
      catch (error) { return null; }
    }).filter(Boolean);
    if (!tocHeadings.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function setActive(id) {
      tocLinks.forEach(function (link) {
        let matches = false;
        try { matches = decodeURIComponent(link.getAttribute('href').slice(1)) === id; }
        catch (error) { /* Ignore malformed fragments. */ }
        link.classList.toggle('is-active', matches);
        if (matches) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        let target;
        try { target = document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1))); }
        catch (error) { return; }
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', link.getAttribute('href'));
        setActive(target.id);
      });
    });

    function currentHeading() {
      let current = tocHeadings[0];
      tocHeadings.forEach(function (heading) {
        if (heading.getBoundingClientRect().top <= 140) current = heading;
      });
      return current;
    }
    const update = function () { setActive(currentHeading().id); };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(update, { rootMargin: '-100px 0px -70% 0px' });
      tocHeadings.forEach(function (heading) { observer.observe(heading); });
    } else {
      window.addEventListener('scroll', update, { passive: true });
    }
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
