// Enhanced Search System
// 增强搜索系统 - 支持即时搜索、搜索历史、键盘快捷键等

class EnhancedSearch {
  constructor() {
    this.searchInput = null;
    this.resultsContainer = null;
    this.posts = [];
    this.searchHistory = this.loadSearchHistory();
    this.currentQuery = '';
    this.debounceTimer = null;
    this.isLoading = false;
    this.searchCache = new Map();
    this.maxHistoryItems = 10;
    this.minQueryLength = 1;
    
    this.init();
  }

  async init() {
    try {
      this.setupSearchElements();
      this.bindEvents();
      await this.loadSearchData();
      this.setupKeyboardShortcuts();
      console.log('Enhanced search system initialized');
    } catch (error) {
      console.error('Failed to initialize enhanced search:', error);
    }
  }

  setupSearchElements() {
    // Find search input and results container
    this.searchInput = document.getElementById('search-input') || 
                     document.getElementById('sidebar-search-input');
    this.resultsContainer = document.getElementById('results-container') || 
                           document.getElementById('sidebar-search-results');

    if (!this.searchInput || !this.resultsContainer) {
      console.warn('Search elements not found');
      return;
    }

    // Add enhanced search attributes
    this.searchInput.setAttribute('autocomplete', 'off');
    this.searchInput.setAttribute('spellcheck', 'false');
    this.searchInput.setAttribute('role', 'searchbox');
    this.searchInput.setAttribute('aria-label', '搜索博客文章');
    this.searchInput.setAttribute('aria-expanded', 'false');
    this.searchInput.setAttribute('aria-owns', this.resultsContainer.id);

    // Setup results container
    this.resultsContainer.setAttribute('role', 'listbox');
    this.resultsContainer.setAttribute('aria-label', '搜索结果');
  }

