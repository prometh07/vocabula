var VocabulaApp = VocabulaApp || {};

(() => {
  VocabulaApp.phrases.fetch();

  chrome.runtime.onMessage.addListener(message => {
    if (message.action === 'refresh') {
      setTimeout(() => { VocabulaApp.phrases.fetch(); }, 1000);
    }
  });
})();
