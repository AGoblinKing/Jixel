def('Jxl.Sprite', {
    extend: Jxl.Object,
    init: function(config) {
        var self = this;
        console.log(config);
        Jxl.Object.prototype.init.call(this, config);
        this.buffer = document.createElement('canvas');
        this.buffer.width = this.width;
        this.buffer.height = this.height;
        if(this.graphic == undefined) this.graphic = document.createElement('canvas');
        this.bufferCTX = this.buffer.getContext('2d');
        this.bufferCTX.drawImage(this.graphic, 0, 0, this.width, this.height, 0, 0, this.width, this.height); 
        this.resetHelpers();
    },
	isSprite: true,
	angle: 0,
	_alpha: 1,
	_color: 0x00ffffff,
	_blend: null,
	scale: new Jxl.Point({x: 1,y: 1}),
	_facing: 1,
	_animations: {},
	_flipped: 0,
	_curFrame: 0,
	_frameTimer: 0,
	finished: false,
	_caf: 0,
	offset: new Jxl.Point(),
	_curAnim: null,
	animated: false,
    play: function(name, force) {
        if(force == undefined) force = false;
        if(!force && this._curAnim != null && name == this._curAnim.name) return;
        this._curFrame = 0;
        this._caf = 0;
        this._curAnim = this._animations[name];
        this._curFrame = this._curAnim.frames[this._caf]; 
    },
    flip: function() {
        this.bufferCTX.scale(-1,1);
        this.bufferCTX.translate(-this.width, 0); 
    },
    calcFrame: function() {
        this.bufferCTX.clearRect(0, 0, this.width, this.height);
        var rx = this._curFrame * this.width;
        var ry = 0;
        if(rx > this.graphic.width) {
            ry = Math.floor(rx/this.graphic.width)*this.height;
            rx = rx % this.graphic.width;
        }
        if(this._flipped) this.flip();
        this.bufferCTX.drawImage(this.graphic, rx, ry, this.width, this.height, 0, 0, this.width, this.height);
    },
    // Rotations are stored on the fly instead of prebaked since they are cheaper here than in flixel.
    render: function(){
        if(!this.visible) return;
        this.buffer.width = this.width; //dirty hack to reset the canvas
        if(this.animated) this.calcFrame();
        var rCan = this.buffer;
        this._point = this.getScreenXY(this._point);
	    if(this.border.visible || Jxl.showBB) this.renderBorder(this._point);
        Jxl.buffer.drawImage(rCan, 0,0, this.width, this.height, this._point.x, this._point.y, this.width, this.height);    
    },
    onEmit: function() {},
    updateAnimation: function() {
        if((this._curAnim != null) && (this._curAnim.delay > 0) && (this._curAnim.looped || !this.finished )) {
            this._frameTimer += Jxl.delta;
            if(this._frameTimer > this._curAnim.delay) {
                this._frameTimer -= this._curAnim.delay;
                if(this._caf == this._curAnim.frames.length-1) {
                    if(this._curAnim.looped) this._caf = 0;
                    this.finished = true;
					this.animationComplete(this._curAnim.name, this._curAnim.looped);
                } else {
                    this._caf++;
                }
                this._curFrame = this._curAnim.frames[this._caf];
            }
        }
    },
    animationComplete: function(name, isLooped) {},
    addAnimation: function(name, frames, frameRate, looped ){
        if(frameRate == undefined)
            frameRate = 0;
        if(looped == undefined)
            looped = true;
        this._animations[name] = new Jxl.Anim(name, frames, frameRate, looped);
    },
    update: function() {
        this.updateMotion();
        this.updateAnimation();
        this.updateFlickering();
    },
    getScreenXY: function(point) {
        if(point == undefined) point = new Jxl.Point();
        point.x = Math.floor(this.x+Jxl.Util.roundingError)+Math.floor(Jxl.scroll.x*this.scrollFactor.x) - this.offset.x;
        point.y = Math.floor(this.y+Jxl.Util.roundingError)+Math.floor(Jxl.scroll.y*this.scrollFactor.y) - this.offset.y;
        return point;
    },
    overlapsPoint: function(game, x, y, perPixel) {
        if(perPixel == undefined) perPixel = false;
        
        x -= Math.floor(Jxl.scroll.x);
        y -= Math.floor(Jxl.scroll.y);
        this._point = this.getScreenXY(this._point);
    
        if((x <= this._point.x) || (x >= this._point.x+this.width) || (y <= this._point.y) || (y >= this._point.y+this.height))
            return false;
        return true;
    },
    getFacing: function() {
        return this._facing;
    },
    setFacing: function(Direction) {
        var c = this._facing != Direction;
        this._facing = Direction;
        if(c) this.calcFrame();
    },
    resetHelpers: function () {
        this._boundsVisible = false;
        this.origin.x = this.width*0.5;
        this.origin.y = this.height*0.5;
        if(this.graphic) this.frames = Math.floor(this.graphic.width/this.width*this.graphic.height/this.height);
        this._caf = 0;
        this.refreshHulls();
        this._graphicCTX = this.graphic.getContext('2d');
    },
    createGraphic: function(Width, Height, Color) {
        Color = ( Color == undefined) ? 0xFFFFFFFF : Color;
        this.graphic = document.createElement('canvas');
        var ctx = this.graphic.getContext('2d');
        this.width = this.graphic.width = this.frameWidth = Width;
	    this.height = this.graphic.height = this.frameHeight = Height;
        ctx.fillStyle = Jxl.Util.makeRGBA(Color);
        ctx.fillRect(0, 0, Width, Height);
        this.resetHelpers();
        return this;
    }
});
Jxl.Sprite.LEFT = 0;
Jxl.Sprite.RIGHT = 1;
Jxl.Sprite.UP = 2;
Jxl.Sprite.DOWN = 3;


def('Jxl.Anim', {
    init: function(name, frames, frameRate, looped){
        this.name = name;
        this.delay = 0;
        if(frameRate > 0)
            this.delay = frameRate;
        this.frames = frames;
        this.looped = looped;
    }
});