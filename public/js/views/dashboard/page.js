define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/dashboard/page.html'
], function($, _, Backbone, dashboardPageTemplate){
  var DashboardPage = Backbone.View.extend({
    el: '#content',
    render: function () {
      $(this.el).html(dashboardPageTemplate);
    }
  });
  return DashboardPage;
});