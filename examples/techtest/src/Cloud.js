def('Cloud', {
    extend: Jxl.Sprite,
    init: function(x, y) {
        var defaults = {
            graphic:Jxl.am.get('cloud'), 
            x:x, 
            y:y, 
            width:Jxl.am.get('cloud').width, 
            height:Jxl.am.get('cloud').height,
            fixed: true
        };
        Jxl.Sprite.prototype.init.call(this, defaults);
    }, 
    update: function() {
        Jxl.Sprite.prototype.update.call(this);
    }
});