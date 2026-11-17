const $ = (id) => document.getElementById(id);
chrome.storage.sync.get({ enabled: true }, (s) => { $('enabled').checked = s.enabled; });
$('enabled').onchange = (e) => chrome.storage.sync.set({ enabled: e.target.checked });
$('tweaks').onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab) chrome.tabs.sendMessage(tab.id, { type: 'ascii-open-panel' }, () => { void chrome.runtime.lastError; window.close(); });
  });
};
