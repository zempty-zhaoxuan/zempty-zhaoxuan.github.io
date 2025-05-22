document.addEventListener("DOMContentLoaded", function() {
  // First, check if we're on iOS - if so, load images immediately
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Also check if we're on a mobile device (more broadly)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
  
  // For iOS or mobile devices, load all images immediately
  if (isIOS || isMobile) {
    console.log("Mobile device detected, loading images immediately");
    lazyImages.forEach(function(lazyImage) {
      if (lazyImage.dataset.src) {
        lazyImage.src = lazyImage.dataset.src;
      }
      if (lazyImage.dataset.srcset) {
        lazyImage.srcset = lazyImage.dataset.srcset;
      }
      lazyImage.classList.remove("lazy");
      lazyImage.classList.add("lazy-loaded");
    });
    return; // Exit early for mobile devices
  }

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          if (lazyImage.dataset.src) { // Check for data-src for regular images
            lazyImage.src = lazyImage.dataset.src;
          }
          if (lazyImage.dataset.srcset) { // Check for data-srcset for responsive images
            lazyImage.srcset = lazyImage.dataset.srcset;
          }
          lazyImage.classList.remove("lazy");
          lazyImage.classList.add("lazy-loaded"); // Optional: for styling loaded images
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
              if (lazyImage.dataset.src) {
                lazyImage.src = lazyImage.dataset.src;
              }
              if (lazyImage.dataset.srcset) {
                lazyImage.srcset = lazyImage.dataset.srcset;
              }
              lazyImage.classList.remove("lazy");
              lazyImage.classList.add("lazy-loaded");

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
    document.querySelectorAll("img.lazy").forEach(function(lazyImage) {
      if (lazyImage.dataset.src) {
        lazyImage.src = lazyImage.dataset.src;
      }
      if (lazyImage.dataset.srcset) {
        lazyImage.srcset = lazyImage.dataset.srcset;
      }
      lazyImage.classList.remove("lazy");
      lazyImage.classList.add("lazy-loaded");
    });
  }, 3000);
  
  // Special handling for orientation changes on mobile
  window.addEventListener("orientationchange", function() {
    // Reload all lazy images after orientation change
    setTimeout(function() {
      document.querySelectorAll("img.lazy").forEach(function(lazyImage) {
        if (lazyImage.dataset.src && !lazyImage.src.includes(lazyImage.dataset.src)) {
          lazyImage.src = lazyImage.dataset.src;
        }
        if (lazyImage.dataset.srcset && !lazyImage.srcset) {
          lazyImage.srcset = lazyImage.dataset.srcset;
        }
        lazyImage.classList.remove("lazy");
        lazyImage.classList.add("lazy-loaded");
      });
    }, 200); // Small delay to let the orientation change complete
  });
}); 