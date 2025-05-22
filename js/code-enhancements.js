document.addEventListener('DOMContentLoaded', function() {
  // Find all code blocks
  document.querySelectorAll('pre.highlight').forEach(function(pre) {
    // Part 1: Add language label (existing logic)
    let langClass = Array.from(pre.classList).find(cls => cls.startsWith('language-'));
    if (langClass) {
      let lang = langClass.replace('language-', '');
      pre.setAttribute('data-lang', lang);
    } else {
      let codeEl = pre.querySelector('code');
      if (codeEl) {
        langClass = Array.from(codeEl.classList).find(cls => cls.startsWith('language-'));
        if (langClass) {
          let lang = langClass.replace('language-', '');
          pre.setAttribute('data-lang', lang);
        } else {
          pre.setAttribute('data-lang', 'code');
        }
      } else {
        pre.setAttribute('data-lang', 'code');
      }
    }

    // Part 2: Create and add Copy button - 全新实现
    const codeElement = pre.querySelector('code');
    if (codeElement) { // Ensure there's a <code> element
      // Remove any existing copy buttons to avoid duplicates
      const existingButtons = pre.querySelectorAll('.copy-code-button');
      existingButtons.forEach(button => button.remove());
      
      // 为每个代码块创建一个包装容器
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      wrapper.style.position = 'relative';
      
      // 将代码块放入包装容器
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      
      // 创建复制按钮
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-code-button';
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      copyButton.setAttribute('title', 'Copy code');
      copyButton.innerHTML = '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';
      
      // 设置按钮样式，固定在右上角
      copyButton.style.position = 'absolute';
      copyButton.style.top = '0';
      copyButton.style.right = '0';
      copyButton.style.zIndex = '100';
      copyButton.style.margin = '4px';
      copyButton.style.padding = '4px 6px';
      copyButton.style.background = 'rgba(245, 245, 245, 0.8)';
      copyButton.style.borderRadius = '4px';
      copyButton.style.border = 'none';
      copyButton.style.cursor = 'pointer';
      copyButton.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
      
      // 将按钮添加到包装容器，而不是代码块内部
      wrapper.appendChild(copyButton);

      copyButton.addEventListener('click', function() {
        const codeToCopy = codeElement.innerText;
        navigator.clipboard.writeText(codeToCopy).then(function() {
          // Update to checkmark icon only
          copyButton.innerHTML = '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>';
          copyButton.classList.add('copied');
          copyButton.style.background = 'rgba(220, 240, 220, 0.9)';
          copyButton.disabled = true;
          
          setTimeout(function() {
            // Revert to copy icon only
            copyButton.innerHTML = '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';
            copyButton.classList.remove('copied');
            copyButton.style.background = 'rgba(245, 245, 245, 0.8)';
            copyButton.disabled = false;
          }, 2000);
        }, function(err) {
          console.error('Failed to copy code: ', err);
          copyButton.innerHTML = 'Error';
          copyButton.style.background = 'rgba(240, 220, 220, 0.9)';
          setTimeout(function() {
            copyButton.innerHTML = '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';
            copyButton.style.background = 'rgba(245, 245, 245, 0.8)';
          }, 2000);
        });
      });
      
      // 处理深色模式
      const isDarkMode = document.body.classList.contains('dark-theme');
      if (isDarkMode) {
        copyButton.style.background = 'rgba(60, 60, 60, 0.8)';
        copyButton.querySelector('svg').style.fill = '#ddd';
      }
      
      // 当主题切换时更新按钮样式
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.attributeName === 'class' && 
              mutation.target.classList.contains('dark-theme')) {
            copyButton.style.background = 'rgba(60, 60, 60, 0.8)';
            copyButton.querySelector('svg').style.fill = '#ddd';
          } else {
            copyButton.style.background = 'rgba(245, 245, 245, 0.8)';
            copyButton.querySelector('svg').style.fill = '#333';
          }
        });
      });
      
      observer.observe(document.body, { attributes: true });
    }
  });
}); 