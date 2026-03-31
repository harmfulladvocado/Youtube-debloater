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
  watchChild_join: false,
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

const CHILDREN_BY_PARENT = {
  topBarParent: [
    "topBarChild_searchBox",
    "topBarChild_searchButton",
    "topBarChild_voiceButton",
    "topBarChild_guideButton",
    "topBarChild_notificationsButton",
    "topBarChild_homeLogo",
    "topBarChild_countryCode",
    "topBarChild_profileButton",
    "topBarChild_createButton",
    "topBarChild_appsButton"
  ],
  leftRailParent: [
    "leftRailChild_home",
    "leftRailChild_you",
    "leftRailChild_subscriptions",
    "leftRailChild_explore",
    "leftRailChild_history"
  ],
  shortsParent: [
    "shortsChild_links",
    "shortsChild_richShelf",
    "shortsChild_reelShelf",
    "shortsChild_gridCards"
  ],
  homeParent: ["homeChild_feed"],
  watchParent: [
    "watchChild_title",
    "watchChild_channelName",
    "watchChild_channelAvatar",
    "watchChild_subscribe",
    "watchChild_subCount",
    "watchChild_likeDislike",
    "watchChild_share",
    "watchChild_clip",
    "watchChild_save",
    "watchChild_download",
    "watchChild_join",
    "watchChild_thanks",
    "watchChild_moreOptions",
    "watchChild_metaLine",
    "watchChild_description",
    "watchChild_related",
    "watchChild_endscreen",
    "watchChild_autoplay",
    "watchChild_liveChat",
    "watchChild_merch",
    "watchChild_comments"
  ],
  channelParent: [
    "channelChild_banner",
    "channelChild_avatar",
    "channelChild_meta",
    "channelChild_aboutText",
    "channelChild_socials",
    "channelChild_tabHome",
    "channelChild_tabVideos",
    "channelChild_tabShorts",
    "channelChild_tabLive",
    "channelChild_tabPlaylists",
    "channelChild_tabPosts",
    "channelChild_join",
    "channelChild_subscribe"
  ],
  watchChild_comments: ["watchGrandchild_reply", "watchGrandchild_reactions"]
};

const DEPENDENCY_PARENT_BY_CHILD = {
  watchGrandchild_reply: "watchChild_comments",
  watchGrandchild_reactions: "watchChild_comments"
};

const COLLAPSED_GROUPS_KEY = "popupCollapsedGroups";

function getEl(id) {
  return document.getElementById(id);
}

function normalizePathInput(value) {
  let v = (value || "").trim();
  if (!v) return "/feed/subscriptions";
  if (!v.startsWith("/")) v = "/" + v;
  if (v.startsWith("//")) v = "/" + v.replace(/^\/+/, "");
  return v;
}

function applyParentChildDeactivationUI(values) {
  for (const [parent, children] of Object.entries(CHILDREN_BY_PARENT)) {
    const parentOn = !!values[parent];
    for (const child of children) {
      const input = getEl(child);
      if (!input) continue;
      const row = input.closest(".child, .grandchild");
      input.disabled = !parentOn;
      if (row) row.classList.toggle("disabled", !parentOn);
    }
  }

  for (const [childId, dependencyParentId] of Object.entries(DEPENDENCY_PARENT_BY_CHILD)) {
    const input = getEl(childId);
    if (!input) continue;
    const row = input.closest(".child, .grandchild");
    const enabled = !!values[dependencyParentId];
    input.disabled = !enabled;
    if (row) row.classList.toggle("disabled", !enabled);
  }
}

function applyRedirectInputState(values) {
  const pathInput = getEl("redirectPath");
  const field = pathInput?.closest(".field");
  const redirectOn = !!values.redirectEnabled;
  if (!pathInput) return;
  pathInput.disabled = !redirectOn;
  if (field) field.classList.toggle("disabled", !redirectOn);
}

function applyOptionSearchFilter(query) {
  const q = (query || "").trim().toLowerCase();
  const groups = document.querySelectorAll("main .group");

  groups.forEach((group) => {
    const parentRow = group.querySelector(".row.parent");
    const optionRows = [...group.querySelectorAll(".row.child, .row.grandchild")];
    const parentText = (parentRow?.innerText || "").toLowerCase();
    const parentMatch = !q || parentText.includes(q);

    let anyOptionVisible = false;
    optionRows.forEach((row) => {
      const rowText = (row.innerText || "").toLowerCase();
      const visible = !q || parentMatch || rowText.includes(q);
      row.classList.toggle("is-hidden", !visible);
      if (visible) anyOptionVisible = true;
    });

    const hasExtraContent = group.children.length > 1;
    const groupVisible = !q || parentMatch || anyOptionVisible || (!hasExtraContent && parentMatch);
    group.classList.toggle("is-hidden", !groupVisible);
  });
}

function getParentIdForChild(childId) {
  for (const [parentId, childIds] of Object.entries(CHILDREN_BY_PARENT)) {
    if (childIds.includes(childId)) return parentId;
  }
  return null;
}

