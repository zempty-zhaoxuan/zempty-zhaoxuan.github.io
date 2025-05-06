// Add the progress bar immediately to ensure it's loaded before content
(function() {
  try {
    // Create progress bar and container
    const progressContainer = document.createElement('div');
    progressContainer.id = 'progress-container';
    progressContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:10px;background:rgba(0,0,0,0.05);z-index:999999;pointer-events:none;';
    
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.style.cssText = 'height:100%;width:0%;background:linear-gradient(90deg,#ff0844 0%,#ffb199 100%);transition:width 0.1s;box-shadow:0 2px 6px rgba(255,8,68,0.3);';
    
    // Add to DOM immediately
    progressContainer.appendChild(progressBar);
    
    // Add to body as soon as it's available
    if (document.body) {
      document.body.appendChild(progressContainer);
    } else {
      // If body isn't ready, wait for DOMContentLoaded
      window.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(progressContainer);
      });
    }
    
    // Update function for progress
    function updateProgress() {
      try {
        const winScroll = window.pageYOffset || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
      } catch (e) {
        console.error('Error updating progress bar:', e);
      }
    }
    
    // Add scroll listener
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    
    // Initial update
    setTimeout(updateProgress, 100);
    
  } catch (e) {
    console.error('Error initializing progress bar:', e);
  }
})(); 