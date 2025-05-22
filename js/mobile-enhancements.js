/**
 * 移动端增强脚本
 * 检测并修复导致水平滚动的元素
 */

(function() {
  // 等待页面完全加载
  document.addEventListener('DOMContentLoaded', function() {
    // 仅在移动设备上运行
    if (window.innerWidth <= 768) {
      // 查找可能导致水平滚动的内容元素
      const contentArea = document.querySelector('.wrapper-content');
      const containerWidth = contentArea.clientWidth;
      
      // 检查大型元素
      const potentialElements = contentArea.querySelectorAll('img, pre, table, iframe, blockquote, div, code');
      
      potentialElements.forEach(function(element) {
        if (element.scrollWidth > containerWidth) {
          // 图片处理
          if (element.tagName === 'IMG') {
            element.style.maxWidth = '100%';
            element.style.height = 'auto';
          }
          // 代码块处理
          else if (element.tagName === 'PRE' || element.classList.contains('highlight')) {
            element.style.maxWidth = '100%';
            element.style.overflowX = 'auto';
            element.style.boxSizing = 'border-box';
            
            // 添加说明信息
            if (!element.classList.contains('horizontal-scroll-hint')) {
              element.classList.add('horizontal-scroll-hint');
              const hint = document.createElement('div');
              hint.className = 'scroll-hint';
              hint.textContent = '滑动查看更多 →';
              hint.style.fontSize = '12px';
              hint.style.color = '#888';
              hint.style.textAlign = 'right';
              hint.style.paddingTop = '4px';
              element.parentNode.insertBefore(hint, element.nextSibling);
            }
          }
          // 表格处理
          else if (element.tagName === 'TABLE') {
            // 如果表格还没有外层容器，添加一个滚动容器
            if (!element.parentNode.classList.contains('table-wrapper')) {
              const wrapper = document.createElement('div');
              wrapper.className = 'table-wrapper';
              wrapper.style.overflowX = 'auto';
              wrapper.style.width = '100%';
              wrapper.style.maxWidth = '100%';
              wrapper.style.display = 'block';
              element.parentNode.insertBefore(wrapper, element);
              wrapper.appendChild(element);
            }
          }
          // 其他元素
          else {
            element.style.maxWidth = '100%';
            element.style.boxSizing = 'border-box';
            element.style.wordWrap = 'break-word';
          }
        }
      });
      
      // 特别处理代码中的长行
      const codeElements = document.querySelectorAll('code');
      codeElements.forEach(function(code) {
        if (!code.parentNode.tagName === 'PRE') { // 内联代码，非代码块
          code.style.wordBreak = 'break-word';
          code.style.whiteSpace = 'pre-wrap';
        }
      });
    }
  });
})(); 