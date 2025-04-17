document.addEventListener('DOMContentLoaded', function() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
  const wrapper = document.querySelector('.wrapper-content');
  const sidebar = document.querySelector('.wrapper-sidebar');
  const themeToggle = document.getElementById('theme-toggle');
  const homeButton = document.getElementById('home-button');
  const currentState = localStorage.getItem('sidebar-state');
  const mobileSidebarState = localStorage.getItem('mobile-sidebar-state');
  
  // 桌面版侧边栏状态应用
  if (currentState === 'collapsed') {
    wrapper.classList.add('sidebar-collapsed');
    sidebar.classList.add('collapsed');
    sidebarToggle.innerHTML = '≡';
    sidebarToggle.setAttribute('title', '展开侧边栏');
  } else {
    sidebarToggle.innerHTML = '«';
    sidebarToggle.setAttribute('title', '折叠侧边栏');
  }
  
  // 移动版侧边栏状态应用
  if (mobileSidebarState === 'collapsed') {
    sidebar.classList.add('mobile-collapsed');
    document.body.classList.add('mobile-sidebar-collapsed');
    mobileSidebarToggle.innerHTML = '▼';
    mobileSidebarToggle.setAttribute('title', '展开侧边栏');
  } else {
    mobileSidebarToggle.innerHTML = '▲';
    mobileSidebarToggle.setAttribute('title', '折叠侧边栏');
  }
  
  // 桌面版切换侧边栏状态
  sidebarToggle.addEventListener('click', function() {
    wrapper.classList.toggle('sidebar-collapsed');
    sidebar.classList.toggle('collapsed');
    
    if (wrapper.classList.contains('sidebar-collapsed')) {
      localStorage.setItem('sidebar-state', 'collapsed');
      sidebarToggle.setAttribute('title', '展开侧边栏');
      sidebarToggle.innerHTML = '≡';
    } else {
      localStorage.setItem('sidebar-state', 'expanded');
      sidebarToggle.setAttribute('title', '折叠侧边栏');
      sidebarToggle.innerHTML = '«';
    }
  });
  
  // 移动版切换侧边栏状态
  mobileSidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('mobile-collapsed');
    document.body.classList.toggle('mobile-sidebar-collapsed');
    
    if (sidebar.classList.contains('mobile-collapsed')) {
      localStorage.setItem('mobile-sidebar-state', 'collapsed');
      mobileSidebarToggle.innerHTML = '▼';
      mobileSidebarToggle.setAttribute('title', '展开侧边栏');
    } else {
      localStorage.setItem('mobile-sidebar-state', 'expanded');
      mobileSidebarToggle.innerHTML = '▲';
      mobileSidebarToggle.setAttribute('title', '折叠侧边栏');
    }
  });
  
  // 设置返回首页按钮的提示文字
  homeButton.setAttribute('title', '返回首页');
  
  // 主题变化监听，同步更新按钮样式
  const updateButtonsByTheme = function() {
    // 复用主题切换按钮的样式逻辑
    if (document.body.classList.contains('dark-theme')) {
      // 深色主题
      sidebarToggle.classList.add('dark-theme');
      mobileSidebarToggle.classList.add('dark-theme');
      homeButton.classList.add('dark-theme');
    } else {
      // 浅色主题
      sidebarToggle.classList.remove('dark-theme');
      mobileSidebarToggle.classList.remove('dark-theme');
      homeButton.classList.remove('dark-theme');
    }
  };
  
  // 初始运行一次以设置初始状态
  updateButtonsByTheme();
  
  // 监听主题切换事件
  themeToggle.addEventListener('click', function() {
    // 主题切换后稍微延迟更新按钮样式
    setTimeout(updateButtonsByTheme, 50);
  });
  
  // 响应式处理
  const handleResize = function() {
    if (window.innerWidth <= 768) {
      // 移动设备上使用垂直折叠功能
      wrapper.classList.remove('sidebar-collapsed');
      sidebar.classList.remove('collapsed');
      sidebarToggle.style.display = 'none';
      mobileSidebarToggle.style.display = 'flex';
    } else {
      // 桌面设备上使用水平折叠功能
      sidebar.classList.remove('mobile-collapsed');
      document.body.classList.remove('mobile-sidebar-collapsed');
      sidebarToggle.style.display = 'block';
      mobileSidebarToggle.style.display = 'none';
    }
  };
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
  
  // 初始化时运行一次
  handleResize();
}); 