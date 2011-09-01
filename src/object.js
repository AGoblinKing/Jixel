
/***
 * Represents a single point in space
 ***/
def('Jxl.Point', {
    init: function(params) {
        _(this).extend(params);
    },
    x: 0,
    y: 0
});
/***
 * Represents a Rectangle
 ***/
def('Jxl.Rect', {
    extend: Jxl.Point,
    init: function(params) {
        Jxl.Point.prototype.init.call(this, params);
    },
    width: 0,
    height: 0,
    left: function() {
        return this.x;
    },
    right: function() {
        return this.x + this.width;
    },
    top: function() {
        return this.y;
    },
    bottom: function() {
        return this.y+this.height;
    }
});
/***
 * Base Game Object.
 ***/
def('Jxl.Object', {
    extend: Jxl.Rect,
    init: function(params) {
       Jxl.Rect.prototype.init.call(this, params);
    },
    _point: new Jxl.Point(),
    collideLeft: true,
    collideRight: true,
    collideTop: true,
    collideBottom: true,
    origin: new Jxl.Point(),
    velocity: new Jxl.Point(),
    acceleration: new Jxl.Point(),
    _pZero: new Jxl.Point(),
    drag: new Jxl.Point(),
    maxVelocity: new Jxl.Point({x: 10000, y: 10000}),
    angle: 0,
    angularVelocity: 0,
    angularDrag: 0,
    angularAcceleration: 0,
    maxAngular: 10000,
    thrust: 0,
    exists: true,
    visible: true,
    border: {
        visible: false,
        thickness: 2,
        color: '#f00'
    },
    active: true,
    solid: true,
    fixed: false,
    moves: true,
    colHullMinus: new Jxl.Point(),
    health: 1,
    dead: false,
    _flicker: false,
    _flickerTimer: -1,
    scrollFactor: new Jxl.Point({x: 1, y: 1}),
    colHullX: new Jxl.Rect(),
    colHullY: new Jxl.Rect(),
    colVector: new Jxl.Point(),
    colOffsets: [new Jxl.Point()],
    _group: false,
    refreshHulls: function() {
        var cx = this.colHullMinus.x,
            cy = this.colHullMinus.y;
        this.colHullX.x = this.x + cx;
        this.colHullX.y = this.y + cy;
        this.colHullX.width = this.width - cx;
        this.colHullX.height = this.height - cy;
        this.colHullY.x = this.x + cx;
        this.colHullY.y = this.y + cx;
        this.colHullY.width = this.width - cx;
        this.colHullY.height = this.height - cx;
    },
    updateMotion: function() {
        if(!this.moves) return;
        if(this.solid) this.refreshHulls();
        this.onFloor = false;
        var vc = (Jxl.Util.computeVelocity(Jxl.delta, this.angularVelocity, this.angularAcceleration, this.angularDrag, this.maxAngular) - this.angularVelocity)/2;
        this.angularVelocity += vc;
        this.angle += this.angularVelocity*Jxl.delta;
        this.angularVelocity += vc;
        
        var thrustComponents;
        if(this.thrust != 0 ) {
            thrustComponents = Jxl.Util.rotatePoint(-this.thrust, 0, 0, 0,this.angle);
            var maxComponents = Jxl.Util.rotatePoint(-this.maxThrust, 0, 0, 0, this.angle);
            var max = Math.abs(maxComponents.x);
            if(max > Math.abs(maxComponents.y)) maxComponents.y = max;
            else max = Math.abs(maxComponents.y);
            this.maxVelocity.x = this.maxVelocity.y = Math.abs(max);
        } else {
            thrustComponents = this._pZero;
        }
        
        vc = (Jxl.Util.computeVelocity(this.velocity.x, this.acceleration.x+thrustComponents.x,this.drag.x, this.maxVelocity.x) - this.velocity.x)/2;
        this.velocity.x += vc;
        var xd = this.velocity.x * Jxl.delta;
        this.velocity.x += vc;
        
        vc = (Jxl.Util.computeVelocity(this.velocity.y, this.acceleration.y+thrustComponents.y, this.drag.y, this.maxVelocity.y) - this.velocity.y)/2;
        this.velocity.y += vc;
        var yd = this.velocity.y * Jxl.delta;
        this.velocity.y += vc;
        
        this.x += xd;
        this.y += yd;
        
        if(!this.solid) return;
        
        this.colVector.x = xd;
        this.colVector.y = yd;
        this.colHullX.width += Math.abs(xd);
        if(this.colVector.x < 0) this.colHullX.x += this.colVector.x;
        this.colHullY.x = this.x;
        this.colHullY.height += Math.abs(this.colVector.y);
        if(this.colVector.y < 0) this.colHullY.y += this.colVector.y;
    },
    updateFlickering: function() {
        if(this.flickering()) {
            if(this._flickerTimer > 0) {
                this._flickerTimer -= Jxl.delta;
                if(this._flickerTimer == 0) this._flickerTimer = -1;
            }
            if(this._flickerTimer < 0) this.flicker(-1);
            else {
                this._flicker = !this._flicker;
                this.visible = !this._flicker;
            }
        }
    },
    update: function() {
        this.updateMotion();
        this.updateFlickering();
    },
    flicker: function(duration) {
        if(duration == undefined) duration = 1;
        this._flickerTimer = duration;
        if(this._flickerTimer < 0) {
            this._flicker = false;
            this.visible = true;
        }
    },
    reset: function(x, y) {
        if(x == undefined) x = 0;
        if(y == undefined) y = 0;
        this.x = x;
        this.y = y;
        this.exists = true;
        this.dead = false;
    },
    overlaps: function(object) {
        this._point = this.getScreenXY(this._point);
        var tx = this._point.x;
        var ty = this._point.y;
        var tw = this.width;
        var th = this.height;
        if(this.isSprite != undefined) {
            var ts = this;
            tw = ts.frameWidth;
            th = ts.frameHeight;
        }
        this._point = object.getScreenXY(this._point);
        var ox = this._point.x;
        var oy = this._point.y;
        var ow = this.object.width;
        var oh = this.object.height;
        
        if(object.isSprite != undefined) {
            var os = object;
            ow = os.frameWidth;
            oh = os.frameHeight;
        }
        if((ox <= tx-ow) || (ox >= tx+tw) || (oy <= ty-oh) || (oy >= ty+th))
            return false;
        return true; 
    },
    overlapsPoint: function(x, y, perPixel) {
        if(perPixel == undefined) perPixel = false;
        
        x += Math.floor(Jxl.scroll.x);
        y += Math.floor(Jxl.scroll.y);
        this._point = this.getScreenXY(this._point);
        if((x <= this._point.x) || (x >= this._point.x+this.width) || (y <= this._point.y) || (y >= this._point.y+this.height))
            return false;
        return true;
    },
    collide: function(object) {
        if(object == undefined) object = this;
        return Jxl.Util.collide(this, object);
    },
    preCollide: function(object) {},
    hitLeft: function(contact, velocity) {
        if(!this.fixed) this.velocity.x = velocity;
    },
    hitRight: function(contact, velocity) {
        this.hitLeft(contact, velocity);
    },
    hitTop: function(contact, velocity) {
        if(!this.fixed) this.velocity.y = velocity;
    },
    hitBottom: function(contact, velocity) {
        this.onFloor = true; 
        if(!this.fixed) this.velocity.y = velocity;
    },
    flickering: function() {
        return this._flickerTimer >= 0;
    },
    hurt: function(damage) {
        if((this.health -= damage) <= 0 ) this.kill();
    },
    kill: function() {
        this.exists = false;
        this.dead = true;
    },
    render: function() {
        if(this.border.visible) {
            this._point = this.getScreenXY(this._point);
            this.renderBorder(); 
        }
    },
    renderBorder: function(point) {
        Jxl.buffer.strokeStyle = this.border.color;
        Jxl.buffer.lineWidth = this.border.thickness;
        Jxl.buffer.strokeRect(this._point.x-this.border.thickness, this._point.y-this.border.thickness, this.width+this.border.thickness, this.height+this.border.thickness);
    },
    getScreenXY: function(point) {
        if(point == undefined) point = new Jxl.Point();
        point.x = Math.floor(this.x+Jxl.Util.roundingError)+Math.floor(Jxl.scroll.x*this.scrollFactor.x);
        point.y = Math.floor(this.y+Jxl.Util.roundingError)+Math.floor(Jxl.scroll.y*this.scrollFactor.y);
        return point;
    }
});

