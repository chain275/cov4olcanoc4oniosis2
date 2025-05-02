// Function to include HTML content from external files
async function includeHTML() {
    // Find all elements with data-include attribute
    const includeElements = document.querySelectorAll('[data-include]');
    
    // Process each include element
    for (const element of includeElements) {
        const file = element.getAttribute('data-include');
        try {
            const response = await fetch(file + '.html');
            if (response.ok) {
                const html = await response.text();
                element.innerHTML = html;
                
                // If this is a header, handle navigation highlighting
                if (file === 'header' || file === 'header-contact') {
                    // Highlight current page in navigation
                    const currentPage = window.location.pathname.split('/').pop();
                    if (currentPage === 'index.html' || currentPage === '') {
                        const homeLink = document.querySelector('.nav-home');
                        if (homeLink) homeLink.classList.add('active');
                    } else if (currentPage === 'contact.html') {
                        const contactLink = document.querySelector('.nav-contact');
                        if (contactLink) contactLink.classList.add('active');
                    } else if (currentPage === 'Long_Conversation.html') {
                        const multipleLink = document.querySelector('.nav-multiple');
                        if (multipleLink) multipleLink.classList.add('active');
                    }
                    
                    // Initialize dropdown functionality
                    if (typeof setupDropdownMenus === 'function') {
                        setTimeout(setupDropdownMenus, 100);
                    }
                }
                
                // If this is a footer, update copyright year
                if (file === 'footer') {
                    const yearSpan = document.querySelector('.year');
                    if (yearSpan) {
                        yearSpan.textContent = new Date().getFullYear();
                    }
                }
            }
        } catch (error) {
            console.error(`Error loading ${file}.html:`, error);
        }
    }
}

// Run the include function when the DOM is loaded
document.addEventListener('DOMContentLoaded', includeHTML); 