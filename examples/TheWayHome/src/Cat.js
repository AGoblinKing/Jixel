def('TWH.Cat', {
    extend: Jxl.Sprite,
    init: function(graphic, x, y) {
        Jxl.Sprite.prototype.init.call(this, {graphic:graphic, x:x, y:y, width:32, height:32});
        this.addAnimation('run', [72,73,74,73], .30);
        this.addAnimation('idle', [48,49,50,49], .50);
        this.play('idle');
        this.speed = -80;
        this.drag = new Jxl.Point({x:150,y:0});
        _(this).extend({
            delta: 0
        });
        this.acceleration.y = 200;
    },
    update: function() {
        if(this.y > 900) {
            //explode!
        }
        if (Jxl.keys.on('A')) {
             this.velocity.x = this.speed;
             this.reverse = true;
             this.play('run');
        } else if (Jxl.keys.on('D')) {
             this.reverse = false;
             this.play('run');
             this.velocity.x = -1*this.speed;
        } else {
             this.play('idle');
        }
        if((Jxl.keys.press(32) || Jxl.keys.touchPress) && this.onFloor) {
            this.velocity.y = -180;
            this.velocity.x += (this.reverse ? 1 : -1) * this.speed;
            Jxl.audio.play('jump');
        } 
        this.delta += Jxl.delta;
        Jxl.Sprite.prototype.update.call(this);
    }
});
