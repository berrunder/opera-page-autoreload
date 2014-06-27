chrome.tabs.onActivated.addListener(function(info) {
    var storage = chrome.storage.local;
    var key = 'tab_' + info.tabId;
    storage.get(key, function(items) {
        if (items[key]) {
            rebuildMenu(items[key]);
        } else {
            var newItem = {};
            newItem[key] = 0;
            storage.set(newItem);
            rebuildMenu();
        }
    });
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    chrome.storage.local.remove(tabId + '');
    chrome.alarms.clear(getAlarmName(tabId));
});

function rebuildMenu(interval) {
    chrome.contextMenus.removeAll(function() {
        buildMenu(interval)
    });
}

function getIntervals(callback) {
    var storage = chrome.storage.local;
    storage.get('intervals', function(items) {
        var intervals = items['intervals'];
        if (!intervals || !Array.isArray(intervals)) {
            intervals = [1, 5, 10, 15, 30, 60];
            storage.set({ intervals: intervals });
        }
        if (typeof(callback) === 'function') {
            callback(intervals);
        } else {
            console.log('Something gone wrong. Callback and intervals values was: ', callback, intervals);
        }
    });
}

function buildMenu(interval) {
    interval = interval || '0';
    chrome.contextMenus.create({
        id: 'autoReload',
        title: chrome.i18n.getMessage('parentMenu')
    });

    getIntervals(function(intervals) {
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
    })
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId.indexOf('interval_') === 0 && !info.wasChecked) {
        // update reload time for tab
        var newItem = {},
            newInterval = parseFloat(info.menuItemId.split('_')[1]);
        newItem['tab_' + tab.id] = newInterval;
        chrome.storage.local.set(newItem);

        // set alarm
        var alarmName = getAlarmName(tab.id);
        chrome.alarms.clear(alarmName);
        if (newInterval > 0.1) {
            chrome.alarms.create(alarmName, {
                delayInMinutes: newInterval,
                periodInMinutes: newInterval
            })
        }
    }
});

function getAlarmName(tabId) {
    return 'alarm_' + tabId;
}

chrome.alarms.onAlarm.addListener(function(alarm) {
    var tabId = parseInt(alarm.name.split('_')[1]),
        now = new Date(),
        strTime = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    console.log(strTime + ' - Reloading tab ' + tabId + ', period ' + alarm.periodInMinutes + ' minutes');
    chrome.tabs.reload(tabId, function() {
        if (chrome.extension.lastError) {
            console.log(strTime + '- Error during reload: ' + chrome.extension.lastError.message);
            console.log('Clearing alarm ' + alarm.name);
            chrome.alarms.clear(alarm.name)
        }
    });
});