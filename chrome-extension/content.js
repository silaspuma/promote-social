// Content script for promote.social extension

(function() {
  'use strict';

  // Signal to the page that extension is installed
  window.addEventListener('load', () => {
    signalExtensionInstalled();
  });

  // Signal extension is installed
  function signalExtensionInstalled() {
    window.postMessage({
      type: 'PROMOTE_SOCIAL_EXTENSION_INSTALLED',
      version: chrome.runtime.getManifest().version
    }, '*');
  }

  // Listen for messages from the webpage
  window.addEventListener('message', async (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;

    const message = event.data;

    // Handle extension status check
    if (message.type === 'CHECK_EXTENSION_INSTALLED') {
      signalExtensionInstalled();
    }

    // Handle token generation request
    if (message.type === 'REQUEST_COMPLETION_TOKEN') {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GENERATE_COMPLETION_TOKEN',
          data: message.data
        });

        window.postMessage({
          type: 'COMPLETION_TOKEN_RESPONSE',
          data: response,
          requestId: message.requestId
        }, '*');
      } catch (error) {
        console.error('Error requesting token:', error);
        window.postMessage({
          type: 'COMPLETION_TOKEN_RESPONSE',
          data: { success: false, error: error.message },
          requestId: message.requestId
        }, '*');
      }
    }
  });

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'USER_RETURNED') {
      window.postMessage({
        type: 'USER_RETURNED_TO_SITE',
        timestamp: message.timestamp
      }, '*');
    }
  });

  // Initial signal
  signalExtensionInstalled();
})();
