def('TWH.Cat', {
    extend: Jxl.Sprite,
    init: function(graphic, x, y) {
        Jxl.Sprite.prototype.init.call(this, {graphic:graphic, x:x, y:y, width:32, height:32});
        this.emitter = new Jxl.Emitter();
        this.emitter.createSprites(Jxl.am.get('catbits'), 8, new Jxl.Point({x:16, y:16}), true, true); 
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
    click: function() {
        this.explode();
    },
    explode: function() {
        Jxl.audio.play('hit');
        this.solid = false;
        this.visible = false;
        this.emitter.x = this.x;
        this.emitter.y = this.y;
        this.emitter.start();
        var self = this;
        setTimeout(function() {
            self.respawn();
        }, 3000);
    },
    respawn: function() {
        this.visible = true;
        this.setFlicker(1);
        this.solid = true;
        this.x = 0;
        this.y = 0;
    },
    update: function() {
        if(!this.solid) return;
        if(this.y > 900) {
            this.explode();
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
            this.jumped = true;
            this.velocity.y = -180;
            this.velocity.x += (this.reverse ? 1 : -1) * this.speed;
            Jxl.audio.play('jump');
        }
        if(!Jxl.keys.on(32) && this.jumped && this.velocity.y < -50) {
            this.velocity.y = -50;
            this.jumped = false;
        }
        
        this.delta += Jxl.delta;
        Jxl.Sprite.prototype.update.call(this);
    }
});
