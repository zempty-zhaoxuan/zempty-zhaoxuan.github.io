// Enhanced Theme System with smooth transitions and system preference detection
// 增强主题系统

// FOUC Prevention - executed immediately
(function() {
  // Get stored theme preference or system preference
  let storedTheme;
  try {
    storedTheme = localStorage.getItem('theme-preference');
  } catch (e) {
    storedTheme = null;
  }
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply theme immediately to prevent FOUC
  if (storedTheme === 'dark' || (storedTheme === 'auto' && prefersDark) || (!storedTheme && prefersDark)) {
    document.documentElement.classList.add('dark-theme');
  } else {
    document.documentElement.classList.add('light-theme');
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (!themeToggle) {
    console.warn('Theme toggle button not found');
    return;
  }
  
  // Enhanced theme system
  const ThemeManager = {
    themes: ['light', 'dark', 'auto'],
    currentTheme: 'auto',
    prefersDarkScheme: window.matchMedia('(prefers-color-scheme: dark)'),
    
    init() {
      this.loadThemePreference();
      this.setupSystemPreferenceListener();
      this.applyTheme();
      this.updateUI();
      this.setupTransitions();
    },
    
    loadThemePreference() {
      try {
        const stored = localStorage.getItem('theme-preference');
        this.currentTheme = stored || 'auto';
      } catch (e) {
        console.warn('Cannot access localStorage:', e);
        this.currentTheme = 'auto';
      }
    },
    
    saveThemePreference() {
      try {
        localStorage.setItem('theme-preference', this.currentTheme);
      } catch (e) {
        console.warn('Cannot save theme preference:', e);
      }
    },
    
    setupSystemPreferenceListener() {
      this.prefersDarkScheme.addEventListener('change', (e) => {
        if (this.currentTheme === 'auto') {
          this.applyTheme();
          this.updateUI();
          this.dispatchThemeEvent();
        }
      });
    },
    
    setupTransitions() {
      // Add transition class for smooth theme switching
      document.documentElement.classList.add('theme-transition');
      
      // Remove transition class after initial load to prevent unwanted animations
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 100);
    },
    
    getEffectiveTheme() {
      if (this.currentTheme === 'auto') {
        return this.prefersDarkScheme.matches ? 'dark' : 'light';
      }
      return this.currentTheme;
    },
    
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
      const icons = {
        light: '🌙',
        dark: '☀️',
        auto: '🔄'
      };
      
      const tooltips = {
        light: '切换为深色主题',
        dark: '切换为浅色主题', 
        auto: '自动主题 (跟随系统)'
      };
      
      // Show current mode icon, but tooltip shows what clicking will do
      let displayIcon, tooltipText;
      
      if (this.currentTheme === 'auto') {
        displayIcon = effectiveTheme === 'dark' ? '🌙' : '☀️';
        tooltipText = '当前: 自动主题 (点击切换)';
      } else {
        displayIcon = icons[effectiveTheme];
        const nextTheme = this.themes[(this.themes.indexOf(this.currentTheme) + 1) % this.themes.length];
        tooltipText = tooltips[nextTheme] || '切换主题';
      }
      
      themeToggle.innerHTML = displayIcon;
      themeToggle.setAttribute('title', tooltipText);
      themeToggle.setAttribute('aria-label', tooltipText);
    },
    
    updateMetaThemeColor(effectiveTheme) {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
      }
      
      const colors = {
        light: '#ffffff',
        dark: '#212529'
      };
      
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