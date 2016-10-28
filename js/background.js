chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.create({'url': chrome.extension.getURL('options.html')});
});

chrome.runtime.onMessage.addListener(message => {
  if(message.action === 'addTerm') {
    let p = new VocabulaApp.Phrase(message.term);
    if(!VocabulaApp.phrases.findWhere({phrase: p.get('phrase'), article: p.get('article')})) {
      VocabulaApp.phrases.add(p);
      p.save();
    }
    chrome.runtime.sendMessage({action: 'refresh'});
  }
});
