/* deviralizer: a chrome extension that hides viral content/clickbait in facebook
 * This lets you concentrate on content you really care about such as
 * posts from your friends and family!
 */

const likeQuerySelector = 'span .pcp91wgn';

let feedItemsFound,
  deviralizedItems,
  observerRunning = false,
  deviralizerActive = true,
  maxLikes = 500;

const getSettings = () => {
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
};

const getLikes = (text) => {
  const match = text.match(/(\d+[.,]?\d?)[KM]?/);
  let likes = parseFloat(match);
  if (likes) {
    const units = match[0].substring(match[0].length - 1, match[0].length);
    if (units === 'K') likes = likes * 1000;
    else if (units === 'M') likes = likes * 1000000;
  } else likes = null;
  return likes;
};

const processFeedElement = (el) => {
  if (!el.hasAttribute('likes')) {
    feedItemsFound += 1;
    const likesElement = el.querySelector(likeQuerySelector);
    if (likesElement) {
      const likes = getLikes(likesElement.innerText);
      if (likes > maxLikes) {
        deviralizedItems += 1;
        //el.setAttribute('style', 'border: 1px solid red'); // debugging
        el.setAttribute('style', 'display: none');
        //el.remove(); // turns out to perform poorly
      }
      el.setAttribute('likes', likes);
    } else el.setAttribute('likes', -1);
    console.log(
      `deviralized ${deviralizedItems} of ${feedItemsFound} feed items (${(
        (100 * deviralizedItems) /
        feedItemsFound
      ).toFixed(0)}%)`
    );
  }
};

const deviralize = (feed) =>
  Array.from(feed.children).forEach(processFeedElement);

const mocb = (mutationsList, observer) => {
  for (let mutation of mutationsList)
    mutation.addedNodes.forEach(processFeedElement);
};

const observer = new MutationObserver(mocb);

// Poll for changes to the current path and/or settings
setInterval(() => {
  getSettings();
  const feed = document.querySelector('[role="feed"]');
  if (feed && !observerRunning && deviralizerActive) {
    console.log('deviralizer loaded');
    feedItemsFound = 0;
    deviralizedItems = 0;

    // fb loads 3 feed items up front, as these won't be caught by the observer
    // they need to be processed independently
    deviralize(feed);

    // observe the feed for new children
    observer.observe(feed, { childList: true });
    observerRunning = true;
  } else if (feed && observerRunning && deviralizerActive) {
    // keep observer alive (it seems to die for no reason)
    observer.observe(feed, { childList: true });
  } else if (
    (!feed && observerRunning && deviralizerActive) ||
    (observerRunning && !deviralizerActive)
  ) {
    // don't observe when not looking at the feed or when deviralizer is not active
    console.log('deviralizer paused');
    observer.disconnect();
    observerRunning = false;
  }
}, 2000);
