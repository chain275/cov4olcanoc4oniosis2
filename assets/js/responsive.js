// Responsive variables
let windowWidth = window.innerWidth;
let isMobile = window.innerWidth < 768;
let isTablet = window.innerWidth >= 768 && window.innerWidth < 992;
let isDesktop = window.innerWidth >= 992;
let isMidDesktop = window.innerWidth >= 1200 && window.innerWidth < 1570;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create menu overlay if it doesn't exist
    let menuOverlay = document.querySelector('.menu-overlay');
    if (!menuOverlay) {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }
    
    setupMobileMenu();
    setupDropdownMenus();
    fetchExamData();
    setupResponsiveListeners();
    applyResponsiveLayout();
});

// Setup responsive event listeners
function setupResponsiveListeners() {
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        
        // Only trigger changes if we cross a breakpoint
        if (
            (windowWidth < 768 && newWidth >= 768) ||
            (windowWidth >= 768 && windowWidth < 992 && (newWidth < 768 || newWidth >= 992)) ||
            (windowWidth >= 992 && windowWidth < 1200 && (newWidth < 992 || newWidth >= 1200)) ||
            (windowWidth >= 1200 && windowWidth < 1570 && (newWidth < 1200 || newWidth >= 1570)) ||
            (windowWidth >= 1570 && newWidth < 1570)
        ) {
            windowWidth = newWidth;
            isMobile = newWidth < 768;
            isTablet = newWidth >= 768 && newWidth < 992;
            isDesktop = newWidth >= 992;
            isMidDesktop = newWidth >= 1200 && newWidth < 1570;
            
            applyResponsiveLayout();
        }
        
        windowWidth = newWidth;
    });
}

// Apply layout changes based on current viewport size
function applyResponsiveLayout() {
    // Reset mobile menu when resizing to desktop
    if (isDesktop && navigation && navigation.classList.contains('active')) {
        navigation.classList.remove('active');
        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Adjust exam layout if exam content is visible
    if (examContentSection && !examContentSection.classList.contains('hidden')) {
        adjustExamLayout();
    }
    
    // Reset dropdown menus on resize
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (isDesktop) {
            menu.style.display = '';
        } else {
            menu.style.display = 'none';
            menu.classList.remove('active');
        }
    });
}

// Adjust exam layout based on screen size
function adjustExamLayout() {
    if (!examContentSection) return;
    
    if (isMobile) {
        // Mobile layout adjustments
        if (examTitle) {
            examTitle.style.fontSize = '1.2rem';
        }
        
        // Make timer more compact
        if (timerDisplay) {
            timerDisplay.style.fontSize = '0.85rem';
        }
        
        // Adjust navigation buttons
        document.querySelectorAll('.btn-icon').forEach(btn => {
            btn.style.padding = '8px';
            btn.style.fontSize = '0.85rem';
        });
    } else if (isMidDesktop) {
        // Special handling for 1200px-1569px range
        if (examTitle) {
            examTitle.style.fontSize = '1.4rem';
        }
        
        if (timerDisplay) {
            timerDisplay.style.fontSize = '1rem';
        }
        
        // Ensure the header has proper scrolling
        const examHeader = document.querySelector('.exam-header');
        if (examHeader) {
            examHeader.style.overflowY = 'auto';
            examHeader.style.height = 'calc(100vh - 120px)';
        }
    } else {
        // Reset styles for larger screens
        if (examTitle) {
            examTitle.style.fontSize = '';
        }
        
        if (timerDisplay) {
            timerDisplay.style.fontSize = '';
        }
        
        document.querySelectorAll('.btn-icon').forEach(btn => {
            btn.style.padding = '';
            btn.style.fontSize = '';
        });
    }
}

// Setup mobile menu functionality
function setupMobileMenu() {
    // Get the mobile menu toggle by both ID and class if needed
    const mobileMenuToggleEl = document.getElementById('mobile-menu-toggle') || document.querySelector('.mobile-menu-toggle');
    const navigationEl = document.querySelector('nav');
    let menuOverlayEl = document.querySelector('.menu-overlay');
    
    console.debug('Mobile Menu Setup:', { 
        mobileMenuToggle: mobileMenuToggleEl, 
        navigation: navigationEl, 
        menuOverlay: menuOverlayEl
    });
    
    if (mobileMenuToggleEl && navigationEl) {
        mobileMenuToggleEl.addEventListener('click', () => {
            console.debug('Mobile menu toggle clicked');
            mobileMenuToggleEl.classList.toggle('active');
            navigationEl.classList.toggle('active');
            
            // Create overlay if it doesn't exist
            if (!menuOverlayEl) {
                const overlay = document.createElement('div');
                overlay.className = 'menu-overlay';
                document.body.appendChild(overlay);
                menuOverlayEl = document.querySelector('.menu-overlay');
                console.debug('Created menu overlay:', menuOverlayEl);
                
                // Add click event to the newly created overlay
                menuOverlayEl.addEventListener('click', closeMenu);
            }
            
            menuOverlayEl.classList.toggle('active');
            
            // Prevent scrolling when menu is open
            document.body.style.overflow = navigationEl.classList.contains('active') ? 'hidden' : '';
        });
    } else {
        console.error('Mobile menu elements not found:', { 
            mobileMenuToggle: mobileMenuToggleEl, 
            navigation: navigationEl
        });
    }
    
    // Add close menu function for reuse
    function closeMenu() {
        if (mobileMenuToggleEl) mobileMenuToggleEl.classList.remove('active');
        if (navigationEl) navigationEl.classList.remove('active');
        if (menuOverlayEl) menuOverlayEl.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Add closeMenu to window to make it accessible from other functions
    window.closeMenu = closeMenu;
    
    // Setup the menu overlay if it exists
    if (menuOverlayEl) {
        menuOverlayEl.addEventListener('click', closeMenu);
    }
}

// Setup dropdown menu functionality
function setupDropdownMenus() {
    // Get updated dropdown toggle buttons (after header is loaded)
    const dropdownToggleButtons = document.querySelectorAll('.dropdown-toggle');
    
    // Handle click events for dropdown toggles
    dropdownToggleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close all other dropdowns
            dropdownToggleButtons.forEach(otherButton => {
                if (otherButton !== button) {
                    const otherMenu = otherButton.parentElement.querySelector('.dropdown-menu');
                    otherMenu.style.display = 'none';
                    otherMenu.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            const dropdown = this.parentElement;
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (window.innerWidth <= 992) {
                // For mobile: use classList for toggle
                if (menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    menu.style.display = 'none';
                } else {
                    menu.classList.add('active');
                    menu.style.display = 'block';
                }
            } else {
                // For desktop: use style.display
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }
        });
        
        // Add keyboard navigation
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
                menu.classList.remove('active');
            });
        }
    });
    
    // Add keyboard navigation for dropdown menu items
    document.querySelectorAll('.dropdown-menu li a').forEach(link => {
        link.addEventListener('keydown', function(e) {
            const parentMenu = this.closest('.dropdown-menu');
            const links = Array.from(parentMenu.querySelectorAll('a'));
            const currentIndex = links.indexOf(this);
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % links.length;
                links[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + links.length) % links.length;
                links[prevIndex].focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.closest('.dropdown').querySelector('.dropdown-toggle').focus();
                parentMenu.style.display = 'none';
            }
        });
    });
}