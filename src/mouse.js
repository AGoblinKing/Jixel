def('Jxl.Mouse', {
    extend: Jxl.Object,
    init: function() {
        Jxl.Object.prototype.init.call(this);
        var self = this;
        Jxl.canvas.addEventListener('mousemove', function(e) {
            self.x = e.offsetX/Jxl.scale.x-Jxl.scroll.x;
            self.y = e.offsetY/Jxl.scale.y-Jxl.scroll.y;
        }, true);
        Jxl.canvas.addEventListener('click', function(e) {
            Jxl.Util.overlap(self, Jxl.state.defaultGroup, function(obj1, obj2) {
                if(obj2.click) obj2.click();
            });
        }, true);
        Jxl.canvas.addEventListener('contextmenu', function(e){
            Jxl.Util.overlap(self, Jxl.state.defaultGroup, function(obj1, obj2) {
                if(obj2.rclick) obj2.rclick();
            });
            if(e.preventDefault)
                e.preventDefault();
            else
                e.returnValue = false;
            return false;
        }, true);
        _(this).extend({
            scrollFactor: new Jxl.Point({x: 0, y: 0}),
        });
    },
    width: 5,
    height: 5
});
