// DOM Elements
const examListContainer = document.getElementById('exam-list');
const examContentSection = document.getElementById('exam-content');
const examTitle = document.getElementById('exam-title');
const examQuestionsContainer = document.getElementById('exam-questions');
const submitExamBtn = document.getElementById('submit-exam');
const resultsSection = document.getElementById('results');
const scoreElement = document.getElementById('score');
const scorePath = document.getElementById('score-path');
const correctCountElement = document.getElementById('correct-count');
const totalQuestionsElement = document.getElementById('total-questions');
const timeTakenElement = document.getElementById('time-taken');
const performanceTextElement = document.getElementById('performance-text');
const feedbackContainer = document.getElementById('feedback');
const feedbackList = document.querySelector('.feedback-list');
const backToListBtn = document.getElementById('back-to-list');
const viewFeedbackBtn = document.getElementById('view-feedback');

// New UI Elements
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navigation = document.querySelector('nav');
const menuOverlay = document.querySelector('.menu-overlay');
const progressFill = document.getElementById('progress-fill');
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsProgressElement = document.getElementById('total-questions-progress');
const prevQuestionBtn = document.getElementById('prev-question');
const nextQuestionBtn = document.getElementById('next-question');
const backButton = document.getElementById('back-button');
const timerDisplay = document.getElementById('timer-display');

// Dropdown menu elements
const dropdownToggleButtons = document.querySelectorAll('.dropdown-toggle');

// Skill-specific score elements
const readingScoreElement = document.getElementById('reading-score');
const readingScorePath = document.getElementById('reading-score-path');
const readingCorrectElement = document.getElementById('reading-correct');
const readingTotalElement = document.getElementById('reading-total');

const writingScoreElement = document.getElementById('writing-score');
const writingScorePath = document.getElementById('writing-score-path');
const writingCorrectElement = document.getElementById('writing-correct');
const writingTotalElement = document.getElementById('writing-total');

const speakingScoreElement = document.getElementById('speaking-score');
const speakingScorePath = document.getElementById('speaking-score-path');
const speakingCorrectElement = document.getElementById('speaking-correct');
const speakingTotalElement = document.getElementById('speaking-total');

// Global variables
let exams = [];
let currentExam = null;
let userAnswers = [];
let examStartTime = null;
let examEndTime = null;
let currentExamIndex = 0;
let timerInterval = null;

// Event handler functions for navigation
let navigateToPrevQuestion = null;
let navigateToNextQuestion = null;
let exitExamHandler = null;


