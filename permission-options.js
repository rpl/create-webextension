const availablePermissions = [
  "activeTab",
  "alarms",
  "bookmarks",
  "browsingData",
  "contextMenus",
  "contextualIdentities",
  "cookies",
  "downloads",
  "downloads.open",
  "history",
  "identity",
  "idle",
  "management",
  "nativeMessaging",
  "notifications",
  "sessions",
  "storage",
  "tabs",
  "topSites",
  "webNavigation",
  "webRequest",
  "webRequestBlocking",
];

function getChoices(list) {
  return list.map(item => {
    return {
      value: item,
      name: item,
      checked: false,
    };
  });
}

module.exports = {
  permissionChoices: getChoices(availablePermissions),
};
