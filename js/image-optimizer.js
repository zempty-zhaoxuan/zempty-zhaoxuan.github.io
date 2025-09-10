/**
 * Image Optimizer for Progressive Loading and WebP/AVIF Support
 * Handles lazy loading, responsive images, and format optimization
 */

class ImageOptimizer {
  constructor(options = {}) {
    this.options = {
      // Lazy loading options
      rootMargin: '50px 0px',
      threshold: 0.01,
      
      // Format support detection
      webpSupport: null,
      avifSupport: null,
      
      // Loading options
      fadeInDuration: 300,
      retryAttempts: 3,
      retryDelay: 1000,
      
      // Quality settings
      defaultQuality: 85,
      retinaQuality: 75,
      
      // Size breakpoints
      breakpoints: [320, 640, 768, 1024, 1200, 1600],
      
      ...options
    };
    
    this.intersectionObserver = null;
    this.loadingImages = new Set();
    this.loadedImages = new Set();
    this.failedImages = new Set();
    
    this.init();
  }

  /**
   * Initialize the image optimizer
   */
  async init() {
    await this.detectFormatSupport();
    this.setupIntersectionObserver();
    this.processExistingImages();
    this.setupEventListeners();
    
    // Only log in development
    if (window.location.hostname === 'localhost') {
      console.log('Image Optimizer initialized', {
        webpSupport: this.options.webpSupport,
        avifSupport: this.options.avifSupport
      });
    }
  }

  /**
   * Detect WebP and AVIF support
   */
  async detectFormatSupport() {
    // Detect WebP support
    this.options.webpSupport = await this.checkFormatSupport('webp');
    
    // Detect AVIF support
    this.options.avifSupport = await this.checkFormatSupport('avif');
  }

