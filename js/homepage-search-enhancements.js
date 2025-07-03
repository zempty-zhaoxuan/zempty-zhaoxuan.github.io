// 首页搜索增强功能
// Homepage Search Enhancements

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const resultsContainer = document.getElementById('results-container');
  
  if (!searchInput) return;
  
  // 清除按钮功能
  if (searchClear) {
    // 显示/隐藏清除按钮
    searchInput.addEventListener('input', function() {
      if (this.value.trim()) {
        searchClear.classList.add('show');
      } else {
        searchClear.classList.remove('show');
        if (resultsContainer) {
          resultsContainer.classList.remove('show');
        }
      }
    });
    
    // 清除搜索
    searchClear.addEventListener('click', function() {
      searchInput.value = '';
      searchClear.classList.remove('show');
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('show');
      }
      searchInput.focus();
    });
  }
  
  // 键盘快捷键 Ctrl+K / Cmd+K
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    
    // ESC键清除搜索
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.blur();
      if (resultsContainer) {
        resultsContainer.classList.remove('show');
      }
    }
  });
  
  // 搜索结果显示控制
  if (resultsContainer) {
    searchInput.addEventListener('focus', function() {
      if (this.value.trim() && resultsContainer.innerHTML) {
        resultsContainer.classList.add('show');
      }
    });
    
    // 点击搜索结果外部区域隐藏结果
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.modern-search-container')) {
        resultsContainer.classList.remove('show');
      }
    });
  }
  
  // 搜索提示和快捷键提示
  const shortcutHint = document.querySelector('.search-shortcut');
  if (shortcutHint) {
    searchInput.addEventListener('focus', function() {
      shortcutHint.style.opacity = '0';
    });
    
    searchInput.addEventListener('blur', function() {
      if (!this.value.trim()) {
        shortcutHint.style.opacity = '0.7';
      }
    });
  }
  
  console.log('Homepage search enhancements loaded');
}); 