/* deviralizer: a chrome extension that hides viral content/clickbait in facebook
 * This lets you concentrate on content you really care about such as
 * posts from your friends and family!
 */

const attribute = 'data-pagelet',
  value = 'FeedUnit',
  likeQuerySelector = 'span .gpro0wi8.pcp91wgn',
  maxLikes = 100, // TBD needs to be configurable throught the UI
  config = { childList: true },
  debounceWait = 200;

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
  const likesElement = el.querySelector(likeQuerySelector);
  if (likesElement && getLikes(likesElement.innerText) > maxLikes) {
    //el.setAttribute('style', 'border: 1px solid red'); // debugging
    el.setAttribute('style', 'display: none');
  }
};

const deviralize = (feed) => {
  const elements = Array.from(feed.children);
  elements.forEach(processFeedElement);
};

const mocb = (mutationsList, observer) => {
  for (let mutation of mutationsList) {
    mutation.addedNodes.forEach(processFeedElement);
  }
};

const observer = new MutationObserver(mocb);

// Start observing the target node for configured mutations once the dom is loaded
setTimeout(() => {
  console.log('deviralizer loaded');
  const feed = document.querySelector('[role="feed"]');
  deviralize(feed);
  observer.observe(feed, config);
}, 1000);
