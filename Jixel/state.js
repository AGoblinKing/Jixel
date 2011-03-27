Jxl.State = new Class({
    initialize: function(params) {
        Object.merge(this, Jxl.State.DEFAULTS, params);
        this.create();
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

Jxl.State.DEFAULTS = {
    defaultGroup: new Jxl.Group()
}
