function detectDictionaryLookup(mutation) {
  if (document.querySelector('#dic_bubble').style['visibility'] === 'visible') {
    setTimeout(getTerm, 1500);
  }
}

function getTerm() {
  let phrase = document.querySelector('#selection_bubble_word span').innerText;
  let partOfSpeech = document.querySelector('.selection_bubble_title').innerText;
  let definition = document.querySelector('#dic_bubble_dif div.itemData').innerText;

  if (phrase.length && partOfSpeech.length && definition.length) {
    let term = {
      phrase: `${phrase} (${partOfSpeech})`,
      definition: definition,
      article: document.title,
      source: document.URL
    }
    chrome.runtime.sendMessage({action: 'addTerm', term: term});
  }
}

function mutationCallback(mutations) {
  if(mutations.length === 7) {
    detectDictionaryLookup();
  }
}

var observerConfig = {
  attributes: true,
  attributeFilter: ["style"],
};

var targetNode = document.querySelector('#dic_bubble');
var observer = new MutationObserver(mutationCallback);
observer.observe(targetNode, observerConfig);
