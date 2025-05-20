// Add the progress bar immediately to ensure it's loaded before content
(function() {
  try {
    // Create percentage indicator
    const percentageIndicator = document.createElement('div');
    percentageIndicator.id = 'progress-percentage';
    percentageIndicator.style.cssText = 'position:fixed;top:15px;right:15px;background:rgba(255,255,255,0.9);color:#333;padding:5px 10px;border-radius:15px;font-size:14px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.2);z-index:999999;opacity:0.9;transition:opacity 0.3s;';
    percentageIndicator.textContent = '0%';
    
    // Add to body as soon as it's available
    if (document.body) {
      document.body.appendChild(percentageIndicator);
    } else {
      // If body isn't ready, wait for DOMContentLoaded
      window.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(percentageIndicator);
      });
    }
    
    // Update function for progress
    function updateProgress() {
      try {
        const winScroll = window.pageYOffset || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        // Update percentage text and visibility
        percentageIndicator.textContent = Math.round(scrolled) + '%';
        
        // Hide percentage at top or bottom of page
        if (winScroll < 100 || scrolled > 98) {
          percentageIndicator.style.opacity = '0';
        } else {
          percentageIndicator.style.opacity = '0.9';
        }
      } catch (e) {
        console.error('Error updating progress percentage:', e);
      }
    }
    
    // Add scroll listener
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    
    // Initial update
    setTimeout(updateProgress, 100);
    
  } catch (e) {
    console.error('Error initializing progress percentage:', e);
  }
})(); 