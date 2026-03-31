const DEFAULT_SETTINGS = {
  redirectEnabled: true,
  redirectPath: "/feed/subscriptions",

  topBarParent: true,
  topBarChild_searchBox: false,
  topBarChild_searchButton: false,
  topBarChild_voiceButton: false,
  topBarChild_guideButton: false,
  topBarChild_notificationsButton: false,
  topBarChild_homeLogo: false,
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

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(null);
  if (!existing || Object.keys(existing).length === 0) {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
  } else {
    const patch = {};
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      if (!(k in existing)) patch[k] = v;
    }
    if (Object.keys(patch).length) await chrome.storage.sync.set(patch);
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "GET_DEFAULTS") {
    sendResponse({ ok: true, defaults: DEFAULT_SETTINGS });
    return true;
  }
});