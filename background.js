// Run the cron from the background script
const pollingInterval = 2000;
let deviralizerActive = true,
maxLikes = 500;

const getSettings = () => {
  chrome.storage.sync.get(['deviralizerActive'], (result) => {
    if (result.deviralizerActive === undefined)
      chrome.storage.sync.set({ deviralizerActive });
    else deviralizerActive = result.deviralizerActive;
  });

  chrome.storage.sync.get(['maxLikes'], (result) => {
    if (result.maxLikes === undefined)
      chrome.storage.sync.set({ maxLikes });
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
