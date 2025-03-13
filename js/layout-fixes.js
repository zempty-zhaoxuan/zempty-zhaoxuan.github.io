// 页面布局修复脚本
document.addEventListener('DOMContentLoaded', function() {
  // 选择页面主要元素
  const sidebar = document.querySelector('.wrapper-sidebar');
  const content = document.querySelector('.wrapper-content');
  const toc = document.querySelector('.toc');
  const main = document.getElementById('main');
  
  // 保存原始状态，避免重复计算
  let lastWindowWidth = window.innerWidth;
  let lastSidebarState = sidebar ? sidebar.classList.contains('collapsed') : false;
  
  // 修复可能的布局问题
  function fixLayout() {
    // 检查侧边栏是否存在
    if (!sidebar) return;
    
    // 获取当前窗口宽度和侧边栏状态
    const currentWindowWidth = window.innerWidth;
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    // 只有当窗口宽度变化超过一定阈值或侧边栏状态改变时才重新计算
    const widthChanged = Math.abs(currentWindowWidth - lastWindowWidth) > 5;
    const stateChanged = isCollapsed !== lastSidebarState;
    
    if (!widthChanged && !stateChanged) {
      return; // 避免不必要的计算
    }
    
    // 更新保存的状态
    lastWindowWidth = currentWindowWidth;
    lastSidebarState = isCollapsed;
    
    // 处理侧边栏折叠状态
    if (isCollapsed) {
      // 侧边栏已折叠，调整内容区域
      const collapsedSidebarWidth = parseInt(getComputedStyle(sidebar).width) || 60; // 获取折叠后的宽度，默认约60px
      
      // 调整内容区域以适应折叠后的侧边栏
      if (content) {
        // 直接设置样式，避免多次计算和重绘
        content.style.width = `calc(100% - ${collapsedSidebarWidth}px)`;
        content.style.marginLeft = `${collapsedSidebarWidth}px`;
        
        // 确保侧边栏不会遮挡内容
        content.style.zIndex = '1';
        sidebar.style.zIndex = '2';
      }
    } else {
      // 侧边栏未折叠，处理常规布局
      const sidebarWidth = parseInt(getComputedStyle(sidebar).width);
      
      // 确保侧边栏宽度合理并设置内容区域的宽度
      if (content) {
        content.style.width = `calc(100% - ${sidebarWidth}px)`;
        content.style.marginLeft = `${sidebarWidth}px`;
        
        // 确保侧边栏不会遮挡内容
        content.style.zIndex = '1';
        sidebar.style.zIndex = '2';
      }
      
      // 确保侧边栏显示正确
      if (currentWindowWidth > 768) {
        sidebar.style.position = 'fixed';
        sidebar.style.height = '100%';
      } else {
        sidebar.style.position = 'relative';
        sidebar.style.height = 'auto';
      }
    }
    
    // 修复TOC宽度问题
    if (toc) {
      // 使用固定宽度，避免频繁计算
      const fixedTocWidth = Math.min(300, Math.max(200, currentWindowWidth * 0.2));
      toc.style.width = `${fixedTocWidth}px`;
      
      // 设置 z-index 确保目录不会被其他元素遮挡
      toc.style.zIndex = '3';
      
      // 确保main区域有正确的padding-right
      if (main && main.classList.contains('withtoc')) {
        main.style.paddingRight = `${fixedTocWidth}px`;
      }
    }
    
    // 处理窄屏幕特殊情况
    if (currentWindowWidth <= 768) {
      if (content) {
        content.style.width = '100%';
        content.style.marginLeft = '0';
      }
      
      if (toc) {
        toc.style.display = 'none';
      }
    }
    
    // 确保内容区域有足够的宽度
    ensureContentWidth();
  }
  
  // 简化的内容宽度保证函数，提高性能
  function ensureContentWidth() {
    if (!sidebar || !content) return;
    
    const windowWidth = window.innerWidth;
    
    // 检查侧边栏是否折叠
    if (sidebar.classList.contains('collapsed')) {
      // 侧边栏已折叠，优化内容区域
      const collapsedSidebarWidth = parseInt(getComputedStyle(sidebar).width) || 60;
      
      // 调整内容区域宽度并确保不被侧边栏遮挡
      content.style.width = `calc(100% - ${collapsedSidebarWidth}px)`;
      content.style.marginLeft = `${collapsedSidebarWidth}px`;
      
      // 增强内容区容器的宽度
      const container = content.querySelector('.container');
      if (container) {
        container.style.maxWidth = windowWidth >= 1200 ? '90%' : '85%';
      }
    } else {
      // 侧边栏未折叠，处理常规布局
      const sidebarWidth = parseInt(getComputedStyle(sidebar).width);
      
      // 调整内容区域宽度
      content.style.width = `calc(100% - ${sidebarWidth}px)`;
      content.style.marginLeft = `${sidebarWidth}px`;
      
      // 使用默认容器宽度
      const container = content.querySelector('.container');
      if (container && windowWidth > 768) {
        container.style.maxWidth = '900px';
      }
    }
  }
  
  // 使用 requestAnimationFrame 优化布局修复函数的调用
  function fixPageLayout() {
    requestAnimationFrame(fixLayout);
  }
  
  // 注册全局函数供其他脚本调用
  window.fixPageLayout = fixPageLayout;
  
  // 页面加载时立即修复布局
  fixPageLayout();
  
  // 使用节流函数优化窗口大小调整事件的处理
  let resizeTimeout;
  window.addEventListener('resize', function() {
    // 清除之前的超时，防止频繁调用
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    
    // 使用节流函数，仅在调整大小结束后执行一次
    resizeTimeout = setTimeout(fixPageLayout, 100);
  });
  
  // 添加一个定时器，定期检查页面布局（预防某些浏览器的渲染问题）
  const layoutCheckInterval = setInterval(function() {
    if (document.visibilityState === 'visible') {
      fixPageLayout();
    }
  }, 2000);
  
  // 页面卸载时清除定时器
  window.addEventListener('beforeunload', function() {
    clearInterval(layoutCheckInterval);
  });
}); 