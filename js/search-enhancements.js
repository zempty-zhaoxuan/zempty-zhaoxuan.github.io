/**
 * Search Enhancements for Jekyll Blog
 * Adds support for tag-based searching and improved search functionality
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Override the search functionality after SimpleJekyllSearch is initialized
    setTimeout(function() {
      enhanceSearch();
    }, 200);
  });

  function enhanceSearch() {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    
    if (!searchInput || !resultsContainer) {
      console.error('Search elements not found');
      return;
    }

    // Store original search data
    let searchData = [];
    
    // Load search data
    const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';
    fetch(baseUrl + '/search.json')
      .then(response => response.json())
      .then(data => {
        searchData = data;
        console.log('Search data loaded:', searchData.length, 'posts');
      })
      .catch(error => {
        console.error('Failed to load search data:', error);
      });

    // Enhanced search function
    function performEnhancedSearch(query) {
      if (!query || query.trim() === '') {
        resultsContainer.innerHTML = '';
        return;
      }

      const searchTerms = query.toLowerCase().trim().split(/\s+/);
      const results = [];

      // Search through all posts
      searchData.forEach(post => {
        let score = 0;
        let matchedTerms = [];

        searchTerms.forEach(term => {
          // Check title (highest priority)
          if (post.title && post.title.toLowerCase().includes(term)) {
            score += 10;
            matchedTerms.push({term: term, field: 'title'});
          }

          // Check tags (high priority for tag searches)
          if (post.tags) {
            const tags = post.tags.toLowerCase().split(', ');
            tags.forEach(tag => {
              if (tag === term) {
                // Exact tag match - highest score
                score += 15;
                matchedTerms.push({term: term, field: 'tag-exact'});
              } else if (tag.includes(term)) {
                // Partial tag match
                score += 8;
                matchedTerms.push({term: term, field: 'tag-partial'});
              }
            });
          }

          // Check excerpt (lower priority)
          if (post.excerpt && post.excerpt.toLowerCase().includes(term)) {
            score += 3;
            matchedTerms.push({term: term, field: 'excerpt'});
          }

          // Check date
          if (post.date && post.date.includes(term)) {
            score += 2;
            matchedTerms.push({term: term, field: 'date'});
          }
        });

        // Only include posts that match at least one search term
        if (score > 0) {
          results.push({
            post: post,
            score: score,
            matchedTerms: matchedTerms
          });
        }
      });

      // Sort results by score (highest first)
      results.sort((a, b) => b.score - a.score);

      // Display results
      displayEnhancedResults(results, query);
    }

    function displayEnhancedResults(results, query) {
      if (results.length === 0) {
        resultsContainer.innerHTML = 
          '<div class="no-results">' +
          '<div class="no-results-icon">🔍</div>' +
          '<div class="no-results-title">没有找到匹配结果</div>' +
          '<div class="no-results-suggestion">请尝试其他关键词或检查拼写</div>' +
          '</div>';
        return;
      }

      let html = '';
      const limit = 10; // Show top 10 results

      results.slice(0, limit).forEach(result => {
        const post = result.post;
        
        // Highlight matched terms in title
        let highlightedTitle = escapeHtml(post.title);
        result.matchedTerms.forEach(match => {
          if (match.field === 'title') {
            const regex = new RegExp(`(${escapeRegExp(match.term)})`, 'gi');
            highlightedTitle = highlightedTitle.replace(regex, '<mark>$1</mark>');
          }
        });

        // Highlight matched terms in excerpt
        let highlightedExcerpt = escapeHtml(post.excerpt || '');
        result.matchedTerms.forEach(match => {
          if (match.field === 'excerpt') {
            const regex = new RegExp(`(${escapeRegExp(match.term)})`, 'gi');
            highlightedExcerpt = highlightedExcerpt.replace(regex, '<mark>$1</mark>');
          }
        });

        // Build tags HTML with highlighting
        let tagsHtml = '';
        if (post.tags) {
          const tags = post.tags.split(', ');
          tagsHtml = '<div class="search-result-tags">';
          tags.forEach(tag => {
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
          `<a href="${post.url}" class="result-title">${highlightedTitle}</a>` +
          `<div class="result-meta">` +
          `<span class="result-date">${post.date}</span>` +
          `<span class="result-score" title="相关度分数: ${result.score}">相关度: ${getRelevanceLabel(result.score)}</span>` +
          `</div>` +
          tagsHtml +
          `<div class="result-excerpt">${highlightedExcerpt}</div>` +
          `</div>`;
      });

      resultsContainer.innerHTML = html;

      // Add click handlers for the entire result item
      document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function(e) {
          // Don't navigate if clicking on a link (let the link handle it)
          if (e.target.tagName === 'A') return;
          
          const url = this.getAttribute('data-url');
          if (url) {
            window.location.href = url;
          }
        });
      });
    }

    function getRelevanceLabel(score) {
      if (score >= 15) return '⭐⭐⭐ 非常相关';
      if (score >= 10) return '⭐⭐ 相关';
      return '⭐ 部分相关';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Override the search input handler
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    let searchTimeout;
    newSearchInput.addEventListener('input', function() {
      const query = this.value.trim();
      
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (query) {
        // Show loading state
        resultsContainer.innerHTML = 
          '<div class="search-loading">' +
          '<div class="loading-spinner"></div>' +
          '<div>正在搜索...</div>' +
          '</div>';
        resultsContainer.classList.add('show');

        // Perform search with slight delay
        searchTimeout = setTimeout(() => {
          performEnhancedSearch(query);
        }, 300);
      } else {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('show');
      }
    });

    // Add search tips
    const searchContainer = document.querySelector('.modern-search-container');
    if (searchContainer) {
      const tipsHtml = 
        '<div class="search-tips">' +
        '<div class="search-tip">💡 提示：直接输入标签名称可以精确搜索相关文章</div>' +
        '</div>';
      
      searchContainer.insertAdjacentHTML('afterbegin', tipsHtml);
    }

    console.log('Enhanced search initialized');
  }
})(); 