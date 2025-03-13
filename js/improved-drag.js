/**
 * 改进的拖动体验
 * 这个脚本用于增强侧边栏和目录的拖动体验
 */
document.addEventListener('DOMContentLoaded', function() {
  // 获取必要的元素
  const sidebar = document.querySelector('.wrapper-sidebar');
  const toc = document.querySelector('.toc');
  const content = document.querySelector('.wrapper-content');
  const main = document.getElementById('main');
  
  // 添加CSS辅助类到body,可以用于控制全局样式
  document.body.classList.add('resize-enabled');
  
  // 目录宽度分类
  function updateTocWidthClass() {
    if (!toc || !main) return;
    
    // 获取目录宽度
    const tocWidth = parseInt(getComputedStyle(toc).width);
    
    // 清除旧的宽度类
    toc.classList.remove('narrow', 'very-narrow');
    main.classList.remove('toc-narrow', 'toc-very-narrow');
    
    // 根据宽度添加类
    if (tocWidth <= 150) {
      toc.classList.add('very-narrow');
      main.classList.add('toc-very-narrow');
    } else if (tocWidth <= 250) {
      toc.classList.add('narrow');
      main.classList.add('toc-narrow');
    }
  }
  
  // 优化侧边栏折叠状态下的布局
  function optimizeCollapsedLayout() {
    if (!sidebar || !content) return;
    
    // 检查侧边栏是否折叠
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    if (isCollapsed) {
      // 获取折叠后的宽度
      const collapsedWidth = parseInt(getComputedStyle(sidebar).width) || 60;
      
      // 调整内容区域
      content.style.width = `calc(100% - ${collapsedWidth}px)`;
      content.style.marginLeft = `${collapsedWidth}px`;
      
      // 大幅优化容器宽度，使用更多的可用空间
      const container = content.querySelector('.container');
      if (container) {
        // 根据屏幕宽度设置合适的宽度
        if (window.innerWidth >= 1400) {
          // 大屏幕上使用非常宽的布局
          container.style.maxWidth = '95%';
          container.style.marginLeft = '16px';
          container.style.marginRight = 'auto';
        } else if (window.innerWidth >= 1200) {
          // 中大屏幕使用宽布局
          container.style.maxWidth = '90%';
          container.style.marginLeft = '16px';
          container.style.marginRight = 'auto';
        } else {
          // 中小屏幕使用适中布局
          container.style.maxWidth = '90%';
          container.style.marginLeft = '8px';
          container.style.marginRight = 'auto';
        }
      }
      
      // 如果有目录，确保它与内容区域的关系正确
      if (toc && main && main.classList.contains('withtoc')) {
        // 计算可用宽度
        const availableWidth = window.innerWidth - collapsedWidth;
        const tocWidth = parseInt(getComputedStyle(toc).width);
        
        // 确保目录宽度合理
        if (tocWidth > availableWidth * 0.25) {
          // 目录不应该占用太多空间，最多屏幕的25%
          const adjustedTocWidth = Math.min(300, Math.max(200, availableWidth * 0.2));
          toc.style.width = `${adjustedTocWidth}px`;
          
          if (main) {
            main.style.paddingRight = `${adjustedTocWidth}px`;
          }
        }
        
        // 更新目录宽度类别
        updateTocWidthClass();
        
        // 确保内容区域有足够空间
        const contentElement = main.querySelector('.post');
        if (contentElement) {
          contentElement.style.maxWidth = 'none';
        }
      }
    }
  }
  
  // 在侧边栏边缘创建拖动区域
  if (sidebar) {
    // 创建更宽的拖动区域覆盖在边缘
    const hitArea = document.createElement('div');
    hitArea.className = 'sidebar-drag-hit-area';
    hitArea.style.position = 'absolute';
    hitArea.style.top = '0';
    hitArea.style.right = '-8px';
    hitArea.style.width = '16px';
    hitArea.style.height = '100%';
    hitArea.style.cursor = 'ew-resize';
    hitArea.style.zIndex = '200';
    sidebar.style.position = 'relative';
    sidebar.appendChild(hitArea);
    
    // 当鼠标进入拖动区域时，显示视觉提示
    hitArea.addEventListener('mouseenter', function() {
      // 只在侧边栏未折叠时显示拖动提示
      if (!sidebar.classList.contains('collapsed')) {
        const resizer = sidebar.querySelector('.resizer-sidebar');
        if (resizer) {
          resizer.style.opacity = '0.8';
          resizer.style.backgroundColor = 'var(--link-lighten-color, #4183c4)';
        }
      }
    });
    
    // 当鼠标离开拖动区域时，恢复默认外观
    hitArea.addEventListener('mouseleave', function() {
      if (!document.body.classList.contains('dragging-sidebar')) {
        const resizer = sidebar.querySelector('.resizer-sidebar');
        if (resizer) {
          resizer.style.opacity = '0.2';
        }
      }
    });
    
    // 监听拖动事件
    hitArea.addEventListener('mousedown', function(e) {
      if (sidebar.classList.contains('collapsed')) return;
      
      // 触发原有拖动逻辑
      const resizer = sidebar.querySelector('.resizer-sidebar');
      if (resizer) {
        // 创建并触发事件
        const mousedownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: e.clientX,
          clientY: e.clientY
        });
        resizer.dispatchEvent(mousedownEvent);
      }
    });
    
    // 监听侧边栏状态变化
    if (window.MutationObserver) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.attributeName === 'class') {
            // 侧边栏状态可能已改变，优化布局
            optimizeCollapsedLayout();
          }
        });
      });
      
      observer.observe(sidebar, { attributes: true });
    }
  }
  
  // 在目录边缘创建拖动区域
  if (toc) {
    // 创建更宽的拖动区域覆盖在边缘
    const hitArea = document.createElement('div');
    hitArea.className = 'toc-drag-hit-area';
    hitArea.style.position = 'absolute';
    hitArea.style.top = '0';
    hitArea.style.left = '-8px';
    hitArea.style.width = '16px';
    hitArea.style.height = '100%';
    hitArea.style.cursor = 'ew-resize';
    hitArea.style.zIndex = '200';
    toc.style.position = 'relative';
    toc.appendChild(hitArea);
    
    // 当鼠标进入拖动区域时，显示视觉提示
    hitArea.addEventListener('mouseenter', function() {
      const resizer = toc.querySelector('.resizer-toc');
      if (resizer) {
        resizer.style.opacity = '0.8';
        resizer.style.backgroundColor = 'var(--link-lighten-color, #4183c4)';
      }
    });
    
    // 当鼠标离开拖动区域时，恢复默认外观
    hitArea.addEventListener('mouseleave', function() {
      if (!document.body.classList.contains('dragging-toc')) {
        const resizer = toc.querySelector('.resizer-toc');
        if (resizer) {
          resizer.style.opacity = '0.2';
        }
      }
    });
    
    // 监听拖动事件
    hitArea.addEventListener('mousedown', function(e) {
      // 触发原有拖动逻辑
      const resizer = toc.querySelector('.resizer-toc');
      if (resizer) {
        // 创建并触发事件
        const mousedownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: e.clientX,
          clientY: e.clientY
        });
        resizer.dispatchEvent(mousedownEvent);
      }
    });
    
    // 监听目录宽度变化
    if (window.MutationObserver) {
      // 创建观察器监视style属性变化
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.attributeName === 'style') {
            // 更新目录宽度分类
            updateTocWidthClass();
            
            // 确保主内容区域padding-right与目录宽度匹配
            if (main && main.classList.contains('withtoc')) {
              const tocWidth = parseInt(getComputedStyle(toc).width);
              main.style.paddingRight = `${tocWidth}px`;
              
              // 为文章内容调整宽度，响应目录变化
              const post = main.querySelector('.post');
              if (post) {
                if (tocWidth <= 150) {
                  post.style.maxWidth = 'calc(100% - 50px)';
                } else if (tocWidth <= 250) {
                  post.style.maxWidth = 'calc(100% - 100px)';
                } else {
                  post.style.maxWidth = '';
                }
              }
            }
          }
        });
      });
      
      observer.observe(toc, { attributes: true });
    }
  }
  
  // 定期检查布局，确保内容区域大小合适
  function checkContentSize() {
    if (!content || !sidebar) return;
    
    // 检查侧边栏折叠状态并优化布局
    optimizeCollapsedLayout();
    
    // 更新目录宽度分类
    updateTocWidthClass();
    
    // 后续代码针对非折叠状态
    if (sidebar.classList.contains('collapsed')) return;
    
    // 获取当前尺寸
    const windowWidth = window.innerWidth;
    const sidebarWidth = parseInt(getComputedStyle(sidebar).width);
    let tocWidth = 0;
    
    if (toc && main && main.classList.contains('withtoc')) {
      tocWidth = parseInt(getComputedStyle(toc).width);
      
      // 确保主内容区域的padding-right与目录宽度匹配
      main.style.paddingRight = `${tocWidth}px`;
    }
    
    // 计算内容宽度
    const availableContentWidth = windowWidth - sidebarWidth - tocWidth;
    const minDesiredWidth = Math.max(400, windowWidth * 0.35); // 至少要有35%的宽度
    
    // 如果内容区域太窄，调整布局
    if (availableContentWidth < minDesiredWidth) {
      // 尝试使用现有方法修复
      if (typeof window.fixPageLayout === 'function') {
        window.fixPageLayout();
      }
    }
  }
  
  // 修复目录拖动后的文章布局
  function fixTocDragLayout() {
    if (!toc || !main || !main.classList.contains('withtoc')) return;
    
    // 获取目录宽度
    const tocWidth = parseInt(getComputedStyle(toc).width);
    
    // 根据不同宽度范围应用不同样式
    if (tocWidth <= 150) {
      main.style.paddingRight = `${tocWidth}px`;
      const post = main.querySelector('.post');
      if (post) {
        post.style.maxWidth = 'calc(100% - 50px)';
      }
    } else if (tocWidth <= 250) {
      main.style.paddingRight = `${tocWidth}px`;
      const post = main.querySelector('.post');
      if (post) {
        post.style.maxWidth = 'calc(100% - 100px)';
      }
    } else {
      main.style.paddingRight = `${tocWidth}px`;
      const post = main.querySelector('.post');
      if (post) {
        post.style.maxWidth = '';
      }
    }
  }
  
  // 周期性检查内容大小（例如处理图片加载后的情况）
  setInterval(checkContentSize, 2000);
  
  // 在调整浏览器窗口大小后检查内容大小
  window.addEventListener('resize', function() {
    setTimeout(checkContentSize, 300);
  });
  
  // 初始检查
  setTimeout(checkContentSize, 500);
  
  // 初次加载时优化折叠状态布局
  optimizeCollapsedLayout();
  
  // 初始化时更新目录宽度分类
  updateTocWidthClass();
  
  // 暴露函数到全局命名空间，供其他脚本使用
  window.updateTocWidthClass = updateTocWidthClass;
  window.fixTocDragLayout = fixTocDragLayout;
}); 