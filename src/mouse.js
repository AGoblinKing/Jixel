def('Jxl.Mouse', {
    extend: Jxl.Object,
    init: function() {
        Jxl.Object.prototype.init.call(this);
        var self = this;
        Jxl.canvas.addEventListener('mousemove', function(e) {
            self.x = e.x/Jxl.scale;
            self.y = e.y/Jxl.scale;
        }, true);
        Jxl.canvas.addEventListener('click', function(e) {
            //collide with objects and tell them they were clicked
            console.log([self.x, self.y]);
        }, true);
    },
    scrollFactor: new Jxl.Point({x: 0, y: 0}),
    width: 1,
    height: 1
});