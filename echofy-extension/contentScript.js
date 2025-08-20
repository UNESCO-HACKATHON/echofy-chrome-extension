/**
 * Echofy Content Script
 * Injects floating bubble and sidebar iframe with shadow DOM isolation
 */

(function() {
  'use strict';
  
  // Prevent multiple injections
  if (window.echofyInjected) return;
  window.echofyInjected = true;
  
  let shadowHost = null;
  let shadowRoot = null;
  let bubble = null;
  let sidebarIframe = null;
  let isSidebarOpen = false;
  
  // Respond to background ping so it knows content script is present
  try {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message && message.type === 'ECHF_PING') {
        sendResponse({ ok: true });
        return true;
      }
    });
  } catch (_) {
    // ignore
  }
  
  // Initialize the extension UI
  function init() {
    createShadowHost();
    createBubble();
    createSidebar();
    setupEventListeners();
  }
  
  /**
   * Create shadow DOM host for style isolation
   */
  function createShadowHost() {
    shadowHost = document.createElement('div');
    shadowHost.id = 'echofy-shadow-host';
    shadowHost.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 0 !important;
      height: 0 !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
    `;
    
    shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
    document.documentElement.appendChild(shadowHost);
  }
  
  /**
   * Create floating bubble UI
   */
  function createBubble() {
    bubble = document.createElement('div');
    bubble.innerHTML = '🔍';
    
    // Bubble styles
    const bubbleStyles = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 56px !important;
      height: 56px !important;
      background: #2B2D42 !important;
      color: #00FFF7 !important;
      border: none !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      font-size: 24px !important;
      font-family: Inter, system-ui, Arial, sans-serif !important;
      box-shadow: 0 4px 12px rgba(43, 45, 66, 0.4) !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      user-select: none !important;
    `;
    
    bubble.style.cssText = bubbleStyles;
    
    // Hover effects
    bubble.addEventListener('mouseenter', () => {
      bubble.style.transform = 'scale(1.1)';
      bubble.style.boxShadow = '0 6px 16px rgba(43, 45, 66, 0.6)';
    });
    
    bubble.addEventListener('mouseleave', () => {
      bubble.style.transform = 'scale(1)';
      bubble.style.boxShadow = '0 4px 12px rgba(43, 45, 66, 0.4)';
    });
    
    // Click handler
    bubble.addEventListener('click', toggleSidebar);
    
    shadowRoot.appendChild(bubble);
  }
  
  /**
   * Create sidebar iframe
   */
  function createSidebar() {
    sidebarIframe = document.createElement('iframe');
    sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
    sidebarIframe.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      width: 360px !important;
      height: 100vh !important;
      border: none !important;
      background: #EDF2F4 !important;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15) !important;
      transform: translateX(100%) !important;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      z-index: 2147483646 !important;
      pointer-events: auto !important;
    `;
    
    shadowRoot.appendChild(sidebarIframe);
  }
  
  /**
   * Toggle sidebar visibility
   */
  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    
    if (isSidebarOpen) {
      sidebarIframe.style.transform = 'translateX(0)';
      bubble.innerHTML = '✕';
      bubble.style.background = '#FF6B6B';
    } else {
      sidebarIframe.style.transform = 'translateX(100%)';
      bubble.innerHTML = '🔍';
      bubble.style.background = '#2B2D42';
    }
  }
  
  /**
   * Open sidebar and analyze text
   */
  function openSidebarAndAnalyze(text) {
    if (!isSidebarOpen) {
      toggleSidebar();
    }
    
    // Wait for iframe to load, then send message
    const tryPost = () => {
      try {
        if (sidebarIframe && sidebarIframe.contentWindow) {
          sidebarIframe.contentWindow.postMessage({
            type: "ECHF_ANALYZE_TEXT",
            payload: { text: text },
            from: "echofy-cs"
          }, "*");
        }
      } catch (e) {
        // Swallow errors caused by navigation/unload
      }
    };
    
    if (sidebarIframe && sidebarIframe.contentWindow) {
      setTimeout(tryPost, 150);
    } else {
      // Fallback once iframe reports load
      sidebarIframe.addEventListener('load', () => setTimeout(tryPost, 50), { once: true });
    }
  }
  
  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Double-click handler for text selection
    document.addEventListener('dblclick', (event) => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText && selectedText.length > 10) {
        event.preventDefault();
        openSidebarAndAnalyze(selectedText);
      }
    });
    
    // Listen for messages from background script
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message && message.type === "ECHF_ANALYZE_TEXT" && message.payload?.text) {
          openSidebarAndAnalyze(message.payload.text);
        }
      });
    } catch (_) { /* ignore */ }
    
    // Handle Escape key to close sidebar
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        toggleSidebar();
      }
    });
    
    // Handle iframe load (noop, used in fallback above)
    sidebarIframe.addEventListener('load', () => {});
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})(); 