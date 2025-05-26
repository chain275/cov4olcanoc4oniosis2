// Combined Exam Script
document.addEventListener('DOMContentLoaded', function() {
    const examInfoSection = document.getElementById('exam-info');
    const examContentSection = document.getElementById('exam-content');
    const resultsSection = document.getElementById('results');
    const startButton = document.getElementById('start-combined-exam');
    const backButton = document.getElementById('back-button');
    const backToHomeButton = document.getElementById('back-to-home');
    const timerDisplay = document.getElementById('timer-display');
    // Add view-feedback button reference
    let viewFeedbackBtn = document.getElementById('view-feedback');
    
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
    
    // Multiple Exam Selection Functionality
    initializeExamSelection();
    
    // Start the combined exam
    startButton.addEventListener('click', function() {
        document.getElementById("exam-info").scrollIntoView({ behavior: 'smooth' });
        examInfoSection.classList.add('hidden');
        examContentSection.classList.remove('hidden');
        
        // Reset timer tracking variables when starting a new exam
        startTime = Date.now();
        elapsedSeconds = 0;
        window.examTimerValue = 0;
        window.finalElapsedTime = 0; // Initialize final time storage
        
        // CRITICAL: Store exact timestamp when exam starts for reliable timing
        window.examStartTimestamp = Date.now();
        console.log('Stored exam start timestamp:', window.examStartTimestamp);
        
        // Reset timer display
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = '00:00';
        }
        
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
                subtitle: "",
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
            
            // Initialize question navigator
            initializeQuestionNavigator(validExams.length);
            
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
        console.log('Starting exam timer');
        
        // Reset timer variables
        startTime = Date.now();
        elapsedSeconds = 0;
        window.examTimerValue = 0;
        
        // CRITICAL: Store exact timestamp when exam timer starts
        window.examStartTimestamp = Date.now();
        console.log('Timer started with timestamp:', window.examStartTimestamp);
        
        // Update timer display initially
        if (timerDisplay) {
            timerDisplay.textContent = '00:00';
        } else {
            console.error('Timer display element not found!');
        }
        
        // Clear any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Start a new timer interval
        timerInterval = setInterval(() => {
            try {
                // Calculate elapsed time - use the stored timestamp for reliability
                const currentTime = Date.now();
                if (window.examStartTimestamp) {
                    // Always calculate based on the original timestamp to avoid drift
                    elapsedSeconds = Math.floor((currentTime - window.examStartTimestamp) / 1000);
                } else {
                    // Fallback to interval-based calculation
                    elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
                }
                window.examTimerValue = elapsedSeconds; // Update global timer value
                
                // Format time as MM:SS
                const minutes = Math.floor(elapsedSeconds / 60);
                const remainingSeconds = elapsedSeconds % 60;
                const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
                
                // Update timer display
                if (timerDisplay) {
                    timerDisplay.textContent = formattedTime;
                    console.log(`Timer updated: ${formattedTime} (${elapsedSeconds}s)`);
                } else {
                    console.error('Timer display element lost during interval!');
                }
            } catch (e) {
                console.error('Error in timer interval:', e);
            }
        }, 1000);
        
        console.log('Timer started successfully');
    }
    
    // Stop the exam timer
    function stopExamTimer() {
        console.log('Stopping exam timer');
        
        // Double-check with direct timestamp calculation for reliability
        if (window.examStartTimestamp) {
            const nowTimestamp = Date.now();
            const calculatedElapsedSeconds = Math.floor((nowTimestamp - window.examStartTimestamp) / 1000);
            console.log('Final verification of elapsed time:',
                'Interval-based:', elapsedSeconds,
                'Timestamp-based:', calculatedElapsedSeconds,
                'seconds');
            
            // Use the maximum value to ensure we don't undercount
            if (calculatedElapsedSeconds > elapsedSeconds) {
                console.log('Using timestamp-based elapsed time as it is more accurate');
                elapsedSeconds = calculatedElapsedSeconds;
            }
        }
        
        // Store the final elapsed time before clearing the interval
        const finalElapsedSeconds = elapsedSeconds;
        window.finalElapsedTime = finalElapsedSeconds;
        
        // Clear the interval
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            console.log('Timer interval cleared');
        }
        
        console.log('Stopped timer with elapsed seconds:', finalElapsedSeconds);
        
        // Final update to global timer value
        window.examTimerValue = finalElapsedSeconds;
        
        // Update time taken in results section
        const timeTakenElement = document.getElementById('time-taken');
        if (timeTakenElement) {
            const minutes = Math.floor(finalElapsedSeconds / 60);
            const remainingSeconds = finalElapsedSeconds % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            
            // Set style properties directly to ensure visibility
            timeTakenElement.style.display = 'inline-block';
            timeTakenElement.style.fontWeight = 'bold';
            timeTakenElement.style.color = '#2563eb';
            timeTakenElement.style.fontFamily = 'monospace';
            timeTakenElement.style.fontSize = '1.1rem';
            
            // Update content
            timeTakenElement.textContent = timeString;
            console.log('Updated time-taken element directly in stopExamTimer:', timeString);
            
            // Double-check the element was updated
            setTimeout(() => {
                console.log('Time-taken element after update:', timeTakenElement.textContent);
            }, 100);
        } else {
            console.error('Could not find time-taken element in stopExamTimer');
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
        console.log('Setting up navigation handlers');
        
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
        
        // Instead of using the dedicated question jump button (which we removed),
        // we're now using the question navigator directly
        // No need for jumpMenuButton handler or createQuestionJumpMenu
        
        console.log('Navigation handlers set up successfully');
    }
    
    // Initialize question navigator
    function initializeQuestionNavigator(questionCount) {
        const navigator = document.getElementById('question-navigator');
        if (!navigator) return;
        
        // Clear any existing buttons
        navigator.innerHTML = '';
        
        // Define the question categories
        const categories = [
            { name: 'SPEAKING', start: 1, end: 20, class: 'speaking' },
            { name: 'READING', start: 21, end: 60, class: 'reading' },
            { name: 'WRITING', start: 61, end: 80, class: 'writing' }
        ];
        
        // Loop through each category
        categories.forEach(category => {
            // Add category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = `category-header ${category.class}`;
            categoryHeader.textContent = category.name;
            navigator.appendChild(categoryHeader);
            
            // Create buttons for this category
            for (let i = category.start - 1; i < Math.min(category.end, questionCount); i++) {
                const button = document.createElement('div');
                button.className = `question-nav-item ${category.class}`;
                button.textContent = (i + 1).toString();
                button.dataset.index = i;
                
                // Add click handler
                button.addEventListener('click', function() {
                    saveCurrentAnswer();
                    loadQuestion(parseInt(this.dataset.index));
                });
                
                navigator.appendChild(button);
            }
        });
        
        // Set total question count
        const totalQuestionCount = document.getElementById('total-question-count');
        if (totalQuestionCount) {
            totalQuestionCount.textContent = `${questionCount.toString()} ข้อ`;
        }
        
        // Initialize the visual progress fill indicator
        const visualProgressFill = document.getElementById('visual-progress-fill');
        if (visualProgressFill) {
            visualProgressFill.style.width = '0%';
        }
        
        // Add some CSS to style the category headers
        addCategoryStyles();
    }

    // Add CSS styles for question categories
    function addCategoryStyles() {
        // Check if styles already exist
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
            
            /* Make the navigator a bit more flexible for the categories */
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

    // Update question navigator to maintain category styling
    function updateQuestionNavigator(currentIndex) {
        const navigator = document.getElementById('question-navigator');
        if (!navigator) return;
        
        // Determine which category this question belongs to
        let category = '';
        if (currentIndex < 20) {
            category = 'speaking';
        } else if (currentIndex < 60) {
            category = 'reading';
        } else {
            category = 'writing';
        }
        
        // Update button states
        const buttons = navigator.querySelectorAll('.question-nav-item');
        buttons.forEach((button, index) => {
            // Get the real question index from the dataset
            const buttonIndex = parseInt(button.dataset.index);
            
            // Clear previous state classes
            button.classList.remove('current', 'answered', 'unanswered');
            
            // Add appropriate class
            if (buttonIndex === currentIndex) {
                button.classList.add('current');
            } else if (window.userAnswers && window.userAnswers[buttonIndex] !== null) {
                button.classList.add('answered');
            } else {
                button.classList.add('unanswered');
            }
        });
        
        // Update answered count
        const answeredCount = window.userAnswers ? window.userAnswers.filter(answer => answer !== null).length : 0;
        const answeredCountElement = document.getElementById('answered-count');
        if (answeredCountElement) {
            answeredCountElement.textContent = `${answeredCount.toString()} เลือกคำตอบแล้ว`;
        }
        
        // Update visual progress fill
        const totalQuestions = window.currentExam ? window.currentExam.totalQuestions : 0;
        const visualProgressFill = document.getElementById('visual-progress-fill');
        if (visualProgressFill && totalQuestions > 0) {
            const progressPercentage = (answeredCount / totalQuestions) * 100;
            visualProgressFill.style.width = `${progressPercentage}%`;
        }
    }
    
    // Update progress indicators
    function updateProgressIndicators(index) {
        try {
            console.log(`Updating progress indicators for question ${index + 1}`);
            
        // Update current question indicator
        const currentQuestionElement = document.getElementById('current-question');
        if (currentQuestionElement) {
            currentQuestionElement.textContent = index + 1;
                console.log(`Updated current question to ${index + 1}`);
        }
        
            // Update progress bar fill
        const progressFill = document.getElementById('progress-fill');
        if (progressFill && window.currentExam) {
            const percentage = ((index + 1) / window.currentExam.totalQuestions) * 100;
            progressFill.style.width = `${percentage}%`;
                console.log(`Updated progress fill to ${percentage}%`);
        }
        
        // Update answered questions count
        const answeredCount = window.userAnswers ? window.userAnswers.filter(answer => answer !== null).length : 0;
        const totalQuestions = window.currentExam ? window.currentExam.totalQuestions : 0;
        
            const answeredCountElement = document.getElementById('answered-count');
        if (answeredCountElement) {
            answeredCountElement.textContent = answeredCount;
                console.log(`Updated answered count to ${answeredCount}`);
            }

            // Update the visual progress fill (new element in the updated layout)
            const visualProgressFill = document.getElementById('visual-progress-fill');
            if (visualProgressFill && totalQuestions > 0) {
                const progressPercentage = (answeredCount / totalQuestions) * 100;
                visualProgressFill.style.width = `${progressPercentage}%`;
                console.log(`Updated visual progress fill to ${progressPercentage}%`);
            }
            
            // Update question navigator
            updateQuestionNavigator(index);
        
        // Setup navigation buttons
        setupNavigationButtons(index);
        } catch (error) {
            console.error('Error updating progress indicators:', error);
        }
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
                submitButton.style.display = 'block';
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
            
            // Update the question navigator
            updateQuestionNavigator(window.currentQuestionIndex);
        }
    }
    
    // Load a specific question
    function loadQuestion(index) {
        try {
            console.log(`Loading question ${index}`);
            
            const questionsContainer = document.getElementById('exam-questions');
            const examHeader = document.querySelector('.exam-header');
            
            if (!questionsContainer || !examHeader || !window.currentExam || !window.currentExam.questions) {
                throw new Error("Required elements not found");
            }
            
            // Update current question index
            window.currentQuestionIndex = index;
            
            // Clear previous questions
            questionsContainer.innerHTML = '';
            
            // Clear previous content from header
            // Preserve the exam title container
            const examTitleContainer = examHeader.querySelector('.exam-title-container');
            examHeader.innerHTML = '';
            examHeader.appendChild(examTitleContainer);
            
            const question = window.currentExam.questions[index];
            if (!question) {
                throw new Error(`Question not found at index ${index}`);
            }
            
            console.log(`Loading question:`, question);
            
            // Create question elements step by step to ensure everything is added
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';
            questionsContainer.appendChild(questionContainer);
            
            // Add question progress-text at the top of the question container
            addQuestionProgressText(questionContainer, index + 1, window.currentExam.totalQuestions);
            
            // Add question text below the progress text
            if (question.text) {
                const textPara = document.createElement('p');
                textPara.className = 'question-text';
                
                // Apply i**text** formatting to make text bold
                let formattedText = question.text.replace(/i\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                // Use innerHTML instead of textContent to preserve HTML formatting
                textPara.innerHTML = formattedText;
                
                questionContainer.appendChild(textPara);
            }
            
            // Add type indicator to the question container
            if (question.type) {
                addTypeIndicator(questionContainer, question.type);
            }
            
            // Create content wrapper to separate question content from options
            // Now append to examHeader instead of questionContainer
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'content-wrapper';
            examHeader.appendChild(contentWrapper);
            
            // Create question content
            const questionContent = document.createElement('div');
            questionContent.className = 'question-content';
            contentWrapper.appendChild(questionContent);
            
            // Create question header - moved below content
            const questionHeader = document.createElement('div');
            questionHeader.className = 'question-header';
            
            // Remove question number text but keep the container for styling purposes
            questionHeader.innerHTML = `<div class="question-number"></div>`;
            
            contentWrapper.appendChild(questionHeader);
            
            // Add subtitle with type-specific formatting first (moved before question text)
            if (question.subtitle) {
                addFormattedSubtitle(questionContent, question.subtitle, question.type);
            }

            console.log(`window: ${window.currentExam.type}`);
            
            // Add question prompt if it exists
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
            
            // Options section - this remains in the question container
            
            // Create a separate options wrapper
            const optionsWrapper = document.createElement('div');
            optionsWrapper.className = 'options-wrapper';
            questionContainer.appendChild(optionsWrapper);
            
            // Create options container
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
            optionsWrapper.appendChild(optionsContainer);
            
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
            
            // CRITICAL: Calculate elapsed time directly from stored timestamp for reliability
            const nowTimestamp = Date.now();
            const startTimestamp = window.examStartTimestamp || (nowTimestamp - 1000); // Fallback to 1 second ago
            const calculatedElapsedSeconds = Math.floor((nowTimestamp - startTimestamp) / 1000);
            
            console.log('Direct timestamp calculation:', {
                startTimestamp: window.examStartTimestamp,
                nowTimestamp: nowTimestamp,
                calculatedElapsedSeconds: calculatedElapsedSeconds,
                currentElapsedSeconds: elapsedSeconds
            });
            
            // Use the timestamp calculation which is more reliable than interval counter
            elapsedSeconds = calculatedElapsedSeconds;
            
            // Make sure we have the final elapsed time before stopping the timer
            const finalMinutes = Math.floor(elapsedSeconds / 60);
            const finalSeconds = elapsedSeconds % 60;
            const finalTime = `${finalMinutes.toString().padStart(2, '0')}:${finalSeconds.toString().padStart(2, '0')}`;
            console.log('Final time before stopping timer:', finalTime, '(', elapsedSeconds, 'seconds)');
            
            // Save the final elapsed time to a global variable to ensure it's available for calculateResults
            window.finalElapsedTime = elapsedSeconds;
            
            // Stop the timer
            stopExamTimer();
            
            // Calculate results
            const results = calculateResults();
            
            // Update result display
            updateResultsDisplay(results);
            
            // Hide exam content, show results
            examContentSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            
            // Ensure time-taken is properly displayed in the results section
            const timeTakenElement = document.getElementById('time-taken');
            if (timeTakenElement) {
                // Apply direct styles to ensure visibility
                timeTakenElement.style.display = 'inline-block';
                timeTakenElement.style.fontWeight = 'bold';
                timeTakenElement.style.color = '#2563eb';
                timeTakenElement.style.fontFamily = 'monospace';
                
                // Apply the time value from results
                timeTakenElement.textContent = results.timeTaken;
                console.log('Updated time-taken display in submitExam:', results.timeTaken);
                
                // Double-check if the content was actually set
                setTimeout(() => {
                    console.log('Time-taken content after timeout:', timeTakenElement.textContent);
                }, 100);
            } else {
                console.error('Could not find time-taken element in submitExam');
            }
            
            // Save the results to the progress tracking system
            saveToProgressTracker(results);
            
            // Dispatch event that exam was submitted
            document.dispatchEvent(new CustomEvent('examSubmitted', { detail: results }));
            
            // Set up feedback button directly after submission
            setTimeout(function() {
                console.log('Setting up feedback button after exam submission');
                const viewFeedbackBtn = document.getElementById('view-feedback');
                const feedbackContainer = document.getElementById('feedback');
                
                if (viewFeedbackBtn && feedbackContainer) {
                    // Force styles to ensure visibility control
                    feedbackContainer.style.display = 'none';
                    
                    // Remove existing click handlers
                    viewFeedbackBtn.replaceWith(viewFeedbackBtn.cloneNode(true));
                    
                    // Get the fresh element
                    const freshBtn = document.getElementById('view-feedback');
                    
                    // Add click handler
                    freshBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        console.log('Feedback button clicked (post-submission)');
                        if (feedbackContainer.style.display === 'none' || 
                            feedbackContainer.style.display === '') {
                            feedbackContainer.style.display = 'block';
                            freshBtn.textContent = 'Hide Detailed Feedback';
                        } else {
                            feedbackContainer.style.display = 'none';
                            freshBtn.textContent = 'View Detailed Feedback';
                        }
                    });
                    
                    console.log('Feedback button handler attached post-submission');
                }
            }, 500); // Short delay to ensure DOM is ready
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
        console.log('Calculating skill scores from results:', results);
        
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
        
        // Count correct answers by type - directly from the calculated results
        if (results && results.questionResults) {
            console.log(`Processing ${results.questionResults.length} question results`);
            
            results.questionResults.forEach((result, index) => {
                if (!result) {
                    console.warn(`Question result at index ${index} is undefined`);
                    return;
                }
                
                // Get question and type info from the result
                const questionType = result.questionType;
                if (!questionType) {
                    console.warn(`Question at index ${index} has no type information`);
                    return;
                }
                
                // Get the skill for this question type
                const skill = typeToSkill[questionType] || 'reading';
                
                // Update skill counts
                skillCounts[skill].total++;
                if (result.isCorrect) {
                    skillCounts[skill].correct++;
                }
                
                // Update type breakdown
                if (!typeBreakdown[questionType]) {
                    typeBreakdown[questionType] = { correct: 0, total: 0 };
                }
                typeBreakdown[questionType].total++;
                if (result.isCorrect) {
                    typeBreakdown[questionType].correct++;
                }
            });
            
            console.log('Processed skill counts:', skillCounts);
            console.log('Processed type breakdown:', typeBreakdown);
        } else {
            console.error('No question results found in the results object:', results);
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
        try {
            console.log('Calculating exam results');
            console.log('Current elapsed seconds:', elapsedSeconds);
            console.log('Final elapsed time from window:', window.finalElapsedTime);
            
            // Ensure we have a valid time, using window.finalElapsedTime if available
            const totalQuestions = window.currentExam.totalQuestions;
            const userAnswers = window.userAnswers || [];
            const questions = window.currentExam.questions || [];
            
            let correctCount = 0;
            const questionResults = [];
            const typeStats = {};
            
            // Process each question and answer
            questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const correctAnswer = question.correctAnswer;
                const isCorrect = userAnswer === correctAnswer;
                
                // Update correct count
                if (isCorrect) {
                    correctCount++;
                }
                
                // Store question result
                questionResults.push({
                    questionIndex: index,
                    questionText: question.text,
                    userAnswer: userAnswer,
                    correctAnswer: correctAnswer,
                    isCorrect: isCorrect,
                    questionType: question.type,
                    explanation: question.explanation || null,
                    // Add these properties needed by addDetailedFeedback function
                    selectedOption: userAnswer,
                    correctOption: correctAnswer
                });
                
                // Update type statistics
                const type = question.type || 'unknown';
                if (!typeStats[type]) {
                    typeStats[type] = { total: 0, correct: 0 };
                }
                
                typeStats[type].total++;
                if (isCorrect) {
                    typeStats[type].correct++;
                }
            });
            
            // Calculate percentage scores for each type
            const typeScores = {};
            for (const [type, stats] of Object.entries(typeStats)) {
                const percentage = (stats.correct / stats.total) * 100;
                typeScores[type] = {
                    total: stats.total,
                    correct: stats.correct,
                    percentage: percentage
                };
            }
            
            // Calculate overall percentage
            const percentage = (correctCount / totalQuestions) * 100;
            
            // Format time taken - use saved finalElapsedTime if available for extra reliability
            const timeToUse = window.finalElapsedTime || elapsedSeconds;
            const minutes = Math.floor(timeToUse / 60);
            const seconds = timeToUse % 60;
            const timeTaken = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            console.log(`Formatting time taken: ${timeToUse} seconds = ${minutes} min ${seconds} sec = ${timeTaken}`);
            
            // Compile results object
            const results = {
                correctCount: correctCount,
                totalQuestions: totalQuestions,
                percentage: percentage,
                timeTaken: timeTaken,
                questionResults: questionResults,
                typeScores: typeScores
            };
            
            console.log('Results calculated:', results);
        return results;
        } catch (error) {
            console.error('Error calculating results:', error);
            // Return a basic results object in case of error
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
    
    // Helper function to get performance text based on score percentage
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
    
    // Update results display
    function updateResultsDisplay(results) {
        try {
            console.log('Updating results display with:', results);
            console.log('Final time value during results display:', window.finalElapsedTime);
        
            // Set percentage score
            const scoreElement = document.getElementById('score');
            if (scoreElement) {
                scoreElement.textContent = `${Math.round(results.percentage)}%`;
            }
            
            // Animate score path
            const scorePath = document.getElementById('score-path');
            if (scorePath) {
                const circumference = 2 * Math.PI * 15.9155;
                const offset = circumference - (results.percentage / 100) * circumference;
                
                // First set initial state
                scorePath.style.strokeDasharray = `${circumference} ${circumference}`;
                scorePath.style.strokeDashoffset = `${circumference}`;
                
                // Force a reflow
                scorePath.getBoundingClientRect();
                
                // Then animate
                scorePath.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
                scorePath.style.strokeDashoffset = offset;
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
            
            // Make sure the time-taken element is visible and properly updated
            const timeTakenElement = document.getElementById('time-taken');
            if (timeTakenElement) {
                // Forcibly calculate time string from finalElapsedTime
                const timeToUse = window.finalElapsedTime || 0;
                const minutes = Math.floor(timeToUse / 60);
                const seconds = timeToUse % 60;
                const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Ensure visibility and styling
                timeTakenElement.style.display = 'inline-block';
                timeTakenElement.style.fontWeight = 'bold';
                timeTakenElement.style.color = '#2563eb';
                timeTakenElement.style.fontFamily = 'monospace';
                timeTakenElement.style.fontSize = '1.1rem';
                
                // Update content - use direct calculation instead of results.timeTaken
                timeTakenElement.textContent = timeDisplay;
                console.log('Directly set time-taken to:', timeDisplay, '(from timeToUse:', timeToUse, ')');
                
                // Fallback to results.timeTaken if the time is still 00:00
                if (timeDisplay === '00:00' && results.timeTaken !== '00:00') {
                    timeTakenElement.textContent = results.timeTaken;
                    console.log('Falling back to results.timeTaken:', results.timeTaken);
                }
            } else {
                console.error('Could not find time-taken element!');
            }
            
            // Update performance text
            const performanceTextElement = document.getElementById('performance-text');
            if (performanceTextElement) {
                const performanceText = getPerformanceText(results.percentage);
                performanceTextElement.textContent = performanceText;
            }
            
            // Calculate skill-specific scores
            const skillScores = calculateSkillScores(results);
            console.log('Calculated skill scores:', skillScores);
            
            // Update skill scores
            updateSkillScore('reading', skillScores.reading);
            updateSkillScore('writing', skillScores.writing);
            updateSkillScore('speaking', skillScores.speaking);
            
            // Update skill counts
            updateSkillCount('reading', skillScores.skillCounts.reading);
            updateSkillCount('writing', skillScores.skillCounts.writing);
            updateSkillCount('speaking', skillScores.skillCounts.speaking);
            
            // Update type scores
            updateTypeScores(results);
            
            // Add detailed feedback
            addDetailedFeedback(results.questionResults);
            
            // Add score suggestions based on the performance
            // Pass the type scores to the function
            addScoreSuggestions(results.percentage, results.typeScores);
            
            // Calculate percentile rank based on score
            calculatePercentileRank(results.correctCount);
            
            // Show the results section
            const resultsSection = document.getElementById('results');
            if (resultsSection) {
                resultsSection.classList.remove('hidden');
            }
            
            console.log('Results display updated successfully');
        } catch (error) {
            console.error('Error updating results display:', error);
        }
    }
    
    // Function to calculate percentile rank based on score distribution
    function calculatePercentileRank(userScore) {
        console.log('Original score:', userScore);
        
        // Apply score multiplier (1.25x) before percentile calculation
        const adjustedScore = userScore * 1.25;
        // Cap the adjusted score at 100 if it exceeds
        const finalScore = Math.min(adjustedScore, 100);
        
        console.log('Calculating percentile rank for adjusted score:', finalScore, '(original score', userScore, 'multiplied by 1.25)');
        
        // Fetch the score distribution data from score.json
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
                console.log('Score distribution data:', distributionData);
                
                // Parse distribution data and calculate percentile
                let totalStudents = 0;
                let studentsBelow = 0;
                
                // First calculate total number of students in the distribution
                Object.entries(distributionData).forEach(([range, count]) => {
                    totalStudents += parseInt(count.trim(), 10);
                });
                
                // Calculate students below the user's score (using adjusted score)
                Object.entries(distributionData).forEach(([range, count]) => {
                    const [min, max] = range.split('-').map(val => parseFloat(val));
                    const frequency = parseInt(count.trim(), 10);
                    
                    if (max < finalScore) {
                        // Add all students in ranges completely below user's score
                        studentsBelow += frequency;
                    } else if (min <= finalScore && finalScore <= max) {
                        // For the range containing the user's score, add a proportion
                        // Assume uniform distribution within the range
                        const rangeSize = max - min;
                        const positionInRange = finalScore - min;
                        const proportion = positionInRange / rangeSize;
                        studentsBelow += frequency * proportion;
                    }
                });
                
                // Calculate percentile (percentage of students below user's score)
                const percentile = (studentsBelow / totalStudents) * 100;
                const roundedPercentile = percentile.toFixed(3);
                
                console.log(`User score: ${userScore}, Adjusted score: ${finalScore}, Percentile: ${roundedPercentile}%, Rank: ${Math.round(totalStudents - studentsBelow) + 1} of ${totalStudents}`);
                
                // Add percentile and rank to the results display
                displayPercentileRank(roundedPercentile, Math.round(totalStudents - studentsBelow) + 1, totalStudents, userScore, finalScore);
            })
            .catch(error => {
                console.error('Error calculating percentile rank:', error);
                // Show a notification about the error
                showNotification('Could not calculate percentile rank: ' + error.message, 'warning');
            });
    }
    
    // Function to display percentile rank in the results section
    function displayPercentileRank(percentile, rank, totalStudents, originalScore, adjustedScore) {
        try {
            console.log('Displaying percentile rank:', percentile);
            
            // Find the result-summary container and its parent
            const resultSummary = document.querySelector('.result-summary');
            if (!resultSummary) {
                console.error('Result summary container not found');
                return;
            }
            
            // Get the parent element of result-summary
            const resultsSection = resultSummary.parentElement;
            if (!resultsSection) {
                console.error('Parent of result-summary not found');
                return;
            }
            
            // Create percentile visualization container
            const percentileContainer = document.createElement('div');
            percentileContainer.className = 'percentile-container';
            percentileContainer.style.marginBottom = '25px'; // Add some spacing below
            
            // Add title and description with two-column layout
            percentileContainer.innerHTML = `
                <div class="percentile-flex-container">
                    <!-- Left column - Score Summary -->
                    <div class="percentile-left-column">
                        <h3 class="score-summary-title">คะแนนของคุณ</h3>
                        <div class="score-summary">
                            <div class="score-summary-item">
                                <span class="summary-value highlighted">${adjustedScore.toFixed(3)}</span>
                            </div>
                            <div class="stat-item">
                                <p id="percentile-description">ควรปรับปรุงอย่างเร่งด่วน</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Middle Separator -->
                    <div class="percentile-separator"></div>
                    
                    <!-- Right column - Percentile Information -->
                    <div class="percentile-right-column">
                        <h3 class="percentile-title">เปอร์เซ็นไทล์ของคุณ</h3>
                        <div class="percentile-summary">
                            <div class="percentile-number">${percentile}%</div>
                            <p class="percentile-description">คะแนนของคุณสูงกว่า <strong>${percentile}%</strong> ของผู้ทดสอบทั้งหมด</p>
                        </div>
                    </div>
                </div>
                
                <div class="percentile-visualization">
                    <div class="percentile-bar">
                        <div class="percentile-fill" style="width: 0%"></div>
                        <div class="percentile-marker" style="left: ${percentile}%"></div>
                    </div>
                    <div class="percentile-labels">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                </div>
                <div class="rank-info">
                    <span>อันดับที่: <strong>≈ ${rank}</strong> จาก ${totalStudents.toLocaleString()} คน</span>
                    <span class="data-source">*อ้างอิงจากข้อมูลการสอบ A-Level ภาษาอังกฤษ ปี 68</span>
                </div>
            `;
            
            // Insert the percentile container BEFORE the result-summary
            resultsSection.insertBefore(percentileContainer, resultSummary);

            // Add styles for percentile visualization
            addPercentileStyles();
            
            // Animate the fill after a short delay
            setTimeout(() => {
                const percentileFill = percentileContainer.querySelector('.percentile-fill');
                if (percentileFill) {
                    percentileFill.style.width = percentile + '%';
                }
            }, 300);
            
            // Check if percentile is below 85% and add tutor recommendation
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
                
                // Add the recommendation after the percentile container
                percentileContainer.appendChild(tutorRecommendation);
                
                // Add styles for the tutor recommendation
                const styleElement = document.createElement('style');
                styleElement.id = 'tutor-recommendation-styles';
                styleElement.textContent = `
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
                
                if (!document.getElementById('tutor-recommendation-styles')) {
                    document.head.appendChild(styleElement);
                }
            }
            
            console.log('Percentile visualization added successfully at the top of result-summary');
        } catch (error) {
            console.error('Error displaying percentile rank:', error);
        }
    }

    // Add styles for percentile visualization
    function addPercentileStyles() {
        // Check if styles already exist
        if (document.getElementById('percentile-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'percentile-styles';
        
        styleElement.textContent = `
            .percentile-container {
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .percentile-flex-container {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
            }
            
            .percentile-left-column {
                flex: 1;
                padding-right: 15px;
                text-align: center;
            }
            
            .percentile-separator {
                width: 1px;
                align-self: stretch;
                background-color: #d1d5db;
                margin: 0 20px;
            }
            
            .percentile-right-column {
                flex: 1;
                padding-left: 15px;
            }
            
            .score-summary-title {
                color: #39D455;
                font-size: 1.3rem;
                margin-bottom: 15px;
            }
            
            .score-summary {
                margin-bottom: 20px;
            }
            
            .score-summary-item {
                margin-bottom: 8px;
                font-size: 1rem;
            }
            
            .summary-label {
                color: #4b5563;
                margin-right: 8px;
                font-weight: 500;
            }
            
            .summary-value {
                font-weight: bold;
                color: #1f2937;
            }
            
            .summary-value.highlighted {
                color: #39D455;
                font-size: 2.5rem;
            }
            
            .adjustment-note {
                font-size: 0.85rem;
                color: #6b7280;
                font-style: italic;
                margin-top: 5px;
            }
            
            .percentile-title {
                color: #3b82f6;
                font-size: 1.3rem;
                text-align: center;
                margin-bottom: 15px;
            }
            
            .percentile-summary {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .percentile-number {
                font-size: 2.5rem;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 5px;
            }
            
            .percentile-description {
                font-size: 1rem;
                color: #4b5563;
                margin-bottom: 15px;
            }
            
            .adjustment-arrow {
                color: #64748b;
            }
            
            .percentile-visualization {
                margin: 25px 0;
                padding: 0 10px;
            }
            
            .percentile-bar {
                height: 25px;
                background-color: #e5e7eb;
                border-radius: 25px;
                position: relative;
                overflow: visible;
                margin-bottom: 10px;
            }
            
            .percentile-bar::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                border-radius: 25px;
            }
            
            .percentile-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #2563eb);
                width: 0%;
                transition: width 1.5s cubic-bezier(0.23, 1, 0.32, 1);
                border-radius: 25px;
            }
            
            .percentile-marker {
                position: absolute;
                top: -20px;
                width: 4px;
                height: 0px;
                background-color: #2563eb;
                transform: translateX(-50%);
                transition: left 1.5s cubic-bezier(0.23, 1, 0.32, 1);
                z-index: 10;
            }
            
            .percentile-marker::after {
                content: 'คุณ';
                position: absolute;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #2563eb;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                white-space: nowrap;
            }
            
            .percentile-marker::before {
                content: '';
                position: absolute;
                width: 12px;
                height: 12px;
                background-color: #2563eb;
                border: 2px solid white;
                border-radius: 50%;
                top: 25px;
                left: 50%;
                transform: translateX(-50%);
                box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
            }
            
            .percentile-labels {
                display: flex;
                justify-content: space-between;
                font-size: 0.85rem;
                color: #6b7280;
                padding: 5px 0;
            }
            
            .percentile-labels span {
                position: relative;
            }
            
            .percentile-labels span::before {
                content: '';
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                height: 5px;
                width: 1px;
                background-color: #9ca3af;
            }
            
            .rank-info {
                text-align: center;
                font-size: 0.9rem;
                color: #4b5563;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .data-source {
                font-size: 0.8rem;
                color: #9ca3af;
                font-style: italic;
            }
            
            @media (max-width: 768px) {
                .percentile-flex-container {
                    flex-direction: column;
                }
                
                .percentile-left-column,
                .percentile-right-column {
                    width: 100%;
                    padding: 0;
                }
                
                .percentile-separator {
                    width: 100%;
                    height: 1px;
                    margin: 15px 0;
                }
                
                .percentile-title,
                .percentile-summary {
                    text-align: left;
                }
                
                .score-summary-title {
                    margin-bottom: 10px;
                }
            }
            
            @media (max-width: 640px) {
                .percentile-number {
                    font-size: 2rem;
                }
                
                .percentile-marker::after {
                    font-size: 10px;
                    padding: 3px 6px;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
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
        try {
            console.log('Updating type scores with:', result.typeScores);
            
            const typeScores = result.typeScores || {};
            const typeContainer = document.querySelector('.type-breakdown-list');
            
            if (!typeContainer) {
                console.error('Type breakdown list container not found');
                return;
            }
            
            // Update all type scores in the breakdown list
            for (const [type, score] of Object.entries(typeScores)) {
                // Convert type to element ID format (replace underscore with hyphen)
                const typeId = type.replace(/_/g, '-');
                updateTypeScoreElement(typeId, score);
            }
            
            console.log('Type scores updated successfully');
        } catch (error) {
            console.error('Error updating type scores:', error);
        }
    }

    // Helper function to update an existing type score element
    function updateTypeScoreElement(typeId, typeScore) {
        if (!typeScore) return;
        
        console.log(`Updating type score for ${typeId}:`, typeScore);
        
        // Update score text
        const scoreText = document.getElementById(`${typeId}-score`);
        if (scoreText) {
            // Format as "correct/total"
            scoreText.textContent = `${typeScore.correct}/${typeScore.total}`;
        } else {
            console.warn(`Score element for ${typeId} not found in DOM`);
        }
        
        // Animate the score path (only for skill scores, not type breakdown)
        const pathElement = document.getElementById(`${typeId}-score-path`);
        if (pathElement) {
            const circumference = 2 * Math.PI * 15.9155;
            const offset = circumference - (typeScore.percentage / 100) * circumference;
            
            // First set initial state
            pathElement.style.strokeDasharray = `${circumference} ${circumference}`;
            pathElement.style.strokeDashoffset = `${circumference}`;
            
            // Force a reflow
            pathElement.getBoundingClientRect();
            
            // Then animate
            pathElement.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
            pathElement.style.strokeDashoffset = offset;
        }
    }

    // Format type name for display
    function formatTypeName(type) {
        // Replace underscores with spaces and capitalize words
        return type.replace(/_/g, ' ')
            .replace(/\b\w/g, letter => letter.toUpperCase());
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
                p.innerHTML = `<strong class="adv-content" style="color: black !important; font-weight: bold !important;">${prefix}:</strong> ${remainingText}`;
                
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
        try {
            console.log('Adding navigation elements for new layout');
            
            // We don't need to manually add elements because they're now part of the HTML structure
            // Just make sure the existing elements get proper initialization
            
            // Make sure all elements referenced in updateProgressIndicators and updateQuestionNavigator exist
            const progressElements = [
                'visual-progress-fill',
                'answered-count',
                'total-question-count',
                'current-question',
                'progress-fill',
                'question-navigator'
            ];
            
            // Log which elements are found/missing to help with debugging
            progressElements.forEach(id => {
                const el = document.getElementById(id);
                if (!el) {
                    console.warn(`Navigation element not found: ${id}`);
            } else {
                    console.log(`Found navigation element: ${id}`);
                }
            });
            
            // Initialize the total question count if it exists
            const totalQuestionCount = document.getElementById('total-question-count');
            if (totalQuestionCount && window.currentExam) {
                totalQuestionCount.textContent = window.currentExam.totalQuestions;
            }
            
            console.log('Navigation elements setup completed successfully');
        } catch (error) {
            console.error('Error adding navigation elements:', error);
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
            
            /* Updated exam header and content structure */
            .exam-header {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .exam-title-container {
                margin-bottom: 20px;
            }
            
            /* Question progress text styling */
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
            
            /* Question text styling in its new position */
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
            
            /* Content wrapper & options wrapper styles */
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
            
            /* Type indicator repositioning */
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
            
            /* Jump Menu Header */
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
        
        // Add retry button handler
        const retryButton = document.getElementById('retry-exam');
        if (retryButton) {
            retryButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to retry this exam? Your current results will be lost.')) {
                    // Reset the exam
                    window.currentQuestionIndex = 0;
                    window.userAnswers = window.currentExam ? 
                        new Array(window.currentExam.totalQuestions).fill(null) : [];
                    
                    // Show exam content, hide results
                    const examContentSection = document.getElementById('exam-content');
                    const resultsSection = document.getElementById('results');
                    if (examContentSection && resultsSection) {
                        resultsSection.classList.add('hidden');
                        examContentSection.classList.remove('hidden');
                        
                        // Start the timer again
                        startExamTimer();
                        
                        // Load the first question
                        loadQuestion(0);
                    }
                }
            });
        }
    });

    // Toggle feedback visibility function (using direct style manipulation for reliability)
    function toggleFeedback() {
        console.log('Toggle feedback function called');
        const feedbackContainer = document.getElementById('feedback');
        const viewFeedbackBtn = document.getElementById('view-feedback');
        
        if (!feedbackContainer) {
            console.error('Feedback container not found in toggleFeedback function');
            return;
        }
        
        console.log('Feedback container found, current display:', feedbackContainer.style.display);
        
        // Check current display state - prioritize the style.display property
        const isHidden = feedbackContainer.style.display === 'none' || 
                        (feedbackContainer.style.display === '' && feedbackContainer.classList.contains('hidden'));
        
        // Toggle display state
        if (isHidden) {
            // Show the feedback container
            feedbackContainer.style.display = 'block';
            feedbackContainer.classList.remove('hidden');
            if (viewFeedbackBtn) {
                viewFeedbackBtn.textContent = 'Hide Detailed Feedback';
            }
            console.log('Showing feedback container');
        } else {
            // Hide the feedback container
            feedbackContainer.style.display = 'none';
            feedbackContainer.classList.add('hidden');
            if (viewFeedbackBtn) {
                viewFeedbackBtn.textContent = 'View Detailed Feedback';
            }
            console.log('Hiding feedback container');
        }
    }

    // Add detailed feedback for each question
    function addDetailedFeedback(questionResults) {
        const feedbackList = document.querySelector('.feedback-list');
        if (!feedbackList) {
            console.error('Feedback list container not found');
            return;
        }
        
        console.log('Adding detailed feedback for', questionResults.length, 'questions');
        
        // Clear existing feedback
        feedbackList.innerHTML = '';
        
        // Add feedback for each question
        questionResults.forEach((result, index) => {
            const question = window.currentExam.questions[index];
            if (!question) return;
            
            const feedbackItem = document.createElement('div');
            feedbackItem.className = `feedback-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
            
            // Get the selected option text and correct option text
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
        
        // Apply direct styles to the feedback container to ensure it's visible when needed
        const feedbackContainer = document.getElementById('feedback');
        if (feedbackContainer) {
            feedbackContainer.style.transition = 'all 0.3s ease';
            feedbackContainer.style.backgroundColor = '#f8fafc';
            feedbackContainer.style.borderRadius = '10px';
            feedbackContainer.style.padding = '20px';
            feedbackContainer.style.marginTop = '30px';
            feedbackContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            
            // Initially hidden
            feedbackContainer.style.display = 'none';
            feedbackContainer.classList.add('hidden');
        }
        
        console.log('Detailed feedback added successfully');
    }

    // Check for DOM-ready state and add button listener
    document.addEventListener('DOMContentLoaded', function() {
        // Existing code...
        
        // Add a direct approach to handle the feedback button click
        setTimeout(function() {
            const viewFeedbackBtn = document.getElementById('view-feedback');
            const feedbackContainer = document.getElementById('feedback');
            
            if (viewFeedbackBtn && feedbackContainer) {
                console.log('Setting up global feedback button handler');
                
                // Direct approach using style property instead of classList
                viewFeedbackBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('View feedback button clicked (direct handler)');
                    
                    // Use direct style manipulation
                    if (feedbackContainer.style.display === 'none' || 
                        feedbackContainer.style.display === '' && feedbackContainer.classList.contains('hidden')) {
                        feedbackContainer.style.display = 'block';
                        feedbackContainer.classList.remove('hidden');
                        viewFeedbackBtn.textContent = 'Hide Detailed Feedback';
                        console.log('Showing feedback container');
                    } else {
                        feedbackContainer.style.display = 'none';
                        feedbackContainer.classList.add('hidden');
                        viewFeedbackBtn.textContent = 'View Detailed Feedback';
                        console.log('Hiding feedback container');
                    }
                    
                    return false;
                });
            }
        }, 1000); // Give time for the DOM to fully render
    });

    // Add personalized score suggestions based on performance
    function addScoreSuggestions(scorePercentage, typeScores) {
        try {
            console.log('Adding score suggestions based on performance:', { scorePercentage, typeScores });
            
            const suggestionsContainer = document.getElementById('score-suggestions');
            const suggestionsContent = suggestionsContainer.querySelector('.suggestions-content');
            
            if (!suggestionsContent) {
                console.error('Could not find suggestions content container');
                return;
            }
            
            // Clear previous content
            suggestionsContent.innerHTML = '';
            
            // Generate personalized suggestions based on score percentage and weakest areas
            const suggestions = generateSuggestions(scorePercentage, typeScores);
            
            // Create and append suggestion elements
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
                suggestionsContent.appendChild(suggestionElement);
            });
            
            console.log('Successfully added score suggestions');
        } catch (error) {
            console.error('Error adding score suggestions:', error);
        }
    }

    // Generate personalized suggestions based on score
    function generateSuggestions(scorePercentage, typeScores) {
        const suggestions = [];
        
        // General suggestion based on overall score
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
        
        // Find weakest examination areas
        if (typeScores && Object.keys(typeScores).length > 0) {
            // Sort types by score (ascending)
            const sortedTypes = Object.entries(typeScores)
                .filter(([type, score]) => score.percentage !== undefined)
                .sort((a, b) => a[1].percentage - b[1].percentage);
            
            // Get the weakest area if available
            if (sortedTypes.length > 0) {
                const [weakestType, weakestScore] = sortedTypes[0];
                const formatted = formatTypeName(weakestType);
                
                // Add suggestion based on weakest area
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
        
        // Add time management suggestion if needed
        // This could be based on average time per question or other metrics
        suggestions.push({
            title: 'การบริหารเวลา',
            text: 'ฝึกทำข้อสอบโดยจับเวลา กำหนดเวลาในการทำข้อสอบแต่ละส่วนให้เหมาะสม และฝึกการจัดลำดับความสำคัญของข้อสอบ'
        });
        
        return suggestions;
    }

    // Initialize the question navigator
    function initializeQuestionNavigator(questionCount) {
        const navigator = document.getElementById('question-navigator');
        if (!navigator) return;
        
        // Clear any existing buttons
        navigator.innerHTML = '';
        
        // Define the question categories
        const categories = [
            { name: 'SPEAKING', start: 1, end: 20, class: 'speaking' },
            { name: 'READING', start: 21, end: 60, class: 'reading' },
            { name: 'WRITING', start: 61, end: 80, class: 'writing' }
        ];
        
        // Loop through each category
        categories.forEach(category => {
            // Add category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = `category-header ${category.class}`;
            categoryHeader.textContent = category.name;
            navigator.appendChild(categoryHeader);
            
            // Create buttons for this category
            for (let i = category.start - 1; i < Math.min(category.end, questionCount); i++) {
                const button = document.createElement('div');
                button.className = `question-nav-item ${category.class}`;
                button.textContent = (i + 1).toString();
                button.dataset.index = i;
                
                // Add click handler
                button.addEventListener('click', function() {
                    saveCurrentAnswer();
                    loadQuestion(parseInt(this.dataset.index));
                });
                
                navigator.appendChild(button);
            }
        });
        
        // Set total question count
        const totalQuestionCount = document.getElementById('total-question-count');
        if (totalQuestionCount) {
            totalQuestionCount.textContent = `${questionCount.toString()} ข้อ`;
        }
        
        // Initialize the visual progress fill indicator
        const visualProgressFill = document.getElementById('visual-progress-fill');
        if (visualProgressFill) {
            visualProgressFill.style.width = '0%';
        }
        
        // Add some CSS to style the category headers
        addCategoryStyles();
    }

    // Update question navigator
    function updateQuestionNavigator(currentIndex) {
        const navigator = document.getElementById('question-navigator');
        if (!navigator) return;
        
        // Determine which category this question belongs to
        let category = '';
        if (currentIndex < 20) {
            category = 'speaking';
        } else if (currentIndex < 60) {
            category = 'reading';
        } else {
            category = 'writing';
        }
        
        // Update button states
        const buttons = navigator.querySelectorAll('.question-nav-item');
        buttons.forEach((button, index) => {
            // Get the real question index from the dataset
            const buttonIndex = parseInt(button.dataset.index);
            
            // Clear previous state classes
            button.classList.remove('current', 'answered', 'unanswered');
            
            // Add appropriate class
            if (buttonIndex === currentIndex) {
                button.classList.add('current');
            } else if (window.userAnswers && window.userAnswers[buttonIndex] !== null) {
                button.classList.add('answered');
            } else {
                button.classList.add('unanswered');
            }
        });
        
        // Update answered count
        const answeredCount = window.userAnswers ? window.userAnswers.filter(answer => answer !== null).length : 0;
        const answeredCountElement = document.getElementById('answered-count');
        if (answeredCountElement) {
            answeredCountElement.textContent = `${answeredCount.toString()} เลือกคำตอบแล้ว`;
        }
        
        // Update visual progress fill
        const totalQuestions = window.currentExam ? window.currentExam.totalQuestions : 0;
        const visualProgressFill = document.getElementById('visual-progress-fill');
        if (visualProgressFill && totalQuestions > 0) {
            const progressPercentage = (answeredCount / totalQuestions) * 100;
            visualProgressFill.style.width = `${progressPercentage}%`;
        }
        }

    // Add question progress text to container
    function addQuestionProgressText(container, currentQuestionNum, totalQuestions) {
        const progressText = document.createElement('div');
        progressText.className = 'question-progress-text';
        progressText.textContent = `ข้อที่ ${currentQuestionNum} จาก ${totalQuestions}`;
        
        // Insert at the beginning of the container
        if (container.firstChild) {
            container.insertBefore(progressText, container.firstChild);
        } else {
            container.appendChild(progressText);
        }
    }

    // Add this function to the file
    function initializeExamSelection() {
        const examOptions = document.querySelectorAll('.exam-option');
        const startButton = document.getElementById('start-combined-exam');
        
        // Exam data for different exams
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
                    speaking: 20, // in percentage
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
        
        // Set up click handlers for exam options
        examOptions.forEach(option => {
            option.addEventListener('click', function() {
                const examId = this.dataset.examId;
                
                // Update active state
                examOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Update exam details
                updateExamDetails(examData[examId]);
                
                // Update start button
                startButton.dataset.currentExam = examId;
            });
        });
        
        // Modify the start button click handler to use the selected exam
        startButton.addEventListener('click', function() {
            const selectedExamId = this.dataset.currentExam;
            const selectedExam = examData[selectedExamId];
            
            // Store the selected exam data for use during the exam
            window.selectedExamData = selectedExam;
            
            // Show the exam content section
            document.getElementById("exam-info").scrollIntoView({ behavior: 'smooth' });
            document.getElementById("exam-info").classList.add('hidden');
            document.getElementById("exam-content").classList.remove('hidden');
            
            // Reset timer tracking variables when starting a new exam
            startTime = Date.now();
            elapsedSeconds = 0;
            window.examTimerValue = 0;
            window.finalElapsedTime = 0; // Initialize final time storage
            
            // CRITICAL: Store exact timestamp when exam starts for reliable timing
            window.examStartTimestamp = Date.now();
            console.log('Stored exam start timestamp:', window.examStartTimestamp);
            
            // Reset timer display
            const timerElement = document.getElementById('timer-display');
            if (timerElement) {
                timerElement.textContent = '00:00';
            }
            
            // Load the selected exam
            loadSelectedExam(selectedExam);
        });
        
        // Initialize with the first exam
        updateExamDetails(examData.exam1);
    }

    // Function to update the UI with the selected exam details
    function updateExamDetails(examData) {
        // Update metadata
        document.getElementById('total-questions-count').textContent = examData.questionCount;
        document.getElementById('exam-time').textContent = `${examData.duration} นาที`;
        document.getElementById('exam-difficulty').textContent = examData.difficulty;
        
        // Update descriptions
        document.getElementById('exam-description-th').textContent = examData.descriptionTh;
        document.getElementById('exam-description-en').textContent = examData.descriptionEn;
        
        // Update distribution bar
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
        
        // Update question counts
        document.querySelector('.total-value').textContent = examData.questionCount;
        
        // Update skill counts
        const speakingCount = examData.questions.short_conversation + examData.questions.long_conversation;
        const readingCount = examData.questions.advertisement + examData.questions.product + 
                            examData.questions.news_report + examData.questions.article;
        const writingCount = examData.questions.text_completion + examData.questions.paragraph;
        
        document.querySelector('.skill-section.speaking .skill-count').textContent = `${speakingCount} ข้อ`;
        document.querySelector('.skill-section.reading .skill-count').textContent = `${readingCount} ข้อ`;
        document.querySelector('.skill-section.writing .skill-count').textContent = `${writingCount} ข้อ`;
        
        // Update individual question type counts
        updateQuestionTypeCount('short-conversation', examData.questions.short_conversation);
        updateQuestionTypeCount('long-conversation', examData.questions.long_conversation);
        updateQuestionTypeCount('advertisement', examData.questions.advertisement);
        updateQuestionTypeCount('product', examData.questions.product);
        updateQuestionTypeCount('news-report', examData.questions.news_report);
        updateQuestionTypeCount('article', examData.questions.article);
        updateQuestionTypeCount('text-completion', examData.questions.text_completion);
        updateQuestionTypeCount('paragraph', examData.questions.paragraph);
    }

    // Helper function to update question type count
    function updateQuestionTypeCount(typeClass, count) {
        const typeCountElement = document.querySelector(`.question-type-indicator.${typeClass}`).nextElementSibling;
        if (typeCountElement) {
            typeCountElement.textContent = `${count} ข้อ`;
        }
    }

    // Function to load the selected exam
    function loadSelectedExam(examData) {
        console.log(`Loading selected exam: ${examData.title}`);
        
        // Try to load the exam JSON file
        fetch(examData.jsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Path ${examData.jsonPath} failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(examJson => {
                console.log(`Successfully loaded exam data from: ${examData.jsonPath}`);
                // Process the exam data to flatten questions before initializing
                const processedData = processExamData(examJson);
                initExam(processedData); // Use the processed, flattened data
            })
            .catch(error => {
                console.warn(`Error loading from ${examData.jsonPath}: ${error.message}`);
                // Fall back to sample data
                console.warn("Using sample exam data instead.");
                const sampleData = generateSampleExamData(examData);
                initExam(sampleData);
            });
    }

    // Generate sample exam data based on the selected exam configuration
    function generateSampleExamData(examData) {
        const sampleData = [];
        
        // Generate sample questions for each type based on the specified counts
        let questionCounter = 0;
        
        // Add sample short conversation questions
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
        
        // Add sample long conversation questions
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
        
        // Add sample advertisement questions
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
        
        // Add sample product questions
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
        
        // Add sample news report questions
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
        
        // Add sample article questions
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
        
        // Add sample text completion questions
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
        
        // Add sample paragraph questions
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