/* deviralizer: a chrome extension that hides viral content/clickbait in facebook
 * This lets you concentrate on content you really care about such as
 * posts from your friends and family!
 */

const likeQuerySelector = 'span .pcp91wgn';

let feedItemsFound = 0,
  deviralizedItems = 0;

// Insert a new style at the TOP of the <head> element (if you put it at the end react will remove it)
const head = document.head,
  style = document.createElement('style');

style.type = 'text/css';
style.innerText = '[dv]{display: none;}';
head.insertBefore(style, head.childNodes[0]);

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

const processFeedElement = (el, maxLikes) => {
  if (!el.hasAttribute('likes')) {
    feedItemsFound += 1;
    const likesElement = el.querySelector(likeQuerySelector);
    if (likesElement) {
      const likes = getLikes(likesElement.innerText);
      if (likes > maxLikes) {
        deviralizedItems += 1;
        //el.setAttribute('style', 'border: 1px solid red'); // debugging
        el.setAttribute('dv', '');
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

const deviralize = (feed, maxLikes) =>
  Array.from(feed.children).forEach((el) => processFeedElement(el, maxLikes));

const reprocessFeedElement = (el, maxLikes) => {
  if (el.hasAttribute('likes')) {
    feedItemsFound += 1;
    const likes = parseInt(el.getAttribute('likes'));
    if (likes > maxLikes) {
      deviralizedItems += 1;
      el.setAttribute('dv', '');
    } else {
      el.removeAttribute('dv');
    }
  }
};

// handle changes to the maxLikes setting
const reprocessFeed = (feed, maxLikes) => {
  console.log('reprocessing');
  feedItemsFound = 0;
  deviralizedItems = 0;
  Array.from(feed.children).forEach((el) => reprocessFeedElement(el, maxLikes));
};

// toggle the display of deviralized items on/off

const toggle = (deviralizerActive) => {
  console.log('toggling');
  const style = head.childNodes[0];
  style.innerText = deviralizerActive
    ? '[dv]{display: none;}'
    : '[dv]{display: block;}';
  head.replaceChild(style, style);
};

// poll instead of using a mutation observer because the mutation observer seems to shut itself off
// for no good reason
chrome.runtime.onMessage.addListener(
  ({ deviralizerActive, maxLikes, toggleDeviralizer, reprocess }) => {
    const feed = document.querySelector('[role="feed"]');
    if (feed && reprocess) reprocessFeed(feed, maxLikes);
    else if (feed && toggleDeviralizer) toggle(deviralizerActive);
    else if (feed && deviralizerActive) deviralize(feed, maxLikes);
  }
);
