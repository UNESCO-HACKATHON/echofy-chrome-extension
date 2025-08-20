/**
 * Echofy Background Service Worker
 * Handles context menu creation, mock text analysis, and message passing
 */

// Helper: safe sendMessage to a tab
async function safeSendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(response);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Determine if URL is eligible (http/https only)
function isHttpUrl(url) {
  return !!url && /^https?:\/\//i.test(url);
}

// Context menu creation on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "echofyAnalyze",
    title: "Analyze with Echofy",
    contexts: ["selection"],
    documentUrlPatterns: ["http://*/*", "https://*/*"]
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId !== "echofyAnalyze" || !info.selectionText) return;
    if (!tab || !tab.id || !isHttpUrl(tab.url)) return;

    // Ensure content script is available; try to ping it first
    try {
      await safeSendMessageToTab(tab.id, { type: "ECHF_PING" });
    } catch (_) {
      // Inject content script if not present
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["contentScript.js"]
      });
    }

    await safeSendMessageToTab(tab.id, {
      type: "ECHF_ANALYZE_TEXT",
      payload: { text: info.selectionText }
    });
  } catch (err) {
    console.warn("Context menu handler failed:", err);
  }
});

// Message listener for analysis requests from sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request?.type === "ECHF_REQUEST_ANALYZE") {
        const result = analyzeTextSafely(request.payload?.text ?? "");
        sendResponse(result);
        return;
      }
      sendResponse({ error: "UNKNOWN_REQUEST" });
    } catch (err) {
      sendResponse({ error: String(err || "ANALYSIS_FAILED") });
    }
  })();
  return true; // keep channel open
});

/**
 * Safer text analyzer with heuristic confidence scoring.
 * This is NOT a fact-checker. It provides non-deterministic signals.
 * @param {string} text
 * @returns {{credibility_score:number, ai_generated:boolean, bias_level:string, fact_checks:Array, tips:string, confidence:number}}
 */
function analyzeTextSafely(text) {
  if (typeof text !== "string") {
    return {
      credibility_score: 0,
      ai_generated: false,
      bias_level: "Low",
      fact_checks: [],
      tips: "Please provide valid text for analysis.",
      confidence: 0.0
    };
  }

  const raw = text.trim();
  if (raw.length === 0) {
    return {
      credibility_score: 0,
      ai_generated: false,
      bias_level: "Low",
      fact_checks: [],
      tips: "Please provide non-empty text.",
      confidence: 0.0
    };
  }

  const lowered = raw.toLowerCase();
  const words = raw.split(/\s+/);
  const wordCount = words.length;

  let credibilityScore = 75;
  let biasLevel = "Low";
  let aiGenerated = false;
  let confidence = 0.5; // start with medium
  const factChecks = [];

  // Patterns
  const clickbaitPatterns = [
    /shocking|unbelievable|incredible|amazing|jaw-dropping/gi,
    /you won't believe|this will blow your mind|doctors hate/gi,
    /secret|exposed|revealed|hidden truth/gi,
    /number \d+ will shock you|what happens next/gi
  ];
  const biasedTerms = [
    /absolutely|completely|totally|never|always|everyone knows/gi,
    /obvious|clearly|undoubtedly|without question/gi,
    /disaster|catastrophe|crisis|emergency/gi
  ];
  const aiIndicators = [
    /as an ai|i'm an artificial intelligence/gi,
    /it's important to note|it's worth noting/gi,
    /in conclusion|to summarize|in summary/gi
  ];

  // Caps ratio
  const allCapsWords = raw.match(/\b[A-Z]{3,}\b/g) || [];
  const allCapsRatio = allCapsWords.length / Math.max(1, wordCount);

  // Clickbait impact (capped)
  let clickbaitMatches = 0;
  for (const p of clickbaitPatterns) {
    const m = raw.match(p);
    if (m) clickbaitMatches += m.length;
  }
  credibilityScore -= Math.min(30, clickbaitMatches * 10);
  if (clickbaitMatches > 0) confidence = Math.min(0.75, confidence + 0.1);

  // Bias impact (capped)
  let biasMatches = 0;
  for (const p of biasedTerms) {
    const m = raw.match(p);
    if (m) biasMatches += m.length;
  }
  credibilityScore -= Math.min(24, biasMatches * 6);

  // Determine bias level with smoothing
  if (biasMatches > 3 || clickbaitMatches > 2 || allCapsRatio > 0.25) {
    biasLevel = "High";
  } else if (biasMatches > 1 || clickbaitMatches > 0 || allCapsRatio > 0.1) {
    biasLevel = "Moderate";
  }

  // AI indicators (very weak signal, low confidence bump only)
  let aiSignals = 0;
  for (const p of aiIndicators) {
    if (p.test(lowered)) aiSignals += 1;
  }
  aiGenerated = aiSignals >= 2 || (aiSignals === 1 && wordCount > 120);
  if (aiGenerated) confidence = Math.min(0.7, confidence + 0.1);

  // Short text penalty with low confidence
  if (raw.length < 50) {
    credibilityScore -= 10;
    confidence = Math.min(confidence, 0.55);
  }

  // Bounds
  credibilityScore = Math.max(0, Math.min(100, Math.round(credibilityScore)));

  // Fact-check suggestions only as guidance
  if (clickbaitMatches > 0 || biasLevel === "High") {
    factChecks.push({
      source: "Africa Check",
      url: "https://africacheck.org/",
      verdict: "Signals of sensational or biased language detected. Verify context."
    });
  }
  if (credibilityScore < 40) {
    factChecks.push({
      source: "Snopes",
      url: "https://snopes.com/",
      verdict: "Low credibility indicators. Seek reputable sources."
    });
  }

  const tips = [
    "Cross-check with multiple reputable sources before sharing.",
    "Watch for emotionally charged wording and absolute claims.",
    "Check publication date and author expertise.",
    "Be cautious: automatic detectors can be wrong—use human judgment."
  ];

  let selectedTip = tips[0];
  if (biasLevel === "High") selectedTip = tips[1];
  else if (aiGenerated) selectedTip = tips[3];
  else if (credibilityScore < 50) selectedTip = tips[2];

  return {
    credibility_score: credibilityScore,
    ai_generated: aiGenerated,
    bias_level: biasLevel,
    fact_checks: factChecks,
    tips: selectedTip,
    confidence: Number(confidence.toFixed(2))
  };
} 