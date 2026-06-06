// content.js — injected into YouTube, Facebook, Twitter/X

function getPlatform() {
  const host = window.location.hostname;
  if (host.includes("youtube.com")) return "youtube";
  if (host.includes("facebook.com")) return "facebook";
  if (host.includes("twitter.com") || host.includes("x.com")) return "twitter";
  return null;
}

function getVideoId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("v");
}

function scrapeFacebookComments() {
  const texts = [];

  const postBodies = document.querySelectorAll(
    '[data-ad-preview="message"], [data-testid="post_message"], div[dir="auto"] > div > div > span',
  );
  postBodies.forEach((el) => {
    const t = el.innerText?.trim();
    if (t && t.length > 10) texts.push(t);
  });

  const commentSelectors = [
    'div[aria-label="Comment"] span[dir="auto"]',
    'ul[class] li div[dir="auto"] span',
    '[role="article"] div[dir="auto"] span[lang]',
    'div[data-testid="UFI2Comment/body"] span',
  ];

  commentSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      const t = el.innerText?.trim();
      if (t && t.length > 5 && !texts.includes(t)) texts.push(t);
    });
  });

  if (texts.length === 0) {
    document
      .querySelectorAll('[role="article"] div[dir="auto"]')
      .forEach((el) => {
        const t = el.innerText?.trim();
        if (t && t.length > 10 && !texts.includes(t)) texts.push(t);
      });
  }

  return [...new Set(texts)].slice(0, 50);
}

function scrapeTwitterComments() {
  const texts = [];

  const tweetSelectors = [
    '[data-testid="tweetText"]',
    "article div[lang] span",
    'div[data-testid="tweet"] div[lang]',
  ];

  tweetSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      const t = el.innerText?.trim();
      if (t && t.length > 5 && !texts.includes(t)) texts.push(t);
    });
  });

  return [...new Set(texts)].slice(0, 50);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageInfo") {
    const platform = getPlatform();
    let data = { platform, url: window.location.href };

    if (platform === "youtube") {
      data.videoId = getVideoId();
      data.pageTitle = document.title;
    } else if (platform === "facebook") {
      data.comments = scrapeFacebookComments();
      data.pageTitle = document.title;
    } else if (platform === "twitter") {
      data.comments = scrapeTwitterComments();
      data.pageTitle = document.title;
    }

    sendResponse(data);
  }
});
