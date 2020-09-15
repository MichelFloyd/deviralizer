// Run the cron from the background script
const pollingInterval = 2000;
let deviralizerActive = true,
  maxLikes = 500;

const getSettings = () => {
  chrome.storage.sync.get(['deviralizerActive','maxLikes'], (result) => {
    if (result.deviralizerActive === undefined)
      chrome.storage.sync.set({ deviralizerActive });
    else deviralizerActive = result.deviralizerActive;
    // set appropriate icon
    const path = deviralizerActive
      ? 'images/icon-16.png'
      : 'images/icon-disabled-16.png';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) chrome.pageAction.setIcon({ tabId, path });
    });

    if (result.maxLikes === undefined) chrome.storage.sync.set({ maxLikes });
    else maxLikes = result.maxLikes;
  });
};

setInterval(() => {
  getSettings();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { deviralizerActive, maxLikes });
  });
}, pollingInterval);

// TBD: update the DOM when the settings change
//   1. deviralizer is disabled: change the style to show the divs
//   2. maxLikes is changed: go through all the feed items and update the dv attribute
