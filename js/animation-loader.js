// Animation control script for Jekyll blog

document.addEventListener('DOMContentLoaded', function() {
  // Hide loader when page is fully loaded
  setTimeout(function() {
    document.querySelector('.loader').style.display = 'none';
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
      document.querySelector('.loader').style.display = 'block';
      document.getElementById('main').classList.add('loading');
      
      // Save state to sessionStorage
      sessionStorage.setItem('isPageTransition', 'true');
    }
  });

  // Apply staggered animation to posts
  const articles = document.querySelectorAll('.posts article');
  articles.forEach((article, index) => {
    // Ensure animations only play after initial page load
    setTimeout(() => {
      article.style.opacity = '1';
      article.style.transform = 'translateY(0)';
    }, 100 + (index * 100));
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