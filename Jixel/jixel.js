/***
 * Consider this a singleton, just doing it this way so you could possibly override
 * Jixel and then instantiate Jxl.
 ***/
var Jixel = new Class({
    init: function(callback) {
        var self = this;
        window.addEvent('domready', function() {
            self.state = new Jxl.State();
            self.canvas = new Element('canvas');
            self.buffer = self.canvas.getContext('2d');
            self.scale = 1;
            self.autoPause = false;
            self._width(240);
            self._height(160);
            self.refresh = 16;
            self.running = false;
            self.fullScreen = false;
            self.keepResolution = false;
            self.date = new Date();
            self.keys = {};
            self._showFPS = false;
            self._scrollTarget = new Jxl.Point();
            self.unfollow();
            self.renderedFrames = 0;
            Jxl.u.setWorldBounds(0,0,this.width, this.height);
            /*** Input Overrides ***/
            self.overrideElements = {'INPUT':'','TEXTAREA':''};
            /*** Setup Events ***/
            window.addEvents({
                blur: function() {
                    if(self.autoPause) self.pause();
                },
                resize: function() {
                    if(self.fullScreen) {
                        if(!self.keepResolution) {
                            self.bufferCanvas.width = self.width = window.get('width');
                            self.bufferCanvas.height = self.height = window.get('height');
                        }
                        self.canvas.width = window.get('width');
                        self.canvas.height = window.get('height');
                    }
                }
            });
            self.canvas.addEvent('click', function(e) {
                self.click(e);   
            });
            document.addEvents({
                'keyup': function(e) {
                    delete self.keys[e.key.toUpperCase()];
                },
                'keydown': function(e) {
                    self.keys[e.key.toUpperCase()] = true;
                    if(self.overrideElements[document.activeElement.tagName] == undefined) {
                        return false;
                    }
                }
            });
            callback();
        });
    },
    toggleFPS: function() {
        if(!this._showFPS) {
            this.showFPS();
        } else {
            this.hideFPS();
        }
    },
    follow: function(target, lerp) { 
        if(lerp == undefined) lerp = 1;
        this.followTarget= target;
        this.followLerp = lerp;
        this._scrollTarget.x = (this.width >> 1)-this.followTarget.x-(this.followTarget.width>>1);
        this._scrollTarget.y = (this.height >> 1)-this.followTarget.y-(this.followTarget.height>>1);
        
        this.scroll.x = this._scrollTarget.x;
        this.scroll.y = this._scrollTarget.y;
        this.doFollow(0);
    },
    doFollow: function(delta) {
        if(this.followTarget != null) {
            this._scrollTarget.x = (this.width>>1)-this.followTarget.x-(this.followTarget.width>>1);
            this._scrollTarget.y = (this.height>>1)-this.followTarget.y-(this.followTarget.height>>1);
            if((this.followLead != null)){
                this._scrollTarget.x -= this.followTarget.velocity.x*this.followLead.x;
               this. _scrollTarget.y -= this.followTarget.velocity.y*this.followLead.y;
            }
            this.scroll.x += (this._scrollTarget.x-this.scroll.x)*this.followLerp*delta;
            this.scroll.y += (this._scrollTarget.y-this.scroll.y)*this.followLerp*delta;
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
    showFPS: function() {
        if(!this._showFPS) {
            this._showFPS = true;
            this.ui.fps.render(document.body);
        }
    },
    hideFPS: function() {
        if(this._showFPS) {
            this._showFPS = false;
            this.ui.fps.destroy();
        }
    },
    _width: function(width) {
        if(width != undefined) {
            this.screenWidth(width*this.scale);
            this.width = width;
        }
    },
    _height: function(height) {
        if(height != undefined) {
            this.screenHeight(height*this.scale);
            this.height = height;
        }
    },
    unpause: function() {
        if(!this.running) {
            this.running = true;
            this.audio.unpause();
            this.keys = {};
            this.lastUpdate = new Date();
            this.ui.pauseMenu.destroy();
        }
    },
    pause: function() {
        if(this.running) {
            this.running = false;
            this.audio.pause();
            this.ui.pauseMenu.render(document.body);
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
        document.body.grab(this.canvas);
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
    changeScale: function(scale) {
        this.scale = scale;
        this._width(this.width);
        this._height(this.height);
        this.am.reload();
    },
    updateFPS: function(delta) {
        if(this.showFPS) {
            if(!this.UI.fps.rendered) this.UI.fps.render(document.body);
            this.renderedFrames++;
            this.timeSpent += delta;
            if(this.timeSpent >= 1) {
                    this.avgFPS = this.renderedFrames;
                    this.timeSpent = 0
                    this.renderedFrames = 0;
            }
            this.UI.fps.html.set('text',"Frame Rate (Avg): "+this.avgFPS+ " (Cur): "+Math.floor(1/delta));
        }
    },
    update: function(delta) {
        this.doFollow(delta);
        this.updateFPS(delta);
        this.state.update(delta);
        this.state.preProcess();
        this.state.render();
        this.state.postProcess();
    },
    click: function() {}
});

var Jxl = new Jixel();