// Responsive variables
let windowWidth = window.innerWidth;
let isMobile = window.innerWidth < 768;
let isTablet = window.innerWidth >= 768 && window.innerWidth < 1030;
let isDesktop = window.innerWidth >= 1030;
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
            (windowWidth >= 768 && windowWidth < 1030 && (newWidth < 768 || newWidth >= 1030)) ||
            (windowWidth >= 1030 && windowWidth < 1200 && (newWidth < 1030 || newWidth >= 1200)) ||
            (windowWidth >= 1200 && windowWidth < 1570 && (newWidth < 1200 || newWidth >= 1570)) ||
            (windowWidth >= 1570 && newWidth < 1570)
        ) {
            windowWidth = newWidth;
            isMobile = newWidth < 768;
            isTablet = newWidth >= 768 && newWidth < 1030;
            isDesktop = newWidth >= 1030;
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
    if (window.innerWidth > 1030) {
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
        if (window.innerWidth > 1030) {
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
            const isMobile = window.innerWidth <= 1030;
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
        if (!e.target.closest('.dropdown') && window.innerWidth > 1030) {
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

// Fetch exam data from file
async function fetchExamData() {
    try {
        // Determine which JSON file to load based on the current page
        let jsonFile = '../data/exams.json';
        
        // Get the current page filename
        const currentPage = window.location.pathname.split('/').pop();
        
        // Check if we're on a specific exam page and adjust the JSON file accordingly
        if (currentPage === 'Product.html') {
            jsonFile = '../data/Product.json';
        } else if (currentPage === 'Article.html') {
            jsonFile = '../data/Article.json';
        } else if (currentPage === 'Paragraph.html') {
            jsonFile = '../data/Paragraph.json';
        } else if (currentPage === 'Short_conversation.html') {
            jsonFile = '../data/Short_conversation.json';
        } else if (currentPage === 'Long_conversation.html') {
            jsonFile = '../data/Long_conversation.json';
        } else if (currentPage === 'News_report.html') {
            jsonFile = '../data/News_report.json';
        } else if (currentPage === 'Advertisement.html') {
            jsonFile = '../data/Advertisement.json';
        } else if (currentPage === 'Text_completion.html') {
            jsonFile = '../data/Text_completion.json';
        }
        
        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error('Failed to fetch exam data');
        }
        exams = await response.json();
        displayExamList();
    } catch (error) {
        console.error('Error loading exam data:', error);
        if (examListContainer) {
            examListContainer.innerHTML = `<p class="error">Error loading exam data. Please try again later.</p>`;
        }
    }
}

// Display list of available exams
function displayExamList() {
    if (exams.length === 0) {
        examListContainer.innerHTML = '<p>No exams available at the moment.</p>';
        return;
    }

    examListContainer.innerHTML = '';
    exams.forEach(exam => {
        const examCard = document.createElement('div');
        examCard.className = 'exam-card';
        examCard.dataset.examId = exam.id;
        
        examCard.innerHTML = `
            <h3>${exam.title}</h3>
            <p>${exam.description}</p>
            <p><b>เวลา:</b> ${exam.duration} minutes</p>
            <p><qb>จำนวนข้อ:</qb> ${exam.totalQuestions}</p>
            <button class="btn start-exam">เริ่มบททดสอบ</button>
        `;
        
        examCard.querySelector('.start-exam').addEventListener('click', () => startExam(exam.id));
        examListContainer.appendChild(examCard);
    });
}

// Start the exam
function startExam(examId) {
    currentExam = exams.find(exam => exam.id === examId);
    if (!currentExam) return;
    
    // Reset global state
    userAnswers = [];
    currentExamIndex = 0;
    examStartTime = new Date();
    
    // Clear previous exam content if any
    examQuestionsContainer.innerHTML = '';
    
    // Reset results section if it was previously shown
    if (!resultsSection.classList.contains('hidden')) {
        resultsSection.classList.add('hidden');
        resultsSection.style.display = 'none';
    }
    
    // Reset the exam header and content section styles
    examContentSection.style.opacity = '';
    examContentSection.style.transform = '';
    examContentSection.style.display = '';
    
    // Set up the exam UI
    examTitle.textContent = currentExam.title;
    
    // Reset any subtitle
    const existingSubtitle = document.getElementById('exam-subtitle');
    if (existingSubtitle) {
        existingSubtitle.remove();
    }
    
    // Add subtitle if available
    if (currentExam.subtitle) {
        // Check if subtitle element exists, create if not
        let subtitleElement = document.createElement('p');
        subtitleElement.id = 'exam-subtitle';
        const titleContainer = examTitle.closest('.exam-title-container');
        titleContainer.appendChild(subtitleElement);
        subtitleElement.innerHTML = formatWithLineBreaks(currentExam.subtitle);
    }
    
    // Update exam information in the header
    const totalQuestionsInfo = document.getElementById('info-total-questions');
    if (totalQuestionsInfo) {
        totalQuestionsInfo.textContent = currentExam.questions.length;
    }
    
    const timeLimitInfo = document.getElementById('info-time-limit');
    if (timeLimitInfo && currentExam.duration) {
        timeLimitInfo.textContent = `${currentExam.duration} minutes`;
    }
    
    // Create questions
    currentExam.questions.forEach((question, index) => {
        const questionElement = createQuestionElement(question, index);
        examQuestionsContainer.appendChild(questionElement);
        
        // Initialize user answers array
        userAnswers.push(null);
    });
    
    // Set up navigation
    updateQuestionNavigation();
    
    // Show first question, hide others
    showQuestion(0);
    
    // Update progress indicators
    updateProgress();
    
    // Set up question navigator
    setupQuestionNavigator();
    
    // Hide slideshow
    const heroSlideshow = document.querySelector('.hero-slideshow');
    if (heroSlideshow) {
        heroSlideshow.style.display = 'none';
    }
    
    // Prepare exam content for transition
    examContentSection.classList.remove('hidden');
    
    // Hide exam list with a fade out effect
    const examContainer = document.getElementById('exam-container');
    examContainer.style.opacity = '0';
    examContainer.style.transform = 'translateY(-20px)';
    examContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // After a brief delay, hide exam container and ensure content is visible
    setTimeout(() => {
        examContainer.classList.add('hidden');
        examContainer.style.opacity = '';
        examContainer.style.transform = '';
        examContainer.style.display = 'none';
        
        // Scroll to exam content with smooth animation
        examContentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    
    // Stop any existing timer and start a new one
    stopTimer();
    startTimer();
    
    // Setup event listeners for navigation
    setupNavigationListeners();
    
    // Apply responsive layout adjustments
    adjustExamLayout();
}

// Helper function specifically for formatting conversation questions
function formatConversationQuestion(text) {
    if (!text) return '';
    
    // First replace newlines with <br> tags
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Split the text into lines
    const lines = formattedText.split('<br>');
    
    // Create a conversation container
    formattedText = '<div class="conversation-container">';
    
    // Process each line
    lines.forEach(line => {
        if (line.trim()) {
            // Check if this line matches the "Name: Value" pattern
            const match = line.match(/([^<>:]+):\s*(.*)/);
            
            if (match) {
                const speakerName = match[1].trim();
                const speakerText = match[2].trim();
                
                // Add a conversation line with properly indented name
                formattedText += `
                    <div class="conversation-line">
                        <div class="speaker-name">${speakerName}:</div>
                        <div class="speaker-text">${speakerText}</div>
                    </div>
                `;
            } else {
                // Handle lines without the pattern as regular text
                formattedText += `<p>${line}</p>`;
            }
        }
    });
    
    // Close the conversation container
    formattedText += '</div>';
    
    return formattedText;
}

// Create a question element
function createQuestionElement(question, index) {
    const questionElement = document.createElement('div');
    questionElement.className = 'question';
    questionElement.dataset.index = index;
    questionElement.dataset.questionType = question.type || 'general';
    
    let optionsHTML = '';
    if (question.options) {
        // Create a copy of the options and store the correct answer
        const originalOptions = [...question.options];
        const correctOption = originalOptions[question.correctAnswer];
        
        // Store original options for feedback
        questionElement.dataset.originalOptions = JSON.stringify(originalOptions);
        
        // Shuffle the options
        const shuffledOptions = shuffleArray(originalOptions);
        
        // Store shuffled options for feedback
        questionElement.dataset.shuffledOptions = JSON.stringify(shuffledOptions);
        
        // Find the new index of the correct answer after shuffling
        const newCorrectIndex = shuffledOptions.indexOf(correctOption);
        
        // Store the mapping for this question in a data attribute
        questionElement.dataset.shuffleMap = JSON.stringify({
            originalCorrect: question.correctAnswer,
            newCorrect: newCorrectIndex
        });
        
        optionsHTML = `
            <div class="options">
                ${shuffledOptions.map((option, optIndex) => `
                    <div class="option">
                        <input type="radio" name="question-${index}" id="option-${index}-${optIndex}" value="${optIndex}">
                        <label for="option-${index}-${optIndex}">${option}</label>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    let imageHTML = '';
    if (question.image) {
        imageHTML = `
            <div class="question-image-container">
                <img src="${question.image}" alt="Question image" class="question-image">
            </div>
        `;
    }
    
    // Get the current page to determine formatting
    const currentPage = window.location.pathname.split('/').pop();
    const isConversationPage = currentPage === 'Short_conversation.html' || currentPage === 'Long_conversation.html';
    
    // Use special formatting for conversation questions
    const formattedText = isConversationPage 
        ? formatConversationQuestion(question.text)
        : `<question_text>${formatWithLineBreaks(question.text)}</question_text>`;
    
    questionElement.innerHTML = `
        <div class="question-type">${capitalizeFirstLetter(question.type || 'general')}</div>
        <div class="progress-text">
            Question <span id="current-question-inline">${currentExamIndex + 1}
        </div>
        <h3>${question.prompt}</h3>
        ${imageHTML}
        ${formattedText}
        ${optionsHTML}
    `;
    
    // Add event listeners to radio buttons
    const radioButtons = questionElement.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            userAnswers[index] = parseInt(radio.value);
            updateProgress();
        });
    });
    
    return questionElement;
}

// Show a specific question
function showQuestion(index) {
    // Validate index
    if (index < 0) index = 0;
    if (index >= currentExam.questions.length) index = currentExam.questions.length - 1;
    
    currentExamIndex = index;
    
    // Hide all questions
    const questions = examQuestionsContainer.querySelectorAll('.question');
    questions.forEach(q => q.classList.add('hidden'));
    
    // Show current question
    const currentQuestion = examQuestionsContainer.querySelector(`.question[data-index="${index}"]`);
    if (currentQuestion) {
        currentQuestion.classList.remove('hidden');
    }
    
    // Update navigation buttons
    updateQuestionNavigation();
    
    // Update progress indicators
    currentQuestionElement.textContent = index + 1;
    
    // Update inline progress counters if they exist
    const inlineCurrentElement = currentQuestion.querySelector('#current-question-inline');
    if (inlineCurrentElement) {
        inlineCurrentElement.textContent = index + 1;
    }
    
    updateProgress();
    
    // Scroll question into view with smooth animation
    if (currentQuestion) {
        currentQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Update question navigation buttons
function updateQuestionNavigation() {
    prevQuestionBtn.disabled = currentExamIndex === 0;
    nextQuestionBtn.disabled = currentExamIndex === currentExam.questions.length - 1;
    
    // Show/hide buttons based on position
    if (currentExamIndex === currentExam.questions.length - 1) {
        nextQuestionBtn.classList.add('hidden');
        submitExamBtn.classList.remove('hidden');
    } else {
        nextQuestionBtn.classList.remove('hidden');
        submitExamBtn.classList.add('hidden');
    }
    
    // Apply responsive adjustments
    adjustExamLayout();
}

// Set up navigation listeners
function setupNavigationListeners() {
    // Remove any existing event listeners
    if (navigateToPrevQuestion) {
        prevQuestionBtn.removeEventListener('click', navigateToPrevQuestion);
    }
    if (navigateToNextQuestion) {
        nextQuestionBtn.removeEventListener('click', navigateToNextQuestion);
    }
    if (exitExamHandler) {
        backButton.removeEventListener('click', exitExamHandler);
    }
    
    // Define new handler functions
    navigateToPrevQuestion = function() {
        showQuestion(currentExamIndex - 1);
    };
    
    navigateToNextQuestion = function() {
        console.log(`Next button clicked. Current index before increment: ${currentExamIndex}, Total questions: ${currentExam.questions.length}`);
        // Ensure we are not already on the last question before trying to advance
        if (currentExamIndex < currentExam.questions.length - 1) {
            showQuestion(currentExamIndex + 1);
            console.log(`Index after calling showQuestion: ${currentExamIndex}`);
        } else {
             console.warn('Next button clicked but already on the last question or index out of bounds.');
             // Optionally ensure the UI reflects the correct state if something went wrong
             updateQuestionNavigation();
        }
    };
    
    exitExamHandler = function() {
        if (confirm('Are you sure you want to exit this exam? Your progress will be lost.')) {
            stopTimer();
            
            // Fade out exam content
            examContentSection.style.opacity = '0';
            examContentSection.style.transform = 'translateY(-20px)';
            examContentSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                // Completely hide exam content
                examContentSection.classList.add('hidden');
                examContentSection.style.opacity = '';
                examContentSection.style.transform = '';
                examContentSection.style.display = 'none';
                
                // Show the exam list with a fade in effect
                const examContainer = document.getElementById('exam-container');
                examContainer.classList.remove('hidden');
                examContainer.style.display = 'block';
                examContainer.style.opacity = '0';
                examContainer.style.transform = 'translateY(20px)';
                
                // Force reflow
                void examContainer.offsetWidth;
                
                examContainer.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                examContainer.style.opacity = '1';
                examContainer.style.transform = 'translateY(0)';
                
                // Show slideshow again
                const heroSlideshow = document.querySelector('.hero-slideshow');
                if (heroSlideshow) {
                    heroSlideshow.style.display = 'block';
                }
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        }
    };
    
    // Add the new event listeners
    prevQuestionBtn.addEventListener('click', navigateToPrevQuestion);
    nextQuestionBtn.addEventListener('click', navigateToNextQuestion);
    backButton.addEventListener('click', exitExamHandler);
}

// Set up the question navigator
function setupQuestionNavigator() {
    const navigatorContainer = document.getElementById('question-navigator');
    if (!navigatorContainer) return;
    
    navigatorContainer.innerHTML = '';
    
    // Set the total question count
    const totalQuestionCountElement = document.getElementById('total-question-count');
    if (totalQuestionCountElement) {
        totalQuestionCountElement.textContent = `${currentExam.questions.length} คำถาม`;
    }
    
    // Create a button for each question
    currentExam.questions.forEach((question, index) => {
        const navItem = document.createElement('div');
        navItem.className = 'question-nav-item';
        navItem.textContent = index + 1;
        navItem.dataset.index = index;
        
        if (index === currentExamIndex) {
            navItem.classList.add('current');
        }
        
        navItem.addEventListener('click', () => {
            showQuestion(parseInt(navItem.dataset.index));
        });
        
        navigatorContainer.appendChild(navItem);
    });
}

// Update progress indicators with more info
function updateProgress() {
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const progressPercentage = (answeredCount / currentExam.questions.length) * 100;
    

    // Update the regular progress bar
    progressFill.style.width = `${progressPercentage}%`;
    
    // Update the visual progress indicator
    const visualProgressFill = document.getElementById('visual-progress-fill');
    if (visualProgressFill) {
        visualProgressFill.style.width = `${progressPercentage}%`;
    }


    
    // Update the answered count
    const answeredCountElement = document.getElementById('answered-count');
    if (answeredCountElement) {
        answeredCountElement.textContent = `${answeredCount} เลือกคำตอบแล้ว`;
    }
    
    // Update the question nav items
    updateQuestionNavItems();
}

// Update the question navigator to reflect answered/current questions
function updateQuestionNavItems() {
    const questionNavItems = document.querySelectorAll('.question-nav-item');
    
    questionNavItems.forEach((item, index) => {
        // Reset classes
        item.classList.remove('current', 'answered');
        
        // Set current
        if (index === currentExamIndex) {
            item.classList.add('current');
        }
        
        // Set answered
        if (userAnswers[index] !== null) {
            item.classList.add('answered');
        }
    });
}

// Start the timer
function startTimer() {
    let seconds = 0;
    timerDisplay.textContent = '00:00';
    
    stopTimer(); // Clear any existing timer
    
    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        // Remove the subtitle animation when timer changes
        // No longer making exam-subtitle move when timer changes
    }, 1000);
}

// Stop the timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to convert newlines to <br> tags and format conversations
function formatWithLineBreaks(text) {
    if (!text) return '';
    
    // First replace newlines with <br> tags
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Get the current page to determine additional formatting
    const currentPage = window.location.pathname.split('/').pop();
    
    // Apply bold formatting for specific pages
    if (['Product.html', 'Paragraph.html', 'Article.html', 'Advertisement.html','product.html','News_report.html','text_completion.html',].includes(currentPage)) {
        // Replace text between ** ** with <strong> tags
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    
    // Skip conversation formatting for Advertisement.html
    if (currentPage === 'Advertisement.html') {
        // For Advertisement.html, make text after colon bold and black
        formattedText = formattedText.split('<br>').map(line => {
            if (!line.trim()) return '';
            
            // Check if line contains a colon
            if (line.includes(':')) {
                const [prefix, ...rest] = line.split(':');
                const remainingText = rest.join(':'); // In case there are multiple colons
                
                // Make text after colon bold and black with !important to override conflicting styles
                return `<strong class="adv-content" style="color: black !important; font-weight: bold !important;">${prefix}:</strong> <p class="adv-paragraph">${remainingText}</p>`;
            } else {
                return `<p class="adv-paragraph">${line}</p>`;
            }
        }).join('');
        return formattedText;
    }
    if (['Long_conversation.html', 'Short_conversation.html', 'Paragraph.html',].includes(currentPage)) {
    // Check if text contains "Name: Value" patterns (conversation format)
        const hasNameValuePairs = /([^<>:]+):\s*([^<>]+)(?:<br>|$)/.test(formattedText);
        
        if (hasNameValuePairs) {
            // First, split the text into lines
            const lines = formattedText.split('<br>');
            
            // Create a conversation container
            formattedText = '<div class="conversation-container">';
            
            // Process each line
            lines.forEach(line => {
                if (line.trim()) {
                    // Check if this line matches the "Name: Value" pattern
                    const match = line.match(/([^<>:]+):\s*(.*)/);
                    
                    if (match) {
                        const speakerName = match[1].trim();
                        const speakerText = match[2].trim();
                        
                        // Add a conversation line with properly indented name
                        formattedText += `
                            <div class="conversation-line">
                                <div class="speaker-name">${speakerName}:</div>
                                <div class="speaker-text">${speakerText}</div>
                            </div>
                        `;
                    } else {
                        // Handle lines without the pattern as regular text
                        formattedText += `<p>${line}</p>`;
                    }
                }
            });}
        
        // Close the conversation container
        formattedText += '</div>';
    } else {
        // For regular text without name-value pairs, wrap in paragraph tags
        if (currentPage === 'Text_completion.html') {
            formattedText = formattedText.split('<br>').map(line => 
                line.trim() ? `<Tc>${line}</Tc>` : ''
            ).join('');}
        else { 
        formattedText = formattedText.split('<br>').map(line => 
            line.trim() ? `<p>${line}</p>` : ''
        ).join('');}
    }
    
    return formattedText;
}

// Calculate circle path based on percentage
function calculateCirclePath(percentage) {
    // SVG circle properties
    const radius = 15.9155;
    const circumference = 2 * Math.PI * radius;
    
    // Calculate the stroke-dasharray value based on percentage
    // The first value is the length of the stroke to show (the percentage)
    // The second value is the total circumference
    return `${(percentage / 100) * circumference} ${circumference}`;
}

// Helper function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Calculate results and display summary
function calculateResults() {
    // Stop the timer
    stopTimer();
    
    // Calculate time taken
    examEndTime = new Date();
    const timeTaken = Math.floor((examEndTime - examStartTime) / 1000); // in seconds
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Calculate score
    let correctCount = 0;
    let readingCorrect = 0;
    let writingCorrect = 0;
    let speakingCorrect = 0;
    let readingTotal = 0;
    let writingTotal = 0;
    let speakingTotal = 0;
    
    // Store the question-answer pairs for feedback
    const feedbackItems = [];
    
    // Get all question elements to access the shuffle mapping
    const questionElements = document.querySelectorAll('.question');
    
    currentExam.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        
        // Get the question element and its shuffle mapping
        const questionElement = questionElements[index];
        let isCorrect = false;
        let shuffleMap = null;
        let originalOptions = [];
        let shuffledOptions = [];
        
        if (questionElement) {
            // Get the shuffle mapping and options
            if (questionElement.dataset.shuffleMap) {
                shuffleMap = JSON.parse(questionElement.dataset.shuffleMap);
            }
            
            if (questionElement.dataset.originalOptions) {
                originalOptions = JSON.parse(questionElement.dataset.originalOptions);
            } else {
                originalOptions = question.options || [];
            }
            
            if (questionElement.dataset.shuffledOptions) {
                shuffledOptions = JSON.parse(questionElement.dataset.shuffledOptions);
            } else {
                shuffledOptions = originalOptions;
            }
            
            // Compare user answer with the new correct index after shuffling
            if (shuffleMap) {
                isCorrect = userAnswer === shuffleMap.newCorrect;
            } else {
                isCorrect = userAnswer === question.correctAnswer;
            }
        } else {
            // Fallback to direct comparison if no element exists
            isCorrect = userAnswer === question.correctAnswer;
            originalOptions = question.options || [];
            shuffledOptions = originalOptions;
        }
        
        // Count correct answers
        if (isCorrect) {
            correctCount++;
            
            // Count by question type
            const questionType = question.type || 'general';
            if (questionType === 'reading') {
                readingCorrect++;
            } else if (questionType === 'writing') {
                writingCorrect++;
            } else if (questionType === 'speaking') {
                speakingCorrect++;
            }
        }
        
        // Count total questions by question type
        const questionType = question.type || 'general';
        if (questionType === 'reading') {
            readingTotal++;
        } else if (questionType === 'writing') {
            writingTotal++;
        } else if (questionType === 'speaking') {
            speakingTotal++;
        }
        
        // Prepare feedback item with both original and shuffled options
        feedbackItems.push({
            questionText: question.text,
            userAnswer: userAnswer,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation || 'No explanation provided.',
            isCorrect: isCorrect,
            originalOptions: originalOptions,
            shuffledOptions: shuffledOptions,
            shuffleMap: shuffleMap
        });
    });
    
    // Calculate percentages
    const totalQuestions = currentExam.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Calculate skill-specific scores
    let readingScore = readingTotal > 0 ? Math.round((readingCorrect / readingTotal) * 100) : 0;
    let writingScore = writingTotal > 0 ? Math.round((writingCorrect / writingTotal) * 100) : 0;
    let speakingScore = speakingTotal > 0 ? Math.round((speakingCorrect / speakingTotal) * 100) : 0;
    
    // Determine performance level
    let performanceText = '';
    let performanceClass = '';
    
    if (scorePercentage >= 90) {
        performanceText = 'Excellent';
        performanceClass = 'performance-excellent';
    } else if (scorePercentage >= 70) {
        performanceText = 'Good';
        performanceClass = 'performance-good';
    } else if (scorePercentage >= 50) {
        performanceText = 'Average';
        performanceClass = 'performance-average';
    } else {
        performanceText = 'Needs Improvement';
        performanceClass = 'performance-poor';
    }
    
    // Update the results display
    scoreElement.textContent = `${scorePercentage}%`;
    scorePath.style.strokeDasharray = calculateCirclePath(scorePercentage);
    correctCountElement.textContent = correctCount;
    totalQuestionsElement.textContent = totalQuestions;
    timeTakenElement.textContent = formattedTime;
    performanceTextElement.textContent = performanceText;
    performanceTextElement.className = performanceClass;
    
    // Update skill-specific scores if elements exist
    if (readingScoreElement) {
        readingScoreElement.textContent = `${readingScore}%`;
        readingScorePath.style.strokeDasharray = calculateCirclePath(readingScore);
        readingCorrectElement.textContent = readingCorrect;
        readingTotalElement.textContent = readingTotal;
    }
    
    if (writingScoreElement) {
        writingScoreElement.textContent = `${writingScore}%`;
        writingScorePath.style.strokeDasharray = calculateCirclePath(writingScore);
        writingCorrectElement.textContent = writingCorrect;
        writingTotalElement.textContent = writingTotal;
    }
    
    if (speakingScoreElement) {
        speakingScoreElement.textContent = `${speakingScore}%`;
        speakingScorePath.style.strokeDasharray = calculateCirclePath(speakingScore);
        speakingCorrectElement.textContent = speakingCorrect;
        speakingTotalElement.textContent = speakingTotal;
    }
    
    // Create feedback items
    feedbackList.innerHTML = '';
    feedbackItems.forEach((item, index) => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = `feedback-item ${item.isCorrect ? 'correct' : 'incorrect'}`;
        
        // Get user's selected answer text and correct answer text
        let userAnswerText = 'Not answered';
        let correctAnswerText = 'Not available';
        
        // Handle user answer with shuffle mapping
        if (item.userAnswer !== null && item.userAnswer >= 0) {
            // The user answered using the shuffled options order
            if (item.shuffledOptions && item.shuffledOptions.length > item.userAnswer) {
                userAnswerText = item.shuffledOptions[item.userAnswer];
            }
        }
        
        // Handle correct answer from original options
        if (item.originalOptions && item.originalOptions.length > 0) {
            if (item.correctAnswer !== null && item.correctAnswer >= 0 && item.correctAnswer < item.originalOptions.length) {
                correctAnswerText = item.originalOptions[item.correctAnswer];
            }
        }
        
        // Create simple format feedback HTML
        feedbackItem.innerHTML = `
            <div class="question-text">Question ${index + 1}: ${formatWithLineBreaks(item.questionText)}</div>
            <div class="user-answer">Your answer: ${userAnswerText}</div>
            <div class="correct-answer">Correct answer: ${correctAnswerText}</div>
        `;
        
        feedbackList.appendChild(feedbackItem);
    });
    
    // Fade out exam content section
    examContentSection.style.opacity = '0';
    examContentSection.style.transform = 'translateY(-20px)';
    examContentSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // After a brief delay, hide exam content and show results
    setTimeout(() => {
        // Completely hide exam content
        examContentSection.classList.add('hidden');
        examContentSection.style.opacity = '';
        examContentSection.style.transform = '';
        examContentSection.style.display = 'none';
        
        // Prepare and show results section at the top of the page
        resultsSection.style.opacity = '0';
        resultsSection.style.transform = 'translateY(20px)';
        resultsSection.classList.remove('hidden');
        resultsSection.style.display = 'block';
        
        // Force reflow to ensure transition works
        void resultsSection.offsetWidth;
        
        // Show results with animation
        resultsSection.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        resultsSection.style.opacity = '1';
        resultsSection.style.transform = 'translateY(0)';
        
        // Scroll to top of the page to show results
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
    
    // Save the results to the progress tracker
    if (typeof window.saveExamResult === 'function') {
        // Get the exam type from the loaded exam data instead of URL
        let examType = '';
        
        // If we have the current exam, get the type from it
        if (currentExam && typeof currentExam.type !== 'undefined') {
            examType = currentExam.type;
        }
        
        // If type wasn't found in JSON, fallback to getting it from URL
        if (!examType) {
            const currentPage = window.location.pathname.split('/').pop();
            examType = currentPage.replace('.html', '');
        }
        
        // Save the result data
        const saveResult = window.saveExamResult({
            date: new Date().toISOString(),
            examType: examType,
            score: scorePercentage,
            skills: {
                reading: readingScore,
                writing: writingScore,
                speaking: speakingScore
            },
            timeTaken: formattedTime
        });
        
        // Show notification that progress was saved
        if (saveResult) {
            showProgressSavedNotification();
        }
    }
}

// Show a notification that progress was saved
function showProgressSavedNotification() {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('progress-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'progress-notification';
        notification.className = 'progress-notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>Progress saved successfully! <a href="progress.html">View your progress</a></span>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Add event listener to close button
    notification.querySelector('.close-notification').addEventListener('click', function() {
        notification.classList.remove('show');
    });
    
    // Show the notification
    notification.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(function() {
        notification.classList.remove('show');
    }, 5000);
}

// Toggle feedback visibility
function toggleFeedback() {
    feedbackContainer.classList.toggle('hidden');
    viewFeedbackBtn.textContent = feedbackContainer.classList.contains('hidden') ? 
        'View Detailed Feedback' : 'Hide Detailed Feedback';
}

// Event listeners - These should only be added after checking if elements exist
// Event listeners will be added in the DOMContentLoaded handler below

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    fetchExamData();
    setupDropdownMenus();
    
    if (backToListBtn) {
        backToListBtn.addEventListener('click', () => {
            // Fade out the results section
            resultsSection.style.opacity = '0';
            resultsSection.style.transform = 'translateY(-20px)';
            resultsSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                // Completely hide results section
                resultsSection.classList.add('hidden');
                resultsSection.style.opacity = '';
                resultsSection.style.transform = '';
                resultsSection.style.display = 'none';
                
                // Make sure exam content is hidden too
                examContentSection.classList.add('hidden');
                examContentSection.style.display = 'none';
                
                // Show the exam list with a fade in effect
                const examContainer = document.querySelector('section#exam-container');
                examContainer.classList.remove('hidden');
                examContainer.style.display = 'block';
                examContainer.style.opacity = '0';
                examContainer.style.transform = 'translateY(20px)';
                
                // Force reflow
                void examContainer.offsetWidth;
                
                examContainer.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                examContainer.style.opacity = '1';
                examContainer.style.transform = 'translateY(0)';
                
                // Show slideshow again
                const heroSlideshow = document.querySelector('.hero-slideshow');
                if (heroSlideshow) {
                    heroSlideshow.style.display = 'block';
                }
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        });
    }
    
    if (viewFeedbackBtn) {
        viewFeedbackBtn.addEventListener('click', toggleFeedback);
    }
    
    if (submitExamBtn) {
        submitExamBtn.addEventListener('click', calculateResults);
    }
}); 