async function setupCollapsibleGroups() {
  const stored = await chrome.storage.local.get({ [COLLAPSED_GROUPS_KEY]: {} });
  const collapsedById = stored[COLLAPSED_GROUPS_KEY] || {};

  const groups = document.querySelectorAll("main .group");
  groups.forEach((group) => {
    const parentRow = group.querySelector(".row.parent");
    if (!parentRow) return;
    if (group.children.length < 2) return;

    parentRow.classList.add("collapsible");

    const checkbox = parentRow.querySelector('input[type="checkbox"]');
    const labelText = parentRow.querySelector("span");
    if (!checkbox || !labelText) return;

    const groupId = group.id;
    const isCollapsed = !!(groupId && collapsedById[groupId]);
    group.classList.toggle("collapsed", isCollapsed);

    if (!parentRow.querySelector(".parent-main")) {
      const wrap = document.createElement("span");
      wrap.className = "parent-main";
      parentRow.insertBefore(wrap, checkbox);
      wrap.appendChild(checkbox);
      wrap.appendChild(labelText);
    }

    if (!parentRow.querySelector(".collapse-toggle")) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "collapse-toggle";
      toggle.textContent = "▾";
      toggle.title = isCollapsed ? "Expand category" : "Collapse category";
      toggle.setAttribute("aria-label", "Toggle category");
      toggle.setAttribute("aria-expanded", String(!isCollapsed));

      toggle.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const collapsed = group.classList.toggle("collapsed");
        toggle.setAttribute("aria-expanded", String(!collapsed));
        toggle.title = collapsed ? "Expand category" : "Collapse category";

        if (groupId) {
          const current = await chrome.storage.local.get({ [COLLAPSED_GROUPS_KEY]: {} });
          const next = current[COLLAPSED_GROUPS_KEY] || {};
          next[groupId] = collapsed;
          await chrome.storage.local.set({ [COLLAPSED_GROUPS_KEY]: next });
        }
      });

      parentRow.appendChild(toggle);
    }
  });
}

function syncCheckboxes(values) {
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const el = getEl(key);
    if (!el || el.type !== "checkbox") continue;
    el.checked = !!values[key];
  }
}

async function saveCheckbox(id) {
  const el = getEl(id);
  const updates = { [id]: el.checked };

  const getEffectiveChecked = (key) => {
    if (Object.prototype.hasOwnProperty.call(updates, key)) return !!updates[key];
    return !!getEl(key)?.checked;
  };

  let currentChild = id;
  while (currentChild) {
    const parentId = getParentIdForChild(currentChild);
    if (!parentId) break;

    const siblings = CHILDREN_BY_PARENT[parentId] || [];
    const allChildrenUnchecked = siblings.every((childId) => !getEffectiveChecked(childId));
    if (!allChildrenUnchecked) break;

    updates[parentId] = false;
    currentChild = parentId;
  }

  await chrome.storage.sync.set(updates);
  const all = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  syncCheckboxes(all);
  applyParentChildDeactivationUI(all);
  applyRedirectInputState(all);
}

async function saveParentAndChildren(parentId) {
  const parentInput = getEl(parentId);
  const parentChecked = !!parentInput.checked;
  const updates = { [parentId]: parentChecked };

  const applyDescendants = (currentParent) => {
    for (const childId of CHILDREN_BY_PARENT[currentParent] || []) {
      updates[childId] = parentChecked;
      if (Object.prototype.hasOwnProperty.call(CHILDREN_BY_PARENT, childId)) {
        applyDescendants(childId);
      }
    }
  };

  applyDescendants(parentId);

  await chrome.storage.sync.set(updates);
  const all = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  syncCheckboxes(all);
  applyParentChildDeactivationUI(all);
  applyRedirectInputState(all);
}

async function refreshActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs?.[0];
  if (activeTab?.id != null) await chrome.tabs.reload(activeTab.id);
}

async function load() {
  const values = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const el = getEl(key);
    if (!el || el.type !== "checkbox") continue;

    if (Object.prototype.hasOwnProperty.call(CHILDREN_BY_PARENT, key)) {
      el.addEventListener("change", () => saveParentAndChildren(key));
      continue;
    }

    el.addEventListener("change", () => saveCheckbox(key));
  }

  syncCheckboxes(values);

  const pathInput = getEl("redirectPath");
  pathInput.value = values.redirectPath || "/feed/subscriptions";
  pathInput.addEventListener("change", async () => {
    const normalized = normalizePathInput(pathInput.value);
    pathInput.value = normalized;
    await chrome.storage.sync.set({ redirectPath: normalized });
  });

  getEl("refreshPageButton").addEventListener("click", refreshActiveTab);

  const optionSearch = getEl("optionSearch");
  optionSearch.addEventListener("input", () => applyOptionSearchFilter(optionSearch.value));

  await setupCollapsibleGroups();
  applyParentChildDeactivationUI(values);
  applyRedirectInputState(values);
  applyOptionSearchFilter("");
}

load();
