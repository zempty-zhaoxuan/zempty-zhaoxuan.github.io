document.addEventListener('DOMContentLoaded', function() {
  // Find all code blocks
  document.querySelectorAll('pre.highlight').forEach(function(pre) {
    // Part 1: Add language label (existing logic)
    let langClass = Array.from(pre.classList).find(cls => cls.startsWith('language-'));
    if (langClass) {
      let lang = langClass.replace('language-', '');
      pre.setAttribute('data-lang', lang);
    } else {
      let codeEl = pre.querySelector('code');
      if (codeEl) {
        langClass = Array.from(codeEl.classList).find(cls => cls.startsWith('language-'));
        if (langClass) {
          let lang = langClass.replace('language-', '');
          pre.setAttribute('data-lang', lang);
        } else {
          pre.setAttribute('data-lang', 'code');
        }
      } else {
        pre.setAttribute('data-lang', 'code');
      }
    }

    // Part 2: Create and add Copy button
    const codeElement = pre.querySelector('code');
    if (codeElement) { // Ensure there's a <code> element
      // Remove any existing copy buttons to avoid duplicates
      const existingButtons = pre.querySelectorAll('.copy-code-button');
      existingButtons.forEach(button => button.remove());
      
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-code-button';
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      copyButton.setAttribute('title', 'Copy code');
      // Use only SVG icon, remove text
      copyButton.innerHTML = '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';
      
      // 设置样式以确保正确位置
      copyButton.style.position = 'absolute';
      copyButton.style.top = '0';
      copyButton.style.right = '0';
      copyButton.style.left = 'auto';
      copyButton.style.zIndex = '100';
      
      // Ensure pre is a positioned container for the button
      if (window.getComputedStyle(pre).position === 'static') {
        pre.style.position = 'relative';
      }
      
      // Append the button to the pre element
      pre.appendChild(copyButton);

      copyButton.addEventListener('click', function() {
        const codeToCopy = codeElement.innerText;
        navigator.clipboard.writeText(codeToCopy).then(function() {
          // Update to checkmark icon only
          copyButton.innerHTML = '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>';
          copyButton.classList.add('copied');
          copyButton.disabled = true;
          setTimeout(function() {
            // Revert to copy icon only
            copyButton.innerHTML = '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';
            copyButton.classList.remove('copied');
            copyButton.disabled = false;
          }, 2000);
        }, function(err) {
          console.error('Failed to copy code: ', err);
          // Update to error text only briefly if needed, or keep icon consistent
          copyButton.innerHTML = 'Error'; // Or an error icon
          setTimeout(function() {
            copyButton.innerHTML = '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';
          }, 2000);
        });
      });
    }
  });
}); 