  /**
   * Check if a specific image format is supported
   */
  checkFormatSupport(format) {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => resolve(img.width === 1 && img.height === 1);
      img.onerror = () => resolve(false);
      
      // Test images (1x1 pixel)
      const testImages = {
        webp: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
        avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
      };
      
      img.src = testImages[format];
    });
  }

  /**
   * Setup Intersection Observer for lazy loading
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, falling back to immediate loading');
      this.loadAllImages();
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.intersectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );
  }

  /**
   * Process existing images on the page
   */
  processExistingImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    images.forEach(img => this.setupLazyImage(img));
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Handle dynamically added images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const images = node.querySelectorAll ? 
              node.querySelectorAll('img[data-src], img[data-srcset]') : 
              (node.tagName === 'IMG' && (node.dataset.src || node.dataset.srcset) ? [node] : []);
            
            images.forEach(img => this.setupLazyImage(img));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.retryFailedImages();
      }
    });

    // Handle network status changes
    window.addEventListener('online', () => {
      this.retryFailedImages();
    });
  }

  /**
   * Setup lazy loading for an image
   */
  setupLazyImage(img) {
    if (img.dataset.optimized) return;
    
    // Mark as processed
    img.dataset.optimized = 'true';
    
    // Add loading class
    img.classList.add('lazy-loading');
    
    // Set up placeholder if not present
    if (!img.src && !img.dataset.placeholder) {
      img.src = this.generatePlaceholder(img);
    }
    
    // Optimize image sources
    this.optimizeImageSources(img);
    
    // Start observing for lazy loading
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(img);
    } else {
      // Fallback: load immediately
      this.loadImage(img);
    }
  }

  /**
   * Generate a placeholder for the image
   */
  generatePlaceholder(img) {
    const width = img.dataset.width || img.width || 400;
    const height = img.dataset.height || img.height || 300;
    
    // Create a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Optimize image sources based on format support
   */
  optimizeImageSources(img) {
    const originalSrc = img.dataset.src || img.src;
    const originalSrcset = img.dataset.srcset;
    
    if (!originalSrc) return;
    
    // Generate optimized sources
    const optimizedSources = this.generateOptimizedSources(originalSrc);
    
    // Create picture element if modern formats are supported
    if ((this.options.avifSupport || this.options.webpSupport) && !img.parentElement.tagName === 'PICTURE') {
      this.wrapWithPicture(img, optimizedSources);
    } else {
      // Update img element directly
      img.dataset.src = optimizedSources.fallback;
      if (originalSrcset) {
        img.dataset.srcset = this.optimizeSrcset(originalSrcset);
      }
    }
  }

  /**
   * Generate optimized image sources
   */
  generateOptimizedSources(originalSrc) {
    const sources = {
      avif: null,
      webp: null,
      fallback: originalSrc
    };
    
    // Generate AVIF source if supported
    if (this.options.avifSupport) {
      sources.avif = this.convertImageFormat(originalSrc, 'avif');
    }
    
    // Generate WebP source if supported
    if (this.options.webpSupport) {
      sources.webp = this.convertImageFormat(originalSrc, 'webp');
    }
    
    return sources;
  }

  /**
   * Convert image to different format (URL manipulation)
   */
  convertImageFormat(src, format) {
    // This is a simplified example - in a real implementation,
    // you might use a CDN service or server-side conversion
    
    // Check if it's already in the target format
    if (src.includes(`.${format}`)) {
      return src;
    }
    
    // Simple format conversion for common patterns
    const extensions = /\.(jpg|jpeg|png|gif)(\?.*)?$/i;
    if (extensions.test(src)) {
      return src.replace(extensions, `.${format}$2`);
    }
    
    return src;
  }

  /**
   * Wrap image with picture element for format optimization
   */
  wrapWithPicture(img, sources) {
    const picture = document.createElement('picture');
    
    // Add AVIF source
    if (sources.avif) {
      const avifSource = document.createElement('source');
      avifSource.type = 'image/avif';
      avifSource.dataset.srcset = sources.avif;
      picture.appendChild(avifSource);
    }
    
    // Add WebP source
    if (sources.webp) {
      const webpSource = document.createElement('source');
      webpSource.type = 'image/webp';
      webpSource.dataset.srcset = sources.webp;
      picture.appendChild(webpSource);
    }
    
    // Insert picture element
    img.parentNode.insertBefore(picture, img);
    picture.appendChild(img);
    
    // Update img as fallback
    img.dataset.src = sources.fallback;
  }

  /**
   * Optimize srcset attribute
   */
  optimizeSrcset(srcset) {
    return srcset.split(',').map(src => {
      const [url, descriptor] = src.trim().split(' ');
      const optimizedUrl = this.options.webpSupport ? 
        this.convertImageFormat(url, 'webp') : url;
      return descriptor ? `${optimizedUrl} ${descriptor}` : optimizedUrl;
    }).join(', ');
  }

  /**
   * Load an image with progressive enhancement
   */
  async loadImage(img) {
    if (this.loadingImages.has(img) || this.loadedImages.has(img)) {
      return;
    }
    
    this.loadingImages.add(img);
    
    try {
      await this.loadImageWithRetry(img);
      this.onImageLoaded(img);
    } catch (error) {
      this.onImageError(img, error);
    } finally {
      this.loadingImages.delete(img);
    }
  }

  /**
   * Load image with retry logic
   */
  async loadImageWithRetry(img, attempt = 1) {
    return new Promise((resolve, reject) => {
      const newImg = new Image();
      
      // Handle successful load
      newImg.onload = () => {
        // Update the original image
        this.updateImageSrc(img, newImg);
        resolve();
      };
      
      // Handle load error
      newImg.onerror = () => {
        if (attempt < this.options.retryAttempts) {
          // Retry after delay
          setTimeout(() => {
            this.loadImageWithRetry(img, attempt + 1)
              .then(resolve)
              .catch(reject);
          }, this.options.retryDelay * attempt);
        } else {
          reject(new Error(`Failed to load image after ${attempt} attempts`));
        }
      };
      
      // Start loading
      const src = img.dataset.src || img.src;
      if (src) {
        newImg.src = src;
        
        // Handle srcset if present
        const srcset = img.dataset.srcset;
        if (srcset) {
          newImg.srcset = srcset;
        }
      } else {
        reject(new Error('No image source found'));
      }
    });
  }

  /**
   * Update image source after successful load
   */
  updateImageSrc(img, loadedImg) {
    // Update src and srcset
    img.src = loadedImg.src;
    if (loadedImg.srcset) {
      img.srcset = loadedImg.srcset;
    }
    
    // Remove data attributes
    delete img.dataset.src;
    delete img.dataset.srcset;
    
    // Update sizes if not set
    if (!img.sizes && img.srcset) {
      img.sizes = this.generateSizes(img);
    }
  }

  /**
   * Generate sizes attribute based on image context
   */
  generateSizes(img) {
    // Default responsive sizes
    const defaultSizes = [
      '(max-width: 320px) 280px',
      '(max-width: 640px) 600px',
      '(max-width: 768px) 720px',
      '(max-width: 1024px) 960px',
      '(max-width: 1200px) 1140px',
      '100vw'
    ];
    
    return defaultSizes.join(', ');
  }

  /**
   * Handle successful image load
   */
  onImageLoaded(img) {
    this.loadedImages.add(img);
    
    // Remove loading class and add loaded class
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
    
    // Add fade-in animation
    img.style.opacity = '0';
    img.style.transition = `opacity ${this.options.fadeInDuration}ms ease-in-out`;
    
    // Trigger fade-in
    requestAnimationFrame(() => {
      img.style.opacity = '1';
    });
    
    // Dispatch custom event
    img.dispatchEvent(new CustomEvent('imageLoaded', {
      detail: { src: img.src }
    }));
    
    // Only log in development
    if (window.location.hostname === 'localhost') {
      console.log('Image loaded successfully:', img.src);
    }
  }

  /**
   * Handle image load error
   */
  onImageError(img, error) {
    this.failedImages.add(img);
    
    // Add error class
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-error');
    
    // Set fallback image or placeholder
    if (!img.src.includes('data:image/svg+xml')) {
      img.src = this.generateErrorPlaceholder(img);
    }
    
    // Dispatch custom event
    img.dispatchEvent(new CustomEvent('imageError', {
      detail: { error: error.message }
    }));
    
    console.warn('Image failed to load:', img.dataset.src || img.src, error);
  }

  /**
   * Generate error placeholder
   */
  generateErrorPlaceholder(img) {
    const width = img.dataset.width || img.width || 400;
    const height = img.dataset.height || img.height || 300;
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" font-family="Arial, sans-serif" font-size="14">
          图片加载失败
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Retry loading failed images
   */
  retryFailedImages() {
    const failedImages = Array.from(this.failedImages);
    this.failedImages.clear();
    
    failedImages.forEach(img => {
      img.classList.remove('lazy-error');
      this.loadImage(img);
    });
    
    if (failedImages.length > 0 && window.location.hostname === 'localhost') {
      console.log(`Retrying ${failedImages.length} failed images`);
    }
  }

  /**
   * Load all images immediately (fallback)
   */
  loadAllImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    images.forEach(img => this.loadImage(img));
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      
      // Add format-specific preloading
      if (this.options.avifSupport && !url.includes('.avif')) {
        link.href = this.convertImageFormat(url, 'avif');
      } else if (this.options.webpSupport && !url.includes('.webp')) {
        link.href = this.convertImageFormat(url, 'webp');
      }
      
      document.head.appendChild(link);
    });
  }

  /**
   * Get optimization metrics
   */
  getMetrics() {
    return {
      totalImages: this.loadedImages.size + this.loadingImages.size + this.failedImages.size,
      loadedImages: this.loadedImages.size,
      loadingImages: this.loadingImages.size,
      failedImages: this.failedImages.size,
      webpSupport: this.options.webpSupport,
      avifSupport: this.options.avifSupport
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}

// Auto-initialize if not in test environment
if (typeof module === 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.imageOptimizer = new ImageOptimizer();
    });
  } else {
    window.imageOptimizer = new ImageOptimizer();
  }
}

// Export for module usage
window.ImageOptimizer = ImageOptimizer;