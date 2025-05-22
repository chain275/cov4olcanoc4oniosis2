// Ad Banner JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize ad banners
    initializeAdBanners();

    // Add global event listener for close buttons (including future elements)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.ad-close')) {
            e.preventDefault();
            const adBanner = e.target.closest('.ad-banner');
            if (adBanner) {
                adBanner.style.display = 'none';
            }
        }
    });
});

function initializeAdBanners() {
    // Load ad content from JSON file
    fetch('public/ads.json')
        .then(response => response.json())
        .then(ads => {
            // Clear existing ad containers
            document.getElementById('left-ad-container').innerHTML = '';
            document.getElementById('right-ad-container').innerHTML = '';
            
            // Process ads and create banner elements
            ads.forEach(ad => {
                createAdBanner(ad);
            });
        })
        .catch(error => {
            console.error('Error loading ads:', error);
            // If there's an error, try using a relative path without 'public/'
            fetch('ads.json')
                .then(response => response.json())
                .then(ads => {
                    ads.forEach(ad => {
                        createAdBanner(ad);
                    });
                })
                .catch(secondError => console.error('Failed to load ads:', secondError));
        });
}

function createAdBanner(adData) {
    // Create ad banner element
    const adBanner = document.createElement('div');
    adBanner.className = 'ad-banner';
    
    // Apply custom background color if specified
    if (adData.backgroundColor) {
        adBanner.style.backgroundColor = adData.backgroundColor;
    }
    
    // Apply custom width if specified
    if (adData.width) {
        adBanner.style.width = `${adData.width}px`;
    }
    
    // Create image element
    const adImage = document.createElement('img');
    adImage.src = adData.imageUrl;
    adImage.alt = adData.title;
    
    // Apply custom dimensions to image if specified
    if (adData.width) {
        adImage.style.width = `${adData.width}px`;
    }
    if (adData.height) {
        adImage.style.height = `${adData.height}px`;
        adImage.style.objectFit = 'cover';
    }
    
    adImage.onerror = function() {
        // Fallback for missing images
        this.src = 'images/default-ad.jpg';
        this.onerror = null;
    };
    
    // Create content container
    const adContent = document.createElement('div');
    adContent.className = 'ad-content';
    
    // Apply custom text color if specified
    if (adData.textColor) {
        adContent.style.color = adData.textColor;
    }
    
    // Create title
    const adTitle = document.createElement('h4');
    adTitle.textContent = adData.title;
    // Apply text color to title specifically
    if (adData.textColor) {
        adTitle.style.color = adData.textColor;
    }
    
    // Create description
    const adDescription = document.createElement('p');
    adDescription.textContent = adData.description;
    
    // Create action button
    const adAction = document.createElement('a');
    adAction.href = adData.actionUrl;
    adAction.className = 'ad-action';
    adAction.textContent = adData.actionText || 'Learn More';
    
    // Set target attribute for link behavior
    if (adData.target) {
        adAction.target = adData.target;
    } else if (isExternalUrl(adData.actionUrl)) {
        // Default to opening external links in new tab
        adAction.target = '_blank';
        // Add rel attribute for security with external links
        adAction.rel = 'noopener noreferrer';
    }
    
    // Allow custom button colors via actionBgColor and actionTextColor properties
    if (adData.actionBgColor) {
        adAction.style.backgroundColor = adData.actionBgColor;
    }
    if (adData.actionTextColor) {
        adAction.style.color = adData.actionTextColor;
    }
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'ad-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    
    // Assemble the ad components
    adContent.appendChild(adTitle);
    adContent.appendChild(adDescription);
    adContent.appendChild(adAction);
    
    adBanner.appendChild(adImage);
    adBanner.appendChild(adContent);
    adBanner.appendChild(closeButton);
    
    // Add to appropriate container based on position
    const containerId = adData.position === 'left' ? 'left-ad-container' : 'right-ad-container';
    const container = document.getElementById(containerId);
    
    if (container) {
        container.appendChild(adBanner);
    }
}

// Helper function to determine if a URL is external
function isExternalUrl(url) {
    if (!url) return false;
    
    // If it's a relative URL (starts with / or #), it's not external
    if (url.startsWith('/') || url.startsWith('#')) {
        return false;
    }
    
    // If it has a protocol (http://, https://, etc.), check if it's different from current site
    try {
        // Check if it's a valid URL with a different hostname
        const urlObj = new URL(url, window.location.origin);
        return urlObj.hostname !== window.location.hostname;
    } catch (e) {
        // If URL parsing fails, default to false
        return false;
    }
} 