let isEnabled = false;

function updateIcon(tabId) {
  if (isEnabled) {
    chrome.action.setIcon({ path: { 48: "images/icon-48.png" }, tabId: tabId });
  } else {
    chrome.action.setIcon({
      path: { 54: "images/icons-48-disabled.png" },
      tabId: tabId,
    });
  }
}

function checkTab(tab) {
  const url = tab.url || "";
  if (url.startsWith("https://fastapps.rit.edu/kronosTimecard/")) {
    chrome.action.enable(tab.id);
    isEnabled = true;
  } else {
    chrome.action.disable(tab.id);
    isEnabled = false;
  }
  updateIcon(tab.id);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    checkTab(tab);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    checkTab(tab);
  });
});
