(function () {
  'use strict';

  function init() {
    const body = document.body;
    const sidebar = document.getElementById('site-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuButton = document.getElementById('menu-toggle');
    const closeButton = document.getElementById('drawer-close');
    const collapseButton = document.getElementById('sidebar-toggle');
    const backToTop = document.getElementById('back-to-top');
    const mobile = window.matchMedia('(max-width: 1023px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!sidebar || !overlay || !menuButton) return;

    let collapsed = false;
    let previousBodyOverflow = '';

    try {
      collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    } catch (error) { /* Browsing remains available when storage is blocked. */ }

    function syncVisibility() {
      const concealed = mobile.matches
        ? !body.classList.contains('drawer-open')
        : collapsed;
      sidebar.inert = concealed;
      if (concealed) sidebar.setAttribute('aria-hidden', 'true');
      else sidebar.removeAttribute('aria-hidden');
    }

    function syncCollapse() {
      body.classList.toggle('sidebar-collapsed', !mobile.matches && collapsed);
      if (collapseButton) {
        const label = collapsed ? '退出专注模式' : '进入专注模式';
        collapseButton.setAttribute('aria-label', label);
        collapseButton.setAttribute('title', label);
        collapseButton.setAttribute('aria-expanded', String(!collapsed));
      }
      syncVisibility();
    }

    function setCollapsed(value) {
      collapsed = value;
      if (collapsed && sidebar.contains(document.activeElement) && collapseButton) {
        collapseButton.focus();
      }
      try { localStorage.setItem('sidebar-collapsed', String(collapsed)); }
      catch (error) { /* The choice still lasts for this page. */ }
      syncCollapse();
    }

    function openDrawer() {
      if (!mobile.matches || body.classList.contains('drawer-open')) return;
      previousBodyOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
      body.classList.add('drawer-open');
      overlay.hidden = false;
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', '关闭菜单');
      menuButton.setAttribute('title', '关闭菜单');
      syncVisibility();
      (closeButton || sidebar.querySelector('a') || sidebar).focus();
    }

    function closeDrawer(restoreFocus) {
      if (!body.classList.contains('drawer-open')) return;
      if (restoreFocus) menuButton.focus();
      body.classList.remove('drawer-open');
      body.style.overflow = previousBodyOverflow;
      overlay.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', '打开菜单');
      menuButton.setAttribute('title', '打开菜单');
      syncVisibility();
    }

    function drawerFocusables() {
      return Array.from(sidebar.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(function (element) {
          return !element.hidden && !element.closest('[hidden]') && element.getClientRects().length > 0;
        });
    }

    menuButton.addEventListener('click', function () {
      if (body.classList.contains('drawer-open')) closeDrawer(true);
      else openDrawer();
    });
    if (closeButton) closeButton.addEventListener('click', function () { closeDrawer(true); });
    overlay.addEventListener('click', function () { closeDrawer(true); });
    sidebar.addEventListener('click', function (event) {
      if (mobile.matches && event.target.closest('a, [data-search-open]')) {
        closeDrawer(false);
      }
    });
    if (collapseButton) {
      collapseButton.addEventListener('click', function () {
        setCollapsed(!collapsed);
      });
    }

    document.addEventListener('keydown', function (event) {
      if (!body.classList.contains('drawer-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer(true);
      } else if (event.key === 'Tab') {
        const focusables = drawerFocusables();
        if (!focusables.length) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    function onModeChange() {
      closeDrawer(false);
      syncCollapse();
    }
    if (mobile.addEventListener) mobile.addEventListener('change', onModeChange);
    else mobile.addListener(onModeChange);
    syncCollapse();

    if (backToTop) {
      let frameRequested = false;
      function updateBackToTop() {
        backToTop.hidden = window.scrollY <= window.innerHeight;
        frameRequested = false;
      }
      function requestUpdate() {
        if (!frameRequested) {
          frameRequested = true;
          requestAnimationFrame(updateBackToTop);
        }
      }
      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate);
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      });
      updateBackToTop();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
