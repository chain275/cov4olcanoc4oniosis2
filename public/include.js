// Function to include HTML content from external files
async function includeHTML() {
    try {
        // Load header
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            const headerResponse = await fetch('header.html');
            if (headerResponse.ok) {
                const headerHtml = await headerResponse.text();
                headerPlaceholder.innerHTML = headerHtml;
                
                // Highlight current page in navigation
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage === 'index.html' || currentPage === '') {
                    const homeLink = document.querySelector('.nav-home');
                    if (homeLink) homeLink.classList.add('active');
                } else if (currentPage === 'contact.html') {
                    const contactLink = document.querySelector('.nav-contact');
                    if (contactLink) contactLink.classList.add('active');
                } else if (currentPage === 'donate.html') {
                    const donateLink = document.querySelector('.nav-donate');
                    if (donateLink) donateLink.classList.add('active');
                } else if (currentPage === 'tutors.html') {
                    const tutorsLink = document.querySelector('.nav-tutors');
                    if (tutorsLink) tutorsLink.classList.add('active');
                } else if (currentPage === 'progress.html') {
                    const progressLink = document.querySelector('.nav-progress');
                    if (progressLink) progressLink.classList.add('active');
                } else if (currentPage === 'Combined_Exam.html') {
                    const combinedLink = document.querySelector('.nav-combined-exam');
                    if (combinedLink) combinedLink.classList.add('active');
                }
                
                // Set active class for dropdown items
                const dropdownItems = [
                    { page: 'Short_conversation.html', selector: 'a[href="Short_conversation.html"]' },
                    { page: 'Long_conversation.html', selector: 'a[href="Long_conversation.html"]' },
                    { page: 'Advertisement.html', selector: 'a[href="Advertisement.html"]' },
                    { page: 'Product.html', selector: 'a[href="Product.html"]' },
                    { page: 'News_report.html', selector: 'a[href="News_report.html"]' },
                    { page: 'Article.html', selector: 'a[href="Article.html"]' },
                    { page: 'Text_completion.html', selector: 'a[href="Text_completion.html"]' },
                    { page: 'Paragraph.html', selector: 'a[href="Paragraph.html"]' }
                ];
                
                for (const item of dropdownItems) {
                    if (currentPage === item.page) {
                        const link = document.querySelector(item.selector);
                        if (link) {
                            link.classList.add('active');
                            // Also activate parent dropdown
                            const dropdownToggle = link.closest('.dropdown').querySelector('.dropdown-toggle');
                            if (dropdownToggle) dropdownToggle.classList.add('active');
                        }
                    }
                }
                
                // Initialize responsive menu functionality
                if (typeof setupMobileMenu === 'function') {
                    setTimeout(setupMobileMenu, 100);
                }
                
                // Initialize dropdown functionality
                if (typeof setupDropdownMenus === 'function') {
                    setTimeout(setupDropdownMenus, 100);
                }
            }
        }
        
        // Load footer
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            const footerResponse = await fetch('footer.html');
            if (footerResponse.ok) {
                const footerHtml = await footerResponse.text();
                footerPlaceholder.innerHTML = footerHtml;
                
                // Update copyright year
                const yearSpan = document.querySelector('.year');
                if (yearSpan) {
                    yearSpan.textContent = new Date().getFullYear();
                }
            }
        }
        
        // Initialize ad banners
        if (typeof initAdBanners === 'function') {
            setTimeout(initAdBanners, 200);
        }
        
        // Apply responsive layout after loading components
        if (typeof applyResponsiveLayout === 'function') {
            setTimeout(applyResponsiveLayout, 300);
        }
        
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Run the include function when the DOM is loaded
document.addEventListener('DOMContentLoaded', includeHTML); 