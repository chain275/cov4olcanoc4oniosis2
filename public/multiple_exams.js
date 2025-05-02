// Multiple Exams Script
document.addEventListener('DOMContentLoaded', function() {
    // Section references
    const examSelectionSection = document.getElementById('exam-selection');
    const examInfoSection = document.getElementById('exam-info');
    const examContentSection = document.getElementById('exam-content');
    const resultsSection = document.getElementById('results');
    
    // Button references
    const startButton = document.getElementById('start-combined-exam');
    const backToSelectionButton = document.getElementById('back-to-selection');
    const beginExamButton = document.getElementById('begin-exam');
    const backButton = document.getElementById('back-button');
    const backToHomeButton = document.getElementById('back-to-home');
    
    // Other UI elements
    const timerDisplay = document.getElementById('timer-display');
    const availableExamsList = document.getElementById('available-exams');
    const selectedExamsList = document.getElementById('selected-exams');
    const noExamsSelectedMessage = document.getElementById('no-exams-selected');
    
    // Track selected exams and their questions
    let availableExams = [];
    let selectedExams = [];
    let combinedQuestions = [];
    
    // Add timer variables
    let startTime = 0;
    let elapsedSeconds = 0;
    let timerInterval = null;
    window.examTimerValue = 0; // Store elapsed time globally for progress tracking
    
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
    
    // Initialize the page
    init();
    
    function init() {
        // Load available exams
        loadAvailableExams();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Start button -> Go to exam info page
        startButton.addEventListener('click', function() {
            if (selectedExams.length > 0) {
                examSelectionSection.classList.add('hidden');
                examInfoSection.classList.remove('hidden');
                updateExamInfoDisplay();
            }
        });
        
        // Back to selection button
        backToSelectionButton.addEventListener('click', function() {
            examInfoSection.classList.add('hidden');
            examSelectionSection.classList.remove('hidden');
        });
        
        // Begin exam button -> Start the exam
        beginExamButton.addEventListener('click', function() {
            examInfoSection.classList.add('hidden');
            examContentSection.classList.remove('hidden');
            initExam(combinedQuestions);
        });
        
        // Back button in exam -> Confirm exit
        backButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to exit the exam? Your progress will be lost.')) {
                examContentSection.classList.add('hidden');
                examInfoSection.classList.remove('hidden');
                stopExamTimer();
            }
        });
        
        // Back to home button
        backToHomeButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
        
        // Apply filters button
        document.getElementById('apply-filters').addEventListener('click', filterExams);
    }
    
    function loadAvailableExams() {
        // Try different possible paths to find exam files
        const possiblePaths = [
            '../src/complete exam'
        ];
        
        // Try each path until one works
        tryLoadExamsFromPath(possiblePaths, 0);
    }
    
    function tryLoadExamsFromPath(paths, index) {
        if (index >= paths.length) {
            // If all paths fail, show error and use sample data
            console.warn("Could not load exams from any path. Using sample data instead.");
            availableExams = getSampleExams();
            displayAvailableExams();
            return;
        }
        
        const path = paths[index];
        console.log(`Trying to load exams from: ${path}`);
        
        // First, try to load combined_exam.json
        fetch(`${path}/combined_exam.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Path ${path} failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(examData => {
                console.log(`Successfully loaded combined_exam.json from: ${path}`);
                // Process the exam data
                availableExams = processExamData(examData);
                displayAvailableExams();
            })
            .catch(error => {
                console.warn(`Error loading from ${path}: ${error.message}`);
                // Try the next path
                tryLoadExamsFromPath(paths, index + 1);
            });
    }
    
    function processExamData(examData) {
        if (!examData || !Array.isArray(examData)) {
            console.error("Invalid exam data structure: Expected an array of exams.");
            return getSampleExams();
        }
        
        // Process each exam to ensure it has proper data
        const processedExams = examData.map((exam, examIndex) => {
            if (!exam || typeof exam !== 'object') {
                console.warn(`Item at index ${examIndex} is not a valid exam object. Skipping.`);
                return null;
            }
            
            // Ensure each exam has an id, title, and type
            const processedExam = {
                id: exam.id || `exam_${examIndex + 1}`,
                title: exam.title || `Exam ${examIndex + 1}`,
                type: exam.type || "unknown",
                description: exam.description || "",
                subtitle: exam.subtitle || "",
                totalQuestions: exam.questions?.length || 0,
                duration: exam.duration || 30,
                difficulty: getDifficultyLevel(exam),
                questions: processExamQuestions(exam, examIndex)
            };
            
            return processedExam;
        }).filter(exam => exam !== null && exam.questions.length > 0);
        
        console.log(`Processed ${processedExams.length} valid exams`);
        return processedExams;
    }
    
    function processExamQuestions(exam, examIndex) {
        if (!exam.questions || !Array.isArray(exam.questions)) {
            return [];
        }
        
        // Process each question to ensure it has proper data
        return exam.questions.map((question, questionIndex) => {
            if (!question || typeof question !== 'object') {
                return null;
            }
            
            // Add a unique ID if missing
            const questionId = question.id || `${exam.id || `exam_${examIndex}`}_q${questionIndex + 1}`;
            
            // Add the exam type to the question if missing
            const questionType = question.type || exam.type || determineQuestionType(question, questionIndex);
            
            // Add parent subtitle if missing
            const questionSubtitle = question.subtitle || exam.subtitle || "";
            
            // Process the question
            const processedQuestion = {
                ...question,
                id: questionId,
                type: questionType,
                subtitle: questionSubtitle,
                examId: exam.id || `exam_${examIndex}`,
                examTitle: exam.title || `Exam ${examIndex + 1}`
            };
            
            return processedQuestion;
        }).filter(q => q !== null);
    }
    
    function determineQuestionType(question, questionIndex) {
        // Try to determine question type from content or context
        if (question.text && question.text.includes("conversation")) {
            return questionIndex > 2 ? "long_conversation" : "short_conversation";
        } else if (question.text && question.text.includes("advertisement")) {
            return "advertisement";
        } else if (question.text && question.text.includes("product")) {
            return "product";
        } else if (question.text && question.text.includes("news")) {
            return "news_report";
        } else if (question.text && question.text.includes("article")) {
            return "article";
        } else if (question.text && question.text.includes("blank")) {
            return "text_completion";
        } else if (question.text && question.text.includes("paragraph")) {
            return "paragraph";
        }
        
        // Default fallback
        return "unknown";
    }
    
    function getDifficultyLevel(exam) {
        // Try to determine difficulty from exam properties
        const title = exam.title || "";
        const description = exam.description || "";
        
        if (title.toLowerCase().includes("beginner") || description.toLowerCase().includes("beginner")) {
            return "beginner";
        } else if (title.toLowerCase().includes("intermediate") || description.toLowerCase().includes("intermediate")) {
            return "intermediate";
        } else if (title.toLowerCase().includes("advanced") || description.toLowerCase().includes("advanced")) {
            return "advanced";
        }
        
        // Default difficulty
        return "intermediate";
    }
    
    function displayAvailableExams() {
        // Clear loading indicator
        availableExamsList.innerHTML = '';
        
        if (availableExams.length === 0) {
            availableExamsList.innerHTML = '<p class="no-exams-message">No exams available. Please check back later.</p>';
            return;
        }
        
        // Create exam items
        availableExams.forEach(exam => {
            const examItem = document.createElement('div');
            examItem.className = 'exam-item';
            examItem.dataset.examId = exam.id;
            
            // Create exam content
            examItem.innerHTML = `
                <div class="exam-item-content">
                    <h4>${exam.title}</h4>
                    <p class="exam-description">${exam.description || 'No description available'}</p>
                    <div class="exam-metadata">
                        <span class="exam-type">${formatTypeName(exam.type)}</span>
                        <span class="exam-questions">${exam.totalQuestions} questions</span>
                        <span class="exam-difficulty">${capitalize(exam.difficulty)}</span>
                    </div>
                </div>
                <button class="btn select-exam">Select</button>
            `;
            
            // Add event listener for select button
            examItem.querySelector('.select-exam').addEventListener('click', function() {
                toggleExamSelection(exam);
            });
            
            availableExamsList.appendChild(examItem);
        });
    }
    
    function toggleExamSelection(exam) {
        const examElement = document.querySelector(`.exam-item[data-exam-id="${exam.id}"]`);
        
        // Check if exam is already selected
        const examIndex = selectedExams.findIndex(e => e.id === exam.id);
        
        if (examIndex === -1) {
            // Add to selected
            selectedExams.push(exam);
            examElement.classList.add('selected');
            examElement.querySelector('.select-exam').textContent = 'Remove';
        } else {
            // Remove from selected
            selectedExams.splice(examIndex, 1);
            examElement.classList.remove('selected');
            examElement.querySelector('.select-exam').textContent = 'Select';
        }
        
        // Update selected exams display
        updateSelectedExamsDisplay();
        
        // Update combined questions
        updateCombinedQuestions();
        
        // Enable or disable start button
        startButton.disabled = selectedExams.length === 0;
    }
    
    function updateSelectedExamsDisplay() {
        // Hide the "no exams selected" message if there are selected exams
        noExamsSelectedMessage.style.display = selectedExams.length > 0 ? 'none' : 'block';
        
        // Clear current selected exams list (except the no-exams message)
        const examItems = selectedExamsList.querySelectorAll('.selected-exam-item');
        examItems.forEach(item => item.remove());
        
        // Display selected exams
        selectedExams.forEach(exam => {
            const examItem = document.createElement('div');
            examItem.className = 'selected-exam-item';
            examItem.dataset.examId = exam.id;
            
            examItem.innerHTML = `
                <div class="selected-exam-info">
                    <h4>${exam.title}</h4>
                    <div class="selected-exam-metadata">
                        <span class="exam-type">${formatTypeName(exam.type)}</span>
                        <span class="exam-questions">${exam.totalQuestions} questions</span>
                    </div>
                </div>
                <button class="btn-icon remove-exam" aria-label="Remove exam">
                    <i class="icon-close"></i>
                </button>
            `;
            
            // Add event listener for remove button
            examItem.querySelector('.remove-exam').addEventListener('click', function() {
                const examToRemove = availableExams.find(e => e.id === exam.id);
                if (examToRemove) {
                    toggleExamSelection(examToRemove);
                }
            });
            
            selectedExamsList.appendChild(examItem);
        });
        
        // Update the total questions count, estimated time, and selected exams count
        document.getElementById('total-questions-count').textContent = combinedQuestions.length;
        document.getElementById('estimated-time').textContent = `${calculateEstimatedTime()} minutes`;
        document.getElementById('selected-exams-count').textContent = selectedExams.length;
    }
    
    function updateCombinedQuestions() {
        // Combine all questions from selected exams
        combinedQuestions = [];
        
        selectedExams.forEach(exam => {
            combinedQuestions = combinedQuestions.concat(exam.questions);
        });
        
        console.log(`Combined ${combinedQuestions.length} questions from ${selectedExams.length} exams`);
    }
    
    function calculateEstimatedTime() {
        // Estimate time based on question count (about 1.5 minutes per question on average)
        return Math.max(10, Math.ceil(combinedQuestions.length * 1.5));
    }
    
    function updateExamInfoDisplay() {
        // Update the exam info section with details about the combined exam
        document.getElementById('info-total-questions').textContent = combinedQuestions.length;
        document.getElementById('info-estimated-time').textContent = `${calculateEstimatedTime()} minutes`;
        
        // Update question types
        const questionTypes = getUniqueQuestionTypes();
        document.getElementById('info-question-types').textContent = 
            questionTypes.length > 3 
                ? 'Multiple Categories' 
                : questionTypes.map(formatTypeName).join(', ');
        
        // Update title and descriptions
        const infoTitle = document.getElementById('exam-info-title');
        const infoDescription = document.getElementById('exam-info-description');
        const infoFullDescription = document.getElementById('exam-info-full-description');
        
        if (selectedExams.length === 1) {
            const exam = selectedExams[0];
            infoTitle.textContent = exam.title;
            infoDescription.textContent = exam.description || 'Custom exam with your selected questions.';
            infoFullDescription.textContent = `This exam contains ${exam.totalQuestions} questions of the ${formatTypeName(exam.type)} type.`;
        } else {
            infoTitle.textContent = 'Custom Combined Practice';
            infoDescription.textContent = `Custom combined exam with ${selectedExams.length} exams.`;
            infoFullDescription.textContent = `
                This custom exam combines ${combinedQuestions.length} questions from the ${selectedExams.length} exams you selected.
                Each question will be labeled with its category to help you track your performance across different skills.
            `;
        }
        
        // Update the question distribution
        updateDistributionGrid();
    }
    
    function getUniqueQuestionTypes() {
        // Get the unique question types from combined questions
        const types = new Set();
        combinedQuestions.forEach(question => {
            if (question.type) {
                types.add(question.type);
            }
        });
        return Array.from(types);
    }
    
    function updateDistributionGrid() {
        const distributionGrid = document.getElementById('distribution-grid');
        distributionGrid.innerHTML = '';
        
        // Count questions by type
        const typeCounts = {};
        combinedQuestions.forEach(question => {
            const type = question.type || 'unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        // Display each type in the grid
        for (const type in typeCounts) {
            if (typeCounts.hasOwnProperty(type)) {
                const distributionItem = document.createElement('div');
                distributionItem.className = 'distribution-item';
                
                distributionItem.innerHTML = `
                    <span class="question-type-indicator ${type}">${formatTypeName(type)}</span>
                    <span class="count">${typeCounts[type]} Questions</span>
                `;
                
                distributionGrid.appendChild(distributionItem);
            }
        }
    }
    
    function filterExams() {
        const typeFilter = document.getElementById('exam-type-filter').value;
        const difficultyFilter = document.getElementById('exam-difficulty-filter').value;
        
        // Filter available exams
        const filteredExams = availableExams.filter(exam => {
            const typeMatch = typeFilter === 'all' || exam.type === typeFilter;
            const difficultyMatch = difficultyFilter === 'all' || exam.difficulty === difficultyFilter;
            return typeMatch && difficultyMatch;
        });
        
        // Update UI to only show matching exams
        const examItems = availableExamsList.querySelectorAll('.exam-item');
        examItems.forEach(item => {
            const examId = item.dataset.examId;
            const isMatch = filteredExams.some(exam => exam.id === examId);
            item.style.display = isMatch ? 'flex' : 'none';
        });
        
        // Show message if no exams match the filters
        if (filteredExams.length === 0) {
            const noMatchMessage = document.createElement('p');
            noMatchMessage.className = 'no-exams-message';
            noMatchMessage.textContent = 'No exams match your filters. Try different criteria.';
            availableExamsList.appendChild(noMatchMessage);
        }
    }
    
    function formatTypeName(type) {
        // Format the type name for display
        if (!type) return 'Unknown';
        
        // Replace underscores with spaces and capitalize
        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // Sample exams data to use as fallback
    function getSampleExams() {
        return [
            {
                id: "sample_short_conversation",
                title: "Short Conversation Practice",
                type: "short_conversation",
                description: "Practice with short conversation questions",
                subtitle: "Sample short conversation",
                totalQuestions: 4,
                duration: 10,
                difficulty: "beginner",
                questions: [
                    {
                        id: "sc_1",
                        type: "short_conversation",
                        text: "Sample question 1",
                        subtitle: "Sample short conversation",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 0
                    },
                    {
                        id: "sc_2",
                        type: "short_conversation",
                        text: "Sample question 2",
                        subtitle: "Sample short conversation",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 1
                    },
                    {
                        id: "sc_3",
                        type: "short_conversation",
                        text: "Sample question 3",
                        subtitle: "Sample short conversation",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 2
                    },
                    {
                        id: "sc_4",
                        type: "short_conversation",
                        text: "Sample question 4",
                        subtitle: "Sample short conversation",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 3
                    }
                ]
            },
            {
                id: "sample_long_conversation",
                title: "Long Conversation Practice",
                type: "long_conversation",
                description: "Practice with long conversation questions",
                subtitle: "Sample long conversation",
                totalQuestions: 4,
                duration: 15,
                difficulty: "intermediate",
                questions: [
                    {
                        id: "lc_1",
                        type: "long_conversation",
                        text: "Sample question 1",
                        subtitle: "Sample long conversation",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 0
                    },
                    {
                        id: "lc_2",
                        type: "long_conversation",
                        text: "Sample question 2",
                        subtitle: "Sample long conversation",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 1
                    },
                    {
                        id: "lc_3",
                        type: "long_conversation",
                        text: "Sample question 3",
                        subtitle: "Sample long conversation",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 2
                    },
                    {
                        id: "lc_4",
                        type: "long_conversation",
                        text: "Sample question 4",
                        subtitle: "Sample long conversation",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 3
                    }
                ]
            },
            {
                id: "sample_article",
                title: "Article Reading Practice",
                type: "article",
                description: "Practice with article reading questions",
                subtitle: "Sample article",
                totalQuestions: 3,
                duration: 12,
                difficulty: "advanced",
                questions: [
                    {
                        id: "ar_1",
                        type: "article",
                        text: "Sample question 1",
                        subtitle: "Sample article",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 0
                    },
                    {
                        id: "ar_2",
                        type: "article",
                        text: "Sample question 2",
                        subtitle: "Sample article",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 1
                    },
                    {
                        id: "ar_3",
                        type: "article",
                        text: "Sample question 3",
                        subtitle: "Sample article",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: 2
                    }
                ]
            }
        ];
    }
    
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
                id: "custom-combined-exam",
                title: "Custom Combined Exam",
                description: "A comprehensive practice test covering selected question types",
                subtitle: "This exam tests selected skills and question types.",
                duration: calculateEstimatedTime(),
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
            startExamTimer();
            
            // Load first question
            loadQuestion(0);
            
            // Listen for exam submission
            document.getElementById('submit-exam').addEventListener('click', function() {
                if (confirm('Are you sure you want to submit your answers?')) {
                    submitExam();
                }
            });
            
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
        // Check if a subtitle container already exists
        let subtitleContainer = document.querySelector('.exam-subtitle');
        if (!subtitleContainer) {
            // Create a new subtitle container
            subtitleContainer = document.createElement('p');
            subtitleContainer.className = 'exam-subtitle';
            
            // Insert after the exam title
            const examTitleContainer = document.querySelector('.exam-title-container');
            if (examTitleContainer) {
                examTitleContainer.appendChild(subtitleContainer);
            }
        }
        
        // Set the subtitle text
        subtitleContainer.textContent = subtitleText;
    }
    
    // Set up navigation handlers
    function setupNavigationHandlers() {
        const prevButton = document.getElementById('prev-question');
        const nextButton = document.getElementById('next-question');
        
        // Previous button
        prevButton.addEventListener('click', function() {
            saveCurrentAnswer();
            
            const currentIndex = window.currentQuestionIndex;
            if (currentIndex > 0) {
                loadQuestion(currentIndex - 1);
            }
        });
        
        // Next button
        nextButton.addEventListener('click', function() {
            saveCurrentAnswer();
            
            const currentIndex = window.currentQuestionIndex;
            const totalQuestions = window.currentExam.questions.length;
            
            if (currentIndex < totalQuestions - 1) {
                loadQuestion(currentIndex + 1);
            }
        });
        
        // Add keyboard navigation
        document.addEventListener('keydown', function(event) {
            // Only handle keyboard navigation when exam is active
            if (examContentSection.classList.contains('hidden')) {
                return;
            }
            
            // Left arrow -> Previous question
            if (event.key === 'ArrowLeft' && !prevButton.disabled) {
                prevButton.click();
            }
            
            // Right arrow -> Next question
            if (event.key === 'ArrowRight' && !nextButton.disabled) {
                nextButton.click();
            }
            
            // Number keys 1-4 -> Select options A-D
            if (['1', '2', '3', '4'].includes(event.key)) {
                const optionIndex = parseInt(event.key) - 1;
                const optionButtons = document.querySelectorAll('.option-button');
                
                if (optionButtons && optionButtons.length > optionIndex) {
                    optionButtons[optionIndex].click();
                }
            }
        });
    }
    
    // Save the current answer
    function saveCurrentAnswer() {
        const selectedOption = document.querySelector('.option-button.selected');
        if (selectedOption) {
            const optionIndex = parseInt(selectedOption.dataset.index);
            window.userAnswers[window.currentQuestionIndex] = optionIndex;
            
            // Mark this question as answered in the jump menu
            updateQuestionStatusIndicator(window.currentQuestionIndex);
        }
    }
    
    // Load a question by index
    function loadQuestion(index) {
        const examQuestions = document.getElementById('exam-questions');
        const questions = window.currentExam.questions;
        
        // Validate index
        if (index < 0 || index >= questions.length) {
            console.error(`Invalid question index: ${index}`);
            return;
        }
        
        // Update current question index
        window.currentQuestionIndex = index;
        
        // Get the question at this index
        const question = questions[index];
        
        // Clear previous question content
        examQuestions.innerHTML = '';
        
        // Create question container
        const questionContainer = document.createElement('div');
        questionContainer.className = 'question-container';
        questionContainer.id = `question-${index}`;
        questionContainer.dataset.questionId = question.id;
        questionContainer.dataset.questionType = question.type;
        
        // Add question type indicator
        const typeIndicator = document.createElement('div');
        typeIndicator.className = `question-type-indicator ${question.type}`;
        typeIndicator.textContent = formatTypeName(question.type);
        questionContainer.appendChild(typeIndicator);
        
        // Add exam source indication if from multiple exams
        if (selectedExams.length > 1) {
            const examSource = document.createElement('div');
            examSource.className = 'exam-source';
            examSource.textContent = `From: ${question.examTitle || 'Unknown Exam'}`;
            questionContainer.appendChild(examSource);
        }
        
        // Add question subtitle if available
        if (question.subtitle && question.subtitle.trim()) {
            const subtitle = document.createElement('div');
            subtitle.className = 'question-subtitle';
            
            // Format the subtitle based on question type
            addFormattedSubtitle(subtitle, question.subtitle, question.type);
            
            questionContainer.appendChild(subtitle);
        }
        
        // Add question prompt text if available
        if (question.text && question.text.trim()) {
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = question.text;
            questionContainer.appendChild(questionText);
        }
        
        // Add question prompt if available
        if (question.prompt && question.prompt.trim()) {
            const questionPrompt = document.createElement('div');
            questionPrompt.className = 'question-prompt';
            questionPrompt.textContent = question.prompt;
            questionContainer.appendChild(questionPrompt);
        }
        
        // Add image if available
        if (question.image) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'question-image-container';
            
            const image = document.createElement('img');
            image.src = question.image;
            image.alt = 'Question image';
            image.className = 'question-image';
            
            imageContainer.appendChild(image);
            questionContainer.appendChild(imageContainer);
        }
        
        // Add options
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';
        
        // Ensure options exist
        const options = question.options || ['No option A', 'No option B', 'No option C', 'No option D'];
        
        options.forEach((option, optionIndex) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'option-button';
            optionButton.dataset.index = optionIndex;
            
            // Check if this option was previously selected
            if (window.userAnswers[index] === optionIndex) {
                optionButton.classList.add('selected');
            }
            
            // Create option label (A, B, C, D)
            const optionLabel = document.createElement('span');
            optionLabel.className = 'option-label';
            optionLabel.textContent = String.fromCharCode(65 + optionIndex); // A, B, C, D
            
            // Create option text
            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = option;
            
            // Add label and text to button
            optionButton.appendChild(optionLabel);
            optionButton.appendChild(optionText);
            
            // Add click handler
            optionButton.addEventListener('click', function() {
                // Remove selected class from all options
                optionsContainer.querySelectorAll('.option-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Add selected class to this option
                optionButton.classList.add('selected');
                
                // Save the answer
                window.userAnswers[index] = optionIndex;
                
                // Update question status
                updateQuestionStatusIndicator(index);
            });
            
            optionsContainer.appendChild(optionButton);
        });
        
        questionContainer.appendChild(optionsContainer);
        
        // Add the question container to the page
        examQuestions.appendChild(questionContainer);
        
        // Update progress indicators
        updateProgressIndicators(index);
        
        // Update navigation buttons
        setupNavigationButtons(index);
        
        // Add question number and total
        addQuestionProgressText(questionContainer, index + 1, questions.length);
    }
    
    // Update progress indicators
    function updateProgressIndicators(index) {
        // Update current question number
        const currentQuestionElement = document.getElementById('current-question');
        if (currentQuestionElement) {
            currentQuestionElement.textContent = (index + 1).toString();
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        const totalQuestions = window.currentExam.questions.length;
        
        if (progressFill && totalQuestions > 0) {
            const progressPercent = ((index + 1) / totalQuestions) * 100;
            progressFill.style.width = `${progressPercent}%`;
        }
    }
    
    // Setup navigation buttons (prev/next/submit)
    function setupNavigationButtons(index) {
        const prevButton = document.getElementById('prev-question');
        const nextButton = document.getElementById('next-question');
        const submitButton = document.getElementById('submit-exam');
        
        const totalQuestions = window.currentExam.questions.length;
        
        // Previous button should be disabled on first question
        prevButton.disabled = index === 0;
        
        // Next button should be disabled on last question
        nextButton.disabled = index === totalQuestions - 1;
        
        // Show submit button prominently on last question
        if (index === totalQuestions - 1) {
            submitButton.classList.add('submit-visible');
        } else {
            submitButton.classList.remove('submit-visible');
        }
    }
    
    // Update the status indicator for a question
    function updateQuestionStatusIndicator(index) {
        const isAnswered = window.userAnswers[index] !== null;
        
        // Update any question indicators we've created
        const indicators = document.querySelectorAll(`.question-indicator[data-index="${index}"]`);
        indicators.forEach(indicator => {
            if (isAnswered) {
                indicator.classList.add('answered');
                indicator.classList.remove('unanswered');
            } else {
                indicator.classList.add('unanswered');
                indicator.classList.remove('answered');
            }
        });
    }
    
    // Submit the exam and show results
    function submitExam() {
        // Stop the timer
        stopExamTimer();
        
        // Calculate results
        const results = calculateResults();
        
        // Update the results display
        updateResultsDisplay(results);
        
        // Hide exam content and show results
        examContentSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Save results to progress tracker if available
        if (typeof saveToProgressTracker === 'function') {
            saveToProgressTracker(results);
        }
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('examSubmitted', { detail: results }));
    }
    
    // Calculate the results of the exam
    function calculateResults() {
        const questions = window.currentExam.questions;
        const answers = window.userAnswers;
        
        // Track correct answers and skill scores
        const result = {
            totalQuestions: questions.length,
            correctCount: 0,
            incorrectCount: 0,
            unansweredCount: 0,
            timeTaken: elapsedSeconds,
            skills: {
                reading: { correct: 0, total: 0 },
                writing: { correct: 0, total: 0 },
                speaking: { correct: 0, total: 0 }
            },
            types: {},
            questionResults: []
        };
        
        // Process each question
        questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const correctAnswer = question.correctAnswer;
            const isCorrect = userAnswer === correctAnswer;
            const isAnswered = userAnswer !== null;
            
            // Record question result
            const questionResult = {
                id: question.id,
                index: index,
                type: question.type,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                isAnswered: isAnswered
            };
            
            result.questionResults.push(questionResult);
            
            // Update counts
            if (!isAnswered) {
                result.unansweredCount++;
            } else if (isCorrect) {
                result.correctCount++;
            } else {
                result.incorrectCount++;
            }
            
            // Update skill counts
            const skill = determineSkill(question.type);
            result.skills[skill].total++;
            
            if (isCorrect) {
                result.skills[skill].correct++;
            }
            
            // Update type counts
            const type = question.type || 'unknown';
            if (!result.types[type]) {
                result.types[type] = { correct: 0, total: 0 };
            }
            
            result.types[type].total++;
            
            if (isCorrect) {
                result.types[type].correct++;
            }
        });
        
        // Calculate overall score
        result.score = Math.round((result.correctCount / result.totalQuestions) * 100);
        
        // Calculate skill scores
        for (const skill in result.skills) {
            const skillData = result.skills[skill];
            skillData.score = skillData.total > 0 
                ? Math.round((skillData.correct / skillData.total) * 100) 
                : 0;
        }
        
        // Calculate type scores
        for (const type in result.types) {
            const typeData = result.types[type];
            typeData.score = typeData.total > 0 
                ? Math.round((typeData.correct / typeData.total) * 100) 
                : 0;
        }
        
        return result;
    }
    
    // Determine which skill a question type belongs to
    function determineSkill(type) {
        if (!type) return 'reading';
        
        switch (type) {
            case 'short_conversation':
            case 'long_conversation':
                return 'speaking';
            case 'text_completion':
            case 'paragraph':
                return 'writing';
            case 'advertisement':
            case 'product':
            case 'news_report':
            case 'article':
            default:
                return 'reading';
        }
    }
    
    // Update the results display
    function updateResultsDisplay(results) {
        // Update overall score
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `${results.score}%`;
        }
        
        // Update score path for circle animation
        const scorePath = document.getElementById('score-path');
        if (scorePath) {
            // Calculate the arc length for the score percentage
            const circumference = 2 * Math.PI * 15.9155;
            const arcLength = (circumference * (100 - results.score)) / 100;
            scorePath.style.strokeDasharray = `${circumference} ${circumference}`;
            scorePath.style.strokeDashoffset = arcLength;
        }
        
        // Update correct count and total questions
        const correctCountElement = document.getElementById('correct-count');
        const totalQuestionsElement = document.getElementById('total-questions');
        
        if (correctCountElement && totalQuestionsElement) {
            correctCountElement.textContent = results.correctCount;
            totalQuestionsElement.textContent = results.totalQuestions;
        }
        
        // Update performance text
        const performanceTextElement = document.getElementById('performance-text');
        if (performanceTextElement) {
            let performanceText = 'Needs Improvement';
            
            if (results.score >= 90) {
                performanceText = 'Excellent';
            } else if (results.score >= 80) {
                performanceText = 'Very Good';
            } else if (results.score >= 70) {
                performanceText = 'Good';
            } else if (results.score >= 60) {
                performanceText = 'Fair';
            }
            
            performanceTextElement.textContent = performanceText;
        }
        
        // Update skill scores
        for (const skill in results.skills) {
            const skillData = results.skills[skill];
            
            // Update skill score percentage
            const skillScoreElement = document.getElementById(`${skill}-score`);
            if (skillScoreElement) {
                skillScoreElement.textContent = `${skillData.score}%`;
            }
            
            // Update skill score path
            const skillScorePath = document.getElementById(`${skill}-score-path`);
            if (skillScorePath) {
                // Calculate the arc length for the skill score percentage
                const circumference = 2 * Math.PI * 15.9155;
                const arcLength = (circumference * (100 - skillData.score)) / 100;
                skillScorePath.style.strokeDasharray = `${circumference} ${circumference}`;
                skillScorePath.style.strokeDashoffset = arcLength;
            }
            
            // Update skill correct/total count
            const skillCorrectElement = document.getElementById(`${skill}-correct`);
            const skillTotalElement = document.getElementById(`${skill}-total`);
            
            if (skillCorrectElement && skillTotalElement) {
                skillCorrectElement.textContent = skillData.correct;
                skillTotalElement.textContent = skillData.total;
            }
        }
        
        // Update type scores
        updateTypeScores(results);
        
        // Add detailed feedback
        addDetailedFeedback(results.questionResults);
    }
    
    // Update the type scores in the results
    function updateTypeScores(results) {
        // Get the breakdown list container
        const typeBreakdownList = document.getElementById('type-breakdown-list');
        if (!typeBreakdownList) return;
        
        // Clear existing items
        typeBreakdownList.innerHTML = '';
        
        // Add each type to the breakdown
        for (const type in results.types) {
            const typeData = results.types[type];
            
            const typeItem = document.createElement('div');
            typeItem.className = 'type-breakdown-item';
            
            typeItem.innerHTML = `
                <span class="type-name">${formatTypeName(type)}</span>
                <span class="type-score" id="${type.replace(/_/g, '-')}-score">${typeData.correct}/${typeData.total}</span>
            `;
            
            typeBreakdownList.appendChild(typeItem);
        }
    }
    
    // Add detailed feedback for each question
    function addDetailedFeedback(questionResults) {
        const feedbackList = document.querySelector('.feedback-list');
        if (!feedbackList) return;
        
        // Clear existing feedback
        feedbackList.innerHTML = '';
        
        // Add feedback for each question
        questionResults.forEach(result => {
            const question = window.currentExam.questions[result.index];
            if (!question) return;
            
            const feedbackItem = document.createElement('div');
            feedbackItem.className = `feedback-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
            
            // Get the selected option text and correct option text
            const options = question.options || [];
            const userOptionText = result.isAnswered && options[result.userAnswer] 
                ? options[result.userAnswer] 
                : 'Not answered';
            
            const correctOptionText = options[result.correctAnswer] || 'Unknown';
            
            feedbackItem.innerHTML = `
                <div class="feedback-question">
                    <span class="question-number">Question ${result.index + 1}:</span>
                    <span class="question-type">${formatTypeName(result.type)}</span>
                    ${question.text ? `<p class="question-text">${question.text}</p>` : ''}
                </div>
                <div class="feedback-answer">
                    <div class="user-answer ${result.isAnswered ? (result.isCorrect ? 'correct' : 'incorrect') : 'unanswered'}">
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
        
        // Add toggle for feedback visibility
        document.getElementById('view-feedback').addEventListener('click', function() {
            const feedbackContainer = document.getElementById('feedback');
            if (feedbackContainer) {
                feedbackContainer.classList.toggle('hidden');
                this.textContent = feedbackContainer.classList.contains('hidden') 
                    ? 'View Detailed Feedback' 
                    : 'Hide Detailed Feedback';
            }
        });
    }
    
    // Add question progress text
    function addQuestionProgressText(container, currentQuestionNum, totalQuestions) {
        const progressText = document.createElement('div');
        progressText.className = 'question-progress-text';
        progressText.textContent = `Question ${currentQuestionNum} of ${totalQuestions}`;
        container.prepend(progressText);
    }
    
    // Format subtitle based on question type
    function addFormattedSubtitle(container, subtitle, type) {
        if (!subtitle || !subtitle.trim()) {
            return;
        }
        
        // Call the appropriate formatting function based on question type
        switch (type) {
            case 'short_conversation':
            case 'long_conversation':
                formatConversation(container, subtitle);
                break;
                
            case 'advertisement':
            case 'product':
                formatAdvertisementProduct(container, subtitle, type);
                break;
                
            case 'news_report':
            case 'article':
                formatArticleNewsReport(container, subtitle);
                break;
                
            case 'text_completion':
                formatTextCompletion(container, subtitle);
                break;
                
            case 'paragraph':
                formatParagraph(container, subtitle);
                break;
                
            default:
                // Default formatting for unknown types
                container.textContent = subtitle;
                break;
        }
    }
    
    // Format conversation subtitles
    function formatConversation(container, subtitle) {
        // Split the content by newlines
        const lines = subtitle.split('\n');
        
        // Create a styled container for the conversation
        const conversationContainer = document.createElement('div');
        conversationContainer.className = 'conversation-container';
        
        // Process each line
        let currentSpeaker = '';
        let currentDialogue = document.createElement('div');
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                // Skip empty lines
                return;
            }
            
            // Check if line starts with a speaker name (Name: dialogue)
            const speakerMatch = trimmedLine.match(/^([^:]+):(.*)/);
            
            if (speakerMatch) {
                // New speaker
                const speaker = speakerMatch[1].trim();
                const dialogue = speakerMatch[2].trim();
                
                if (speaker !== currentSpeaker) {
                    // Create new dialogue entry for new speaker
                    currentSpeaker = speaker;
                    currentDialogue = document.createElement('div');
                    currentDialogue.className = 'dialogue-entry';
                    
                    const speakerElem = document.createElement('span');
                    speakerElem.className = 'speaker';
                    speakerElem.textContent = speaker + ':';
                    
                    currentDialogue.appendChild(speakerElem);
                    conversationContainer.appendChild(currentDialogue);
                }
                
                // Add dialogue text
                const dialogueText = document.createElement('span');
                dialogueText.className = 'dialogue';
                dialogueText.textContent = dialogue;
                currentDialogue.appendChild(document.createElement('br'));
                currentDialogue.appendChild(dialogueText);
            } else {
                // Regular text (might be a title or instruction)
                const textElem = document.createElement('div');
                textElem.className = 'conversation-text';
                textElem.textContent = trimmedLine;
                conversationContainer.appendChild(textElem);
            }
        });
        
        // Add the formatted conversation to the container
        container.appendChild(conversationContainer);
        
        // Highlight blanks in the conversation
        highlightBlanks(container);
    }
    
    // Format advertisement and product subtitles
    function formatAdvertisementProduct(container, subtitle, type) {
        // Create a styled container for the advertisement or product
        const adContainer = document.createElement('div');
        adContainer.className = `${type}-container`;
        
        // Set the content
        adContainer.innerHTML = subtitle.replace(/\n/g, '<br>');
        
        // Add the formatted content to the container
        container.appendChild(adContainer);
        
        // Highlight blanks
        highlightBlanks(container);
    }
    
    // Format article and news report subtitles
    function formatArticleNewsReport(container, subtitle) {
        // Create a styled container for the article or news report
        const articleContainer = document.createElement('div');
        articleContainer.className = 'article-container';
        
        // Set the content
        articleContainer.innerHTML = subtitle.replace(/\n/g, '<br>');
        
        // Add the formatted content to the container
        container.appendChild(articleContainer);
        
        // Highlight blanks
        highlightBlanks(container);
    }
    
    // Format text completion subtitles
    function formatTextCompletion(container, subtitle) {
        // Create a styled container for the text completion
        const completionContainer = document.createElement('div');
        completionContainer.className = 'completion-container';
        
        // Set the content
        completionContainer.innerHTML = subtitle.replace(/\n/g, '<br>');
        
        // Add the formatted content to the container
        container.appendChild(completionContainer);
        
        // Highlight blanks
        highlightBlanks(container);
    }
    
    // Format paragraph subtitles
    function formatParagraph(container, subtitle) {
        // Create a styled container for the paragraph
        const paragraphContainer = document.createElement('div');
        paragraphContainer.className = 'paragraph-container';
        
        // Set the content
        paragraphContainer.innerHTML = subtitle.replace(/\n/g, '<br>');
        
        // Add the formatted content to the container
        container.appendChild(paragraphContainer);
        
        // Highlight blanks
        highlightBlanks(container);
    }
    
    // Highlight blanks in text
    function highlightBlanks(container) {
        // Find all text nodes in the container
        const textNodes = getTextNodes(container);
        
        // Regex patterns for different blank formats
        const blankPatterns = [
            { pattern: /_+\(\d+\)_+/g, className: 'blank-underline-numbered' },  // _____(1)____
            { pattern: /_+\(\d+\)/g, className: 'blank-underline-numbered' },     // _____(1)
            { pattern: /\(\d+\)_+/g, className: 'blank-underline-numbered' },     // (1)_____
            { pattern: /___(.*?)___/g, className: 'blank-underline' },           // ___text___
            { pattern: /_{3,}/g, className: 'blank-underline' },                 // _______
            { pattern: /\[\.\.\.\]/g, className: 'blank-brackets' },             // [...]
            { pattern: /\[blank\]/gi, className: 'blank-explicit' },             // [blank]
            { pattern: /\(\s*blank\s*\)/gi, className: 'blank-explicit' }        // (blank)
        ];
        
        // Process each text node
        textNodes.forEach(node => {
            const parent = node.parentNode;
            let html = node.nodeValue;
            let modified = false;
            
            // Apply each pattern
            blankPatterns.forEach(({ pattern, className }) => {
                if (pattern.test(html)) {
                    html = html.replace(pattern, match => 
                        `<span class="blank ${className}">${match}</span>`);
                    modified = true;
                }
            });
            
            // Replace the text node with the highlighted HTML if modified
            if (modified) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                
                while (tempDiv.firstChild) {
                    parent.insertBefore(tempDiv.firstChild, node);
                }
                
                parent.removeChild(node);
            }
        });
    }
    
    // Get all text nodes in an element
    function getTextNodes(node) {
        const textNodes = [];
        function findTextNodes(node) {
            if (node.nodeType === 3) {
                textNodes.push(node);
            } else if (node.nodeType === 1) {
                for (let child of node.childNodes) {
                    findTextNodes(child);
                }
            }
        }
        findTextNodes(node);
        return textNodes;
    }
    
    // Add type indicators
    function addTypeIndicators() {
        const questionContainer = document.querySelector('.question-container');
        if (!questionContainer) return;
        
        const type = questionContainer.dataset.questionType;
        const typeIndicator = questionContainer.querySelector('.question-type-indicator');
        
        if (!typeIndicator && type) {
            addTypeIndicator(questionContainer, type);
        }
    }
    
    // Add a type indicator
    function addTypeIndicator(container, type) {
        const existingIndicator = container.querySelector('.question-type-indicator');
        if (existingIndicator) return;
        
        const indicator = document.createElement('div');
        indicator.className = `question-type-indicator ${type}`;
        indicator.textContent = formatTypeName(type);
        
        container.prepend(indicator);
    }
    
    // Add navigation elements
    function addNavigationElements() {
        // Add question jump menu if there are multiple questions
        createQuestionJumpMenu();
    }
    
    // Create a jump menu for quick navigation between questions
    function createQuestionJumpMenu() {
        const examContent = document.getElementById('exam-content');
        if (!examContent) return;
        
        // Check if jump menu already exists
        let jumpMenu = document.querySelector('.question-jump-menu');
        if (jumpMenu) {
            // Clear existing menu
            jumpMenu.innerHTML = '';
        } else {
            // Create new menu
            jumpMenu = document.createElement('div');
            jumpMenu.className = 'question-jump-menu hidden';
            examContent.appendChild(jumpMenu);
            
            // Add toggle button
            const toggleButton = document.createElement('button');
            toggleButton.className = 'btn-icon jump-menu-toggle';
            toggleButton.setAttribute('aria-label', 'Toggle question navigation');
            toggleButton.innerHTML = '<i class="icon-menu"></i>';
            toggleButton.addEventListener('click', toggleQuestionJumpMenu);
            examContent.appendChild(toggleButton);
        }
        
        // Get total questions
        const totalQuestions = window.currentExam.questions.length;
        
        // Don't show for very few questions
        if (totalQuestions <= 5) {
            return;
        }
        
        // Create indicators for each question
        for (let i = 0; i < totalQuestions; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'question-indicator';
            indicator.dataset.index = i;
            
            // If the question is answered, add the answered class
            if (window.userAnswers[i] !== null) {
                indicator.classList.add('answered');
            } else {
                indicator.classList.add('unanswered');
            }
            
            // If this is the current question, add the current class
            if (i === window.currentQuestionIndex) {
                indicator.classList.add('current');
            }
            
            // Add question number
            indicator.textContent = i + 1;
            
            // Add click handler
            indicator.addEventListener('click', function() {
                saveCurrentAnswer();
                loadQuestion(i);
                toggleQuestionJumpMenu();
            });
            
            jumpMenu.appendChild(indicator);
        }
    }
    
    // Toggle the question jump menu
    function toggleQuestionJumpMenu() {
        const jumpMenu = document.querySelector('.question-jump-menu');
        if (jumpMenu) {
            jumpMenu.classList.toggle('hidden');
            updateJumpMenuStatuses();
        }
    }
}); 