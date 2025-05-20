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
  const currentState = localStorage.getItem("sidebar-state");
  const mobileSidebarState = localStorage.getItem("mobile-sidebar-state");
  const sidebarArchive = document.querySelector(".sidebar-archive");

  // 桌面版侧边栏状态应用
  if (currentState === "collapsed") {
    wrapper.classList.add("sidebar-collapsed");
    sidebar.classList.add("collapsed");
    sidebarToggle.innerHTML = "≡";
    sidebarToggle.setAttribute("title", "展开侧边栏");
  } else {
    sidebarToggle.innerHTML = "«";
    sidebarToggle.setAttribute("title", "折叠侧边栏");
  }

  // 移动版侧边栏状态应用
  if (mobileSidebarState === "collapsed") {
    sidebar.classList.add("mobile-collapsed");
    document.body.classList.add("mobile-sidebar-collapsed");
    mobileSidebarToggle.innerHTML = "▼";
    mobileSidebarToggle.setAttribute("title", "展开侧边栏");
  } else {
    mobileSidebarToggle.innerHTML = "▲";
    mobileSidebarToggle.setAttribute("title", "折叠侧边栏");
  }

  // 桌面版切换侧边栏状态
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

  // 移动版切换侧边栏状态
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

  // 设置返回首页按钮的提示文字
  homeButton.setAttribute("title", "返回首页");

  // 主题变化监听，同步更新按钮样式
  const updateButtonsByTheme = function () {
    // 复用主题切换按钮的样式逻辑
    if (document.body.classList.contains("dark-theme")) {
      // 深色主题
      sidebarToggle.classList.add("dark-theme");
      mobileSidebarToggle.classList.add("dark-theme");
      homeButton.classList.add("dark-theme");
    } else {
      // 浅色主题
      sidebarToggle.classList.remove("dark-theme");
      mobileSidebarToggle.classList.remove("dark-theme");
      homeButton.classList.remove("dark-theme");
    }
  };

  // 初始运行一次以设置初始状态
  updateButtonsByTheme();

  // 监听主题切换事件
  themeToggle.addEventListener("click", function () {
    // 主题切换后稍微延迟更新按钮样式
    setTimeout(updateButtonsByTheme, 50);
  });

  // 响应式处理
  const handleResize = function () {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    // 检测iPad Pro和中等尺寸屏幕
    const isIPadPro = windowWidth >= SCREEN_MD_MIN && windowWidth <= SCREEN_MD_MAX;
    const isMediumScreen = windowWidth > SCREEN_MD_MAX && windowWidth <= SCREEN_LG_MAX; // Use SCREEN_MD_MAX as lower bound
    const isPortrait = windowHeight > windowWidth;
    
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

    // 中等尺寸屏幕（1144px × 1010px左右）或移动设备或iPad Pro竖屏使用垂直折叠功能
    if (windowWidth <= SCREEN_LG_MAX || (isIPadPro && isPortrait)) {
      // 重置桌面折叠状态
      wrapper.classList.remove("sidebar-collapsed");
      sidebar.classList.remove("collapsed");

      // 设置移动端折叠按钮
      sidebarToggle.style.display = "none";
      mobileSidebarToggle.style.display = "flex";
      
      // 确保箭头朝上或朝下
      if (sidebar.classList.contains("mobile-collapsed")) {
        mobileSidebarToggle.innerHTML = "▼";
      } else {
        mobileSidebarToggle.innerHTML = "▲";
      }

      // 默认折叠侧边栏以最大化内容区域
      if (!sidebar.classList.contains("mobile-collapsed") && 
          (isMediumScreen || isIPadPro || windowWidth <= SCREEN_SM)) { // Use SCREEN_SM here
        
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
      sidebarToggle.style.display = "flex";
      mobileSidebarToggle.style.display = "none";
    }
  };

  // 监听窗口大小变化
  window.addEventListener("resize", handleResize);

  // 初始化时运行一次
  handleResize();
});
