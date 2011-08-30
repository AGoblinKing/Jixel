def('Jxl.Particle', {
    extend: Jxl.Sprite,
    init: function(config) {
        this.prototype.supr.call(this);
        this._bounce = config.bounce;
    },
    hitSide: function(Contact, Velocity) {
        this.velocity.x = -this.velocity.x * this._bounce;
        if(this.angularVelocity != 0)
            this.angularVelocity = -this.angularVelocity * this._bounce;
    },
    hitBottom: function(Contact, Velocity) {
        this.onFloor = true;
        if(((this.velocity.y > 0) ? this.velocity.y : -this.velocity.y) > this._bounce*100) {
            this.velocity.y = -this.velocity.y * this._bounce;
            if(this.angularVelocity != 0)
                this.angularVelocity *= -this._bounce;
        } else {
            this.angularVelocity = 0;
            this.parent(Contact,Velocity);
        }
        this.velocity.x *= this._bounce;
    }
});

def('Jxl.Emitter', {
    Extends: Jxl.Group,
    initialize: function(config) {
        X = ( config.x == undefined) ? 0 : config.x;
        Y = ( config.y == undefined) ? 0 : config.y;
        this.parent();
        this.x = X;
        this.y = Y;
        this.width = 0;
        this.height = 0;
            
        this.minParticleSpeed = new JxlPoint(-100,-100);
        this.maxParticleSpeed = new JxlPoint(100,100);
        this.minRotation = -360;
        this.maxRotation = 360;
        this.gravity = 400;
        this.particleDrag = new JxlPoint();
        this.delay = 0;
        this.quantity = 0;
        this._counter = 0;
        this._explode = true;
        this.exists = false;
        this.on = false;
        this.justEmitted = false;
    },
    render: function(ctx, game) {
        this.prototype.supr.render(ctx, game);  
    },
    createSprites: function(Graphics, Quantity, Dimensions, Multiple, Collide, Bounce) {
        Quantity = ( Quantity == undefined) ? 50 : Quantity;
        Dimensions = (Dimensions === undefined) ? new JxlPoint(Graphics.width, Graphics.height): Dimensions;
        Multiple = (Multiple === undefined) ? true : Multiple;
        Collide = ( Collide == undefined) ? 0 : Collide;
        Bounce = ( Bounce == undefined) ? 0 : Bounce;
    
        this.members = new Array();
        var r;
        var s;
        var tf = 1;
        var sw;
        var sh;
        if(Multiple) {
            s = new JxlSprite().loadGraphic(Graphics, true, false, Dimensions.x, Dimensions.y);
            tf = s.frames;
        }
        var i = 0;
        while(i < Quantity) {
            if((Collide > 0) && (Bounce > 0))
                s = new JxlParticle(Bounce);
            else
                s = new JxlSprite();
                
            if(Multiple) {
                r = Math.random()*tf;
                s.loadGraphic(Graphics,true, false, Dimensions.x, Dimensions.y);
                s.frame = r;
            } else {
                s.loadGraphic(Graphics);
            }
            if(Collide > 0) {
                sw = s.width;
                sh = s.height;
                s.width *= Collide;
                s.height *= Collide;
                s.offset.x = (sw-s.width)/2;
                s.offset.y = (sh-s.height)/2;
                s.solid = true;
            }
            else
                s.solid = false;
            s.exists = false;
            this.add(s);
            i++;
        }
        return this;
    },
    setSize: function(Width,Height) {
        this.width = Width;
        this.height = Height;
    },
    setXSpeed: function(Min, Max) {
        Min = ( Min == undefined) ? 0 : Min;
        Max = ( Max == undefined) ? 0 : Max;
    
        this.minParticleSpeed.x = Min;
        this.maxParticleSpeed.x = Max;
    },
    setYSpeed: function(Min, Max) {
        Min = ( Min == undefined) ? 0 : Min;
        Max = ( Max == undefined) ? 0 : Max;
    
        this.minParticleSpeed.y = Min;
        this.maxParticleSpeed.y = Max;
    },
    setRotation: function(Min, Max) {
        Min = ( Min == undefined) ? 0 : Min;
        Max = ( Max == undefined) ? 0 : Max;
    
        this.minRotation = Min;
        this.maxRotation = Max;
    },
    updateEmitter: function(game, delta) {
        if(this._explode)
        {
            this._timer += delta;
            if((this.delay > 0) && (this._timer > this.delay))
            {
                this.kill();
                return;
            }
            if(this.on)
            {
                this.on = false;
                var i = this._particle;
                var l = this.members.length;
                if(this.quantity > 0)
                    l = this.quantity;
                l += this._particle;
                while(i < l)
                {
                    this.emitParticle();
                    i++;
                }
            }
            return;
        }
        if(!this.on)
            return;
        this._timer += delta;
        while((this._timer > this.delay) && ((this.quantity <= 0) || (this._counter < this.quantity)))
        {
            this._timer -= this.delay;
            this.emitParticle();
        }
    },
    updateMembers: function(game, delta) {
        var o;
        var i = 0;
        var l = this.members.length;
        while(i < l) {
            o = this.members[i++];
            if((o !== undefined && o !== null) && o.exists && o.active)
                o.update(game, delta);
        }
    },
    update: function(game, delta) {
        this.justEmitted = false;
        this.parent(game, delta);
        this.updateEmitter(game, delta);
    },
    start: function(Explode, Delay, Quantity) {
        Explode = (Explode === undefined) ? true : Explode;
        Delay = isNaN(Delay) ? 0 : Delay;
        Quantity = ( Quantity == undefined) ? 0 : Quantity;
    
        if(this.members.length <= 0) {
            //FlxG.log("WARNING: there are no sprites loaded in your emitter.\nAdd some to FlxEmitter.members or use FlxEmitter.createSprites().");
            return this;
        }
        this._explode = Explode;
        if(!this._explode)
            this._counter = 0;
        if(!this.exists)
            this._particle = 0;
        this.exists = true;
        this.visible = true;
        this.active = true;
        this.dead = false;
        this.on = true;
        this._timer = 0;
        if(this.quantity == 0)
            this.quantity = Quantity;
        else if(Quantity != 0)
            this.quantity = Quantity;
        if(Delay != 0)
            this.delay = Delay;
        if(this.delay < 0)
            this.delay = -this.delay;
        if(this.delay == 0)
        {
            if(Explode)
                this.delay = 3;	//default value for particle explosions
            else
                this.delay = 0.1;//default value for particle streams
        }
        return this;
    },
    emitParticle: function()  {
        this._counter++;
        var s = this.members[this._particle];
        s.visible = true;
        s.exists = true;
        s.active = true;
        s.x = this.x - (s.width>>1) + Math.random() * this.width;
        s.y = this.y - (s.height>>1) + Math.random()* this.height;
        s.velocity.x = this.minParticleSpeed.x;
        if(this.minParticleSpeed.x != this.maxParticleSpeed.x) s.velocity.x += Math.random()*(this.maxParticleSpeed.x-this.minParticleSpeed.x);
        s.velocity.y = this.minParticleSpeed.y;
        if(this.minParticleSpeed.y != this.maxParticleSpeed.y) s.velocity.y += Math.random()*(this.maxParticleSpeed.y-this.minParticleSpeed.y);
        s.acceleration.y = this.gravity;
        s.angularVelocity = this.minRotation;
        if(this.minRotation != this.maxRotation) s.angularVelocity += Math.random()*(this.maxRotation-this.minRotation);
        if(s.angularVelocity != 0) s.angle = Math.random()*360-180;
        s.drag.x = this.particleDrag.x;
        s.drag.y = this.particleDrag.y;
        this._particle++;
        if(this._particle >= this.members.length)
                this._particle = 0;
        s.onEmit();
        this.justEmitted = true;
    },
    stop: function(Delay) {
        Delay = ( Delay == undefined) ? 3 : Delay;

        this._explode = true;
        this.delay = Delay;
        if(this.delay < 0)
                this.delay = -Delay;
        this.on = false;
    },
    at: function(Obj) {
        Obj.resetHelpers();
        this.x = Obj.x + Obj.origin.x;
        this.y = Obj.y + Obj.origin.y;
    },
    kill: function() {
        this.parent();
        this.on = false;
    }
});