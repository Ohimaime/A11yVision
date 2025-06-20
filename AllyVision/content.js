
class A11yVision {
    constructor() {
      this.isReading = false;
      this.speechSynthesis = window.speechSynthesis;
      this.currentUtterance = null;
      this.init();
    }
  
    init() {
      console.log('A11yVision content script loaded');
      this.setupMessageListener();
      this.setupKeyboardShortcuts();
    }
  
    setupMessageListener() {
        const self = this; // preserve class context
    
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.type) {
                case 'GET_PAGE_TEXT':
                    const text = self.extractPageText();
                    if (text) {
                        sendResponse({ text });
                    } else {
                        sendResponse({ error: 'Failed to retrieve page text' });
                    }
                    return true; // keep port open for async sendResponse
    
                case 'readPage':
                    self.readPage();
                    break;
    
                case 'stopReading':
                    self.stopReading();
                    break;
    
                case 'describeImages':
                    self.describeImages();
                    break;
    
                case 'scrollDown':
                    self.scrollPage('down');
                    break;
    
                case 'scrollUp':
                    self.scrollPage('up');
                    break;
    
                default:
                    console.log('Unknown action:', request.action);
            }
    
            sendResponse({ status: 'received' });
            return true;
        });
    }    
  
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'r') {
          e.preventDefault();
          this.readPage();
        }
        if (e.altKey && e.key === 's') {
          e.preventDefault();
          this.stopReading();
        }
        if (e.altKey && e.key === 'd') {
          e.preventDefault();
          this.describeImages();
        }
      });
    }
  
    readPage() {
      if (this.isReading) {
        this.stopReading();
        return;
      }
      const textContent = this.extractPageText();
      if (!textContent) {
        this.speak("No readable content found on this page.");
        return;
      }
      this.speak(textContent);
      this.isReading = true;
      console.log('Started reading page');
    }
  
    extractPageText() {
      const elementsToRemove = document.querySelectorAll('script, style, nav, footer, .ad, .advertisement');
      elementsToRemove.forEach(el => el.style.display = 'none');
  
      const contentSelectors = [
        'main',
        'article',
        '[role="main"]',
        '.content',
        '.main-content',
        'body'
      ];
  
      let content = '';
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          content = element.innerText;
          break;
        }
      }
  
      return content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim()
        .substring(0, 5000);
    }
  
    stopReading() {
      if (this.currentUtterance) {
        this.speechSynthesis.cancel();
        this.isReading = false;
        console.log('Stopped reading');
      }
    }
  
    speak(text) {
      this.stopReading();
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.rate = 0.9;
      this.currentUtterance.pitch = 1;
      this.currentUtterance.volume = 0.8;
      this.currentUtterance.onend = () => {
        this.isReading = false;
      };
      this.currentUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        this.isReading = false;
      };
      this.speechSynthesis.speak(this.currentUtterance);
    }
  
    describeImages() {
      const images = document.querySelectorAll('img');
      const imageData = [];
      images.forEach((img, index) => {
        if (img.src && img.offsetWidth > 50 && img.offsetHeight > 50) {
          imageData.push({
            src: img.src,
            alt: img.alt || 'No alt text',
            title: img.title || '',
            index: index + 1
          });
        }
      });
  
      if (imageData.length === 0) {
        this.speak("No significant images found on this page.");
        return;
      }
  
      let description = `Found ${imageData.length} images on this page. `;
      imageData.forEach((img, index) => {
        description += `Image ${index + 1}: ${img.alt || 'No description available'}. `;
      });
      this.speak(description);
  
      chrome.runtime.sendMessage({
        action: 'processImages',
        data: imageData
      });
    }
  
    scrollPage(direction) {
      const scrollAmount = window.innerHeight * 0.8;
      if (direction === 'down') {
        window.scrollBy(0, scrollAmount);
      } else if (direction === 'up') {
        window.scrollBy(0, -scrollAmount);
      }
    }
  }
  
  const a11yVision = new A11yVision();
  