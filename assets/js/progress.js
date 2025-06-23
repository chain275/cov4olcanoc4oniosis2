// TCAS Prep Progress Tracker
// Wrapped in IIFE to prevent variable conflicts
(function() {
    'use strict';
    
    // Log when this script loads
    console.log('Progress.js loaded - version 1.0');
    
    // Global variables
    let examHistory = [];
    let filteredHistory = [];
    let progressChartInstance = null;
    let skillsRadarChartInstance = null;
    let examTypeChartInstance = null;
    let timeAnalysisChartInstance = null;
    let currentPage = 1;
    let itemsPerPage = 10;
    let showTrendline = false;
    let currentChartType = 'line';
    
    // DOM Element references
    let progressChart, examTypeFilter, timePeriodFilter, resetFiltersBtn;
    let totalExamsElement, averageScoreElement, highestScoreElement, recentScoreElement, lastExamDateElement;
    let readingScoreElement, readingScorePath, writingScoreElement, writingScorePath, speakingScoreElement, speakingScorePath;
    let examHistoryBody, historySearchInput, historySortSelect, prevPageBtn, nextPageBtn, pageInfoElement;
    let chartTypeSelect, toggleTrendBtn;
    let dashboardNavItems, dashboardTabs;
    let skillsRadarChart, examTypeChart, timeAnalysisChart;
    let readingDetailScore, writingDetailScore, speakingDetailScore, readingFill, writingFill, speakingFill;
    let trendTextElement, strongestSkillTextElement, weakestSkillTextElement, consistencyTextElement, recommendationsListElement;
    
    // Immediately expose saveExamResult function to window to ensure it's available
    // Function to save a new exam result with compressed data format
    function saveExamResult(examData) {
        console.log('Saving exam result (compressed):', examData);
        
        // Validate compressed exam data
        if (!examData || !examData.d || !examData.t || !examData.s) {
            console.error('Invalid compressed exam data provided to saveExamResult:', examData);
            return false;
        }
        
        // Ensure skills array exists
        if (!examData.sk) {
            examData.sk = [0, 0, 0]; // [reading, writing, speaking]
        }
        
        // Load current history
        const storedHistory = localStorage.getItem('examHistory');
        let currentHistory = storedHistory ? JSON.parse(storedHistory) : [];
        
        // Add new exam record
        currentHistory.unshift(examData);
        
        // Save updated history
        try {
            localStorage.setItem('examHistory', JSON.stringify(currentHistory));
            console.log('Compressed exam result saved successfully');
            return true;
        } catch (e) {
            console.error('Error saving compressed exam result to localStorage:', e);
            return false;
        }
    }
    
    // Immediately expose to window
    window.saveExamResult = saveExamResult;
    
    // Try to register Chart.js plugins if available
    if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
        try {
            Chart.register(ChartDataLabels);
            console.log("ChartDataLabels plugin registered successfully");
        } catch (e) {
            console.error("Failed to register ChartDataLabels plugin:", e);
        }
    }
    
    // Initialize the page when DOM is loaded
    document.addEventListener('DOMContentLoaded', initialize);
    
    // Main initialization function
    function initialize() {
        console.log('Progress Tracker initializing...');
        
        // Initialize DOM element references
        initializeDomReferences();
        
        // Load user's exam history
        loadExamHistory();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Progress Tracker initialized');
    }
    
    // Initialize all DOM element references
    function initializeDomReferences() {
        // Main elements
        progressChart = document.getElementById('progressChart');
        examTypeFilter = document.getElementById('exam-type-filter');
        timePeriodFilter = document.getElementById('time-period-filter');
        resetFiltersBtn = document.getElementById('reset-filters');
        totalExamsElement = document.getElementById('total-exams');
        averageScoreElement = document.getElementById('average-score');
        highestScoreElement = document.getElementById('highest-score');
        recentScoreElement = document.getElementById('recent-score');
        lastExamDateElement = document.getElementById('last-exam-date');
        
        // Skill chart elements
        readingScoreElement = document.getElementById('reading-score');
        readingScorePath = document.getElementById('reading-score-path');
        writingScoreElement = document.getElementById('writing-score');
        writingScorePath = document.getElementById('writing-score-path');
        speakingScoreElement = document.getElementById('speaking-score');
        speakingScorePath = document.getElementById('speaking-score-path');
        
        // Table elements
        examHistoryBody = document.getElementById('exam-history-body');
        historySearchInput = document.getElementById('history-search');
        historySortSelect = document.getElementById('history-sort');
        prevPageBtn = document.getElementById('prev-page');
        nextPageBtn = document.getElementById('next-page');
        pageInfoElement = document.getElementById('page-info');
        
        // Chart controls
        chartTypeSelect = document.getElementById('chart-type');
        toggleTrendBtn = document.getElementById('toggle-trend');
        
        // Tab navigation
        dashboardNavItems = document.querySelectorAll('.dashboard-nav-item');
        dashboardTabs = document.querySelectorAll('.dashboard-tab');
        
        // Additional charts
        skillsRadarChart = document.getElementById('skillsRadarChart');
        examTypeChart = document.getElementById('examTypeChart');
        timeAnalysisChart = document.getElementById('timeAnalysisChart');
        
        // Skill details
        readingDetailScore = document.getElementById('reading-detail-score');
        writingDetailScore = document.getElementById('writing-detail-score');
        speakingDetailScore = document.getElementById('speaking-detail-score');
        readingFill = document.querySelector('.reading-fill');
        writingFill = document.querySelector('.writing-fill');
        speakingFill = document.querySelector('.speaking-fill');
        
        // Insight elements
        trendTextElement = document.getElementById('trend-text');
        strongestSkillTextElement = document.getElementById('strongest-skill-text');
        weakestSkillTextElement = document.getElementById('weakest-skill-text');
        consistencyTextElement = document.getElementById('consistency-text');
        recommendationsListElement = document.getElementById('recommendations-list');
        
        // Log any missing critical elements
        if (!progressChart) console.warn('progressChart element not found');
        if (!examTypeFilter) console.warn('examTypeFilter element not found');
        if (!timePeriodFilter) console.warn('timePeriodFilter element not found');
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Filter event listeners
        if (examTypeFilter) examTypeFilter.addEventListener('change', updateData);
        if (timePeriodFilter) timePeriodFilter.addEventListener('change', updateData);
        if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);
        
        // Add keyboard shortcut for generating sample data (Ctrl+G)
        document.addEventListener('keydown', function(event) {
            // Check if Ctrl+G is pressed
            if (event.ctrlKey && event.key === 'g') {
                event.preventDefault(); // Prevent default browser action
                generateFullSampleData();
            }
        });
        
        // Chart control listeners
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', (e) => {
                currentChartType = e.target.value;
                updateChart(filteredHistory);
            });
        }
        
        // Export data button
        const exportDataBtn = document.getElementById('export-data');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', exportProgressData);
        }
        
        if (toggleTrendBtn) {
            toggleTrendBtn.addEventListener('click', () => {
                showTrendline = !showTrendline;
                toggleTrendBtn.innerHTML = showTrendline 
                    ? '<i class="fas fa-chart-line"></i> Hide Trend'
                    : '<i class="fas fa-chart-line"></i> Show Trend';
                updateChart(filteredHistory);
            });
        }
        
        // Table control listeners
        if (historySearchInput) historySearchInput.addEventListener('input', updateHistoryTable);
        if (historySortSelect) historySortSelect.addEventListener('change', updateHistoryTable);
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateHistoryTable();
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updateHistoryTable();
                }
            });
        }
        
        // Tab navigation
        dashboardNavItems.forEach(item => {
            if (!item) return;
            
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                if (!tabId) return;
                
                const targetTab = document.getElementById(`${tabId}-tab`);
                if (!targetTab) {
                    console.warn(`Tab with id ${tabId}-tab not found`);
                    return;
                }
                
                // Update active classes
                dashboardNavItems.forEach(navItem => navItem.classList.remove('active'));
                dashboardTabs.forEach(tab => tab.classList.remove('active'));
                
                item.classList.add('active');
                targetTab.classList.add('active');
                
                // Initialize specific tab content if needed
                if (tabId === 'skills') {
                    updateSkillsAnalysis(filteredHistory);
                } else if (tabId === 'insights') {
                    updateInsights(filteredHistory);
                }
            });
        });
    }

    // Reset filters to default values
    function resetFilters() {
        examTypeFilter.value = 'all';
        timePeriodFilter.value = 'all';
        updateData();
    }

    // Load exam history from localStorage
    function loadExamHistory() {
        const storedHistory = localStorage.getItem('examHistory');
        examHistory = storedHistory ? JSON.parse(storedHistory) : generateSampleData();
        
        // Save the history back to localStorage (only if we generated sample data)
        if (!storedHistory) {
            localStorage.setItem('examHistory', JSON.stringify(examHistory));
        }
        
        // Update the UI with the data
        updateData();
    }

    // Update all data based on filters
    function updateData() {
        const examType = examTypeFilter.value;
        const timePeriod = timePeriodFilter.value;
        
        // Apply filters to get the filtered data
        filteredHistory = filterExamHistory(examType, timePeriod);
        
        // Update the summary statistics
        updateStatistics(filteredHistory);
        
        // Update the main chart
        updateChart(filteredHistory);
        
        // Update the exam history table
        currentPage = 1; // Reset to first page when filters change
        updateHistoryTable();
        
        // Update skills analysis if that tab is active
        if (document.getElementById('skills-tab').classList.contains('active')) {
            updateSkillsAnalysis(filteredHistory);
        }
        
        // Update insights if that tab is active
        if (document.getElementById('insights-tab').classList.contains('active')) {
            updateInsights(filteredHistory);
        }
    }

    // Filter exam history based on selected filters using compressed data format
    function filterExamHistory(examType, timePeriod) {
        let filtered = [...examHistory];
        
        // Filter by exam type (t = examType)
        if (examType === 'all') {
            // For "All Exam Types," exclude mock exams (combined_exam and Visual)
            filtered = filtered.filter(exam => exam.t !== 'combined_exam');
        } else {
            filtered = filtered.filter(exam => exam.t === examType);
        }
        
        // Filter by time period (d = date)
        if (timePeriod !== 'all') {
            const now = new Date();
            let days = 0;
            
            switch(timePeriod) {
                case '7days':
                    days = 7;
                    break;
                case '30days':
                    days = 30;
                    break;
                case '90days':
                    days = 90;
                    break;
            }
            
            const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
            filtered = filtered.filter(exam => new Date(exam.d) >= cutoffDate);
        }
        
        // Sort by date (newest first) by default
        filtered.sort((a, b) => new Date(b.d) - new Date(a.d));
        
        return filtered;
    }

    // Update summary statistics using compressed data format
    function updateStatistics(data) {
        if (data.length === 0) {
            totalExamsElement.textContent = '0';
            averageScoreElement.textContent = '0%';
            highestScoreElement.textContent = '0%';
            recentScoreElement.textContent = '0%';
            lastExamDateElement.textContent = '--';
            
            // Update skill charts with zeros
            updateSkillCharts(0, 0, 0);
            return;
        }
        
        // Calculate statistics from compressed data
        const totalExams = data.length;
        const totalScore = data.reduce((sum, exam) => sum + exam.s, 0);
        const averageScore = Math.round(totalScore / totalExams);
        const highestScore = Math.max(...data.map(exam => exam.s));
        const recentScore = data[0].s; // First item is most recent due to sorting
        
        // Format the last exam date
        const lastExamDate = new Date(data[0].d);
        const lastExamDateFormatted = lastExamDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
        
        // Update stats on the page
        totalExamsElement.textContent = totalExams;
        averageScoreElement.textContent = `${averageScore}%`;
        highestScoreElement.textContent = `${highestScore}%`;
        recentScoreElement.textContent = `${recentScore}%`;
        lastExamDateElement.textContent = lastExamDateFormatted;
        
        // Calculate average skill scores - reading (0), writing (1), speaking (2)
        const readingTotal = data.reduce((sum, exam) => sum + (exam.sk ? exam.sk[0] : 0), 0);
        const writingTotal = data.reduce((sum, exam) => sum + (exam.sk ? exam.sk[1] : 0), 0);
        const speakingTotal = data.reduce((sum, exam) => sum + (exam.sk ? exam.sk[2] : 0), 0);
        
        const readingAvg = Math.round(readingTotal / totalExams);
        const writingAvg = Math.round(writingTotal / totalExams);
        const speakingAvg = Math.round(speakingTotal / totalExams);
        
        // Update skill charts
        updateSkillCharts(readingAvg, writingAvg, speakingAvg);
    }

    // Update the skill charts
    function updateSkillCharts(reading, writing, speaking) {
        // Update reading score
        readingScoreElement.textContent = `${reading}%`;
        readingScorePath.setAttribute('d', calculateCirclePath(reading));
        
        // Update writing score
        writingScoreElement.textContent = `${writing}%`;
        writingScorePath.setAttribute('d', calculateCirclePath(writing));
        
        // Update speaking score
        speakingScoreElement.textContent = `${speaking}%`;
        speakingScorePath.setAttribute('d', calculateCirclePath(speaking));
        
        // Update skill detail scores if they exist
        if (readingDetailScore) {
            readingDetailScore.textContent = `${reading}%`;
            readingFill.style.width = `${reading}%`;
        }
        
        if (writingDetailScore) {
            writingDetailScore.textContent = `${writing}%`;
            writingFill.style.width = `${writing}%`;
        }
        
        if (speakingDetailScore) {
            speakingDetailScore.textContent = `${speaking}%`;
            speakingFill.style.width = `${speaking}%`;
        }
    }

    // Calculate the SVG path for a circular progress indicator
    function calculateCirclePath(percentage) {
        // Limit percentage to 0-100 range
        const validPercentage = Math.max(0, Math.min(100, percentage));
        
        // No progress
        if (validPercentage === 0) {
            return 'M60,6 A54,54 0 0,1 60,6';
        }
        
        // Full circle
        if (validPercentage === 100) {
            return 'M60,6 A54,54 0 1,1 60,114 A54,54 0 1,1 60,6';
        }
        
        // Convert percentage to radians
        const angleInRadians = (validPercentage / 100) * 2 * Math.PI;
        
        // Calculate end point
        const centerX = 60;
        const centerY = 60;
        const radius = 54;
        
        // Start at top center
        const startX = centerX;
        const startY = centerY - radius;
        
        // Calculate end point
        const endX = centerX + radius * Math.sin(angleInRadians);
        const endY = centerY - radius * Math.cos(angleInRadians);
        
        // Determine which arc to use (large or small)
        const largeArcFlag = validPercentage > 50 ? 1 : 0;
        
        return `M${startX},${startY} A${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}`;
    }

    // Update the chart with filtered compressed data
    function updateChart(data) {
        // Prepare data for the chart
        const labels = [];
        const scores = [];
        
        // Process data in chronological order (oldest to newest)
        const sortedData = [...data].sort((a, b) => new Date(a.d) - new Date(b.d));
        
        sortedData.forEach(exam => {
            const date = new Date(exam.d);  // d = date
            labels.push(formatDate(date));
            scores.push(exam.s);            // s = score
        });
        
        // Destroy previous chart instance if it exists
        if (progressChartInstance) {
            progressChartInstance.destroy();
        }
        
        // Prepare trend line data if needed
        let trendlineDataset = null;
        if (showTrendline && scores.length > 1) {
            trendlineDataset = calculateTrendline(scores);
        }
        
        // Create dataset with appropriate chart type
        const datasets = [{
            label: 'Score (%)',
            data: scores,
            borderColor: '#4CAF50',
            backgroundColor: currentChartType === 'line' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.7)',
            borderWidth: 2,
            tension: 0.3,
            fill: currentChartType === 'line',
            pointBackgroundColor: '#4CAF50',
            pointRadius: 4,
            pointHoverRadius: 6
        }];
        
        // Add trendline if enabled
        if (trendlineDataset) {
            datasets.push({
                label: 'Trend',
                data: trendlineDataset,
                borderColor: 'rgba(255, 99, 132, 0.8)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                tension: 0
            });
        }
        
        // Create new chart
        progressChartInstance = new Chart(progressChart, {
            type: currentChartType,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: 10,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 14
                        }
                    },
                    datalabels: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 10
                        },
                        title: {
                            display: true,
                            text: 'Score (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    // Calculate trendline for data
    function calculateTrendline(scores) {
        if (scores.length < 2) return [];
        
        const n = scores.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        
        // Calculate sums for linear regression
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += scores[i];
            sumXY += i * scores[i];
            sumXX += i * i;
        }
        
        // Calculate slope and intercept
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Generate trendline data points
        const trendline = [];
        for (let i = 0; i < n; i++) {
            trendline.push(slope * i + intercept);
        }
        
        return trendline;
    }

    // Update exam history table with search, sorting, and pagination for compressed data
    function updateHistoryTable() {
        // Apply search filter if there's a search term
        let filteredResults = [...filteredHistory];
        const searchTerm = historySearchInput.value.toLowerCase().trim();
        
        if (searchTerm) {
            filteredResults = filteredResults.filter(exam => {
                return (
                    formatExamType(exam.t).toLowerCase().includes(searchTerm) ||
                    exam.s.toString().includes(searchTerm) ||
                    formatDate(new Date(exam.d)).toLowerCase().includes(searchTerm)
                );
            });
        }
        
        // Apply sorting using compressed keys
        const sortValue = historySortSelect.value;
        switch (sortValue) {
            case 'date-desc':
                filteredResults.sort((a, b) => new Date(b.d) - new Date(a.d));
                break;
            case 'date-asc':
                filteredResults.sort((a, b) => new Date(a.d) - new Date(b.d));
                break;
            case 'score-desc':
                filteredResults.sort((a, b) => b.s - a.s);
                break;
            case 'score-asc':
                filteredResults.sort((a, b) => a.s - b.s);
                break;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredResults.length);
        const pageItems = filteredResults.slice(startIndex, endIndex);
        
        // Update pagination controls
        pageInfoElement.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages || totalPages === 0;
        
        // Clear existing rows
        examHistoryBody.innerHTML = '';
        
        // If no data, show a placeholder row
        if (pageItems.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" style="text-align: center;">No exam records found</td>';
            examHistoryBody.appendChild(row);
            return;
        }
        
        // Add rows for each exam
        pageItems.forEach(exam => {
            const row = document.createElement('tr');
            
            const date = new Date(exam.d);
            const formattedDate = formatDate(date);
            
            // Format exam type for display (convert from ID to readable name)
            const examTypeDisplay = formatExamType(exam.t);
            
            // Create skill badges using compressed skills array [reading, writing, speaking]
            const skillBadges = `
                <span class="skill-badge reading">${exam.sk ? exam.sk[0] : 0}%</span>
                <span class="skill-badge writing">${exam.sk ? exam.sk[1] : 0}%</span>
                <span class="skill-badge speaking">${exam.sk ? exam.sk[2] : 0}%</span>
            `;
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${examTypeDisplay}</td>
                <td>${exam.s}%</td>
                <td>${exam.tt || '0:00'}</td>
                <td>${skillBadges}</td>
            `;
            
            examHistoryBody.appendChild(row);
        });
    }

    // Update the skills analysis tab with compressed data
    function updateSkillsAnalysis(data) {
        if (data.length === 0) {
            if (skillsRadarChartInstance) skillsRadarChartInstance.destroy();
            if (examTypeChartInstance) examTypeChartInstance.destroy();
            return;
        }
        
        // Calculate skill averages from compressed skills array [reading, writing, speaking]
        const readingTotal = data.reduce((sum, exam) => sum + (exam.sk ? exam.sk[0] : 0), 0);
        const writingTotal = data.reduce((sum, exam) => sum + (exam.sk ? exam.sk[1] : 0), 0);
        const speakingTotal = data.reduce((sum, exam) => sum + (exam.sk ? exam.sk[2] : 0), 0);
        
        const totalExams = data.length;
        const readingAvg = Math.round(readingTotal / totalExams);
        const writingAvg = Math.round(writingTotal / totalExams);
        const speakingAvg = Math.round(speakingTotal / totalExams);
        
        // Create or update the radar chart
        updateSkillsRadarChart(readingAvg, writingAvg, speakingAvg);
        
        // Create or update the exam type chart
        updateExamTypeChart(data);
    }

    // Update the radar chart for skills
    function updateSkillsRadarChart(reading, writing, speaking) {
        if (skillsRadarChartInstance) {
            skillsRadarChartInstance.destroy();
        }
        
        // Add height style to the canvas container to make the chart bigger
        const chartContainer = document.querySelector('.skills-chart-container');
        if (chartContainer) {
            chartContainer.style.height = '350px'; // Increase from default height
            chartContainer.style.width = '400px';
            chartContainer.style.maxWidth = '600px'; // Add a max-width to ensure it's not too wide
            chartContainer.style.margin = '0 auto 30px'; // Center the chart with margin
        }
        
        // Convert to pie chart
        skillsRadarChartInstance = new Chart(skillsRadarChart, {
            type: 'pie',
            data: {
                labels: ['Reading', 'Writing', 'Speaking'],
                datasets: [{
                    data: [reading, writing, speaking],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.7)',  // Green for Reading
                        'rgba(33, 150, 243, 0.7)', // Blue for Writing
                        'rgba(255, 152, 0, 0.7)'   // Orange for Speaking
                    ],
                    borderColor: [
                        'rgba(76, 175, 80, 1)',
                        'rgba(33, 150, 243, 1)',
                        'rgba(255, 152, 0, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 16
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value) => {
                            return value + '%';
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 16
                        },
                        display: true
                    }
                }
            }
        });
    }

    // Update the exam type chart with compressed data
    function updateExamTypeChart(data) {
        if (examTypeChartInstance) {
            examTypeChartInstance.destroy();
        }
        
        // Use the full exam history instead of filtered data
        const fullData = [...examHistory];
        
        // Group data by exam type using compressed format (t = examType, s = score)
        const examTypeGroups = {};
        
        fullData.forEach(exam => {
            // Skip combined_exam type
            if (exam.t === 'combined_exam' || exam.t === 'Visual') {
                return;
            }
            
            if (!examTypeGroups[exam.t]) {
                examTypeGroups[exam.t] = {
                    scores: [],
                    count: 0
                };
            }
            
            examTypeGroups[exam.t].scores.push(exam.s);
            examTypeGroups[exam.t].count++;
        });
        
        // Define the desired order of exam types
        const orderedExamTypes = [
            'Short_conversation',
            'Long_Conversation',
            'Advertisement',
            'Product',
            'News_report',
            'Article',
            'Text_completion',
            'Paragraph'
        ];
        
        // Create ordered arrays for labels, averageScores, and counts
        const labels = [];
        const averageScores = [];
        const counts = [];
        
        // Process exam types in the specified order
        orderedExamTypes.forEach(examType => {
            // Only include types that exist in the data
            if (examTypeGroups[examType]) {
                labels.push(formatExamType(examType));
                
                const avg = Math.round(
                    examTypeGroups[examType].scores.reduce((a, b) => a + b, 0) / 
                    examTypeGroups[examType].count
                );
                averageScores.push(avg);
                counts.push(examTypeGroups[examType].count);
            }
        });
        
        // If we have any exam types not in our ordered list, add them at the end
        for (const [examType, data] of Object.entries(examTypeGroups)) {
            if (!orderedExamTypes.includes(examType)) {
                labels.push(formatExamType(examType));
                
                const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count);
                averageScores.push(avg);
                counts.push(data.count);
            }
        }
        
        // Create the chart
        examTypeChartInstance = new Chart(examTypeChart, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Score',
                    data: averageScores,
                    backgroundColor: 'rgba(33, 150, 243, 0.7)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                return `Number of exams: ${counts[index]}`;
                            }
                        }
                    },
                    datalabels: {
                        display: false
                    }
                }
            }
        });
    }

    // Update the insights tab using compressed data
    function updateInsights(data) {
        if (data.length === 0) {
            trendTextElement.textContent = 'No exam data available';
            strongestSkillTextElement.textContent = 'No data available';
            weakestSkillTextElement.textContent = 'No data available';
            consistencyTextElement.textContent = 'No exams taken yet';
            recommendationsListElement.innerHTML = '<p>Complete some exams to get personalized recommendations.</p>';
            
            if (timeAnalysisChartInstance) timeAnalysisChartInstance.destroy();
            return;
        }
        
        try {
            // Calculate trend with compressed data (d = date, s = score)
            const recentExams = [...data].sort((a, b) => new Date(b.d) - new Date(a.d)).slice(0, 5);
            
            if (recentExams.length >= 2) {
                const firstScore = recentExams[recentExams.length - 1].s;
                const lastScore = recentExams[0].s;
                
                const trendInsightCard = document.getElementById('trend-insight');
                // Remove any existing trend classes
                trendInsightCard.classList.remove('trend-up', 'trend-down', 'trend-stable');
                
                if (lastScore > firstScore) {
                    trendTextElement.textContent = `Your scores have improved by ${lastScore - firstScore}% recently!`;
                    trendInsightCard.classList.add('trend-up');
                    const iconElement = trendInsightCard.querySelector('.insight-icon i');
                    iconElement.className = 'fas fa-arrow-trend-up';
                    iconElement.style.color = 'white'; // Keep white for upward trend
                } else if (lastScore < firstScore) {
                    trendTextElement.textContent = `Your scores have decreased by ${firstScore - lastScore}% recently.`;
                    trendInsightCard.classList.add('trend-down');
                    const iconElement = trendInsightCard.querySelector('.insight-icon i');
                    iconElement.className = 'fas fa-arrow-trend-down';
                    iconElement.style.color = '#ff0000'; // Bright red color for downward trend
                } else {
                    trendTextElement.textContent = 'Your scores have remained stable recently.';
                    trendInsightCard.classList.add('trend-stable');
                    const iconElement = trendInsightCard.querySelector('.insight-icon i');
                    iconElement.className = 'fas fa-equals';
                    iconElement.style.color = 'white'; // Keep white for stable trend
                }
            } else {
                trendTextElement.textContent = 'Take more exams to see your score trend.';
            }
            
            // Calculate strongest and weakest skills
            const skillAverages = {
                reading: 0,
                writing: 0,
                speaking: 0
            };
            
            // Calculate skill averages from compressed format (sk[0]=reading, sk[1]=writing, sk[2]=speaking)
            const totalExams = data.length;
            const readingTotal = data.reduce((sum, exam) => sum + (exam.sk ? exam.sk[0] : 0), 0);
            const writingTotal = data.reduce((sum, exam) => sum + (exam.sk ? exam.sk[1] : 0), 0);
            const speakingTotal = data.reduce((sum, exam) => sum + (exam.sk ? exam.sk[2] : 0), 0);
            
            skillAverages.reading = Math.round(readingTotal / totalExams);
            skillAverages.writing = Math.round(writingTotal / totalExams);
            skillAverages.speaking = Math.round(speakingTotal / totalExams);
            
            // Find strongest skill
            const strongestSkill = Object.entries(skillAverages).reduce((a, b) => a[1] > b[1] ? a : b);
            
            // Find weakest skill
            const weakestSkill = Object.entries(skillAverages).reduce((a, b) => a[1] < b[1] ? a : b);
            
            // Update insights
            strongestSkillTextElement.textContent = `${capitalizeFirstLetter(strongestSkill[0])} is your strongest skill with an average of ${strongestSkill[1]}%.`;
            weakestSkillTextElement.textContent = `Focus on improving your ${capitalizeFirstLetter(weakestSkill[0])} skills (currently ${weakestSkill[1]}%).`;
            
            // Calculate consistency using compressed date (d)
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            const examsInLast7Days = data.filter(exam => new Date(exam.d) >= sevenDaysAgo).length;
            
            if (examsInLast7Days > 0) {
                consistencyTextElement.textContent = `You've taken ${examsInLast7Days} exam${examsInLast7Days === 1 ? '' : 's'} in the last 7 days.`;
            } else {
                consistencyTextElement.textContent = 'You haven\'t taken any exams in the last 7 days.';
            }
            
            // Generate recommendations
            generateRecommendations(data, weakestSkill[0]);
            
            // Update time analysis chart
            updateTimeAnalysisChart(data);
        } catch (error) {
            console.error('Error updating insights:', error);
            
            // Provide fallback content
            trendTextElement.textContent = 'Error analyzing your score trend.';
            strongestSkillTextElement.textContent = 'Error analyzing your skill strengths.';
            weakestSkillTextElement.textContent = 'Error analyzing your skill weaknesses.';
            consistencyTextElement.textContent = 'Error analyzing your exam consistency.';
            
            // Add basic recommendations and empty chart as fallback
            recommendationsListElement.innerHTML = `
                <div class="recommendation-item">
                    <div class="recommendation-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="recommendation-content">
                        <h4>Error Generating Recommendations</h4>
                        <p>We encountered an error analyzing your data. Please try refreshing the page.</p>
                    </div>
                </div>
            `;
            
            // Create a fallback chart if needed
            if (timeAnalysisChartInstance) timeAnalysisChartInstance.destroy();
        }
    }

    // Generate personalized recommendations
    function generateRecommendations(data, weakestSkill) {
        try {
            const recommendations = [];
            
            // Check if recommendationsListElement exists before proceeding
            if (!recommendationsListElement) {
                console.error('Recommendations list element not found in the DOM');
                return;
            }
            
            // Recommendation based on weakest skill
            let skillRecommendation = '';
            let skillExamType = '';
            
            switch(weakestSkill) {
                case 'reading':
                    skillRecommendation = 'Practice reading comprehension with Article and News Report exams';
                    skillExamType = 'Article';
                    break;
                case 'writing':
                    skillRecommendation = 'Improve your writing skills with Text Completion exercises';
                    skillExamType = 'Text_completion';
                    break;
                case 'speaking':
                    skillRecommendation = 'Work on your speaking and listening with Conversation exercises';
                    skillExamType = 'Short_conversation';
                    break;
            }
            
            recommendations.push({
                title: `Improve ${capitalizeFirstLetter(weakestSkill)}`,
                text: skillRecommendation,
                action: `Practice Now`,
                link: `${skillExamType}.html`
            });
            
            // Recommendation based on consistency (using compressed date d)
            const now = new Date();
            const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
            const recentExams = data.filter(exam => new Date(exam.d) >= threeDaysAgo);
            
            if (recentExams.length === 0) {
                recommendations.push({
                    title: 'Maintain Consistency',
                    text: 'Try to practice regularly, aim for at least 3 exams per week',
                    action: 'View Exams',
                    link: 'index.html#exam-list'
                });
            }
            
            // Find most successful exam type
            if (data.length >= 3) {
                const examTypeScores = {};
                
                // Group by exam type and calculate average scores (t = examType, s = score)
                data.forEach(exam => {
                    if (!exam.t) return; // Skip entries without examType
                    
                    if (!examTypeScores[exam.t]) {
                        examTypeScores[exam.t] = {
                            total: 0,
                            count: 0,
                            average: 0
                        };
                    }
                    
                    examTypeScores[exam.t].total += exam.s;
                    examTypeScores[exam.t].count++;
                });
                
                // Calculate averages
                Object.keys(examTypeScores).forEach(type => {
                    if (examTypeScores[type].count > 0) {
                        examTypeScores[type].average = Math.round(examTypeScores[type].total / examTypeScores[type].count);
                    }
                });
                
                // Find the best and worst exam types
                let bestExamType = null;
                let bestScore = 0;
                let worstExamType = null;
                let worstScore = 100;
                
                Object.keys(examTypeScores).forEach(type => {
                    if (examTypeScores[type].count >= 2) { // At least 2 exams of this type
                        if (examTypeScores[type].average > bestScore) {
                            bestScore = examTypeScores[type].average;
                            bestExamType = type;
                        }
                        
                        if (examTypeScores[type].average < worstScore) {
                            worstScore = examTypeScores[type].average;
                            worstExamType = type;
                        }
                    }
                });
                
                // Add recommendations based on strengths and weaknesses
                if (bestExamType && bestScore >= 70) {
                    recommendations.push({
                        title: 'Build on Your Strengths',
                        text: `You're doing well in ${formatExamType(bestExamType)} (${bestScore}%). Continue to challenge yourself here.`,
                        action: 'Practice More',
                        link: `${bestExamType.replace(/\s+/g, '_')}.html`
                    });
                }
                
                if (worstExamType && bestExamType !== worstExamType) {
                    recommendations.push({
                        title: 'Focus on Improvement',
                        text: `Your ${formatExamType(worstExamType)} scores (${worstScore}%) show room for improvement.`,
                        action: 'Practice Now',
                        link: `${worstExamType.replace(/\s+/g, '_')}.html`
                    });
                }
            }
            
            // Add recommendation based on time analysis
            if (data.length >= 5 && data.every(exam => exam.timeTaken)) {
                const timeScoreCorrelation = calculateTimeScoreCorrelation(data);
                
                if (Math.abs(timeScoreCorrelation) >= 0.3) {
                    if (timeScoreCorrelation > 0) {
                        recommendations.push({
                            title: 'Time Management',
                            text: 'Taking more time tends to improve your scores. Consider being more thorough in your exam approach.',
                            action: 'Learn More',
                            link: '#'
                        });
                    } else {
                        recommendations.push({
                            title: 'Speed Strategy',
                            text: 'You perform better when you work more quickly. Try to trust your instincts when answering questions.',
                            action: 'Learn More',
                            link: '#'
                        });
                    }
                }
            }
            
            // Add more recommendations as needed
            if (data.length < 5) {
                recommendations.push({
                    title: 'Build Your Profile',
                    text: 'Take more exams to get more detailed insights and track your progress',
                    action: 'Start Now',
                    link: 'index.html#exam-list'
                });
            }
            
            // Diversify exam types if needed
            const examTypes = new Set(data.filter(exam => exam.examType).map(exam => exam.examType));
            if (examTypes.size < 3) {
                recommendations.push({
                    title: 'Diversify Your Practice',
                    text: 'Try different exam types to build well-rounded skills',
                    action: 'Explore',
                    link: 'index.html#exam-list'
                });
            }
            
            // Make sure we always have at least one recommendation
            if (recommendations.length === 0) {
                recommendations.push({
                    title: 'Continue Practicing',
                    text: 'Keep taking regular exams to maintain your skills and track your progress',
                    action: 'Take an Exam',
                    link: 'index.html#exam-list'
                });
            }
            
            // Clear the recommendations list
            recommendationsListElement.innerHTML = '';
            
            // Render recommendations
            recommendations.forEach(rec => {
                const recItem = document.createElement('div');
                recItem.className = 'recommendation-item';
                
                recItem.innerHTML = `
                    <div class="recommendation-icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div class="recommendation-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.text}</p>
                    </div>
                    <a href="${rec.link}" class="recommendation-action">${rec.action}</a>
                `;
                
                recommendationsListElement.appendChild(recItem);
            });
        } catch (error) {
            console.error('Error generating recommendations:', error);
            
            // Provide fallback recommendations if an error occurs
            if (recommendationsListElement) {
                recommendationsListElement.innerHTML = `
                    <div class="recommendation-item">
                        <div class="recommendation-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="recommendation-content">
                            <h4>General Recommendation</h4>
                            <p>Continue practicing regularly across all exam types to improve your overall performance.</p>
                        </div>
                        <a href="index.html#exam-list" class="recommendation-action">Continue Practice</a>
                    </div>
                `;
            }
        }
    }

    // Calculate correlation between time spent and scores with compressed data
    function calculateTimeScoreCorrelation(data) {
        // Extract time and score data using compressed keys tt = timeTaken, s = score
        const timeData = data.map(exam => {
            const [minutes, seconds] = (exam.tt || '0:00').split(':').map(Number);
            return minutes + seconds / 60; // Convert to minutes
        });
        
        const scoreData = data.map(exam => exam.s);
        
        // Calculate means
        const timeMean = timeData.reduce((sum, time) => sum + time, 0) / timeData.length;
        const scoreMean = scoreData.reduce((sum, score) => sum + score, 0) / scoreData.length;
        
        // Calculate covariance and variances
        let covariance = 0;
        let timeVariance = 0;
        let scoreVariance = 0;
        
        for (let i = 0; i < timeData.length; i++) {
            const timeDiff = timeData[i] - timeMean;
            const scoreDiff = scoreData[i] - scoreMean;
            
            covariance += timeDiff * scoreDiff;
            timeVariance += timeDiff * timeDiff;
            scoreVariance += scoreDiff * scoreDiff;
        }
        
        // Calculate correlation coefficient (Pearson's r)
        const correlation = covariance / (Math.sqrt(timeVariance) * Math.sqrt(scoreVariance));
        
        return correlation;
    }

    // Update time analysis chart with compressed data
    function updateTimeAnalysisChart(data) {
        try {
            // Check if the chart element exists
            if (!timeAnalysisChart) {
                console.error('Time analysis chart element not found in the DOM');
                return;
            }
            
            // Destroy previous chart instance if it exists
            if (timeAnalysisChartInstance) {
                timeAnalysisChartInstance.destroy();
            }
            
            // Filter data to only include entries with valid timeTaken values (tt = timeTaken)
            const validData = data.filter(exam => exam.tt && exam.tt.includes(':'));
            
            // If no valid data, show an empty chart with a message
            if (validData.length === 0) {
                const ctx = timeAnalysisChart.getContext('2d');
                if (ctx) {
                    // Clear canvas
                    ctx.clearRect(0, 0, timeAnalysisChart.width, timeAnalysisChart.height);
                    
                    // Draw message
                    ctx.font = '16px Arial';
                    ctx.fillStyle = '#666';
                    ctx.textAlign = 'center';
                    ctx.fillText('No time data available', timeAnalysisChart.width / 2, timeAnalysisChart.height / 2);
                }
                return;
            }
            
            // Process time data using compressed format (tt = timeTaken)
            const timeData = validData.map(exam => {
                const [minutes, seconds] = exam.tt.split(':').map(Number);
                return minutes + seconds / 60; // Convert to minutes
            });
            
            const scoreData = validData.map(exam => exam.s); // s = score
            
            // Create scatter plot
            timeAnalysisChartInstance = new Chart(timeAnalysisChart, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Time vs. Score',
                        data: timeData.map((time, i) => ({
                            x: time,
                            y: scoreData[i]
                        })),
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Time (minutes)',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            min: 0, // Always start at 0
                            ticks: {
                                font: {
                                    size: 12
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Score (%)',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            min: 0,
                            max: 100,
                            ticks: {
                                font: {
                                    size: 12
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const point = context.raw;
                                    return `Score: ${point.y}%, Time: ${Math.floor(point.x)}m ${Math.round((point.x % 1) * 60)}s`;
                                }
                            }
                        },
                        datalabels: {
                            display: false
                        },
                        legend: {
                            labels: {
                                font: {
                                    size: 14
                                }
                            }
                        }
                    }
                }
            });
            
            // Add trend line if there are enough data points
            if (validData.length >= 3) {
                addTrendlineToTimeChart(timeData, scoreData);
            }
        } catch (error) {
            console.error('Error updating time analysis chart:', error);
            
            // Create a fallback empty chart
            if (timeAnalysisChart) {
                const ctx = timeAnalysisChart.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, timeAnalysisChart.width, timeAnalysisChart.height);
                    ctx.font = '16px Arial';
                    ctx.fillStyle = '#666';
                    ctx.textAlign = 'center';
                    ctx.fillText('Error loading time analysis chart', timeAnalysisChart.width / 2, timeAnalysisChart.height / 2);
                }
            }
        }
    }
    
    // Helper function to add trendline to time analysis chart
    function addTrendlineToTimeChart(timeData, scoreData) {
        if (!timeAnalysisChartInstance) return;
        
        try {
            // Calculate linear regression
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            const n = timeData.length;
            
            for (let i = 0; i < n; i++) {
                sumX += timeData[i];
                sumY += scoreData[i];
                sumXY += timeData[i] * scoreData[i];
                sumX2 += timeData[i] * timeData[i];
            }
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            
            // Find min and max x values
            const minX = Math.min(...timeData);
            const maxX = Math.max(...timeData);
            
            // Create trendline data points
            const trendlineData = [
                { x: minX, y: slope * minX + intercept },
                { x: maxX, y: slope * maxX + intercept }
            ];
            
            // Add trendline dataset
            timeAnalysisChartInstance.data.datasets.push({
                label: 'Trend',
                data: trendlineData,
                type: 'line',
                borderColor: 'rgba(54, 162, 235, 0.8)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false
            });
            
            // Update the chart
            timeAnalysisChartInstance.update();
        } catch (error) {
            console.error('Error adding trendline to time chart:', error);
        }
    }

    // Format date for display
    function formatDate(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            console.warn('Invalid date provided to formatDate:', date);
            return 'Invalid Date';
        }
        
        try {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            });
        } catch (e) {
            console.error('Error formatting date:', e);
            return date.toDateString();
        }
    }

    // Format exam type for display
    function formatExamType(examType) {
        if (!examType) {
            console.warn('Invalid exam type provided to formatExamType');
            return 'Unknown';
        }
        
        switch(examType) {
            case 'Short_conversation':
                return 'Short Conversation';
            case 'Long_Conversation':   
                return 'Long Conversation';
            case 'News_report':
                return 'News Report';
            case 'Text_completion':
                return 'Text Completion';
            default:
                // Capitalize first letter
                return capitalizeFirstLetter(examType);
        }
    }

    // Capitalize first letter
    function capitalizeFirstLetter(string) {
        if (!string || typeof string !== 'string') {
            console.warn('Invalid string provided to capitalizeFirstLetter');
            return '';
        }
        
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Expose functions to window object
    window.addTestResult = addTestResult;
    window.generateFullSampleData = generateFullSampleData;
    window.toggleChartType = toggleChartType;
    window.exportProgressData = exportProgressData;


    // Toggle between different chart types (line, bar, area)
    function toggleChartType() {
        const chartTypes = ['line', 'bar']; 
        const currentIndex = chartTypes.indexOf(currentChartType);
        const nextIndex = (currentIndex + 1) % chartTypes.length;
        currentChartType = chartTypes[nextIndex];
        
        // Update chart type select value
        if (chartTypeSelect) {
            chartTypeSelect.value = currentChartType;
        }
        
        // Update the chart
        updateChart(filteredHistory);
    }

    // Export progress data as CSV (using compressed data)
    function exportProgressData() {
        if (examHistory.length === 0) {
            alert('No data to export.');
            return;
        }
        
        // Create CSV header row
        let csvContent = 'Date,Exam Type,Score,Reading,Writing,Speaking,Time Taken\n';
        
        // Add data rows using compressed format keys
        examHistory.forEach(exam => {
            const date = new Date(exam.d).toLocaleDateString(); // d = date
            const examType = formatExamType(exam.t);           // t = examType
            const score = exam.s;                             // s = score
            const reading = exam.sk ? exam.sk[0] : 0;         // sk[0] = reading
            const writing = exam.sk ? exam.sk[1] : 0;         // sk[1] = writing
            const speaking = exam.sk ? exam.sk[2] : 0;        // sk[2] = speaking
            const timeTaken = exam.tt || '0:00';              // tt = timeTaken
            
            csvContent += `${date},${examType},${score},${reading},${writing},${speaking},${timeTaken}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'progress_data.csv');
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
})(); 