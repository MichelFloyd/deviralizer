/* deviralizer: a chrome extension that hides viral content/clickbait in facebook
 * This lets you concentrate on content you really care about such as
 * posts from your friends and family!
 */

const likeQuerySelector = 'span .pcp91wgn',
  maxLikes = 500; // TBD needs to be configurable throught the UI

let feedItemsFound = 0,
  deviralizedItems = 0;

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
  }
  console.log(
    `deviralized ${deviralizedItems} of ${feedItemsFound} feed items (${(
      (100 * deviralizedItems) /
      feedItemsFound
    ).toFixed(0)}%)`
  );
};

const deviralize = (feed) => Array.from(feed.children).forEach(processFeedElement);

const mocb = (mutationsList, observer) => {
  for (let mutation of mutationsList) mutation.addedNodes.forEach(processFeedElement);
};

const observer = new MutationObserver(mocb);

// Start observing the target node for configured mutations once the dom is loaded
setTimeout(() => {
  console.log('deviralizer loaded');
  const feed = document.querySelector('[role="feed"]');
  // fb loads 3 feed items up front, as these won't be caught by the observer
  // they need to be processed independently
  deviralize(feed);
  // observe the feed for new children
  observer.observe(feed, { childList: true });
}, 1000);
