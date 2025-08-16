// 现代化搜索功能
// Modern Search Functionality for Homepage and Sidebar

class ModernSearch {
  constructor() {
    this.homepageSearch = {
      input: document.getElementById("search-input"),
      results: document.getElementById("results-container")
    };

    this.sidebarSearch = {
      input: document.getElementById("sidebar-search-input"),
      results: document.getElementById("sidebar-search-results")
    };

    this.posts = [];
    this.isInitialized = false;

    this.init();
  }

  async init() {
    if (this.isInitialized) return;

    try {
      this.bindEvents();
      this.isInitialized = true;
      console.log("Modern search initialized successfully");
    } catch (error) {
      console.error("Failed to initialize modern search:", error);
    }
  }

  async loadPosts() {
    try {
      const base = document.querySelector('meta[name="base-url"]').getAttribute('content') || '';
      const response = await fetch(`${base}/search.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.posts = await response.json();
      console.log(`Loaded ${this.posts.length} posts for search`);
    } catch (error) {
      console.error("Error loading posts:", error);
      throw error;
    }
  }

  bindEvents() {
    // 绑定首页搜索事件
    if (this.homepageSearch.input && this.homepageSearch.results) {
      this.bindSearchEvents(this.homepageSearch, "homepage");
      this.bindClearButton(this.homepageSearch);
    }

    // 绑定侧边栏搜索事件
    if (this.sidebarSearch.input && this.sidebarSearch.results) {
      this.bindSearchEvents(this.sidebarSearch, "sidebar");
    }

    // 绑定全局键盘快捷键
    document.addEventListener("keydown", (e) => {
      // Ctrl+K 或 Cmd+K 激活搜索
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();

        // 智能选择搜索框
        const targetSearchInput = this.getTargetSearchInput();
        if (targetSearchInput) {
          targetSearchInput.focus();
          targetSearchInput.select();
        }
      }
    });

    // 点击外部区域隐藏结果
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".modern-search-container") &&
        !e.target.closest(".sidebar-search")
      ) {
        this.hideResults(this.homepageSearch);
        this.hideResults(this.sidebarSearch);
      }
    });
  }

  bindClearButton(searchObj) {
    const clearButton = document.getElementById("search-clear");
    if (!clearButton) return;

    // 监听输入变化，显示/隐藏清除按钮
    searchObj.input.addEventListener("input", () => {
      if (searchObj.input.value.trim()) {
        clearButton.classList.add("show");
      } else {
        clearButton.classList.remove("show");
      }
    });

    // 点击清除按钮
    clearButton.addEventListener("click", () => {
      searchObj.input.value = "";
      clearButton.classList.remove("show");
      this.hideResults(searchObj);
      searchObj.input.focus();
    });
  }

  bindSearchEvents(searchObj, type) {
    // 输入框事件
    searchObj.input.addEventListener(
             "input",
       this.debounce(async (e) => {
         const query = e.target.value.trim();
         if (query.length >= 1) {
           if (!this.posts.length) {
             await this.loadPosts();
           }
           this.performSearch(query, searchObj, type);
         } else {
           this.hideResults(searchObj);
         }
       }, 300)
     );

    // 回车键搜索
    searchObj.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = searchObj.input.value.trim();
        if (query.length >= 1) {
          if (!this.posts.length) {
            this.loadPosts().then(() => this.performSearch(query, searchObj, type));
          } else {
            this.performSearch(query, searchObj, type);
          }
        }
      }

      // ESC键清空搜索
      if (e.key === "Escape") {
        this.clearSearch(searchObj);
      }
    });

    // 焦点事件 - 当搜索框获得焦点时，如果有内容且有结果，显示结果
    searchObj.input.addEventListener("focus", () => {
      if (
        searchObj.input.value.trim() &&
        searchObj.results.innerHTML &&
        !searchObj.results.innerHTML.includes("search-loading")
      ) {
        this.showResults(searchObj);
      }
    });
  }

  async performSearch(query, searchObj, type) {
    if (!this.posts.length) {
      await this.loadPosts();
    }

    const results = this.searchPosts(query, type);
    this.displayResults(results, query, searchObj, type);
  }

  searchPosts(query, type) {
    const searchTerm = query.toLowerCase();
    const results = [];

    this.posts.forEach((post) => {
      let score = 0;
      let matchedFields = [];

      // 标题匹配（权重最高）
      if (post.title && post.title.toLowerCase().includes(searchTerm)) {
        score += 10;
        matchedFields.push("title");
      }

      // 标签匹配
      if (
        post.tags &&
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      ) {
        score += 5;
        matchedFields.push("tags");
      }

      // 内容匹配
      if (post.content && post.content.toLowerCase().includes(searchTerm)) {
        score += 2;
        matchedFields.push("content");
      }

      // URL匹配
      if (post.url && post.url.toLowerCase().includes(searchTerm)) {
        score += 1;
        matchedFields.push("url");
      }

      if (score > 0) {
        results.push({
          ...post,
          score,
          matchedFields
        });
      }
    });

    // 按分数排序，侧边栏显示更少结果
    const limit = type === "sidebar" ? 8 : 10;
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  displayResults(results, query, searchObj, type) {
    if (results.length === 0) {
      const isSidebar = type === "sidebar";
      searchObj.results.innerHTML = `
        <div class="search-no-results">
          <p>😕 没有找到包含 "<strong>${this.escapeHtml(
            query
          )}</strong>" 的文章</p>
          ${
            !isSidebar
              ? '<p class="search-tip">试试其他关键词或者检查拼写</p>'
              : ""
          }
        </div>
      `;
    } else {
      const resultsHtml = results
        .map((post) => this.createResultItem(post, query, type))
        .join("");
      searchObj.results.innerHTML = `
        <div class="search-results-header">
          <span>找到 ${results.length} 篇相关文章</span>
        </div>
        ${resultsHtml}
      `;
    }

    this.showResults(searchObj);
  }

  createResultItem(post, query, type) {
    const highlightedTitle = this.highlightText(post.title, query);
    const excerptLength = type === "sidebar" ? 100 : 150;
    const excerpt = this.createExcerpt(post.content, query, excerptLength);
    const date = new Date(post.date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    // 侧边栏搜索结果更紧凑
    if (type === "sidebar") {
      return `
        <div class="search-result-item sidebar-result" data-score="${post.score}">
          <div class="search-result-content">
            <h4 class="search-result-title">
              <a href="${post.url}">${highlightedTitle}</a>
            </h4>
            <p class="search-result-excerpt">${excerpt}</p>
            <div class="search-result-meta">
              <span class="search-result-date">📅 ${date}</span>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="search-result-item" data-score="${post.score}">
        <div class="search-result-content">
          <h3 class="search-result-title">
            <a href="${post.url}">${highlightedTitle}</a>
          </h3>
          <p class="search-result-excerpt">${excerpt}</p>
          <div class="search-result-meta">
            <span class="search-result-date">📅 ${date}</span>
            ${
              post.tags
                ? `<span class="search-result-tags">${this.formatTags(
                    post.tags
                  )}</span>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
  }

  createExcerpt(content, query, maxLength = 150) {
    if (!content) return "";

    const searchTerm = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(searchTerm);

    let excerpt = "";
    if (index !== -1) {
      // 找到关键词，以关键词为中心创建摘要
      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + 100);
      excerpt = content.slice(start, end);
      if (start > 0) excerpt = "..." + excerpt;
      if (end < content.length) excerpt = excerpt + "...";
    } else {
      // 没找到关键词，使用开头部分
      excerpt = content.slice(0, maxLength);
      if (content.length > maxLength) excerpt += "...";
    }

    return this.highlightText(excerpt, query);
  }

  highlightText(text, query) {
    if (!text || !query) return text;
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, "gi");
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  formatTags(tags) {
    if (!tags || !Array.isArray(tags)) return "";
    return tags
      .slice(0, 3)
      .map((tag) => `<span class="search-tag">${this.escapeHtml(tag)}</span>`)
      .join("");
  }

  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  showResults(searchObj) {
    searchObj.results.style.display = "block";
    searchObj.results.classList.add("show", "active");
  }

  hideResults(searchObj) {
    if (searchObj && searchObj.results) {
      searchObj.results.style.display = "none";
      searchObj.results.classList.remove("show", "active");
    }
  }

  clearSearch(searchObj) {
    searchObj.input.value = "";
    this.hideResults(searchObj);

    // 隐藏清除按钮
    const clearButton = document.getElementById("search-clear");
    if (clearButton) {
      clearButton.classList.remove("show");
    }
  }

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

  // 智能选择目标搜索框
  getTargetSearchInput() {
    // 1. 首先检查是否在首页且首页搜索框可用
    if (this.homepageSearch.input && this.isHomepageSearchVisible()) {
      return this.homepageSearch.input;
    }

    // 2. 检查侧边栏搜索是否可用且侧边栏展开
    if (this.sidebarSearch.input && this.isSidebarSearchAccessible()) {
      return this.sidebarSearch.input;
    }

    // 3. 如果侧边栏折叠但搜索框存在，优先展开侧边栏然后激活搜索
    if (this.sidebarSearch.input && this.isSidebarCollapsed()) {
      this.expandSidebarForSearch();
      return this.sidebarSearch.input;
    }

    // 4. 最后的回退选项：返回任何可用的搜索框
    return this.homepageSearch.input || this.sidebarSearch.input;
  }

  // 检查首页搜索是否可见
  isHomepageSearchVisible() {
    if (!this.homepageSearch.input) return false;

    // 检查搜索框是否在视图中且可见
    const searchContainer = this.homepageSearch.input.closest(
      ".modern-search-container"
    );
    if (!searchContainer) return false;

    const style = window.getComputedStyle(searchContainer);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  // 检查侧边栏搜索是否可访问
  isSidebarSearchAccessible() {
    if (!this.sidebarSearch.input) return false;

    const sidebar = document.querySelector(".wrapper-sidebar");
    if (!sidebar) return false;

    // 检查侧边栏是否展开（桌面端和移动端）
    const isDesktopCollapsed = sidebar.classList.contains("collapsed");
    const isMobileCollapsed = sidebar.classList.contains("mobile-collapsed");

    return !isDesktopCollapsed && !isMobileCollapsed;
  }

  // 检查侧边栏是否折叠
  isSidebarCollapsed() {
    const sidebar = document.querySelector(".wrapper-sidebar");
    if (!sidebar) return false;

    return (
      sidebar.classList.contains("collapsed") ||
      sidebar.classList.contains("mobile-collapsed")
    );
  }

  // 为搜索展开侧边栏
  expandSidebarForSearch() {
    const sidebar = document.querySelector(".wrapper-sidebar");
    const wrapper = document.querySelector(".wrapper-content");

    if (!sidebar) return;

    // 检查屏幕大小以决定使用哪种切换方式
    const isMobileSize = window.innerWidth <= 1200;

    if (isMobileSize) {
      // 移动端：使用垂直切换
      if (sidebar.classList.contains("mobile-collapsed")) {
        sidebar.classList.remove("mobile-collapsed");
        document.body.classList.remove("mobile-sidebar-collapsed");

        // 更新移动端按钮状态
        const mobileSidebarToggle = document.getElementById(
          "mobile-sidebar-toggle"
        );
        if (mobileSidebarToggle) {
          mobileSidebarToggle.innerHTML = "▲";
          mobileSidebarToggle.setAttribute("title", "折叠侧边栏");
        }

        localStorage.setItem("mobile-sidebar-state", "expanded");
      }
    } else {
      // 桌面端：使用水平切换
      if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
        if (wrapper) wrapper.classList.remove("sidebar-collapsed");

        // 更新桌面端按钮状态
        const sidebarToggle = document.getElementById("sidebar-toggle");
        if (sidebarToggle) {
          sidebarToggle.innerHTML = "«";
          sidebarToggle.setAttribute("title", "折叠侧边栏");
        }

        localStorage.setItem("sidebar-state", "expanded");
      }
    }
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
document.addEventListener("DOMContentLoaded", () => {
  // 添加样式
  document.head.insertAdjacentHTML("beforeend", searchStyles);

  // 初始化搜索
  new ModernSearch();
});
