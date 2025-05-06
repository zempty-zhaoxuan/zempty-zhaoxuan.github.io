// 处理主题切换功能
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 检查本地存储中的主题偏好
  const currentTheme = localStorage.getItem('theme');
  
  // 如果用户之前选择了主题
  if (currentTheme) {
    document.body.classList.add(currentTheme);
  } else if (prefersDarkScheme.matches) {
    // 如果用户的系统偏好是深色模式
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark-theme');
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
  
  // 初始更新tooltip
  updateTooltip();
  
  // 当点击切换按钮时
  themeToggle.addEventListener('click', function() {
    // 如果当前是深色模式
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.replace('dark-theme', 'light-theme');
      localStorage.setItem('theme', 'light-theme');
      themeToggle.innerHTML = '🌙'; // 显示月亮图标表示可以切换到深色模式
    } else {
      // 如果当前是浅色模式或没有设置
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
      themeToggle.innerHTML = '☀️'; // 显示太阳图标表示可以切换到浅色模式
    }
    
    // 更新tooltip文本
    updateTooltip();
  });
  
  // 根据当前主题设置正确的图标
  if (document.body.classList.contains('dark-theme')) {
    themeToggle.innerHTML = '☀️';
  } else {
    themeToggle.innerHTML = '🌙';
  }
}); 