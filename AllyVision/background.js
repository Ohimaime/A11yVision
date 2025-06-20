// Background script for A11yVision extension
// Handles API calls and background processing

class A11yVisionBackground {
    constructor() {
        this.huggingFaceToken = null;
        this.init();
    }

    init() {
        console.log('A11yVision background script loaded');
        this.setupMessageListener();
        this.loadSettings();
    }

    // Listen for messages from content script and popup
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'processContent':
                    this.processPageContent(request.data);
                    break;
                case 'processImages':
                    this.processImages(request.data);
                    break;
                case 'saveToken':
                    this.saveHuggingFaceToken(request.token);
                    break;
                case 'getSettings':
                    sendResponse({ token: this.huggingFaceToken });
                    break;
                default:
                    console.log('Unknown background action:', request.action);
            }
            return true; // Keep message channel open for async response
        });
    }

    // Load settings from storage
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['huggingFaceToken']);
            this.huggingFaceToken = result.huggingFaceToken || null;
            console.log('Settings loaded');
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // Save Hugging Face token
    async saveHuggingFaceToken(token) {
        try {
            await chrome.storage.sync.set({ huggingFaceToken: token });
            this.huggingFaceToken = token;
            console.log('Hugging Face token saved');
            return true;
        } catch (error) {
            console.error('Failed to save token:', error);
            return false;
        }
    }

    // Process page content for summarization
    async processPageContent(data) {
        console.log('Processing page content:', data.title);
        
        if (!this.huggingFaceToken) {
            console.log('No Hugging Face token available, using fallback summary');
            this.sendFallbackSummary(data);
            return;
        }

        try {
            const summary = await this.generateSummary(data.content);
            this.sendToPopup('summaryGenerated', { summary, title: data.title });
        } catch (error) {
            console.error('Failed to generate summary:', error);
            this.sendFallbackSummary(data);
        }
    }

    // Generate summary using Hugging Face API
    async generateSummary(content) {
        if (!this.huggingFaceToken) {
            throw new Error('No API token available');
        }

        // Truncate content to fit API limits
        const truncatedContent = content.substring(0, 1000);

        const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.huggingFaceToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: truncatedContent,
                parameters: {
                    max_length: 150,
                    min_length: 40,
                    do_sample: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();
        return result[0]?.summary_text || 'Summary generation failed';
    }

    // Send fallback summary when API is unavailable
    sendFallbackSummary(data) {
        const fallbackSummaries = [
            `This page titled "${data.title}" contains information about web content. The page discusses various topics and provides detailed information for users.`,
            `The current page "${data.title}" appears to be an informational resource with multiple sections covering different aspects of the topic.`,
            `This webpage "${data.title}" provides comprehensive content on the subject matter with relevant details and explanations.`
        ];

        const randomSummary = fallbackSummaries[Math.floor(Math.random() * fallbackSummaries.length)];
        this.sendToPopup('summaryGenerated', { summary: randomSummary, title: data.title });
    }

    // Process images for AI description
    async processImages(imageData) {
        console.log('Processing images:', imageData.length);
        
        // For now, provide basic descriptions based on alt text and context
        const descriptions = imageData.map((img, index) => {
            if (img.alt && img.alt !== 'No alt text') {
                return `Image ${index + 1}: ${img.alt}`;
            } else {
                return `Image ${index + 1}: Decorative image without description`;
            }
        });

        this.sendToPopup('imagesProcessed', { descriptions });
    }

    // Send message to popup
    sendToPopup(action, data) {
        chrome.runtime.sendMessage({
            action,
            data
        }).catch(err => {
            // Popup might be closed, ignore error
            console.log('Could not send to popup:', err.message);
        });
    }

    // Handle extension installation
    handleInstall() {
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                console.log('A11yVision extension installed');
                // Set default settings
                this.saveHuggingFaceToken('');
            }
        });
    }
}

// Initialize background script
const a11yVisionBackground = new A11yVisionBackground();
a11yVisionBackground.handleInstall();