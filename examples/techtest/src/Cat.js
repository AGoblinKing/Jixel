def('Cat', {
    extend: Jxl.Sprite,
    init: function(graphic, x, y) {
        Jxl.Sprite.prototype.init.call(this, {graphic:graphic, x:x, y:y, width:32, height:32});
        this.addAnimation('run', [72,73,74,73], .30);
        this.addAnimation('idle', [48,49,50,49], .50);
        this.play('idle');
        this.speed = -80;
        this.drag = new Jxl.Point({x:150,y:150});
    },
    update: function() {
        /*
        if ('A' in game.keys) {
             this.velocity.x = this.speed;
             this._flipped = true;
             this.play('run');
        } else if ('D' in game.keys) {
             this._flipped = false;
             this.play('run');
             this.velocity.x = -1*this.speed;
        } else {
             this.play('idle');
        }
        if('SPACE' in game.keys && this.onFloor) {
             game.audio.play('jump');
             this.velocity.y = -150;
        } */ 
        Jxl.Sprite.prototype.update.call(this);
    }  
});