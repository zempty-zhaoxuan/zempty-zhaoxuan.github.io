/**
 * Search Enhancements for Jekyll Blog
 * 简化版搜索功能，避免冲突
 */

(function() {
  'use strict';

  // 确保只初始化一次
  if (window.searchEnhancementsLoaded) {
    return;
  }
  window.searchEnhancementsLoaded = true;

  // 等待DOM加载完成
  document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
  });

  function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    const searchClear = document.getElementById('search-clear');
    
    // 检查必要元素是否存在
    if (!searchInput || !resultsContainer) {
      console.log('搜索元素未找到，跳过初始化');
      return;
    }
    
    console.log('开始初始化搜索功能...');

    // 搜索数据
    let searchData = [];
    let isLoading = false;
    
    // 加载搜索数据
    loadSearchData();

    function loadSearchData() {
      if (isLoading) return;
      isLoading = true;
      
      const baseUrl = window.location.origin;
      console.log('加载搜索数据...');
      
      fetch(`${baseUrl}/search.json`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          searchData = data;
          console.log('搜索数据加载成功:', searchData.length, '篇文章');
          console.log('第一篇文章示例:', searchData[0]);
          isLoading = false;
          bindSearchEvents();
        })
        .catch(error => {
          console.error('搜索数据加载失败:', error);
          isLoading = false;
        });
    }

    function bindSearchEvents() {
      let searchTimeout;
      
      // 绑定搜索输入事件
      searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        console.log('搜索查询:', query);
        
        // 清除之前的定时器
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }

        if (query) {
          // 显示加载状态
          showLoading();
          
          // 延迟执行搜索
          searchTimeout = setTimeout(() => {
            performSearch(query);
          }, 300);
        } else {
          // 清空结果
          hideResults();
        }
      });

      // 绑定清除按钮事件
      if (searchClear) {
        searchInput.addEventListener('input', function() {
          if (this.value.trim()) {
            searchClear.classList.add('show');
          } else {
            searchClear.classList.remove('show');
          }
        });
        
        searchClear.addEventListener('click', function() {
          searchInput.value = '';
          searchClear.classList.remove('show');
          hideResults();
          searchInput.focus();
        });
      }
      
      // 绑定键盘快捷键
      document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
        
        if (e.key === 'Escape' && document.activeElement === searchInput) {
          searchInput.blur();
          hideResults();
        }
      });
      
      // 绑定焦点事件
      searchInput.addEventListener('focus', function() {
        if (this.value.trim() && resultsContainer.innerHTML && !resultsContainer.innerHTML.includes('search-loading')) {
          resultsContainer.classList.add('show');
        }
      });
      
      // 点击外部隐藏结果
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.modern-search-container')) {
          hideResults();
        }
      });
      
      console.log('搜索事件绑定完成');
    }

    function showLoading() {
      resultsContainer.innerHTML = 
        '<div class="search-loading">' +
        '<div class="loading-spinner"></div>' +
        '<div>正在搜索...</div>' +
        '</div>';
      resultsContainer.classList.add('show');
    }

    function hideResults() {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.remove('show');
    }

    function performSearch(query) {
      console.log('执行搜索:', query);
      
      if (!searchData || searchData.length === 0) {
        console.error('搜索数据未加载');
        return;
      }

      const searchTerms = query.toLowerCase().trim().split(/\s+/);
      const results = [];

      // 搜索逻辑
      searchData.forEach((post, index) => {
        let score = 0;
        let matchedTerms = [];

        searchTerms.forEach(term => {
          // 标题匹配（最高优先级）
          if (post.title && post.title.toLowerCase().includes(term)) {
            score += 10;
            matchedTerms.push({term: term, field: 'title'});
            console.log(`匹配标题: "${post.title}" 包含 "${term}"`);
          }

          // 标签匹配 - 改进处理逻辑
          if (post.tags) {
            let tagsArray = [];
            
            // 处理不同的标签格式
            if (Array.isArray(post.tags)) {
              tagsArray = post.tags;
            } else if (typeof post.tags === 'string') {
              // 尝试不同的分隔符
              tagsArray = post.tags.split(/[,，]/).map(tag => tag.trim());
            }
            
            tagsArray.forEach(tag => {
              const tagLower = tag.toLowerCase();
              if (tagLower === term) {
                score += 15; // 精确匹配
                matchedTerms.push({term: term, field: 'tag-exact'});
                console.log(`精确匹配标签: "${tag}" === "${term}"`);
              } else if (tagLower.includes(term)) {
                score += 8; // 部分匹配
                matchedTerms.push({term: term, field: 'tag-partial'});
                console.log(`部分匹配标签: "${tag}" 包含 "${term}"`);
              }
            });
          }

          // 摘要匹配
          if (post.excerpt && post.excerpt.toLowerCase().includes(term)) {
            score += 3;
            matchedTerms.push({term: term, field: 'excerpt'});
            console.log(`匹配摘要: 包含 "${term}"`);
          }

          // 内容匹配
          if (post.content && post.content.toLowerCase().includes(term)) {
            score += 2;
            matchedTerms.push({term: term, field: 'content'});
            console.log(`匹配内容: 包含 "${term}"`);
          }

          // 日期匹配
          if (post.date && post.date.includes(term)) {
            score += 2;
            matchedTerms.push({term: term, field: 'date'});
            console.log(`匹配日期: "${post.date}" 包含 "${term}"`);
          }

          // URL匹配
          if (post.url && post.url.toLowerCase().includes(term)) {
            score += 1;
            matchedTerms.push({term: term, field: 'url'});
            console.log(`匹配URL: "${post.url}" 包含 "${term}"`);
          }
        });

        if (score > 0) {
          results.push({
            post: post,
            score: score,
            matchedTerms: matchedTerms
          });
          console.log(`文章 "${post.title}" 总分: ${score}`);
        }
      });

      // 按分数排序
      results.sort((a, b) => b.score - a.score);
      console.log('搜索结果:', results.length, '条');

      // 显示结果
      displayResults(results, query);
    }

    function displayResults(results, query) {
      if (results.length === 0) {
        resultsContainer.innerHTML = 
          '<div class="no-results">' +
          '<div class="no-results-icon">🔍</div>' +
          '<div class="no-results-title">没有找到匹配结果</div>' +
          '<div class="no-results-suggestion">请尝试其他关键词或检查拼写</div>' +
          '</div>';
        resultsContainer.classList.add('show');
        return;
      }

      let html = '';
      const limit = 10;

      results.slice(0, limit).forEach(result => {
        const post = result.post;
        
        // 高亮标题
        let highlightedTitle = escapeHtml(post.title);
        result.matchedTerms.forEach(match => {
          if (match.field === 'title') {
            const regex = new RegExp(`(${escapeRegExp(match.term)})`, 'gi');
            highlightedTitle = highlightedTitle.replace(regex, '<mark>$1</mark>');
          }
        });

        // 高亮摘要
        let highlightedExcerpt = escapeHtml(post.excerpt || '');
        result.matchedTerms.forEach(match => {
          if (match.field === 'excerpt') {
            const regex = new RegExp(`(${escapeRegExp(match.term)})`, 'gi');
            highlightedExcerpt = highlightedExcerpt.replace(regex, '<mark>$1</mark>');
          }
        });

        // 标签HTML
        let tagsHtml = '';
        if (post.tags) {
          let tagsArray = [];
          
          // 处理不同的标签格式
          if (Array.isArray(post.tags)) {
            tagsArray = post.tags;
          } else if (typeof post.tags === 'string') {
            tagsArray = post.tags.split(/[,，]/).map(tag => tag.trim());
          }
          
          tagsHtml = '<div class="search-result-tags">';
          tagsArray.forEach(tag => {
            let isMatched = false;
            result.matchedTerms.forEach(match => {
              if ((match.field === 'tag-exact' || match.field === 'tag-partial') && 
                  tag.toLowerCase().includes(match.term)) {
                isMatched = true;
              }
            });
            tagsHtml += `<span class="search-tag${isMatched ? ' matched' : ''}">${escapeHtml(tag)}</span>`;
          });
          tagsHtml += '</div>';
        }

        html += 
          `<div class="search-result-item enhanced" data-url="${post.url}">` +
          `<div class="result-header">` +
          `<h3 class="result-title">` +
          `<a href="${post.url}">${highlightedTitle}</a>` +
          `</h3>` +
          `<div class="result-meta">` +
          `<span class="result-date">📅 ${post.date}</span>` +
          `<span class="result-score">${getRelevanceLabel(result.score)}</span>` +
          `</div>` +
          `</div>` +
          `<div class="result-content">` +
          `<p class="result-excerpt">${highlightedExcerpt}</p>` +
          tagsHtml +
          `</div>` +
          `</div>`;
      });

      resultsContainer.innerHTML = html;
      resultsContainer.classList.add('show');

      // 为搜索结果添加点击事件
      document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function(e) {
          if (e.target.tagName === 'A') return;
          
          const url = this.getAttribute('data-url');
          if (url) {
            window.location.href = url;
          }
        });
      });
    }

    function getRelevanceLabel(score) {
      if (score >= 15) return '高度匹配';
      if (score >= 10) return '相关';
      return '部分匹配';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
})(); 