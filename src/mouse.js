Jxl.Mouse = new Class({
    Extends: Jxl.Object,
    initialize: function() {
        this.parent();
        var self = this;
        Jxl.canvas.addEvent('mousemove', function(e) {
            self.x = e.event.x/Jxl.scale;
            self.y = e.event.y/Jxl.scale;
        });
    },
    options: {
        scrollFactor: new Jxl.Point({x: 0, y: 0}),
        width: 1,
        height: 1
    }
});