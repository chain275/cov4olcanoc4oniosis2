/**
 * TCAS Prep Slideshow JavaScript
 * Handles slideshow functionality, navigation, and transitions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create a test PNG image if needed
    createTestImage();
    
    // Initialize the slideshow
    loadImagesFromSlideshow();
});

/**
 * Generate a dynamic test PNG for demonstration
 */
function createTestImage() {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4361ee');
    gradient.addColorStop(1, '#7209b7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some text
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('TCAS Prep', canvas.width / 2, canvas.height / 2 - 24);
    
    ctx.font = '28px Inter, sans-serif';
    ctx.fillText('Dynamic PNG Slideshow Image', canvas.width / 2, canvas.height / 2 + 24);
    
    // Add current date/time for uniqueness
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height - 40);
    
    // Convert canvas to PNG data URL
    try {
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create an Image element with this data URL
        const img = new Image();
        img.src = dataUrl;
        
        // Add a special data attribute to identify this as a dynamically created PNG
        const heroSlideshow = document.querySelector('.hero-slideshow');
        if (heroSlideshow) {
            heroSlideshow.dataset.hasDynamicPng = 'true';
            
            // Add a hidden image that our image finder can discover
            const hiddenImg = document.createElement('img');
            hiddenImg.src = dataUrl;
            hiddenImg.alt = 'Dynamic PNG Test';
            hiddenImg.className = 'dynamic-png-test';
            hiddenImg.style.display = 'none';
            hiddenImg.dataset.filename = 'hero-slide3.png'; // Give it a name to match our pattern
            heroSlideshow.appendChild(hiddenImg);
            
            // Also add it to the paths we'll check
            setTimeout(() => {
                const slideshowContainer = document.getElementById('slideshow-container');
                const newSlide = document.createElement('div');
                newSlide.className = 'slide';
                newSlide.style.backgroundImage = `url('${dataUrl}')`;
                slideshowContainer.appendChild(newSlide);
                
                // Make sure slideshow is running
                if (slideshowContainer.children.length > 1) {
                    const slides = document.querySelectorAll('.slide');
                    if (slides.length > 1) {
                        // Reset the slideshow to work with the new slide
                        startSlideshow();
                    }
                }
            }, 1000); // Add it after a delay to make sure other slides loaded first
        }
    } catch (e) {
        console.error('Error creating dynamic PNG:', e);
    }
}

/**
 * Load and check images from the slideshow folder
 */
function loadImagesFromSlideshow() {
    const slideshowContainer = document.getElementById('slideshow-container');
    slideshowContainer.innerHTML = ''; // Clear container
    
    // We'll scan the filesystem more thoroughly for any images regardless of name
    const imagePaths = [];
    
    // First add the images in the slideshow folder that match our pattern
    for (let i = 1; i <= 3; i++) {
        imagePaths.push(`../assets/images/slideshow/hero-slide${i}.jpg`);
        //imagePaths.push(`images/slideshow/hero-slide${i}.png`);
    }
    
    // Then add any other jpg or png files that might be in the folder
    
    // Try to load each image and only add those that exist
    const validImages = [];
    let loadedCount = 0;
    let totalChecks = imagePaths.length;
    
    // Ensure we have at least one slide while loading
    const placeholderSlide = document.createElement('div');
    placeholderSlide.className = 'slide active';
    placeholderSlide.style.backgroundColor = '#4361ee'; // Use theme color as fallback
    slideshowContainer.appendChild(placeholderSlide);
    
    imagePaths.forEach(path => {
        const img = new Image();
        
        img.onload = function() {
            // Image exists, add to valid images if not already included
            if (!validImages.includes(path)) {
                validImages.push(path);
                console.log('Found valid image:', path);
            }
            
            loadedCount++;
            if (loadedCount === totalChecks) {
                renderSlides(validImages);
            }
        };
        
        img.onerror = function() {
            // Image doesn't exist
            console.log('Image not found:', path);
            loadedCount++;
            if (loadedCount === totalChecks) {
                renderSlides(validImages);
            }
        };
        
        img.src = path;
    });
    
    // After a timeout, render any slides that were found in case we're still waiting
    setTimeout(() => {
        if (validImages.length > 0) {
            renderSlides(validImages);
        }
    }, 2000); // Give it 2 seconds to try loading images
}

