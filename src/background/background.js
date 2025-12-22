/**
 * Background script for Image Prompt Helper
 * Handles context menu for image editing
 */

// Create context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'edit-image-prompt',
        title: 'Edit with Prompt Helper',
        contexts: ['image']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'edit-image-prompt') {
        // Send message to content script with image URL
        chrome.tabs.sendMessage(tab.id, {
            type: 'OPEN_IMAGE_EDITOR',
            imageUrl: info.srcUrl
        });
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_IMAGE_DATA') {
        const headers = new Headers();

        // Use the page's referrer to bypass hotlink protection
        const fetchOptions = {
            method: 'GET',
            cache: 'force-cache'
        };

        if (message.referrer) {
            // Note: in some contexts we can't set exact referrer, but we can try
            // or we rely on the extension host permission to bypass CORS checks 
            // which often makes the server ignore referrer checks if Origin is missing/extension
            // But for Google, explicit referrer usually helps.
            // However, fetch API restricts setting 'Referer' header manually in some Env.
            // But we can try passing it in options.
            fetchOptions.referrer = message.referrer;
        }

        // Fetch image data and return as base64
        console.log('Fetching image via background:', message.imageUrl);
        fetch(message.imageUrl, fetchOptions)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    sendResponse({ success: true, dataUrl: reader.result });
                };
                reader.onerror = () => {
                    sendResponse({ success: false, error: 'Failed to read image' });
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Background fetch failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep channel open for async response
    }

    if (message.type === 'FETCH_IMAGE_VIA_TAB') {
        const imageUrl = message.imageUrl;

        // Open a new inactive tab with the image
        chrome.tabs.create({ url: imageUrl, active: false }, (tab) => {
            const tabId = tab.id;

            // Wait for tab to load
            const listener = (tid, changeInfo, tabInfo) => {
                if (tid === tabId && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);

                    // Execute script to get image data (Same-Origin fetch)
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: async () => {
                            try {
                                const response = await fetch(location.href);
                                const blob = await response.blob();
                                return new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve({ success: true, dataUrl: reader.result });
                                    reader.onerror = () => resolve({ success: false, error: 'Reader error' });
                                    reader.readAsDataURL(blob);
                                });
                            } catch (e) {
                                return { success: false, error: e.toString() };
                            }
                        }
                    }, (results) => {
                        // Close the tab immediately
                        chrome.tabs.remove(tabId);

                        if (chrome.runtime.lastError) {
                            sendResponse({ success: false, error: chrome.runtime.lastError.message });
                        } else if (results && results[0] && results[0].result) {
                            sendResponse(results[0].result);
                        } else {
                            sendResponse({ success: false, error: 'Script execution failed' });
                        }
                    });
                }
            };
            chrome.tabs.onUpdated.addListener(listener);

            // Timeout cleanup (in case it hangs)
            setTimeout(() => {
                chrome.tabs.get(tabId, (t) => {
                    if (chrome.runtime.lastError) return; // Already closed
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.remove(tabId);
                    sendResponse({ success: false, error: 'Timeout loading image tab' });
                });
            }, 10000); // 10s timeout
        });
        return true; // Keep channel open
    }

    if (message.type === 'CAPTURE_VISIBLE_TAB') {
        chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                console.error('Capture failed:', chrome.runtime.lastError.message);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ success: true, dataUrl });
            }
        });
        return true;
    }
});
