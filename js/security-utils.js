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
      if (!text || typeof text !== 'string') return '';
      
      return text.replace(/[&<>"'\/]/g, function(s) {
        return SecurityUtils._HTML_ESCAPE_MAP[s];
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
      
      const lowerUrl = url.toLowerCase().trim();
      
      for (const protocol of SecurityUtils._DANGEROUS_PROTOCOLS) {
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
     * @returns {Object} - 验证结果和清理后的输入
     */
    validateInput: function(input, maxLength = 1000) {
      if (!input || typeof input !== 'string') {
        return { isValid: true, sanitized: '' };
      }
      
      if (input.length > maxLength) {
        return { isValid: false, sanitized: input.substring(0, maxLength) };
      }
      
      const isValid = !SecurityUtils._DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
      const sanitized = this.escapeHtml(input);
      
      return { isValid, sanitized };
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
        const passiveEvents = ['scroll', 'wheel', 'touchstart', 'touchmove'];
        element.addEventListener(event, handler, {
          passive: passiveEvents.includes(event),
          ...options
        });
      } catch (e) {
        console.warn('Failed to add event listener:', e);
      }
    },

    /**
     * 安全的innerHTML设置
     * @param {Element} element - DOM元素
     * @param {string} content - HTML内容
     */
    setInnerHTMLSafe: function(element, content) {
      if (!element) return;
      if (!content) {
        element.textContent = '';
        return;
      }
      
      // 完全避免innerHTML，使用textContent
      element.textContent = content;
    },
    
    /**
     * 安全的HTML内容设置（仅允许特定标签）
     * @param {Element} element - DOM元素
     * @param {string} content - HTML内容
     * @param {Array} allowedTags - 允许的标签列表
     */
    setHTMLContentSafe: function(element, content, allowedTags = ['strong', 'em', 'span']) {
      if (!element || !content) {
        if (element) element.textContent = '';
        return;
      }
      
      // 使用安全的方式创建内容
      const temp = document.createElement('div');
      temp.textContent = content; // 使用textContent而不是innerHTML
      
      // 只保留允许的标签
      const walker = document.createTreeWalker(
        temp,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: function(node) {
            return allowedTags.includes(node.tagName.toLowerCase()) ?
              NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        }
      );
      
      // 移除不允许的元素
      const nodesToRemove = [];
      let node;
      while (node = walker.nextNode()) {
        if (!allowedTags.includes(node.tagName.toLowerCase())) {
          nodesToRemove.push(node);
        }
      }
      
      nodesToRemove.forEach(node => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });
      
      // 只允许特定标签的安全内容
      element.textContent = temp.textContent;
    }
  };

  // 静态常量
  SecurityUtils._HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };

  SecurityUtils._DANGEROUS_PROTOCOLS = [
    'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'
  ];

  SecurityUtils._DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /<input/gi,
    /<textarea/gi,
    /<select/gi,
    /<button/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
    /Function\s*\(/gi,
    /new\s+Function/gi
  ];

  // 将SecurityUtils暴露到全局作用域
  window.SecurityUtils = SecurityUtils;

})(window);