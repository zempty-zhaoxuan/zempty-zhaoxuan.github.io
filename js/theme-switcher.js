// 处理主题切换功能
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // 如果主题切换按钮不存在，直接返回
  if (!themeToggle) {
    console.warn('Theme toggle button not found');
    return;
  }
  
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 检查本地存储中的主题偏好
  let currentTheme;
  try {
    currentTheme = localStorage.getItem('theme');
  } catch (e) {
    console.warn('Cannot access localStorage:', e);
    currentTheme = null;
  }
  
  // 如果用户之前选择了主题
  if (currentTheme) {
    document.body.classList.add(currentTheme);
  } else if (prefersDarkScheme.matches) {
    // 如果用户的系统偏好是深色模式
    document.body.classList.add('dark-theme');
    try {
      localStorage.setItem('theme', 'dark-theme');
    } catch (e) {
      console.warn('Cannot save theme to localStorage:', e);
    }
  }
  
  // 更新tooltip文本的函数
  function updateTooltip() {
    if (document.body.classList.contains('dark-theme')) {
      themeToggle.setAttribute('title', '切换为浅色主题');
      themeToggle.setAttribute('aria-label', '切换为浅色主题');
    } else {
      themeToggle.setAttribute('title', '切换为深色主题');
      themeToggle.setAttribute('aria-label', '切换为深色主题');
    }
  }
  
  // 根据当前主题设置正确的图标和tooltip
  function setInitialIconAndTooltip() {
    if (document.body.classList.contains('dark-theme')) {
      themeToggle.innerHTML = '☀️'; // In dark mode, show sun to switch to light
    } else {
      themeToggle.innerHTML = '🌙'; // In light mode, show moon to switch to dark
    }
    updateTooltip();
  }
  
  // 初始更新UI
  setInitialIconAndTooltip();
  
  // 当点击切换按钮时
  themeToggle.addEventListener('click', function() {
    try {
      // 如果当前是深色模式
      if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        try {
          localStorage.setItem('theme', 'light-theme');
        } catch (e) {
          console.warn('Cannot save theme to localStorage:', e);
        }
        themeToggle.innerHTML = '🌙'; // 显示月亮图标表示可以切换到深色模式
      } else {
        // 如果当前是浅色模式或没有设置
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        try {
          localStorage.setItem('theme', 'dark-theme');
        } catch (e) {
          console.warn('Cannot save theme to localStorage:', e);
        }
        themeToggle.innerHTML = '☀️'; // 显示太阳图标表示可以切换到浅色模式
      }
    } catch (error) {
      console.error('Error switching theme:', error);
      return;
    }
    
    // 更新tooltip文本
    updateTooltip();
    
    // 触发自定义主题切换事件，供其他组件使用
    try {
      const themeEvent = new CustomEvent('themeChanged', {
        detail: { theme: document.body.classList.contains('dark-theme') ? 'dark' : 'light' }
      });
      document.dispatchEvent(themeEvent);
    } catch (e) {
      console.warn('Cannot dispatch theme change event:', e);
    }
  });
}); 