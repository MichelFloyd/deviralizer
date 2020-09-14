// Run the cron from the background script
const pollingInterval = 2000;

const getSettings = () => {
  const deviralizerActive = true,
    maxLikes = 500;
  chrome.storage.sync.get(['deviralizer'], (result) => {
    if (result.deviralizer === undefined)
      chrome.storage.sync.set({ deviralizer: deviralizerActive });
    else deviralizerActive = result.deviralizer;
  });

  chrome.storage.sync.get(['maxLikes'], (result) => {
    if (result.maxLikes === undefined)
      chrome.storage.sync.set({ maxLikes: maxLikes });
    else maxLikes = result.maxLikes;
  });
  return { deviralizerActive, maxLikes };
};
setInterval(() => {
  ({ deviralizerActive, maxLikes } = getSettings());
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { deviralizerActive, maxLikes });
  });
}, pollingInterval);
