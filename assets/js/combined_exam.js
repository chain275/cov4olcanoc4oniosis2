document.addEventListener('DOMContentLoaded', function() {
    // DOM cache object to store frequently accessed elements
    const DOM = {
        // Main sections
        examInfo: document.getElementById('exam-info'),
        examContent: document.getElementById('exam-content'),
        results: document.getElementById('results'),
        
        // Buttons
        startButton: document.getElementById('start-combined-exam'),
        backButton: document.getElementById('back-button'),
        backToHomeButton: document.getElementById('back-to-home'),
        retryButton: document.getElementById('retry-exam'),
        viewFeedbackBtn: document.getElementById('view-feedback'),
        
        // Navigation elements
        prevButton: document.getElementById('prev-question'),
        nextButton: document.getElementById('next-question'),
        submitButton: document.getElementById('submit-exam'),
        
        // Display elements
        timerDisplay: document.getElementById('timer-display'),
        currentQuestion: document.getElementById('current-question'),
        totalQuestionsCount: document.getElementById('total-questions-count'),
        totalQuestionsProgress: document.getElementById('total-questions-progress'),
        answeredCount: document.getElementById('answered-count'),
        questionsContainer: document.getElementById('exam-questions'),
        
        // Progress indicators
        progressFill: document.getElementById('progress-fill'),
        visualProgressFill: document.getElementById('visual-progress-fill'),
        questionNavigator: document.getElementById('question-navigator'),
        
        // Results elements
        score: document.getElementById('score'),
        scorePath: document.getElementById('score-path'),
        correctCount: document.getElementById('correct-count'),
        totalQuestions: document.getElementById('total-questions'),
        timeTaken: document.getElementById('time-taken'),
        performanceText: document.getElementById('performance-text'),
        percentileValue: document.getElementById('percentile-value'),
        percentileText: document.getElementById('percentile-text'),
        percentileProgress: document.getElementById('percentile-progress'),
        feedbackContainer: document.getElementById('feedback'),
        feedbackList: document.querySelector('.feedback-list'),
        
        // Additional elements
        totalQuestionCount: document.getElementById('total-question-count'),
        percentileMarker: document.getElementById('percentile-marker'),
        totalStudentsEl: document.getElementById('total-students'),
        averageScoreEl: document.getElementById('average-score'),
        suggestionsContainer: document.getElementById('score-suggestions'),
        suggestionsContent: document.querySelector('.suggestions-content'),
        examHeader: document.querySelector('.exam-header'),
        
        // Helper methods
        show: function(key) {
            if (this[key]) this[key].classList.remove('hidden');
        },
        
        hide: function(key) {
            if (this[key]) this[key].classList.add('hidden');
        },
        
        // Method to update cache with new elements
        update: function(key, element) {
            this[key] = element;
        },
        
        // Method to get element safely
        get: function(key) {
            return this[key] || null;
        }
    };

    // Cache control functions
    function getNextMondayMidnight() {
        const now = new Date();
        // Convert to GMT+7
        const offsetHours = 7;
        now.setHours(now.getHours() + offsetHours);
        
        // Find the next Monday (day 1)
        const daysUntilNextMonday = (1 + 7 - now.getDay()) % 7;
        
        // If today is Monday and it's before midnight, use today
        if (daysUntilNextMonday === 0 && now.getHours() < 24) {
            // Set time to midnight (00:00:00)
            now.setHours(24, 0, 0, 0);
        } else {
            // Set to next Monday midnight
            now.setDate(now.getDate() + daysUntilNextMonday);
            now.setHours(0, 0, 0, 0);
        }
        
        // Convert back to local time for storage
        now.setHours(now.getHours() - offsetHours);
        return now.getTime();
    }

    function isCacheValid(cacheKey) {
        try {
            const cache = localStorage.getItem(cacheKey);
            if (!cache) return false;
            
            const cacheData = JSON.parse(cache);
            const now = new Date().getTime();
            
            // Check if current time is before expiry time
            return now < cacheData.expiresAt;
        } catch (error) {
            console.error('Cache validation error:', error);
            return false;
        }
    }

    function clearExamCaches() {
        // Find all localStorage keys that start with exam_data_
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('exam_data_') || key.startsWith('combined_exam_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('All exam caches cleared');
        
        // Refresh the page to fetch fresh data
        if (confirm('Caches cleared. Reload page to fetch fresh data?')) {
            window.location.reload();
        }
    }

    function handleOfflineMode(cacheKey, jsonPath) {
        console.log('Operating in offline mode, checking for any cached data');
        
        // First check if we have any cached data at all
        const cache = localStorage.getItem(cacheKey);
        
        if (cache) {
            try {
                // Use cached data even if expired
                const cachedData = JSON.parse(cache);
                
                showOfflineNotification(cachedData.timestamp);
                
                return cachedData.data;
            } catch (error) {
                console.error('Error parsing cached data:', error);
                showError('Unable to load cached data. Please check your internet connection.');
                return null;
            }
        } else {
            showError(`No cached data available for ${jsonPath}. Please connect to the internet and try again.`);
            return null;
        }
    }

    function showOfflineNotification(timestamp) {
        const cachedDate = new Date(timestamp);
        const formattedDate = cachedDate.toLocaleDateString() + ' ' + cachedDate.toLocaleTimeString();
        
        // Create notification container if it doesn't exist
        let notification = document.getElementById('offline-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'offline-notification';
            notification.style.cssText = `
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #fff3cd;
                border: 1px solid #ffeeba;
                color: #856404;
                padding: 10px 15px;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                z-index: 9999;
                max-width: 90%;
                text-align: center;
                font-size: 14px;
            `;
            
            document.body.appendChild(notification);
        }
        
        // Set notification content
        notification.innerHTML = `
            <div style="margin-bottom: 5px;"><strong>You are offline</strong></div>
            <div>Using cached data from ${formattedDate}</div>
            <div style="margin-top: 5px; font-size: 12px;">Connect to internet for updated data</div>
        `;
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            
            // Remove after fade out
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 8000);
    }

    function showError(message) {
        const examContainer = document.querySelector('#exam-content');
        if (!examContainer) return;
        
        examContainer.innerHTML = `
            <div class="error-container" style="text-align: center; padding: 20px;">
                <p class="error" style="color: #d9534f; font-weight: bold;">${message}</p>
                <button id="retry-button" style="
                    padding: 10px 15px;
                    background-color: #337ab7;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    margin-top: 10px;
                    cursor: pointer;
                ">Retry</button>
            </div>
        `;
        
        // Add event listener to retry button
        const retryButton = document.getElementById('retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                window.location.reload(); // Reload the page to retry
            });
        }
    }

    // Original non-cached elements - preserving original references for compatibility
    const examInfoSection = DOM.examInfo;
    const examContentSection = DOM.examContent;
    const resultsSection = DOM.results;
    const startButton = DOM.startButton;
    const backButton = DOM.backButton;
    const backToHomeButton = DOM.backToHomeButton;
    const timerDisplay = DOM.timerDisplay;
    const percentileValue = DOM.percentileValue;

    let viewFeedbackBtn = DOM.viewFeedbackBtn;

    const typeScoreMap = {
        'short_conversation': 'short-conversation-score',
        'long_conversation': 'long-conversation-score',
        'advertisement': 'advertisement-score',
        'product': 'product-score',
        'news_report': 'news-report-score',
        'article': 'article-score',
        'text_completion': 'text-completion-score',
        'paragraph': 'paragraph-score'
    };

    const typeCounts = {
        'short_conversation': 12,
        'long_conversation': 8,
        'advertisement': 6,
        'product': 12,
        'news_report': 8,
        'article': 16,
        'text_completion': 12,
        'paragraph': 5
    };

    let startTime = 0;
    let elapsedSeconds = 0;
    let timerInterval = null;
    window.examTimerValue = 0; 

    initializeExamSelection();

    startButton.addEventListener('click', function() {
        // Add a delay before scrolling
        setTimeout(function() {
            DOM.examInfo.scrollIntoView({ behavior: 'smooth' });
        }, 500);
        
        DOM.examInfo.classList.add('hidden');
        DOM.examContent.classList.remove('hidden');

        startTime = Date.now();
        elapsedSeconds = 0;
        window.examTimerValue = 0;
        window.finalElapsedTime = 0; 

        window.examStartTimestamp = Date.now();

        if (DOM.timerDisplay) {
            DOM.timerDisplay.textContent = '00:00';
        }

        loadCombinedExam();
    });

    function loadCombinedExam() {
        const possiblePaths = [
            '../src/complete exam/combined_exam.json'
        ];

        tryNextPath(possiblePaths, 0);
    }

    function tryNextPath(paths, index) {

        const path = paths[index];
        
        // Generate a unique cache key for this file
        const cacheKey = `combined_exam_${path.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        // Check if we have valid cached data
        if (isCacheValid(cacheKey)) {
            console.log(`Using cached exam data for ${path}`);
            try {
                const cachedData = JSON.parse(localStorage.getItem(cacheKey));
                const processedData = processExamData(cachedData.data);
                initExam(processedData);
                return;
            } catch (error) {
                console.error('Error processing cached data:', error);
                // Continue with fetch if cache processing fails
            }
        }
        
        // Check network status
        if (!navigator.onLine) {
            const offlineData = handleOfflineMode(cacheKey, path);
            if (offlineData) {
                const processedData = processExamData(offlineData);
                initExam(processedData);
                return;
            } else {
                // Try next path if offline and no cache
                tryNextPath(paths, index + 1);
                return;
            }
        }

        console.log(`Fetching fresh exam data from ${path}`);
        fetch(path, {
            cache: 'no-cache',  // Force fresh data from server
            headers: { 'Cache-Control': 'no-cache' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Path ${path} failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(examData => {
                // Store the data in cache
                try {
                    // Calculate next Monday midnight for cache expiry
                    const expiresAt = getNextMondayMidnight();
                    
                    // Store in localStorage with expiry time
                    localStorage.setItem(cacheKey, JSON.stringify({
                        data: examData,
                        expiresAt: expiresAt,
                        timestamp: new Date().getTime()
                    }));
                    
                    console.log(`Exam data cached with expiry: ${new Date(expiresAt).toLocaleString()}`);
                } catch (error) {
                    console.error('Error caching exam data:', error);
                }

                const processedData = processExamData(examData);
                initExam(processedData); 
            })
            .catch(error => {
                console.error(`Error fetching ${path}:`, error);
                // Try next path if fetch fails
                tryNextPath(paths, index + 1);
            });
    }

    function processExamData(examData) {

        logExamTypeExamples(examData);

        const allQuestions = [];
        examData.forEach((exam, examIndex) => {
            if (!exam || typeof exam !== 'object') {
                return;
            }

            if (exam.questions && Array.isArray(exam.questions)) {
                const parentSubtitle = exam.subtitle || ""; 

                exam.questions.forEach((question, questionIndex) => {
                    if (!question || typeof question !== 'object') {
                        return;
                    }

                    if (!question.id) {
                        question.id = `${exam.id || `exam_${examIndex}`}_q${questionIndex + 1}`;
                    }

                    if (true) {
                        question.type = exam.type;
                    }
                     if (!question.type) {
                        question.type = determineQuestionType(question, allQuestions.length);
                     }

                    if (!question.subtitle && parentSubtitle) {
                        question.subtitle = parentSubtitle;
                    } else if (question.subtitle) {
                    }

                    if (question.options) {
                    } else {
                    }

                    allQuestions.push(question);
                });
            } else {
            }
        });

        return allQuestions;
    }

    function logExamTypeExamples(examData) {
        const examplesByType = {};

        examData.forEach((exam, examIndex) => {
            if (!exam || !exam.questions || !Array.isArray(exam.questions)) return;

            const examType = exam.type || "unknown_type";

            if (examplesByType[examType]) return;

            if (exam.questions.length > 0) {
                const sampleQuestion = exam.questions[0];

                if (sampleQuestion.subtitle) {
                }
            }

            examplesByType[examType] = true;
        });
    }

    function determineQuestionType(question, overallIndex) {

        const typesByPosition = [

            ...(Array(3).fill('short_conversation')),

            'long_conversation',

            ...(Array(2).fill('advertisement')),

            ...(Array(2).fill('product')),

            ...(Array(2).fill('news_report')),

            ...(Array(2).fill('article')),

            ...(Array(3).fill('text_completion')),

            ...(Array(5).fill('paragraph'))
        ];

        return overallIndex < typesByPosition.length ? typesByPosition[overallIndex] : 'unknown';
    }

    backButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to exit the exam? Your progress will be lost.')) {
            examContentSection.classList.add('hidden');
            examInfoSection.classList.remove('hidden');
        }
    });

    backToHomeButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    function initExam(examData) {
        if (!examData || !Array.isArray(examData) || examData.length === 0) {
            return;
        }

        const validExams = examData.filter(question => 
            question && (question.options || (question.subtitle && question.subtitle.trim())));

        if (validExams.length === 0) {
            return;
        }

        try {

            const combinedExam = {
                id: "combined-exam",
                title: "Combined Exam",
                description: "A comprehensive practice test covering all question types",
                subtitle: "",
                duration: 60,
                totalQuestions: validExams.length,
                questions: validExams
            };

            window.currentExam = combinedExam;
            window.currentQuestionIndex = 0;
            window.userAnswers = new Array(validExams.length).fill(null);

            const examTitleElement = document.getElementById('exam-title');
            if (examTitleElement) {
                examTitleElement.textContent = combinedExam.title;
            }

            const totalQuestionsCount = document.getElementById('total-questions-count');
            if (totalQuestionsCount) {
                totalQuestionsCount.textContent = validExams.length.toString();
            }

            const totalQuestionsProgress = document.getElementById('total-questions-progress');
            if (totalQuestionsProgress) {
                totalQuestionsProgress.textContent = validExams.length.toString();
            }

            addExamSubtitle(combinedExam.subtitle);

            addNavigationElements();

            setupNavigationHandlers();

            initializeQuestionNavigator(validExams.length);

            if (typeof startTimer === 'function') {
                startTimer(combinedExam.duration * 60);
            } else {

                startExamTimer();
            }

            loadQuestion(0);

            document.addEventListener('examSubmitted', handleExamSubmission);

            setTimeout(addTypeIndicators, 500);

        } catch (error) {
            alert("There was a problem starting the exam. Please refresh the page and try again.");
        }
    }

    function startExamTimer() {
        startTime = Date.now();
        elapsedSeconds = 0;
        window.examTimerValue = 0;

        window.examStartTimestamp = Date.now();

        if (DOM.timerDisplay) {
            DOM.timerDisplay.textContent = '00:00';
        }

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        timerInterval = setInterval(() => {
            try {
                const currentTime = Date.now();
                if (window.examStartTimestamp) {
                    elapsedSeconds = Math.floor((currentTime - window.examStartTimestamp) / 1000);
                } else {
                    elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
                }
                window.examTimerValue = elapsedSeconds; 

                const minutes = Math.floor(elapsedSeconds / 60);
                const remainingSeconds = elapsedSeconds % 60;
                const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

                if (DOM.timerDisplay) {
                    DOM.timerDisplay.textContent = formattedTime;
                }
            } catch (e) {
            }
        }, 1000);
    }

    function stopExamTimer() {
        if (window.examStartTimestamp) {
            const nowTimestamp = Date.now();
            const calculatedElapsedSeconds = Math.floor((nowTimestamp - window.examStartTimestamp) / 1000);

            if (calculatedElapsedSeconds > elapsedSeconds) {
                elapsedSeconds = calculatedElapsedSeconds;
            }
        }

        const finalElapsedSeconds = elapsedSeconds;
        window.finalElapsedTime = finalElapsedSeconds;

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        window.examTimerValue = finalElapsedSeconds;

        if (DOM.timeTaken) {
            const minutes = Math.floor(finalElapsedSeconds / 60);
            const remainingSeconds = finalElapsedSeconds % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

            DOM.timeTaken.style.display = 'inline-block';
            DOM.timeTaken.style.fontWeight = 'bold';
            DOM.timeTaken.style.color = '#2563eb';
            DOM.timeTaken.style.fontFamily = 'monospace';
            DOM.timeTaken.style.fontSize = '1.1rem';

            DOM.timeTaken.textContent = timeString;
        }
    }

    function addExamSubtitle(subtitleText) {
        const titleContainer = document.querySelector('.exam-title-container');
        if (!titleContainer) {
            return;
        }

        if (titleContainer.offsetParent === null) {
        }

        const existingSubtitle = titleContainer.querySelector('.exam-subtitle');
        if (existingSubtitle) {
            existingSubtitle.remove();
        }

        const subtitleElement = document.createElement('p');
        subtitleElement.className = 'exam-subtitle';
        subtitleElement.textContent = subtitleText;
        titleContainer.appendChild(subtitleElement);
    }

    function setupNavigationHandlers() {
        const prevButton = document.getElementById('prev-question');
        const nextButton = document.getElementById('next-question');
        const submitButton = document.getElementById('submit-exam');
        const jumpMenuButton = document.getElementById('question-jump-button');

        document.addEventListener('keydown', function(e) {
            const examContentVisible = !document.getElementById('exam-content').classList.contains('hidden');
            if (!examContentVisible) return;

            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
                if (window.currentQuestionIndex > 0) {
                    e.preventDefault();
                    saveCurrentAnswer();
                    loadQuestion(window.currentQuestionIndex - 1);
                }
            } else if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
                if (window.currentQuestionIndex < window.currentExam.totalQuestions - 1) {
                    e.preventDefault();
                    saveCurrentAnswer();
                    loadQuestion(window.currentQuestionIndex + 1);
                }
            }
        });

        if (prevButton) {
            prevButton.onclick = function() {
                if (window.currentQuestionIndex > 0) {
                    saveCurrentAnswer();
                    loadQuestion(window.currentQuestionIndex - 1);
                }
            };
        }

        if (nextButton) {
            nextButton.onclick = function() {
                if (window.currentQuestionIndex < window.currentExam.totalQuestions - 1) {
                    saveCurrentAnswer();
                    loadQuestion(window.currentQuestionIndex + 1);
                }
            };
        }

        if (submitButton) {
            submitButton.onclick = submitExam;
        }
    }

    function initializeQuestionNavigator(questionCount) {
        const navigator = document.getElementById('question-navigator');
        if (!navigator) return;

        navigator.innerHTML = '';

        const categories = [
            { name: 'SPEAKING', start: 1, end: 20, class: 'speaking' },
            { name: 'READING', start: 21, end: 60, class: 'reading' },
            { name: 'WRITING', start: 61, end: 80, class: 'writing' }
        ];

        categories.forEach(category => {
            const categoryHeader = document.createElement('div');
            categoryHeader.className = `category-header ${category.class}`;
            categoryHeader.textContent = category.name;
            navigator.appendChild(categoryHeader);

            for (let i = category.start - 1; i < Math.min(category.end, questionCount); i++) {
                const button = document.createElement('div');
                button.className = `question-nav-item ${category.class}`;
                button.textContent = (i + 1).toString();
                button.dataset.index = i;

                button.addEventListener('click', function() {
                    saveCurrentAnswer();
                    loadQuestion(parseInt(this.dataset.index));
                });

                navigator.appendChild(button);
            }
        });

        const totalQuestionCount = document.getElementById('total-question-count');
        if (totalQuestionCount) {
            totalQuestionCount.textContent = `${questionCount.toString()} ข้อ`;
        }

        const visualProgressFill = document.getElementById('visual-progress-fill');
        if (visualProgressFill) {
            visualProgressFill.style.width = '0%';
        }

        addCategoryStyles();
    }

    function addCategoryStyles() {
        // Styles moved to combined_exam.css
        return;
    }

    function updateQuestionNavigator(currentIndex) {
        if (!DOM.questionNavigator) return;

        let category = '';
        if (currentIndex < 20) {
            category = 'speaking';
        } else if (currentIndex < 60) {
            category = 'reading';
        } else {
            category = 'writing';
        }

        const buttons = DOM.questionNavigator.querySelectorAll('.question-nav-item');
        buttons.forEach((button, index) => {
            const buttonIndex = parseInt(button.dataset.index);

            button.classList.remove('current', 'answered', 'unanswered');

            if (buttonIndex === currentIndex) {
                button.classList.add('current');
            } else if (window.userAnswers && window.userAnswers[buttonIndex] !== null) {
                button.classList.add('answered');
            } else {
                button.classList.add('unanswered');
            }
        });

        const answeredCount = window.userAnswers ? window.userAnswers.filter(answer => answer !== null).length : 0;
        
        if (DOM.answeredCount) {
            DOM.answeredCount.textContent = `${answeredCount.toString()} เลือกคำตอบแล้ว`;
        }

        const totalQuestions = window.currentExam ? window.currentExam.totalQuestions : 0;
        
        if (DOM.visualProgressFill && totalQuestions > 0) {
            const progressPercentage = (answeredCount / totalQuestions) * 100;
            DOM.visualProgressFill.style.width = `${progressPercentage}%`;
        }
    }

    function updateProgressIndicators(index) {
        try {
            if (DOM.currentQuestion) {
                DOM.currentQuestion.textContent = index + 1;
            }

            if (DOM.progressFill && window.currentExam) {
                const percentage = ((index + 1) / window.currentExam.totalQuestions) * 100;
                DOM.progressFill.style.width = `${percentage}%`;
            }

            const answeredCount = window.userAnswers ? window.userAnswers.filter(answer => answer !== null).length : 0;
            const totalQuestions = window.currentExam ? window.currentExam.totalQuestions : 0;

            if (DOM.answeredCount) {
                DOM.answeredCount.textContent = answeredCount;
            }

            if (DOM.visualProgressFill && totalQuestions > 0) {
                const progressPercentage = (answeredCount / totalQuestions) * 100;
                DOM.visualProgressFill.style.width = `${progressPercentage}%`;
            }

            updateQuestionNavigator(index);
            setupNavigationButtons(index);
        } catch (error) {
        }
    }

    function setupNavigationButtons(index) {
        const prevButton = document.getElementById('prev-question');
        const nextButton = document.getElementById('next-question');
        const submitButton = document.getElementById('submit-exam');

        if (prevButton) {
            prevButton.disabled = index === 0;
        }

        if (nextButton) {
            const isLastQuestion = window.currentExam && index === window.currentExam.totalQuestions - 1;
            nextButton.disabled = isLastQuestion;

            if (submitButton) {
                submitButton.style.display = 'block';
            }
        }
    }

    function updateQuestionStatusIndicator(index) {
        const statusIndicator = document.getElementById('question-status-indicator');
        if (!statusIndicator) return;

        statusIndicator.className = 'question-status-indicator';

        if (window.userAnswers && window.userAnswers[index] !== null) {
            statusIndicator.classList.add('answered');
            statusIndicator.title = 'You have answered this question';
        } else {
            statusIndicator.classList.add('unanswered');
            statusIndicator.title = 'You have not answered this question yet';
        }
    }

    function saveCurrentAnswer() {
        const selectedOption = document.querySelector(`input[name="question${window.currentQuestionIndex}"]:checked`);
        if (selectedOption) {

            const optionDiv = selectedOption.closest('.option');
            const originalIndex = parseInt(optionDiv.dataset.originalIndex);

            window.userAnswers[window.currentQuestionIndex] = originalIndex;

            updateQuestionStatusIndicator(window.currentQuestionIndex);

            updateQuestionNavigator(window.currentQuestionIndex);
        }
    }

    function loadQuestion(index) {
        try {
            if (!DOM.questionsContainer || !window.currentExam || !window.currentExam.questions) {
                throw new Error("Required elements not found");
            }

            window.currentQuestionIndex = index;

            DOM.questionsContainer.innerHTML = '';

            const examHeader = document.querySelector('.exam-header');
            if (!examHeader) {
                throw new Error("Exam header not found");
            }

            const examTitleContainer = examHeader.querySelector('.exam-title-container');
            examHeader.innerHTML = '';
            examHeader.appendChild(examTitleContainer);

            const question = window.currentExam.questions[index];
            if (!question) {
                throw new Error(`Question not found at index ${index}`);
            }

            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';
            DOM.questionsContainer.appendChild(questionContainer);

            addQuestionProgressText(questionContainer, index + 1, window.currentExam.totalQuestions);

            if (question.text) {
                const textPara = document.createElement('p');
                textPara.className = 'question-text';

                let formattedText = question.text.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                textPara.innerHTML = formattedText;

                questionContainer.appendChild(textPara);
            }

            if (question.type) {
                addTypeIndicator(questionContainer, question.type);
            }

            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'content-wrapper';
            examHeader.appendChild(contentWrapper);

            const questionContent = document.createElement('div');
            questionContent.className = 'question-content';
            contentWrapper.appendChild(questionContent);

            const questionHeader = document.createElement('div');
            questionHeader.className = 'question-header';

            questionHeader.innerHTML = `<div class="question-number"></div>`;

            contentWrapper.appendChild(questionHeader);

            if (question.subtitle) {
                addFormattedSubtitle(questionContent, question.subtitle, question.type);
            }

            if (question.prompt) {
                const promptPara = document.createElement('p');
                promptPara.className = 'question-prompt';

                let formattedPrompt = question.prompt.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                promptPara.innerHTML = formattedPrompt;

                questionContent.appendChild(promptPara);
            }

            if (question.image) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'question-image';
                imageDiv.innerHTML = `<img src="${question.image}" alt="Question Image">`;
                questionContent.appendChild(imageDiv);
            }

            const optionsWrapper = document.createElement('div');
            optionsWrapper.className = 'options-wrapper';
            questionContainer.appendChild(optionsWrapper);

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
            optionsWrapper.appendChild(optionsContainer);

            const originalOptions = ensureOptions(question);

            const { randomizedOptions, originalIndices } = randomizeOptions(originalOptions);

            if (!window.optionsMappings) {
                window.optionsMappings = [];
            }
            window.optionsMappings[index] = originalIndices;

            randomizedOptions.forEach((option, randomIndex) => {

                if (!option || (typeof option === 'string' && option.trim() === '')) {
                    return;
                }

                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.dataset.index = randomIndex;
                optionDiv.dataset.originalIndex = originalIndices[randomIndex]; 
                optionsContainer.appendChild(optionDiv);

                const input = document.createElement('input');
                input.type = 'radio';
                input.id = `q${index}_option${randomIndex}`;
                input.name = `question${index}`;
                input.value = randomIndex;
                optionDiv.appendChild(input);

                const label = document.createElement('label');
                label.htmlFor = `q${index}_option${randomIndex}`;

                if (typeof option === 'object' && option !== null) {

                    if (option.text) {
                        label.innerHTML = option.text;
                    } else {
                        label.innerHTML = JSON.stringify(option);
                    }
                } else {
                    label.innerHTML = option;
                }

                optionDiv.appendChild(label);

                if (window.userAnswers[index] !== null) {

                    const selectedOriginalIndex = window.userAnswers[index];

                    const randomizedSelectedIndex = originalIndices.indexOf(selectedOriginalIndex);
                    if (randomIndex === randomizedSelectedIndex) {
                        input.checked = true;
                    }
                }

                optionDiv.addEventListener('click', function() {
                    const allInputs = optionsContainer.querySelectorAll('input[type="radio"]');
                    allInputs.forEach(input => input.checked = false);

                    input.checked = true;

                    window.userAnswers[index] = parseInt(this.dataset.originalIndex);
                });
            });

            if (optionsContainer.children.length === 0) {
                const errorMsg = document.createElement('p');
                errorMsg.className = 'error';
                errorMsg.textContent = 'No answer choices available for this question.';
                errorMsg.style.color = 'red';
                errorMsg.style.fontWeight = 'bold';
                optionsContainer.appendChild(errorMsg);
            }

            updateProgressIndicators(index);

        } catch (error) {
            if (DOM.questionsContainer) {
                DOM.questionsContainer.innerHTML = `
                    <div class="error-container" style="padding: 20px; background-color: #fff3f3; border: 1px solid #ffcaca; border-radius: 8px; margin: 20px auto;">
                        <h3 style="color: #e74c3c;">Error Loading Question ${index + 1}</h3>
                        <p>There was a problem loading this question. The error has been logged to the console.</p>
                        <p><strong>Error details:</strong> ${error.message}</p>
                        <p>Please try refreshing the page or contact support if the problem persists.</p>
                        <button class="btn" onclick="location.reload()">Refresh Page</button>
                    </div>
                `;
            }

            alert(`There was a problem loading question ${index+1}. Please try again.`);
        }
    }

    function randomizeOptions(options) {
        if (!Array.isArray(options) || options.length === 0) {
            return { randomizedOptions: options, originalIndices: [] };
        }

        const indices = Array.from({ length: options.length }, (_, i) => i);

        const optionsCopy = [...options];
        const indicesCopy = [...indices];

        for (let i = optionsCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [optionsCopy[i], optionsCopy[j]] = [optionsCopy[j], optionsCopy[i]];

            [indicesCopy[i], indicesCopy[j]] = [indicesCopy[j], indicesCopy[i]];
        }

        return {
            randomizedOptions: optionsCopy,
            originalIndices: indicesCopy
        };
    }

    function ensureOptions(question) {
        if (question.options && Array.isArray(question.options) && question.options.length > 0) {
            return question.options;
        } else if (question.options) {
        }

        if (question.options && typeof question.options === 'string') {
            try {
                const parsedOptions = JSON.parse(question.options);
                if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
                    return parsedOptions;
                }
            } catch (e) {
            }
        }

        if (question.options && typeof question.options === 'object' && !Array.isArray(question.options)) {

            const optionValues = Object.values(question.options);
            if (optionValues.length > 0) {
                return optionValues;
            } else {
            }
        }

        if (question.choices && Array.isArray(question.choices) && question.choices.length > 0) {
            return question.choices;
        } else if (question.choices) {
        }

        if (question.answers && Array.isArray(question.answers) && question.answers.length > 0) {

            if (question.answers.length > 1 || typeof question.answers[0] !== 'number') {
                return question.answers;
            } else {
            }
        } else if (question.answers) {
        }

        if (question.distractors && Array.isArray(question.distractors) && question.correctAnswerText) {

            const allOptions = [question.correctAnswerText, ...question.distractors];

            for (let i = allOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
            }
            return allOptions;
        }

        return ["Option A", "Option B", "Option C", "Option D"];
    }

    function submitExam() {
        if (confirm('Are you sure you want to submit your exam?')) {

            saveCurrentAnswer();

            const nowTimestamp = Date.now();
            const startTimestamp = window.examStartTimestamp || (nowTimestamp - 1000); 
            const calculatedElapsedSeconds = Math.floor((nowTimestamp - startTimestamp) / 1000);

            elapsedSeconds = calculatedElapsedSeconds;

            const finalMinutes = Math.floor(elapsedSeconds / 60);
            const finalSeconds = elapsedSeconds % 60;
            const finalTime = `${finalMinutes.toString().padStart(2, '0')}:${finalSeconds.toString().padStart(2, '0')}`;

            window.finalElapsedTime = elapsedSeconds;

            stopExamTimer();

            const results = calculateResults();

            updateResultsDisplay(results);

            DOM.examContent.classList.add('hidden');
            DOM.results.classList.remove('hidden');

            if (DOM.timeTaken) {
                DOM.timeTaken.style.display = 'inline-block';
                DOM.timeTaken.style.fontWeight = 'bold';
                DOM.timeTaken.style.color = '#2563eb';
                DOM.timeTaken.style.fontFamily = 'monospace';

                DOM.timeTaken.textContent = results.timeTaken;
            }

            saveToProgressTracker(results);

            calculatePercentileRank(results.correctCount);
            updatePercentileVisualization(Math.round(results.percentage));

            document.dispatchEvent(new CustomEvent('examSubmitted', { detail: results }));

            if (typeof window.updateTypeProgressBars === 'function') {
                setTimeout(() => {
                    window.updateTypeProgressBars();
                }, 500);
            }

            setTimeout(function() {
                const viewFeedbackBtn = DOM.viewFeedbackBtn;
                const feedbackContainer = DOM.feedbackContainer;

                if (viewFeedbackBtn && feedbackContainer) {

                    feedbackContainer.style.display = 'none';

                    viewFeedbackBtn.replaceWith(viewFeedbackBtn.cloneNode(true));

                    // Re-cache the button after replacing it
                    DOM.update('viewFeedbackBtn', document.getElementById('view-feedback'));
                    const freshBtn = DOM.viewFeedbackBtn;

                    freshBtn.addEventListener('click', function(e) {
                        e.preventDefault();

                        if (feedbackContainer.style.display === 'none' || 
                            feedbackContainer.style.display === '') {
                            feedbackContainer.style.display = 'block';
                            freshBtn.textContent = 'Hide Detailed Feedback';
                        } else {
                            feedbackContainer.style.display = 'none';
                            freshBtn.textContent = 'View Detailed Feedback';
                        }
                    });
                }
            }, 500); 
        }
    }

    function saveToProgressTracker(results) {

        if (typeof window.saveExamResult !== 'function') {
            console.error('Progress tracking system not available: window.saveExamResult is not a function');
            showNotification('Progress tracking is not available', 'error');
            return;
        }

        const skillScores = calculateSkillScores(results);
        const typeBreakdown = skillScores.typeBreakdown;

        const typeToSkill = {
            'short_conversation': 'speaking',
            'long_conversation': 'speaking',
            'advertisement': 'reading',
            'product': 'reading',
            'news_report': 'reading',
            'article': 'reading',
            'text_completion': 'writing',
            'paragraph': 'writing'
        };

        let allSaved = true;
        let typesSavedCount = 0;
        const dateStamp = new Date().toISOString(); 

        let totalQuestions = 0;
        let totalCorrect = 0;
        const overallSkills = { reading: 0, writing: 0, speaking: 0 };
        const skillQuestionCounts = { reading: 0, writing: 0, speaking: 0 };

        for (const type in typeBreakdown) {
            if (typeBreakdown.hasOwnProperty(type)) {
                const counts = typeBreakdown[type];
                if (counts.total > 0) {
                    totalQuestions += counts.total;
                    totalCorrect += counts.correct;

                    const skill = typeToSkill[type] || 'reading';
                    overallSkills[skill] += counts.correct;
                    skillQuestionCounts[skill] += counts.total;
                }
            }
        }

        for (const skill in overallSkills) {
            if (skillQuestionCounts[skill] > 0) {
                overallSkills[skill] = Math.round((overallSkills[skill] / skillQuestionCounts[skill]) * 100);
            }
        }

        const overallScorePercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        for (const type in typeBreakdown) {
            if (typeBreakdown.hasOwnProperty(type)) {
                const counts = typeBreakdown[type];

                if (counts.total > 0) {
                    const typeScorePercentage = Math.round((counts.correct / counts.total) * 100);
                    const primarySkill = typeToSkill[type] || 'reading'; 
                    
                    // Create compressed skills array [reading, writing, speaking]
                    const skillsArray = [0, 0, 0];
                    if (primarySkill === 'reading') skillsArray[0] = typeScorePercentage;
                    else if (primarySkill === 'writing') skillsArray[1] = typeScorePercentage;
                    else if (primarySkill === 'speaking') skillsArray[2] = typeScorePercentage;

                    // Compressed data format
                    const examResultData = {
                        t: formatTypeName(type),  // type
                        s: typeScorePercentage,   // score
                        d: dateStamp,             // date
                        q: counts.total,          // totalQuestions
                        c: counts.correct,        // correctAnswers
                        sk: skillsArray,          // skills [reading, writing, speaking]
                        tt: '0:00'                // timeTaken
                    };

                    try {
                        const saved = window.saveExamResult(examResultData);
                        if (saved) {
                            console.log(`Saved results for type '${type}' to progress tracker.`);
                            typesSavedCount++;
                        } else {
                            console.warn(`Failed to save results for type '${type}' to progress tracker.`);
                            allSaved = false;
                        }
                    } catch (error) {
                        console.error(`Error saving results for type '${type}' to progress tracker:`, error);
                        allSaved = false;
                    }
                }
            }
        }

        if (totalQuestions > 0) {
            const timeTaken = results.timeTaken || '0:00';
            
            // Create compressed skills array for overall exam
            const overallSkillsArray = [
                overallSkills.reading || 0,
                overallSkills.writing || 0, 
                overallSkills.speaking || 0
            ];

            // Compressed format for overall exam data
            const overallExamData = {
                t: 'combined_exam',    // examType
                s: overallScorePercentage,  // score
                d: dateStamp,          // date
                q: totalQuestions,     // totalQuestions
                c: totalCorrect,       // correctAnswers
                sk: overallSkillsArray, // skills array
                tt: timeTaken          // timeTaken
            };

            try {
                const saved = window.saveExamResult(overallExamData);
                if (saved) {
                    console.log('Saved overall combined exam score to progress tracker.');
                    typesSavedCount++;
                } else {
                    console.warn('Failed to save overall combined exam score to progress tracker.');
                    allSaved = false;
                }
            } catch (error) {
                console.error('Error saving overall combined exam score to progress tracker:', error);
                allSaved = false;
            }
        }

        if (typesSavedCount > 0 && allSaved) {
            showNotification('Exam results saved to progress tracker by type.', 'success');
        } else if (typesSavedCount > 0 && !allSaved) {
            showNotification('Some parts of the exam results saved to progress tracker.', 'warning');
        } else {
            showNotification('Failed to save any exam results to progress tracker.', 'error');
        }
    }

    function showNotification(message, type = 'info') {
        // Styles moved to combined_exam.css
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        let icon = '';
        switch (type) {
            case 'success':
                icon = '✓';
                break;
            case 'warning':
                icon = '⚠';
                break;
            case 'error':
                icon = '✕';
                break;
            default:
                icon = 'ℹ';
                break;
        }

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
        `;

        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300); 
        }, 4000);
    }

    function calculateSkillScores(results) {
        const skillCounts = {
            reading: { correct: 0, total: 0 },
            writing: { correct: 0, total: 0 },
            speaking: { correct: 0, total: 0 }
        };

        const typeBreakdown = {};

        const typeToSkill = {
            'short_conversation': 'speaking',
            'long_conversation': 'speaking',
            'advertisement': 'reading',
            'product': 'reading',
            'news_report': 'reading',
            'article': 'reading',
            'text_completion': 'writing',
            'paragraph': 'writing'
        };

        if (results && results.questionResults) {
            results.questionResults.forEach((result, index) => {
                if (!result) {
                    return;
                }

                const questionType = result.questionType;
                if (!questionType) {
                    return;
                }

                const skill = typeToSkill[questionType] || 'reading';

                skillCounts[skill].total++;
                if (result.isCorrect) {
                    skillCounts[skill].correct++;
                }

                if (!typeBreakdown[questionType]) {
                    typeBreakdown[questionType] = { correct: 0, total: 0 };
                }
                typeBreakdown[questionType].total++;
                if (result.isCorrect) {
                    typeBreakdown[questionType].correct++;
                }
            });
        }

        const reading = skillCounts.reading.total > 0 
            ? Math.round((skillCounts.reading.correct / skillCounts.reading.total) * 100) 
            : 0;

        const writing = skillCounts.writing.total > 0 
            ? Math.round((skillCounts.writing.correct / skillCounts.writing.total) * 100) 
            : 0;

        const speaking = skillCounts.speaking.total > 0 
            ? Math.round((skillCounts.speaking.correct / skillCounts.speaking.total) * 100) 
            : 0;

        return { 
            reading, 
            writing, 
            speaking,
            typeBreakdown,
            skillCounts
        };
    }

    function calculateResults() {
        try {
            const totalQuestions = window.currentExam.totalQuestions;
            const userAnswers = window.userAnswers || [];
            const questions = window.currentExam.questions || [];

            let correctCount = 0;
            const questionResults = [];
            const typeStats = {};

            questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const correctAnswer = question.correctAnswer;
                const isCorrect = userAnswer === correctAnswer;

                if (isCorrect) {
                    correctCount++;
                }

                questionResults.push({
                    questionIndex: index,
                    questionText: question.text,
                    userAnswer: userAnswer,
                    correctAnswer: correctAnswer,
                    isCorrect: isCorrect,
                    questionType: question.type,
                    explanation: question.explanation || null,

                    selectedOption: userAnswer,
                    correctOption: correctAnswer
                });

                const type = question.type || 'unknown';
                if (!typeStats[type]) {
                    typeStats[type] = { total: 0, correct: 0 };
                }

                typeStats[type].total++;
                if (isCorrect) {
                    typeStats[type].correct++;
                }
            });

            const typeScores = {};
            for (const [type, stats] of Object.entries(typeStats)) {
                const percentage = (stats.correct / stats.total) * 100;
                typeScores[type] = {
                    total: stats.total,
                    correct: stats.correct,
                    percentage: percentage
                };
            }

            const percentage = (correctCount / totalQuestions) * 100;

            const timeToUse = window.finalElapsedTime || elapsedSeconds;
            const minutes = Math.floor(timeToUse / 60);
            const seconds = timeToUse % 60;
            const timeTaken = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            const results = {
                correctCount: correctCount,
                totalQuestions: totalQuestions,
                percentage: percentage,
                timeTaken: timeTaken,
                questionResults: questionResults,
                typeScores: typeScores
            };

        return results;
        } catch (error) {
            return {
                correctCount: 0,
                totalQuestions: window.currentExam ? window.currentExam.totalQuestions : 0,
                percentage: 0,
                timeTaken: '00:00',
                questionResults: [],
                typeScores: {}
            };
        }
    }

    function getPerformanceText(percentage) {
        if (percentage >= 90) {
            return 'ที่สุด 💯💯';
        } else if (percentage >= 80) {
            return 'ยอดเยี่ยม';
        } else if (percentage >= 60) {
            return 'ค่อนข้างดี';
        } else if (percentage >= 50) {
            return 'พอใช้';
        } else if (percentage >= 40) {
            return 'ต้องปรับปรุง';
        } else {
            return 'ควรปรับปรุงอย่างเร่งด่วน';
        }
    }

    function updateResultsDisplay(results) {
        try {
            console.log('Updating results display with:', results);
            console.log('Final time value during results display:', window.finalElapsedTime);

            if (DOM.score) {
                DOM.score.textContent = `${(results.percentage).toFixed(3)}`;
            }

            if (DOM.scorePath) {
                const circumference = 2 * Math.PI * 15.9155;
                const offset = circumference - (results.percentage / 100) * circumference;

                DOM.scorePath.style.strokeDasharray = `${circumference} ${circumference}`;
                DOM.scorePath.style.strokeDashoffset = `${circumference}`;

                DOM.scorePath.getBoundingClientRect();

                DOM.scorePath.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
                DOM.scorePath.style.strokeDashoffset = offset;
            }

            if (DOM.correctCount) {
                DOM.correctCount.textContent = results.correctCount;
            }

            if (DOM.totalQuestions) {
                DOM.totalQuestions.textContent = results.totalQuestions;
            }

            if (DOM.timeTaken) {
                const timeToUse = window.finalElapsedTime || 0;
                const minutes = Math.floor(timeToUse / 60);
                const seconds = timeToUse % 60;
                const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                DOM.timeTaken.style.display = 'inline-block';
                DOM.timeTaken.style.fontWeight = 'bold';
                DOM.timeTaken.style.color = '#2563eb';
                DOM.timeTaken.style.fontFamily = 'monospace';
                DOM.timeTaken.style.fontSize = '1.1rem';

                DOM.timeTaken.textContent = timeDisplay;
                console.log('Directly set time-taken to:', timeDisplay, '(from timeToUse:', timeToUse, ')');

                if (timeDisplay === '00:00' && results.timeTaken !== '00:00') {
                    DOM.timeTaken.textContent = results.timeTaken;
                    console.log('Falling back to results.timeTaken:', results.timeTaken);
                }
            } else {
                console.error('Could not find time-taken element!');
            }

            if (DOM.performanceText) {
                const performanceText = getPerformanceText(results.percentage);
                DOM.performanceText.textContent = performanceText;
            }

            const skillScores = calculateSkillScores(results);
            console.log('Calculated skill scores:', skillScores);

            updateSkillScore('reading', skillScores.reading);
            updateSkillScore('writing', skillScores.writing);
            updateSkillScore('speaking', skillScores.speaking);

            updateSkillCount('reading', skillScores.skillCounts.reading);
            updateSkillCount('writing', skillScores.skillCounts.writing);
            updateSkillCount('speaking', skillScores.skillCounts.speaking);

            updateTypeScores(results);

            addDetailedFeedback(results.questionResults);

            addScoreSuggestions(results.percentage, results.typeScores);

            calculatePercentileRank(results.correctCount);

            updatePercentileVisualization(Math.round(results.percentage));

            if (DOM.results) {
                DOM.results.classList.remove('hidden');
            }

            updateTypeProgressBars();

            if (typeof window.updateTypeProgressBars === 'function') {
                setTimeout(() => {
                    window.updateTypeProgressBars();
                }, 500);
            }

            console.log('Results display updated successfully');
        } catch (error) {
            console.error('Error updating results display:', error);
        }
    }

    function updatePercentileVisualization(percentile) {
        if (DOM.percentileValue && DOM.percentileText) {
            DOM.percentileValue.textContent = percentile;
            DOM.percentileText.textContent = `${percentile}%`;
        }

        if (DOM.percentileProgress) {
            DOM.percentileProgress.style.width = `${percentile}%`;
        }

        if (DOM.percentileMarker) {
            DOM.percentileMarker.style.transform = `translateX(${percentile}%)`;
        }

        if (DOM.totalStudentsEl && DOM.totalStudentsEl.textContent === '0') {
            DOM.totalStudentsEl.textContent = '1238'; 
        }

        if (DOM.averageScoreEl && DOM.averageScoreEl.textContent === '0%') {
            DOM.averageScoreEl.textContent = '68%'; 
        }
    }

    function calculatePercentileRank(userScore) {
        const adjustedScore = userScore * 1.25;
        const finalScore = Math.min(adjustedScore, 100);

        fetch('../src/score/score.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load score distribution data');
                }
                return response.json();
            })
            .then(data => {
                if (!data || !Array.isArray(data) || data.length === 0) {
                    throw new Error('Invalid score distribution data format');
                }

                const distributionData = data[0];

                let totalStudents = 0;
                let studentsBelow = 0;

                Object.entries(distributionData).forEach(([range, count]) => {
                    totalStudents += parseInt(count.trim(), 10);
                });

                Object.entries(distributionData).forEach(([range, count]) => {
                    const [min, max] = range.split('-').map(val => parseFloat(val));
                    const frequency = parseInt(count.trim(), 10);

                    if (max < finalScore) {
                        studentsBelow += frequency;
                    } else if (min <= finalScore && finalScore <= max) {
                        const rangeSize = max - min;
                        const positionInRange = finalScore - min;
                        const proportion = positionInRange / rangeSize;
                        studentsBelow += frequency * proportion;
                    }
                });

                const percentile = (studentsBelow / totalStudents) * 100;
                const roundedPercentile = percentile.toFixed(3);

                const percentileValueElement = document.getElementById('percentile-value');
                if (percentileValueElement) {
                    percentileValueElement.textContent = roundedPercentile + '%';
                }

                displayPercentileRank(roundedPercentile, Math.round(totalStudents - studentsBelow) + 1, totalStudents, userScore, finalScore);
            })
            .catch(error => {
                showNotification('Could not calculate percentile rank: ' + error.message, 'warning');
                const fallbackPercentile = calculateFallbackPercentile(userScore);
                displayPercentileRank(fallbackPercentile, '-', '-', userScore, Math.min(userScore * 1.25, 100));
            });
    }

    function calculateFallbackPercentile(score) {
        let percentile;
        if (score >= 90) {
            percentile = 95 + (score - 90) / 2; 
        } else if (score >= 80) {
            percentile = 85 + (score - 80); 
        } else if (score >= 70) {
            percentile = 70 + (score - 70) * 1.5; 
        } else if (score >= 60) {
            percentile = 50 + (score - 60) * 2; 
        } else if (score >= 50) {
            percentile = 30 + (score - 50) * 2; 
        } else if (score >= 40) {
            percentile = 15 + (score - 40) * 1.5; 
        } else if (score >= 30) {
            percentile = 5 + (score - 30); 
        } else {
            percentile = score / 6; 
        }

        percentile = Math.min(percentile, 99.9);

        return percentile.toFixed(1);
    }

    function displayPercentileRank(percentile, rank, totalStudents, originalScore, adjustedScore) {
        try {
            updatePercentileVisualization(percentile);

            const totalStudentsEl = document.getElementById('total-students');
            if (totalStudentsEl) {
                totalStudentsEl.textContent = totalStudents;
            }

            const percentileText = document.getElementById('percentile-text');
            if (percentileText) {
                percentileText.textContent = `${(totalStudents-(percentile*totalStudents)).toFixed(0)}`;
            }

            const resultSummary = document.querySelector('.result-summary');
            if (!resultSummary) {
                return;
            }

            const resultsSection = resultSummary.parentElement;
            if (!resultsSection) {
                return;
            }

            const existingContainer = document.querySelector('.percentile-container');
            if (existingContainer) {
                existingContainer.remove();
            }

            const percentileContainer = document.createElement('div');
            percentileContainer.className = 'percentile-container';
            percentileContainer.style.marginBottom = '25px'; 

            percentileContainer.innerHTML = `
                <div class="percentile-header">
                    <h4>เปอร์เซ็นไทล์คะแนนของคุณ</h4>
                    <div class="percentile-details">
                        <span class="percentile-value-display">${percentile}%</span>
                        <span class="rank-display">อันดับ ${rank} จากผู้สอบทั้งหมด ${totalStudents} คน</span>
                    </div>
                </div>
                <div class="percentile-bar">
                    <div class="percentile-track">
                        <div class="percentile-fill" style="width: 0%"></div>
                    </div>
                    <div class="percentile-markers">
                        <span class="marker" style="left: 0%">0%</span>
                        <span class="marker" style="left: 25%">25%</span>
                        <span class="marker" style="left: 50%">50%</span>
                        <span class="marker" style="left: 75%">75%</span>
                        <span class="marker" style="left: 100%">100%</span>
                    </div>
                </div>
                <div class="score-adjustment-note">
                    <i class="fas fa-info-circle"></i>
                    <span>คะแนนดิบ: ${originalScore} (ปรับเป็น ${adjustedScore.toFixed(1)} สำหรับการคำนวณเปอร์เซ็นไทล์)</span>
                </div>
            `;

            resultsSection.insertBefore(percentileContainer, resultSummary);

            addPercentileStyles();

            setTimeout(() => {
                const percentileFill = percentileContainer.querySelector('.percentile-fill');
                if (percentileFill) {
                    percentileFill.style.width = percentile + '%';
                }
            }, 300);

            if (parseFloat(percentile) < 85) {
                const tutorRecommendation = document.createElement('div');
                tutorRecommendation.className = 'tutor-recommendation';
                tutorRecommendation.innerHTML = `
                    <div class="recommendation-alert">
                        <i class="fas fa-lightbulb"></i>
                        <div class="recommendation-content">
                            <h4>เพิ่มคะแนนของคุณด้วยผู้สอนส่วนตัว</h4>
                            <p>คะแนนของคุณอยู่ต่ำกว่าเปอร์เซ็นไทล์ที่ 85 การเรียนกับผู้เชี่ยวชาญจะช่วยให้คุณพัฒนาทักษะและเพิ่มคะแนนได้</p>
                            <a href="../templates/tutors.html" class="tutor-link">ค้นหาผู้สอนที่เหมาะกับคุณ</a>
                        </div>
                    </div>
                `;

                percentileContainer.appendChild(tutorRecommendation);
            }
        } catch (error) {
        }
    }

    function addPercentileStyles() {
        // Styles moved to combined_exam.css
        return;
    }

    function updateSkillScore(skill, score) {
        const scoreElement = document.getElementById(`${skill}-score`);
        const scorePath = document.getElementById(`${skill}-score-path`);

        if (scoreElement) {
            scoreElement.textContent = `${score}%`;
        }

        if (scorePath) {
            const circumference = 2 * Math.PI * 15.9155;
            const offset = circumference * (1 - score / 100);
            scorePath.style.strokeDasharray = `${circumference} ${circumference}`;
            scorePath.style.strokeDashoffset = offset;
        }
    }

    function updateSkillCount(skill, counts) {
        const correctElement = document.getElementById(`${skill}-correct`);
        const totalElement = document.getElementById(`${skill}-total`);

        if (correctElement) {
            correctElement.textContent = counts.correct;
        }

        if (totalElement) {
            totalElement.textContent = counts.total;
        }
    }

    function addTypeIndicators() {
        const questionContainers = document.querySelectorAll('.question-container');

        questionContainers.forEach((container, index) => {
            const questionData = window.currentExam.questions[index];
            if (questionData && questionData.type) {
                addTypeIndicator(container, questionData.type);
            }
        });
    }

    function addTypeIndicator(container, type) {
    if (!container || !type) return;

    if (container.querySelector('.question-type-indicator')) return;

    const indicator = document.createElement('div');
    indicator.className = `question-type-indicator ${type.replace('_', '-')}`;
    indicator.textContent = formatTypeName(type);

    // Instead of inserting at the beginning, append it to place it inside the container
    container.appendChild(indicator);
}

    function handleExamSubmission(event) {
        const result = event.detail;
        setTimeout(() => {
            updateTypeScores(result);
        }, 500); 
    }

    function updateTypeScores(result) {
        try {
            const typeScores = result.typeScores || {};

            const typeMapping = {
                'short_conversation': 'short-conversation',
                'long_conversation': 'long-conversation',
                'advertisement': 'advertisement',
                'product': 'product',
                'news_report': 'news-report',
                'article': 'article',
                'text_completion': 'text-completion',
                'paragraph': 'paragraph'
            };

            for (const [type, score] of Object.entries(typeScores)) {
                const typeId = typeMapping[type] || type.replace(/_/g, '-');
                updateTypeScoreElement(typeId, score);
            }

            setTimeout(() => {
                updateTypeProgressBars();
            }, 200);
        } catch (error) {
        }
    }

    function updateTypeScoreElement(typeId, typeScore) {
        if (!typeScore) return;

        const scoreText = document.getElementById(`${typeId}-score`);
        if (scoreText) {
            scoreText.textContent = `${typeScore.correct}/${typeScore.total}`;
        }

        const progressBar = document.getElementById(`${typeId}-progress`);
        if (progressBar) {
            progressBar.dataset.percentage = typeScore.percentage;
        }

        const pathElement = document.getElementById(`${typeId}-score-path`);
        if (pathElement) {
            const circumference = 2 * Math.PI * 15.9155;
            const offset = circumference - (typeScore.percentage / 100) * circumference;

            pathElement.style.strokeDasharray = `${circumference} ${circumference}`;
            pathElement.style.strokeDashoffset = `${circumference}`;

            pathElement.getBoundingClientRect();

            pathElement.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
            pathElement.style.strokeDashoffset = offset;
        }
    }

    function updateTypeProgressBars() {
        try {
            const progressBars = document.querySelectorAll('.type-progress-bar');

            progressBars.forEach(progressBar => {
                const typeId = progressBar.id.replace('-progress', '');
                const scoreElement = document.getElementById(`${typeId}-score`);

                if (scoreElement) {
                    const scoreText = scoreElement.textContent;
                    const [correct, total] = scoreText.split('/').map(num => parseInt(num.trim(), 10));

                    if (!isNaN(correct) && !isNaN(total) && total > 0) {
                        const percentage = (correct / total) * 100;

                        progressBar.style.transition = 'width 1s ease-out';
                        progressBar.style.width = `${percentage}%`;

                        if (percentage < 40) {
                            progressBar.style.backgroundColor = '#f44336'; 
                        } else if (percentage < 70) {
                            progressBar.style.backgroundColor = '#ff9800'; 
                        } else {
                            progressBar.style.backgroundColor = '#4caf50'; 
                        }
                    }
                }
            });
        } catch (error) {
        }
    }

    window.updateTypeProgressBars = updateTypeProgressBars;

    document.addEventListener('DOMContentLoaded', function() {
        const resultsSection = document.getElementById('results');

        if (resultsSection) {
            setTimeout(updateTypeProgressBars, 500);

            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!resultsSection.classList.contains('hidden')) {
                            setTimeout(updateTypeProgressBars, 300);
                        }
                    }
                });
            });

            observer.observe(resultsSection, { attributes: true });
        }
    });

    function formatTypeName(type) {
        return type.replace(/_/g, ' ')
            .replace(/\b\w/g, letter => letter.toUpperCase());
    }

    function addFormattedSubtitle(container, subtitle, type) {
        if (!subtitle || !container) return;

        const subtitleWrapper = document.createElement('div');
        subtitleWrapper.className = `question-subtitle ${type}-subtitle`;

        if (type === 'short_conversation' || type === 'long_conversation' || type === 'speaking' || type === 'paragraph') {
            formatConversation(subtitleWrapper, subtitle);
        } else if (type === 'advertisement' || type === 'product') {
            formatAdvertisementProduct(subtitleWrapper, subtitle, type);
        } else if (type === 'news_report' || type === 'article') {
            formatArticleNewsReport(subtitleWrapper, subtitle);
        } else if (type === 'text_completion') {
            formatTextCompletion(subtitleWrapper, subtitle);
        } else {
            if (subtitle.includes('<br>') || 
                subtitle.includes('\n') || 
                subtitle.includes('----ARTICLE----')) {
                subtitleWrapper.innerHTML = subtitle.replace(/\n/g, '<br>');
            } else {
                subtitleWrapper.textContent = subtitle;
            }
        }

        container.appendChild(subtitleWrapper);
    }

    function formatConversation(container, subtitle) {
        let formattedText = subtitle.replace(/\n/g, '<br>');
        const lines = formattedText.split('<br>');
        const conversationContainer = document.createElement('div');
        conversationContainer.className = 'conversation-container';

        lines.forEach(line => {
            if (!line.trim()) {
                conversationContainer.appendChild(document.createElement('br'));
                return;
            }

            const match = line.match(/([^<>:]+):\s*(.*)/);

            if (match) {
                const speakerName = match[1].trim();
                const speakerText = match[2].trim();

                const lineDiv = document.createElement('div');
                lineDiv.className = 'conversation-line';

                const nameDiv = document.createElement('div');
                nameDiv.className = 'speaker-name';
                nameDiv.textContent = speakerName + ':';
                lineDiv.appendChild(nameDiv);

                const textDiv = document.createElement('div');
                textDiv.className = 'speaker-text';
                textDiv.textContent = speakerText;
                lineDiv.appendChild(textDiv);

                conversationContainer.appendChild(lineDiv);
            } else {
                const p = document.createElement('p');
                p.textContent = line;
                conversationContainer.appendChild(p);
            }
        });

        container.appendChild(conversationContainer);
    }

    function formatAdvertisementProduct(container, subtitle, type) {
        let formattedText = subtitle.replace(/\n/g, '<br>');
        formattedText = formattedText.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\{([^}]+)\}/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const lines = formattedText.split('<br>');

        lines.forEach(line => {
            if (!line.trim()) {
                container.appendChild(document.createElement('br'));
                return;
            }

            if (line.includes(':')) {
                const [prefix, ...rest] = line.split(':');
                const remainingText = rest.join(':'); 

                const p = document.createElement('p');
                p.className = 'adv-paragraph';

                p.innerHTML = `<strong class="adv-content" style="color: black !important; font-weight: bold !important;">${prefix}:</strong> ${remainingText}`;

                container.appendChild(p);
            } else {
                const p = document.createElement('p');
                p.className = 'adv-paragraph';

                if (line === line.toUpperCase() && line.length > 3) {
                    p.style.fontWeight = 'bold';
                }

                p.innerHTML = line;
                container.appendChild(p);
            }
        });

        const allTextNodes = getTextNodes(container);
        allTextNodes.forEach(textNode => {
            const text = textNode.nodeValue;

            if (text && text.match(/[$€¥£]\d+(\.\d{2})?/)) {
                const parent = textNode.parentNode;
                const newHTML = text.replace(/([$€¥£]\d+(\.\d{2})?)/g, 
                    '<span style="font-weight: bold; color: #d35400;">$1</span>');

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHTML;

                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }

                parent.replaceChild(fragment, textNode);
            }
        });
    }

    function formatArticleNewsReport(container, subtitle) {
        let processedText = subtitle.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processedText = processedText.replace(/\{([^}]+)\}/g, '<strong>$1</strong>');
        processedText = processedText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            .replace(/\*(.*?)\*/g, '<em>$1</em>') 
            .replace(/----ARTICLE----/g, '<h3 class="article-title">ARTICLE</h3>');

        const paragraphs = processedText.split(/\n\n+/);

        paragraphs.forEach(para => {
            if (!para.trim()) return;

            const p = document.createElement('div');
            p.className = 'article-paragraph';
            p.innerHTML = para.replace(/\n/g, '<br>');
            container.appendChild(p);
        });

        highlightBlanks(container);
    }

    function formatTextCompletion(container, subtitle) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'text-completion-content';

        let processedText = subtitle.replace(/\n/g, '<br>');

        processedText = processedText.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        processedText = processedText.replace(/\{([^}]+)\}/g, '<strong>$1</strong>');

        processedText = processedText.replace(/____\((\d+)\)____/g, 
            '<span style="background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-weight: bold;">__($1)__</span>');

        processedText = processedText.replace(/____/g, 
            '<span style="background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-weight: bold;">____</span>');

        contentDiv.innerHTML = processedText;
        container.appendChild(contentDiv);
    }

    function formatParagraph(container, subtitle) {
        const paragraphWrapper = document.createElement('div');
        paragraphWrapper.className = 'paragraph-content';
        paragraphWrapper.style.fontFamily = 'Georgia, serif';
        paragraphWrapper.style.lineHeight = '1.6';
        paragraphWrapper.style.color = '#333';

        let formattedText = subtitle.replace(/\n/g, '<br>');

        formattedText = formattedText.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        formattedText = formattedText.replace(/\{([^}]+)\}/g, '<strong>$1</strong>');

        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

        formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');

        const hasNameValuePairs = /([^<>:]+):\s*([^<>]+)(?:<br>|$)/.test(formattedText);

        if (hasNameValuePairs) {
            const lines = formattedText.split('<br>');
            let conversationHTML = '<div class="conversation-container">';

            lines.forEach(line => {
                if (line.trim()) {
                    const match = line.match(/([^<>:]+):\s*(.*)/);

                    if (match) {
                        const speakerName = match[1].trim();
                        const speakerText = match[2].trim();

                        conversationHTML += `
                            <div class="conversation-line">
                                <div class="speaker-name">${speakerName}:</div>
                                <div class="speaker-text">${speakerText}</div>
                            </div>
                        `;
                    } else {
                        conversationHTML += `<p>${line}</p>`;
                    }
                }
            });

            conversationHTML += '</div>';
            paragraphWrapper.innerHTML = conversationHTML;
        } else {
            const paragraphs = formattedText.split('<br>');
            let html = '';

            paragraphs.forEach((para, index) => {
                if (!para.trim()) return;

                const p = document.createElement('p');
                p.className = 'paragraph-text';

                if (index > 0) {
                    p.style.textIndent = '1.5em';
                }

                if (para === para.toUpperCase() && para.length > 3 && !para.includes('<')) {
                    p.style.fontWeight = 'bold';
                    p.style.fontSize = '1.1em';
                    p.style.marginTop = '1.5em';
                    p.style.marginBottom = '0.75em';
                }

                p.innerHTML = para;
                paragraphWrapper.appendChild(p);
            });
        }

        container.appendChild(paragraphWrapper);

        highlightBlanks(container);
    }

    function highlightBlanks(container) {
        const allTextNodes = getTextNodes(container);

        allTextNodes.forEach(textNode => {
            const text = textNode.nodeValue;
            if (text && text.includes('____')) {
                const parent = textNode.parentNode;

                const newHTML = text
                    .replace(/____\((\d+)\)____/g, 
                        '<span style="background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-weight: bold;">__($1)__</span>')
                    .replace(/____/g, 
                        '<span style="background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-weight: bold;">____</span>');

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHTML;

                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }

                parent.replaceChild(fragment, textNode);
            }
        });
    }

    function getTextNodes(node) {
        const textNodes = [];

        function findTextNodes(node) {
            if (node.nodeType === 3) { 
                textNodes.push(node);
            } else if (node.nodeType === 1) { 
                for (let i = 0; i < node.childNodes.length; i++) {
                    findTextNodes(node.childNodes[i]);
                }
            }
        }

        findTextNodes(node);
        return textNodes;
    }

    function addNavigationElements() {
        try {
            console.log('Adding navigation elements for new layout');

            const progressElements = [
                'visual-progress-fill',
                'answered-count',
                'total-question-count',
                'current-question',
                'progress-fill',
                'question-navigator'
            ];

            progressElements.forEach(id => {
                const el = document.getElementById(id);
                if (!el) {
                    console.warn(`Navigation element not found: ${id}`);
            } else {
                    console.log(`Found navigation element: ${id}`);
                }
            });

            const totalQuestionCount = document.getElementById('total-question-count');
            if (totalQuestionCount && window.currentExam) {
                totalQuestionCount.textContent = window.currentExam.totalQuestions;
            }

            console.log('Navigation elements setup completed successfully');
        } catch (error) {
            console.error('Error adding navigation elements:', error);
        }
    }

    function addNavigationStyles() {
        // Styles moved to combined_exam.css
        return;
    }

    document.addEventListener('DOMContentLoaded', function() {
        addNavigationStyles();
        
        // Set up network status listeners
        setupNetworkListeners();
        
        // Check for admin URL parameter
        setupCacheAdminPanel();

        const retryButton = document.getElementById('retry-exam');
        if (retryButton) {
            retryButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to retry this exam? Your current results will be lost.')) {

                    window.currentQuestionIndex = 0;
                    window.userAnswers = window.currentExam ? 
                        new Array(window.currentExam.totalQuestions).fill(null) : [];

                    const examContentSection = document.getElementById('exam-content');
                    const resultsSection = document.getElementById('results');
                    if (examContentSection && resultsSection) {
                        resultsSection.classList.add('hidden');
                        examContentSection.classList.remove('hidden');

                        startExamTimer();

                        loadQuestion(0);
                    }
                }
            });
        }
    });
    
    // Set up network status event listeners
    function setupNetworkListeners() {
        // Listen for online event
        window.addEventListener('online', handleOnlineStatus);
        
        // Listen for offline event
        window.addEventListener('offline', handleOfflineStatus);
        
        // Initial check of network status
        if (!navigator.onLine) {
            handleOfflineStatus();
        }
    }

    // Handle when the user goes online
    function handleOnlineStatus() {
        console.log('Connection restored: online');
        
        // Create notification
        showNetworkStatusNotification(true);
        
        // Check if we need to refresh data
        const shouldRefresh = checkForExpiredCache();
        
        if (shouldRefresh) {
            // Only reload if we have expired caches
            if (confirm('Internet connection restored. Refresh data now?')) {
                // Clear expired caches and reload
                clearExpiredCaches();
                window.location.reload();
            }
        }
    }

    // Handle when the user goes offline
    function handleOfflineStatus() {
        console.log('Connection lost: offline');
        showNetworkStatusNotification(false);
    }

    // Check if any caches are expired
    function checkForExpiredCache() {
        let hasExpiredCache = false;
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('combined_exam_') || key.startsWith('exam_data_')) {
                try {
                    const cache = localStorage.getItem(key);
                    const cacheData = JSON.parse(cache);
                    const now = new Date().getTime();
                    
                    if (now >= cacheData.expiresAt) {
                        hasExpiredCache = true;
                    }
                } catch (e) {
                    console.error('Error checking cache expiry:', e);
                }
            }
        });
        
        return hasExpiredCache;
    }

    // Clear only expired caches
    function clearExpiredCaches() {
        const now = new Date().getTime();
        let clearedCount = 0;
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('combined_exam_') || key.startsWith('exam_data_')) {
                try {
                    const cache = localStorage.getItem(key);
                    const cacheData = JSON.parse(cache);
                    
                    if (now >= cacheData.expiresAt) {
                        localStorage.removeItem(key);
                        clearedCount++;
                    }
                } catch (e) {
                    console.error('Error clearing expired cache:', e);
                }
            }
        });
        
        console.log(`Cleared ${clearedCount} expired caches`);
        return clearedCount;
    }

    // Show network status notification
    function showNetworkStatusNotification(isOnline) {
        // Create or get notification container
        let notification = document.getElementById('network-status-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'network-status-notification';
            notification.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                padding: 10px 15px;
                border-radius: 4px;
                color: white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                z-index: 9999;
                font-size: 14px;
                transition: opacity 0.5s ease, transform 0.3s ease;
            `;
            
            document.body.appendChild(notification);
        }
        
        // Set styles and content based on status
        if (isOnline) {
            notification.style.backgroundColor = '#28a745';
            notification.innerHTML = '<strong>✓ Online</strong> - Connection restored';
        } else {
            notification.style.backgroundColor = '#dc3545';
            notification.innerHTML = '<strong>✗ Offline</strong> - Using cached data';
        }
        
        // Show with animation
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
        
        // Hide after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            
            // Remove after fade out
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 5000);
    }
    
    // Set up Cache Admin Panel
    function setupCacheAdminPanel() {
        // Only create if admin=cache in URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') !== 'cache') return;
        
        // Create panel container
        const panel = document.createElement('div');
        panel.className = 'cache-control-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #fff;
            border: 2px solid #333;
            border-radius: 5px;
            padding: 15px;
            z-index: 9999;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            max-width: 400px;
        `;
        
        // Create panel header
        const header = document.createElement('h3');
        header.textContent = 'Cache Control Panel';
        header.style.margin = '0 0 10px 0';
        panel.appendChild(header);
        
        // Create cache info section
        const cacheInfo = document.createElement('div');
        cacheInfo.className = 'cache-info';
        
        // Find and display all exam caches
        const caches = [];
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('combined_exam_') || key.startsWith('exam_data_')) {
                try {
                    const cacheData = JSON.parse(localStorage.getItem(key));
                    caches.push({
                        key: key,
                        expiresAt: cacheData.expiresAt,
                        timestamp: cacheData.timestamp,
                        size: JSON.stringify(cacheData).length
                    });
                } catch (e) {
                    console.error('Error parsing cache:', e);
                }
            }
        });
        
        if (caches.length === 0) {
            cacheInfo.innerHTML = '<p>No active caches found.</p>';
        } else {
            const cacheTable = document.createElement('table');
            cacheTable.style.width = '100%';
            cacheTable.style.borderCollapse = 'collapse';
            cacheTable.style.marginBottom = '10px';
            cacheTable.style.fontSize = '12px';
            
            // Add table header
            cacheTable.innerHTML = `
                <thead>
                    <tr style="background: #f0f0f0;">
                        <th style="padding: 5px; text-align: left; border: 1px solid #ddd;">Cache Key</th>
                        <th style="padding: 5px; text-align: left; border: 1px solid #ddd;">Created</th>
                        <th style="padding: 5px; text-align: left; border: 1px solid #ddd;">Expires</th>
                        <th style="padding: 5px; text-align: left; border: 1px solid #ddd;">Size</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            
            // Add cache data rows
            const tbody = cacheTable.querySelector('tbody');
            caches.forEach(cache => {
                const tr = document.createElement('tr');
                
                // Format dates
                const created = new Date(cache.timestamp);
                const expires = new Date(cache.expiresAt);
                
                tr.innerHTML = `
                    <td style="padding: 5px; border: 1px solid #ddd;">${cache.key.substring(0, 25)}...</td>
                    <td style="padding: 5px; border: 1px solid #ddd;">${created.toLocaleDateString()} ${created.toLocaleTimeString()}</td>
                    <td style="padding: 5px; border: 1px solid #ddd;">${expires.toLocaleDateString()} ${expires.toLocaleTimeString()}</td>
                    <td style="padding: 5px; border: 1px solid #ddd;">${Math.round(cache.size / 1024)} KB</td>
                `;
                tbody.appendChild(tr);
            });
            
            cacheInfo.appendChild(cacheTable);
            
            // Add info about next refresh
            const nextRefresh = document.createElement('p');
            const nextMonday = new Date(getNextMondayMidnight());
            nextRefresh.innerHTML = `<strong>Next scheduled refresh:</strong> ${nextMonday.toLocaleDateString()} ${nextMonday.toLocaleTimeString()} (GMT+7: Monday midnight)`;
            nextRefresh.style.fontSize = '13px';
            cacheInfo.appendChild(nextRefresh);
        }
        
        panel.appendChild(cacheInfo);
        
        // Add control buttons
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '10px';
        btnContainer.style.marginTop = '10px';
        
        // Clear cache button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear All Caches';
        clearBtn.style.cssText = 'padding: 8px 12px; background: #ff3b30; color: white; border: none; border-radius: 4px; cursor: pointer;';
        clearBtn.addEventListener('click', clearExamCaches);
        btnContainer.appendChild(clearBtn);
        
        // Refresh page button
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = 'Refresh Page';
        refreshBtn.style.cssText = 'padding: 8px 12px; background: #007aff; color: white; border: none; border-radius: 4px; cursor: pointer;';
        refreshBtn.addEventListener('click', () => window.location.reload());
        btnContainer.appendChild(refreshBtn);
        
        // Close panel button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close Panel';
        closeBtn.style.cssText = 'padding: 8px 12px; background: #8e8e93; color: white; border: none; border-radius: 4px; cursor: pointer;';
        closeBtn.addEventListener('click', () => panel.remove());
        btnContainer.appendChild(closeBtn);
        
        panel.appendChild(btnContainer);
        
        // Add panel to page
        document.body.appendChild(panel);
    }

    function toggleFeedback() {
        const feedbackContainer = document.getElementById('feedback');
        const viewFeedbackBtn = document.getElementById('view-feedback');

        if (!feedbackContainer) {
            return;
        }

        const isHidden = feedbackContainer.style.display === 'none' || 
                        (feedbackContainer.style.display === '' && feedbackContainer.classList.contains('hidden'));

        if (isHidden) {
            feedbackContainer.style.display = 'block';
            feedbackContainer.classList.remove('hidden');
            if (viewFeedbackBtn) {
                viewFeedbackBtn.textContent = 'Hide Detailed Feedback';
            }
        } else {
            feedbackContainer.style.display = 'none';
            feedbackContainer.classList.add('hidden');
            if (viewFeedbackBtn) {
                viewFeedbackBtn.textContent = 'View Detailed Feedback';
            }
        }
    }

    function addDetailedFeedback(questionResults) {
        const feedbackList = document.querySelector('.feedback-list');
        if (!feedbackList) {
            return;
        }

        feedbackList.innerHTML = '';

        questionResults.forEach((result, index) => {
            const question = window.currentExam.questions[index];
            if (!question) return;

            const feedbackItem = document.createElement('div');
            feedbackItem.className = `feedback-item ${result.isCorrect ? 'correct' : 'incorrect'}`;

            const options = question.options || [];
            const userOptionText = result.selectedOption !== null && options[result.selectedOption] 
                ? options[result.selectedOption] 
                : 'Not answered';

            const correctOptionText = options[result.correctOption] || 'Unknown';

            feedbackItem.innerHTML = `
                <div class="feedback-question">
                    <span class="question-number">Question ${index + 1}:</span>
                    <span class="question-type">${formatTypeName(question.type || 'unknown')}</span>
                    ${question.text ? `<p class="question-text">${question.text}</p>` : ''}
                </div>
                <div class="feedback-answer">
                    <div class="user-answer ${result.selectedOption !== null ? (result.isCorrect ? 'correct' : 'incorrect') : 'unanswered'}">
                        <span class="answer-label">Your answer:</span>
                        <span class="answer-text">${userOptionText}</span>
                    </div>
                    <div class="correct-answer">
                        <span class="answer-label">Correct answer:</span>
                        <span class="answer-text">${correctOptionText}</span>
                    </div>
                </div>
            `;

            feedbackList.appendChild(feedbackItem);
        });

        const feedbackContainer = document.getElementById('feedback');
        if (feedbackContainer) {
            feedbackContainer.style.transition = 'all 0.3s ease';
            feedbackContainer.style.backgroundColor = '#f8fafc';
            feedbackContainer.style.borderRadius = '10px';
            feedbackContainer.style.padding = '20px';
            feedbackContainer.style.marginTop = '30px';
            feedbackContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';

            feedbackContainer.style.display = 'none';
            feedbackContainer.classList.add('hidden');
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Initialize exam selection when DOM is loaded
        if (typeof initializeExamSelection === 'function') {
            initializeExamSelection();
        }
        
        setTimeout(function() {
            const viewFeedbackBtn = document.getElementById('view-feedback');
            const feedbackContainer = document.getElementById('feedback');

            if (viewFeedbackBtn && feedbackContainer) {
                viewFeedbackBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (feedbackContainer.style.display === 'none' || 
                        feedbackContainer.style.display === '' && feedbackContainer.classList.contains('hidden')) {
                        feedbackContainer.style.display = 'block';
                        feedbackContainer.classList.remove('hidden');
                        viewFeedbackBtn.textContent = 'Hide Detailed Feedback';
                    } else {
                        feedbackContainer.style.display = 'none';
                        feedbackContainer.classList.add('hidden');
                        viewFeedbackBtn.textContent = 'View Detailed Feedback';
                    }

                    return false;
                });
            }
        }, 1000); 
    });

    function addScoreSuggestions(scorePercentage, typeScores) {
        try {
            if (!DOM.suggestionsContainer || !DOM.suggestionsContent) {
                return;
            }

            DOM.suggestionsContent.innerHTML = '';

            const suggestions = generateSuggestions(scorePercentage, typeScores);

            suggestions.forEach(suggestion => {
                const suggestionElement = document.createElement('div');
                suggestionElement.className = 'suggestion-item';

                const titleElement = document.createElement('h4');
                titleElement.className = 'suggestion-title';
                titleElement.textContent = suggestion.title;

                const textElement = document.createElement('p');
                textElement.className = 'suggestion-text';
                textElement.textContent = suggestion.text;

                suggestionElement.appendChild(titleElement);
                suggestionElement.appendChild(textElement);
                DOM.suggestionsContent.appendChild(suggestionElement);
            });
        } catch (error) {
        }
    }

    function generateSuggestions(scorePercentage, typeScores) {
        const suggestions = [];

        if (scorePercentage < 40) {
            suggestions.push({
                title: 'พัฒนาพื้นฐานภาษาอังกฤษ',
                text: 'คะแนนของคุณอยู่ในเกณฑ์ที่ต้องปรับปรุงอย่างมาก แนะนำให้เริ่มจากการทบทวนไวยากรณ์และคำศัพท์พื้นฐาน รวมถึงฝึกฝนการอ่านและเขียนเพิ่มเติม'
            });
        } else if (scorePercentage < 60) {
            suggestions.push({
                title: 'ทบทวนหลักไวยากรณ์',
                text: 'คะแนนของคุณอยู่ในระดับพอใช้ การทบทวนหลักไวยากรณ์และฝึกการประยุกต์ใช้จะช่วยให้คุณพัฒนาได้อย่างต่อเนื่อง'
            });
        } else if (scorePercentage < 80) {
            suggestions.push({
                title: 'ฝึกฝนเทคนิคการทำข้อสอบ',
                text: 'คะแนนของคุณอยู่ในระดับดี การฝึกเทคนิคการทำข้อสอบเพิ่มเติมจะช่วยให้คุณใช้เวลาในการทำข้อสอบได้อย่างมีประสิทธิภาพมากขึ้น'
            });
        } else {
            suggestions.push({
                title: 'รักษาระดับและเพิ่มความเชี่ยวชาญ',
                text: 'คะแนนของคุณอยู่ในระดับดีเยี่ยม แนะนำให้รักษาระดับความสามารถและต่อยอดทักษะให้ละเอียดมากขึ้น'
            });
        }

        if (typeScores && Object.keys(typeScores).length > 0) {
            const sortedTypes = Object.entries(typeScores)
                .filter(([type, score]) => score.percentage !== undefined)
                .sort((a, b) => a[1].percentage - b[1].percentage);

            if (sortedTypes.length > 0) {
                const [weakestType, weakestScore] = sortedTypes[0];
                const formatted = formatTypeName(weakestType);

                if (weakestScore.percentage < 50) {
                    let practiceText = '';

                    switch (weakestType) {
                        case 'short_conversation':
                        case 'long_conversation':
                            practiceText = 'ฝึกฟังบทสนทนาภาษาอังกฤษและจดโน้ตใจความสำคัญ ฝึกฟังบทสนทนาหลากหลายสถานการณ์';
                            break;
                        case 'advertisement':
                        case 'product':
                            practiceText = 'ฝึกอ่านโฆษณาและข้อมูลสินค้าในชีวิตประจำวัน เก็บคำศัพท์เฉพาะทางการตลาดและการประชาสัมพันธ์';
                            break;
                        case 'news_report':
                        case 'article':
                            practiceText = 'อ่านข่าวภาษาอังกฤษหรือบทความวิชาการเป็นประจำ และฝึกสรุปใจความสำคัญ';
                            break;
                        case 'text_completion':
                            practiceText = 'ฝึกทำแบบฝึกหัดเติมคำในประโยคให้ถูกต้องตามหลักไวยากรณ์ และเรียนรู้คำเชื่อมประโยค';
                            break;
                        case 'paragraph':
                            practiceText = 'ฝึกจัดเรียงย่อหน้าให้เป็นเรื่องราวที่ต่อเนื่อง โดยสังเกตคำเชื่อมและความต่อเนื่องของเนื้อหา';
                            break;
                        default:
                            practiceText = 'ฝึกฝนทำแบบทดสอบในรูปแบบนี้ให้มากขึ้น และวิเคราะห์ข้อผิดพลาดเพื่อพัฒนาต่อไป';
                    }

                    suggestions.push({
                        title: `พัฒนาทักษะด้าน ${formatted}`,
                        text: `จุดที่ควรพัฒนามากที่สุดคือส่วนของ ${formatted} (${weakestScore.percentage.toFixed(0)}%) ${practiceText}`
                    });
                }
            }
        }

        suggestions.push({
            title: 'การบริหารเวลา',
            text: 'ฝึกทำข้อสอบโดยจับเวลา กำหนดเวลาในการทำข้อสอบแต่ละส่วนให้เหมาะสม และฝึกการจัดลำดับความสำคัญของข้อสอบ'
        });

        return suggestions;
    }

    function initializeQuestionNavigator(questionCount) {
        const navigator = document.getElementById('question-navigator');
        if (!navigator) return;

        navigator.innerHTML = '';

        const categories = [
            { name: 'SPEAKING', start: 1, end: 20, class: 'speaking' },
            { name: 'READING', start: 21, end: 60, class: 'reading' },
            { name: 'WRITING', start: 61, end: 80, class: 'writing' }
        ];

        categories.forEach(category => {
            const categoryHeader = document.createElement('div');
            categoryHeader.className = `category-header ${category.class}`;
            categoryHeader.textContent = category.name;
            navigator.appendChild(categoryHeader);

            for (let i = category.start - 1; i < Math.min(category.end, questionCount); i++) {
                const button = document.createElement('div');
                button.className = `question-nav-item ${category.class}`;
                button.textContent = (i + 1).toString();
                button.dataset.index = i;

                button.addEventListener('click', function() {
                    saveCurrentAnswer();
                    loadQuestion(parseInt(this.dataset.index));
                });

                navigator.appendChild(button);
            }
        });

        const totalQuestionCount = document.getElementById('total-question-count');
        if (totalQuestionCount) {
            totalQuestionCount.textContent = `${questionCount.toString()} ข้อ`;
        }

        const visualProgressFill = document.getElementById('visual-progress-fill');
        if (visualProgressFill) {
            visualProgressFill.style.width = '0%';
        }

        addCategoryStyles();
    }

    function updateQuestionNavigator(currentIndex) {
        if (!DOM.questionNavigator) return;

        let category = '';
        if (currentIndex < 20) {
            category = 'speaking';
        } else if (currentIndex < 60) {
            category = 'reading';
        } else {
            category = 'writing';
        }

        const buttons = DOM.questionNavigator.querySelectorAll('.question-nav-item');
        buttons.forEach((button, index) => {
            const buttonIndex = parseInt(button.dataset.index);

            button.classList.remove('current', 'answered', 'unanswered');

            if (buttonIndex === currentIndex) {
                button.classList.add('current');
            } else if (window.userAnswers && window.userAnswers[buttonIndex] !== null) {
                button.classList.add('answered');
            } else {
                button.classList.add('unanswered');
            }
        });

        const answeredCount = window.userAnswers ? window.userAnswers.filter(answer => answer !== null).length : 0;
        
        if (DOM.answeredCount) {
            DOM.answeredCount.textContent = `${answeredCount.toString()} เลือกคำตอบแล้ว`;
        }

        const totalQuestions = window.currentExam ? window.currentExam.totalQuestions : 0;
        
        if (DOM.visualProgressFill && totalQuestions > 0) {
            const progressPercentage = (answeredCount / totalQuestions) * 100;
            DOM.visualProgressFill.style.width = `${progressPercentage}%`;
        }
    }

    function addQuestionProgressText(container, currentQuestionNum, totalQuestions) {
        const progressText = document.createElement('div');
        progressText.className = 'question-progress-text';
        progressText.textContent = `ข้อที่ ${currentQuestionNum}   `;

        if (container.firstChild) {
            container.insertBefore(progressText, container.firstChild);
        } else {
            container.appendChild(progressText);
        }
    }

    function initializeExamSelection() {
            const examOptionsContainer = document.getElementById('exam-options-container');
        const startButton = document.getElementById('start-combined-exam');
        
        let examData = {};
        
        // Fetch exam metadata from JSON file
        fetch('../data/Info/exam_metadata.json')
            .then(response => response.json())
            .then(data => {
                // Transform array to object with exam id as key
                data.forEach(exam => {
                    examData[exam.id] = exam;
                });
                
                // Generate HTML for each exam option
                data.forEach((exam, index) => {
                    const isActive = index === 0; // Make first exam active
                    
                    const examOption = document.createElement('div');
                    examOption.className = `exam-option ${isActive ? 'active' : ''}`;
                    examOption.setAttribute('data-exam-id', exam.id);
                    
                    examOption.innerHTML = `
                        <div class="exam-option-header">
                            <h3>${exam.title}</h3>
                            <span class="exam-date">${exam.date}</span>
                        </div>
                        <div class="exam-option-details">
                            <div class="option-metadata">
                                <span><i class="fas fa-list-ol"></i> ${exam.qc} ข้อ</span>
                                <span><i class="fas fa-clock"></i> ${exam.du} นาที</span>
                            </div>
                            <div class="option-skill-bars">
                                <div class="skill-bar speaking" style="width: ${exam.dis.s}%"></div>
                                <div class="skill-bar reading" style="width: ${exam.dis.r}%"></div>
                                <div class="skill-bar writing" style="width: ${exam.dis.w}%"></div>
                            </div>
                        </div>
                    `;
                    
                    examOptionsContainer.appendChild(examOption);
                });
                
                // Initialize UI after data is loaded
                initializeExamUI();
            })
            .catch(error => {
                console.error('Error loading exam metadata:', error);
            });
            
        function initializeExamUI() {
            const examOptions = document.querySelectorAll('.exam-option');
            
            examOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const examId = this.dataset.examId;
                    
                    examOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    
                    updateExamDetails(examData[examId]);
                    
                    startButton.dataset.currentExam = examId;
                });
            });
            
            startButton.addEventListener('click', function() {
                const selectedExamId = this.dataset.currentExam;
                const selectedExam = examData[selectedExamId];
                
                window.selectedExamData = selectedExam;
                
                document.getElementById("exam-info").scrollIntoView({ behavior: 'smooth' });
                document.getElementById("exam-info").classList.add('hidden');
                document.getElementById("exam-content").classList.remove('hidden');
                
                startTime = Date.now();
                elapsedSeconds = 0;
                window.examTimerValue = 0;
                window.finalElapsedTime = 0; 
                
                window.examStartTimestamp = Date.now();
                
                const timerElement = document.getElementById('timer-display');
                if (timerElement) {
                    timerElement.textContent = '00:00';
                }
                
                loadSelectedExam(selectedExam);
            });
            
            // Initialize with the first exam if available
            if (Object.keys(examData).length > 0) {
                const firstExamId = Object.keys(examData)[0];
                updateExamDetails(examData[firstExamId]);
                
                // Set the current exam id for the start button
                startButton.dataset.currentExam = firstExamId;
            }
        }
    }

    function updateExamDetails(examData) {
        document.getElementById('total-questions-count').textContent = examData.qc;
        document.getElementById('exam-time').textContent = `${examData.du} นาที`;
        document.getElementById('exam-difficulty').textContent = examData.dif;

        document.getElementById('exam-description-th').textContent = examData.deTh;
        document.getElementById('exam-description-en').textContent = examData.deEN;

        const distributionBar = document.querySelector('.dis-bar');
        if (distributionBar) {
            distributionBar.innerHTML = `
                <div class="bar-segment s-segment" style="width: ${examData.dis.s}%;" 
                     title="Speaking: ${examData.dis.s}%"></div>
                <div class="bar-segment r-segment" style="width: ${examData.dis.r}%;" 
                     title="Reading: ${examData.dis.r}%"></div>
                <div class="bar-segment w-segment" style="width: ${examData.dis.w}%;" 
                     title="Writing: ${examData.dis.w}%"></div>
            `;
        }

        document.querySelector('.total-value').textContent = examData.qc;

        const speakingCount = examData.q.s_c + examData.q.l_c;
        const readingCount = examData.q.ad + examData.q.pr + 
                            examData.q.n_r + examData.q.ar;
        const writingCount = examData.q.t_c + examData.q.pa;

        document.querySelector('.skill-section.s .skill-count').textContent = `${speakingCount} ข้อ`;
        document.querySelector('.skill-section.r .skill-count').textContent = `${readingCount} ข้อ`;
        document.querySelector('.skill-section.w .skill-count').textContent = `${writingCount} ข้อ`;

        updateQuestionTypeCount('short-conversation', examData.q.s_c);
        updateQuestionTypeCount('long-conversation', examData.q.l_c);
        updateQuestionTypeCount('ad', examData.q.ad);
        updateQuestionTypeCount('pr', examData.q.pr);
        updateQuestionTypeCount('news-report', examData.q.n_r);
        updateQuestionTypeCount('ar', examData.q.ar);
        updateQuestionTypeCount('text-completion', examData.q.t_c);
        updateQuestionTypeCount('pa', examData.q.pa);
    }

    function updateQuestionTypeCount(typeClass, count) {
        const typeCountElement = document.querySelector(`.question-type-indicator.${typeClass}`).nextElementSibling;
        if (typeCountElement) {
            typeCountElement.textContent = `${count} ข้อ`;
        }
    }

    function loadSelectedExam(examData) {
        const jsonPath = examData.jsonPath;
        
        // Generate a unique cache key for this exam
        const cacheKey = `combined_exam_${jsonPath.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        // Check if we have valid cached data
        if (isCacheValid(cacheKey)) {
            console.log(`Using cached data for ${examData.title}`);
            try {
                const cachedData = JSON.parse(localStorage.getItem(cacheKey));
                const processedData = processExamData(cachedData.data);
                initExam(processedData);
                return;
            } catch (error) {
                console.error('Error processing cached exam data:', error);
                // Continue with fetch if cache processing fails
            }
        }
        
        // Check network status
        if (!navigator.onLine) {
            const offlineData = handleOfflineMode(cacheKey, jsonPath);
            if (offlineData) {
                const processedData = processExamData(offlineData);
                initExam(processedData);
                return;
            } else {
                // Use sample data if offline and no cache
                const sampleData = generateSampleExamData(examData);
                initExam(sampleData);
                return;
            }
        }
        
        console.log(`Fetching fresh data for ${examData.title}`);
        fetch(jsonPath, {
            cache: 'no-cache',  // Force fresh data from server
            headers: { 'Cache-Control': 'no-cache' }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Path ${jsonPath} failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(examJson => {
                // Store the data in cache
                try {
                    // Calculate next Monday midnight for cache expiry
                    const expiresAt = getNextMondayMidnight();
                    
                    // Store in localStorage with expiry time
                    localStorage.setItem(cacheKey, JSON.stringify({
                        data: examJson,
                        expiresAt: expiresAt,
                        timestamp: new Date().getTime()
                    }));
                    
                    console.log(`Exam data cached with expiry: ${new Date(expiresAt).toLocaleString()}`);
                } catch (error) {
                    console.error('Error caching exam data:', error);
                }
                
                const processedData = processExamData(examJson);
                initExam(processedData); 
            })
            .catch(error => {
                console.error(`Error loading exam ${examData.title}:`, error);
                const sampleData = generateSampleExamData(examData);
                initExam(sampleData);
            });
    }
});