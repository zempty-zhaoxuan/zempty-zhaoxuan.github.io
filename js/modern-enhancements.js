// Modern Blog Enhancements
// 现代化博客增强功能

(function () {
  "use strict";

  // Intersection Observer for animations - 滚动触发动画
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe post cards
    getPostCards().forEach((card) => {
      card.classList.add("animate-ready");
      observer.observe(card);
    });
  }

  // Enhanced card interactions - 增强卡片交互
  const RIPPLE_DURATION = 600; // 定义常量避免硬编码
  
  function initCardInteractions() {
    getPostCards().forEach((card) => {
      let tiltTimeout;

      // Add subtle tilt effect on mouse move
      card.addEventListener("mousemove", (e) => {
        if (window.innerWidth < 768) return; // Skip on mobile

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;

        clearTimeout(tiltTimeout);
      });

      // Reset tilt on mouse leave
      card.addEventListener("mouseleave", () => {
        tiltTimeout = setTimeout(() => {
          card.style.transform = "";
        }, 100);
      });

      // Add click ripple effect
      card.addEventListener("click", (e) => {
        const ripple = document.createElement("div");
        ripple.classList.add("ripple-effect");

        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";

        card.appendChild(ripple);

        // 清理波纹效果并限制数量
        const existingRipples = card.querySelectorAll('.ripple-effect');
        if (existingRipples.length > 3) {
          existingRipples[0].remove();
        }
        
        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.remove();
          }
        }, RIPPLE_DURATION);
      });
    });
  }

  // Enhanced search with history - 增强搜索功能 (已禁用，由modern-search.js统一处理)
  function initEnhancedSearch() {
    // 此函数已被禁用，搜索功能现在由modern-search.js统一处理
    return;
  }

  // Smooth scroll enhancements - 平滑滚动增强
  function initSmoothScrolling() {
    // Add smooth scrolling to in-page anchors; only intercept when target exists
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (!href || href === "#") return;

        try {
          // Use getElementById to support IDs starting with numbers or containing non-ASCII chars
          const id = decodeURIComponent(href.slice(1));
          // 验证ID的安全性
          if (SecurityUtils && !SecurityUtils.validateInput(id).isValid) {
            console.warn('不安全的锤点链接:', href);
            return;
          }
          
          const target = document.getElementById(id);

          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
            // Keep URL hash in sync without causing default jump
            try {
              if (history && history.replaceState) {
                history.replaceState(null, "", href);
              }
            } catch (historyError) {
              // Fallback for restricted contexts
              console.warn('Cannot update history state:', historyError);
            }
          }
        } catch (error) {
          console.warn('Error in smooth scrolling:', error);
        }
      });
    });
  }

  // Reading progress for homepage - 首页阅读进度
  function initReadingProgress() {
    const progressBar = document.querySelector(".reading-progress-bar");
    if (!progressBar) return;

    let ticking = false;
    
    function updateProgress() {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrollPosition = window.scrollY;
      const progress = documentHeight > 0 ? Math.min((scrollPosition / documentHeight) * 100, 100) : 0;

      progressBar.style.width = progress + "%";
      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
    updateProgress();
  }

  // Performance optimizations - 性能优化
  function initPerformanceOptimizations() {
    // Lazy load images with better loading states
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;

            if (src) {
              img.src = src;
              img.classList.remove("lazy");
              img.classList.add("lazy-loaded");
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll("img[data-src]").forEach((img) => {
        img.classList.add("lazy-loading");
        imageObserver.observe(img);
      });
    }

    // Preload critical resources (limit to search index lazily via modern-search.js)
    // Removed generic prefetches to reduce unnecessary network work.
  }

  // Theme transition enhancements - 主题切换增强
  function initThemeEnhancements() {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) return;

    // Add smooth transition when switching themes
    themeToggle.addEventListener("click", () => {
      document.body.style.transition = "all 0.3s ease";

      setTimeout(() => {
        document.body.style.transition = "";
      }, 300);
    });
  }

  // 缓存DOM元素
  let cachedPostCards = null;
  
  function getPostCards() {
    if (!cachedPostCards) {
      cachedPostCards = document.querySelectorAll('.post-card');
    }
    return cachedPostCards;
  }

  // Initialize all enhancements
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }

    try {
      initScrollAnimations();
      initCardInteractions();
      initEnhancedSearch();
      initSmoothScrolling();
      initReadingProgress();
      initPerformanceOptimizations();
      initThemeEnhancements();
      initSecurityEnhancements();
    } catch (error) {
      console.warn("Some modern enhancements failed to initialize:", error);
    }
  }

  // Auto-initialize
  init();
})();

// Add CSS for animations and effects
const modernStyles = `
<style>
/* Scroll animations */
.animate-ready {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Ripple effect */
.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  pointer-events: none;
  transform: scale(0);
  animation: ripple 0.6s linear;
  z-index: 1;
}

@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

/* Lazy loading images */
.lazy-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, rgba(255,255,255,0.5) 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.lazy-loading.loaded {
  animation: none;
  background: none;
}

/* Card hover enhancements */
.post-card {
  position: relative;
  overflow: hidden;
  will-change: transform;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
  z-index: 1;
  pointer-events: none;
}

.post-card:hover::before {
  left: 100%;
}

/* Staggered animation for cards */
.post-card:nth-child(1) { animation-delay: 0.1s; }
.post-card:nth-child(2) { animation-delay: 0.2s; }
.post-card:nth-child(3) { animation-delay: 0.3s; }
.post-card:nth-child(4) { animation-delay: 0.4s; }
.post-card:nth-child(5) { animation-delay: 0.5s; }
.post-card:nth-child(6) { animation-delay: 0.6s; }

/* Mobile optimizations */
@media (max-width: 767px) {
  .animate-ready {
    transform: translateY(20px);
  }
  
  .post-card {
    transform: none !important;
  }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML("beforeend", modernStyles);

// 安全增强：为新窗口外链增加 rel="noopener noreferrer"
function initSecurityEnhancements() {
  try {
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach((a) => {
      const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (!rel.includes('noopener')) rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      a.setAttribute('rel', rel.join(' '));
    });
  } catch (e) {
    console.error('Failed to set rel on external links', e);
  }
}

// 移除重复的事件监听器
