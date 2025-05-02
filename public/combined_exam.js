// Combined Exam Script
document.addEventListener('DOMContentLoaded', function() {
    const examInfoSection = document.getElementById('exam-info');
    const examContentSection = document.getElementById('exam-content');
    const resultsSection = document.getElementById('results');
    const startButton = document.getElementById('start-combined-exam');
    const backButton = document.getElementById('back-button');
    const backToHomeButton = document.getElementById('back-to-home');
    const timerDisplay = document.getElementById('timer-display');
    
    // Map of type names to their corresponding IDs in the results section
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
    
    // Expected counts for each type
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
    
    // Add timer variables
    let startTime = 0;
    let elapsedSeconds = 0;
    let timerInterval = null;
    window.examTimerValue = 0; // Store elapsed time globally for progress tracking
    
    // Start the combined exam
    startButton.addEventListener('click', function() {
        examInfoSection.classList.add('hidden');
        examContentSection.classList.remove('hidden');
        
        // Try different possible paths for the combined_exam.json file
        loadCombinedExam();
    });
    
    // Try to load the combined exam file from different possible locations
    function loadCombinedExam() {
        // List of possible paths to try
        const possiblePaths = [
            '../src/complete exam/combined_exam.json'
        ];
        
        // Try each path until one works
        tryNextPath(possiblePaths, 0);
    }
    
    function tryNextPath(paths, index) {
        if (index >= paths.length) {
            // If we've tried all paths, use the sample data as fallback
            console.warn("Could not load combined_exam.json from any path. Using sample data instead.");
            // Process sample data too, although it should already be flat
            const processedSampleData = processExamData(getSampleExamData());
            initExam(processedSampleData);
            return;
        }
        
        const path = paths[index];
        console.log(`Trying to load combined_exam.json from: ${path}`);
        
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Path ${path} failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(examData => {
                console.log(`Successfully loaded combined_exam.json from: ${path}`);
                // Process the exam data to flatten questions before initializing
                const processedData = processExamData(examData);
                initExam(processedData); // Use the processed, flattened data
            })
            .catch(error => {
                console.warn(`Error loading from ${path}: ${error.message}`);
                // Try the next path
                tryNextPath(paths, index + 1);
            });
    }
    
    // Process the loaded exam data to ensure it's in the right format
    function processExamData(examData) {
        if (!examData || !Array.isArray(examData)) {
            console.error("Invalid exam data structure: Expected an array of exams.", examData);
            return getSampleExamData();
        }
        
        // Log examples of each exam type to analyze their format
        logExamTypeExamples(examData);
        
        // Flatten the questions from multiple exams into a single array
        const allQuestions = [];
        examData.forEach((exam, examIndex) => {
            if (!exam || typeof exam !== 'object') {
                console.warn(`Item at index ${examIndex} is not a valid exam object. Skipping.`);
                return;
            }
            
            console.log(`Processing Exam ${examIndex + 1}: ${exam.title || exam.id}`);

            // Check if the exam object itself has a 'questions' array
            if (exam.questions && Array.isArray(exam.questions)) {
                console.log(` Found ${exam.questions.length} questions within Exam ${examIndex + 1}`);
                const parentSubtitle = exam.subtitle || ""; // Get the subtitle from the parent exam

                exam.questions.forEach((question, questionIndex) => {
                    if (!question || typeof question !== 'object') {
                         console.warn(`  Question ${questionIndex + 1} in Exam ${examIndex + 1} is invalid. Skipping.`);
                        return;
                    }

                    // Add a unique ID if missing
                    if (!question.id) {
                        question.id = `${exam.id || `exam_${examIndex}`}_q${questionIndex + 1}`;
                    }



                    // Add the exam type to the question
                    if (true) {
                        question.type = exam.type;
                    }
                     if (!question.type) {
                        question.type = determineQuestionType(question, allQuestions.length);
                     }

                    // *** ADD PARENT SUBTITLE TO THE QUESTION ***
                    // If the question doesn't already have its own subtitle, use the parent's
                    if (!question.subtitle && parentSubtitle) {
                        question.subtitle = parentSubtitle;
                        console.log(`  Added parent subtitle to Question ${questionIndex + 1} (ID: ${question.id})`);
                    } else if (question.subtitle) {
                         console.log(`  Question ${questionIndex + 1} already has its own subtitle.`);
                    }

                    // Log details about options
                    if (question.options) {
                         console.log(`  Question ${questionIndex + 1} has options field:`, question.options);
                    } else {
                        console.warn(`  Question ${questionIndex + 1} (ID: ${question.id}) is missing the 'options' field.`);
                    }

                    // Add the processed question to the flattened list
                    allQuestions.push(question);
                });
            } else {
                 console.warn(`Exam ${examIndex + 1} (ID: ${exam.id}) does not contain a valid 'questions' array.`);
            }
        });

        console.log(`Successfully processed ${allQuestions.length} questions in total.`);
        
        // Return the flattened list of questions
        return allQuestions;
    }
    
    // Log examples of each exam type to analyze their format
    function logExamTypeExamples(examData) {
        console.log("%c Examining Exam Types and their Format", "background: #3498db; color: white; font-size: 14px; padding: 5px;");
        
        // Track the types we've seen
        const examplesByType = {};
        
        // Process each exam
        examData.forEach((exam, examIndex) => {
            if (!exam || !exam.questions || !Array.isArray(exam.questions)) return;
            
            // Get the exam type
            const examType = exam.type || "unknown_type";
            
            // Only analyze first instance of each type
            if (examplesByType[examType]) return;
            
            console.group(`Example of ${examType} format (from exam ${exam.id || examIndex})`);
            console.log("Exam subtitle:", exam.subtitle ? exam.subtitle.substring(0, 200) + "..." : "None");
            
            // Log the structure of the first few questions
            if (exam.questions.length > 0) {
                const sampleQuestion = exam.questions[0];
                console.log("Sample question structure:", {
                    id: sampleQuestion.id,
                    type: sampleQuestion.type,
                    text: sampleQuestion.text,
                    prompt: sampleQuestion.prompt,
                    subtitle: sampleQuestion.subtitle ? "Present" : "None",
                    options: sampleQuestion.options,
                    // Log other important fields
                    hasImage: !!sampleQuestion.image,
                    otherFields: Object.keys(sampleQuestion).filter(k => 
                        !["id", "type", "text", "prompt", "subtitle", "options", "image", "correctAnswer"].includes(k))
                });
                
                // Also log the actual full subtitle if there is one
                if (sampleQuestion.subtitle) {
                    console.log("Question subtitle (example):", sampleQuestion.subtitle);
                }
            }
            
            console.groupEnd();
            
            // Store that we've seen this type
            examplesByType[examType] = true;
        });
        
        console.log("%c Format Analysis Complete", "background: #2ecc71; color: white; font-size: 14px; padding: 5px;");
    }
    
    // Try to determine the question type based on its content or overall index
    function determineQuestionType(question, overallIndex) {
        // Default question types based on position in the flattened array
        // This is a fallback if questions don't have explicit types
        const typesByPosition = [
            // First 3 questions are short_conversation
            ...(Array(3).fill('short_conversation')),
            // Next 1 question is long_conversation
            'long_conversation',
            // Next 2 questions are advertisement
            ...(Array(2).fill('advertisement')),
            // Next 2 questions are product
            ...(Array(2).fill('product')),
            // Next 2 questions are news_report
            ...(Array(2).fill('news_report')),
            // Next 2 questions are article
            ...(Array(2).fill('article')),
            // Next 3 questions are text_completion
            ...(Array(3).fill('text_completion')),
            // Next 5 questions are paragraph
            ...(Array(5).fill('paragraph'))
        ];
        
        // Use the overall index in the flattened list
        return overallIndex < typesByPosition.length ? typesByPosition[overallIndex] : 'unknown';
    }
    
    // Sample exam data to use as fallback if the JSON file can't be loaded
    function getSampleExamData() {
        // Create a sample combined exam with the correct distribution
        const sampleData = [];
        
        // Add sample questions for each type
        // Short conversation (3)
        for (let i = 0; i < 3; i++) {
            sampleData.push({
                id: `short_conversation_${i+1}`,
                type: "short_conversation",
                text: "Sample short conversation question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0
            });
        }
        
        // Long conversation (1)
        sampleData.push({
            id: "long_conversation_1",
            type: "long_conversation",
            text: "Sample long conversation question",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 1
        });
        
        // Advertisement (2)
        for (let i = 0; i < 2; i++) {
            sampleData.push({
                id: `advertisement_${i+1}`,
                type: "advertisement",
                text: "Sample advertisement question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 2
            });
        }
        
        // Product (2)
        for (let i = 0; i < 2; i++) {
            sampleData.push({
                id: `product_${i+1}`,
                type: "product",
                text: "Sample product question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 3
            });
        }
        
        // News report (2)
        for (let i = 0; i < 2; i++) {
            sampleData.push({
                id: `news_report_${i+1}`,
                type: "news_report",
                text: "Sample news report question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0
            });
        }
        
        // Article (2)
        for (let i = 0; i < 2; i++) {
            sampleData.push({
                id: `article_${i+1}`,
                type: "article",
                text: "Sample article question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 1
            });
        }
        
        // Text completion (3)
        for (let i = 0; i < 3; i++) {
            sampleData.push({
                id: `text_completion_${i+1}`,
                type: "text_completion",
                text: "Sample text completion question",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 2
            });
        }
        
        // Paragraph (5)
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
    
    // Go back to exam info
    backButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to exit the exam? Your progress will be lost.')) {
            examContentSection.classList.add('hidden');
            examInfoSection.classList.remove('hidden');
        }
    });
    
    // Back to home
    backToHomeButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Initialize exam functionality
    function initExam(examData) {
        console.log('Initializing exam with processed data:', examData);
        
        // Check if we have data to work with
        if (!examData || !Array.isArray(examData) || examData.length === 0) {
            console.error('Failed to initialize exam: No valid exam data available.');
            return;
        }
        
        // Skip exams without visible content (missing essential fields)
        const validExams = examData.filter(question => 
            question && (question.options || (question.subtitle && question.subtitle.trim())));
        
        if (validExams.length === 0) {
            console.error('Failed to initialize exam: No valid questions available.');
            return;
        }
        
        try {
            // Create a combined exam object
            const combinedExam = {
                id: "combined-exam",
                title: "Combined Exam",
                description: "A comprehensive practice test covering all question types",
                subtitle: "This exam tests all skills: reading, writing, and speaking.",
                duration: 60,
                totalQuestions: validExams.length,
                questions: validExams
            };
            
            // Store valid exams in the window object for global access
            window.currentExam = combinedExam;
            window.currentQuestionIndex = 0;
            window.userAnswers = new Array(validExams.length).fill(null);
            
            // Update the exam title
            const examTitleElement = document.getElementById('exam-title');
            if (examTitleElement) {
                examTitleElement.textContent = combinedExam.title;
            }
            
            // Update total questions count in the exam info section
            const totalQuestionsCount = document.getElementById('total-questions-count');
            if (totalQuestionsCount) {
                totalQuestionsCount.textContent = validExams.length.toString();
            }
            
            // Update total questions in progress bar
            const totalQuestionsProgress = document.getElementById('total-questions-progress');
            if (totalQuestionsProgress) {
                totalQuestionsProgress.textContent = validExams.length.toString();
            }
            
            // Create subtitle
            addExamSubtitle(combinedExam.subtitle);
            
            // Add navigation elements
            addNavigationElements();
            
            // Set up navigation handlers (prev/next buttons, etc.)
            setupNavigationHandlers();
            
            // Start timer
            if (typeof startTimer === 'function') {
                startTimer(combinedExam.duration * 60);
            } else {
                // Start our own timer implementation
                startExamTimer();
                console.warn('Using built-in timer implementation');
            }
            
            // Load first question
            loadQuestion(0);
            
            // Listen for exam submission
            document.addEventListener('examSubmitted', handleExamSubmission);
            
            // Add type indicators after questions are loaded
            setTimeout(addTypeIndicators, 500);
            
        } catch (error) {
            console.error("Error initializing exam:", error);
            alert("There was a problem starting the exam. Please refresh the page and try again.");
        }
    }
    
    // Start the exam timer
    function startExamTimer() {
        // Reset timer variables
        startTime = Date.now();
        elapsedSeconds = 0;
        window.examTimerValue = 0;
        
        // Update timer display initially
        if (timerDisplay) {
            timerDisplay.textContent = '00:00';
        }
        
        // Clear any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Start a new timer interval
        timerInterval = setInterval(() => {
            // Calculate elapsed time
            const currentTime = Date.now();
            elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
            window.examTimerValue = elapsedSeconds; // Update global timer value
            
            // Format time as MM:SS
            const minutes = Math.floor(elapsedSeconds / 60);
            const remainingSeconds = elapsedSeconds % 60;
            
            // Update timer display
            if (timerDisplay) {
                timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    // Stop the exam timer
    function stopExamTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Final update to global timer value
        window.examTimerValue = elapsedSeconds;
        
        // Update time taken in results section
        const timeTakenElement = document.getElementById('time-taken');
        if (timeTakenElement) {
            const minutes = Math.floor(elapsedSeconds / 60);
            const remainingSeconds = elapsedSeconds % 60;
            timeTakenElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Add subtitle to the exam
    function addExamSubtitle(subtitleText) {
        console.log("Attempting to add exam subtitle..."); // Log start
        const titleContainer = document.querySelector('.exam-title-container');
        if (!titleContainer) {
            console.error("Exam title container (.exam-title-container) not found in the DOM.");
            return;
        }
        console.log("Found title container:", titleContainer); // Log container found

        // Check if title container is visible (simple check)
        if (titleContainer.offsetParent === null) {
             console.warn("Title container might not be visible when adding subtitle.");
        }

        // Check if subtitle already exists and remove it
        const existingSubtitle = titleContainer.querySelector('.exam-subtitle');
        if (existingSubtitle) {
            console.log("Removing existing subtitle element:", existingSubtitle);
            existingSubtitle.remove();
        }

        // Create and add new subtitle
        const subtitleElement = document.createElement('p');
        subtitleElement.className = 'exam-subtitle';
        subtitleElement.textContent = subtitleText;
        titleContainer.appendChild(subtitleElement);

        console.log("Added new exam subtitle element:", subtitleElement); // Log the added element
        console.log("Subtitle text content set to:", subtitleText);
    }
    
    // Setup navigation handlers
    function setupNavigationHandlers() {
        const prevButton = document.getElementById('prev-question');
        const nextButton = document.getElementById('next-question');
        const submitButton = document.getElementById('submit-exam');
        const jumpMenuButton = document.getElementById('question-jump-button');
        
        // Add keyboard navigation
        document.addEventListener('keydown', function(e) {
            // Only process keyboard navigation when in exam mode
            const examContentVisible = !document.getElementById('exam-content').classList.contains('hidden');
            if (!examContentVisible) return;
            
            // Check if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
                // Previous question shortcut
                if (window.currentQuestionIndex > 0) {
                    e.preventDefault();
                    saveCurrentAnswer();
                    loadQuestion(window.currentQuestionIndex - 1);
                }
            } else if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
                // Next question shortcut
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
        
        // Question jump functionality
        if (jumpMenuButton) {
            jumpMenuButton.onclick = function() {
                toggleQuestionJumpMenu();
            };
        }
        
        // Create the question jump menu if it doesn't exist
        createQuestionJumpMenu();
    }
    
    // Create a question jump menu for quick navigation
    function createQuestionJumpMenu() {
        // Check if the menu already exists
        if (document.getElementById('question-jump-menu')) return;
        
        // Create the question jump menu container
        const jumpMenuContainer = document.createElement('div');
        jumpMenuContainer.id = 'question-jump-menu';
        jumpMenuContainer.className = 'question-jump-menu hidden';
        
        // Create the menu header
        const menuHeader = document.createElement('div');
        menuHeader.className = 'jump-menu-header';
        menuHeader.innerHTML = '<h4>Question Navigator</h4><button class="close-jump-menu">&times;</button>';
        jumpMenuContainer.appendChild(menuHeader);
        
        // Close button functionality
        menuHeader.querySelector('.close-jump-menu').addEventListener('click', function() {
            toggleQuestionJumpMenu();
        });
        
        // Add question type legend
        const typeLegend = document.createElement('div');
        typeLegend.className = 'type-legend';
        typeLegend.innerHTML = `
            <div class="legend-title">Question Types:</div>
            <div class="legend-items">
                <div class="legend-item"><span class="legend-color short-conversation"></span> Short Conversation</div>
                <div class="legend-item"><span class="legend-color long-conversation"></span> Long Conversation</div>
                <div class="legend-item"><span class="legend-color advertisement"></span> Advertisement</div>
                <div class="legend-item"><span class="legend-color product"></span> Product</div>
                <div class="legend-item"><span class="legend-color news-report"></span> News Report</div>
                <div class="legend-item"><span class="legend-color article"></span> Article</div>
                <div class="legend-item"><span class="legend-color text-completion"></span> Text Completion</div>
                <div class="legend-item"><span class="legend-color paragraph"></span> Paragraph</div>
            </div>
        `;
        jumpMenuContainer.appendChild(typeLegend);
        
        // Create the question buttons container
        const questionGrid = document.createElement('div');
        questionGrid.className = 'question-grid';
        jumpMenuContainer.appendChild(questionGrid);
        
        // Create buttons for each question
        if (window.currentExam && window.currentExam.questions) {
            for (let i = 0; i < window.currentExam.questions.length; i++) {
                const question = window.currentExam.questions[i];
                const questionButton = document.createElement('div');
                questionButton.className = 'question-jump-button';
                questionButton.dataset.index = i;
                
                // Create button content with status indicator
                questionButton.innerHTML = `
                    <div class="question-number">${i + 1}</div>
                    <div class="question-status"></div>
                `;
                
                // Add question type indicator if available
                if (question.type) {
                    questionButton.title = `Question ${i + 1} (${formatTypeName(question.type)})`;
                    questionButton.classList.add(`type-${question.type.replace('_', '-')}`);
                } else {
                    questionButton.title = `Question ${i + 1}`;
                }
                
                // Handle click to jump to question
                questionButton.addEventListener('click', function() {
                    saveCurrentAnswer();
                    loadQuestion(i);
                    toggleQuestionJumpMenu();
                });
                
                questionGrid.appendChild(questionButton);
            }
        }
        
        // Add status legend
        const statusLegend = document.createElement('div');
        statusLegend.className = 'status-legend';
        statusLegend.innerHTML = `
            <div class="legend-title">Status:</div>
            <div class="status-items">
                <div class="status-item"><span class="status-indicator current"></span> Current Question</div>
                <div class="status-item"><span class="status-indicator answered"></span> Answered</div>
                <div class="status-item"><span class="status-indicator not-answered"></span> Not Answered</div>
            </div>
        `;
        jumpMenuContainer.appendChild(statusLegend);
        
        // Append to exam content section
        const examContent = document.getElementById('exam-content');
        if (examContent) {
            examContent.appendChild(jumpMenuContainer);
        }
    }
    
    // Toggle the question jump menu visibility
    function toggleQuestionJumpMenu() {
        const jumpMenu = document.getElementById('question-jump-menu');
        if (jumpMenu) {
            jumpMenu.classList.toggle('hidden');
            
            // Update the status of each question when opening the menu
            if (!jumpMenu.classList.contains('hidden')) {
                updateJumpMenuStatuses();
            }
        }
    }
    
    // Update the status indicators in the jump menu
    function updateJumpMenuStatuses() {
        const jumpMenu = document.getElementById('question-jump-menu');
        if (!jumpMenu) return;
        
        const questionButtons = jumpMenu.querySelectorAll('.question-jump-button');
        questionButtons.forEach((button, index) => {
            // Reset classes
            button.classList.remove('answered', 'current', 'not-answered');
            
            // Mark current question
            if (index === window.currentQuestionIndex) {
                button.classList.add('current');
            }
            
            // Mark answered/unanswered questions
            if (window.userAnswers && window.userAnswers[index] !== null) {
                button.classList.add('answered');
            } else {
                button.classList.add('not-answered');
            }
        });
    }
    
    // Update progress indicators
    function updateProgressIndicators(index) {
        // Update current question indicator
        const currentQuestionElement = document.getElementById('current-question');
        if (currentQuestionElement) {
            currentQuestionElement.textContent = index + 1;
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill && window.currentExam) {
            const percentage = ((index + 1) / window.currentExam.totalQuestions) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        // Update answered questions count
        const answeredCount = window.userAnswers ? window.userAnswers.filter(answer => answer !== null).length : 0;
        const totalQuestions = window.currentExam ? window.currentExam.totalQuestions : 0;
        
        const answeredCountElement = document.getElementById('questions-answered-count');
        if (answeredCountElement) {
            answeredCountElement.textContent = answeredCount;
        }
        
        // Update question status indicator
        updateQuestionStatusIndicator(index);
        
        // Update jump menu if visible
        updateJumpMenuStatuses();
        
        // Setup navigation buttons
        setupNavigationButtons(index);
    }
    
    // Setup navigation buttons
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
            
            // Only show submit button on last question
            if (submitButton) {
                submitButton.style.display = isLastQuestion ? 'block' : 'none';
            }
        }
    }
    
    // Update the question status indicator
    function updateQuestionStatusIndicator(index) {
        const statusIndicator = document.getElementById('question-status-indicator');
        if (!statusIndicator) return;
        
        // Clear previous status
        statusIndicator.className = 'question-status-indicator';
        
        // Set current status
        if (window.userAnswers && window.userAnswers[index] !== null) {
            statusIndicator.classList.add('answered');
            statusIndicator.title = 'You have answered this question';
        } else {
            statusIndicator.classList.add('unanswered');
            statusIndicator.title = 'You have not answered this question yet';
        }
    }
    
    // Save the current answer
    function saveCurrentAnswer() {
        const selectedOption = document.querySelector(`input[name="question${window.currentQuestionIndex}"]:checked`);
        if (selectedOption) {
            window.userAnswers[window.currentQuestionIndex] = parseInt(selectedOption.value);
            
            // Update the status indicator immediately after answering
            updateQuestionStatusIndicator(window.currentQuestionIndex);
        }
    }
    
    // Load a specific question
    function loadQuestion(index) {
        try {
            console.log(`Loading question ${index}`);
            
            const questionsContainer = document.getElementById('exam-questions');
            if (!questionsContainer || !window.currentExam || !window.currentExam.questions) {
                throw new Error("Required elements not found");
            }
            
            // Update current question index
            window.currentQuestionIndex = index;
            
            // Clear previous questions
            questionsContainer.innerHTML = '';
            
            const question = window.currentExam.questions[index];
            if (!question) {
                throw new Error(`Question not found at index ${index}`);
            }
            
            console.log(`Loading question:`, question);
            
            // Create question elements step by step to ensure everything is added
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';
            questionsContainer.appendChild(questionContainer);
            
            // Add type indicator first
            if (question.type) {
                addTypeIndicator(questionContainer, question.type);
            }
            
            // Create question content
            const questionContent = document.createElement('div');
            questionContent.className = 'question-content';
            questionContainer.appendChild(questionContent);
            
            // Create question header - moved below content
            const questionHeader = document.createElement('div');
            questionHeader.className = 'question-header';
            
            // Remove question number text but keep the container for styling purposes
            questionHeader.innerHTML = `<div class="question-number"></div>`;
            
            questionContainer.appendChild(questionHeader);
            
            // Add subtitle with type-specific formatting first (moved before question text)
            if (question.subtitle) {
                addFormattedSubtitle(questionContent, question.subtitle, question.type);
            }
            
            // Add question progress-text below subtitle
            addQuestionProgressText(questionContent, index + 1, window.currentExam.totalQuestions);

            console.log(`window: ${window.currentExam.type}`);
            
            // Add question text (moved after subtitle)
            if (question.text) {
                const textPara = document.createElement('p');
                textPara.className = 'question-text';
                
                // Apply i**text** formatting to make text bold
                let formattedText = question.text.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                textPara.textContent = formattedText;
                
                // Use innerHTML instead of textContent to preserve HTML formatting
                textPara.innerHTML = formattedText;
                
                questionContent.appendChild(textPara);
            }
            
            // Add question prompt
            if (question.prompt) {
                const promptPara = document.createElement('p');
                promptPara.className = 'question-prompt';
                
                // Apply i**text** formatting to make text bold
                let formattedPrompt = question.prompt.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                // Use innerHTML to preserve HTML formatting
                promptPara.innerHTML = formattedPrompt;
                
                questionContent.appendChild(promptPara);
            }
            
            // Add image if exists
            if (question.image) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'question-image';
                imageDiv.innerHTML = `<img src="${question.image}" alt="Question Image">`;
                questionContent.appendChild(imageDiv);
            }
            
            // Create options container
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
            questionContainer.appendChild(optionsContainer);
            
            // Use default options if none are provided
            const options = ensureOptions(question);
            
            // Create each option
            options.forEach((option, optionIndex) => {
                // Skip empty options
                if (!option || (typeof option === 'string' && option.trim() === '')) {
                    console.warn(`Skipping empty option at index ${optionIndex}`);
                    return;
                }
                
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.dataset.index = optionIndex;
                optionsContainer.appendChild(optionDiv);
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.id = `q${index}_option${optionIndex}`;
                input.name = `question${index}`;
                input.value = optionIndex;
                optionDiv.appendChild(input);
                
                const label = document.createElement('label');
                label.htmlFor = `q${index}_option${optionIndex}`;
                
                // Handle different option formats
                if (typeof option === 'object' && option !== null) {
                    // Handle options that might be in format {text: "Option text", correct: true}
                    if (option.text) {
                        label.innerHTML = option.text;
                    } else {
                        label.innerHTML = JSON.stringify(option);
                    }
                } else {
                    label.innerHTML = option;
                }
                
                optionDiv.appendChild(label);
                
                // Check if this option was previously selected
                if (window.userAnswers[index] === optionIndex) {
                    input.checked = true;
                }
                
                // Add click handler for the entire option div for better UX
                optionDiv.addEventListener('click', function() {
                    const allInputs = optionsContainer.querySelectorAll('input[type="radio"]');
                    allInputs.forEach(input => input.checked = false);
                    
                    input.checked = true;
                    window.userAnswers[index] = optionIndex;
                    
                    console.log(`Selected option ${optionIndex} for question ${index}`);
                });
            });
            
            // If we didn't add any options, show a clear error
            if (optionsContainer.children.length === 0) {
                const errorMsg = document.createElement('p');
                errorMsg.className = 'error';
                errorMsg.textContent = 'No answer choices available for this question.';
                errorMsg.style.color = 'red';
                errorMsg.style.fontWeight = 'bold';
                optionsContainer.appendChild(errorMsg);
                
                console.error(`No valid options found for question ${index}:`, question);
            } else {
                console.log(`Successfully added ${optionsContainer.children.length} options for question ${index}`);
            }
            
            // Update progress indicators
            updateProgressIndicators(index);
            
        } catch (error) {
            console.error("Error loading question:", error);
            console.error(`Detailed error for question ${index}:`, error.message, error.stack);
            console.error("Question data that failed:", index < window.currentExam?.questions?.length ? 
                JSON.stringify(window.currentExam.questions[index], null, 2) : "Question data not available");
            
            // Create a more helpful error message with debugging information
            const errorContainer = document.getElementById('exam-questions');
            if (errorContainer) {
                errorContainer.innerHTML = `
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
    
    // Ensure we have valid options for the question
    function ensureOptions(question) {
        console.log("Ensuring options for question:", JSON.stringify(question, null, 2)); // Log the full question structure

        // DEBUGGING: Log the current state of options
        console.log("Question ID:", question.id || "Unknown ID");
        console.log("Question Type:", question.type || "Unknown Type");
        
        // First, check if the correctAnswer field exists and log it
        if (question.correctAnswer !== undefined) {
            console.log("Question has correctAnswer field:", question.correctAnswer);
        } else {
            console.warn("Question is missing correctAnswer field");
        }

        // If question has valid options array, return it
        if (question.options && Array.isArray(question.options) && question.options.length > 0) {
            console.log("Found valid 'options' array:", question.options);
            return question.options;
        } else if (question.options) {
            console.log("Field 'options' exists but is not a valid array or is empty:", question.options);
        }

        // Check if options is a string that needs to be parsed (sometimes options are stored as JSON)
        if (question.options && typeof question.options === 'string') {
            try {
                const parsedOptions = JSON.parse(question.options);
                if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
                    console.log("Successfully parsed 'options' string into array:", parsedOptions);
                    return parsedOptions;
                }
            } catch (e) {
                console.warn("Options field is a string but not valid JSON:", question.options);
            }
        }

        // Try to find options in different formats
        if (question.options && typeof question.options === 'object' && !Array.isArray(question.options)) {
            // It might be an object with keys like {0: "Option A", 1: "Option B"}
            const optionValues = Object.values(question.options);
            if (optionValues.length > 0) {
                console.log("Options is an object, converting to array:", optionValues);
                return optionValues;
            } else {
                console.log("Field 'options' is an object but resulted in empty array:", question.options);
            }
        }

        // Check for choices field which is sometimes used instead of options
        if (question.choices && Array.isArray(question.choices) && question.choices.length > 0) {
            console.log("Using valid 'choices' array:", question.choices);
            return question.choices;
        } else if (question.choices) {
            console.log("Field 'choices' exists but is not a valid array:", question.choices);
        }

        // Check for answers field (sometimes used for options)
        if (question.answers && Array.isArray(question.answers) && question.answers.length > 0) {
            // Ensure 'answers' isn't just the correct answer index/text
            if (question.answers.length > 1 || typeof question.answers[0] !== 'number') {
                console.log("Using valid 'answers' array as options:", question.answers);
                return question.answers;
            } else {
                console.log("Field 'answers' looks like a correct answer, not options:", question.answers);
            }
        } else if (question.answers) {
            console.log("Field 'answers' exists but is not a valid array:", question.answers);
        }

        // Check for a field named 'distractors' which sometimes holds incorrect options
        if (question.distractors && Array.isArray(question.distractors) && question.correctAnswerText) {
            console.log("Constructing options from 'correctAnswerText' and 'distractors'");
            // Combine correctAnswerText with distractors and shuffle
            const allOptions = [question.correctAnswerText, ...question.distractors];
            // Basic shuffle
            for (let i = allOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
            }
            console.log("Constructed options:", allOptions);
            return allOptions;
        }

        // If all else fails, provide default options
        console.warn(`No valid options field found for question ID ${question.id || 'N/A'}. Using default options.`);
        return ["Option A", "Option B", "Option C", "Option D"];
    }
    
    // Submit the exam
    function submitExam() {
        if (confirm('Are you sure you want to submit your exam?')) {
            // Save the answer from the current question
            saveCurrentAnswer();
            
            // Stop the timer
            stopExamTimer();
            
            // Calculate results
            const results = calculateResults();
            
            // Update result display
            updateResultsDisplay(results);
            
            // Hide exam content, show results
            examContentSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            
            // Save the results to the progress tracking system
            saveToProgressTracker(results);
            
            // Dispatch event that exam was submitted
            document.dispatchEvent(new CustomEvent('examSubmitted', { detail: results }));
        }
    }
    
    // Save exam results to the progress tracking system, broken down by type
    function saveToProgressTracker(results) {
        // Ensure the window.saveExamResult function exists (from progress.js)
        if (typeof window.saveExamResult !== 'function') {
            console.error('Progress tracking system not available: window.saveExamResult is not a function');
            showNotification('Progress tracking is not available', 'error');
            return;
        }

        // Calculate skill-specific scores and type breakdown
        const skillScores = calculateSkillScores(results);
        const typeBreakdown = skillScores.typeBreakdown;

        // Map question types to skills (reuse from calculateSkillScores)
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
        const dateStamp = new Date().toISOString(); // Use the same date for all parts

        // Iterate through each type found in the exam results
        for (const type in typeBreakdown) {
            if (typeBreakdown.hasOwnProperty(type)) {
                const counts = typeBreakdown[type];
                
                // Only save if there were questions of this type
                if (counts.total > 0) {
                    const typeScorePercentage = Math.round((counts.correct / counts.total) * 100);
                    const primarySkill = typeToSkill[type] || 'reading'; // Default to reading if type unknown

                    // Create the skills object, assigning the score to the primary skill
                    const skillsObject = { reading: 0, writing: 0, speaking: 0 };
                    skillsObject[primarySkill] = typeScorePercentage;

                    // Create the exam result data object for this specific type
                    const examResultData = {
                        examType: formatTypeName(type), // Use formatted name like "Short Conversation"
                        score: typeScorePercentage,
                        date: dateStamp,
                        totalQuestions: counts.total,
                        correctAnswers: counts.correct,
                        skills: skillsObject,
                        timeTaken: 0, // Time taken is for the whole exam, not applicable per type
                        // We don't need typeBreakdown here as this entry *is* the breakdown
                    };

                    // Save this type-specific result to progress tracking system
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

        // Show a summary notification
        if (typesSavedCount > 0 && allSaved) {
            showNotification('Exam results saved to progress tracker by type.', 'success');
        } else if (typesSavedCount > 0 && !allSaved) {
            showNotification('Some parts of the exam results saved to progress tracker.', 'warning');
        } else {
            showNotification('Failed to save any exam results to progress tracker.', 'error');
        }
    }
    
    // Show a notification to the user
    function showNotification(message, type = 'info') {
        // Check if notification container exists, create if not
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
            
            // Add styles for notifications if not already in CSS
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
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on type
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
        
        // Set notification content
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
        `;
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Automatically remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300); // Wait for transition to complete
        }, 4000);
    }
    
    // Calculate skill-specific scores based on question types
    function calculateSkillScores(results) {
        // Initialize counters for skill-specific scores
        const skillCounts = {
            reading: { correct: 0, total: 0 },
            writing: { correct: 0, total: 0 },
            speaking: { correct: 0, total: 0 }
        };
        
        // Initialize type breakdown
        const typeBreakdown = {};
        
        // Map question types to skills
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
        
        // Count correct answers by type
        if (results && results.answers) {
            results.answers.forEach((answer, index) => {
                const question = window.currentExam.questions[index];
                if (question && question.type) {
                    // Get the skill for this question type
                    const skill = typeToSkill[question.type] || 'reading';
                    
                    // Update skill counts
                    skillCounts[skill].total++;
                    if (answer.isCorrect) {
                        skillCounts[skill].correct++;
                    }
                    
                    // Update type breakdown
                    if (!typeBreakdown[question.type]) {
                        typeBreakdown[question.type] = { correct: 0, total: 0 };
                    }
                    typeBreakdown[question.type].total++;
                    if (answer.isCorrect) {
                        typeBreakdown[question.type].correct++;
                    }
                }
            });
        }
        
        // Calculate percentage scores for each skill
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
    
    // Calculate exam results
    function calculateResults() {
        const results = {
            totalQuestions: window.currentExam.totalQuestions,
            correctCount: 0,
            answers: []
        };
        
        // Process each question
        for (let i = 0; i < window.currentExam.questions.length; i++) {
            const question = window.currentExam.questions[i];
            const selectedOption = window.userAnswers[i];
            
            const answerData = {
                questionIndex: i,
                selectedOption: selectedOption,
                correctOption: question.correctAnswer,
                isCorrect: selectedOption === question.correctAnswer
            };
            
            if (answerData.isCorrect) {
                results.correctCount++;
            }
            
            results.answers.push(answerData);
        }
        
        return results;
    }
    
    // Update results display
    function updateResultsDisplay(results) {
        // Calculate skill-specific scores for UI update
        const skillScores = calculateSkillScores(results);
        
        // Update score percentage
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            const percentage = Math.round((results.correctCount / results.totalQuestions) * 100);
            scoreElement.textContent = `${percentage}%`;
            
            // Update score circle fill
            const scorePath = document.getElementById('score-path');
            if (scorePath) {
                const circumference = 2 * Math.PI * 15.9155;
                const offset = circumference * (1 - percentage / 100);
                scorePath.style.strokeDasharray = `${circumference} ${circumference}`;
                scorePath.style.strokeDashoffset = offset;
            }
        }
        
        // Update correct count
        const correctCountElement = document.getElementById('correct-count');
        if (correctCountElement) {
            correctCountElement.textContent = results.correctCount;
        }
        
        // Update total questions
        const totalQuestionsElement = document.getElementById('total-questions');
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = results.totalQuestions;
        }
        
        // Update performance text
        const performanceTextElement = document.getElementById('performance-text');
        if (performanceTextElement) {
            const percentage = (results.correctCount / results.totalQuestions) * 100;
            let performanceText = 'Needs Improvement';
            
            if (percentage >= 90) {
                performanceText = 'Excellent';
            } else if (percentage >= 75) {
                performanceText = 'Very Good';
            } else if (percentage >= 60) {
                performanceText = 'Good';
            } else if (percentage >= 40) {
                performanceText = 'Fair';
            }
            
            performanceTextElement.textContent = performanceText;
        }
        
        // Update skill-specific scores (reading, writing, speaking)
        updateSkillScore('reading', skillScores.reading);
        updateSkillScore('writing', skillScores.writing);
        updateSkillScore('speaking', skillScores.speaking);
        
        // Update correct/total counts for each skill
        updateSkillCount('reading', skillScores.skillCounts.reading);
        updateSkillCount('writing', skillScores.skillCounts.writing);
        updateSkillCount('speaking', skillScores.skillCounts.speaking);
        
        // Add progress tracker link to the result actions
        addProgressTrackerLink();
    }
    
    // Add a link to the progress tracker in the results section
    function addProgressTrackerLink() {
        const resultActionsContainer = document.querySelector('.result-actions');
        if (!resultActionsContainer) return;
        
        // Check if link already exists
        if (resultActionsContainer.querySelector('#view-progress')) return;
        
        // Create view progress button
        const viewProgressButton = document.createElement('a');
        viewProgressButton.id = 'view-progress';
        viewProgressButton.className = 'btn accent';
        viewProgressButton.href = 'progress.html';
        viewProgressButton.innerHTML = '<i class="icon-chart"></i> View Progress Dashboard';
        
        // Add button to actions container (after "Back to Home" but before "View Detailed Feedback")
        const backToHomeButton = resultActionsContainer.querySelector('#back-to-home');
        if (backToHomeButton && backToHomeButton.nextSibling) {
            resultActionsContainer.insertBefore(viewProgressButton, backToHomeButton.nextSibling);
        } else {
            resultActionsContainer.appendChild(viewProgressButton);
        }
        
        // Add simple icon style if not already in CSS
        if (!document.querySelector('style[data-id="progress-icon-style"]')) {
            const style = document.createElement('style');
            style.setAttribute('data-id', 'progress-icon-style');
            style.textContent = `
                .icon-chart::before {
                    content: "📊";
                    margin-right: 5px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Update skill score display
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
    
    // Update skill count display
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
    
    // Add type indicators to questions
    function addTypeIndicators() {
        const questionContainers = document.querySelectorAll('.question-container');
        
        questionContainers.forEach((container, index) => {
            const questionData = window.currentExam.questions[index];
            if (questionData && questionData.type) {
                addTypeIndicator(container, questionData.type);
            }
        });
    }
    
    // Add a type indicator to a question container
    function addTypeIndicator(container, type) {
        if (!container || !type) return;
        
        // Check if indicator already exists
        if (container.querySelector('.question-type-indicator')) return;
        
        // Create and add type indicator
        const indicator = document.createElement('div');
        indicator.className = `question-type-indicator ${type.replace('_', '-')}`;
        indicator.textContent = formatTypeName(type);
        
        // Insert at the beginning of the container
        container.insertBefore(indicator, container.firstChild);
    }
    
    // Handle exam submission and show breakdown by type
    function handleExamSubmission(event) {
        const result = event.detail;
        setTimeout(() => {
            updateTypeScores(result);
        }, 500); // Delay to ensure results are rendered
    }
    
    // Update type-specific scores in the results
    function updateTypeScores(result) {
        // Initialize counters for each type
        const typeCorrect = {};
        Object.keys(typeCounts).forEach(type => {
            typeCorrect[type] = 0;
        });
        
        // Count correct answers by type
        if (result && result.answers) {
            result.answers.forEach((answer, index) => {
                const question = window.currentExam.questions[index];
                if (question && question.type) {
                    if (answer.isCorrect) {
                        typeCorrect[question.type] = (typeCorrect[question.type] || 0) + 1;
                    }
                }
            });
        }
        
        // Update the UI for each type
        Object.keys(typeScoreMap).forEach(type => {
            const scoreElement = document.getElementById(typeScoreMap[type]);
            if (scoreElement) {
                const count = typeCorrect[type] || 0;
                const total = typeCounts[type] || 0;
                scoreElement.textContent = `${count}/${total}`;
                
                // Highlight scores
                if (count === total) {
                    scoreElement.classList.add('perfect-score');
                } else if (count >= Math.floor(total * 0.7)) {
                    scoreElement.classList.add('good-score');
                } else if (count < Math.floor(total * 0.4)) {
                    scoreElement.classList.add('poor-score');
                }
            }
        });
    }
    
    // Helper function to format type names for display
    function formatTypeName(type) {
        return type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    // Add question progress text below subtitle
    function addQuestionProgressText(container, currentQuestionNum, totalQuestions) {
        const progressText = document.createElement('div');
        progressText.className = 'question-progress-text';
        progressText.textContent = `Question ${currentQuestionNum}`;
        container.appendChild(progressText);
    }

    // Format subtitle based on question type
    function addFormattedSubtitle(container, subtitle, type) {
        if (!subtitle || !container) return;
        
        console.log(`Formatting subtitle for type: ${type}`);
        
        // Create wrapper div with appropriate classes
        const subtitleWrapper = document.createElement('div');
        subtitleWrapper.className = `question-subtitle ${type}-subtitle`;
        
        // Format content based on question type - matching scripts.js logic
        if (type === 'short_conversation' || type === 'long_conversation' || type === 'speaking' || type === 'paragraph') {
            // Format conversations similar to formatConversationQuestion in scripts.js
            formatConversation(subtitleWrapper, subtitle);
        } else if (type === 'advertisement' || type === 'product') {
            // Format advertisements with sections and emphasis similar to Advertisement.html handling
            formatAdvertisementProduct(subtitleWrapper, subtitle, type);
        } else if (type === 'news_report' || type === 'article') {
            // Format articles with proper paragraph styling and markdown support
            formatArticleNewsReport(subtitleWrapper, subtitle);
        } else if (type === 'text_completion') {
            // Format text completion with blanks highlighted
            formatTextCompletion(subtitleWrapper, subtitle);
        } else {
            // Default formatting for unknown types
            if (subtitle.includes('<br>') || 
                subtitle.includes('\n') || 
                subtitle.includes('----ARTICLE----')) {
                subtitleWrapper.innerHTML = subtitle.replace(/\n/g, '<br>');
            } else {
                subtitleWrapper.textContent = subtitle;
            }
        }
        
        // Add the formatted subtitle to the container
        container.appendChild(subtitleWrapper);
    }

    // Format conversations similar to the formatConversationQuestion function in scripts.js
    function formatConversation(container, subtitle) {
        // First replace newlines with <br> tags
        let formattedText = subtitle.replace(/\n/g, '<br>');
        
        // Split the text into lines
        const lines = formattedText.split('<br>');
        
        // Create a conversation container (similar to scripts.js)
        const conversationContainer = document.createElement('div');
        conversationContainer.className = 'conversation-container';
        
        // Process each line
        lines.forEach(line => {
            if (!line.trim()) {
                // Empty line - add spacing
                conversationContainer.appendChild(document.createElement('br'));
                return;
            }
            
            // Check if this line matches the "Name: Value" pattern
            const match = line.match(/([^<>:]+):\s*(.*)/);
            
            if (match) {
                const speakerName = match[1].trim();
                const speakerText = match[2].trim();
                
                // Create conversation line (matching scripts.js structure)
                const lineDiv = document.createElement('div');
                lineDiv.className = 'conversation-line';
                
                // Create and add speaker name
                const nameDiv = document.createElement('div');
                nameDiv.className = 'speaker-name';
                nameDiv.textContent = speakerName + ':';
                lineDiv.appendChild(nameDiv);
                
                // Create and add speaker text
                const textDiv = document.createElement('div');
                textDiv.className = 'speaker-text';
                textDiv.textContent = speakerText;
                lineDiv.appendChild(textDiv);
                
                conversationContainer.appendChild(lineDiv);
            } else {
                // Handle lines without the pattern as regular text
                const p = document.createElement('p');
                p.textContent = line;
                conversationContainer.appendChild(p);
            }
        });
        
        // Add the conversation container to the main container
        container.appendChild(conversationContainer);
    }

    // Format advertisements and products (matching scripts.js logic for Advertisement.html)
    function formatAdvertisementProduct(container, subtitle, type) {
        // Replace newlines with <br> tags first
        let formattedText = subtitle.replace(/\n/g, '<br>');
        
        // Apply i**text** formatting to make text bold
        formattedText = formattedText.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Make text within {curly braces} bold
        formattedText = formattedText.replace(/\{([^}]+)\}/g, '<strong>$1</strong>');
        
        // Apply standard bold formatting for **text** syntax
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Split into lines
        const lines = formattedText.split('<br>');
        
        // Process each line similar to scripts.js for advertisements
        lines.forEach(line => {
            if (!line.trim()) {
                container.appendChild(document.createElement('br'));
                return;
            }
            
            // Check if line contains a colon (similar to Advertisement.html handling in scripts.js)
            if (line.includes(':')) {
                const [prefix, ...rest] = line.split(':');
                const remainingText = rest.join(':'); // In case there are multiple colons
                
                // Create paragraph with adv-paragraph class (matching scripts.js)
                const p = document.createElement('p');
                p.className = 'adv-paragraph';
                
                // Add prefix text - the remainingText already has HTML formatting applied
                p.innerHTML = `${prefix}: <strong class="adv-content" style="color: black !important; font-weight: bold !important;">${remainingText}</strong>`;
                
                container.appendChild(p);
            } else {
                // Handle lines without colons as regular paragraphs
                const p = document.createElement('p');
                p.className = 'adv-paragraph';
                
                // Check if this is an all-caps line (likely a heading)
                if (line === line.toUpperCase() && line.length > 3) {
                    p.style.fontWeight = 'bold';
                }
                
                p.innerHTML = line;
                container.appendChild(p);
            }
        });
        
        // Check for and highlight product features, prices, etc.
        const allTextNodes = getTextNodes(container);
        allTextNodes.forEach(textNode => {
            const text = textNode.nodeValue;
            // Highlight prices like $XX.XX
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

    // Format articles and news reports with support for markdown and paragraphs
    function formatArticleNewsReport(container, subtitle) {
        // Apply i**text** formatting to make text bold
        let processedText = subtitle.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Make text within {curly braces} bold
        processedText = processedText.replace(/\{([^}]+)\}/g, '<strong>$1</strong>');
        
        // Now handle standard markdown
        processedText = processedText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
            .replace(/----ARTICLE----/g, '<h3 class="article-title">ARTICLE</h3>');
        
        // Split into paragraphs (similar to how scripts.js handles articles)
        const paragraphs = processedText.split(/\n\n+/);
        
        paragraphs.forEach(para => {
            if (!para.trim()) return;
            
            // Create paragraph element
            const p = document.createElement('div');
            p.className = 'article-paragraph';
            p.innerHTML = para.replace(/\n/g, '<br>');
            container.appendChild(p);
        });
        
        // Handle blanks in articles (like ____(1)____)
        highlightBlanks(container);
    }

    // Format text completion types
    function formatTextCompletion(container, subtitle) {
        // Create a div for the content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'text-completion-content';
        
        // Process the text to highlight blanks
        let processedText = subtitle.replace(/\n/g, '<br>');
        
        // Apply i**text** formatting to make text bold
        processedText = processedText.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Make text within {curly braces} bold
        processedText = processedText.replace(/\{([^}]+)\}/g, '<strong>$1</strong>');
        
        // Highlight blanks like ____(1)____ 
        processedText = processedText.replace(/____\((\d+)\)____/g, 
            '<span style="background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-weight: bold;">__($1)__</span>');
        
        // Highlight regular blanks like ____
        processedText = processedText.replace(/____/g, 
            '<span style="background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-weight: bold;">____</span>');
        
        contentDiv.innerHTML = processedText;
        container.appendChild(contentDiv);
    }

    // Format paragraph type questions
    function formatParagraph(container, subtitle) {
        // Create a wrapper for the paragraph content with appropriate styling
        const paragraphWrapper = document.createElement('div');
        paragraphWrapper.className = 'paragraph-content';
        paragraphWrapper.style.fontFamily = 'Georgia, serif';
        paragraphWrapper.style.lineHeight = '1.6';
        paragraphWrapper.style.color = '#333';
        
        // First replace newlines with <br> tags
        let formattedText = subtitle.replace(/\n/g, '<br>');
        
        // Apply formatting similar to scripts.js formatWithLineBreaks function
        
        // Apply i**text** formatting to make text bold
        formattedText = formattedText.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Make text within {curly braces} bold
        formattedText = formattedText.replace(/\{([^}]+)\}/g, '<strong>$1</strong>');
        
        // Apply bold formatting for **text** syntax
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Apply italic formatting for *text* syntax
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Apply underline formatting for __text__ syntax
        formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
        
        // Check if text contains "Name: Value" patterns (conversation format)
        const hasNameValuePairs = /([^<>:]+):\s*([^<>]+)(?:<br>|$)/.test(formattedText);
        
        if (hasNameValuePairs) {
            // Process conversation format
            const lines = formattedText.split('<br>');
            let conversationHTML = '<div class="conversation-container">';
            
            lines.forEach(line => {
                if (line.trim()) {
                    // Check if this line matches the "Name: Value" pattern
                    const match = line.match(/([^<>:]+):\s*(.*)/);
                    
                    if (match) {
                        const speakerName = match[1].trim();
                        const speakerText = match[2].trim();
                        
                        // Add a conversation line with properly indented name
                        conversationHTML += `
                            <div class="conversation-line">
                                <div class="speaker-name">${speakerName}:</div>
                                <div class="speaker-text">${speakerText}</div>
                            </div>
                        `;
                    } else {
                        // Handle lines without the pattern as regular text
                        conversationHTML += `<p>${line}</p>`;
                    }
                }
            });
            
            conversationHTML += '</div>';
            paragraphWrapper.innerHTML = conversationHTML;
        } else {
            // For regular text without name-value pairs, wrap in paragraph tags
            const paragraphs = formattedText.split('<br>');
            let html = '';
            
            paragraphs.forEach((para, index) => {
                if (!para.trim()) return;
                
                const p = document.createElement('p');
                p.className = 'paragraph-text';
                
                // Add indentation for paragraphs after the first one
                if (index > 0) {
                    p.style.textIndent = '1.5em';
                }
                
                // Special formatting for headings (all caps lines)
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
        
        // Add the wrapper to the container
        container.appendChild(paragraphWrapper);
        
        // Highlight blanks in paragraphs
        highlightBlanks(container);
    }

    // Helper function to highlight blanks in text
    function highlightBlanks(container) {
        const allTextNodes = getTextNodes(container);
        
        allTextNodes.forEach(textNode => {
            const text = textNode.nodeValue;
            if (text && text.includes('____')) {
                const parent = textNode.parentNode;
                
                // Format blanks like ____(1)____ and ____
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

    // Helper function to get all text nodes in a container
    function getTextNodes(node) {
        const textNodes = [];
        
        function findTextNodes(node) {
            if (node.nodeType === 3) { // Text node
                textNodes.push(node);
            } else if (node.nodeType === 1) { // Element node
                for (let i = 0; i < node.childNodes.length; i++) {
                    findTextNodes(node.childNodes[i]);
                }
            }
        }
        
        findTextNodes(node);
        return textNodes;
    }

    // Add navigation elements to the exam interface
    function addNavigationElements() {
        // Add jump to question button in the exam header
        const examHeader = document.querySelector('.exam-header');
        if (examHeader) {
            const jumpButton = document.createElement('button');
            jumpButton.id = 'question-jump-button';
            jumpButton.className = 'btn-icon jump-button';
            jumpButton.setAttribute('aria-label', 'Jump to question');
            jumpButton.title = 'Open question navigator';
            jumpButton.innerHTML = '<i class="icon-menu"></i>';
            
            // Insert before the timer
            const timerElement = examHeader.querySelector('.exam-timer');
            if (timerElement) {
                examHeader.insertBefore(jumpButton, timerElement);
            } else {
                examHeader.appendChild(jumpButton);
            }
        }
        
        // Add question status indicator to the progress container
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            // Create answered count element
            const answeredCountElement = document.createElement('div');
            answeredCountElement.className = 'answered-count';
            answeredCountElement.innerHTML = 'Answered: <span id="questions-answered-count">0</span>/<span id="questions-total-count">' + 
                (window.currentExam ? window.currentExam.totalQuestions : 0) + '</span>';
            progressContainer.appendChild(answeredCountElement);
            
            // Create question status indicator
            const statusIndicator = document.createElement('div');
            statusIndicator.id = 'question-status-indicator';
            statusIndicator.className = 'question-status-indicator unanswered';
            statusIndicator.title = 'Current question status';
            progressContainer.appendChild(statusIndicator);
        }
        
        // Add keyboard shortcuts hint
        const examContent = document.getElementById('exam-content');
        if (examContent) {
            const shortcutsHint = document.createElement('div');
            shortcutsHint.className = 'keyboard-shortcuts-hint';
            shortcutsHint.innerHTML = 'Keyboard shortcuts: ← Previous | → Next';
            
            // Add after exam questions but before navigation
            const examQuestions = document.getElementById('exam-questions');
            const examNavigation = document.querySelector('.exam-navigation');
            if (examQuestions && examNavigation) {
                examContent.insertBefore(shortcutsHint, examNavigation);
            }
        }
    }

    // Add CSS for the enhanced navigation elements and jump menu
    function addNavigationStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* Question Jump Menu */
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
            
            /* Type Legend */
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
            
            /* Status Legend */
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
            
            /* Question Grid */
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
            
            /* Type indicators on jump buttons */
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
            
            /* Status indicator */
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
            
            /* Progress container enhancements */
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
            
            /* Jump button */
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
            
            /* Keyboard shortcuts hint */
            .keyboard-shortcuts-hint {
                text-align: center;
                margin: 15px 0 5px;
                padding: 8px;
                background: #f9f9f9;
                border-radius: 4px;
                font-size: 14px;
                color: #666;
            }
            
            /* Hide elements by default */
            .hidden {
                display: none !important;
            }
            
            /* Media queries for mobile */
            @media (max-width: 768px) {
                .question-grid {
                    grid-template-columns: repeat(4, 1fr);
                }
                
                .keyboard-shortcuts-hint {
                    display: none; /* Hide shortcuts on mobile */
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

    // Call this at the start to inject the styles
    document.addEventListener('DOMContentLoaded', function() {
        addNavigationStyles();
    });
}); 