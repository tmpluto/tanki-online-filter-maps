// Content scripts can't call chrome.runtime.openOptionsPage() themselves,
// so they ask the service worker to do it.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "open-options") {
    chrome.runtime.openOptionsPage();
  }
});