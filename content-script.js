var state = { isVisible: false, isRecording: false, showCopiedToClipboard: false, selectors: [] };

var port = chrome.runtime.connect({name: 'content-script'});
port.onMessage.addListener(function (request) {
  if (request.action === "toggle-show") {
    state.isVisible = !state.isVisible;
    renderApp();
  }
});

document.body.addEventListener('click', function (event) {
    if (state.isRecording && event.target.className != "selector-picker-copy-to-clipboard") {
        event.preventDefault();
        const cssSelector = CSSGenerator(event.target);
        state.selectors.push(cssSelector);
        renderApp();
    }
});

const containerClassname = "metabase-selector-picker-chrome-extension";
var container = document.createElement('div');
container.className = containerClassname;
document.body.appendChild(container);

renderApp();

function renderApp() {
    const runAfterDOMUpdated = (func) => { setTimeout(func, 0) }

    if (!state.isVisible) {
      document.querySelector('.'+containerClassname).innerHTML = '';
      return;
    }

    const recordButtonText = `${state.isRecording ? "Stop" : "Start"} recording selectors `
    const copyToClipboardText = state.showCopiedToClipboard ? "Copied to clipboard" : "Copy to clipboard"
    const disabledIfNoSelectors = this.state.selectors.length === 0 ? "disabled" : "";

    const buttonHtml = `<button class="selector-picker-record-button">${recordButtonText}</button> ` +
                    `<button ${disabledIfNoSelectors} class="selector-picker-copy-to-clipboard">${copyToClipboardText}</button> ` +
                    `<button ${disabledIfNoSelectors} class="selector-picker-clear-selectors">Clear</button>`;

    const selectorsHtml = "<ul>" + state.selectors.map(s =>
      `<li style='font-size: 13px; margin-bottom: 0;'>${s}</li>`
    ).join('') + "</ul>"

    const boxStyle = "position: fixed; z-index: 99999; right: 0; top: 0; width: 380px; padding: 5px; " +
                     "background: white; border-width: 0px 0px 1px 1px; border-style: solid; border-color: black;";

    const appHtml = `<div style="${boxStyle}">` +
                    buttonHtml +
                    selectorsHtml +
                    `</div>`;

    document.querySelector('.'+containerClassname).innerHTML = appHtml;

    runAfterDOMUpdated(() => {
      document.querySelector(".selector-picker-record-button").addEventListener("click", toggleIsRecording);
      document.querySelector(".selector-picker-clear-selectors").addEventListener("click", clearSelectors);
      document.querySelector(".selector-picker-copy-to-clipboard").addEventListener("click", copyToClipboard);
      new Clipboard('.selector-picker-copy-to-clipboard', { text: () => state.selectors.join("\n") });
    })
}

function toggleIsRecording(e) {
  e.stopImmediatePropagation();
  port.postMessage({ isRecording: state.isRecording });
  state.isRecording = !state.isRecording;
  renderApp();
}

function clearSelectors(e) {
  e.stopImmediatePropagation();
  state.selectors = [];
  renderApp();
}

function copyToClipboard(e) {
  state.showCopiedToClipboard = true;
  renderApp();

  setTimeout(() => {
    state.showCopiedToClipboard = false;
    renderApp();
  }, 3000);
}
