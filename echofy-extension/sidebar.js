/**
 * Echofy Sidebar JavaScript
 * Handles tab navigation, text analysis, history management, and UI interactions
 */

(function() {
  'use strict';
  
  // DOM elements
  let textInput = null;
  let analyzeBtn = null;
  let loadingState = null;
  let resultsContainer = null;
  let historyList = null;
  let clearHistoryBtn = null;
  
  // State
  let currentAnalysis = null;
  let analysisHistory = [];
  
  // Constants
  const STORAGE_KEY = 'echofy_history';
  const MAX_HISTORY_ITEMS = 10;
  
  /**
   * Initialize the sidebar when DOM is loaded
   */
  function init() {
    bindDOMElements();
    setupEventListeners();
    loadHistoryFromStorage();
    updateAnalyzeButton();
  }
  
  /**
   * Bind DOM elements to variables
   */
  function bindDOMElements() {
    textInput = document.getElementById('text-input');
    analyzeBtn = document.getElementById('analyze-btn');
    loadingState = document.getElementById('loading-state');
    resultsContainer = document.getElementById('results-container');
    historyList = document.getElementById('history-list');
    clearHistoryBtn = document.getElementById('clear-history');
  }
  
  /**
   * Setup all event listeners
   */
  function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', handleTabClick);
    });
    
    // Text input changes
    textInput.addEventListener('input', updateAnalyzeButton);
    textInput.addEventListener('paste', () => {
      setTimeout(updateAnalyzeButton, 10);
    });
    
    // Analyze button
    analyzeBtn.addEventListener('click', handleAnalyze);
    
    // Collapsible original text
    const textToggle = document.getElementById('text-toggle');
    if (textToggle) {
      textToggle.addEventListener('click', toggleOriginalText);
    }
    
    // Clear history button
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Listen for messages from content script
    window.addEventListener('message', handleMessage);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
  }
  
  /**
   * Handle tab navigation clicks
   */
  function handleTabClick(event) {
    const tabName = event.currentTarget.dataset.tab;
    switchTab(tabName);
  }
  
  /**
   * Switch to specified tab
   */
  function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.querySelector(`[data-panel="${tabName}"]`).classList.add('active');
    
    // Special handling for history tab
    if (tabName === 'history') {
      renderHistoryList();
    }
  }
  
  /**
   * Handle messages from content script
   */
  function handleMessage(event) {
    if (event.data && event.data.from === 'echofy-cs') {
      if (event.data.type === 'ECHF_ANALYZE_TEXT') {
        const text = event.data.payload.text;
        if (text && text.trim().length > 0) {
          textInput.value = text.trim();
          updateAnalyzeButton();
          switchTab('analyze');
          // Auto-analyze if text is provided
          setTimeout(handleAnalyze, 100);
        }
      }
    }
  }
  
  /**
   * Handle keyboard shortcuts
   */
  function handleKeyDown(event) {
    // Ctrl/Cmd + Enter to analyze
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      if (!analyzeBtn.disabled) {
        handleAnalyze();
      }
    }
  }
  
  /**
   * Update analyze button state based on input
   */
  function updateAnalyzeButton() {
    const text = textInput.value.trim();
    analyzeBtn.disabled = text.length < 10;
    
    if (text.length < 10 && text.length > 0) {
      analyzeBtn.textContent = `Need ${10 - text.length} more characters`;
    } else if (text.length >= 10) {
      analyzeBtn.innerHTML = '<span class="button-icon">⚡</span>Analyze Selected Text';
    } else {
      analyzeBtn.innerHTML = '<span class="button-icon">⚡</span>Analyze Selected Text';
    }
  }
  
  /**
   * Handle analyze button click
   */
  async function handleAnalyze() {
    const text = textInput.value.trim();
    if (text.length < 10) return;
    
    showLoadingState();
    
    try {
      const result = await requestAnalysis(text);
      currentAnalysis = {
        text: text,
        result: result,
        timestamp: Date.now()
      };
      
      displayResults(result, text);
      saveToHistory(currentAnalysis);
      
    } catch (error) {
      console.error('Analysis error:', error);
      showErrorState();
    }
  }
  
  /**
   * Request analysis from background script
   */
  function requestAnalysis(text) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({
          type: 'ECHF_REQUEST_ANALYZE',
          payload: { text: text }
        }, (response) => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          if (!response || response.error) {
            return reject(response?.error || 'NO_RESPONSE');
          }
          resolve(response);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  
  /**
   * Show loading state
   */
  function showLoadingState() {
    loadingState.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    analyzeBtn.disabled = true;
  }
  
  /**
   * Show error state
   */
  function showErrorState() {
    loadingState.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    analyzeBtn.disabled = false;
    
    // Show error message (you could create an error state UI)
    alert('Analysis failed. Please try again.');
  }
  
  /**
   * Display analysis results
   */
  function displayResults(result, text) {
    loadingState.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    analyzeBtn.disabled = false;
    
    // Update credibility score
    updateCredibilityScore(result.credibility_score);
    
    // Update bias badge
    updateBiasBadge(result.bias_level);
    
    // Update AI indicator
    updateAIIndicator(result.ai_generated);
    
    // Update fact checks
    updateFactChecks(result.fact_checks);
    
    // Update media literacy tip
    updateMediaLiteracyTip(result.tips);
    
    // Update original text
    updateOriginalText(text);
    
    // Show confidence if present
    const existing = document.getElementById('confidence-indicator');
    const confidence = typeof result.confidence === 'number' ? result.confidence : null;
    if (confidence !== null) {
      if (!existing) {
        const el = document.createElement('div');
        el.id = 'confidence-indicator';
        el.style.marginTop = '8px';
        el.style.fontSize = '12px';
        el.style.color = '#6b7280';
        el.textContent = `Detector confidence: ${Math.round(confidence * 100)}% (heuristic)`;
        resultsContainer.prepend(el);
      } else {
        existing.textContent = `Detector confidence: ${Math.round(confidence * 100)}% (heuristic)`;
      }
    } else if (existing) {
      existing.remove();
    }
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  /**
   * Update credibility score display
   */
  function updateCredibilityScore(score) {
    const scoreElement = document.getElementById('credibility-number');
    const scoreCircle = document.querySelector('.score-circle');
    
    scoreElement.textContent = score;
    
    // Update circular progress
    const angle = (score / 100) * 360;
    scoreCircle.style.setProperty('--score-angle', `${angle}deg`);
    
    // Color based on score
    let color = '#00FFF7'; // Default cyan
    if (score < 40) {
      color = '#FF6B6B'; // Coral for low scores
    } else if (score < 70) {
      color = '#fbbf24'; // Yellow for moderate scores
    }
    
    scoreCircle.style.background = `conic-gradient(${color} 0deg, ${color} ${angle}deg, #e5e7eb ${angle}deg)`;
  }
  
  /**
   * Update bias level badge
   */
  function updateBiasBadge(biasLevel) {
    const badgeElement = document.getElementById('bias-badge');
    
    // Remove existing classes
    badgeElement.classList.remove('badge-low', 'badge-moderate', 'badge-high');
    
    // Add appropriate class and text
    badgeElement.textContent = biasLevel;
    badgeElement.classList.add(`badge-${biasLevel.toLowerCase()}`);
  }
  
  /**
   * Update AI generated indicator
   */
  function updateAIIndicator(isAIGenerated) {
    const indicatorElement = document.getElementById('ai-indicator');
    indicatorElement.textContent = isAIGenerated ? 'Likely' : 'Unlikely';
    indicatorElement.style.color = isAIGenerated ? '#FF6B6B' : '#1A1B25';
  }
  
  /**
   * Update fact checks section
   */
  function updateFactChecks(factChecks) {
    const factChecksContainer = document.getElementById('fact-checks-list');
    
    if (!factChecks || factChecks.length === 0) {
      factChecksContainer.innerHTML = '<p class="no-fact-checks">No fact-check matches found.</p>';
      return;
    }
    
    const factCheckHTML = factChecks.map(factCheck => `
      <div class="fact-check-item">
        <div class="fact-check-source">${escapeHTML(factCheck.source)}</div>
        <div class="fact-check-verdict">${escapeHTML(factCheck.verdict)}</div>
        <a href="${escapeHTML(factCheck.url)}" target="_blank" class="fact-check-link">
          View on ${escapeHTML(factCheck.source)} ↗
        </a>
      </div>
    `).join('');
    
    factChecksContainer.innerHTML = factCheckHTML;
  }
  
  /**
   * Update media literacy tip
   */
  function updateMediaLiteracyTip(tip) {
    const tipElement = document.getElementById('mil-tip');
    tipElement.textContent = tip;
  }
  
  /**
   * Update original text display
   */
  function updateOriginalText(text) {
    const textElement = document.getElementById('analyzed-text-content');
    textElement.textContent = text;
  }
  
  /**
   * Toggle original text visibility
   */
  function toggleOriginalText() {
    const originalText = document.getElementById('original-text');
    const toggleIcon = document.querySelector('.toggle-icon');
    
    originalText.classList.toggle('collapsed');
    toggleIcon.textContent = originalText.classList.contains('collapsed') ? '▼' : '▲';
  }
  
  /**
   * Save analysis to history
   */
  function saveToHistory(analysis) {
    // Add to beginning of array
    analysisHistory.unshift(analysis);
    
    // Keep only last MAX_HISTORY_ITEMS
    if (analysisHistory.length > MAX_HISTORY_ITEMS) {
      analysisHistory = analysisHistory.slice(0, MAX_HISTORY_ITEMS);
    }
    
    // Save to storage
    chrome.storage.sync.set({
      [STORAGE_KEY]: analysisHistory
    });
  }
  
  /**
   * Load history from storage
   */
  function loadHistoryFromStorage() {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        analysisHistory = result[STORAGE_KEY];
      }
    });
  }
  
  /**
   * Render history list
   */
  function renderHistoryList() {
    if (!historyList) return;
    
    if (analysisHistory.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          <div class="empty-icon">📭</div>
          <p>No analyses yet</p>
          <small>Your last 10 analyses will appear here</small>
        </div>
      `;
      return;
    }
    
    const historyHTML = analysisHistory.map((item, index) => {
      const date = new Date(item.timestamp);
      const preview = item.text.substring(0, 80) + (item.text.length > 80 ? '...' : '');
      
      return `
        <div class="history-item" data-index="${index}">
          <div class="history-item-preview">${escapeHTML(preview)}</div>
          <div class="history-item-meta">
            <span>${formatDate(date)}</span>
            <span class="history-score">Score: ${item.result.credibility_score}</span>
          </div>
        </div>
      `;
    }).join('');
    
    historyList.innerHTML = historyHTML;
    
    // Add click listeners to history items
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', handleHistoryItemClick);
    });
  }
  
  /**
   * Handle history item click
   */
  function handleHistoryItemClick(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    const historyItem = analysisHistory[index];
    
    if (historyItem) {
      // Switch to analyze tab
      switchTab('analyze');
      
      // Populate text input
      textInput.value = historyItem.text;
      updateAnalyzeButton();
      
      // Display results
      displayResults(historyItem.result, historyItem.text);
      currentAnalysis = historyItem;
    }
  }
  
  /**
   * Clear all history
   */
  function clearHistory() {
    if (confirm('Are you sure you want to clear all analysis history?')) {
      analysisHistory = [];
      chrome.storage.sync.remove([STORAGE_KEY]);
      renderHistoryList();
    }
  }
  
  /**
   * Format date for display
   */
  function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
  
  /**
   * Escape HTML to prevent XSS
   */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})(); 