document.addEventListener("DOMContentLoaded", function() {
  // First, check if we're on iOS - if so, load images immediately
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Also check if we're on a mobile device (more broadly)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
  
  // For iOS or mobile devices, load all images immediately
  if (isIOS || isMobile) {
    console.log("Mobile device detected, loading images immediately");
    lazyImages.forEach(loadImage);
    return; // Exit early for mobile devices
  }

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          loadImage(lazyImage);
          observer.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    let active = false;

    const lazyLoad = function() {
      if (active === false) {
        active = true;

        setTimeout(function() {
          lazyImages.forEach(function(lazyImage) {
            if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
              loadImage(lazyImage);

              lazyImages = lazyImages.filter(function(image) {
                return image !== lazyImage;
              });

              if (lazyImages.length === 0) {
                document.removeEventListener("scroll", lazyLoad);
                window.removeEventListener("resize", lazyLoad);
                window.removeEventListener("orientationchange", lazyLoad);
              }
            }
          });
          active = false;
        }, 200);
      }
    };

    document.addEventListener("scroll", lazyLoad);
    window.addEventListener("resize", lazyLoad);
    window.addEventListener("orientationchange", lazyLoad);
    // Initial check
    lazyLoad();
  }
  
  // Backup - load all images that might have been missed after 3 seconds
  setTimeout(function() {
    loadRemainingImages();
  }, 3000);
  
  // Special handling for orientation changes on mobile
  window.addEventListener("orientationchange", function() {
    // Reload all lazy images after orientation change
    setTimeout(function() {
      loadRemainingImages();
    }, 200); // Small delay to let the orientation change complete
  });
  
  // 提取公共的图片加载逻辑
  function loadImage(img) {
    if (img.dataset.src) {
      // 验证URL安全性
      const src = SecurityUtils ? SecurityUtils.sanitizeUrl(img.dataset.src) : sanitizeUrl(img.dataset.src);
      img.src = src;
    }
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
    }
    img.classList.remove('lazy');
    img.classList.add('lazy-loaded');
  }
  
  function loadRemainingImages() {
    document.querySelectorAll('img.lazy').forEach(loadImage);
  }
  
  // 安全工具函数（如果SecurityUtils不可用）
  function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return url;
    }
    if (url.match(/^https?:\/\//)) {
      try {
        const urlObj = new URL(url);
        return urlObj.href;
      } catch (e) {
        return '';
      }
    }
    return '';
  }
}); 