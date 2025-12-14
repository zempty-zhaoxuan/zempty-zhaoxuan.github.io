/**
 * Service Worker Registration and Management
 * Handles service worker lifecycle and provides offline functionality
 */

class ServiceWorkerManager {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    
    this.init();
  }

  /**
   * Initialize service worker registration
   */
  async init() {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser');
      return;
    }

    // Development: disable service worker on localhost to avoid stale cached JS/CSS
    // (Local dev needs immediate feedback when tweaking UI behaviors like sidebar buttons)
    if (this.isLocalhost()) {
      await this.disableForLocalhost();
      return;
    }

    try {
      await this.registerServiceWorker();
      this.setupEventListeners();
      this.checkForUpdates();
    } catch (error) {
      console.error('Service worker initialization failed:', error);
    }
  }

  /**
   * Register the service worker
   */
  async registerServiceWorker() {
    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Only log in development
      if (window.location.hostname === 'localhost') {
        console.log('Service Worker registered successfully:', this.swRegistration);
      }

      // Handle different registration states
      if (this.swRegistration.installing) {
        if (window.location.hostname === 'localhost') {
          console.log('Service Worker installing...');
        }
        this.trackInstallProgress(this.swRegistration.installing);
      } else if (this.swRegistration.waiting) {
        if (window.location.hostname === 'localhost') {
          console.log('Service Worker waiting...');
        }
        this.showUpdateAvailable();
      } else if (this.swRegistration.active) {
        if (window.location.hostname === 'localhost') {
          console.log('Service Worker active');
        }
      }

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        if (window.location.hostname === 'localhost') {
          console.log('Service Worker update found');
        }
        this.trackInstallProgress(this.swRegistration.installing);
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Detect local dev environment (localhost / 127.0.0.1)
   */
  isLocalhost() {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  }

  /**
   * Unregister any existing SW + clear caches on localhost, then skip registration.
   */
  async disableForLocalhost() {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }

      console.log('Service Worker disabled for localhost (unregistered + caches cleared).');
    } catch (e) {
      console.warn('Failed to fully disable Service Worker on localhost:', e);
    }
  }

  /**
   * Track service worker installation progress
   */
  trackInstallProgress(worker) {
    worker.addEventListener('statechange', () => {
      if (window.location.hostname === 'localhost') {
        console.log('Service Worker state changed:', worker.state);
      }
      
      switch (worker.state) {
        case 'installed':
          if (navigator.serviceWorker.controller) {
            // New service worker installed, update available
            this.showUpdateAvailable();
          } else {
            // First time installation
            this.showInstallSuccess();
          }
          break;
        case 'activated':
          if (window.location.hostname === 'localhost') {
            console.log('Service Worker activated');
          }
          break;
        case 'redundant':
          if (window.location.hostname === 'localhost') {
            console.log('Service Worker redundant');
          }
          break;
      }
    });
  }

  /**
   * Setup event listeners for online/offline and service worker messages
   */
  setupEventListeners() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOnlineStatusChange(false);
    });

    // Service worker messages
    navigator.serviceWorker.addEventListener('message', event => {
      this.handleServiceWorkerMessage(event.data);
    });

    // Handle page visibility changes for cache updates
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  /**
   * Handle online/offline status changes
   */
  handleOnlineStatusChange(isOnline) {
    if (window.location.hostname === 'localhost') {
      console.log('Network status changed:', isOnline ? 'online' : 'offline');
    }
    
    // Show/hide offline indicator
    this.toggleOfflineIndicator(!isOnline);
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('networkStatusChange', {
      detail: { isOnline }
    }));

    // If back online, check for updates
    if (isOnline) {
      setTimeout(() => this.checkForUpdates(), 1000);
    }
  }

  /**
   * Show/hide offline indicator
   */
  toggleOfflineIndicator(show) {
    let indicator = document.getElementById('offline-indicator');
    
    if (show && !indicator) {
      // Create offline indicator
      indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.innerHTML = `
        <div class="offline-message">
          <span class="offline-icon">📱</span>
          <span class="offline-text">您当前处于离线状态</span>
        </div>
      `;
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff6b6b;
        color: white;
        text-align: center;
        padding: 10px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        animation: slideDown 0.3s ease-out;
      `;
      
      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }
        .offline-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(indicator);
      
    } else if (!show && indicator) {
      // Remove offline indicator with animation
      indicator.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }
  }

  /**
   * Show update available notification
   */
  showUpdateAvailable() {
    this.updateAvailable = true;
    
    // Only show update notification if there's actually an update available
    // and not on first visit to avoid interfering with reading experience
    if (navigator.serviceWorker.controller) {
      // Create update notification
      const notification = document.createElement('div');
      notification.id = 'update-notification';
      notification.innerHTML = `
        <div class="update-message">
          <span class="update-icon">🔄</span>
          <span class="update-text">网站有新版本可用</span>
          <button class="update-btn" onclick="window.swManager.applyUpdate()">更新</button>
          <button class="dismiss-btn" onclick="this.parentNode.parentNode.remove()">稍后</button>
        </div>
      `;
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #007bff;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      `;
      
      // Add animation and button styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .update-message {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .update-btn, .dismiss-btn {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .update-btn:hover, .dismiss-btn:hover {
          background: rgba(255,255,255,0.3);
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(notification);
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 10000);
    }
  }

  /**
   * Show installation success message
   */
  showInstallSuccess() {
    // Only log in development, don't show notification to avoid interfering with reading
    if (window.location.hostname === 'localhost') {
      console.log('Service Worker installed successfully - offline functionality enabled');
      
      // Show subtle notification only in development
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>✅</span>
          <span>离线功能已启用</span>
        </div>
      `;
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      `;
      
      document.body.appendChild(notification);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 3000);
    }
  }

  /**
   * Apply service worker update
   */
  async applyUpdate() {
    if (!this.swRegistration || !this.swRegistration.waiting) {
      console.warn('No service worker update available');
      return;
    }

    try {
      // Tell the waiting service worker to skip waiting
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    } catch (error) {
      console.error('Failed to apply service worker update:', error);
    }
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates() {
    if (!this.swRegistration) return;

    try {
      await this.swRegistration.update();
    } catch (error) {
      console.warn('Service worker update check failed:', error);
    }
  }

  /**
   * Handle messages from service worker
   */
  handleServiceWorkerMessage(data) {
    if (window.location.hostname === 'localhost') {
      console.log('Message from service worker:', data);
      
      switch (data.type) {
        case 'CACHE_UPDATED':
          console.log('Cache updated:', data.payload);
          break;
        case 'OFFLINE_READY':
          console.log('Offline functionality ready');
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    }
  }

  /**
   * Get service worker status
   */
  getStatus() {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.swRegistration,
      active: !!(this.swRegistration && this.swRegistration.active),
      updateAvailable: this.updateAvailable,
      isOnline: this.isOnline
    };
  }

  /**
   * Unregister service worker (for debugging)
   */
  async unregister() {
    if (!this.swRegistration) return false;

    try {
      const result = await this.swRegistration.unregister();
      console.log('Service worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Failed to unregister service worker:', error);
      return false;
    }
  }
}

// Initialize service worker manager
window.swManager = new ServiceWorkerManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServiceWorkerManager;
}