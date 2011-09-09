def('Jxl', {
    singleton: true,
    config: function(config) {
        if(config === undefined) config = {};
        var self = this;
        width = (config.width === undefined) ? 240 : config.width;
        height = (config.height === undefined) ? 160 : config.height;
        self.canvas = (config.canvas !== undefined) ? config.canvas : document.createElement('canvas');
        if(config.scale !== undefined) {
            self.setScale(config.scale);
        } else {
            self.setScale(new Jxl.Point({x:1,y:1}));
        }
        self.buffer = self.canvas.getContext('2d');
        self.showBB = false;
        self._width(width);
        self.state = new Jxl.State();
        self.audio = new Jxl.Audio();
        self.mouse = new Jxl.Mouse();
        self.keys = new Jxl.Keyboard();
        self._height(height);
        self.refresh = 16;
        self.running = false;
        self.delta = 0;
        self.fullScreen = false;
        self.keepResolution = false;
        self.date = new Date();
        self._scrollTarget = new Jxl.Point();
        self.unfollow();
        self.scroll = new Jxl.Point();
        self.renderedFrames = 0;
        Jxl.Util.setWorldBounds(0,0,this.width, this.height);
    },
    scale: {
        x: 1, y:1
    },
    follow: function(target, lerp) { 
        if(lerp == undefined) lerp = 1;
        this.followTarget= target;
        this.followLerp = lerp;
        this._scrollTarget.x = (this.width >> 1)-this.followTarget.x-(this.followTarget.width>>1);
        this._scrollTarget.y = (this.height >> 1)-this.followTarget.y-(this.followTarget.height>>1);
        
        this.scroll.x = this._scrollTarget.x;
        this.scroll.y = this._scrollTarget.y;
        this.doFollow();
    },
    doFollow: function() {
        if(this.followTarget != null) {
            this._scrollTarget.x = (this.width>>1)-this.followTarget.x-(this.followTarget.width>>1);
            this._scrollTarget.y = (this.height>>1)-this.followTarget.y-(this.followTarget.height>>1);
            if((this.followLead != null)){
                this._scrollTarget.x -= this.followTarget.velocity.x*this.followLead.x;
                this. _scrollTarget.y -= this.followTarget.velocity.y*this.followLead.y;
            }
            this.scroll.x += (this._scrollTarget.x-this.scroll.x)*this.followLerp*Jxl.delta;
            this.scroll.y += (this._scrollTarget.y-this.scroll.y)*this.followLerp*Jxl.delta;
            if(this.followMin != null) {
                if(this.scroll.x > this.followMin.x)
                    this.scroll.x = this.followMin.x;
                if(this.scroll.y > this.followMin.y)
                    this.scroll.y = this.followMin.y;
            }
            if(this.followMax != null) {
                if(this.scroll.x < this.followMax.x)
                    this.scroll.x = this.followMax.x;
                if(this.scroll.y < this.followMax.y)
                    this.scroll.y = this.followMax.y;
            }
        }
    },
    unfollow: function() {
        this.followTarget = null;
        this.followLead = null;
        this.followLerp = 1;
        this.followMin = null;
        this.followMax = null;
        if(this.scroll == null)
            this.scroll = new Jxl.Point();
        else
            this.scroll.x = scroll.y = 0;
        if(this._scrollTarget == null)
            this._scrollTarget = new Jxl.Point();
        else
            this._scrollTarget.x = this._scrollTarget.y = 0;
    },
    _width: function(width) {
        if(width != undefined) {
            this.screenWidth(width*this.scale.x);
            this.width = Math.floor(width);
        }
    },
    _height: function(height) {
        if(height != undefined) {
            this.screenHeight(height*this.scale.y);
            this.height = Math.floor(height);
        }
    },
    unpause: function() {
        if(!this.running) {
            this.running = true;
            this.audio.unpause();
            this.keys = {};
            this.lastUpdate = new Date();
            this.UI.pause.destroy();
        }
    },
    pause: function() {
        if(this.running) {
            this.running = false;
            this.audio.pause();
            this.UI.pause.render(document.body);
        }
    },
    screenWidth: function(width) {
        if(width != undefined) {
            this.canvas.width = width;
        }
        return this.canvas.width; 
    },
    screenHeight: function(height) {
        if(height != undefined) {
            this.canvas.height = height;
        }
        return this.canvas.height;
    },
    start: function() {
        var self = this;
        self.date = new Date();
        this.lastUpdate = this.date.getTime();
        if(!this.running) {
            this.running = true;
            this.interval = setInterval(function() {
                if(self.running) {
                    self.date = new Date();
                    var curTime = self.date.getTime();
                    var delta = (curTime - self.lastUpdate)/1000;
                    self.update(delta < 1 ? delta : 0);
                    self.lastUpdate = curTime;
                }
            }, this.refresh);
        }
    },
    setScale: function(scale) {
        this.scale = scale;
        this._width(this.width);
        this._height(this.height);
    },
    update: function(delta) {
        this.delta = delta;
        this.doFollow();
        this.state.update();
        this.state.preProcess();
        Jxl.buffer.clearRect(0,0, Jxl.canvas.width, Jxl.canvas.height);
        this.state.render();
        this.mouse.render();        
        this.keys.update();
        this.audio.update();
        this.state.postProcess();
    }
});
