// Background service worker for promote.social extension

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE_COMPLETION_TOKEN') {
    handleGenerateToken(message.data, sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'CHECK_EXTENSION_STATUS') {
    sendResponse({ installed: true, version: chrome.runtime.getManifest().version });
    return true;
  }
});

// Generate a secure completion token
async function handleGenerateToken(data, sendResponse) {
  try {
    const { taskId, userId, siteUrl } = data;
    
    if (!taskId || !userId) {
      sendResponse({ success: false, error: 'Missing required data' });
      return;
    }

    // Generate a cryptographically secure token
    const tokenData = {
      taskId,
      userId,
      timestamp: Date.now(),
      random: generateSecureRandom()
    };

    // Create a hash of the token data
    const tokenString = JSON.stringify(tokenData);
    const token = await hashString(tokenString);

    // Store token in extension storage with expiry
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
    await chrome.storage.local.set({
      [`token_${taskId}_${userId}`]: {
        token,
        tokenData,
        expiresAt
      }
    });

    sendResponse({ 
      success: true, 
      token,
      tokenData,
      expiresAt 
    });
  } catch (error) {
    console.error('Error generating token:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Generate secure random string
function generateSecureRandom() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash a string using SubtleCrypto
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Listen for tab updates to detect when user returns from task
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if user is returning to promote.social
    const promoteSocialUrls = [
      'localhost:3000',
      'promote.social',
      '.vercel.app'
    ];
    
    const isPromoteSocial = promoteSocialUrls.some(domain => 
      tab.url.includes(domain)
    );

    if (isPromoteSocial) {
      // Notify content script that user returned
      chrome.tabs.sendMessage(tabId, { 
        type: 'USER_RETURNED',
        timestamp: Date.now()
      }).catch(() => {
        // Ignore errors if content script not ready
      });
    }
  }
});

// Clean up expired tokens periodically
setInterval(async () => {
  const storage = await chrome.storage.local.get(null);
  const now = Date.now();

  for (const key in storage) {
    if (key.startsWith('token_')) {
      const data = storage[key];
      if (data.expiresAt && data.expiresAt < now) {
        await chrome.storage.local.remove(key);
      }
    }
  }
}, 60000); // Check every minute
