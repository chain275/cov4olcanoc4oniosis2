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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupDropdownMenus();
    fetchExamData();
});

// Setup mobile menu functionality
function setupMobileMenu() {
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navigation.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            
            // Prevent scrolling when menu is open
            document.body.style.overflow = navigation.classList.contains('active') ? 'hidden' : '';
        });
        
        menuOverlay.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navigation.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
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
            
            if (window.innerWidth <= 768) {
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

// Fetch exam data from file
async function fetchExamData() {
    try {
        // Determine which JSON file to load based on the current page
        let jsonFile = '../src/exams.json';
        
        // Get the current page filename
        const currentPage = window.location.pathname.split('/').pop();
        
        // Check if we're on a specific exam page and adjust the JSON file accordingly
        if (currentPage === 'Product.html') {
            jsonFile = '../src/Product.json';
        } else if (currentPage === 'Article.html') {
            jsonFile = '../src/Article.json';
        } else if (currentPage === 'Paragraph.html') {
            jsonFile = '../src/Paragraph.json';
        } else if (currentPage === 'Short_conversation.html') {
            jsonFile = '../src/Short_conversation.json';
        } else if (currentPage === 'Long_conversation.html') {
            jsonFile = '../src/Long_conversation.json';
        } else if (currentPage === 'News_report.html') {
            jsonFile = '../src/News_report.json';
        } else if (currentPage === 'Advertisement.html') {
            jsonFile = '../src/Advertisement.json';
        } else if (currentPage === 'Text_completion.html') {
            jsonFile = '../src/Text_completion.json';
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
            <p><b>Duration:</b> ${exam.duration} minutes</p>
            <p><qb>Questions:</qb> ${exam.totalQuestions}</p>
            <button class="btn start-exam">Start Exam</button>
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
    
    // Set up the exam UI
    examTitle.textContent = currentExam.title;
    
    // Add subtitle if available
    if (currentExam.subtitle) {
        // Check if subtitle element exists, create if not
        let subtitleElement = document.getElementById('exam-subtitle');
        if (!subtitleElement) {
            subtitleElement = document.createElement('p');
            subtitleElement.id = 'exam-subtitle';
            const titleContainer = examTitle.closest('.exam-title-container');
            titleContainer.appendChild(subtitleElement);
        }
        subtitleElement.innerHTML = formatWithLineBreaks(currentExam.subtitle);
    }
    
    examQuestionsContainer.innerHTML = '';
    
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
    totalQuestionsProgressElement.textContent = currentExam.questions.length;
    
    // Show exam content, hide list
    examContentSection.classList.remove('hidden');
    document.getElementById('exam-container').classList.add('hidden');
    
    // Scroll to exam content with smooth animation
    examContentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Start timer
    startTimer();
    
    // Setup event listeners for navigation
    setupNavigationListeners();
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
    updateProgress();
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
            examContentSection.classList.add('hidden');
            document.getElementById('exam-container').classList.remove('hidden');
        }
    };
    
    // Add the new event listeners
    prevQuestionBtn.addEventListener('click', navigateToPrevQuestion);
    nextQuestionBtn.addEventListener('click', navigateToNextQuestion);
    backButton.addEventListener('click', exitExamHandler);
}

// Update progress indicators
function updateProgress() {
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const progressPercentage = (answeredCount / currentExam.questions.length) * 100;
    
    progressFill.style.width = `${progressPercentage}%`;
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
        
        // Make exam-subtitle move when timer changes
        const subtitleElement = document.getElementById('exam-subtitle');
        if (subtitleElement) {
            // Add a small bounce effect
            subtitleElement.style.transform = 'translateY(-2px)';
            
            // Reset after the animation
            setTimeout(() => {
                subtitleElement.style.transform = 'translateY(0)';
            }, 300);
        }
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
    if (['Product.html', 'Paragraph.html', 'Article.html', 'Advertisement.html','product.html','news_report.html','text_completion.html',].includes(currentPage)) {
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
                return `<p class="adv-paragraph">${prefix}: <strong class="adv-content" style="color: black !important; font-weight: bold !important;">${remainingText}</strong></p>`;
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
    
    // Hide exam content and show results
    examContentSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
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
            examContentSection.classList.add('hidden');
            resultsSection.classList.add('hidden');
            document.querySelector('section#exam-container').classList.remove('hidden');
        });
    }
    
    if (viewFeedbackBtn) {
        viewFeedbackBtn.addEventListener('click', toggleFeedback);
    }
    
    if (submitExamBtn) {
        submitExamBtn.addEventListener('click', calculateResults);
    }
}); 