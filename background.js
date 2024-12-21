chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: 'improve-image-viewer',
    title: "Improved image viewer",
    type: 'normal',
    contexts: ['image']
  });
});

// Open a new search tab when the user clicks a context menu
chrome.contextMenus.onClicked.addListener((item, tab) => {
  if (item.menuItemId != 'improve-image-viewer') return; // unhandled

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const $els = document.body.children;
      return $els.length === 1 && $els[0].tagName.toLowerCase() === 'img';
    }
  }).then(results => {
    if (results[0].result) {
      // Execute content script if result is true (image-only page)
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['script.js']
      });
    }
  });
});
