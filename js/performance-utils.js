/**
 * Performance Utilities for Blog Optimization
 * Handles critical CSS loading, font optimization, and resource loading measurement
 */

class PerformanceUtils {
  constructor() {
    this.metrics = {
      startTime: performance.now(),
      criticalCSSLoaded: false,
      fontsLoaded: false,
      resourceLoadTimes: new Map()
    };
    
    this.observers = {
      resourceObserver: null,
      fontObserver: null
    };
    
    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    this.setupResourceObserver();
    this.measureInitialMetrics();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }
  }

  /**
   * Handle DOM ready event
   */
  onDOMReady() {
    this.loadCriticalCSS();
    this.optimizeFontLoading();
    this.measureCoreWebVitals();
  }

  /**
   * Load critical CSS inline for above-the-fold content
   */
  async loadCriticalCSS() {
    const startTime = performance.now();
    
    try {
      // Initialize CSS optimizer if available
      if (window.CSSOptimizer) {
        const cssOptimizer = new window.CSSOptimizer();
        const criticalCSS = await cssOptimizer.extractCriticalCSS();
        
        if (criticalCSS) {
          // Create and inject critical CSS
          const style = document.createElement('style');
          style.textContent = criticalCSS;
          style.setAttribute('data-critical', 'true');
          document.head.insertBefore(style, document.head.firstChild);
          
          this.metrics.criticalCSSLoaded = true;
          this.recordResourceLoadTime('critical-css', startTime);
          
          // Load non-critical CSS asynchronously
          await cssOptimizer.loadNonCriticalCSS();
        }
      } else {
        // Fallback to basic critical CSS
        const criticalCSS = this.extractCriticalCSS();
        
        if (criticalCSS) {
          const style = document.createElement('style');
          style.textContent = criticalCSS;
          style.setAttribute('data-critical', 'true');
          document.head.insertBefore(style, document.head.firstChild);
          
          this.metrics.criticalCSSLoaded = true;
          this.recordResourceLoadTime('critical-css', startTime);
        }
        
        // Load non-critical CSS asynchronously
        this.loadNonCriticalCSS();
      }
      
    } catch (error) {
      console.warn('Critical CSS loading failed:', error);
      // Fallback to regular CSS loading
      this.ensureFallbackCSS();
    }
  }

  /**
   * Extract critical CSS for above-the-fold content
   */
  extractCriticalCSS() {
    // Critical CSS for immediate rendering
    return `
      /* Critical CSS for above-the-fold content */
      html { font-size: 18px; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #333;
        background-color: #fff;
        line-height: 1.9em;
        margin: 0;
        padding: 0;
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      /* Critical layout styles */
      .wrapper-sidebar {
        width: 250px;
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        background-color: #f8f9fa;
        border-right: 1px solid #e9ecef;
        z-index: 4;
      }
      
      .wrapper-content {
        margin-left: 250px;
        width: calc(100% - 250px);
      }
      
      .container {
        margin: 0 auto;
        max-width: 1000px;
        padding: 0 20px;
        width: 100%;
        box-sizing: border-box;
      }
      
      /* Critical typography */
      h1, h2, h3, h4, h5, h6 {
        font-family: inherit;
        line-height: 1.6;
        margin-top: 1.8em;
        margin-bottom: 0.8em;
        font-weight: 700;
      }
      
      h1 { font-size: 2.2em; }
      h2 { font-size: 1.8em; }
      h3 { font-size: 1.5em; }
      
      /* Critical mobile styles */
      @media screen and (max-width: 768px) {
        .wrapper-sidebar {
          width: 100%;
          height: auto;
          position: relative;
        }
        .wrapper-content {
          margin-left: 0;
          width: 100%;
        }
        .container {
          padding: 0 15px;
        }
      }
      
      /* Prevent FOUC */
      .loading-hidden { opacity: 0; }
      .loading-visible { opacity: 1; transition: opacity 0.3s ease; }
    `;
  }

  /**
   * Load non-critical CSS asynchronously
   */
  loadNonCriticalCSS() {
    const nonCriticalCSS = [
      '/style.css',
      '/assets/css/animations.css',
      '/assets/css/custom.css'
    ];

    nonCriticalCSS.forEach(href => {
      this.loadCSSAsync(href);
    });
  }

  /**
   * Load CSS file asynchronously
   */
  loadCSSAsync(href) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href + '?v=' + (window.siteVersion || Date.now());
    
    link.onload = () => {
      link.rel = 'stylesheet';
      link.onload = null;
    };
    
    // Fallback for browsers that don't support preload
    const fallback = setTimeout(() => {
      link.rel = 'stylesheet';
    }, 3000);
    
    link.addEventListener('load', () => clearTimeout(fallback));
    
    document.head.appendChild(link);
  }

  /**
   * Optimize font loading with FOUT/FOIT prevention
   */
  async optimizeFontLoading() {
    const startTime = performance.now();
    
    try {
      // Check if Font Loading API is supported
      if ('fonts' in document) {
        await this.loadFontsWithAPI();
      } else {
        // Fallback for older browsers
        this.loadFontsWithFallback();
      }
      
      this.metrics.fontsLoaded = true;
      this.recordResourceLoadTime('fonts', startTime);
      
    } catch (error) {
      console.warn('Font loading optimization failed:', error);
      this.loadFontsWithFallback();
    }
  }

  /**
   * Load fonts using Font Loading API
   */
  async loadFontsWithAPI() {
    const fontPromises = [];
    
    // Define critical fonts
    const criticalFonts = [
      { family: 'JetBrains Mono', weight: '400', style: 'normal' },
      { family: 'JetBrains Mono', weight: '700', style: 'normal' }
    ];
    
    // Load critical fonts first
    for (const font of criticalFonts) {
      const fontFace = new FontFace(
        font.family,
        `url('/assets/fonts/JetBrainsMono-2.304/webfonts/JetBrainsMono-${font.weight === '700' ? 'Bold' : 'Regular'}.woff2')`,
        { weight: font.weight, style: font.style, display: 'swap' }
      );
      
      fontPromises.push(
        fontFace.load().then(loadedFont => {
          document.fonts.add(loadedFont);
          return loadedFont;
        })
      );
    }
    
    // Wait for critical fonts to load
    await Promise.allSettled(fontPromises);
    
    // Apply font-loaded class to prevent FOIT
    document.documentElement.classList.add('fonts-loaded');
  }

  /**
   * Fallback font loading for older browsers
   */
  loadFontsWithFallback() {
    // Add font-display: swap via CSS if not already present
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: "JetBrains Mono";
        src: url("/assets/fonts/JetBrainsMono-2.304/webfonts/JetBrainsMono-Regular.woff2") format("woff2");
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: "JetBrains Mono";
        src: url("/assets/fonts/JetBrainsMono-2.304/webfonts/JetBrainsMono-Bold.woff2") format("woff2");
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
    
    // Set timeout to add fonts-loaded class
    setTimeout(() => {
      document.documentElement.classList.add('fonts-loaded');
    }, 3000);
  }

  /**
   * Ensure fallback CSS is loaded if critical CSS fails
   */
  ensureFallbackCSS() {
    const existingCSS = document.querySelector('link[href*="style.css"]');
    if (!existingCSS) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/style.css?v=' + (window.siteVersion || Date.now());
      document.head.appendChild(link);
    }
  }

  /**
   * Setup Resource Observer for performance monitoring
   */
  setupResourceObserver() {
    if ('PerformanceObserver' in window) {
      this.observers.resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.processResourceEntry(entry);
        });
      });
      
      this.observers.resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Process resource performance entry
   */
  processResourceEntry(entry) {
    const resourceType = this.getResourceType(entry.name);
    const loadTime = entry.responseEnd - entry.startTime;
    
    this.recordResourceLoadTime(resourceType, entry.startTime, loadTime);
    
    // Log slow resources
    if (loadTime > 1000) {
      console.warn(`Slow resource detected: ${entry.name} (${loadTime.toFixed(2)}ms)`);
    }
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.includes('.css')) return 'css';
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) return 'image';
    return 'other';
  }

  /**
   * Record resource load time
   */
  recordResourceLoadTime(resourceType, startTime, duration = null) {
    const loadTime = duration || (performance.now() - startTime);
    
    if (!this.metrics.resourceLoadTimes.has(resourceType)) {
      this.metrics.resourceLoadTimes.set(resourceType, []);
    }
    
    this.metrics.resourceLoadTimes.get(resourceType).push({
      timestamp: Date.now(),
      loadTime: loadTime,
      startTime: startTime
    });
  }

  /**
   * Measure initial performance metrics
   */
  measureInitialMetrics() {
    // Measure navigation timing
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      this.metrics.navigationStart = timing.navigationStart;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
    }
  }

  /**
   * Measure Core Web Vitals
   */
  measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      totalLoadTime: performance.now() - this.metrics.startTime,
      resourceLoadTimes: Object.fromEntries(this.metrics.resourceLoadTimes)
    };
  }

  /**
   * Report performance metrics
   */
  reportMetrics() {
    const metrics = this.getMetrics();
    
    // Only log to console in localhost development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.group('Performance Metrics');
      console.log('Total Load Time:', metrics.totalLoadTime.toFixed(2) + 'ms');
      console.log('Critical CSS Loaded:', metrics.criticalCSSLoaded);
      console.log('Fonts Loaded:', metrics.fontsLoaded);
      console.log('LCP:', metrics.lcp?.toFixed(2) + 'ms');
      console.log('FID:', metrics.fid?.toFixed(2) + 'ms');
      console.log('CLS:', metrics.cls?.toFixed(4));
      console.log('Resource Load Times:', metrics.resourceLoadTimes);
      console.groupEnd();
    }
    
    // Send to analytics (if configured)
    if (window.gtag && typeof window.gtag === 'function') {
      window.gtag('event', 'performance_metrics', {
        custom_map: {
          'metric1': 'load_time',
          'metric2': 'lcp',
          'metric3': 'fid',
          'metric4': 'cls'
        },
        'metric1': Math.round(metrics.totalLoadTime),
        'metric2': Math.round(metrics.lcp || 0),
        'metric3': Math.round(metrics.fid || 0),
        'metric4': Math.round((metrics.cls || 0) * 1000)
      });
    }
    
    return metrics;
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    if (this.observers.resourceObserver) {
      this.observers.resourceObserver.disconnect();
    }
  }
}

// Initialize performance utilities
window.PerformanceUtils = PerformanceUtils;

// Auto-initialize if not in test environment
if (typeof module === 'undefined') {
  window.performanceUtils = new PerformanceUtils();
  
  // Report metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.performanceUtils.reportMetrics();
    }, 1000);
  });
}