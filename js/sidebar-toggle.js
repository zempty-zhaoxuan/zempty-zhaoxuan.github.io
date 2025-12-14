// Enhanced Navigation System
// 增强导航系统

// Screen breakpoints - 与 CSS 保持一致
const SCREEN_MD_MIN = 768;
const SCREEN_MD_MAX = 1024;
const SCREEN_LG_MAX = 1199; // 保留，但不再用于移动按钮判定

// DOM elements
const sidebarToggle = document.getElementById("sidebar-toggle");
const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
const wrapper = document.querySelector(".wrapper-content");
const sidebar = document.querySelector(".wrapper-sidebar");
const themeToggle = document.getElementById("theme-toggle");
const homeButton = document.getElementById("home-button");
const navToggle = document.querySelector(".modern-nav-toggle");
const navItems = document.querySelectorAll(".nav-item");

// 检查关键元素是否存在
if (!wrapper || !sidebar) {
  console.error(
    "Essential elements (wrapper-content or wrapper-sidebar) not found"
  );
  // return; // Can't return from top-level script, just stop execution if needed.
} else {
  // Debug switch:
  // - URL: ?debugSidebar=1
  // - localStorage: debug-sidebar-toggle = "1"
  const DEBUG_SIDEBAR_TOGGLE =
    (new URLSearchParams(window.location.search).get("debugSidebar") === "1") ||
    localStorage.getItem("debug-sidebar-toggle") === "1";

  const debugLog = (...args) => {
    if (!DEBUG_SIDEBAR_TOGGLE) return;
    console.log(...args);
  };

  // Icons
  const ICON_DESKTOP_EXPAND = "≡"; // collapsed -> expand
  const ICON_DESKTOP_COLLAPSE = "«"; // expanded -> collapse
  const ICON_TOP_EXPAND = "▼"; // collapsed -> expand
  const ICON_TOP_COLLAPSE = "▲"; // expanded -> collapse

  const normalizeState = (v) => (v === "collapsed" || v === "expanded" ? v : null);
  const getStoredDesktopState = () => normalizeState(localStorage.getItem("sidebar-state"));
  const getStoredTopState = () =>
    normalizeState(localStorage.getItem("mobile-sidebar-state"));

  // Unified state source-of-truth:
  // We keep desktop & top states in sync to avoid confusing “desktop says 折叠 / mobile says 展开”.
  // Defaults:
  // - left layout: expanded
  // - top layout: collapsed (mobile-friendly)
  const getUnifiedStateForLayout = (layout) => {
    const desktop = getStoredDesktopState();
    const top = getStoredTopState();

    if (desktop && top && desktop === top) return desktop;

    if (layout === "top") {
      if (top) return top;
      if (desktop) return desktop;
      return "collapsed";
    }

    // layout === 'left'
    if (desktop) return desktop;
    if (top) return top;
    return "expanded";
  };

  const setUnifiedState = (state) => {
    if (getStoredDesktopState() !== state) {
      localStorage.setItem("sidebar-state", state);
    }
    if (getStoredTopState() !== state) {
      localStorage.setItem("mobile-sidebar-state", state);
    }
  };

  const setToggleButtonState = (btn, { icon, title, ariaLabel, expanded }) => {
    if (!btn) return;
    // Prefer textContent for plain-text icons (safer than innerHTML)
    if (typeof icon === "string" && btn.textContent !== icon) {
      btn.textContent = icon;
    }
    if (title && btn.getAttribute("title") !== title) {
      btn.setAttribute("title", title);
    }
    if (ariaLabel && btn.getAttribute("aria-label") !== ariaLabel) {
      btn.setAttribute("aria-label", ariaLabel);
    }
    if (typeof expanded === "boolean") {
      const v = expanded ? "true" : "false";
      if (btn.getAttribute("aria-expanded") !== v) {
        btn.setAttribute("aria-expanded", v);
      }
    }
  };

  const setDisplayImportant = (el, display) => {
    if (!el) return;
    const current = el.style.getPropertyValue("display");
    const priority = el.style.getPropertyPriority("display");
    if (current === display && priority === "important") return;
    el.style.setProperty("display", display, "important");
  };

  const updateDesktopToggleUI = (isCollapsed) => {
    setToggleButtonState(sidebarToggle, {
      icon: isCollapsed ? ICON_DESKTOP_EXPAND : ICON_DESKTOP_COLLAPSE,
      title: isCollapsed ? "展开侧边栏" : "折叠侧边栏",
      ariaLabel: isCollapsed ? "展开侧边栏" : "折叠侧边栏",
      expanded: !isCollapsed,
    });
  };

  const updateTopToggleUI = (isCollapsed) => {
    setToggleButtonState(mobileSidebarToggle, {
      icon: isCollapsed ? ICON_TOP_EXPAND : ICON_TOP_COLLAPSE,
      title: isCollapsed ? "展开侧边栏" : "折叠侧边栏",
      ariaLabel: isCollapsed ? "展开侧边栏" : "折叠侧边栏",
      expanded: !isCollapsed,
    });
  };

  const showDesktopToggle = () => {
    setDisplayImportant(sidebarToggle, "inline-flex");
    setDisplayImportant(mobileSidebarToggle, "none");
  };

  const showTopToggle = () => {
    setDisplayImportant(sidebarToggle, "none");
    setDisplayImportant(mobileSidebarToggle, "inline-flex");
  };

  const applyDesktopSidebarState = (state) => {
    const isCollapsed = state === "collapsed";
    wrapper.classList.toggle("sidebar-collapsed", isCollapsed);
    sidebar.classList.toggle("collapsed", isCollapsed);
    updateDesktopToggleUI(isCollapsed);
  };

  const applyTopSidebarState = (state) => {
    const isCollapsed = state === "collapsed";
    sidebar.classList.toggle("mobile-collapsed", isCollapsed);
    document.body.classList.toggle("mobile-sidebar-collapsed", isCollapsed);
    updateTopToggleUI(isCollapsed);
  };

  // Track current layout mode
  let layoutMode = null; // 'left' | 'top' | null

  const sidebarArchive = document.querySelector(".sidebar-archive");

  // Media queries used to determine "top sidebar layout"
  const mqTopSmall = window.matchMedia("(max-width: 768px)");
  const mqTopIPadPortrait = window.matchMedia(
    "(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)"
  );

  const getLiveLayoutMode = () => {
    // IMPORTANT: do NOT use `.wrapper-content` left offset as a primary signal.
    // When the desktop sidebar is collapsed, `.wrapper-content.sidebar-collapsed` may move to left=0,
    // which would incorrectly look like "top layout" and break toggle behavior.
    //
    // We rely on the same media queries that control layout, plus a robust computed-style fallback:
    // - Top layout: `.wrapper-sidebar` becomes `position: relative` (or not fixed)
    // - Left layout: `.wrapper-sidebar` is `position: fixed`
    if (mqTopSmall.matches || mqTopIPadPortrait.matches) return "top";

    const pos = window.getComputedStyle(sidebar).position;
    return pos !== "fixed" ? "top" : "left";
  };

  // Initialize: choose state based on current layout, then sync both storages to it
  const initialLayout = getLiveLayoutMode();
  const initialState = getUnifiedStateForLayout(initialLayout);
  setUnifiedState(initialState);
  applyDesktopSidebarState(initialState);
  applyTopSidebarState(initialState);

  // Unified click handler: always operate based on *current* layout (more robust during rotation/resize)
  const toggleSidebar = () => {
    const mode = getLiveLayoutMode();
    layoutMode = mode;

    const isCollapsed =
      mode === "top"
        ? sidebar.classList.contains("mobile-collapsed")
        : wrapper.classList.contains("sidebar-collapsed");

    const nextState = isCollapsed ? "expanded" : "collapsed";
    setUnifiedState(nextState);

    if (mode === "top") {
      // Ensure desktop-only classes don't leak into top layout
      if (wrapper.classList.contains("sidebar-collapsed")) {
        wrapper.classList.remove("sidebar-collapsed");
      }
      if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
      }

      applyTopSidebarState(nextState);
      // Keep hidden desktop button UI in sync for seamless layout switches
      updateDesktopToggleUI(nextState === "collapsed");
    } else {
      // Ensure top-only classes don't leak into left layout
      if (sidebar.classList.contains("mobile-collapsed")) {
        sidebar.classList.remove("mobile-collapsed");
      }
      if (document.body.classList.contains("mobile-sidebar-collapsed")) {
        document.body.classList.remove("mobile-sidebar-collapsed");
      }

      applyDesktopSidebarState(nextState);
      // Keep hidden mobile button UI in sync for seamless layout switches
      updateTopToggleUI(nextState === "collapsed");
    }

    // Trigger layout recalculation (comments/search/etc.)
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  };

  if (sidebarToggle) sidebarToggle.addEventListener("click", toggleSidebar);
  if (mobileSidebarToggle)
    mobileSidebarToggle.addEventListener("click", toggleSidebar);

  // 设置返回首页按钮的提示文字
  if (homeButton) {
    homeButton.setAttribute("title", "返回首页");
  }

  // 主题变化监听，同步更新按钮样式
  const updateButtonsByTheme = function () {
    // 复用主题切换按钮的样式逻辑
    if (document.body.classList.contains("dark-theme")) {
      // 深色主题
      if (sidebarToggle) sidebarToggle.classList.add("dark-theme");
      if (mobileSidebarToggle) mobileSidebarToggle.classList.add("dark-theme");
      if (homeButton) homeButton.classList.add("dark-theme");
    } else {
      // 浅色主题
      if (sidebarToggle) sidebarToggle.classList.remove("dark-theme");
      if (mobileSidebarToggle) mobileSidebarToggle.classList.remove("dark-theme");
      if (homeButton) homeButton.classList.remove("dark-theme");
    }
  };

  // 初始运行一次以设置初始状态
  updateButtonsByTheme();

  // 监听主题切换事件
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      // 主题切换后稍微延迟更新按钮样式
      setTimeout(updateButtonsByTheme, 50);
    });
  }

  // 响应式处理
  const handleResize = function () {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    // 检测iPad Pro和中等尺寸屏幕
    const isIPadPro = windowWidth >= SCREEN_MD_MIN && windowWidth <= SCREEN_MD_MAX;
    const isMediumScreen = windowWidth > SCREEN_MD_MAX && windowWidth <= SCREEN_LG_MAX;
    const isPortrait = windowHeight > windowWidth;
    // 检测iPhone横屏 (通常宽度在800-950px之间，高度较小)
    const isIPhoneLandscape = windowWidth >= 800 && windowWidth <= 950 && windowHeight <= 500;
    // 检测iPad Pro竖屏
    const isIPadProPortrait = isIPadPro && isPortrait;
    
    // 根据真实布局判断（iPad 重点修复）：
    // - 小屏（<=768）：CSS 会把侧边栏切到顶部布局
    // - iPad 竖屏（768-1024 portrait）：CSS 也会把侧边栏切到顶部布局
    // 这些场景优先用 matchMedia 判定最稳定，避免“旋转/逐渐缩放”时测量值不稳定导致按钮不切换。
    const isTopSidebarLayout =
      mqTopSmall.matches ||
      mqTopIPadPortrait.matches ||
      window.getComputedStyle(sidebar).position !== "fixed";

    // 调试信息 (可在控制台查看)
    debugLog(
      `Screen: ${windowWidth}x${windowHeight}, sidebarPos: ${window.getComputedStyle(sidebar).position}, topLayout: ${isTopSidebarLayout}, mqTopSmall: ${mqTopSmall.matches}, mqIPadPortrait: ${mqTopIPadPortrait.matches}, iPad Pro: ${isIPadPro}, iPad Pro Portrait: ${isIPadProPortrait}, Medium: ${isMediumScreen}, Portrait: ${isPortrait}, iPhone Landscape: ${isIPhoneLandscape}`
    );
    
    // 处理文章归档日历显示
    if (sidebarArchive) {
      // 移动设备上完全隐藏文章归档日历
      if (windowWidth <= SCREEN_LG_MAX) {
        sidebarArchive.style.display = "none";
      } 
      // 大屏幕显示
      else {
        sidebarArchive.style.display = "block";
      }
    }

    // 只看“真实布局”来决定按钮形态：
    // - 侧边栏在上方（接近全宽）=> 上下折叠按钮
    // - 侧边栏在左侧（宽度明显较小）=> 左右折叠按钮
    // 这样即使窗口变窄但侧边栏仍在左侧，也不会误用上下折叠按钮。
    const shouldUseMobileToggle = isTopSidebarLayout;
    const unifiedState = getUnifiedStateForLayout(shouldUseMobileToggle ? "top" : "left");
    // Keep desktop & top storages in sync (prevents cross-layout confusion)
    setUnifiedState(unifiedState);

    if (shouldUseMobileToggle) {
      // Avoid redundant DOM writes when already in top layout
      if (layoutMode !== "top") {
        layoutMode = "top";
        showTopToggle();
      }

      // Top-layout：移除桌面折叠 class（避免影响顶部布局视觉），但保留 localStorage 中的桌面状态
      if (wrapper.classList.contains("sidebar-collapsed")) {
        wrapper.classList.remove("sidebar-collapsed");
      }
      if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
      }

      // Apply unified state in top layout
      applyTopSidebarState(unifiedState);
      // Keep hidden desktop button UI in sync
      updateDesktopToggleUI(unifiedState === "collapsed");

      debugLog("使用顶部布局按钮 (上下折叠)");
    } else {
      if (layoutMode !== "left") {
        layoutMode = "left";
        showDesktopToggle();
      }

      // Left-layout：移除顶部折叠状态（不影响桌面布局），但保留 localStorage 中的顶部状态
      if (sidebar.classList.contains("mobile-collapsed")) {
        sidebar.classList.remove("mobile-collapsed");
      }
      if (document.body.classList.contains("mobile-sidebar-collapsed")) {
        document.body.classList.remove("mobile-sidebar-collapsed");
      }

      // Apply unified state in left layout
      applyDesktopSidebarState(unifiedState);
      // Keep hidden mobile button UI in sync
      updateTopToggleUI(unifiedState === "collapsed");

      debugLog("使用左侧布局按钮 (左右折叠)");
    }
  };

  // 统一调度：iPad 旋转时有时会先触发 resize，再应用媒体查询样式。
  // 这里做一次轻量防抖：立即跑一遍 + 过一小段时间再跑一遍，确保按钮/图标最终一致。
  let resizeTimer = null;
  let resizeRaf = 0;
  const scheduleLayoutSync = () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      handleResize();
    });
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 160);
  };

  const addMediaQueryListener = (mq, listener) => {
    if (!mq) return;
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", listener);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(listener);
    }
  };

  // 监听窗口大小变化 / 方向变化（iPad 关键）
  window.addEventListener("resize", scheduleLayoutSync);
  window.addEventListener("orientationchange", scheduleLayoutSync);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleLayoutSync);
  }

  // 监听媒体查询变化（尤其是 iPad 竖屏那条规则）
  addMediaQueryListener(mqTopSmall, scheduleLayoutSync);
  addMediaQueryListener(mqTopIPadPortrait, scheduleLayoutSync);

  // 初始化时运行一次（使用调度版本，避免初始媒体查询尚未稳定）
  scheduleLayoutSync();

  // CSS 加载完成/页面 load 后再同步一次，避免首次进入就处于 iPad 竖屏时图标未切换
  window.addEventListener("load", scheduleLayoutSync, { once: true });
  document.addEventListener("cssLoaded", () => setTimeout(scheduleLayoutSync, 0));

  // Enhanced Navigation Features
  initializeEnhancedNavigation();
}

