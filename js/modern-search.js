// 现代化搜索功能
// Modern Search Functionality

class ModernSearch {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.searchBtn = document.getElementById('search-btn');
    this.resultsContainer = document.getElementById('search-results');
    this.posts = [];
    this.isInitialized = false;
    
    this.init();
  }
  
  async init() {
    if (!this.searchInput || !this.searchBtn || !this.resultsContainer) {
      console.warn('Search elements not found');
      return;
    }
    
    try {
      await this.loadPosts();
      this.bindEvents();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize search:', error);
    }
  }
  
  async loadPosts() {
    try {
      const response = await fetch('/search.json');
      const data = await response.json();
      this.posts = data;
    } catch (error) {
      console.error('Failed to load posts:', error);
      throw error;
    }
  }
  
  bindEvents() {
    // 输入框事件
    this.searchInput.addEventListener('input', this.debounce((e) => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        this.performSearch(query);
      } else {
        this.hideResults();
      }
    }, 300));
    
    // 搜索按钮事件
    this.searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const query = this.searchInput.value.trim();
      if (query.length >= 2) {
        this.performSearch(query);
      }
    });
    
    // 回车键搜索
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (query.length >= 2) {
          this.performSearch(query);
        }
      }
      
      // ESC键清空搜索
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });
    
    // 点击外部区域隐藏结果
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.sidebar-search')) {
        this.hideResults();
      }
    });
  }
  
  performSearch(query) {
    const results = this.searchPosts(query);
    this.displayResults(results, query);
  }
  
  searchPosts(query) {
    const searchTerm = query.toLowerCase();
    const results = [];
    
    this.posts.forEach(post => {
      let score = 0;
      let matchedFields = [];
      
      // 标题匹配（权重最高）
      if (post.title && post.title.toLowerCase().includes(searchTerm)) {
        score += 10;
        matchedFields.push('title');
      }
      
      // 标签匹配
      if (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
        score += 5;
        matchedFields.push('tags');
      }
      
      // 内容匹配
      if (post.content && post.content.toLowerCase().includes(searchTerm)) {
        score += 2;
        matchedFields.push('content');
      }
      
      // URL匹配
      if (post.url && post.url.toLowerCase().includes(searchTerm)) {
        score += 1;
        matchedFields.push('url');
      }
      
      if (score > 0) {
        results.push({
          ...post,
          score,
          matchedFields
        });
      }
    });
    
    // 按分数排序
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  }
  
  displayResults(results, query) {
    if (results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p>😕 没有找到包含 "<strong>${this.escapeHtml(query)}</strong>" 的文章</p>
          <p class="search-tip">试试其他关键词或者检查拼写</p>
        </div>
      `;
    } else {
      const resultsHtml = results.map(post => this.createResultItem(post, query)).join('');
      this.resultsContainer.innerHTML = `
        <div class="search-results-header">
          <span>找到 ${results.length} 篇相关文章</span>
        </div>
        ${resultsHtml}
      `;
    }
    
    this.showResults();
  }
  
  createResultItem(post, query) {
    const highlightedTitle = this.highlightText(post.title, query);
    const excerpt = this.createExcerpt(post.content, query);
    const date = new Date(post.date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `
      <div class="search-result-item" data-score="${post.score}">
        <div class="search-result-content">
          <h3 class="search-result-title">
            <a href="${post.url}">${highlightedTitle}</a>
          </h3>
          <p class="search-result-excerpt">${excerpt}</p>
          <div class="search-result-meta">
            <span class="search-result-date">📅 ${date}</span>
            ${post.tags ? `<span class="search-result-tags">${this.formatTags(post.tags)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }
  
  createExcerpt(content, query, maxLength = 150) {
    if (!content) return '';
    
    const searchTerm = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(searchTerm);
    
    let excerpt = '';
    if (index !== -1) {
      // 找到关键词，以关键词为中心创建摘要
      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + 100);
      excerpt = content.slice(start, end);
      if (start > 0) excerpt = '...' + excerpt;
      if (end < content.length) excerpt = excerpt + '...';
    } else {
      // 没找到关键词，使用开头部分
      excerpt = content.slice(0, maxLength);
      if (content.length > maxLength) excerpt += '...';
    }
    
    return this.highlightText(excerpt, query);
  }
  
  highlightText(text, query) {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }
  
  formatTags(tags) {
    return tags.slice(0, 3).map(tag => 
      `<span class="search-tag">${tag}</span>`
    ).join('');
  }
  
  showResults() {
    this.resultsContainer.classList.add('active');
    this.resultsContainer.style.display = 'block';
  }
  
  hideResults() {
    this.resultsContainer.classList.remove('active');
    this.resultsContainer.style.display = 'none';
  }
  
  clearSearch() {
    this.searchInput.value = '';
    this.hideResults();
    this.searchInput.blur();
  }
  
  // 工具函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// 添加搜索相关的CSS样式
const searchStyles = `
<style>
.search-results {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--accent-color-light) transparent;
}

.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background: var(--accent-color-light);
  border-radius: 3px;
}

.search-results-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--divider-color);
  font-size: 0.8rem;
  color: var(--muted-text-color);
  font-weight: 500;
}

.search-result-item {
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: var(--background-lighten-color);
  border-radius: 8px;
  border: 1px solid var(--divider-color);
  transition: all 0.3s ease;
  cursor: pointer;
}

.search-result-item:hover {
  background: var(--accent-color-light);
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.search-result-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.3;
}

.search-result-title a {
  color: var(--heading-color);
  text-decoration: none;
  font-weight: 600;
}

.search-result-title a:hover {
  color: var(--accent-color);
}

.search-result-excerpt {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--text-color);
  opacity: 0.8;
}

.search-result-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: var(--muted-text-color);
}

.search-result-date {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.search-result-tags {
  display: flex;
  gap: 0.3rem;
}

.search-tag {
  background: var(--accent-color-light);
  color: var(--accent-color-dark);
  padding: 0.1rem 0.4rem;
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 500;
}

.search-highlight {
  background: var(--accent-color-light);
  color: var(--accent-color-dark);
  padding: 0.1rem 0.2rem;
  border-radius: 2px;
  font-weight: 600;
}

.search-no-results {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--muted-text-color);
}

.search-no-results p {
  margin: 0.5rem 0;
}

.search-tip {
  font-size: 0.8rem;
  opacity: 0.8;
}

.dark-theme .search-result-item {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
}

.dark-theme .search-result-item:hover {
  background: var(--accent-color);
  color: white;
}

.dark-theme .search-highlight {
  background: var(--accent-color);
  color: white;
}
</style>
`;

// 初始化搜索功能
document.addEventListener('DOMContentLoaded', () => {
  // 添加样式
  document.head.insertAdjacentHTML('beforeend', searchStyles);
  
  // 初始化搜索
  new ModernSearch();
});