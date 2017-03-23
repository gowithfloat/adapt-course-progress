define(["coreJS/adapt", "./ProgressView"], function(Adapt, ProgressView) {
    var progressReporter = new Progress();
    var progressView = new ProgressView({model: progressReporter});

    Adapt.on('app:dataLoaded', function() {
        calculateCompletion(Adapt, progressReporter);

        Adapt.articles.on("change:_isComplete", function() {
            calculateCompletion(Adapt, progressReporter);
        });

        Adapt.on("pageView:postRender", function(view) {
            view.$el.addClass("shows-progress");
            view.$el.append(progressView.$el);
        });
    });
});

var Progress = Backbone.Model.extend({
    defaults: {
        /**
         * The number of units that are completed.
         *
         * @type {Number}
         */
        completeUnitCount: 0,
        /**
         * The total number of units.
         * "Units" is a generic term of an item being used to track completion (e.g Adapt Pages or Articles).
         *
         * @type {Number}
         */
        totalUnitCount: 0,
        /**
         * The number of units left to complete.
         *
         * @type {Number}
         */
        remainingUnitCount: 0,
        /**
         * The percent completion on a scale of 0 to 1.
         *
         * @type {Number}
         */
        percentComplete: 0,
        /**
         * The percent completion on a scale of 0 to 100 (whole numbers).
         *
         * @type {Number}
         */
        displayPercentComplete: 0
    },

    /**
     * Updates the progress represented by this progress model.
     *
     * @param  {Number} completeUnitCount The number of units completed.
     * @param  {Number} totalUnitCount    The total number of units.
     */
    updateProgress: function(completeUnitCount, totalUnitCount) {
        var percentComplete = totalUnitCount === 0 ? 1 : completeUnitCount / totalUnitCount;
        this.set({
            completeUnitCount: completeUnitCount,
            remainingUnitCount: totalUnitCount - completeUnitCount,
            totalUnitCount: totalUnitCount,
            percentComplete: percentComplete,
            displayPercentComplete: Math.round(percentComplete * 100)
        })
    }
});

/**
 * Calculates the completion of the provided Adapt course.
 *
 * @param  {AdaptModel} Adapt            The Adapt course to report completion on.
 * @param  {Progress}   progressReporter The progress reporter receiving the updated progress information.
 */
function calculateCompletion(Adapt, progressReporter) {
    var availableContentObjects = new Backbone.Collection(Adapt.articles.where({_isAvailable: true, _isOptional: false}));

    var requireCompletionOf = Adapt.course.get("_requireCompletionOf");
    var total = requireCompletionOf === -1 ? availableContentObjects.length : requireCompletionOf;

    var complete = availableContentObjects.where({_isComplete: true}).length;

    progressReporter.updateProgress(complete, total);
}