  bindEvents() {
    if (!this.searchInput) return;

    // Input event with debouncing
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });

    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });

    // Focus events
    this.searchInput.addEventListener('focus', () => {
      this.handleSearchFocus();
    });

    this.searchInput.addEventListener('blur', (e) => {
      // Delay hiding results to allow clicking on them
      setTimeout(() => {
        if (!this.resultsContainer.contains(document.activeElement)) {
          this.hideResults();
        }
      }, 150);
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && 
          !this.resultsContainer.contains(e.target)) {
        this.hideResults();
      }
    });

    // Clear button functionality
    const clearButton = document.getElementById('search-clear');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearSearch();
      });
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.focusSearch();
      }

      // Escape to clear search
      if (e.key === 'Escape' && document.activeElement === this.searchInput) {
        this.clearSearch();
      }
    });
  }

  async loadSearchData() {
    try {
      const baseMeta = document.querySelector('meta[name="base-url"]');
      const base = baseMeta ? baseMeta.getAttribute('content') || '' : '';
      const response = await fetch(`${base}/search.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.posts = Array.isArray(data) ? data.filter(post => post && typeof post === 'object') : [];
      console.log(`Loaded ${this.posts.length} posts for enhanced search`);
    } catch (error) {
      console.error('Error loading search data:', error);
      this.posts = [];
    }
  }

  handleSearchInput(query) {
    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Update current query
    this.currentQuery = query.trim();

    // Show/hide clear button
    this.updateClearButton();

    // Debounced search
    this.debounceTimer = setTimeout(() => {
      this.performSearch(this.currentQuery);
    }, 300);
  }

  async performSearch(query) {
    if (query.length < this.minQueryLength) {
      this.showSearchHistory();
      return;
    }

    // Check cache first
    if (this.searchCache.has(query)) {
      const cachedResults = this.searchCache.get(query);
      this.displayResults(cachedResults, query);
      return;
    }

    // Show loading state
    this.showLoadingState();

    try {
      // Perform search
      const results = this.searchPosts(query);
      
      // Cache results
      this.searchCache.set(query, results);
      
      // Display results
      this.displayResults(results, query);
      
      // Add to search history if results found
      if (results.length > 0) {
        this.addToSearchHistory(query);
      }
    } catch (error) {
      console.error('Search error:', error);
      this.showErrorState();
    }
  }

  searchPosts(query) {
    const searchTerm = query.toLowerCase();
    const results = [];

    this.posts.forEach(post => {
      let score = 0;
      let matchedFields = [];
      let highlights = {};

      // Title matching (highest weight)
      if (post.title && post.title.toLowerCase().includes(searchTerm)) {
        score += 10;
        matchedFields.push('title');
        highlights.title = this.highlightText(post.title, query);
      }

      // Exact title match bonus
      if (post.title && post.title.toLowerCase() === searchTerm) {
        score += 20;
      }

      // Tags matching
      if (post.tags && Array.isArray(post.tags)) {
        const matchedTags = post.tags.filter(tag => 
          tag.toLowerCase().includes(searchTerm)
        );
        if (matchedTags.length > 0) {
          score += matchedTags.length * 5;
          matchedFields.push('tags');
          highlights.tags = matchedTags;
        }
      }

      // Content matching
      if (post.content && post.content.toLowerCase().includes(searchTerm)) {
        score += 2;
        matchedFields.push('content');
        highlights.excerpt = this.createHighlightedExcerpt(post.content, query);
      }

      // URL matching
      if (post.url && post.url.toLowerCase().includes(searchTerm)) {
        score += 1;
        matchedFields.push('url');
      }

      // Category matching
      if (post.category && post.category.toLowerCase().includes(searchTerm)) {
        score += 3;
        matchedFields.push('category');
      }

      if (score > 0) {
        results.push({
          ...post,
          score,
          matchedFields,
          highlights
        });
      }
    });

    // Sort by score (descending) and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  displayResults(results, query) {
    this.resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
      this.showNoResults(query);
      return;
    }

    // Create results header
    const header = this.createResultsHeader(results.length, query);
    this.resultsContainer.appendChild(header);

    // Create result items
    results.forEach((result, index) => {
      const resultElement = this.createResultElement(result, query, index);
      this.resultsContainer.appendChild(resultElement);
    });

    this.showResults();
  }

  createResultsHeader(count, query) {
    const header = document.createElement('div');
    header.className = 'search-results-header';
    header.innerHTML = `
      <span class="results-count">找到 ${count} 篇相关文章</span>
      <span class="search-query">关于 "${this.escapeHtml(query)}"</span>
    `;
    return header;
  }

  createResultElement(result, query, index) {
    const item = document.createElement('div');
    item.className = 'search-result-item enhanced';
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', 'false');
    item.setAttribute('data-index', index);
    item.setAttribute('data-score', result.score);

    // Create result content
    const content = document.createElement('div');
    content.className = 'result-content';

    // Title
    const title = document.createElement('h3');
    title.className = 'result-title';
    const titleLink = document.createElement('a');
    titleLink.href = result.url;
    titleLink.innerHTML = result.highlights.title || this.escapeHtml(result.title);
    title.appendChild(titleLink);
    content.appendChild(title);

    // Meta information
    const meta = document.createElement('div');
    meta.className = 'result-meta';
    
    // Date
    const date = document.createElement('span');
    date.className = 'result-date';
    date.innerHTML = `📅 ${this.formatDate(result.date)}`;
    meta.appendChild(date);

    // Score indicator
    const scoreIndicator = document.createElement('span');
    scoreIndicator.className = 'result-score';
    scoreIndicator.textContent = `匹配度: ${Math.round(result.score)}`;
    meta.appendChild(scoreIndicator);

    content.appendChild(meta);

    // Excerpt
    if (result.highlights.excerpt) {
      const excerpt = document.createElement('p');
      excerpt.className = 'result-excerpt';
      excerpt.innerHTML = result.highlights.excerpt;
      content.appendChild(excerpt);
    }

    // Tags
    if (result.tags && result.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'result-tags';
      
      result.tags.slice(0, 5).forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        if (result.highlights.tags && result.highlights.tags.includes(tag)) {
          tagElement.classList.add('matched');
        }
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
      
      content.appendChild(tagsContainer);
    }

    item.appendChild(content);

    // Add click handler
    item.addEventListener('click', () => {
      window.location.href = result.url;
    });

    return item;
  }

  createHighlightedExcerpt(content, query, maxLength = 200) {
    if (!content) return '';
    
    // Remove HTML tags and normalize whitespace
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    
    const searchTerm = query.toLowerCase();
    const contentLower = cleanContent.toLowerCase();
    const index = contentLower.indexOf(searchTerm);

    let excerpt = '';
    if (index !== -1) {
      // Center excerpt around the match
      const start = Math.max(0, index - 75);
      const end = Math.min(cleanContent.length, index + 125);
      excerpt = cleanContent.slice(start, end);
      
      if (start > 0) excerpt = '...' + excerpt;
      if (end < cleanContent.length) excerpt = excerpt + '...';
    } else {
      // Use beginning of content
      excerpt = cleanContent.slice(0, maxLength);
      if (cleanContent.length > maxLength) excerpt += '...';
    }

    return this.highlightText(excerpt, query);
  }

  highlightText(text, query) {
    if (!text || !query) return this.escapeHtml(text || '');
    
    const safeText = this.escapeHtml(text);
    const safeQuery = this.escapeHtml(query.trim());
    
    if (!safeQuery) return safeText;
    
    try {
      const escapedQuery = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return safeText.replace(regex, '<mark>$1</mark>');
    } catch (e) {
      console.warn('Regex error in highlightText:', e);
      return safeText;
    }
  }

  showSearchHistory() {
    if (this.searchHistory.length === 0) {
      this.hideResults();
      return;
    }

    this.resultsContainer.innerHTML = '';

    // Create history header
    const header = document.createElement('div');
    header.className = 'search-history-title';
    header.textContent = '最近搜索';
    this.resultsContainer.appendChild(header);

    // Create history items
    this.searchHistory.forEach((historyItem, index) => {
      const item = document.createElement('div');
      item.className = 'search-history-item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-index', index);

      const text = document.createElement('span');
      text.className = 'history-text';
      text.textContent = historyItem.query;

      const remove = document.createElement('span');
      remove.className = 'history-remove';
      remove.textContent = '×';
      remove.title = '删除';

      item.appendChild(text);
      item.appendChild(remove);

      // Click to search
      text.addEventListener('click', () => {
        this.searchInput.value = historyItem.query;
        this.performSearch(historyItem.query);
      });

      // Click to remove
      remove.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFromSearchHistory(index);
        this.showSearchHistory();
      });

      this.resultsContainer.appendChild(item);
    });

    this.showResults();
  }

  showLoadingState() {
    this.isLoading = true;
    this.resultsContainer.innerHTML = `
      <div class="search-loading">
        <div class="loading-spinner"></div>
        <p>搜索中...</p>
      </div>
    `;
    this.showResults();
  }

  showNoResults(query) {
    this.resultsContainer.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <div class="no-results-title">没有找到相关文章</div>
        <div class="no-results-suggestion">
          试试其他关键词，或检查拼写是否正确
        </div>
      </div>
    `;
    this.showResults();
  }

  showErrorState() {
    this.resultsContainer.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">⚠️</div>
        <div class="no-results-title">搜索出错</div>
        <div class="no-results-suggestion">
          请稍后重试
        </div>
      </div>
    `;
    this.showResults();
  }

  showResults() {
    this.resultsContainer.style.display = 'block';
    this.resultsContainer.classList.add('show');
    this.searchInput.setAttribute('aria-expanded', 'true');
  }

  hideResults() {
    this.resultsContainer.style.display = 'none';
    this.resultsContainer.classList.remove('show');
    this.searchInput.setAttribute('aria-expanded', 'false');
    this.isLoading = false;
  }

  handleSearchFocus() {
    if (this.currentQuery.length >= this.minQueryLength) {
      this.performSearch(this.currentQuery);
    } else {
      this.showSearchHistory();
    }
  }

  handleKeyboardNavigation(e) {
    const items = this.resultsContainer.querySelectorAll('[role="option"]');
    if (items.length === 0) return;

    const currentIndex = Array.from(items).findIndex(item => 
      item.getAttribute('aria-selected') === 'true'
    );

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Enter':
        e.preventDefault();
        if (currentIndex >= 0) {
          const selectedItem = items[currentIndex];
          const link = selectedItem.querySelector('a');
          if (link) {
            window.location.href = link.href;
          } else {
            selectedItem.click();
          }
        }
        return;
      case 'Escape':
        this.clearSearch();
        return;
      default:
        return;
    }

    // Update selection
    items.forEach((item, index) => {
      item.setAttribute('aria-selected', index === newIndex ? 'true' : 'false');
      if (index === newIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  focusSearch() {
    if (this.searchInput) {
      this.searchInput.focus();
      this.searchInput.select();
    }
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.currentQuery = '';
      this.updateClearButton();
      this.hideResults();
      this.searchInput.focus();
    }
  }

  updateClearButton() {
    const clearButton = document.getElementById('search-clear');
    if (clearButton) {
      if (this.currentQuery.length > 0) {
        clearButton.classList.add('show');
      } else {
        clearButton.classList.remove('show');
      }
    }
  }

  // Search History Management
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('blog-search-history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.warn('Failed to load search history:', error);
      return [];
    }
  }

  addToSearchHistory(query) {
    if (!query || query.length < 2) return;

    // Remove existing entry if present
    this.searchHistory = this.searchHistory.filter(item => item.query !== query);

    // Add to beginning
    this.searchHistory.unshift({
      query,
      timestamp: Date.now()
    });

    // Limit history size
    this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);

    this.saveSearchHistory();
  }

  removeFromSearchHistory(index) {
    this.searchHistory.splice(index, 1);
    this.saveSearchHistory();
  }

  saveSearchHistory() {
    try {
      localStorage.setItem('blog-search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  // Utility methods
  escapeHtml(text) {
    if (!text || typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '日期未知';
    }
  }
}

// Initialize enhanced search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new EnhancedSearch();
});