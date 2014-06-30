var i18n=function(){function i(b){b=b.querySelectorAll(l);for(var d,f=0;d=b[f];f++)for(var e=0;e<h.length;e++){var c=h[e],a=d.getAttribute(c);a!=null&&j[c](d,a)}}var j={"i18n-content":function(b,d){b.textContent=chrome.i18n.getMessage(d)},"i18n-values":function(b,d){for(var f=d.replace(/\s/g,"").split(/;/),e=0;e<f.length;e++){var c=f[e].match(/^([^:]+):(.+)$/);if(c){var a=c[1];c=chrome.i18n.getMessage(c[2]);if(a.charAt(0)=="."){a=a.slice(1).split(".");for(var g=b;g&&a.length>1;)g=g[a.shift()];if(g){g[a]=c;a=="innerHTML"&&i(b)}}else b.setAttribute(a,c)}}}},h=[],k;for(k in j)h.push(k);var l="["+h.join("],[")+"]";return{process:i}}();

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