/**
 * Render slides after loading checks
 */
function renderSlides(validImages) {
    console.log('Rendering slides with', validImages.length, 'images');
    
    if (validImages.length === 0) {
        // No valid images were found, keep the placeholder
        return;
    }
    
    // Sort the images so they display in a consistent order
    validImages.sort((a, b) => {
        // Extract numeric part from filename for sorting
        const getNumberFromPath = (path) => {
            const match = path.match(/hero-slide(\d+)/);
            return match ? parseInt(match[1]) : 999; // Non-numbered files go last
        };
        
        const numA = getNumberFromPath(a);
        const numB = getNumberFromPath(b);
        
        return numA - numB;
    });
    
    // Clear container and add all slides
    const slideshowContainer = document.getElementById('slideshow-container');
    slideshowContainer.innerHTML = '';
    
    // Create a background container to prevent flashing
    const backgroundDiv = document.createElement('div');
    backgroundDiv.style.position = 'absolute';
    backgroundDiv.style.top = '0';
    backgroundDiv.style.left = '0';
    backgroundDiv.style.width = '100%';
    backgroundDiv.style.height = '100%';
    backgroundDiv.style.backgroundColor = '#FFFFFF'; // White background to prevent dark flash
    slideshowContainer.appendChild(backgroundDiv);
    
    validImages.forEach((imgPath, index) => {
        // Preload image to ensure it's ready before showing
        const preloadImg = new Image();
        preloadImg.src = imgPath;
        
        const slide = document.createElement('div');
        slide.className = index === 0 ? 'slide active' : 'slide';
        slide.style.backgroundImage = `url('${imgPath}')`;
        slideshowContainer.appendChild(slide);
        console.log('Added slide:', imgPath, index === 0 ? '(active)' : '');
    });
    
    // Create navigation dots
    createNavigationDots(validImages.length);
    
    // Start the slideshow
    if (slideshowContainer.children.length > 2) { // > 2 because we added the background div
        startSlideshow();
    }
}

/**
 * Create navigation dots for slideshow
 */
function createNavigationDots(count) {
    const dotsContainer = document.getElementById('slide-dots');
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = i === 0 ? 'dot active' : 'dot';
        dot.dataset.index = i;
        dot.addEventListener('click', function() {
            goToSlide(parseInt(this.dataset.index));
        });
        dotsContainer.appendChild(dot);
    }
}

/**
 * Start the slideshow with transitions and navigation
 */
function startSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    console.log('Starting slideshow with', slides.length, 'slides');
    
    if (slides.length <= 1) return; // Don't start slideshow if there's only one image
    
    let currentSlide = 0;
    
    function showSlide(index) {
        // First, make the current slide active
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
            } else {
                // Only start removing the active class after a short delay
                // to ensure the new slide is fully visible first
                setTimeout(() => {
                    slide.classList.remove('active');
                }, 100);
            }
        });
        
        // Update navigation dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        console.log('Showing slide', index + 1, 'of', slides.length);
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    // Function to go to a specific slide (used by dots)
    window.goToSlide = function(index) {
        currentSlide = index;
        showSlide(currentSlide);
        resetTimer();
    };
    
    // Reset timer when manually changing slides
    function resetTimer() {
        if (window.slideshowInterval) {
            clearInterval(window.slideshowInterval);
            window.slideshowInterval = setInterval(nextSlide, 9000);
        }
    }
    
    // Clear any existing intervals
    if (window.slideshowInterval) {
        clearInterval(window.slideshowInterval);
    }
    
    // Add click event listeners to navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            prevSlide();
            resetTimer();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            nextSlide();
            resetTimer();
        });
    }
    
    // Auto-advance slides every 9 seconds
    window.slideshowInterval = setInterval(nextSlide, 9000);
    console.log('Slideshow interval set for 9 seconds');
} 