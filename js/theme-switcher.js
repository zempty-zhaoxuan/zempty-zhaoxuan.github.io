// Theme System (Light/Dark only) with smooth transitions
// 仅保留浅色/深色两种主题，移除自动跟随模式，修复需要点击两次的问题

// FOUC Prevention - executed immediately (after DOM parsed due to defer)
(function() {
  let storedTheme = null;
  try {
    // Prefer unified key 'theme'; fall back to legacy 'theme-preference'
    storedTheme = localStorage.getItem('theme') || localStorage.getItem('theme-preference');
    // Migrate legacy stored values like 'dark-theme'/'light-theme'
    if (storedTheme === 'dark-theme') storedTheme = 'dark';
    if (storedTheme === 'light-theme') storedTheme = 'light';
  } catch (e) {}

  const theme = storedTheme === 'light' ? 'light' : 'dark';
  const cls = theme + '-theme';
  document.documentElement.classList.add(cls);
  if (document.body) {
    document.body.classList.add(cls);
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (!themeToggle) {
    console.warn('Theme toggle button not found');
    return;
  }
  
  // Theme system (light/dark only)
  const ThemeManager = {
    themes: ['light', 'dark'],
    currentTheme: 'dark',
    
    init() {
      this.loadThemePreference();
      this.applyTheme();
      this.updateUI();
      this.setupTransitions();
    },
    
    loadThemePreference() {
      try {
        let stored = localStorage.getItem('theme') || localStorage.getItem('theme-preference');
        if (stored === 'dark-theme') stored = 'dark';
        if (stored === 'light-theme') stored = 'light';
        this.currentTheme = stored === 'light' ? 'light' : 'dark';
      } catch (e) {
        console.warn('Cannot access localStorage:', e);
        this.currentTheme = 'dark';
      }
    },
    
    saveThemePreference() {
      try {
        localStorage.setItem('theme', this.currentTheme);
        // Clean legacy key to avoid conflicts
        localStorage.removeItem('theme-preference');
      } catch (e) {
        console.warn('Cannot save theme preference:', e);
      }
    },
    
    setupTransitions() {
      // Add transition class for smooth theme switching
      document.documentElement.classList.add('theme-transition');
      
      // Remove transition class after initial load to prevent unwanted animations
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 100);
    },
    
    getEffectiveTheme() { return this.currentTheme; },
    
    applyTheme() {
      const effectiveTheme = this.getEffectiveTheme();

      // Add transition for smooth switching
      document.documentElement.classList.add('theme-transition');
      
      // Remove existing theme classes
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      document.body.classList.remove('light-theme', 'dark-theme');
      
      // Apply new theme
      const themeClass = `${effectiveTheme}-theme`;
      document.documentElement.classList.add(themeClass);
      document.body.classList.add(themeClass);
      
      // Remove transition class after animation
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 300);
    },
    
    cycleTheme() {
      const currentIndex = this.themes.indexOf(this.currentTheme);
      const nextIndex = (currentIndex + 1) % this.themes.length;
      this.currentTheme = this.themes[nextIndex];
      
      this.saveThemePreference();
      this.applyTheme();
      this.updateUI();
      this.dispatchThemeEvent();
    },
    
    updateUI() {
      const effectiveTheme = this.getEffectiveTheme();
      
      // Update toggle button
      this.updateToggleButton(effectiveTheme);
      
      // Update meta theme-color for mobile browsers
      this.updateMetaThemeColor(effectiveTheme);
    },
    
    updateToggleButton(effectiveTheme) {
      const icon = effectiveTheme === 'dark' ? '☀️' : '🌙';
      const tooltip = effectiveTheme === 'dark' ? '切换为浅色主题' : '切换为深色主题';
      themeToggle.innerHTML = icon;
      themeToggle.setAttribute('title', tooltip);
      themeToggle.setAttribute('aria-label', tooltip);
    },
    
    updateMetaThemeColor(effectiveTheme) {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
      }
      
      const colors = { light: '#ffffff', dark: '#212529' };
      
      metaThemeColor.content = colors[effectiveTheme] || colors.light;
    },
    
    dispatchThemeEvent() {
      try {
        const themeEvent = new CustomEvent('themeChanged', {
          detail: { 
            theme: this.getEffectiveTheme(),
            preference: this.currentTheme
          }
        });
        document.dispatchEvent(themeEvent);
      } catch (e) {
        console.warn('Cannot dispatch theme change event:', e);
      }
    }
  };
  
  // Initialize theme manager
  ThemeManager.init();
  
  // Theme toggle event listener
  themeToggle.addEventListener('click', function() {
    ThemeManager.cycleTheme();
  });
  
  // Keyboard support for theme toggle
  themeToggle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      ThemeManager.cycleTheme();
    }
  });
  
  // Expose ThemeManager globally for debugging and external use
  window.ThemeManager = ThemeManager;
});