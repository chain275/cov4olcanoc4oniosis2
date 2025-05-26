/**
 * CSRF Protection Script
 * This script adds CSRF tokens to all forms on the website
 */

(function() {
    // Generate a random token
    function generateCSRFToken(length = 32) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < length; i++) {
            token += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return token;
    }

    // Function to set a cookie
    function setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/; Secure; SameSite=Strict; HttpOnly';
    }

    // Function to get a cookie
    function getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Get the CSRF token from cookie or generate a new one
    function getCSRFToken() {
        let token = getCookie('csrf_token');
        if (!token) {
            token = generateCSRFToken();
            setCookie('csrf_token', token, 1); // Set token to expire in 1 day
        }
        return token;
    }

    // Add CSRF token to all forms
    function addCSRFTokenToForms() {
        const token = getCSRFToken();
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Skip forms that already have a CSRF token
            if (form.querySelector('input[name="csrf_token"]')) {
                return;
            }
            
            // Create the CSRF token input
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'csrf_token';
            input.value = token;
            
            // Add the input to the form
            form.appendChild(input);
        });
    }

    // Add CSRF tokens to AJAX requests
    function setupAjaxCSRF() {
        const token = getCSRFToken();
        
        // Add CSRF token to XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function() {
            const result = originalXHROpen.apply(this, arguments);
            const method = arguments[0].toUpperCase();
            
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                this.setRequestHeader('X-CSRF-Token', token);
            }
            
            return result;
        };
        
        // Add CSRF token to fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (!options.headers) {
                options.headers = {};
            }
            
            // Convert headers to plain object if it's a Headers instance
            if (options.headers instanceof Headers) {
                const plainHeaders = {};
                for (const [key, value] of options.headers.entries()) {
                    plainHeaders[key] = value;
                }
                options.headers = plainHeaders;
            }
            
            const method = options.method ? options.method.toUpperCase() : 'GET';
            
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                options.headers['X-CSRF-Token'] = token;
            }
            
            return originalFetch.call(window, url, options);
        };
    }

    // Run when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        addCSRFTokenToForms();
        setupAjaxCSRF();
        
        // Handle dynamically added forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // Check if any new forms were added
                    const forms = [];
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeName === 'FORM') {
                            forms.push(node);
                        } else if (node.querySelectorAll) {
                            const newForms = node.querySelectorAll('form');
                            if (newForms.length > 0) {
                                forms.push(...newForms);
                            }
                        }
                    });
                    
                    if (forms.length > 0) {
                        addCSRFTokenToForms();
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})(); 