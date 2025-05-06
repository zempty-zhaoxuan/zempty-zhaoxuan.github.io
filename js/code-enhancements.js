document.addEventListener('DOMContentLoaded', function() {
  // Find all code blocks and add language label
  document.querySelectorAll('pre.highlight').forEach(function(pre) {
    // Try to find language class
    let langClass = Array.from(pre.classList).find(cls => cls.startsWith('language-'));
    
    if (langClass) {
      // Extract language name from class
      let lang = langClass.replace('language-', '');
      // Set data attribute for CSS to use
      pre.setAttribute('data-lang', lang);
    } else {
      // If language not found, try to look at the first child class
      let codeEl = pre.querySelector('code');
      if (codeEl) {
        langClass = Array.from(codeEl.classList).find(cls => cls.startsWith('language-'));
        if (langClass) {
          let lang = langClass.replace('language-', '');
          pre.setAttribute('data-lang', lang);
        } else {
          // Default to "code" if language not detected
          pre.setAttribute('data-lang', 'code');
        }
      } else {
        pre.setAttribute('data-lang', 'code');
      }
    }
  });
  
  // Apply syntax highlighting improvements
  document.querySelectorAll('pre.highlight code').forEach(function(code) {
    // Add line numbers if not present
    if (!code.innerHTML.includes('<span class="line-number">')) {
      let lines = code.innerHTML.split('\n');
      let numberedLines = lines.map((line, index) => {
        // Skip last empty line
        if (index === lines.length - 1 && line.trim() === '') return line;
        return `<span class="line-number">${index + 1}</span>${line}`;
      }).join('\n');
      
      // Only apply if there's actual content
      if (lines.length > 1 || lines[0].trim() !== '') {
        code.innerHTML = numberedLines;
      }
    }
  });
}); 