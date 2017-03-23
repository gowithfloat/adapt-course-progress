define(function(require) {

    var ProgressView = Backbone.View.extend({
        initialize: function () {
            this.model.on("change", this.render, this);
            this.render();
        },

        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates["course-progress"];
            this.$el.html(template(data));
            return this;
        }
    });

    return ProgressView;
});
