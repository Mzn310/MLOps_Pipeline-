const FLASK = "http://localhost:5000";
const YT_API = "https://www.googleapis.com/youtube/v3";

let currentPlatform = null;
let currentVideoId = null;
let scrapedComments = [];

const PLATFORM_META = {
  youtube: {
    label: "YouTube",
    icon: "▶️",
    badgeClass: "youtube",
    btnIcon: "▶️",
  },
  facebook: {
    label: "Facebook",
    icon: "📘",
    badgeClass: "facebook",
    btnIcon: "📘",
  },
  twitter: {
    label: "Twitter / X",
    icon: "🐦",
    badgeClass: "twitter",
    btnIcon: "🐦",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  loadSavedApiKey();
  detectCurrentPage();
});

document.getElementById("analyze-btn").addEventListener("click", runAnalysis);

function detectCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return setStatus("Could not access current tab.");

    chrome.tabs.sendMessage(tabs[0].id, { action: "getPageInfo" }, (res) => {
      if (chrome.runtime.lastError || !res) {
        setBtn(false, "Unsupported page");
        return setStatus(
          "Open a YouTube video, Facebook post, or Twitter/X page.",
        );
      }

      currentPlatform = res.platform;
      const meta = PLATFORM_META[currentPlatform];

      if (!meta) {
        setBtn(false, "Unsupported page");
        return setStatus(
          "Open a YouTube video, Facebook post, or Twitter/X page.",
        );
      }

      document.body.className = currentPlatform;

      const badge = document.getElementById("platform-badge");
      badge.textContent = `${meta.icon} ${meta.label}`;
      badge.className = `platform-badge ${meta.badgeClass}`;

      if (res.pageTitle) {
        document.getElementById("page-title").textContent = res.pageTitle;
      }

      if (currentPlatform === "youtube") {
        currentVideoId = res.videoId;
        document.getElementById("yt-key-field").style.display = "block";
        if (!currentVideoId) {
          setBtn(false, "No video detected");
          setStatus("Navigate to a YouTube video watch page.");
          return;
        }
        setBtn(true, meta.btnIcon, "Analyze Comments");
        setStatus("");
      } else {
        scrapedComments = res.comments || [];
        document.getElementById("yt-key-field").style.display = "none";

        if (scrapedComments.length === 0) {
          setBtn(false, "⚠️", "No text found");
          setStatus(
            "Try scrolling the page to load more comments/tweets, then reopen this popup.",
          );
        } else {
          setBtn(true, meta.btnIcon, `Analyze ${scrapedComments.length} items`);
          setStatus(
            `Found ${scrapedComments.length} text blocks ready to analyze.`,
          );
        }
      }
    });
  });
}

async function runAnalysis() {
  setBtn(false, "Working…");
  document.getElementById("results").style.display = "none";

  try {
    let comments = [];

    if (currentPlatform === "youtube") {
      const apiKey = document.getElementById("api-key").value.trim();
      if (!apiKey) {
        setStatus(" YouTube  API v3 .");
        setBtn(true, "Analyze Comments");
        return;
      }
      saveApiKey(apiKey);
      setStatus(" Fetching comments from YouTube…");
      comments = await fetchYouTubeComments(currentVideoId, apiKey, 60);
    } else {
      comments = scrapedComments;
    }

    if (!comments.length) {
      setStatus("No text found to analyze.");
      setBtn(true, PLATFORM_META[currentPlatform].btnIcon, "Retry");
      return;
    }

    setStatus(`Sending ${comments.length} items to Flask…`);
    const data = await callFlask(comments);
    renderResults(data, comments.length);
    setStatus("");
    setBtn(true, "Refresh Analysis");
  } catch (err) {
    setStatus(` ${err.message}`);
    const meta = PLATFORM_META[currentPlatform];
    setBtn(true, meta?.btnIcon || "Retry");
  }
}

async function fetchYouTubeComments(videoId, apiKey, maxResults = 60) {
  const url = `${YT_API}/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&textFormat=plainText&key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`YouTube API: ${json.error.message}`);
  if (!json.items?.length) throw new Error("No comments found for this video.");
  return json.items.map(
    (item) => item.snippet.topLevelComment.snippet.textOriginal,
  );
}

async function callFlask(comments) {
  const res = await fetch(`${FLASK}/analyze_video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comments }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Flask returned ${res.status}`);
  }
  return res.json();
}

function renderResults({ results, summary }) {
  document.getElementById("pos-count").textContent = summary.positive;
  document.getElementById("neg-count").textContent = summary.negative;
  document.getElementById("tot-count").textContent = summary.total;

  const posPct = summary.positive_pct;
  const negPct = (100 - posPct).toFixed(1);
  document.getElementById("pos-bar").style.width = posPct + "%";
  document.getElementById("pos-pct").textContent = `${posPct}% positive`;
  document.getElementById("neg-pct").textContent = `${negPct}% negative`;

  const list = document.getElementById("comment-list");
  list.innerHTML = "";

  const toShow = results.slice(0, 25);
  document.getElementById("comments-note").textContent =
    results.length > 25
      ? `Showing 25 of ${results.length} items`
      : `${results.length} items analyzed`;

  toShow.forEach(({ comment, sentiment }) => {
    const isPos = sentiment === 1;
    const div = document.createElement("div");
    div.className = "comment-item";
    div.innerHTML = `
      <div class="comment-header">
        <div class="sentiment-dot ${isPos ? "pos" : "neg"}"></div>
        <span class="sentiment-tag ${isPos ? "pos" : "neg"}">${isPos ? "Positive" : "Negative"}</span>
      </div>
      <div class="comment-text">${escapeHtml(comment).slice(0, 130)}${comment.length > 130 ? "…" : ""}</div>
    `;
    list.appendChild(div);
  });

  document.getElementById("results").style.display = "block";
}

function setStatus(msg) {
  document.getElementById("status").textContent = msg;
}

function setBtn(enabled, icon, label) {
  const btn = document.getElementById("analyze-btn");
  btn.disabled = !enabled;
  document.getElementById("btn-icon").textContent = icon;
  document.getElementById("btn-label").textContent = label;
}

function loadSavedApiKey() {
  chrome.storage.local.get("ytApiKey", ({ ytApiKey }) => {
    if (ytApiKey) document.getElementById("api-key").value = ytApiKey;
  });
}

function saveApiKey(key) {
  chrome.storage.local.set({ ytApiKey: key });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
