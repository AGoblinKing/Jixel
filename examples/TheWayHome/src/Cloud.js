def('TWH.Cloud', {
    extend: Jxl.Sprite,
    init: function(x, y) {
        var defaults = {
            graphic:Jxl.am.get('cloud'), 
            x:x, 
            y:y, 
            width:Jxl.am.get('cloud').width, 
            height:Jxl.am.get('cloud').height
        };
        Jxl.Sprite.prototype.init.call(this, defaults);
        this.velocity.x = -10;
        this.scrollFactor.x = 1;
        this.scrollFactor.y = 1;
        var scale = Math.random()*2;
        this.scale.x = scale;
        this.scale.y = scale;
        this.solid = false;
    }, 
    update: function() {
        Jxl.Sprite.prototype.update.call(this);
    }
});
