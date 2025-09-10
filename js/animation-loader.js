// Animation control script for Jekyll blog

document.addEventListener('DOMContentLoaded', function() {
  // Hide loader when page is fully loaded
  setTimeout(function() {
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }, 300);

  // Add loading class when clicking on links
  document.addEventListener('click', function(e) {
    // Check if clicked element is a link to another page
    const target = e.target.closest('a');
    if (target && 
        target.href && 
        target.hostname === window.location.hostname && 
        !target.hasAttribute('download') && 
        target.getAttribute('href').indexOf('#') !== 0) {
      
      // Show loading animation
      const loader = document.querySelector('.loader');
      const main = document.getElementById('main');
      if (loader) {
        loader.style.display = 'block';
      }
      if (main) {
        main.classList.add('loading');
      }
      
      // Save state to sessionStorage
      sessionStorage.setItem('isPageTransition', 'true');
    }
  });

  // Apply staggered animation to posts
  const articles = document.querySelectorAll('.posts article');
  articles.forEach((article, index) => {
    if (!article) return;
    // Ensure animations only play after initial page load
    const delay = Math.min(100 + (index * 100), 2000); // 限制最大延迟
    setTimeout(() => {
      if (article) {
        article.style.opacity = '1';
        article.style.transform = 'translateY(0)';
      }
    }, delay);
  });

  // Add hover effect for images
  const images = document.querySelectorAll('.post img');
  images.forEach(img => {
    img.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.02)';
      this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    });
    
    img.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });
}); 