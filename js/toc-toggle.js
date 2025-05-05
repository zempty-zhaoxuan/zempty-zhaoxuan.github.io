document.addEventListener('DOMContentLoaded', () => {
    const tocToggleButton = document.getElementById('toc-toggle-button');
    const tocContent = document.getElementById('toc-content');
    const tocAside = document.querySelector('aside.toc');
    const mainElement = document.getElementById('main');

    if (!tocToggleButton || !tocContent || !tocAside || !mainElement) {
        console.warn('TOC toggle elements or main element not found.');
        return;
    }

    // Check local storage for saved state
    // Default to collapsed if no setting is found or if it's explicitly set to 'true'
    const isTocCollapsed = localStorage.getItem('tocCollapsed') !== 'false';

    // Function to update state
    function updateTocState(collapse) {
        if (collapse) {
            tocContent.style.display = 'none';
            tocAside.classList.add('collapsed');
            mainElement.classList.add('toc-collapsed');
            tocToggleButton.textContent = '目录 ▲';
            tocToggleButton.setAttribute('aria-expanded', 'false');
            localStorage.setItem('tocCollapsed', 'true');
        } else {
            tocContent.style.display = '';
            tocAside.classList.remove('collapsed');
            mainElement.classList.remove('toc-collapsed');
            tocToggleButton.textContent = '目录 ▼';
            tocToggleButton.setAttribute('aria-expanded', 'true');
            localStorage.setItem('tocCollapsed', 'false');
        }
        // Optional: Trigger resize event if layout depends on TOC visibility
        // window.dispatchEvent(new Event('resize'));
    }

    // Apply initial state
    updateTocState(isTocCollapsed);

    // Add click listener
    tocToggleButton.addEventListener('click', () => {
        const isCurrentlyCollapsed = tocContent.style.display === 'none';
        updateTocState(!isCurrentlyCollapsed);
    });
}); 