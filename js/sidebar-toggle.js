document.addEventListener("DOMContentLoaded", function () {
  const SCREEN_SM = 768; // Small screens and below
  const SCREEN_MD_MIN = 768; // Medium screen (iPad) min-width
  const SCREEN_MD_MAX = 1024; // Medium screen (iPad) max-width
  const SCREEN_LG_MAX = 1200; // Large screen max-width for mobile-style sidebar

  const sidebarToggle = document.getElementById("sidebar-toggle");
  const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
  const wrapper = document.querySelector(".wrapper-content");
  const sidebar = document.querySelector(".wrapper-sidebar");
  const themeToggle = document.getElementById("theme-toggle");
  const homeButton = document.getElementById("home-button");
  
  // 检查关键元素是否存在
  if (!wrapper || !sidebar) {
    console.error("Essential elements (wrapper-content or wrapper-sidebar) not found");
    return;
  }
  const currentState = localStorage.getItem("sidebar-state");
  const mobileSidebarState = localStorage.getItem("mobile-sidebar-state");
  const sidebarArchive = document.querySelector(".sidebar-archive");

  // 桌面版侧边栏状态应用
  if (sidebarToggle) {
    if (currentState === "collapsed") {
      wrapper.classList.add("sidebar-collapsed");
      sidebar.classList.add("collapsed");
      sidebarToggle.innerHTML = "≡";
      sidebarToggle.setAttribute("title", "展开侧边栏");
    } else {
      sidebarToggle.innerHTML = "«";
      sidebarToggle.setAttribute("title", "折叠侧边栏");
    }
  }

  // 移动版侧边栏状态应用
  if (mobileSidebarToggle) {
    if (mobileSidebarState === "collapsed") {
              sidebar.classList.add("mobile-collapsed");
        document.body.classList.add("mobile-sidebar-collapsed");
        if (mobileSidebarToggle) mobileSidebarToggle.innerHTML = "▼";
      mobileSidebarToggle.setAttribute("title", "展开侧边栏");
    } else {
      mobileSidebarToggle.innerHTML = "▲";
      mobileSidebarToggle.setAttribute("title", "折叠侧边栏");
    }
  }

  // 桌面版切换侧边栏状态
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      wrapper.classList.toggle("sidebar-collapsed");
      sidebar.classList.toggle("collapsed");

      if (wrapper.classList.contains("sidebar-collapsed")) {
        localStorage.setItem("sidebar-state", "collapsed");
        sidebarToggle.setAttribute("title", "展开侧边栏");
        sidebarToggle.innerHTML = "≡";
      } else {
        localStorage.setItem("sidebar-state", "expanded");
        sidebarToggle.setAttribute("title", "折叠侧边栏");
        sidebarToggle.innerHTML = "«";
      }
    });
  }

  // 移动版切换侧边栏状态
  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("mobile-collapsed");
      document.body.classList.toggle("mobile-sidebar-collapsed");

      if (sidebar.classList.contains("mobile-collapsed")) {
        localStorage.setItem("mobile-sidebar-state", "collapsed");
        mobileSidebarToggle.innerHTML = "▼";
        mobileSidebarToggle.setAttribute("title", "展开侧边栏");
      } else {
        localStorage.setItem("mobile-sidebar-state", "expanded");
        mobileSidebarToggle.innerHTML = "▲";
        mobileSidebarToggle.setAttribute("title", "折叠侧边栏");
      }
    });
  }

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
    
    // 调试信息 (可在控制台查看)
    console.log(`Screen: ${windowWidth}x${windowHeight}, iPad Pro: ${isIPadPro}, Medium: ${isMediumScreen}, Portrait: ${isPortrait}, iPhone Landscape: ${isIPhoneLandscape}`);
    
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

    // 中等尺寸屏幕、移动设备、iPad Pro竖屏、iPhone横屏使用垂直折叠功能
    if (windowWidth <= SCREEN_LG_MAX || (isIPadPro && isPortrait) || isIPhoneLandscape) {
      // 重置桌面折叠状态
      wrapper.classList.remove("sidebar-collapsed");
      sidebar.classList.remove("collapsed");

      // 设置移动端折叠按钮
      if (sidebarToggle) sidebarToggle.style.display = "none";
      if (mobileSidebarToggle) mobileSidebarToggle.style.display = "flex";
      console.log("使用移动端按钮 (垂直折叠)");
      
      // 确保箭头朝上或朝下
      if (mobileSidebarToggle) {
        if (sidebar.classList.contains("mobile-collapsed")) {
          mobileSidebarToggle.innerHTML = "▼";
        } else {
          mobileSidebarToggle.innerHTML = "▲";
        }
      }

      // 默认折叠侧边栏以最大化内容区域
      if (!sidebar.classList.contains("mobile-collapsed") && 
          (isMediumScreen || isIPadPro || isIPhoneLandscape || windowWidth <= SCREEN_SM)) {
        
        // Only update localStorage if the state actually changes to "collapsed"
        const currentMobileSidebarState = localStorage.getItem("mobile-sidebar-state");
        if (currentMobileSidebarState !== "collapsed") {
          localStorage.setItem("mobile-sidebar-state", "collapsed");
        }
        
        sidebar.classList.add("mobile-collapsed");
        document.body.classList.add("mobile-sidebar-collapsed");
        mobileSidebarToggle.innerHTML = "▼";
        // No need to set localStorage again here if already set above based on state change
      }
    } else {
      // 大屏幕桌面设备使用水平折叠功能
      sidebar.classList.remove("mobile-collapsed");
      document.body.classList.remove("mobile-sidebar-collapsed");
      if (sidebarToggle) sidebarToggle.style.display = "flex";
      if (mobileSidebarToggle) mobileSidebarToggle.style.display = "none";
      console.log("使用桌面端按钮 (水平折叠)");
    }
  };

  // 监听窗口大小变化
  window.addEventListener("resize", handleResize);

  // 初始化时运行一次
  handleResize();
});
