def('Jxl.Mouse', {
    extend: Jxl.Object,
    init: function() {
        Jxl.Object.prototype.init.call(this);
        var self = this;
        Jxl.canvas.onmousemove = function(e) {
            self.x = e.x/Jxl.scale;
            self.y = e.y/Jxl.scale;
        };
        Jxl.canvas.onclick = function(e) {
            
        };
    },
    scrollFactor: new Jxl.Point({x: 0, y: 0}),
    width: 1,
    height: 1
});