/**
 * CSS Optimizer for Critical CSS Loading
 * Handles dynamic critical CSS extraction and non-critical CSS loading
 */

class CSSOptimizer {
  constructor() {
    this.criticalSelectors = [
      // Layout selectors
      'html', 'body', '.wrapper-sidebar', '.wrapper-content', '.container',
      // Typography selectors
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a',
      // Navigation selectors
      '.site-info', '.site-name', '.site-description', 'nav', '.navlist',
      // Critical component selectors
      '.posts', '.post', '.entry', '.date',
      // Mobile selectors
      '@media screen and (max-width: 768px)'
    ];
    
    this.loadedCSS = new Set();
    this.cssCache = new Map();
  }

  /**
   * Extract critical CSS from existing stylesheets
   */
  async extractCriticalCSS() {
    const criticalRules = [];
    
    try {
      // Get all stylesheets
      const stylesheets = Array.from(document.styleSheets);
      
      for (const stylesheet of stylesheets) {
        try {
          const rules = this.getStylesheetRules(stylesheet);
          const critical = this.filterCriticalRules(rules);
          criticalRules.push(...critical);
        } catch (error) {
          // Skip stylesheets that can't be accessed (CORS)
          console.warn('Cannot access stylesheet:', stylesheet.href, error);
        }
      }
      
      return this.optimizeCriticalCSS(criticalRules);
      
    } catch (error) {
      console.warn('Critical CSS extraction failed:', error);
      return this.getFallbackCriticalCSS();
    }
  }

  /**
   * Get rules from a stylesheet
   */
  getStylesheetRules(stylesheet) {
    try {
      return Array.from(stylesheet.cssRules || stylesheet.rules || []);
    } catch (error) {
      // Handle CORS or other access issues
      return [];
    }
  }

  /**
   * Filter rules that are critical for above-the-fold rendering
   */
  filterCriticalRules(rules) {
    const criticalRules = [];
    
    for (const rule of rules) {
      if (this.isCriticalRule(rule)) {
        criticalRules.push(rule.cssText);
      }
      
      // Handle media queries
      if (rule.type === CSSRule.MEDIA_RULE) {
        const mediaRules = this.filterCriticalRules(Array.from(rule.cssRules));
        if (mediaRules.length > 0) {
          criticalRules.push(`@media ${rule.conditionText} { ${mediaRules.join(' ')} }`);
        }
      }
    }
    
    return criticalRules;
  }

  /**
   * Check if a CSS rule is critical for initial rendering
   */
  isCriticalRule(rule) {
    if (!rule.selectorText) return false;
    
    // Check against critical selectors
    return this.criticalSelectors.some(selector => {
      if (selector.startsWith('@media')) {
        return rule.parentRule && rule.parentRule.conditionText;
      }
      return rule.selectorText.includes(selector) || 
             selector.includes(rule.selectorText.split(' ')[0]);
    });
  }

  /**
   * Optimize critical CSS by removing duplicates and minifying
   */
  optimizeCriticalCSS(rules) {
    // Remove duplicates
    const uniqueRules = [...new Set(rules)];
    
    // Combine and minify
    let css = uniqueRules.join(' ');
    
    // Basic minification
    css = css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
      .replace(/\s*{\s*/g, '{') // Clean braces
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*,\s*/g, ',') // Clean commas
      .replace(/\s*:\s*/g, ':') // Clean colons
      .replace(/\s*;\s*/g, ';') // Clean semicolons
      .trim();
    
    return css;
  }

  /**
   * Get fallback critical CSS if extraction fails
   */
  getFallbackCriticalCSS() {
    return `
      html{font-size:18px}
      body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#333;background-color:#fff;line-height:1.9em;margin:0;padding:0;transition:background-color .3s ease,color .3s ease}
      .wrapper-sidebar{width:250px;position:fixed;top:0;left:0;height:100%;background-color:#f8f9fa;border-right:1px solid #e9ecef;z-index:4}
      .wrapper-content{margin-left:250px;width:calc(100% - 250px)}
      .container{margin:0 auto;max-width:1000px;padding:0 20px;width:100%;box-sizing:border-box}
      h1,h2,h3,h4,h5,h6{font-family:inherit;line-height:1.6;margin-top:1.8em;margin-bottom:.8em;font-weight:700}
      h1{font-size:2.2em}h2{font-size:1.8em}h3{font-size:1.5em}
      @media screen and (max-width:768px){.wrapper-sidebar{width:100%;height:auto;position:relative}.wrapper-content{margin-left:0;width:100%}.container{padding:0 15px}}
      .loading-hidden{opacity:0}.loading-visible{opacity:1;transition:opacity .3s ease}
    `.replace(/\s+/g, ' ').trim();
  }

