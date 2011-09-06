def('TWH.CatNip', {
    extend: Jxl.Sprite,
    init: function(x, y) {
        var graphic = Jxl.am.get('catnip');
        Jxl.Sprite.prototype.init.call(this, {graphic:graphic, x:x, y:y, width:16, height:16});
        this.fixed = true;
    },
    update: function() {
        Jxl.Sprite.prototype.update.call(this);
    }
});
