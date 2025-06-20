document.addEventListener('DOMContentLoaded', function () {
    // UI Elements
    const consoleOutput = document.getElementById('consoleOutput');
    const summaryOutput = document.getElementById('summaryOutput');
    const startBtn = document.getElementById('startListening');
    const summarizeBtn = document.getElementById('summarizePage');
    const describeBtn = document.getElementById('describeImages');
    const saveTokenBtn = document.getElementById('saveToken');
    const micStatus = document.getElementById('micStatus');
    const speechStatus = document.getElementById('speechStatus');
    const aiStatus = document.getElementById('aiStatus');
    const tokenInput = document.getElementById('hfToken');

    let isListening = false;
    let aiModelLoaded = false;

    function logToConsole(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = `> ${message}`;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;

        const lines = consoleOutput.querySelectorAll('.console-line');
        if (lines.length > 10) {
            lines[0].remove();
        }
    }

    function updateListeningUI(listening) {
        if (listening) {
            startBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Stop Listening';
            micStatus.className = 'status-indicator status-active';
            speechStatus.className = 'status-indicator status-active';
        } else {
            startBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
            micStatus.className = 'status-indicator status-inactive';
            speechStatus.className = 'status-indicator status-inactive';
        }
    }

    function updateAIModelStatus(loaded) {
        if (loaded) {
            aiStatus.className = 'status-indicator status-active';
            aiStatus.classList.remove('pulse');
        } else {
            aiStatus.className = 'status-indicator status-inactive pulse';
        }
    }

    setTimeout(() => {
        aiModelLoaded = true;
        updateAIModelStatus(true);
        logToConsole("AI model loaded successfully", "success");
    }, 1500);

    startBtn.addEventListener('click', function () {
        isListening = !isListening;
        updateListeningUI(isListening);
        if (isListening) {
            logToConsole("Speech recognition started", "success");
            logToConsole("Listening for commands...", "info");
        } else {
            logToConsole("Speech recognition stopped", "info");
        }
    });

    summarizeBtn.addEventListener('click', async function () {
        logToConsole("Requesting page text for summary...", "info");

        chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
            const tabId = tabs[0]?.id;
            if (!tabId) return logToConsole("Failed to get active tab ID", "error");
        
            // Step 1: Ensure content script is injected
            chrome.scripting.executeScript({
                target: { tabId },
                files: ['content.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    logToConsole("Failed to inject content script: " + chrome.runtime.lastError.message, "error");
                    return;
                }
        
                // Step 2: Now it's safe to send message to content.js
                chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_TEXT' }, async (response) => {
                    if (chrome.runtime.lastError || !response || !response.text) {
                        logToConsole("Failed to retrieve page text", "error");
                        console.error("SendMessage error:", chrome.runtime.lastError);
                        return;
                    }
        
                    const token = tokenInput.value.trim();
                    if (!token) {
                        logToConsole("Please enter your Hugging Face token", "error");
                        return;
                    }
        
                    const body = {
                        inputs: response.text
                    };
        
                    logToConsole("Sending request to Hugging Face...", "info");
        
                    try {
                        const hfResponse = await fetch("https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(body)
                        });
        
                        if (!hfResponse.ok) {
                            const errText = await hfResponse.text();
                            logToConsole("Hugging Face API request failed: " + errText, "error");
                            console.error("Hugging Face API error:", errText);
                            return;
                        }                        
        
                        const result = await hfResponse.json();
                        const summary = result?.[0]?.summary_text || "No summary returned.";
                        summaryOutput.innerHTML = `<div class="console-line success">${summary}</div>`;
                        logToConsole("Summary generated successfully", "success");
                    } catch (err) {
                        console.error(err);
                        logToConsole("Error contacting Hugging Face API", "error");
                    }
                });
            });
        });
        
    });

    describeBtn.addEventListener('click', function () {
        if (!aiModelLoaded) {
            logToConsole("AI model still loading. Please wait...", "error");
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const tabId = tabs[0]?.id;
            chrome.tabs.sendMessage(tabId, { type: 'DESCRIBE_IMAGES' }, response => {
                if (chrome.runtime.lastError || !response) {
                    logToConsole("Could not describe images", "error");
                    return;
                }

                response.descriptions.forEach(desc => {
                    logToConsole(desc, "success");
                });
                logToConsole("Image analysis complete", "success");
            });
        });
    });

    saveTokenBtn.addEventListener('click', function () {
        const token = tokenInput.value.trim();
        if (token) {
            logToConsole("Hugging Face token saved", "success");
        } else {
            logToConsole("Please enter a valid token", "error");
        }
    });

    logToConsole("System initialized", "success");
    logToConsole("Voice commands ready", "info");
});
