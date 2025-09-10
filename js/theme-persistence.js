// Theme Persistence Utility - 主题持久化工具
// This script runs immediately to prevent FOUC (Flash of Unstyled Content)

(function() {
  'use strict';
  
  // Theme persistence configuration
  const THEME_CONFIG = {
    storageKey: 'theme-preference',
    defaultTheme: 'auto',
    themes: ['light', 'dark', 'auto'],
    transitionDuration: 300
  };
  
  // Utility functions
  const ThemePersistence = {
    // Get stored theme preference
    getStoredTheme() {
      try {
        return localStorage.getItem(THEME_CONFIG.storageKey) || THEME_CONFIG.defaultTheme;
      } catch (e) {
        console.warn('Cannot access localStorage for theme:', e);
        return THEME_CONFIG.defaultTheme;
      }
    },
    
    // Get system preference
    getSystemPreference() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    
    // Resolve effective theme
    resolveTheme(preference) {
      if (preference === 'auto') {
        return this.getSystemPreference();
      }
      return preference;
    },
    
    // Apply theme immediately
    applyThemeImmediate(theme) {
      const html = document.documentElement;
      const body = document.body;
      
      // Remove existing theme classes
      html.classList.remove('light-theme', 'dark-theme');
      body.classList.remove('light-theme', 'dark-theme');
      
      // Add new theme class
      const themeClass = `${theme}-theme`;
      html.classList.add(themeClass);
      body.classList.add(themeClass);
      
      // Set data attribute for CSS targeting
      html.setAttribute('data-theme', theme);
      
      // Update meta theme-color for mobile browsers
      this.updateMetaThemeColor(theme);
    },
    
    // Update meta theme-color
    updateMetaThemeColor(theme) {
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
      
      metaThemeColor.content = colors[theme] || colors.light;
    },
    
    // Initialize theme on page load
    init() {
      const storedPreference = this.getStoredTheme();
      const effectiveTheme = this.resolveTheme(storedPreference);
      
      // Apply theme immediately to prevent FOUC
      this.applyThemeImmediate(effectiveTheme);
      
      // Store the preference and effective theme for later use
      window.__THEME_STATE__ = {
        preference: storedPreference,
        effective: effectiveTheme,
        system: this.getSystemPreference()
      };
      
      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (window.__THEME_STATE__ && window.__THEME_STATE__.preference === 'auto') {
          const newTheme = e.matches ? 'dark' : 'light';
          this.applyThemeImmediate(newTheme);
          window.__THEME_STATE__.effective = newTheme;
          window.__THEME_STATE__.system = newTheme;
          
          // Dispatch event for other components
          this.dispatchThemeChangeEvent(newTheme, 'auto');
        }
      });
    },
    
    // Dispatch theme change event
    dispatchThemeChangeEvent(effectiveTheme, preference) {
      try {
        const event = new CustomEvent('themeChanged', {
          detail: {
            theme: effectiveTheme,
            preference: preference,
            timestamp: Date.now()
          }
        });
        document.dispatchEvent(event);
      } catch (e) {
        console.warn('Cannot dispatch theme change event:', e);
      }
    }
  };
  
  // Initialize immediately
  ThemePersistence.init();
  
  // Expose for use by other scripts
  window.ThemePersistence = ThemePersistence;
  
  // Mark as loaded
  document.documentElement.setAttribute('data-theme-loaded', 'true');
})();