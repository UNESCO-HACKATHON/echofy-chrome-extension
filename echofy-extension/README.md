# Echofy Chrome Extension

A powerful Chrome extension that analyzes selected text for credibility, bias, and AI-generated content indicators. Built with vanilla JavaScript and Manifest V3 for maximum compatibility and performance.

## 🎯 Features

- **Text Credibility Analysis**: Get credibility scores (0-100) based on content quality indicators
- **Bias Detection**: Identify Low/Moderate/High bias levels in text content
- **AI-Generated Content Detection**: Detect potentially AI-generated text patterns
- **Fact-Check Integration**: Links to trusted fact-checking sources when suspicious content is detected
- **Analysis History**: Stores and retrieves your last 10 analyses locally
- **Multiple Input Methods**: Context menu, double-click selection, or manual paste
- **Privacy-First**: All analysis happens locally - no data sent to external servers
- **Clean UI**: Modern interface with exact brand colors and smooth animations

## 🎨 Design

**Color Palette:**
- Deep Indigo `#2B2D42` (Primary)
- Neon Cyan `#00FFF7` (Accent)  
- Soft Coral `#FF6B6B` (Warnings)
- Slate `#EDF2F4` (Background)
- Charcoal `#1A1B25` (Text)

**Typography:** Inter, system-ui, Arial

## 📁 File Structure

```
Echofy/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker with context menu & analysis
├── contentScript.js       # Floating bubble & sidebar injection
├── sidebar.html           # Sidebar interface with tabs
├── sidebar.css            # Styled with exact brand colors
├── sidebar.js             # Tab management, analysis, & history
├── README.md              # This file
└── icons/
    ├── icon16.png         # Extension icon (16x16)
    ├── icon48.png         # Extension icon (48x48)
    └── icon128.png        # Extension icon (128x128)
```

## 🚀 Installation

### Method 1: Load Unpacked (Development)

1. **Download/Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `Echofy` folder
5. **Pin the extension** to your toolbar (optional)

### Method 2: Generate Icons First

If you need to create the placeholder icons:

1. Open `icons/create_icons.html` in your browser
2. Right-click each generated icon and "Save image as..."
3. Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the `icons/` folder
4. Follow Method 1 above

## 📖 How to Use

### Context Menu Analysis
1. **Highlight text** on any webpage
2. **Right-click** and select "Analyze with Echofy"
3. **View results** in the slide-in sidebar

### Double-Click Analysis
1. **Highlight text** on any webpage  
2. **Double-click** the selected text
3. **Sidebar opens** automatically with analysis

### Manual Analysis
1. **Click the floating bubble** (🔍) on any page
2. **Paste text** into the textarea
3. **Click "Analyze Selected Text"** button

### History & Navigation
- **History Tab**: View your last 10 analyses
- **Click any history item** to restore its results
- **Clear All** button to reset history
- **About Tab**: Learn more about Echofy

## 🧪 Testing Guide

### Basic Functionality
1. **Load Extension**: No errors in `chrome://extensions`
2. **Floating Bubble**: Appears on any webpage (bottom-right)
3. **Bubble Toggle**: Click to open/close sidebar
4. **Sidebar UI**: All tabs (Analyze, History, About) work properly

### Analysis Testing

**Test with Normal Text:**
```
"The weather today is sunny and pleasant."
```
Expected: High credibility score, low bias, unlikely AI-generated

**Test with Clickbait:**
```
"SHOCKING secret EXPOSED! You won't believe what happens next!"
```
Expected: Lower credibility score, higher bias, fact-check links appear

**Test with Emotional Language:**
```
"This is absolutely the most incredible thing everyone needs to know immediately!"
```
Expected: Moderate bias, reduced credibility score

**Test with AI Indicators:**
```
"As an AI, it's important to note that this requires careful consideration. In conclusion, the analysis suggests multiple factors."
```
Expected: AI-generated marked as "Likely"

### User Flow Testing
1. **Context Menu**: Highlight text → Right-click → "Analyze with Echofy" → Results appear
2. **Double-Click**: Highlight text → Double-click → Sidebar opens → Analysis runs
3. **Manual Input**: Open sidebar → Paste text → Click analyze → Results display
4. **History**: Complete analysis → Switch to History tab → See saved item → Click item → Results restore
5. **Clear History**: History tab → Click "Clear All" → Confirm → History empty

### Error Handling
- **Empty text**: Button disabled until 10+ characters
- **Network errors**: Graceful error messages
- **Storage errors**: History still functions without sync

## 🔧 Technical Details

### Architecture
- **Manifest V3**: Modern service worker background script
- **Shadow DOM**: Complete style isolation from host pages  
- **Message Passing**: Secure communication between components
- **Chrome Storage Sync**: Cross-device history synchronization
- **Vanilla JavaScript**: No frameworks, maximum compatibility

### Browser Permissions
- `contextMenus`: Right-click menu integration
- `scripting`: Content script injection
- `activeTab`: Access to current tab content
- `storage`: Local analysis history storage

### Mock Analysis Algorithm
The extension includes a sophisticated local analyzer that:
- Detects clickbait patterns and sensational language
- Identifies excessive capitalization and emotional terms
- Recognizes AI-generated content markers
- Scores credibility based on multiple factors
- Provides appropriate fact-check resources

### Performance
- **Lightweight**: ~50KB total size
- **Fast Analysis**: Local processing in <100ms
- **Memory Efficient**: Minimal background resource usage
- **Cross-Site Compatible**: Works on all websites

## 🐛 Troubleshooting

### Extension Not Loading
- Check Developer Mode is enabled
- Ensure all files are present in folder
- Look for errors in `chrome://extensions`

### Sidebar Not Appearing
- Check for JavaScript errors in page console
- Verify content script injection
- Try refreshing the page

### Analysis Not Working
- Open Service Worker console from `chrome://extensions`
- Check for background script errors
- Verify message passing between components

### History Not Saving
- Check Chrome storage permissions
- Clear extension data and retry
- Verify chrome.storage.sync availability

## 🔒 Privacy & Security

- **Local Processing**: All text analysis happens in your browser
- **No External Calls**: No data sent to remote servers
- **Secure Storage**: History stored locally with Chrome's secure APIs
- **XSS Protection**: All user input properly sanitized
- **Shadow DOM**: Complete isolation from host page styles and scripts

## 🚧 Development

### Code Standards
- **ES6+**: Modern JavaScript features
- **Strict Mode**: All scripts use `'use strict'`
- **Modular Functions**: Small, focused, well-documented functions
- **Error Handling**: Defensive programming with try-catch blocks
- **Security**: Input sanitization and XSS prevention

### Testing Checklist
- [ ] Extension loads without errors
- [ ] Floating bubble appears and functions
- [ ] Context menu integration works
- [ ] Double-click selection works
- [ ] Manual text analysis works
- [ ] All three analysis types produce different results
- [ ] History saves and loads correctly
- [ ] History items restore properly
- [ ] Clear history functions
- [ ] No console errors in any context
- [ ] Works across different websites
- [ ] Sidebar styling is isolated from host pages

## 📜 License

This project is open source. Feel free to modify and distribute according to your needs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using the testing guide above
5. Submit a pull request

---

**Version**: 1.0.0  
**Compatibility**: Chrome 88+, Manifest V3  
**Built with**: Vanilla HTML/CSS/JavaScript
