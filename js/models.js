var VocabulaApp = VocabulaApp || {};

(() => {
  VocabulaApp.Phrase = Backbone.Model.extend({
    defaults: () => ({
      phrase: '',
      definition: '',
      article: '',
      source: '',
      added: new Date()
    }),
    initialize: function() {
      this.on('change', () => this.save());
    },
    validate: function(attrs) {}
  });
})();
