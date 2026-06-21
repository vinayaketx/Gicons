/**
 * Gicons — Background Service Worker
 * Relays keyboard shortcuts to the active Gmail tab.
 */

// Relay Chrome command shortcuts to the active Gmail tab
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'filter-by-sender') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('mail.google.com')) {
        chrome.tabs.sendMessage(tab.id, { type: 'GICONS_SHORTCUT', action: 'filterSender' });
      }
    } catch (err) {
      // Tab might not be ready — safe to ignore
    }
  }
});
