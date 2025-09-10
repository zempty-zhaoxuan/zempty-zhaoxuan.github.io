// 安全工具函数库
// Security Utilities Library

(function(window) {
  'use strict';

  const SecurityUtils = {
    
    /**
     * HTML转义函数，防止XSS攻击
     * @param {string} text - 需要转义的文本
     * @returns {string} - 转义后的安全文本
     */
    escapeHtml: function(text) {
      if (typeof text !== 'string') return '';
      
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;'
      };
      
      return text.replace(/[&<>"'\/]/g, function(s) {
        return map[s];
      });
    },

    /**
     * 正则表达式转义函数
     * @param {string} string - 需要转义的字符串
     * @returns {string} - 转义后的正则表达式安全字符串
     */
    escapeRegExp: function(string) {
      if (typeof string !== 'string') return '';
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * URL验证和清理函数
     * @param {string} url - 需要验证的URL
     * @returns {string} - 安全的URL或默认值
     */
    sanitizeUrl: function(url) {
      if (!url || typeof url !== 'string') return '#';
      
      // 移除危险的协议
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
      const lowerUrl = url.toLowerCase().trim();
      
      for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
          return '#';
        }
      }
      
      // 只允许相对路径和安全的绝对路径
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return url;
      }
      
      if (url.match(/^https?:\/\//)) {
        try {
          const urlObj = new URL(url);
          return urlObj.href;
        } catch (e) {
          return '#';
        }
      }
      
      return '#';
    },

    /**
     * 输入验证函数
     * @param {string} input - 用户输入
     * @param {number} maxLength - 最大长度
     * @returns {boolean} - 是否有效
     */
    validateInput: function(input, maxLength = 100) {
      if (typeof input !== 'string') return false;
      if (input.length === 0 || input.length > maxLength) return false;
      
      // 检查是否包含危险字符
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
      ];
      
      return !dangerousPatterns.some(pattern => pattern.test(input));
    },

    /**
     * 安全的DOM元素创建函数
     * @param {string} tagName - 标签名
     * @param {Object} attributes - 属性对象
     * @param {string} textContent - 文本内容
     * @returns {Element} - 创建的DOM元素
     */
    createElement: function(tagName, attributes = {}, textContent = '') {
      const element = document.createElement(tagName);
      
      // 安全地设置属性
      for (const [key, value] of Object.entries(attributes)) {
        if (key === 'href') {
          element.setAttribute(key, this.sanitizeUrl(value));
        } else if (key.startsWith('on')) {
          // 禁止设置事件处理器属性
          console.warn('Event handler attributes are not allowed:', key);
        } else {
          element.setAttribute(key, this.escapeHtml(String(value)));
        }
      }
      
      // 安全地设置文本内容
      if (textContent) {
        element.textContent = textContent;
      }
      
      return element;
    },

    /**
     * 安全的localStorage操作
     * @param {string} key - 键名
     * @param {*} value - 值（可选，如果不提供则为获取操作）
     * @returns {*} - 获取的值或操作结果
     */
    safeLocalStorage: function(key, value) {
      try {
        if (value !== undefined) {
          // 设置操作
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } else {
          // 获取操作
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        }
      } catch (e) {
        console.warn('localStorage operation failed:', e);
        return value !== undefined ? false : null;
      }
    },

    /**
     * 防抖函数
     * @param {Function} func - 需要防抖的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} - 防抖后的函数
     */
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * 节流函数
     * @param {Function} func - 需要节流的函数
     * @param {number} limit - 限制时间（毫秒）
     * @returns {Function} - 节流后的函数
     */
    throttle: function(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    /**
     * 安全的事件监听器添加
     * @param {Element} element - DOM元素
     * @param {string} event - 事件类型
     * @param {Function} handler - 事件处理函数
     * @param {Object} options - 选项
     */
    addEventListenerSafe: function(element, event, handler, options = {}) {
      if (!element || typeof handler !== 'function') {
        console.warn('Invalid element or handler for event listener');
        return;
      }
      
      try {
        element.addEventListener(event, handler, {
          passive: true,
          ...options
        });
      } catch (e) {
        console.warn('Failed to add event listener:', e);
      }
    }
  };

  // 将SecurityUtils暴露到全局作用域
  window.SecurityUtils = SecurityUtils;

})(window);