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
    tf.disabled = !this.checked;
  };

  tf.onchange = function(ev) {
    console.log(this.value);
    chrome.storage.sync.set({ maxLikes: this.value });
  };
};
