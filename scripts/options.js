var defaultIntervals = [1, 5, 10, 15, 30, 60],
    maxInterval = 1000000;
// Saves options to chrome.storage
function saveOptions(event) {
    event.preventDefault();
    var intervalsEl = document.getElementById('intervals');
    var intervals = intervalsEl
        .value
        .split(/\s+/)
        .map(function(item) {
            var interval = parseFloat((item + '').replace(',', '.'));
            // chrome alarms doesn't support intervals lesser then 1 minute
            return (interval > 1.0 || isNaN(interval)) ? interval: 1.0;
        })
        .filter(function(item) {
            return !!item && item < maxInterval;
        })
        .filter(onlyUnique)
        .slice(0, 10);

    if (intervals.length > 0) {
        chrome.storage.sync.set({
            intervals: intervals
        }, function () {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = chrome.i18n.getMessage('optionsSaved');
            setTimeout(function () {
                status.textContent = '';
            }, 1000);

            intervalsEl.value = intervals.join(' ');
        });
    }
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function restoreOptions() {
    var intervalsInput = document.getElementById('intervals');
    intervalsInput.setAttribute('title', chrome.i18n.getMessage('inputHint'));
    chrome.storage.sync.get({
        intervals: defaultIntervals
    }, function(items) {
        intervalsInput.value = items.intervals.join(' ');
        document.getElementById('save').addEventListener('click', saveOptions);
    });
    i18n.process(document);
}
document.addEventListener('DOMContentLoaded', restoreOptions);
