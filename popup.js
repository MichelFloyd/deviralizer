window.onload = function () {
  const cb = document.getElementById('deviralizerActive'),
    tf = document.getElementById('maxLikes');

  chrome.storage.sync.get(['deviralizer'], ({ deviralizer }) => {
    if (!!deviralizer) cb.checked = deviralizer;
    tf.disabled = !deviralizer;
  });

  chrome.storage.sync.get(['maxLikes'], ({ maxLikes }) => {
    if (!!maxLikes) tf.value = maxLikes;
  });

  cb.onclick = function (ev) {
    const deviralizerActive =  this.checked;
    chrome.storage.sync.set({ deviralizer: deviralizerActive });
    tf.disabled = !deviralizerActive;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { deviralizerActive, toggleDeviralizer: true });
    });
  
  };

  tf.onchange = function(ev) {
    const maxLikes = this.value;
    chrome.storage.sync.set({ maxLikes });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { maxLikes, reprocess: true });
    });
  };
};
