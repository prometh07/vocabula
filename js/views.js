var VocabulaApp = VocabulaApp || {};

(() => {
  VocabulaApp.ColumnView = Backbone.View.extend({
    el: '#columnView',
    template: _.template('<% _.each(collection, function(model) { %>\
      <li>\
        <a href="#"><input type="checkbox" value="<%= model.get(\'name\') %>" <%= model.renderable ? "checked" : "" %> >\
          <%= model.get(\'name\') %>\
        </a>\
      </li>\
    <% }); %>'),
    events: {
      'click [type="checkbox"]': 'toggle'
    },
    toggle: function(event) {
      let column = this.collection.findWhere({name: event.target.value});
      column.set('renderable', !column.renderable());
    },
    render: function() {
      let cols = this.collection.filter(col => col.get('name').length > 0);
      this.$el.html(this.template({collection: cols}));
    }
  });

  VocabulaApp.PhrasesView = Backbone.View.extend({
    el: '#currentView',
    template: _.template('\
      <div class="panel panel-default">\
        <div class="panel-heading">\
          <div class="btn-group" role="group">\
            <div class="btn-group">\
              <button type="button" class="btn-default btn dropdown-toggle navbar-btn" data-toggle="dropdown">\
                <span class="glyphicon glyphicon-list" aria-hidden="true"></span>\
                <span class="caret"></span>\
              </button>\
              <ul id="columnView" class="dropdown-menu"></ul>\
            </div>\
            <button id="downloadPhrases" type="button" class="btn btn-default navbar-btn" data-toggle="modal" data-target="#downloadModal">\
              <span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span>\
            </button>\
            <button id="removePhrases" type="button" class="btn btn-default navbar-btn">\
              <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>\
            </button>\
          </div>\
          <div id="filter"></div>\
        </div>\
        <div id="gridView" class="backgrid-container"></div>\
        <div id="exportView"></div>\
      </div>'),
    events: {
      'click #removePhrases': 'removePhrases',
    },
    removePhrases: function() {
      this.gridView.getSelectedModels().forEach(phrase => phrase.destroy());
    },
    initialize: function() {
      this.render();

      this.columns = new Backgrid.Columns([
        {
          name: '',
          cell: 'select-row',
          headerCell: 'select-all'
        },
        {
          name: 'phrase',
          label: 'phrase',
          cell: 'string'
        },
        {
          name: 'definition',
          label: 'definition',
          cell: 'string'
        },
        {
          name: 'article',
          label: 'article',
          cell: 'string'
        },
        {
          name: 'source',
          label: 'source',
          cell: 'string'
        },
        {
          name: 'added',
          label: 'added',
          cell: 'date',
          editable: false
        }
      ]);
      this.gridView = new Backgrid.Grid({
        columns: this.columns,
        collection: VocabulaApp.phrases
      });
      this.$("#gridView").html(this.gridView.render().el);

      this.columnView = new VocabulaApp.ColumnView({collection: this.columns});
      this.columnView.render();

      this.filter = new Backgrid.Extension.ClientSideFilter({
        collection: VocabulaApp.phrases,
        fields: ['article']
      });
      this.$('#filter').html(this.filter.render().el);

      this.exportView = new VocabulaApp.ExportView({gridView: this.gridView});
    },
    render: function() {
      this.$el.html(this.template());
    },
    close: function() {
      [this.gridView, this.columnView, this.exportView, this].map(v => v.undelegateEvents());
    }
  });

  VocabulaApp.ExportView = Backbone.View.extend({
    el: '#exportView',
    template: _.template('\
      <div id="downloadModal" class="modal" tabindex="-1" role="dialog">\
        <div class="modal-dialog" role="document">\
          <div class="modal-content">\
            <div class="modal-header">\
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
              <h4 class="modal-title">Export phrases</h4>\
            </div>\
            <div class="modal-body">\
              <form>\
                <div class="form-group">\
                  <label for="fileFormatSelect">Output file format</label>\
                  <select class="form-control" id="fileFormatSelect">\
                    <% _.each(fileFormats, function(format) { %>\
                      <option value="<%= format.extension %>"><%= format.name %></option>\
                    <% }); %> \
                  </select>\
                </div>\
                <div class="checkbox">\
                  <label>\
                    <input id="saveOnlySelected" type="checkbox">Save only selected phrases\
                  </label>\
                </div>\
              </form>\
            </div>\
            <div class="modal-footer">\
              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
              <a id="download" data-dismiss="modal" href="#" download="export.txt"><button type="button" class="btn btn-primary">Download</button></a>\
            </div>\
          </div>\
        </div>\
      </div>'),
    events: {
      'click #download': 'download'
    },
    initialize: function(options) {
      this.gridView = options.gridView;
      this.fileFormats = [
        {name: 'CSV file', extension: 'csv', separator: ','},
        {name: 'TSV file', extension: 'tsv', separator: "\t"},
      ];
      this.render();

      this.selectedFileFormat = this.$('#fileFormatSelect')[0];
      this.saveOnlySelected = this.$('#saveOnlySelected')[0];
    },
    download: function() {
      let phrases = this.saveOnlySelected.checked ? this.gridView.getSelectedModels() : VocabulaApp.phrases;
      let format = this.fileFormats.find(f => f.extension === this.selectedFileFormat.value);
      let content = phrases.map(p => `${p.get('phrase')}${format.separator}${p.get('definition')}`).join("\n");
      let link = this.$('#download')[0];
      link.download = `export.${format.extension}`;
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      link.click();
    },
    render: function() {
      this.$el.html(this.template({fileFormats: this.fileFormats}));
    }
  });

  VocabulaApp.AboutView = Backbone.View.extend({
    el: '#currentView',
    template: _.template('\
      <div class="panel panel-default info">\
        <div class="panel-body">\
          <p>Vocabula allows you to save your dictionary lookup history. Whenever\
          you look up a word, it\'s going to be saved, as well as its definition and source URL.</p>\
          <p>Currently supported extensions:\
            <ul><li><a href="https://addons.mozilla.org/en-US/firefox/addon/dictionary-extension/"> Dictionary.com</a></li></ul>\
          </p>\
          <p>Currently supported export file formats:\
            <ul><li>TSV (eg. for Mnemosyne app)</li></ul>\
          </p>\
          <p>\
            <p>If you have any problems or improvement ideas, create an issue, submit a pull request or just write me an email.</p>\
            <a href="https://github.com/prometh07/vocabula">GitHub repository</a><br>\
            <a href="mailto:radoslawluter@gmail.com">radoslawluter@gmail.com</a><br>\
          </p>\
        </div>\
      </div>'),
    initialize: function() {
      this.render();
    },
    render: function() {
      this.$el.html(this.template());
    }
  });
})();