  /**
   * Load CSS file asynchronously with caching
   */
  async loadCSSAsync(href, priority = 'low') {
    if (this.loadedCSS.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Check cache first
      if (this.cssCache.has(href)) {
        this.injectCachedCSS(href);
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      
      // Set priority hint if supported
      if ('importance' in link) {
        link.importance = priority;
      }

      const onLoad = () => {
        link.rel = 'stylesheet';
        link.onload = null;
        this.loadedCSS.add(href);
        resolve();
      };

      const onError = () => {
        console.warn('Failed to load CSS:', href);
        reject(new Error(`Failed to load CSS: ${href}`));
      };

      link.onload = onLoad;
      link.onerror = onError;

      // Fallback timeout
      const fallbackTimer = setTimeout(() => {
        link.rel = 'stylesheet';
        onLoad();
      }, 3000);

      link.addEventListener('load', () => {
        clearTimeout(fallbackTimer);
      });

      document.head.appendChild(link);
    });
  }

  /**
   * Inject cached CSS
   */
  injectCachedCSS(href) {
    const cachedCSS = this.cssCache.get(href);
    if (cachedCSS) {
      const style = document.createElement('style');
      style.textContent = cachedCSS;
      style.setAttribute('data-href', href);
      document.head.appendChild(style);
      this.loadedCSS.add(href);
    }
  }

  /**
   * Preload and cache CSS for future use
   */
  async preloadCSS(href) {
    if (this.cssCache.has(href)) {
      return;
    }

    try {
      const response = await fetch(href);
      if (response.ok) {
        const css = await response.text();
        this.cssCache.set(href, css);
      }
    } catch (error) {
      console.warn('Failed to preload CSS:', href, error);
    }
  }

  /**
   * Load non-critical CSS with prioritization
   */
  async loadNonCriticalCSS() {
    const cssFiles = [
      { href: '/style.css', priority: 'high' },
      { href: '/assets/css/animations.css', priority: 'low' },
      { href: '/assets/css/custom.css', priority: 'low' }
    ];

    // Add version parameter
    const version = window.siteVersion || Date.now();
    
    const loadPromises = cssFiles.map(({ href, priority }) => {
      const versionedHref = `${href}?v=${version}`;
      return this.loadCSSAsync(versionedHref, priority);
    });

    try {
      await Promise.allSettled(loadPromises);
      
      // Trigger custom event when all CSS is loaded
      document.dispatchEvent(new CustomEvent('cssLoaded', {
        detail: { timestamp: performance.now() }
      }));
      
    } catch (error) {
      console.warn('Some CSS files failed to load:', error);
    }
  }

  /**
   * Optimize existing CSS loading
   */
  optimizeExistingCSS() {
    // Find existing CSS links and optimize them
    const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
    
    existingLinks.forEach(link => {
      if (!link.hasAttribute('data-optimized')) {
        // Add loading optimization
        link.setAttribute('data-optimized', 'true');
        
        // Add error handling
        link.addEventListener('error', () => {
          console.warn('CSS failed to load:', link.href);
        });
      }
    });
  }

  /**
   * Get CSS loading metrics
   */
  getMetrics() {
    return {
      loadedCSS: Array.from(this.loadedCSS),
      cachedCSS: Array.from(this.cssCache.keys()),
      totalLoaded: this.loadedCSS.size,
      totalCached: this.cssCache.size
    };
  }
}

// Export for use in performance utils
window.CSSOptimizer = CSSOptimizer;

// Auto-initialize if not in test environment
if (typeof module === 'undefined') {
  window.cssOptimizer = new CSSOptimizer();
}