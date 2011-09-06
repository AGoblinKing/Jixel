def('Jxl.Mouse', {
    extend: Jxl.Object,
    init: function() {
        Jxl.Object.prototype.init.call(this);
        var self = this;
        Jxl.canvas.addEventListener('mousemove', function(e) {
            self.x = e.x/Jxl.scale.x;
            self.y = e.y/Jxl.scale.x;
        }, true);
        Jxl.canvas.addEventListener('click', function(e) {
            //collide with objects.. set special flag about type of click
        }, true);
        Jxl.canvas.addEventListener('contextmenu', function(e){
            console.log([self.x, self.y]);
            if(e.preventDefault)
                e.preventDefault();
            else
                e.returnValue= false;
            return false;
        }, true);
        _(this).extend({
            scrollFactor: new Jxl.Point({x: 0, y: 0}),
        });
    },
    width: 1,
    height: 1
});
