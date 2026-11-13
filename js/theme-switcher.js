document.addEventListener('DOMContentLoaded', function () {
  const toggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  let preference = null;

  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') preference = stored;
  } catch (error) { /* The system preference still works without storage. */ }

  function effectiveTheme() {
    return preference || (media && media.matches ? 'dark' : 'light');
  }

  function applyTheme(theme, announce) {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(theme + '-theme');

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111315' : '#fbfbfa';

    toggles.forEach(function (toggle) {
      const label = theme === 'dark' ? '切换为浅色主题' : '切换为深色主题';
      toggle.setAttribute('title', label);
      toggle.setAttribute('aria-label', label);
    });

    if (announce) {
      document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
    }
  }

  applyTheme(effectiveTheme(), false);

  if (media) {
    const onSchemeChange = function () {
      if (!preference) applyTheme(effectiveTheme(), true);
    };
    if (media.addEventListener) media.addEventListener('change', onSchemeChange);
    else if (media.addListener) media.addListener(onSchemeChange);
  }

  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      preference = effectiveTheme() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', preference);
        localStorage.removeItem('theme-preference');
      } catch (error) { /* Keep the choice for this page when storage is unavailable. */ }
      applyTheme(preference, true);
    });
  });
});
