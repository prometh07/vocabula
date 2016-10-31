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

      this.exportView = new VocabulaApp.ExportView();
      this.exportView.render();
    },
    render: function() {
      this.$el.html(this.template());
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
                    <option value="tab">tab-separated text file</option>\
                  </select>\
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
    download: function() {
      let content = VocabulaApp.phrases.map(p => `${p.get('phrase')}\t${p.get('definition')}`).join("\n")
      let link = this.$('#download')[0];
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      link.click();
    },
    render: function() {
      this.$el.html(this.template());
    }
  });

  VocabulaApp.AppView = Backbone.View.extend({
    el: '#app',
    initialize: function() {
      this.currentView = new VocabulaApp.PhrasesView();
    }
  });
})();
