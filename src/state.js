def('Jxl.State', {
    init: function(params) {
        _(this).extend({
            defaultGroup: new Jxl.Group()
        });
        _(this).extend(params);
    },
    add: function(object) {
        return this.defaultGroup.add(object);
    },
    remove: function(object) {
	    this.defaultGroup.remove(object);
    },
    preProcess: function() {},
    update: function() {
        this.defaultGroup.update();
    },
    collide: function() {
        Jxl.Util.collide(this.defaultGroup, this.defaultGroup);
    },
    render: function() {
        this.defaultGroup.render();
    },
    postProcess: function() {},
    destroy: function() {
        this.defaultGroup.destroy();
    }
});
