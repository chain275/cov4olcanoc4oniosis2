// Responsive variables
let windowWidth = window.innerWidth;
let isMobile = window.innerWidth < 768;
let isTablet = window.innerWidth >= 768 && window.innerWidth < 992;
let isDesktop = window.innerWidth >= 992;
let isMidDesktop = window.innerWidth >= 1200 && window.innerWidth < 1570;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create menu overlay if it doesn't exist
    let menuOverlay = document.getElementById('menu-overlay') || document.querySelector('.menu-overlay');
    if (!menuOverlay) {
        const overlay = document.createElement('div');
        overlay.id = 'menu-overlay';
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }
    
    // Initialize all responsive components
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
    const navigation = document.getElementById('main-nav');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const menuOverlay = document.getElementById('menu-overlay');
    
    // Reset mobile menu when resizing to desktop
    if (window.innerWidth > 991) {
        // Remove active classes when resizing to desktop
        document.querySelectorAll('.dropdown.active, .dropdown-submenu.active').forEach(el => {
            el.classList.remove('active');
        });
        
        // Reset mobile menu
        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        if (navigation) navigation.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
    }
    
    // Reset dropdown menus based on screen size
    document.querySelectorAll('.dropdown-menu, .submenu').forEach(menu => {
        if (window.innerWidth > 991) {
            menu.style.display = '';
        } else {
            if (!menu.closest('.dropdown, .dropdown-submenu').classList.contains('active')) {
                menu.style.display = 'none';
            }
        }
    });
    
    // Adjust exam layout if exam content is visible
    if (examContentSection && !examContentSection.classList.contains('hidden')) {
        adjustExamLayout();
    }
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
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const menuOverlay = document.getElementById('menu-overlay');
    
    if (!mobileMenuToggle || !mainNav || !menuOverlay) {
        console.warn('Mobile menu elements not found:', { 
            mobileMenuToggle, 
            mainNav, 
            menuOverlay 
        });
        return;
    }
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Prevent scrolling when menu is open
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking overlay
    menuOverlay.addEventListener('click', function() {
        closeMenu();
    });
    
    // Add close menu function for reuse
    function closeMenu() {
        mobileMenuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
    }
    
    // Add closeMenu to window to make it accessible from other functions
    window.closeMenu = closeMenu;
}

// Setup dropdown menu functionality
function setupDropdownMenus() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    // Handle all dropdown toggles
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get parent element (dropdown or dropdown-submenu)
            const parent = this.closest('.dropdown, .dropdown-submenu');
            const isMobile = window.innerWidth <= 991;
            const isSubmenu = parent.classList.contains('dropdown-submenu');
            
            // For mobile view or submenu toggles
            if (isMobile || isSubmenu) {
                // Toggle active class on the parent
                parent.classList.toggle('active');
                
                // Get the menu to show/hide
                const menu = isSubmenu 
                    ? parent.querySelector('.submenu') 
                    : parent.querySelector('.dropdown-menu');
                
                // Toggle display based on active state
                if (parent.classList.contains('active')) {
                    menu.style.display = 'block';
                    
                    // For mobile submenu, make it static
                    if (isMobile && isSubmenu) {
                        menu.style.position = 'static';
                        menu.style.boxShadow = 'none';
                        menu.style.opacity = '1';
                        menu.style.visibility = 'visible'; 
                        menu.style.transform = 'none';
                        menu.style.width = '100%';
                    }
                } else {
                    menu.style.display = 'none';
                }
                
                // Close other dropdowns at same level
                const siblings = parent.parentElement.querySelectorAll('.dropdown, .dropdown-submenu');
                siblings.forEach(sibling => {
                    if (sibling !== parent) {
                        sibling.classList.remove('active');
                        
                        // Hide sibling menus
                        const siblingMenu = isSubmenu 
                            ? sibling.querySelector('.submenu')
                            : sibling.querySelector('.dropdown-menu');
                            
                        if (siblingMenu) {
                            siblingMenu.style.display = 'none';
                        }
                    }
                });
            }
        });
        
        // Add keyboard navigation
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown') && window.innerWidth > 991) {
            document.querySelectorAll('.dropdown-menu, .submenu').forEach(menu => {
                menu.style.display = 'none';
            });
            
            document.querySelectorAll('.dropdown.active, .dropdown-submenu.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // Add keyboard navigation for menu items
    document.querySelectorAll('.dropdown-menu li a, .submenu li a').forEach(link => {
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close menu on escape
                const parentDropdown = this.closest('.dropdown, .dropdown-submenu');
                if (parentDropdown) {
                    parentDropdown.classList.remove('active');
                    
                    const menu = parentDropdown.querySelector('.dropdown-menu, .submenu');
                    if (menu) {
                        menu.style.display = 'none';
                    }
                }
            }
        });
    });
}