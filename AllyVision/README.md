# A11yVision - AI Accessibility Browser Extension

A browser extension designed to help visually impaired users access web content through AI-powered features like voice commands, page summarization, and image descriptions.

## 📁 File Structure

```
a11yvision-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── styles.css            # All CSS styles
├── content.js            # Content script (runs on web pages)
├── background.js         # Background service worker
├── icons/                # Extension icons folder
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## 🚀 Installation Guide

### 1. Create Project Folder
Create a new folder called `a11yvision-extension` on your computer.

### 2. Add Files
Copy each of the provided files into your project folder:
- `manifest.json`
- `popup.html`
- `popup.js` 
- `styles.css`
- `content.js`
- `background.js`

### 3. Create Icons Folder
Create an `icons` folder inside your project directory and add three icon files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels) 
- `icon128.png` (128x128 pixels)

*You can create simple icons with any image editor or use free icon resources online.*

### 4. Load Extension in Browser

#### For Chrome/Edge:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select your `a11yvision-extension` folder
5. The extension should now appear in your extensions list

#### For Firefox:
1. Go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select any file from your extension folder

## 🎯 Features Explained

### 1. **Voice Control** (`popup.js` + `content.js`)
- Provides voice commands like "Read page", "Scroll down", etc.
- Uses browser's Speech Recognition API
- Content script handles the actual page interactions

### 2. **Page Summarization** (`background.js`)
- Extracts page content and generates summaries
- Can use Hugging Face API for AI-powered summaries
- Falls back to basic summaries if no API token provided

### 3. **Image Description** (`content.js`)
- Finds images on the page
- Reads alt text aloud
- Can be extended with AI image recognition APIs

### 4. **Text-to-Speech** (`content.js`)
- Reads page content aloud using browser's Speech Synthesis
- Supports pause/resume functionality
- Keyboard shortcuts (Alt+R to read, Alt+S to stop)

## 🔧 Code Breakdown

### `manifest.json`
- Defines extension permissions and structure
- Specifies which files to load and when
- Sets up popup interface and background scripts

### `popup.html` & `popup.js`
- Main user interface with cards for each feature
- Handles button clicks and user interactions
- Communicates with content and background scripts

### `content.js`
- Runs on every webpage
- Extracts page content and reads it aloud
- Handles voice commands and keyboard shortcuts
- Finds and processes images

### `background.js`
- Handles API calls to external services
- Manages extension settings and storage
- Processes data that doesn't need DOM access

### `styles.css`
- Modern, accessible design
- Responsive layout that works on different screen sizes
- High contrast colors for better visibility

## 🔑 API Configuration

To use AI-powered summaries:

1. Get a free Hugging Face token at [huggingface.co](https://huggingface.co)
2. Open the extension popup
3. Go to Settings card
4. Enter your token and click "Save Token"

## 🛠️ Development Tips

### Testing the Extension:
1. Make changes to your files
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test the new functionality

### Debugging:
- **Popup issues**: Right-click extension icon → "Inspect popup"
- **Content script issues**: F12 on any webpage → Console tab
- **Background script issues**: `chrome://extensions/` → Click "Inspect views: background page"

### Adding New Features:
1. Add UI elements to `popup.html`
2. Add event listeners in `popup.js`
3. Send messages to `content.js` or `background.js`
4. Implement the actual functionality

## 🔒 Privacy & Security

- Extension only accesses pages when actively used
- API tokens stored locally in browser
- No data sent to external servers except chosen AI APIs
- All processing happens locally when possible

## 🐛 Common Issues

1. **Extension won't load**: Check manifest.json syntax
2. **Features don't work**: Check browser console for errors
3. **Voice not working**: Ensure microphone permissions granted
4. **API errors**: Verify Hugging Face token is valid

## 📝 Next Steps

To make this production-ready:
1. Add proper error handling
2. Implement real voice recognition
3. Add more AI services integration
4. Create proper icon files
5. Add unit tests
6. Optimize performance

## 🤝 Contributing

Feel free to modify and improve this extension for your specific needs!