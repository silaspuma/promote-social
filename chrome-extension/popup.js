// Popup script for promote.social extension

document.addEventListener('DOMContentLoaded', () => {
  // Set version
  const version = chrome.runtime.getManifest().version;
  document.getElementById('version').textContent = version;

  // Open site button
  document.getElementById('openSite').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });

  // Check status button
  document.getElementById('checkStatus').addEventListener('click', async () => {
    const statusText = document.querySelector('.status-text');
    statusText.textContent = 'Checking...';

    try {
      // Get current active tokens
      const storage = await chrome.storage.local.get(null);
      const activeTokens = Object.keys(storage).filter(k => 
        k.startsWith('token_') && storage[k].expiresAt > Date.now()
      );

      if (activeTokens.length > 0) {
        statusText.textContent = `${activeTokens.length} active completion token(s) ready to use.`;
      } else {
        statusText.textContent = 'No active tokens. Complete a task on promote.social to generate one.';
      }
    } catch (error) {
      statusText.textContent = 'Error checking status. Please try again.';
      console.error('Error:', error);
    }
  });
});
