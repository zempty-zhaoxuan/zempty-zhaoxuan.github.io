document.addEventListener('DOMContentLoaded', function() {
  // 获取元素
  const sidebar = document.querySelector('.wrapper-sidebar');
  const content = document.querySelector('.wrapper-content');
  const toc = document.querySelector('.toc');
  const body = document.body;
  
  // 保存脉冲动画间隔引用
  let sidebarPulseInterval;
  let tocPulseInterval;
  
  // 保存拖动状态
  let isDraggingSidebar = false;
  let isDraggingToc = false;

  // 初始化布局函数
  function initializeLayout() {
    // 确保默认布局是正确的
    if (sidebar && content) {
      // 修复布局问题
      if (!sidebar.style.width) {
        sidebar.style.width = window.getComputedStyle(sidebar).width;
      }
      
      const sidebarWidth = sidebar.style.width;
      content.style.width = `calc(100% - ${sidebarWidth})`;
      content.style.marginLeft = sidebarWidth;
    }
    
    if (toc && document.getElementById('main') && document.getElementById('main').classList.contains('withtoc')) {
      if (!toc.style.width) {
        toc.style.width = window.getComputedStyle(toc).width;
      }
      document.getElementById('main').style.paddingRight = toc.style.width;
      
      // 更新目录宽度类别（如果函数存在）
      if (typeof window.updateTocWidthClass === 'function') {
        window.updateTocWidthClass();
      }
    }
    
    // 确保最小内容区域宽度
    enforceContentMinWidth();
  }
  
  // 确保内容区域有最小宽度
  function enforceContentMinWidth() {
    if (!sidebar || !content) return;
    
    const windowWidth = window.innerWidth;
    const minContentWidth = Math.max(400, windowWidth * 0.3);
    
    // 获取当前尺寸
    const sidebarWidth = parseInt(sidebar.style.width);
    let tocWidth = 0;
    
    if (toc && !toc.style.display === 'none') {
      tocWidth = parseInt(toc.style.width) || parseInt(window.getComputedStyle(toc).width);
    }
    
    // 检查并修正侧边栏宽度
    if (windowWidth - sidebarWidth - tocWidth < minContentWidth) {
      // 计算正确的侧边栏宽度
      const correctSidebarWidth = Math.max(180, windowWidth - tocWidth - minContentWidth);
      
      // 应用修正的宽度
      sidebar.style.width = correctSidebarWidth + 'px';
      content.style.width = `calc(100% - ${correctSidebarWidth}px)`;
      content.style.marginLeft = correctSidebarWidth + 'px';
    }
  }
  
  // 初始化布局
  initializeLayout();

  // 如果保存了侧边栏宽度，则恢复
  if(localStorage.getItem('sidebarWidth')) {
    const savedWidth = localStorage.getItem('sidebarWidth');
    // 验证保存的宽度是否合理
    const minWidth = 180;
    const maxWidth = 400;
    let width = parseInt(savedWidth);
    
    if (isNaN(width) || width < minWidth) {
      width = minWidth;
    } else if (width > maxWidth) {
      width = maxWidth;
    }
    
    const safeWidth = width + 'px';
    sidebar.style.width = safeWidth;
    content.style.width = `calc(100% - ${safeWidth})`;
    content.style.marginLeft = safeWidth;
  }

  // 如果保存了目录宽度，则恢复
  if(localStorage.getItem('tocWidth') && toc) {
    const savedWidth = localStorage.getItem('tocWidth');
    // 验证保存的宽度是否合理
    const minWidth = 200;
    const maxWidth = 450;
    let width = parseInt(savedWidth);
    
    if (isNaN(width) || width < minWidth) {
      width = minWidth;
    } else if (width > maxWidth) {
      width = maxWidth;
    }
    
    const safeWidth = width + 'px';
    toc.style.width = safeWidth;
    if(document.getElementById('main') && document.getElementById('main').classList.contains('withtoc')) {
      document.getElementById('main').style.paddingRight = safeWidth;
    }
    
    // 更新目录宽度类别（如果函数存在）
    if (typeof window.updateTocWidthClass === 'function') {
      window.updateTocWidthClass();
    }
  }
  
  // 脉冲动画通用函数
  function startPulse(element, intervalRef) {
    let opacity = 0.7;
    let direction = -1; // -1 表示减小, 1 表示增加
    
    // 清除之前的间隔
    clearInterval(intervalRef);
    
    return setInterval(() => {
      opacity += direction * 0.1;
      
      if (opacity <= 0.3) {
        direction = 1;
      } else if (opacity >= 0.7) {
        direction = -1;
      }
      
      element.style.opacity = opacity;
    }, 100);
  }
  
  function stopPulse(element, intervalRef) {
    clearInterval(intervalRef);
    element.style.opacity = '0';
  }

  // 为侧边栏添加拖动调整功能
  if(sidebar) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer resizer-sidebar';
    sidebar.appendChild(resizer);

    // 添加视觉指示器
    const maxWidthIndicator = document.createElement('div');
    maxWidthIndicator.className = 'max-width-indicator';
    maxWidthIndicator.style.position = 'absolute';
    maxWidthIndicator.style.top = '0';
    maxWidthIndicator.style.right = '0';
    maxWidthIndicator.style.width = '5px';
    maxWidthIndicator.style.height = '100%';
    maxWidthIndicator.style.background = 'var(--link-lighten-color, #4183c4)';
    maxWidthIndicator.style.opacity = '0';
    maxWidthIndicator.style.zIndex = '100';
    maxWidthIndicator.style.transition = 'opacity 0.3s ease';
    sidebar.style.position = 'relative'; // 确保定位正确
    sidebar.appendChild(maxWidthIndicator);

    // 添加鼠标按下事件
    resizer.addEventListener('mousedown', initResizeSidebar);
    
    // 为侧边栏右边缘添加拖动功能
    sidebar.addEventListener('mousemove', function(e) {
      const rect = sidebar.getBoundingClientRect();
      const isNearRightEdge = (e.clientX >= rect.right - 15) && (e.clientX <= rect.right);
      
      if (isNearRightEdge) {
        resizer.style.opacity = '0.5';
      } else {
        if (!isDraggingSidebar) {
          resizer.style.opacity = '0.2';
        }
      }
    });
    
    sidebar.addEventListener('mouseleave', function() {
      if (!isDraggingSidebar) {
        resizer.style.opacity = '0.2';
      }
    });
  }

  // 为目录添加拖动调整功能
  if(toc) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer resizer-toc';
    toc.appendChild(resizer);

    // 添加视觉指示器
    const maxWidthIndicator = document.createElement('div');
    maxWidthIndicator.className = 'max-width-indicator';
    maxWidthIndicator.style.position = 'absolute';
    maxWidthIndicator.style.top = '0';
    maxWidthIndicator.style.left = '0';
    maxWidthIndicator.style.width = '5px';
    maxWidthIndicator.style.height = '100%';
    maxWidthIndicator.style.background = 'var(--link-lighten-color, #4183c4)';
    maxWidthIndicator.style.opacity = '0';
    maxWidthIndicator.style.zIndex = '100';
    maxWidthIndicator.style.transition = 'opacity 0.3s ease';
    toc.style.position = 'relative'; // 确保定位正确
    toc.appendChild(maxWidthIndicator);

    // 添加鼠标按下事件
    resizer.addEventListener('mousedown', initResizeToc);
    
    // 为目录左边缘添加拖动功能
    toc.addEventListener('mousemove', function(e) {
      const rect = toc.getBoundingClientRect();
      const isNearLeftEdge = (e.clientX <= rect.left + 15) && (e.clientX >= rect.left);
      
      if (isNearLeftEdge) {
        resizer.style.opacity = '0.5';
      } else {
        if (!isDraggingToc) {
          resizer.style.opacity = '0.2';
        }
      }
    });
    
    toc.addEventListener('mouseleave', function() {
      if (!isDraggingToc) {
        resizer.style.opacity = '0.2';
      }
    });
  }

  // 初始化侧边栏调整
  function initResizeSidebar(e) {
    if(sidebar.classList.contains('collapsed')) return;
    
    e.preventDefault();
    isDraggingSidebar = true;
    body.classList.add('dragging-sidebar');
    
    // 清除可能的文本选择
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
    
    window.addEventListener('mousemove', resizeSidebar);
    window.addEventListener('mouseup', stopResizeSidebar);
    
    // 添加全局拖动样式
    document.documentElement.style.cursor = 'ew-resize';
  }

  // 初始化目录调整
  function initResizeToc(e) {
    e.preventDefault();
    isDraggingToc = true;
    body.classList.add('dragging-toc');
    
    // 清除可能的文本选择
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
    
    window.addEventListener('mousemove', resizeToc);
    window.addEventListener('mouseup', stopResizeToc);
    
    // 添加全局拖动样式
    document.documentElement.style.cursor = 'ew-resize';
  }

  // 调整侧边栏大小
  function resizeSidebar(e) {
    // 确保鼠标位置是有效的
    if (e.clientX <= 0) return;
    
    // 设置内容区域的最小宽度（像素）- 根据屏幕宽度动态调整
    const minContentWidth = Math.max(400, window.innerWidth * 0.3); // 至少400px或窗口宽度的30%
    
    // 计算侧边栏的最大宽度（不超过其CSS max-width限制）
    const sidebarMaxCSSWidth = 400; // 与CSS中设置的max-width一致
    
    // 计算最大可用宽度（需要考虑TOC的宽度）
    let availableTocWidth = 0;
    if (toc && toc.style.display !== 'none' && document.getElementById('main').classList.contains('withtoc')) {
      availableTocWidth = parseInt(toc.style.width) || parseInt(window.getComputedStyle(toc).width);
    }
    
    const maxSidebarWidth = Math.min(
      window.innerWidth - availableTocWidth - minContentWidth, 
      sidebarMaxCSSWidth
    );
    
    // 限制最小宽度
    const minSidebarWidth = 180; // 与CSS中设置的min-width一致
    
    // 计算实际宽度
    let newWidth = Math.max(minSidebarWidth, Math.min(e.clientX, maxSidebarWidth));
    
    // 如果拖动超出最大宽度限制，自动调整到最大允许宽度
    if (e.clientX >= maxSidebarWidth) {
      newWidth = maxSidebarWidth;
    }
    
    const newWidthPx = newWidth + 'px';
    
    // 应用新宽度并确保内容区域也相应更新
    sidebar.style.width = newWidthPx;
    content.style.width = `calc(100% - ${newWidthPx})`;
    content.style.marginLeft = newWidthPx;
    
    // 如果已达到最大值，则显示视觉提示
    const indicator = sidebar.querySelector('.max-width-indicator');
    if (newWidth >= maxSidebarWidth - 5) { // 接近最大宽度时显示
      sidebarPulseInterval = startPulse(indicator, sidebarPulseInterval);
    } else {
      stopPulse(indicator, sidebarPulseInterval);
    }
  }

  // 调整目录大小
  function resizeToc(e) {
    // 确保鼠标位置是有效的
    if (e.clientX >= window.innerWidth || e.clientX <= 0) return;
    
    // 设置内容区域的最小宽度（像素）- 根据屏幕宽度动态调整
    const minContentWidth = Math.max(400, window.innerWidth * 0.4); // 至少400px或窗口宽度的40%
    
    // 目录最大CSS宽度限制
    const tocMaxCSSWidth = 450; // 与CSS中设置的max-width一致
    
    // 获取真实的侧边栏宽度（包括边框等）
    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarWidth = sidebarRect.width;
    
    // 计算最大可用宽度（考虑侧边栏宽度和最小内容区域宽度）
    const maxTocWidth = Math.min(
      window.innerWidth - sidebarWidth - minContentWidth,
      tocMaxCSSWidth
    );
    
    // 限制最小宽度
    const minTocWidth = 200; // 与CSS中设置的min-width一致
    // 允许更窄的目录大小
    const absoluteMinTocWidth = 100; // 绝对最小宽度
    
    // 计算当前TOC宽度
    const rawTocWidth = window.innerWidth - e.clientX;
    
    // 确保宽度在允许范围内
    let newWidth = Math.max(absoluteMinTocWidth, Math.min(rawTocWidth, maxTocWidth));
    
    // 如果拖动超出最大宽度限制，自动调整到最大允许宽度
    if (rawTocWidth >= maxTocWidth) {
      newWidth = maxTocWidth;
    }
    
    const newWidthPx = newWidth + 'px';
    toc.style.width = newWidthPx;
    
    // 只有在有withtoc类时才应用padding
    const mainElement = document.getElementById('main');
    if(mainElement && mainElement.classList.contains('withtoc')) {
      mainElement.style.paddingRight = newWidthPx;
      
      // 为文章内容设置合适的宽度
      const post = mainElement.querySelector('.post');
      if (post) {
        if (newWidth <= 150) {
          post.style.maxWidth = 'calc(100% - 50px)';
        } else if (newWidth <= 250) {
          post.style.maxWidth = 'calc(100% - 100px)';
        } else {
          post.style.maxWidth = '';
        }
      }
    }
    
    // 更新目录宽度分类
    if (typeof window.updateTocWidthClass === 'function') {
      window.updateTocWidthClass();
    }
    
    // 如果已达到最大值，则显示视觉提示
    const indicator = toc.querySelector('.max-width-indicator');
    if (newWidth >= maxTocWidth - 5) { // 接近最大宽度时显示
      tocPulseInterval = startPulse(indicator, tocPulseInterval);
    } else {
      stopPulse(indicator, tocPulseInterval);
    }
  }

  // 停止调整侧边栏
  function stopResizeSidebar() {
    // 保存侧边栏宽度到localStorage
    localStorage.setItem('sidebarWidth', sidebar.style.width);
    
    // 停止脉冲动画
    const indicator = sidebar.querySelector('.max-width-indicator');
    stopPulse(indicator, sidebarPulseInterval);
    
    // 移除拖动标记和事件监听
    isDraggingSidebar = false;
    body.classList.remove('dragging-sidebar');
    document.documentElement.style.cursor = '';
    
    window.removeEventListener('mousemove', resizeSidebar);
    window.removeEventListener('mouseup', stopResizeSidebar);
    
    // 确保内容区域有足够空间
    enforceContentMinWidth();
  }

  // 停止调整目录
  function stopResizeToc() {
    // 保存目录宽度到localStorage
    localStorage.setItem('tocWidth', toc.style.width);
    
    // 停止脉冲动画
    const indicator = toc.querySelector('.max-width-indicator');
    stopPulse(indicator, tocPulseInterval);
    
    // 移除拖动标记和事件监听
    isDraggingToc = false;
    body.classList.remove('dragging-toc');
    document.documentElement.style.cursor = '';
    
    window.removeEventListener('mousemove', resizeToc);
    window.removeEventListener('mouseup', stopResizeToc);
    
    // 确保内容区域有足够空间
    enforceContentMinWidth();
    
    // 更新目录宽度分类
    if (typeof window.updateTocWidthClass === 'function') {
      window.updateTocWidthClass();
    }
    
    // 修复目录拖动后的布局
    if (typeof window.fixTocDragLayout === 'function') {
      window.fixTocDragLayout();
    }
  }
  
  // 处理窗口大小变化，重新计算布局
  window.addEventListener('resize', function() {
    // 延迟执行以避免频繁触发
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(function() {
      initializeLayout();
      enforceContentMinWidth();
      
      // 更新目录宽度分类
      if (typeof window.updateTocWidthClass === 'function') {
        window.updateTocWidthClass();
      }
    }, 200);
  });
  
  // 初始应用最小内容宽度限制
  enforceContentMinWidth();
}); 