(() => {
  const DEFAULT_SETTINGS = {
    redirectEnabled: false,
    redirectPath: "/feed/subscriptions",

    topBarParent: true,
    topBarChild_searchBox: false,
    topBarChild_searchButton: false,
    topBarChild_voiceButton: false,
    topBarChild_guideButton: false,
    topBarChild_notificationsButton: false,
    topBarChild_homeLogo: false,
    topBarChild_countryCode: false,
    topBarChild_profileButton: false,
    topBarChild_createButton: false,
    topBarChild_appsButton: false,

    leftRailParent: true,
    leftRailChild_home: true,
    leftRailChild_you: false,
    leftRailChild_subscriptions: false,
    leftRailChild_explore: false,
    leftRailChild_history: false,

    shortsParent: true,
    shortsChild_links: true,
    shortsChild_richShelf: true,
    shortsChild_reelShelf: true,
    shortsChild_gridCards: true,

    homeParent: true,
    homeChild_feed: false,

    watchParent: false,
    watchChild_title: false,
    watchChild_channelName: false,
    watchChild_channelAvatar: false,
    watchChild_subscribe: false,
    watchChild_subCount: false,
    watchChild_likeDislike: false,
    watchChild_share: false,
    watchChild_clip: false,
    watchChild_save: false,
    watchChild_download: false,
    watchChild_thanks: false,
    watchChild_join: false,
    watchChild_moreOptions: false,
    watchChild_metaLine: false,
    watchChild_description: false,
    watchChild_related: false,
    watchChild_endscreen: false,
    watchChild_autoplay: false,
    watchChild_liveChat: false,
    watchChild_merch: false,
    watchChild_comments: false,
    watchGrandchild_reply: false,
    watchGrandchild_reactions: false,

    channelParent: false,
    channelChild_banner: false,
    channelChild_avatar: false,
    channelChild_meta: false,
    channelChild_aboutText: false,
    channelChild_socials: false,
    channelChild_tabHome: false,
    channelChild_tabVideos: false,
    channelChild_tabShorts: false,
    channelChild_tabLive: false,
    channelChild_tabPlaylists: false,
    channelChild_tabPosts: false,
    channelChild_join: false,
    channelChild_subscribe: false
  };

  let settings = { ...DEFAULT_SETTINGS };
  let observer = null;
  let styleElement = null;

  const safeText = (node) =>
    node?.textContent || node?.innerText || node?.__shady_native_textContent || "";

  function isOn(parent, child) {
    if (parent && !settings[parent]) return false;
    if (child && !settings[child]) return false;
    return true;
  }

  function isFeatureEnabled(key) {
    if (!settings[key]) return false;

    // Map grandchildren/children to their specific parent dependencies
    if (key.startsWith("watchGrandchild_")) return !!settings.watchParent;
    if (key.startsWith("watchChild_")) return !!settings.watchParent;
    if (key.startsWith("topBarChild_")) return !!settings.topBarParent;
    if (key.startsWith("leftRailChild_")) return !!settings.leftRailParent;
    if (key.startsWith("shortsChild_")) return !!settings.shortsParent;
    if (key.startsWith("homeChild_")) return !!settings.homeParent;
    if (key.startsWith("channelChild_")) return !!settings.channelParent;

    return true;
  }

  // Uses the fast CSS <style> injection method from your referenced script, 
  // paired with accurate selectors via the `:has()` pseudo-class for the action buttons
  const CSS_MAPPING = {
    topBarChild_searchBox: "#masthead #center, ytd-masthead ytd-searchbox, ytd-searchbox { display: none !important; }",
    topBarChild_searchButton: "button[aria-label*='Search' i], #search-icon-legacy { display: none !important; }",
    topBarChild_voiceButton: "button[aria-label*='voice' i], #voice-search-button { display: none !important; }",
    topBarChild_guideButton: "#guide-button.ytd-masthead, yt-icon-button#guide-button { display: none !important; }",
    topBarChild_notificationsButton: "ytd-notification-topbar-button-renderer, button[aria-label*='Notification' i] { display: none !important; }",
    topBarChild_homeLogo: "ytd-topbar-logo-renderer, ytd-masthead yt-icon#logo-icon, ytd-masthead a[href='/'] { display: none !important; }",
    topBarChild_countryCode: "",
    topBarChild_profileButton: "#avatar-btn, ytd-topbar-menu-button-renderer #avatar-btn { display: none !important; }",
    topBarChild_createButton: "ytd-button-renderer.style-scope.ytd-masthead[button-renderer][button-next], ytd-masthead #buttons ytd-button-renderer[button-renderer][button-next], ytd-masthead #end ytd-button-renderer[button-renderer][button-next], ytd-masthead ytd-button-renderer[button-next], ytd-masthead ytd-button-renderer:has(> yt-button-shape > button[aria-label*='Create' i]), ytd-masthead yt-button-shape:has(> button[aria-label*='Create' i]) { display: none !important; }",
    topBarChild_appsButton: "ytd-topbar-menu-button-renderer:has(button[aria-label*='Google apps' i]), button[aria-label*='Google apps' i] { display: none !important; }",

    leftRailChild_home: "ytd-guide-entry-renderer:has(a[title='Home' i]), ytd-mini-guide-entry-renderer:has(a[title='Home' i]), ytd-guide-entry-renderer:has(a[href='/']), ytd-mini-guide-entry-renderer:has(a[href='/']) { display: none !important; }",
    leftRailChild_you: "ytd-guide-entry-renderer:has(a[href*='/feed/you']), ytd-mini-guide-entry-renderer:has(a[href*='/feed/you']) { display: none !important; }",
    leftRailChild_subscriptions: "ytd-guide-entry-renderer:has(a[href*='/feed/subscriptions']), ytd-mini-guide-entry-renderer:has(a[href*='/feed/subscriptions']) { display: none !important; }",
    leftRailChild_explore: "ytd-guide-entry-renderer:has(a[href*='/feed/explore']), ytd-mini-guide-entry-renderer:has(a[href*='/feed/explore']) { display: none !important; }",
    leftRailChild_history: "ytd-guide-entry-renderer:has(a[href*='/feed/history']), ytd-mini-guide-entry-renderer:has(a[href*='/feed/history']) { display: none !important; }",

    shortsChild_links: "ytd-guide-entry-renderer:has(a[href*='/shorts/']), ytd-mini-guide-entry-renderer:has(a[href*='/shorts/']), a[href*='/shorts/'] { display: none !important; }",
    shortsChild_richShelf: "ytd-rich-shelf-renderer[is-shorts] { display: none !important; }",
    shortsChild_reelShelf: "ytd-reel-shelf-renderer { display: none !important; }",
    shortsChild_gridCards: "ytd-rich-item-renderer:has(a[href*='/shorts/']), ytd-grid-video-renderer:has(a[href*='/shorts/']) { display: none !important; }",

    homeChild_feed: "ytd-browse[page-subtype='home'] #contents, ytd-browse[page-subtype='home'] #primary { display: none !important; }",

    watchChild_title: "h1.ytd-watch-metadata, ytd-watch-metadata #title { display: none !important; }",
    watchChild_channelName: "ytd-video-owner-renderer ytd-channel-name, #owner #channel-name { display: none !important; }",
    watchChild_channelAvatar: "ytd-video-owner-renderer #avatar, ytd-video-owner-renderer img#img { display: none !important; }",
    watchChild_subscribe: "ytd-watch-metadata #subscribe-button, ytd-watch-metadata ytd-subscribe-button-renderer { display: none !important; }",
    watchChild_subCount: "ytd-video-owner-renderer #owner-sub-count, #owner-sub-count { display: none !important; }",

    watchChild_likeDislike: "segmented-like-dislike-button-view-model, yt-segmented-like-dislike-button-view-model, .ytSegmentedLikeDislikeButtonViewModelHost { display: none !important; }",
    watchChild_share: "ytd-menu-renderer yt-button-view-model:has(button[aria-label*='Share' i]), ytd-menu-renderer button-view-model:has(button[aria-label*='Share' i]) { display: none !important; }",
    watchChild_clip: "ytd-menu-renderer yt-button-view-model:has(button[aria-label*='Clip' i]), ytd-menu-renderer button-view-model:has(button[aria-label*='Clip' i]) { display: none !important; }",
    watchChild_save: "ytd-menu-renderer yt-button-view-model:has(button[aria-label*='Save' i]), ytd-menu-renderer yt-button-view-model:has(button[aria-label*='Save to playlist' i]), ytd-menu-renderer button-view-model:has(button[aria-label*='Save' i]) { display: none !important; }",
    watchChild_download: "ytd-download-button-renderer, ytd-menu-renderer yt-button-view-model:has(button[aria-label*='Download' i]), ytd-menu-renderer button-view-model:has(button[aria-label*='Download' i]) { display: none !important; }",
    watchChild_thanks: "ytd-menu-renderer ytd-button-renderer:has(button[aria-label*='Thanks' i]), ytd-menu-renderer yt-button-view-model:has(button[aria-label*='Thanks' i]), ytd-menu-renderer button-view-model:has(button[aria-label*='Thanks' i]) { display: none !important; }",
    watchChild_join: "",
    watchChild_moreOptions: "ytd-menu-renderer yt-icon-button.dropdown-trigger, ytd-menu-renderer yt-button-shape:has(button[aria-label*='More actions' i]), ytd-menu-renderer yt-button-view-model:has(button[aria-label*='More actions' i]), ytd-menu-renderer button-view-model:has(button[aria-label*='More actions' i]) { display: none !important; }",

    watchChild_metaLine: "ytd-watch-info-text #info, ytd-watch-info-text #date-text, #info-container #info { display: none !important; }",
    watchChild_description: "ytd-watch-metadata #description, #description-inline-expander { display: none !important; }",
    watchChild_related: "",
    watchChild_endscreen: ".ytp-ce-element, .ytp-endscreen-content { display: none !important; }",
    watchChild_autoplay: "ytd-compact-autoplay-renderer { display: none !important; }",
    watchChild_liveChat: "#chat, ytd-live-chat-frame, ytd-watch-flexy #chat-container { display: none !important; }",
    watchChild_merch: "ytd-merch-shelf-renderer, .ytd-merch-shelf-renderer, #merch-shelf { display: none !important; }",
    watchChild_comments: "ytd-comments, #comments { display: none !important; }",
    watchGrandchild_reply: "ytd-comment-engagement-bar#action-buttons #reply-button-end, ytd-comment-engagement-bar#action-buttons ytd-button-renderer#reply-button-end, ytd-comment-engagement-bar#action-buttons button[aria-label*='Reply' i], ytd-comment-action-buttons-renderer #reply-button-end { display: none !important; }",
    watchGrandchild_reactions: "ytd-comment-engagement-bar#action-buttons #like-button, ytd-comment-engagement-bar#action-buttons #dislike-button, ytd-comment-engagement-bar#action-buttons #vote-count-middle, ytd-comment-engagement-bar#action-buttons button[aria-label*='Like this comment' i], ytd-comment-engagement-bar#action-buttons button[aria-label*='Dislike this comment' i], ytd-comment-action-buttons-renderer #vote-button-middle, ytd-comment-action-buttons-renderer #vote-button-down, ytd-comment-action-buttons-renderer button[aria-label*='Like' i], ytd-comment-action-buttons-renderer button[aria-label*='Dislike' i] { display: none !important; }",

    channelChild_banner: "ytd-page-header-banner-renderer, yt-image-banner-view-model, #page-header-banner { display: none !important; }",
    channelChild_avatar: "ytd-page-header-view-model yt-decorated-avatar-view-model, ytd-page-header-view-model yt-avatar-shape, ytd-page-header-view-model #avatar { display: none !important; }",
    channelChild_meta: "ytd-page-header-view-model #subscriber-count, ytd-page-header-view-model #metadata-line, ytd-page-header-view-model #metadata { display: none !important; }",
    channelChild_aboutText: "ytd-page-header-view-model #truncated-text-content, ytd-page-header-view-model #description-container { display: none !important; }",
    channelChild_socials: "ytd-page-header-view-model #links-container, ytd-page-header-view-model ytd-attribution-view-model { display: none !important; }",
    channelChild_join: "ytd-page-header-view-model a[href*='/join' i], ytd-page-header-view-model button[aria-label*='Join' i] { display: none !important; }",
    channelChild_subscribe: "ytd-page-header-view-model #subscribe-button, ytd-page-header-view-model ytd-subscribe-button-renderer { display: none !important; }"
  };

  function normalizeRedirectPath(path) {
    if (typeof path !== "string") return "/feed/subscriptions";
    let p = path.trim();
    if (!p) return "/feed/subscriptions";
    if (!p.startsWith("/")) p = "/" + p;
    if (p.startsWith("//")) p = "/" + p.replace(/^\/+/, "");
    return p;
  }

  function getRedirectUrl() {
    return `https://www.youtube.com${normalizeRedirectPath(settings.redirectPath)}`;
  }

  function redirectHomeIfNeeded() {
    if (!settings.redirectEnabled) return;
    if (location.pathname === "/" || location.pathname === "") {
      location.replace(getRedirectUrl());
    }
  }

  function installHomeRedirectClickHandler() {
    document.addEventListener(
      "click",
      (e) => {
        if (!settings.redirectEnabled) return;
        const t = e.target;
        if (!t || !(t instanceof Element)) return;

        if (
          t.closest("yt-icon-button#logo") ||
          t.closest('a[href="/"]') ||
          t.closest("ytd-topbar-logo-renderer") ||
          t.closest("yt-icon#logo-icon")
        ) {
          e.preventDefault();
          e.stopPropagation();
          location.href = getRedirectUrl();
        }
      },
      true
    );
  }

  function isChannelPage() {
    return (
      /^\/(?:@|channel\/|c\/|user\/)/.test(location.pathname) ||
      /\/featured$|\/videos$|\/shorts$|\/streams$|\/playlists$|\/community$|\/posts$/.test(location.pathname)
    );
  }

  function hideChannelTabsByPathOrLabel(paths, labels) {
    const tabAnchors = document.querySelectorAll(
      "#tabs a[href], #tabsContent a[href], ytd-two-column-browse-results-renderer ytd-tabbed-page-header a[href], ytd-two-column-browse-results-renderer yt-tab-shape a[href], ytd-two-column-browse-results-renderer tp-yt-paper-tab a[href], ytd-page-header-renderer a[href]"
    );

    tabAnchors.forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      const label = safeText(a).trim().toLowerCase();
      const pathMatch = paths.some((p) => href.includes(p));
      const labelMatch = labels.some((l) => label === l || label.includes(`${l} `) || label.includes(` ${l}`));
      if (!pathMatch && !labelMatch) return;

      const tab = a.closest("tp-yt-paper-tab, yt-tab-shape, ytd-tabbed-page-header-tab-renderer, li, a[href]");
      (tab || a).style.setProperty("display", "none", "important");
    });
  }

  function ensureStyleElement() {
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "yt-bloat-remover-style";
    }
    if (!document.head.contains(styleElement)) {
      document.head.appendChild(styleElement);
    }
  }

  function applyCssRules() {
    ensureStyleElement();
    
    let cssText = "";
    for (const [key, css] of Object.entries(CSS_MAPPING)) {
      if (css && isFeatureEnabled(key)) {
        cssText += css + "\n";
      }
    }

    if (styleElement.textContent !== cssText) {
      styleElement.textContent = cssText;
    }
  }

  const DYNAMIC_TOGGLE_MAPPING = {
    topBarChild_createButton: [
      "ytd-button-renderer.style-scope.ytd-masthead[button-renderer][button-next]",
      "#end.style-scope.ytd-masthead ytd-button-renderer[button-next]",
      "#end.style-scope.ytd-masthead ytd-button-renderer[button-renderer][button-next]",
      "#buttons.style-scope.ytd-masthead ytd-button-renderer[button-renderer][button-next]",
      "#end.style-scope.ytd-masthead ytd-button-renderer:has(> yt-button-shape > button[aria-label*='Create' i])",
      "#end.style-scope.ytd-masthead ytd-topbar-menu-button-renderer:has(button[aria-label*='Create' i])",
      "#end.style-scope.ytd-masthead yt-button-view-model:has(button[aria-label*='Create' i])",
      "#end.style-scope.ytd-masthead yt-button-shape:has(button[aria-label*='Create' i])",
      "#end.style-scope.ytd-masthead button[aria-label*='Create' i]",
      "ytd-masthead ytd-topbar-menu-button-renderer:has(button[aria-label*='Create' i])",
      "ytd-masthead ytd-button-renderer[button-renderer][button-next]",
      "ytd-masthead ytd-button-renderer[button-next]"
    ],
    topBarChild_countryCode: [
      "#country-code.style-scope.ytd-topbar-logo-renderer",
      "ytd-topbar-logo-renderer #country-code"
    ],
    watchChild_join: [
      "div#sponsor-button.style-scope.ytd-video-owner-renderer"
    ],
    watchChild_related: [
      "#secondary-inner",
      "#related.ytd-watch-flexy"
    ],
    watchGrandchild_reply: [
      "ytd-comment-engagement-bar#action-buttons #reply-button-end",
      "ytd-comment-action-buttons-renderer #reply-button-end"
    ],
    watchGrandchild_reactions: [
      "ytd-comment-engagement-bar#action-buttons #like-button",
      "ytd-comment-engagement-bar#action-buttons #dislike-button",
      "ytd-comment-engagement-bar#action-buttons #vote-count-middle",
      "ytd-comment-action-buttons-renderer #vote-button-middle",
      "ytd-comment-action-buttons-renderer #vote-button-down"
    ]
  };

  function setDynamicToggleState(settingKey, enabled) {
    const tagAttr = `data-yt-bloat-toggle-${settingKey}`;
    const restoreAttr = `data-yt-bloat-restore-display-${settingKey}`;
    const selectors = DYNAMIC_TOGGLE_MAPPING[settingKey] || [];

    const matched = new Set();
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => matched.add(el));
    });

    if (!enabled) {
      document.querySelectorAll(`[${tagAttr}]`).forEach((el) => {
        const restoreDisplay = el.getAttribute(restoreAttr);
        el.style.removeProperty("display");
        if (restoreDisplay) {
          el.style.setProperty("display", restoreDisplay);
        }
        el.removeAttribute(restoreAttr);
        el.removeAttribute(tagAttr);
      });
      return;
    }

    document.querySelectorAll(`[${tagAttr}]`).forEach((el) => {
      if (matched.has(el)) return;
      const restoreDisplay = el.getAttribute(restoreAttr);
      el.style.removeProperty("display");
      if (restoreDisplay) {
        el.style.setProperty("display", restoreDisplay);
      }
      el.removeAttribute(restoreAttr);
      el.removeAttribute(tagAttr);
    });

    matched.forEach((el) => {
      if (!el.hasAttribute(tagAttr)) {
        const existing = el.style.getPropertyValue("display");
        if (existing) el.setAttribute(restoreAttr, existing);
      }
      el.style.setProperty("display", "none", "important");
      el.setAttribute(tagAttr, "1");
    });

    if (settingKey === "topBarChild_createButton") {
      document.querySelectorAll(`[${tagAttr}]`).forEach((el) => {
        if (el.closest("ytd-masthead")) return;
        const restoreDisplay = el.getAttribute(restoreAttr);
        el.style.removeProperty("display");
        if (restoreDisplay) {
          el.style.setProperty("display", restoreDisplay);
        }
        el.removeAttribute(restoreAttr);
        el.removeAttribute(tagAttr);
      });
    }
  }

  function applyDynamicToggles() {
    for (const key of Object.keys(DYNAMIC_TOGGLE_MAPPING)) {
      setDynamicToggleState(key, isFeatureEnabled(key));
    }
  }

  function applyJsRules() {
    applyDynamicToggles();

    if (settings.channelParent && isChannelPage()) {
      if (settings.channelChild_tabHome) hideChannelTabsByPathOrLabel(["/featured"], ["home"]);
      if (settings.channelChild_tabVideos) hideChannelTabsByPathOrLabel(["/videos"], ["videos"]);
      if (settings.channelChild_tabShorts) hideChannelTabsByPathOrLabel(["/shorts"], ["shorts"]);
      if (settings.channelChild_tabLive) hideChannelTabsByPathOrLabel(["/streams", "/live"], ["live"]);
      if (settings.channelChild_tabPlaylists) hideChannelTabsByPathOrLabel(["/playlists"], ["playlists"]);
      if (settings.channelChild_tabPosts) hideChannelTabsByPathOrLabel(["/community", "/posts"], ["posts"]);
    }

    if (isOn("shortsParent", "shortsChild_gridCards")) {
      document.querySelectorAll("#dismissible.style-scope.ytd-rich-grid-media").forEach((card) => {
        if (safeText(card).toUpperCase().includes("SHORTS")) {
          card.style.setProperty("display", "none", "important");
        }
      });
    }
  }

  function applyAllRules() {
    applyCssRules();
    applyJsRules();
  }

  function restartObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => applyAllRules());
    if (document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  async function loadSettings() {
    const saved = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    settings = { ...DEFAULT_SETTINGS, ...saved };
  }

  function installNavHooks() {
    ["pushState", "replaceState"].forEach((m) => {
      const orig = history[m].bind(history);
      history[m] = (...args) => {
        const ret = orig(...args);
        redirectHomeIfNeeded();
        queueMicrotask(applyAllRules);
        return ret;
      };
    });

    window.addEventListener("popstate", () => {
      redirectHomeIfNeeded();
      applyAllRules();
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [k, v] of Object.entries(changes)) settings[k] = v.newValue;
    redirectHomeIfNeeded();
    applyAllRules();
  });

  (async function init() {
    await loadSettings();
    installNavHooks();
    installHomeRedirectClickHandler();
    redirectHomeIfNeeded();

    if (document.head) {
      ensureStyleElement();
      applyCssRules();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        ensureStyleElement();
        applyCssRules();
      });
    }

    restartObserver();
    window.addEventListener("load", applyAllRules);
    applyAllRules();
  })();
})();
