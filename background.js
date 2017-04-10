var toContentScriptChannel;
chrome.runtime.onConnect.addListener(function (port) {
        if (port.name === 'content-script') {
          chrome.tabs.query(
            {currentWindow: true, active: true},
            function(tabArray) {
                if (tabArray && tabArray[0])
                    chrome.pageAction.show(tabArray[0].id);
            }
        );
        toContentScriptChannel = port;
    }
});

function toggleShow() {
  toContentScriptChannel.postMessage({action: "toggle-show"});
}

chrome.pageAction.onClicked.addListener(toggleShow);
