Jxl.State = new Class({
    Implements: [Options],
    initialize: function(options) {
        this.setOptions(options);
        Object.merge(this, this.options);
	this.create();
    },
    options: {
	defaultGroup: new Jxl.Group()
    },
    create: function() {
    
    },
    add: function(object) {
        return this.defaultGroup.add(object);
    },
    remove: function(object) {
	    this.defaultGroup.remove(object);
    },
    preProcess: function() {
        Jxl.buffer.clearRect(0,0, Jxl.screenWidth(), Jxl.screenHeight());
    },
    update: function(delta) {
        this.defaultGroup.update(delta);
    },
    collide: function() {
        Jxl.u.collide(this.defaultGroup, this.defaultGroup);
    },
    render: function() {
        this.defaultGroup.render();
    },
    postProcess: function() {
    },
    destroy: function() {
        this.defaultGroup.destroy();
    }
});
