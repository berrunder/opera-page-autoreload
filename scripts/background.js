chrome.tabs.onActivated.addListener(function(info) {
    var storage = chrome.storage.local;
    storage.get(info.tabId, function(items) {
        var tabId = info.tabId;
        if (items[tabId]) {
            console.log('information about ' + tabId + 'found');
            rebuildMenu(items[tabId]);
        } else {
            var newItems = {};
            newItems[tabId] = 0;
            storage.set(newItems);
            rebuildMenu();
        }
    });
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    chrome.storage.local.remove(tabId);
});

function rebuildMenu(interval) {
    chrome.contextMenus.removeAll(function() {
        buildMenu(interval)
    });
}

function buildMenu(interval) {
    interval = interval || '0';
    chrome.contextMenus.create({
        id: "autoReload",
        title: chrome.i18n.getMessage('parentMenu')
    }, function() {

    });

    var intervals = [1, 5, 30];
    intervals.forEach(function(val) {
        chrome.contextMenus.create({
            id: 'interval_' + val,
            parentId: 'autoReload',
            type: 'radio',
            checked: (val == interval)
        })
    });
}