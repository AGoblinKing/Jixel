def('Jxl.State', {
    init: function(options) {
        _(this).extend(options);
	    this.create();
    },
	defaultGroup: new Jxl.Group(),
    create: function() {},
    add: function(object) {
        return this.defaultGroup.add(object);
    },
    remove: function(object) {
	    this.defaultGroup.remove(object);
    },
    preProcess: function() {
        Jxl.buffer.clearRect(0,0, Jxl.screenWidth(), Jxl.screenHeight());
    },
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
