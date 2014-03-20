define([
  'jquery',
  'underscore',
  'backbone',
  'vm',
  'views/bands/band_list',
  'views/bands/band_gallery',
  'views/bands/band_tile',
  'text!templates/bands/bands_page.html',
], function($, _, Backbone, Vm, BandListView, BandGalleryView, BandTileView, bandsPageTemplate){
  var BandsPage = Backbone.View.extend({
    el: '#content',
    template: _.template(bandsPageTemplate),
    filter: {},
    sort: {},

    initialize: function() {
      this.children = {};
      this.filter.genres = [];
      this.filter.regions = [];

      // cannot use these here because they make infinite
      // scroll reset to top of the page
      //this.collection.on('reset', this.render, this);
      //this.collection.on('sync', this.render, this);
    },

    events: { 
      'click button#btn-gallery-view': 'renderBandGallery',
      'click button#btn-list-view': 'renderBandList',
      'click button#btn-tile-view': 'renderBandTile',
      'click button#btn-show-filter': 'showFilter',
      'click button#btn-apply-filter': 'applyFilter',
      'click button#btn-clear-filter': 'clearFilter',
      'click button#btn-add-genre-filter': 'addGenreFilter',
      'click button#btn-add-region-filter': 'addRegionFilter',
      'click button#btn-add-sort-filter': 'addSortFilter'
    },

    addGenreFilter: function() {
      var genre = $('#genre-typeahead').val();
      if (genre != "") {
	this.filter.genres.push(genre);
      }
      $('#band-list-filter', this.el).append('<li><span class="label label-default">' + genre + '</span></li>');
      $('#genre-typeahead').val('');
    },

    addRegionFilter: function() {
      var region = $('#region-typeahead').val();	
      if (region != "") {
	this.filter.regions.push(region);
      }
      $('#band-list-filter', this.el).append('<li><span class="label label-default">' + region + '</span></li>'); 
      $('#region-typeahead').val('');
    },

    addSortFilter: function() {
      var sortField = $('#select-sort').val();
      var direction = $('#select-direction').val();
      this.sort[sortField] = direction;
      $('#band-list-filter', this.el).append('<li><span class="label label-default">' + $('#select-sort option:selected').text() + ' ' + direction + '</span></li>'); 
    },

    render: function () {

      // load this with filter data from the collection
      var sorts = [];
      _.forEach(this.sort, function (direction, field) {
	sorts.push(field + ' ' + direction);
      });
      var templateData = {
        genres: this.filter.genres,
        regions: this.filter.regions,
	sorts: sorts
      };

      this.$el.html(this.template(templateData));

      this.renderBandTile();
      this.renderGenreTypeahead();
      this.renderRegionTypeahead();
    
      require(['views/sidenav/bands_menu'], function (SideNavView) {
        var sideNavView = Vm.create(parent, 'SideNavView', SideNavView);
        sideNavView.render();                                      
      });
    },
    
    renderBandGallery: function () {
      this.destroyChildren();
      var bandGalleryView = Vm.create(this, 'BandGalleryView', BandGalleryView, {collection: this.collection});
      $(bandGalleryView.render().el).appendTo('#bands-page-content');
    },

    renderGenreTypeahead: function () {
      var search = new Bloodhound({
        datumTokenizer: function (d) {
            Bloodhound.tokenizers.whitespace(d.value)
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 10,
        remote: {
          url: '/admin/band/genres?search=%QUERY',
          filter: function(genres) {
            return $.map(genres, function(genre) { return { name: genre }; });
          }
        }
      });

      search.initialize();

      $('#genre-typeahead').typeahead(null, {
        name: 'genres',
        displayKey: 'name',
        source: search.ttAdapter(),
      });      
    },

    renderRegionTypeahead: function () {
      var search = new Bloodhound({
        datumTokenizer: function (d) {
            Bloodhound.tokenizers.whitespace(d.value)
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 10,
        remote: {
          url: '/admin/band/regions?search=%QUERY',
          filter: function(regions) {
            return $.map(regions, function(region) { return { name: region }; });
          }
        }
      });

      search.initialize();

      $('#region-typeahead').typeahead(null, {
        name: 'regions',
        displayKey: 'name',
        source: search.ttAdapter(),
      });      
    },

    renderBandList: function () {
      this.destroyChildren();
      var bandListView = Vm.create(this, 'BandListView', BandListView, {collection: this.collection});
      $(bandListView.render().el).appendTo('#bands-page-content');
    },

    renderBandTile: function () {
      this.destroyChildren();
      var bandTileView = Vm.create(this, 'BandTileView', BandTileView, {collection: this.collection});
      //bandTileView.collection.getFirstPage();
      $(bandTileView.render().el).appendTo('#bands-page-content');
    },

    showFilter: function () {
	$('#bands-filter-list-content').toggle();
    },
 
    applyFilter: function () {
 	this.collection.filter = this.filter;
 	this.collection.sort = this.sort;
	this.collection.getFirstPage();
	this.render();
    },

    clearFilter: function () {
	this.filter = {};
	this.sort = {};
        this.filter.genres = [];
        this.filter.regions = [];

 	this.collection.filter = this.filter;
 	this.collection.sort = this.sort;
	this.collection.getFirstPage();
	this.render();
    },

    destroyChildren: function() {
      var parent = this;
      _.each(this.children, function(child, name) {
        if (child.close) {
          child.close();
        }
        child.remove();
        child.undelegateEvents();
        child.unbind();
      }, this);
      this.children = {};
    }

  });
  return BandsPage;
});
