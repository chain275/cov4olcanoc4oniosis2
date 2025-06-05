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
        DOM.examInfo.scrollIntoView({ behavior: 'smooth' });
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
        if (index >= paths.length) {

            const processedSampleData = processExamData(getSampleExamData());
            initExam(processedSampleData);
            return;
        }

        const path = paths[index];

        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Path ${path} failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(examData => {

                const processedData = processExamData(examData);
                initExam(processedData); 
            })
            .catch(error => {

                tryNextPath(paths, index + 1);
            });
    }

    function processExamData(examData) {
        if (!examData || !Array.isArray(examData)) {
            return getSampleExamData();
        }

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

    function getSampleExamData() {

        const sampleData = [];

        for (let i = 0; i < 3; i++) {
            sampleData.push({
                id: `short_conversation_${i+1}`,
                type: "short_conversation",
                text: "Sample short conversation question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0
            });
        }

        sampleData.push({
            id: "long_conversation_1",
            type: "long_conversation",
            text: "Sample long conversation question",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 1
        });

        for (let i = 0; i < 2; i++) {
            sampleData.push({
                id: `advertisement_${i+1}`,
                type: "advertisement",
                text: "Sample advertisement question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 2
            });
        }

        for (let i = 0; i < 2; i++) {
            sampleData.push({
                id: `product_${i+1}`,
                type: "product",
                text: "Sample product question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 3
            });
        }

        for (let i = 0; i < 2; i++) {
            sampleData.push({
                id: `news_report_${i+1}`,
                type: "news_report",
                text: "Sample news report question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0
            });
        }

        for (let i = 0; i < 2; i++) {
            sampleData.push({
                id: `article_${i+1}`,
                type: "article",
                text: "Sample article question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 1
            });
        }

        for (let i = 0; i < 3; i++) {
            sampleData.push({
                id: `text_completion_${i+1}`,
                type: "text_completion",
                text: "Sample text completion question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 2
            });
        }

        for (let i = 0; i < 5; i++) {
            sampleData.push({
                id: `paragraph_${i+1}`,
                type: "paragraph",
                text: "Sample paragraph question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 3
            });
        }

        return sampleData;
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
        if (document.getElementById('category-styles')) return;

        const styleElement = document.createElement('style');
        styleElement.id = 'category-styles';

        styleElement.textContent = `
            .category-header {
                width: 100%;
                text-align: center;
                font-weight: bold;
                padding: 5px 0;
                margin: 10px 0 5px 0;
                border-radius: 4px;
                color: white;
                font-size: 12px;
            }

            .category-header.speaking {
                background-color: #FF5722;
            }

            .category-header.reading {
                background-color: #3F51B5;
            }

            .category-header.writing {
                background-color: #00BCD4;
            }

            .question-nav-item.speaking {
                border-bottom: 2px solid #FF5722;
            }

            .question-nav-item.reading {
                border-bottom: 2px solid #3F51B5;
            }

            .question-nav-item.writing {
                border-bottom: 2px solid #00BCD4;
            }

            .question-navigator {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                justify-content: center;
                padding: 10px;
            }
        `;

        document.head.appendChild(styleElement);
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

                    const skillsObject = { reading: 0, writing: 0, speaking: 0 };
                    skillsObject[primarySkill] = typeScorePercentage;

                    const examResultData = {
                        examType: formatTypeName(type), 
                        score: typeScorePercentage,
                        date: dateStamp,
                        totalQuestions: counts.total,
                        correctAnswers: counts.correct,
                        skills: skillsObject,
                        timeTaken: 0, 

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

            const overallExamData = {
                examType: 'combined_exam',
                score: overallScorePercentage,
                date: dateStamp,
                totalQuestions: totalQuestions,
                correctAnswers: totalCorrect,
                skills: overallSkills,
                timeTaken: timeTaken
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

        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);

            const style = document.createElement('style');
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                }
                .notification {
                    padding: 15px 20px;
                    margin-bottom: 10px;
                    border-radius: 4px;
                    color: white;
                    font-weight: 500;
                    opacity: 0;
                    transform: translateX(50px);
                    transition: opacity 0.3s, transform 0.3s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    max-width: 300px;
                }
                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }
                .notification.info {
                    background-color: #2196F3;
                }
                .notification.success {
                    background-color: #4CAF50;
                }
                .notification.warning {
                    background-color: #FFC107;
                    color: #333;
                }
                .notification.error {
                    background-color: #F44336;
                }
                .notification-icon {
                    margin-right: 10px;
                    font-size: 1.2em;
                }
                .notification-message {
                    flex-grow: 1;
                }
            `;
            document.head.appendChild(style);
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
        if (document.getElementById('percentile-styles')) return;

        const styleElement = document.createElement('style');
        styleElement.id = 'percentile-styles'; 

        styleElement.textContent = `
            .percentile-container {
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .percentile-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }

            .percentile-header h4 {
                margin: 0;
                font-size: 18px;
                color: #333;
                font-weight: 600;
            }

            .percentile-details {
                display: flex;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            }

            .percentile-value-display {
                font-size: 24px;
                font-weight: 700;
                color: #2563eb;
            }

            .rank-display {
                font-size: 14px;
                color: #64748b;
            }

            .percentile-bar {
                margin-bottom: 20px;
                position: relative;
                padding-bottom: 25px;
            }

            .percentile-track {
                height: 12px;
                background-color: #e2e8f0;
                border-radius: 6px;
                overflow: hidden;
            }

            .percentile-fill {
                height: 100%;
                background: linear-gradient(to right, #3b82f6, #2563eb);
                border-radius: 6px;
                transition: width 1.5s ease-in-out;
            }

            .percentile-markers {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
            }

            .marker {
                position: absolute;
                font-size: 12px;
                color: #64748b;
                transform: translateX(-50%);
            }

            .score-adjustment-note {
                font-size: 13px;
                color: #64748b;
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 5px;
            }

            .score-adjustment-note i {
                color: #3b82f6;
            }

            .tutor-recommendation {
                margin-top: 20px;
                padding: 15px;
                border-radius: 8px;
                background-color: #fff8e1;
                border-left: 4px solid #ffb300;
            }

            .recommendation-alert {
                display: flex;
                align-items: flex-start;
            }

            .recommendation-alert i {
                font-size: 24px;
                color: #ffb300;
                margin-right: 15px;
                margin-top: 5px;
            }

            .recommendation-content {
                flex: 1;
            }

            .recommendation-content h4 {
                margin: 0 0 8px 0;
                color: #e65100;
                font-size: 16px;
            }

            .recommendation-content p {
                margin: 0 0 12px 0;
                color: #5d4037;
                font-size: 14px;
            }

            .tutor-link {
                display: inline-block;
                background-color: #ff9800;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                text-decoration: none;
                font-weight: 500;
                transition: background-color 0.2s ease;
            }

            .tutor-link:hover {
                background-color: #f57c00;
                text-decoration: none;
            }

            @media (max-width: 768px) {
                .percentile-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .percentile-details {
                    width: 100%;
                    justify-content: space-between;
                }

                .recommendation-alert {
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .recommendation-alert i {
                    margin-right: 0;
                    margin-bottom: 10px;
                }
            }
        `;

        document.head.appendChild(styleElement);
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

        container.insertBefore(indicator, container.firstChild);
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
        const styleElement = document.createElement('style');
        styleElement.textContent = `

            .question-jump-menu {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 12px;
                box-shadow: 0 5px 30px rgba(0,0,0,0.3);
                z-index: 1000;
                padding: 25px;
                width: 90%;
                max-width: 800px;
                max-height: 85vh;
                overflow-y: auto;
                color: #333;
            }

            .exam-header {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e7eb;
            }

            .exam-title-container {
                margin-bottom: 20px;
            }

            .question-progress-text {
                background-color: #f1f5f9;
                color: #475569;
                font-size: 14px;
                font-weight: 500;
                text-align: center;
                padding: 8px 12px;
                border-radius: 6px;
                margin-bottom: 16px;
                margin-top: 5px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                position: relative;
                z-index: 2;
            }

            .question-container .question-text {
                font-size: 18px;
                font-weight: 500;
                color: #1e293b;
                background-color: white;
                padding: 16px 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                line-height: 1.5;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                border-left: 4px solid #3b82f6;
            }

            .content-wrapper {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin-top: 15px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .options-wrapper {
                background-color: #fff;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                border: 1px solid #eaeaea;
                margin-top: 15px;
            }

            .question-container {
                position: relative;
                padding-top: 15px;
            }

            .question-content {
                margin-bottom: 15px;
            }

            .options-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .question-type-indicator {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 4px;
                color: white;
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 10px;
                position: absolute;
                top: -10px;
                right: 16px;
                z-index: 5;
            }

            .jump-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
            }

            .jump-menu-header h4 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: #333;
            }

            .close-jump-menu {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                transition: color 0.2s;
            }

            .close-jump-menu:hover {
                color: #333;
            }

            .type-legend, .status-legend {
                margin-bottom: 20px;
                background: #f8f8f8;
                padding: 15px;
                border-radius: 8px;
            }

            .legend-title, .status-title {
                font-weight: 600;
                margin-bottom: 10px;
                font-size: 16px;
            }

            .legend-items {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .legend-item {
                display: flex;
                align-items: center;
                font-size: 14px;
                margin-right: 15px;
            }

            .legend-color {
                width: 12px;
                height: 12px;
                margin-right: 6px;
                border-radius: 3px;
            }

            .legend-color.short-conversation { background-color: #FF9800; }
            .legend-color.long-conversation { background-color: #FF5722; }
            .legend-color.advertisement { background-color: #E91E63; }
            .legend-color.product { background-color: #9C27B0; }
            .legend-color.news-report { background-color: #673AB7; }
            .legend-color.article { background-color: #3F51B5; }
            .legend-color.text-completion { background-color: #00BCD4; }
            .legend-color.paragraph { background-color: #009688; }

            .status-items {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }

            .status-item {
                display: flex;
                align-items: center;
                font-size: 14px;
            }

            .status-indicator {
                width: 15px;
                height: 15px;
                border-radius: 50%;
                margin-right: 8px;
                display: inline-block;
            }

            .status-indicator.current { 
                background-color: #4CAF50; 
                box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
            }

            .status-indicator.answered { 
                background-color: #2196F3; 
                box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
            }

            .status-indicator.not-answered { 
                background-color: #FFC107; 
                box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3);
            }

            .question-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }

            .question-jump-button {
                position: relative;
                aspect-ratio: 1 / 1;
                background: #f5f5f5;
                border: 2px solid #ddd;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: all 0.2s;
                padding: 10px;
            }

            .question-jump-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 10px rgba(0,0,0,0.1);
            }

            .question-number {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .question-status {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: #ddd;
                position: absolute;
                bottom: 8px;
                right: 8px;
            }

            .question-jump-button.current {
                background: #e8f5e9;
                border-color: #4CAF50;
                box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
            }

            .question-jump-button.current .question-status {
                background-color: #4CAF50;
            }

            .question-jump-button.answered:not(.current) {
                background: #e3f2fd;
                border-color: #2196F3;
            }

            .question-jump-button.answered:not(.current) .question-status {
                background-color: #2196F3;
            }

            .question-jump-button.not-answered:not(.current) .question-status {
                background-color: #FFC107;
            }

            .question-jump-button.type-short-conversation {
                border-top: 4px solid #FF9800;
            }

            .question-jump-button.type-long-conversation {
                border-top: 4px solid #FF5722;
            }

            .question-jump-button.type-advertisement {
                border-top: 4px solid #E91E63;
            }

            .question-jump-button.type-product {
                border-top: 4px solid #9C27B0;
            }

            .question-jump-button.type-news-report {
                border-top: 4px solid #673AB7;
            }

            .question-jump-button.type-article {
                border-top: 4px solid #3F51B5;
            }

            .question-jump-button.type-text-completion {
                border-top: 4px solid #00BCD4;
            }

            .question-jump-button.type-paragraph {
                border-top: 4px solid #009688;
            }

            .question-status-indicator {
                width: 15px;
                height: 15px;
                border-radius: 50%;
                margin-left: 10px;
            }

            .question-status-indicator.answered {
                background-color: #4CAF50;
                box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
            }

            .question-status-indicator.unanswered {
                background-color: #FFC107;
                box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3);
            }

            .progress-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
            }

            .progress-bar {
                flex: 1;
                margin-right: 15px;
            }

            .answered-count {
                margin: 0 15px;
                font-size: 14px;
                color: #555;
            }

            .jump-button {
                display: flex;
                justify-content: center;
                align-items: center;
                background: none;
                border: 1px solid #ddd;
                color: #555;
                font-size: 18px;
                cursor: pointer;
                padding: 5px 10px;
                margin-right: 15px;
                border-radius: 4px;
                transition: all 0.2s;
                height: 35px;
                width: 35px;
            }

            .jump-button:hover {
                background: #f5f5f5;
                color: #000;
                border-color: #ccc;
            }

            .keyboard-shortcuts-hint {
                text-align: center;
                margin: 15px 0 5px;
                padding: 8px;
                background: #f9f9f9;
                border-radius: 4px;
                font-size: 14px;
                color: #666;
            }

            .hidden {
                display: none !important;
            }

            @media (max-width: 768px) {
                .question-grid {
                    grid-template-columns: repeat(4, 1fr);
                }

                .keyboard-shortcuts-hint {
                    display: none; 
                }

                .legend-items, .status-items {
                    flex-direction: column;
                    gap: 8px;
                }

                .question-jump-menu {
                    padding: 15px;
                }
            }

            @media (max-width: 480px) {
                .question-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }

                .answered-count {
                    font-size: 12px;
                }

                .question-number {
                    font-size: 16px;
                }

                .jump-menu-header h4 {
                    font-size: 18px;
                }
            }
        `;

        document.head.appendChild(styleElement);
    }

    document.addEventListener('DOMContentLoaded', function() {
        addNavigationStyles();

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
        progressText.textContent = `ข้อที่ ${currentQuestionNum} จาก ${totalQuestions}`;

        if (container.firstChild) {
            container.insertBefore(progressText, container.firstChild);
        } else {
            container.appendChild(progressText);
        }
    }

    function initializeExamSelection() {
        const examOptions = document.querySelectorAll('.exam-option');
        const startButton = document.getElementById('start-combined-exam');

        const examData = {
            'exam1': {
                id: 'exam1',
                title: 'A-Level ภาษาอังกฤษ',
                date: '06-05-2025',
                questionCount: 80,
                duration: 90,
                difficulty: 'ปานกลาง-ยาก',
                descriptionTh: 'แบบทดสอบรวมทักษะที่หลากหลาย ประกอบด้วยโจทย์บทสนทนาสั้น (12) บทสนทนายาว (8) โฆษณา (6) สินค้า (12) ข่าว (6) บทความ (16) แบบเติมคำ (15) และการจัดย่อหน้า (5)',
                descriptionEn: 'This comprehensive A-Level exam combines all question types to simulate the full TCAS English testing experience. Each question will be labeled with its category to help you track your performance across different skills.',
                distribution: {
                    speaking: 20, 
                    reading: 50,
                    writing: 30
                },
                questions: {
                    'short_conversation': 12,
                    'long_conversation': 8,
                    'advertisement': 6,
                    'product': 12,
                    'news_report': 6,
                    'article': 16,
                    'text_completion': 15,
                    'paragraph': 5
                },
                jsonPath: '../src/complete exam/combined_exam.json'
            },
            'exam2': {
                id: 'exam2',
                title: 'ข้อสอบ O-NET',
                date: '15-04-2025',
                questionCount: 60,
                duration: 60,
                difficulty: 'ปานกลาง',
                descriptionTh: 'ข้อสอบ O-NET ภาษาอังกฤษรูปแบบล่าสุด เน้นการวัดความสามารถทางด้านการสื่อสาร การอ่าน และการเขียน',
                descriptionEn: 'The latest O-NET English exam format focusing on communication skills, reading comprehension, and writing abilities.',
                distribution: {
                    speaking: 20,
                    reading: 60,
                    writing: 20
                },
                questions: {
                    'short_conversation': 8,
                    'long_conversation': 4,
                    'advertisement': 8,
                    'product': 10,
                    'news_report': 10,
                    'article': 8,
                    'text_completion': 8,
                    'paragraph': 4
                },
                jsonPath: '../src/complete exam/onet_exam.json'
            },
            'exam3': {
                id: 'exam3',
                title: '9 วิชาสามัญ',
                date: '25-03-2025',
                questionCount: 75,
                duration: 85,
                difficulty: 'ยาก',
                descriptionTh: 'ข้อสอบ 9 วิชาสามัญ ภาษาอังกฤษ เน้นคำศัพท์ระดับสูง ไวยากรณ์ที่ซับซ้อน และการอ่านเชิงวิเคราะห์',
                descriptionEn: 'The 9 Common Subjects English exam focuses on advanced vocabulary, complex grammar structures, and analytical reading comprehension.',
                distribution: {
                    speaking: 15,
                    reading: 45,
                    writing: 40
                },
                questions: {
                    'short_conversation': 6,
                    'long_conversation': 5,
                    'advertisement': 5,
                    'product': 8,
                    'news_report': 8,
                    'article': 13,
                    'text_completion': 20,
                    'paragraph': 10
                },
                jsonPath: '../src/complete exam/common_exam.json'
            }
        };

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

        updateExamDetails(examData.exam1);
    }

    function updateExamDetails(examData) {
        document.getElementById('total-questions-count').textContent = examData.questionCount;
        document.getElementById('exam-time').textContent = `${examData.duration} นาที`;
        document.getElementById('exam-difficulty').textContent = examData.difficulty;

        document.getElementById('exam-description-th').textContent = examData.descriptionTh;
        document.getElementById('exam-description-en').textContent = examData.descriptionEn;

        const distributionBar = document.querySelector('.distribution-bar');
        if (distributionBar) {
            distributionBar.innerHTML = `
                <div class="bar-segment speaking-segment" style="width: ${examData.distribution.speaking}%;" 
                     title="Speaking: ${examData.distribution.speaking}%"></div>
                <div class="bar-segment reading-segment" style="width: ${examData.distribution.reading}%;" 
                     title="Reading: ${examData.distribution.reading}%"></div>
                <div class="bar-segment writing-segment" style="width: ${examData.distribution.writing}%;" 
                     title="Writing: ${examData.distribution.writing}%"></div>
            `;
        }

        document.querySelector('.total-value').textContent = examData.questionCount;

        const speakingCount = examData.questions.short_conversation + examData.questions.long_conversation;
        const readingCount = examData.questions.advertisement + examData.questions.product + 
                            examData.questions.news_report + examData.questions.article;
        const writingCount = examData.questions.text_completion + examData.questions.paragraph;

        document.querySelector('.skill-section.speaking .skill-count').textContent = `${speakingCount} ข้อ`;
        document.querySelector('.skill-section.reading .skill-count').textContent = `${readingCount} ข้อ`;
        document.querySelector('.skill-section.writing .skill-count').textContent = `${writingCount} ข้อ`;

        updateQuestionTypeCount('short-conversation', examData.questions.short_conversation);
        updateQuestionTypeCount('long-conversation', examData.questions.long_conversation);
        updateQuestionTypeCount('advertisement', examData.questions.advertisement);
        updateQuestionTypeCount('product', examData.questions.product);
        updateQuestionTypeCount('news-report', examData.questions.news_report);
        updateQuestionTypeCount('article', examData.questions.article);
        updateQuestionTypeCount('text-completion', examData.questions.text_completion);
        updateQuestionTypeCount('paragraph', examData.questions.paragraph);
    }

    function updateQuestionTypeCount(typeClass, count) {
        const typeCountElement = document.querySelector(`.question-type-indicator.${typeClass}`).nextElementSibling;
        if (typeCountElement) {
            typeCountElement.textContent = `${count} ข้อ`;
        }
    }

    function loadSelectedExam(examData) {
        fetch(examData.jsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Path ${examData.jsonPath} failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(examJson => {
                const processedData = processExamData(examJson);
                initExam(processedData); 
            })
            .catch(error => {
                const sampleData = generateSampleExamData(examData);
                initExam(sampleData);
            });
    }

    function generateSampleExamData(examData) {
        const sampleData = [];

        let questionCounter = 0;

        for (let i = 0; i < examData.questions.short_conversation; i++) {
            questionCounter++;
            sampleData.push({
                id: `short_conversation_${i+1}`,
                type: "short_conversation",
                text: `Sample short conversation question ${questionCounter}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: Math.floor(Math.random() * 4)
            });
        }

        for (let i = 0; i < examData.questions.long_conversation; i++) {
            questionCounter++;
            sampleData.push({
                id: `long_conversation_${i+1}`,
                type: "long_conversation",
                text: `Sample long conversation question ${questionCounter}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: Math.floor(Math.random() * 4)
            });
        }

        for (let i = 0; i < examData.questions.advertisement; i++) {
            questionCounter++;
            sampleData.push({
                id: `advertisement_${i+1}`,
                type: "advertisement",
                text: `Sample advertisement question ${questionCounter}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: Math.floor(Math.random() * 4)
            });
        }

        for (let i = 0; i < examData.questions.product; i++) {
            questionCounter++;
            sampleData.push({
                id: `product_${i+1}`,
                type: "product",
                text: `Sample product question ${questionCounter}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: Math.floor(Math.random() * 4)
            });
        }

        for (let i = 0; i < examData.questions.news_report; i++) {
            questionCounter++;
            sampleData.push({
                id: `news_report_${i+1}`,
                type: "news_report",
                text: `Sample news report question ${questionCounter}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: Math.floor(Math.random() * 4)
            });
        }

        for (let i = 0; i < examData.questions.article; i++) {
            questionCounter++;
            sampleData.push({
                id: `article_${i+1}`,
                type: "article",
                text: `Sample article question ${questionCounter}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: Math.floor(Math.random() * 4)
            });
        }

        for (let i = 0; i < examData.questions.text_completion; i++) {
            questionCounter++;
            sampleData.push({
                id: `text_completion_${i+1}`,
                type: "text_completion",
                text: `Sample text completion question ${questionCounter}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: Math.floor(Math.random() * 4)
            });
        }

        for (let i = 0; i < examData.questions.paragraph; i++) {
            questionCounter++;
            sampleData.push({
                id: `paragraph_${i+1}`,
                type: "paragraph",
                text: `Sample paragraph question ${questionCounter}`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: Math.floor(Math.random() * 4)
            });
        }

        return sampleData;
    }
});