// Enhanced Navigation System Functions
function initializeEnhancedNavigation() {
  // Smooth scroll navigation
  initializeSmoothScroll();
  
  // Active state highlighting
  initializeActiveStateHighlighting();
  
  // Mobile hamburger menu
  initializeMobileMenu();
  
  // Keyboard navigation
  initializeKeyboardNavigation();
}

// Smooth scroll for navigation links
function initializeSmoothScroll() {
  const navLinks = document.querySelectorAll('nav a[href^="#"], .nav-item[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Only handle hash links
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          
          // Smooth scroll to target
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without jumping
          history.pushState(null, null, href);
          
          // Close mobile menu if open
          closeMobileMenu();
        }
      }
    });
  });
}

// Active state highlighting based on scroll position
function initializeActiveStateHighlighting() {
  const sections = document.querySelectorAll('section[id], article[id], .post[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"], .nav-item[href^="#"]');
  
  if (sections.length === 0 || navLinks.length === 0) return;
  
  function updateActiveStates() {
    let currentSection = '';
    const scrollPosition = window.scrollY + 100; // Offset for better UX
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });
    
    // Update nav link active states
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        
        if (targetId === currentSection) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }
  
  // Throttled scroll listener for performance
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(updateActiveStates, 10);
  });
  
  // Initial check
  updateActiveStates();
}

// Mobile hamburger menu functionality
function initializeMobileMenu() {
  if (!navToggle) return;
  
  navToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    sidebar.classList.toggle('mobile-menu-open');
    document.body.classList.toggle('mobile-menu-open');
    
    // Prevent body scroll when menu is open
    if (sidebar.classList.contains('mobile-menu-open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!sidebar.contains(e.target) && !navToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  if (navToggle) {
    navToggle.classList.remove('active');
  }
  if (sidebar) {
    sidebar.classList.remove('mobile-menu-open');
  }
  document.body.classList.remove('mobile-menu-open');
  document.body.style.overflow = '';
}

// Keyboard navigation support
function initializeKeyboardNavigation() {
  navItems.forEach((item, index) => {
    item.addEventListener('keydown', function(e) {
      let targetIndex;
      
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          targetIndex = (index + 1) % navItems.length;
          navItems[targetIndex].focus();
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          targetIndex = (index - 1 + navItems.length) % navItems.length;
          navItems[targetIndex].focus();
          break;
          
        case 'Home':
          e.preventDefault();
          navItems[0].focus();
          break;
          
        case 'End':
          e.preventDefault();
          navItems[navItems.length - 1].focus();
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          item.click();
          break;
      }
    });
  });
}

// });
