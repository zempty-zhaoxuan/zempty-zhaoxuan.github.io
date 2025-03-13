document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.wrapper-sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  
  // 检查是否有保存的侧边栏状态 - 同时支持新旧两种键名
  const isSidebarCollapsed = 
    localStorage.getItem('sidebarCollapsed') === 'true' || 
    localStorage.getItem('isSidebarCollapsed') === 'true';
  
  // 在页面加载时应用保存的状态
  if (isSidebarCollapsed) {
    sidebar.classList.add('collapsed');
    sidebarToggle.textContent = '≫';
    sidebarToggle.title = '展开侧边栏';
    
    // 立即调整内容区域以适应折叠后的侧边栏，避免重绘延迟
    requestAnimationFrame(() => {
      updateContentAreaForCollapsedSidebar();
    });
  }
  
  // 切换侧边栏状态
  sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    
    // 更新折叠状态并保存到本地存储 - 统一使用 sidebarCollapsed 作为键名
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    
    // 更新按钮外观
    if (isCollapsed) {
      sidebarToggle.textContent = '≫';
      sidebarToggle.title = '展开侧边栏';
    } else {
      sidebarToggle.textContent = '≡';
      sidebarToggle.title = '折叠侧边栏';
    }
    
    // 使用 requestAnimationFrame 优化性能，减少重绘和回流
    requestAnimationFrame(() => {
      updateContentAreaForCollapsedSidebar();
    });
    
    // 如果有布局修复函数，调用它，但使用节流函数避免频繁调用
    if (typeof window.fixPageLayout === 'function') {
      // 使用 requestAnimationFrame 代替 setTimeout 提高性能
      requestAnimationFrame(window.fixPageLayout);
    }
  });
  
  // 调整内容区域以适应折叠后的侧边栏
  function updateContentAreaForCollapsedSidebar() {
    const content = document.querySelector('.wrapper-content');
    if (!content) return;
    
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    if (isCollapsed) {
      // 获取折叠后侧边栏的宽度
      const collapsedWidth = parseInt(getComputedStyle(sidebar).width);
      
      // 直接调整内容区域，避免多次重绘
      content.style.width = `calc(100% - ${collapsedWidth}px)`;
      content.style.marginLeft = `${collapsedWidth}px`;
      
      // 优化容器宽度设置，减少CSS计算复杂度
      const container = content.querySelector('.container');
      if (container) {
        // 预先定义一个固定宽度值，减少计算复杂度
        if (window.innerWidth >= 1200) {
          container.style.maxWidth = '90%';
          container.style.marginLeft = '16px';
        } else {
          container.style.maxWidth = '90%';
          container.style.marginLeft = '8px';
        }
        container.style.marginRight = 'auto';
      }
      
      // 处理文章内容元素，使其能够填充可用空间
      const main = document.getElementById('main');
      if (main) {
        // 如果有目录，确保目录不占用太多空间
        if (main.classList.contains('withtoc')) {
          const toc = document.querySelector('.toc');
          if (toc) {
            // 固定目录宽度，避免过多计算
            const tocWidth = Math.min(300, Math.max(200, window.innerWidth * 0.2));
            toc.style.width = `${tocWidth}px`;
            main.style.paddingRight = `${tocWidth}px`;
          }
        }
        
        // 移除可能的最大宽度限制
        const contentElement = main.querySelector('.post');
        if (contentElement) {
          contentElement.style.maxWidth = 'none';
        }
      }
    } else {
      // 恢复正常布局，让layout-fixes.js处理详细调整
      if (typeof window.fixPageLayout === 'function') {
        requestAnimationFrame(window.fixPageLayout);
      }
    }
  }
  
  // 添加窗口大小调整监听，但使用节流函数避免频繁调用
  let resizeTimeout;
  window.addEventListener('resize', function() {
    // 清除之前的超时，避免重复调用
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    
    // 使用节流函数，仅在调整大小结束后执行一次
    resizeTimeout = setTimeout(function() {
      requestAnimationFrame(updateContentAreaForCollapsedSidebar);
    }, 100); // 100ms 的节流时间
  });
}); 