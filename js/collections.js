var VocabulaApp = VocabulaApp || {};

(() => {
  VocabulaApp.PhraseCollection = Backbone.Collection.extend({
    model: VocabulaApp.Phrase,
    chromeStorage: new Backbone.ChromeStorage("phrases")
  });

  VocabulaApp.phrases = new VocabulaApp.PhraseCollection();
})();
