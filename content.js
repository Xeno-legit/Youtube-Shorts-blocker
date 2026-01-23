// Redirect Shorts URLs to Normal Player
function redirectShorts() {
    const path = window.location.pathname;
    
    if (path.startsWith('/shorts/')) {
        const videoId = path.split('/shorts/')[1].split('?')[0];
        if (videoId) {
            const newUrl = `https://www.youtube.com/watch?v=${videoId}`;
            window.location.replace(newUrl);
        }
    }
}

// Remove Shorts elements from the page
function removeShortsElements() {
    // Remove Shorts shelves and reels
    const selectors = [
        'ytd-rich-shelf-renderer[is-shorts]',
        'ytd-reel-shelf-renderer',
        'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
        'ytd-guide-entry-renderer:has(a[href*="/shorts"])',
        'ytd-mini-guide-entry-renderer:has(a[href*="/shorts"])',
        'ytm-pivot-bar-item-renderer:has(div.pivot-shorts)',
        // Additional selectors for Shorts in search results and home feed
        'ytd-video-renderer:has(a[href*="/shorts/"])',
        'ytd-grid-video-renderer:has(a[href*="/shorts/"])',
        'ytd-compact-video-renderer:has(a[href*="/shorts/"])',
        // Shorts tab on channel pages
        'yt-tab-shape:has(a[href*="/shorts"])',
        'tp-yt-paper-tab:has(a[href*="/shorts"])'
    ];
    
    selectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        } catch (e) {
            // Ignore selector errors for older browsers
        }
    });
    
    // Remove Shorts links from sidebar - multiple approaches
    const shortsLinks = document.querySelectorAll('a[href*="/shorts"], a[title="Shorts"], a[href="/shorts"]');
    shortsLinks.forEach(link => {
        const sidebarItem = link.closest('ytd-guide-entry-renderer') || 
                           link.closest('ytd-mini-guide-entry-renderer') ||
                           link.closest('ytm-pivot-bar-item-renderer');
        if (sidebarItem) {
            sidebarItem.remove();
        }
    });
    
    // Additional check for Shorts text in sidebar
    const guideEntries = document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
    guideEntries.forEach(entry => {
        const text = entry.textContent.trim().toLowerCase();
        if (text === 'shorts' || entry.querySelector('[title="Shorts"]')) {
            entry.remove();
        }
    });
}

// Debounce function to limit execution frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced version of removeShortsElements
const debouncedRemove = debounce(removeShortsElements, 100);

// Observer to handle YouTube's dynamic content loading
let observer;

function initObserver() {
    if (observer) {
        observer.disconnect();
    }
    
    observer = new MutationObserver(() => {
        debouncedRemove();
    });
    
    // Wait for body to be available
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Handle navigation changes (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        redirectShorts();
        removeShortsElements();
    }
}).observe(document, { subtree: true, childList: true });

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        redirectShorts();
        removeShortsElements();
        initObserver();
    });
} else {
    redirectShorts();
    removeShortsElements();
    initObserver();
}

// Catch early redirects
redirectShorts();