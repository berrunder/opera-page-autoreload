chrome.tabs.onActivated.addListener(function(info) {
    var storage = chrome.storage.local;
    var tabId = info.tabId + '';
    storage.get(tabId, function(items) {
        if (items[tabId]) {
            console.log('information about ' + tabId + 'found');
            rebuildMenu(items[tabId]);
        } else {
            var newItem = {};
            newItem[tabId] = 0;
            storage.set(newItem);
            rebuildMenu();
        }
    });
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    chrome.storage.local.remove(tabId + '');
});

function rebuildMenu(interval) {
    chrome.contextMenus.removeAll(function() {
        buildMenu(interval)
    });
}

var intervals = [1, 5, 30];

function buildMenu(interval) {
    interval = interval || '0';
    chrome.contextMenus.create({
        id: 'autoReload',
        title: chrome.i18n.getMessage('parentMenu')
    });

    intervals.forEach(function(val) {
        chrome.contextMenus.create({
            id: 'interval_' + val,
            parentId: 'autoReload',
            type: 'radio',
            checked: (val == interval),
            title: val + ' ' + chrome.i18n.getMessage('shortMinute')
        })
    });

    chrome.contextMenus.create({
        id: 'interval_0',
        parentId: 'autoReload',
        type: 'radio',
        checked: (interval == '0'),
        title: chrome.i18n.getMessage('stopReload')
    });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId.indexOf('interval_') === 0 && !info.wasChecked) {
        var newItem = {};
        newItem[tab.id + ''] = info.menuItemId.split('_')[1];
        chrome.storage.local.set(newItem);
    }
});