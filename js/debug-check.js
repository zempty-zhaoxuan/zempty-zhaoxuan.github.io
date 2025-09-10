// Debug check to ensure no performance monitor is created
(function() {
  'use strict';
  
  // Check for any existing performance monitor elements
  function checkForPerformanceMonitor() {
    const suspiciousElements = [
      document.getElementById('performance-dashboard'),
      document.querySelector('[id*="performance"]'),
      document.querySelector('[class*="performance"]'),
      document.querySelector('[class*="monitor"]'),
      document.querySelector('[class*="dashboard"]')
    ].filter(Boolean);
    
    if (suspiciousElements.length > 0) {
      console.warn('Found suspicious performance monitor elements:', suspiciousElements);
      // Remove them
      suspiciousElements.forEach(el => {
        if (el && el.parentNode) {
          console.log('Removing element:', el);
          el.parentNode.removeChild(el);
        }
      });
    }
  }
  
  // Check immediately
  checkForPerformanceMonitor();
  
  // Check after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForPerformanceMonitor);
  }
  
  // Check periodically for the first 10 seconds
  let checkCount = 0;
  const intervalId = setInterval(() => {
    checkForPerformanceMonitor();
    checkCount++;
    if (checkCount >= 20) { // 20 * 500ms = 10 seconds
      clearInterval(intervalId);
    }
  }, 500);
  
})();