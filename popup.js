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
    chrome.storage.sync.set({ deviralizer: this.checked });
    tf.disabled = !deviralizer;
  };

  tf.onchange = (ev) => chrome.storage.sync.set({ maxLikes: this.value });
};
