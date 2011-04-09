/***
 * Consider this a singleton, just doing it this way so you could possibly override
 * Jixel and then instantiate Jxl.
 ***/
var Jixel = new Class({
    init: function(callback, width, height) {
        var self = this;
        width = (width === undefined) ? 240 : width;
        height = (height === undefined) ? 160 : height;
        
        window.addEvent('domready', function() {
            self.state = new Jxl.State();
            self.canvas = new Element('canvas');
            self.buffer = self.canvas.getContext('2d');
            self.scale = 1;
            self.mouse = new Jxl.Mouse();
            self.showBB = false;
            self.autoPause = true;
            self._width(width);
            self._height(height);
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
            this.UI.fps.render(document.body);
        }
    },
    hideFPS: function() {
        if(this._showFPS) {
            this._showFPS = false;
            this.UI.fps.destroy();
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
            this.UI.fps.html.set('text',"(Cur): "+Math.floor(1/delta));
        }
    },
    update: function(delta) {
        this.doFollow(delta);
        this.updateFPS(delta);
        this.state.update(delta);
        this.state.preProcess();
        this.state.render();
        this.mouse.render();
        this.state.postProcess();
    },
    click: function() {}
});

var Jxl = new Jixel();

/***
 * Represents a single point in space
 ***/
Jxl.Point = new Class({
    Implements: [Options],
    initialize: function(options) {
        this.setOptions(options);
        Object.merge(this, this.options);
    },
    options: {
        x: 0,
        y: 0
    }
});
/***
 * Represents a Rectangle
 ***/
Jxl.Rect = new Class({
    Extends: Jxl.Point,
    initialize: function(params) {
        this.parent(params);
    },
    options: {
        width: 0,
        height: 0
    },
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
Jxl.Object = new Class({
    Extends: Jxl.Rect,
    initialize: function(options) {
        this.parent(options);
    },
    options: {
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
            color: new Color('#f00')
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
        _group: false  
    },
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
    updateMotion: function(delta) {
        if(!this.moves) return;
        if(this.solid) this.refreshHulls();
        this.onFloor = false;
        var vc = (Jxl.u.computeVelocity(delta, this.angularVelocity, this.angularAcceleration, this.angularDrag, this.maxAngular) - this.angularVelocity)/2;
        this.angularVelocity += vc;
        this.angle += this.angularVelocity*delta;
        this.angularVelocity += vc;
        
        var thrustComponents;
        if(this.thrust != 0 ) {
            thrustComponents = Jxl.u.rotatePoint(-this.thrust, 0, 0, 0,this.angle);
            var maxComponents = Jxl.u.rotatePoint(-this.maxThrust, 0, 0, 0, this.angle);
            var max = Math.abs(maxComponents.x);
            if(max > Math.abs(maxComponents.y)) maxComponents.y = max;
            else max = Math.abs(maxComponents.y);
            this.maxVelocity.x = this.maxVelocity.y = Math.abs(max);
        } else {
            thrustComponents = this._pZero;
        }
        
        vc = (Jxl.u.computeVelocity(delta, this.velocity.x, this.acceleration.x+thrustComponents.x,this.drag.x, this.maxVelocity.x) - this.velocity.x)/2;
        this.velocity.x += vc;
        var xd = this.velocity.x * delta;
        this.velocity.x += vc;
        
        vc = (Jxl.u.computeVelocity(delta, this.velocity.y, this.acceleration.y+thrustComponents.y, this.drag.y, this.maxVelocity.y) - this.velocity.y)/2;
        this.velocity.y += vc;
        var yd = this.velocity.y * delta;
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
    updateFlickering: function(delta) {
        if(this.flickering()) {
            if(this._flickerTimer > 0) {
                this._flickerTimer -= delta;
                if(this._flickerTimer == 0) this._flickerTimer = -1;
            }
            if(this._flickerTimer < 0) this.flicker(-1);
            else {
                this._flicker = !this._flicker;
                this.visible = !this._flicker;
            }
        }
    },
    update: function(delta) {
        this.updateMotion(delta);
        this.updateFlickering(delta);
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
    overlapsPoint: function(game, x, y, perPixel) {
        if(perPixel == undefined) perPixel = false;
        
        x += Math.floor(game.scroll.x);
        y += Math.floor(game.scroll.y);
        this._point = this.getScreenXY(game, this._point);
        if((x <= this._point.x) || (x >= this._point.x+this.width) || (y <= this._point.y) || (y >= this._point.y+this.height))
            return false;
        return true;
    },
    collide: function(object) {
        if(object == undefined) object = this;
        return Jxl.u.collide(this, object);
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
        point.x = Math.floor(this.x+Jxl.u.roundingError)+Math.floor(Jxl.scroll.x*this.scrollFactor.x);
        point.y = Math.floor(this.y+Jxl.u.roundingError)+Math.floor(Jxl.scroll.y*this.scrollFactor.y);
        return point;
    }
});

Jxl.Group = new Class({
    Extends: Jxl.Object,
    initialize: function(params) {
        this.parent(Object.merge({}, Jxl.Group.DEFAULTS, params));
    },
    add: function(object, ShareScroll) {
        ShareScroll = (ShareScroll === undefined) ? false : ShareScroll;
        if (this.members.indexOf(object) < 0)
            this.members[this.members.length] = object;
        if(ShareScroll)
            object.scrollFactor = this.scrollFactor;
        return object;
    },
    replace: function(OldObject, NewObject) {
        var index = this.members.indexOf(OldObject);
        if((index < 0) || (index >= this.members.length))
            return null;
        this.members[index] = NewObject;
        return NewObject;
    },
    remove: function(object, Splice) {
        Splice = (Splice === undefined) ? false : Splice;
        var index = this.members.indexOf(object);
        if((index < 0) || (index >= this.members.length))
            return null;
        if(Splice)
            this.members.splice(index,1);
        else
            this.members[index] = null;
        return object;
    },
    sort: function(Index, Order) {
        Index = (Index === undefined) ? "y" : Index;
        Order = (Order === undefined) ? Jxl.Group.ASCENDING : Order;
        this._sortIndex = Index;
        this._sortOrder = Order;
        this.members.sort(this.sortHandler);
    },
    getFirstAvail: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if((o != undefined) && !o.exists)
                return o;
        }
        return null;
    },
    getFirstNull: function() {
        var i = 0;
        var ml = this.members.length;
        while(i < ml)
        {
            if(this.members[i] == undefined)
                return i;
            else
                i++;
        }
        return -1;
    },
    resetFirstAvail: function(X, Y) {
        X = (X === undefined) ? 0 : X;
        Y = (Y === undefined) ? 0 : Y;
        var o = this.getFirstAvail();
        if(o == null)
            return false;
        o.reset(X,Y);
        return true;
    },
    getFirstExtant: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if((o != null) && o.exists)
                return o;
        }
        return null;
    },
    getFirstAlive: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if((o != null) && o.exists && !o.dead)
                return o;
        }
        return null;
    },
    getFirstDead: function() {
        var i= 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if((o != null) && o.dead)
                return o;
        }
        return null;
    },
    countLiving: function() {
        var count = -1;
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if(o != null)
            {
                if(count < 0)
                    count = 0;
                if(o.exists && !o.dead)
                    count++;
            }
        }
        return count;
    },
    countDead: function() {
        var count = -1;
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if(o != null)
            {
                if(count < 0)
                    count = 0;
                if(o.dead)
                    count++;
            }
        }
        return count;
    },
    countOnScreen: function() {
        var count= -1;
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if(o != null)
            {
                if(count < 0)
                    count = 0;
                if(o.onScreen())
                    count++;
            }
        }
        return count;
    },
    getRandom: function() {
        var c = 0;
        var o = null;
        var l = this.members.length;
        var i = Math.floor(Jxl.u.random()*l);
        while((o === null || o === undefined) && (c < this.members.length))
        {
            o = this.members[(++i)%l];
            c++;
        }
        return o;
    },
    saveOldPosition: function() {
        if(this._first)
        {
            this._first = false;
            this._last.x = 0;
            this._last.y = 0;
            return;
        }
        this._last.x = this.x;
        this._last.y = this.y;
    },
    updateMembers: function(delta) {
        var mx;
        var my;
        var moved = false;
        if((this.x != this._last.x) || (this.y != this._last.y))
        {
            moved = true;
            mx = this.x - this._last.x;
            my = this.y - this._last.y;
        }
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if((o != null) && o.exists)
            {
                if(moved)
                {
                    if(o._group)
                        o.reset(o.x+mx,o.y+my);
                    else
                    {
                        o.x += mx;
                        o.y += my;
                    }
                }
                if(o.active)
                    o.update(delta);
                if(moved && o.solid)
                {
                    o.colHullX.width += ((mx>0)?mx:-mx);
                    if(mx < 0)
                        o.colHullX.x += mx;
                    o.colHullY.x = this.x;
                    o.colHullY.height += ((my>0)?my:-my);
                    if(my < 0)
                        o.colHullY.y += my;
                    o.colVector.x += mx;
                    o.colVector.y += my;
                }
            }
        }
    },
    update: function(delta) {
        this.saveOldPosition();
        this.updateMotion(delta);
        this.updateMembers(delta);
        this.updateFlickering(delta);
    },
    renderMembers: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if((o != null) && o.exists && o.visible)
                o.render();
        }
    },
    render: function() {
        this.renderMembers();
    },
    killMembers: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = this.members[i++];
            if(o != null)
                o.kill();
        }
    },
    kill: function() {
        this.killMembers();
            this.parent();
    },
    destroyMembers: function() {
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = members[i++];
            if(o != null)
                o.destroy();
        }
        this.members.length = 0;
    },
    destroy: function() {
        this.destroyMembers();
            this.parent();
    },
    reset: function(X, Y) {
        this.saveOldPosition();
        this.parent(X,Y);
        var mx;
        var my;
        var moved = false;
        if((this.x != this._last.x) || (this.y != this._last.y))
        {
            moved = true;
            mx = this.x - this._last.x;
            my = this.y - this._last.y;
        }
        var i = 0;
        var o;
        var ml = this.members.length;
        while(i < ml)
        {
            o = members[i++];
            if((o != null) && o.exists)
            {
                if(moved)
                {
                    if(o._group)
                        o.reset(o.x+mx,o.y+my);
                    else
                    {
                        o.x += mx;
                        o.y += my;
                        if(this.solid)
                        {
                            o.colHullX.width += ((mx>0)?mx:-mx);
                            if(mx < 0)
                                o.colHullX.x += mx;
                            o.colHullY.x = this.x;
                            o.colHullY.height += ((my>0)?my:-my);
                            if(my < 0)
                                o.colHullY.y += my;
                            o.colVector.x += mx;
                            o.colVector.y += my;
                        }
                    }
                }
            }
        }
    },
    sortHandler: function(Obj1, Obj2) {
        if(Obj1[this._sortIndex] < Obj2[this._sortIndex])
            return this._sortOrder;
        else if(Obj1[this._sortIndex] > Obj2[this._sortIndex])
            return -this._sortOrder;
        return 0;
    }
});
Jxl.Group.ASCENDING = -1;
Jxl.Group.DESCENDING = 1;
Jxl.Group.DEFAULTS = {
    _group: true,
    solid: false,
    members: [],
    _last: new Jxl.Point(),
    _first: true
};Jxl.State = new Class({
    Implements: [Options],
    initialize: function(options) {
        this.setOptions(options);
        Object.merge(this, this.options);
	this.create();
    },
    options: {
	defaultGroup: new Jxl.Group()
    },
    create: function() {
    
    },
    add: function(object) {
        return this.defaultGroup.add(object);
    },
    remove: function(object) {
	    this.defaultGroup.remove(object);
    },
    preProcess: function() {
        Jxl.buffer.clearRect(0,0, Jxl.screenWidth(), Jxl.screenHeight());
    },
    update: function(delta) {
        this.defaultGroup.update(delta);
    },
    collide: function() {
        Jxl.u.collide(this.defaultGroup, this.defaultGroup);
    },
    render: function() {
        this.defaultGroup.render();
    },
    postProcess: function() {
    },
    destroy: function() {
        this.defaultGroup.destroy();
    }
});
Jxl.Sprite = new Class({
    Extends: Jxl.Object,
    initialize: function(options) {
        this.parent(options);
        this.buffer = new Element('canvas', {
            width: this.width,
            height: this.height
        });
        this.bufferCTX = this.buffer.getContext('2d');
        this.bufferCTX.drawImage(this.graphic, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
        this.resetHelpers();
        document.body.grab(this.buffer);
    },
    options: {
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
	graphic: new Element('canvas')
    },
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
        /*
        if(this.angle !=0) {
            mod = 1.5;
            var key = this.angle+':'+this._curFrame;
            if(this.graphic.rotations == undefined) this.graphic.rotations = {};
            if(this.graphic.rotations[key] == undefined) {
                rCan = new Element('canvas');
                rCan.width = this.graphic.width*1.5;
                rCan.height = this.graphic.height*1.5;
                var rCTX = rCan.getContext('2d');
                rCTX.translate(rCan.width/2,rCan.height/2);
                rCTX.rotate(this.angle*Math.PI/180);
                rCTX.drawImage(this.graphic.scaled, -this.graphic.scaled.width/2,-this.graphic.scaled.height/2,this.graphic.scaled.width,this.graphic.scaled.height);
                this.graphic.rotations[key] = rCan;
            } else {
                rCan = this.graphic.rotations[key];
            }
        }
        */
        Jxl.buffer.drawImage(rCan, 0,0, this.width, this.height, this._point.x, this._point.y, this.width, this.height);    
    },
    onEmit: function() {},
    updateAnimation: function(delta) {
        if((this._curAnim != null) && (this._curAnim.delay > 0) && (this._curAnim.looped || !this.finished )) {
            this._frameTimer += delta;
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
    update: function(game, time) {
        this.updateMotion(game, time);
        this.updateAnimation(game, time);
        this.updateFlickering(game, time);
    },
    getScreenXY: function(point) {
        if(point == undefined) point = new Jxl.Point();
        point.x = Math.floor(this.x+Jxl.u.roundingError)+Math.floor(Jxl.scroll.x*this.scrollFactor.x) - this.offset.x;
        point.y = Math.floor(this.y+Jxl.u.roundingError)+Math.floor(Jxl.scroll.y*this.scrollFactor.y) - this.offset.y;
        return point;
    },
    overlapsPoint: function(game, x, y, perPixel) {
        if(perPixel == undefined) perPixel = false;
        
        x -= Math.floor(game.scroll.x);
        y -= Math.floor(game.scroll.y);
        this._point = this.getScreenXY(game, this._point);
    
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
        ctx.fillStyle = Jxl.u.makeRGBA(Color);
        ctx.fillRect(0, 0, Width, Height);
        this.resetHelpers();
        return this;
    }
});
Jxl.Sprite.LEFT = 0;
Jxl.Sprite.RIGHT = 1;
Jxl.Sprite.UP = 2;
Jxl.Sprite.DOWN = 3;


Jxl.Anim = new Class({
    initialize: function(name, frames, frameRate, looped){
        this.name = name;
        this.delay = 0;
        if(frameRate > 0)
            this.delay = frameRate;
        this.frames = frames;
        this.looped = looped;
    }
});Jxl.TileMap = new Class({
    Extends: Jxl.Object,
    initialize: function(options) {
        this.parent(options);
    },
    options: {
        auto: Jxl.TileMapOFF,
        collideIndex: 1,
        startingIndex: 0,
        drawIndex: 1,
        widthInTiles: 0,
        heightInTiles: 0,
        totalTiles: 0,
        _buffer: null,
        _bufferLoc: new Jxl.Point(),
        _flashRect2: new Jxl.Rect(),
        _flashRect: new Jxl.Rect(),
        _data: null,
        _tileWidth: 0,
        _tileHeight: 0,
        _rects: null,
        _pixels: null,
        _block: new Jxl.Object({width:0, height:0, fixed: true}),
        _callbacks: new Array(),
        fixed: true   
    },
    loadMap : function(MapData, TileGraphic, TileWidth, TileHeight) {
        var c, cols, rows = MapData.split("\n");
        this.heightInTiles = rows.length;
        this._data = [];
        for(var r = 0;r < this.heightInTiles;r++) {
            cols = rows[r].split(",");
            if(cols.length <=1) {
                this.heightInTiles--;
                continue;
            }
            if(this.widthInTiles == 0)
                this.widthInTiles = cols.length
            for(c = 0;c < this.widthInTiles; c++)
                this._data.push(cols[c]);
        }
        
        //Pre-Process the map data if its auto-tiled
        var i;
        this.totalTiles = this.widthInTiles * this.heightInTiles;
        if(this.auto > Jxl.TileMapOFF)
        {
            this.collideIndex = this.startingIndex = this.drawIndex = 1;
            i = 0;
            while(i < this.totalTiles)
                this.autoTile(i++);
        }
    
        this._pixels = TileGraphic;
        
        if(TileWidth == undefined) 
            this._tileWidth = this._pixels.height;
        else 
            this._tileWidth = TileWidth;
        if(TileHeight == undefined)
            this._tileHeight = this._tileWidth;
        else
            this._tileHeight = TileHeight;
        
        this._block.width = this._tileWidth;
        this._block.height = this._tileHeight;
        
        this.width = this.widthInTiles*this._tileWidth;
        this.height = this.heightInTiles*this._tileHeight;
        
        this._rects = new Array(this.totalTiles);
        for(i=0; i < this.totalTiles; i++)
            this.updateTile(i);
            
        this._screenRows = Math.ceil(Jxl.height/this._tileHeight)+1;
        if(this._screenRows > this.heightInTiles)
            this._screenRows = this.heightInTiles;
        this._screenCols = Math.ceil(Jxl.width/this._tileWidth)+1;
        if(this._screenCols > this.widthInTiles)
            this._screenCols = this.widthInTiles;
        
        return this;
    },
    render: function() {
        this._point = this.getScreenXY(Jxl,this._point);
        var _flashPoint = new Jxl.Point({x: this._point.x, y: this._point.y});
        
        var tx = Math.floor(-this._point.x/this._tileWidth);
        var ty = Math.floor(-this._point.y/this._tileHeight);
        if(tx < 0) tx = 0;
        if(tx > this.widthInTiles-this._screenCols) tx = this.widthInTiles-this._screenCols;
        if(ty < 0) ty = 0;
        if(ty > this.heightInTiles-this._screenRows) ty = this.heightInTiles-this._screenRows;
        var ri = ty*this.widthInTiles+tx;
        _flashPoint.x += tx*this._tileWidth;
        _flashPoint.y += ty*this._tileHeight;
        var opx = _flashPoint.x;
        var c;
        var cri;
        for(var r = 0;r < this._screenRows; r++) {
            cri = ri;
            for(c = 0; c < this._screenCols; c++) {
                var _flashRect = this._rects[cri++];
                if(_flashRect != null) 
                    Jxl.buffer.drawImage(this._pixels, _flashRect[0], _flashRect[1],
                            _flashRect[2], _flashRect[3], _flashPoint.x,
                            _flashPoint.y,  this._tileWidth, this._tileHeight);
                _flashPoint.x += this._tileWidth;
            }
            ri += this.widthInTiles;
            _flashPoint.x = opx;
            _flashPoint.y += this._tileHeight;
        }
    },
    updateTile: function(index){
        if(this._data[index] < this.drawIndex) {
            this._rects[index] = null;
            return;
        }
        var rx = (this._data[index]-this.startingIndex)*this._tileWidth;
        var ry = 0;
        if(rx >= this._pixels.width) {
            ry = Math.floor(Math.abs(rx/this._pixels.width))*this._tileHeight;
            rx = rx % this._pixels.width;
        }
        this._rects[index] = [rx,ry,this._tileWidth,this._tileHeight];
    },
    autoTile: function(Index) {
        if(this._data[Index] == 0) return;
        
        this._data[Index] = 0;
        if((Index-this.widthInTiles < 0) || (this._data[Index-this.widthInTiles] > 0))					//UP
            this._data[Index] += 1;
        if((Index % this.widthInTiles >= this.widthInTiles-1) || (this._data[Index+1] > 0))				//RIGHT
            this._data[Index] += 2;
        if((Index + this.widthInTiles >= this.totalTiles) || (this._data[Index+this.widthInTiles] > 0)) //DOWN
            this._data[Index] += 4;
        if((Index % this.widthInTiles <= 0) || (this._data[Index-1] > 0))									//LEFT
            this._data[Index] += 8;
            
        if((this.auto == Jxl.TileMapALT) && (this._data[Index] == 15))	//The alternate algo checks for interior corners
        {
            if((Index % this.widthInTiles > 0) && (Index+this.widthInTiles < this.totalTiles) && (this._data[Index+this.widthInTiles-1] <= 0))
                this._data[Index] = 1;		//BOTTOM LEFT OPEN
            if((Index % this.widthInTiles > 0) && (Index-this.widthInTiles >= 0) && (this._data[Index-this.widthInTiles-1] <= 0))
                this._data[Index] = 2;		//TOP LEFT OPEN
            if((Index % this.widthInTiles < this.widthInTiles-1) && (Index-this.widthInTiles >= 0) && (this._data[Index-this.widthInTiles+1] <= 0))
                this._data[Index] = 4;		//TOP RIGHT OPEN
            if((Index % this.widthInTiles < this.widthInTiles-1) && (Index+this.widthInTiles < this.totalTiles) && (this._data[Index+this.widthInTiles+1] <= 0))
                this._data[Index] = 8; 		//BOTTOM RIGHT OPEN
        }
        this._data[Index] += 1;
    },
    overlaps: function(Core) {
        var d;
        
        var dd;
        var blocks = new Array();
        
        //First make a list of all the blocks we'll use for collision
        var ix = Math.floor((Core.x - this.x) / this._tileWidth);
        var iy = Math.floor((Core.y - this.y) / this._tileHeight);
        var iw = Math.ceil(Core.width / this._tileWidth) + 1;
        var ih = Math.ceil(Core.height / this._tileHeight) + 1;
        var r = 0;
        var c;
        while(r < ih)
        {
            if(r >= this.heightInTiles) break;
            d = (iy+r)*this.widthInTiles+ix;
            c = 0;
            while(c < iw)
            {
                if(c >= this.widthInTiles) break;
                dd = Math.floor(this._data[d+c]);
                if(dd >= this.collideIndex) {
                    blocks.push({
                        x : this.x + (ix+c) * this._tileWidth,
                        y : this.y + (iy+r) * this._tileHeight,
                        data : dd
                    });  
                }
                c++;
            }
            r++;
        }
        
        //Then check for overlaps
        var bl = blocks.length;
        var hx = false;
        var i = 0;
        while(i < bl)
        {
            this._block.x = blocks[i].x;
            this._block.y = blocks[i++].y;
            if(this._block.overlaps(Core))
                return true;
        }
        return false;
    },
    renderTileBB: function(X, Y) {
        if((X >= this.widthInTiles) || (Y >= this.heightInTiles))
            return;
        Jxl.buffer.strokeStyle = this.border.color;
        Jxl.buffer.lineWidth = this.border.thickness;
        Jxl.buffer.strokeRect(this._point.x-this.border.thickness+X*this.tileWidth, this._point.y-this.border.thickness+Y*this.tileHeight, this.tileWidth+this.border.thickness, this.tileHeight+this.border.thickness);
    },
    setTile: function(X, Y, Tile, UpdateGraphics) {
        UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;
        if((X >= this.widthInTiles) || (Y >= this.heightInTiles))
            return false;
        return this.setTileByIndex(Y * this.widthInTiles + X,Tile,UpdateGraphics);
    },
    setTileByIndex: function(Index, Tile, UpdateGraphics) {
        UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;
        if(Index >= this._data.length)
            return false;
        
        var ok = true;
        this._data[Index] = Tile;
        
        if(!UpdateGraphics)
            return ok;
        
        this.refresh = true;
        
        if(this.auto == Jxl.TilemapOFF)
        {
            this.updateTile(Index);
            return ok;
        }
        
        //If this map is autotiled and it changes, locally update the arrangement
        var i;
        var r = Math.floor(Index/this.widthInTiles) - 1;
        var rl = r + 3;
        var c = Index % this.widthInTiles - 1;
        var cl = c + 3;
        while(r < rl)
        {
            c = cl - 3;
            while(c < cl)
            {
                if((r >= 0) && (r < this.heightInTiles) && (c >= 0) && (c < this.widthInTiles))
                {
                    i = r * this.widthInTiles + c;
                    this.autoTile(i);
                    this.updateTile(i);
                }
                c++;
            }
            r++;
        }
        
        return ok;
    },
    overlapsPoint: function(X, Y, PerPixel) {
        var t = getTile(
                Math.floor( (X-this.x) / this._tileWidth ),
                Math.floor( (Y-this.y) / this._tileHeight)
        );
        return  t >= this.collideIndex;
    },
    refreshHulls: function() {
        this.colHullX.x = 0;
        this.colHullX.y = 0;
        this.colHullX.width = this._tileWidth;
        this.colHullX.height = this._tileHeight;
        this.colHullY.x = 0;
        this.colHullY.y = 0;
        this.colHullY.width = this._tileWidth;
        this.colHullY.height = this._tileHeight;
    },
    preCollide: function(Obj) {
        var r;
        var c;
        var rs;
        var col = 0;
        var ix = Math.floor((Obj.x - this.x)/this._tileWidth);
        var iy = Math.floor((Obj.y - this.y)/this._tileHeight);
    
        var iw = ix + Math.ceil(Obj.width/this._tileWidth+1);
        var ih = iy + Math.ceil(Obj.height/this._tileHeight+1);
        if(ix < 0)
            ix = 0;
        if(iy < 0)
            iy = 0;
        if(iw > this.widthInTiles)
            iw = this.widthInTiles;
        if(ih > this.heightInTiles)
            ih = this.heightInTiles;
        rs = iy * this.widthInTiles;
        r = iy;
        for(r = iy;r < ih;r++)
        {
            for(c = ix; c < iw;c++)
            {
                if(Math.floor(Math.abs(this._data[rs+c])) >= this.collideIndex)
                    this.colOffsets[col++] = new Jxl.Point({x: this.x + c * this._tileWidth, y: this.y + r * this._tileHeight});
            }
            rs += this.widthInTiles;
        }
        if(this.colOffsets.length != col)
            this.colOffsets.length = col;
    },
    ray: function(StartX, StartY, EndX, EndY, Result, Resolution) {
        Resolution = (Resolution === undefined) ? 1 : Resolution;
        var step = this._tileWidth;
        if(this._tileHeight < this._tileWidth) { step = this._tileHeight; }
        step /= Resolution;
        var dx = EndX - StartX;
        var dy = EndY - StartY;
        var distance = Math.sqrt(dx*dx + dy*dy);
        var steps = Math.ceil(distance/step);
        var stepX = dx/steps;
        var stepY = dy/steps;
        var curX = StartX - stepX;
        var curY = StartY - stepY;
        var tx;
        var ty;
        var i = 0;
        while(i < steps)
        {
            curX += stepX;
            curY += stepY;
            
            if((curX < 0) || (curX > width) || (curY < 0) || (curY > height))
            {
                i++;
                continue;
            }
            
            tx = curX/this._tileWidth;
            ty = curY/this._tileHeight;
            if((Math.floor(this._data[ty*this.widthInTiles+tx])) >= this.collideIndex)
            {
                //Some basic helper stuff
                tx *= this._tileWidth;
                ty *= this._tileHeight;
                var rx = 0;
                var ry = 0;
                var q;
                var lx = curX-stepX;
                var ly = curY-stepY;
                
                //Figure out if it crosses the X boundary
                q = tx;
                if(dx < 0)
                    q += this._tileWidth;
                rx = q;
                ry = ly + stepY*((q-lx)/stepX);
                if((ry > ty) && (ry < ty + this._tileHeight))
                {
                    if(Result === undefined)
                        Result = new Jxl.Point();
                    Result.x = rx;
                    Result.y = ry;
                    return true;
                }
                
                //Else, figure out if it crosses the Y boundary
                q = ty;
                if(dy < 0)
                    q += this._tileHeight;
                rx = lx + stepX*((q-ly)/stepY);
                ry = q;
                if((rx > tx) && (rx < tx + this._tileWidth))
                {
                    if(Result === undefined)
                        Result = new Jxl.Point();
                    Result.x = rx;
                    Result.y = ry;
                    return true;
                }
                return false;
            }
            i++;
        }
        return false;
    }
});
Jxl.TileMapOFF =  0;
Jxl.TileMapAUTO =  1;
Jxl.TileMapALT = 2;
Jxl.TileMap.arrayToCSV = function(Data, Width) {
    var r = 0;
    var c;
    var csv = "";
    var Height = Data.length / Width;
    while(r < Height) {
            c = 0;
            while(c < Width) {
                    if(c == 0) {
                            if(r == 0)
                                    csv += Data[0];
                            else
                                    csv += "\n"+Data[r*Width];
                    }
                    else
                            csv += ", "+Data[r*Width+c];
                    c++;
            }
            r++;
    }
    return csv;
}


       var AudioManager = new Class({
    initialize: function() {
        this.sounds = {};
        this.channels = [];
        for(var i=0;i<16;i++) {
            this.channels[i] = document.createElement('audio');
            this.channels[i].dead = true;
        }
    },
    play: function(name, loop, start, finish, volume) {
        if(name in this.sounds) {
            for(var i = 0;i < this.channels.length; i++) {
                if(this.channels[i].dead) {
                    this.channels[i].dead = false;
                    this.channels[i].src = this.sounds[name].src;
                    this.channels[i].start = 0;
                    this.channels[i].finish = this.sounds[name].duration;
                    if(volume) {
                        this.channels[i].volume = volume;
                    } else {
                        this.channels[i].volume = 1;
                    }
                    if(loop) {
                        this.channels[i].loop = true;
                    } else {
                        this.channels[i].loop = false;
                    }
                    if(start) {
                        this.channels[i].currentTime = start;
                        this.channels[i].start = start;
                    }
                    if(finish) this.channels[i].finish = finish;
                    this.channels[i].play();
                    return;
                }
            }
        }
    },
    unpause: function () {
        for(var i = 0; i < this.channels.length; i++) {
            if(!this.channels[i].dead) this.channels[i].play();
        }
    },
    pause: function() {
        for(var i = 0; i < this.channels.length; i++) {
           if(!this.channels[i].dead) this.channels[i].pause();
        }
    },
    update: function(delta) {
        var i = this.channels.length-1;
        while(i >= 0 ) {
            if(!this.channels[i].paused && this.channels[i].currentTime >= this.channels[i].finish) {
                if(this.channels[i].loop) {
                    this.channels[i].currentTime = this.channels[i].start;
                } else {
                    this.channels[i].dead = true;
                    this.channels[i].pause();
                }
            }
            i--;
        }
    },
    add: function(name, audio) {
        this.sounds[name] = audio;
    }
});

Jxl.audio = new AudioManager();var AssetManager = new Class({
    initialize: function() {
        this.assets = {};
	this.batches = [];
    },
    get: function(name) {
        return this.assets[name];
    },
    reload: function(callback) {
	var self = this;
	var ln = this.batches.length, ct = 0;
	Array.each(this.batches, function(batch) {
	    self.load(batch, function() {
		ct++;
		if(callback != undefined && ln == ct) callback();
	    });
	});
    },
    load: function(assets, callback, progress) {
	this.batches.push(assets);
	var self = this;
	var ln = Object.getLength(assets), ct = 0;
	Object.each(assets, function(val, key) {
	    self.loadAsset(val[0], key, val[1], function(asset) {
		self.assets[key] = asset;
		ct++;
		if(callback != undefined && ct >= ln) callback();
	    });
	});
    },
    loadAsset: function(type, name, src, callback) {
      var self = this;
      if(name in this.assets) {
        if(callback) callback();
        return;
      }
      switch(type) {
        case 'audio':
        case 'sound': //fiiiiix meeeeee
            var temp = new Audio(src);
            temp.src = src;
            temp.load();
            this.assets[name] = temp;
            self.game.audio.add(name, temp);
            if(callback) callback(temp);
        
            break;
        case 'image':
            var temp = document.createElement('img');
            temp.src = src;
            this.assets[name] = temp;
            temp.addEvent('load', function() {
                var can = document.createElement('canvas');
                can.width = this.width;
                can.height = this.height;
                var ctx = can.getContext('2d');
                ctx.drawImage(this, 0, 0);
                
                /*
                var id = ctx.getImageData(0, 0, this.width, this.height);
                var nd = ctx.createImageData(this.width*Jxl.scale, this.height*Jxl.scale);
                
                for(var x=0; x < this.width*Jxl.scale; x++) {
                    for(var y=0; y < this.height*Jxl.scale; y++){
                        var i = (Math.floor((y/Jxl.scale))*this.width+Math.floor(x/Jxl.scale))*4;
                        var ni = (y*this.width*Jxl.scale+x)*4;
                        nd.data[ni] = id.data[i];
                        nd.data[ni+1] = id.data[i+1];
                        nd.data[ni+2] = id.data[i+2];
                        nd.data[ni+3] = id.data[i+3];
                    }
                }
                can.width = this.width*Jxl.scale;
                can.height = this.height*Jxl.scale;
                ctx.clearRect(0,0,can.width,can.height);
                ctx.putImageData(nd, 0, 0);
                this.scaled = can;
                this.scaledCTX = ctx;
                this.rotations = {};*/
                
                if(callback) callback(can);
            });
        break;
      }
    }
});

Jxl.loader = new AssetManager();/*** Utility ***/
Jxl.List = new Class({
    initialize: function() {
        this.object = null;
        this.next = null;
    }
});

Jxl.QuadTree = new Class({
    Extends: Jxl.Rect,
    initialize: function(x, y, width, height, parent) {
        this.parent(x, y, width, height);
        
        this._headA = this._tailA = new Jxl.List();
        this._headB = this._tailB = new Jxl.List();
        
        if(parent != undefined) {
            var itr;
            var ot;
            if(parent._headA.object != null) {
                itr = parent._headA;
                while(itr != null) {
                    if(this._tailA.object != null) {
                        ot = this._tailA;
                        this._tailA = new Jxl.List();
                        ot.next = this._tailA;
                    }
                    this.tailA.object = itr.object;
                    itr = itr.next;
                }
            }
            if(parent._headB.object != null) {
                itr = parent._headB;
                while(itr != null) {
                    if(this._tailB.object != null) {
                        ot = this._tailB;
                        this._tailB = new Jxl.List();
                        ot.next = this._tailB;
                    }
                    this._tailB.object = itr.object;
                    itr = itr.next;
                }
            }
        } else {
            this._min = (this.width + this.height)/(2*Jxl.u.quadTreeDivisions);
        }
        this._canSubdivide = (this.width > this._min) || (this.height > Jxl.QuadTree._min);
        this._nw = null;
        this._ne = null;
        this._se = null;
        this._sw = null;
        this._l = this.x;
        this._r = this.x + this.width;
        this._hw = this.width/2;
        this._mx = this._l + this._hw;
        this._t = this.y;
        this._b = this.y + this.height;
        this._hh = this.height/2;
        this._my  = this._t+this._hh;
    },
    add: function(obj, list) {
       Jxl.QuadTree._oa = list;
        
        if(obj._group) {
            var m;
            var members = obj.members;
            var l = members.length;
            
            for(var i = 0;i < l; i++ ) {
                m = members[i];
                if((m != null) && m.exists) {
                    if(m._group) this.add(m, list);
                    else if(m.solid) {
                       Jxl.QuadTree._o = m;
                       Jxl.QuadTree._ol =Jxl.QuadTree._o.x;
                       Jxl.QuadTree._ot =Jxl.QuadTree._o.y;
                       Jxl.QuadTree._or =Jxl.QuadTree._o.x +Jxl.QuadTree._o.width;
                       Jxl.QuadTree._ob =Jxl.QuadTree._o.y +Jxl.QuadTree._o.height;
                        this.addObject();
                    }
                }
            }
        }
        if(obj.solid) {
           Jxl.QuadTree._o = obj;
           Jxl.QuadTree._ol =Jxl.QuadTree._o.x;
           Jxl.QuadTree._ot =Jxl.QuadTree._o.y;
           Jxl.QuadTree._or =Jxl.QuadTree._o.x +Jxl.QuadTree._o.width;
           Jxl.QuadTree._ob =Jxl.QuadTree._o.y +Jxl.QuadTree._o.height;
            this.addObject();
        }
    },
    addObject: function() {
       //If this quad (not its children) lies entirely inside this object, add it here
        if(!this._canSubdivide || ((this._l >=Jxl.QuadTree._ol) && (this._r <=Jxl.QuadTree._or) && (this._t >=Jxl.QuadTree._ot) && (this._b <=Jxl.QuadTree._ob)))
        {
            this.addToList();
            return;
        }
    
        //See if the selected object fits completely inside any of the quadrants
        if((Jxl.QuadTree._ol > this._l) && (Jxl.QuadTree._or < this._mx))
        {
            if((Jxl.QuadTree._ot > this._t) && (Jxl.QuadTree._ob < this._my))
            {
                if(this._nw == null)
                    this._nw = new Jxl.QuadTree(this._l,this._t,this._hw,this._hh,this);
                this._nw.addObject();
                return;
            }
            if((Jxl.QuadTree._ot > this._my) && (Jxl.QuadTree._ob < this._b))
            {
                if(this._sw == null)
                    this._sw = new Jxl.QuadTree(this._l,this._my,this._hw,this._hh,this);
                this._sw.addObject();
                return;
            }
        }
        if((Jxl.QuadTree._ol > this._mx) && (Jxl.QuadTree._or < this._r))
        {
            if((Jxl.QuadTree._ot > this._t) && (Jxl.QuadTree._ob < this._my))
            {
                if(this._ne == null)
                    this._ne = new Jxl.QuadTree(this._mx,this._t,this._hw,this._hh,this);
                this._ne.addObject();
                return;
            }
            if((Jxl.QuadTree._ot > this._my) && (Jxl.QuadTree._ob < this._b))
            {
                if(this._se == null)
                    this._se = new Jxl.QuadTree(this._mx,this._my,this._hw,this._hh,this);
                this._se.addObject();
                return;
            }
        }
    
        //If it wasn't completely contained we have to check out the partial overlaps
        if((Jxl.QuadTree._or > this._l) && (Jxl.QuadTree._ol < this._mx) && (Jxl.QuadTree._ob > this._t) && (Jxl.QuadTree._ot < this._my))
        {
            if(this._nw == null)
                this._nw = new Jxl.QuadTree(this._l,this._t,this._hw,this._hh,this);
            this._nw.addObject();
        }
        if((Jxl.QuadTree._or > this._mx) && (Jxl.QuadTree._ol < this._r) && (Jxl.QuadTree._ob > this._t) && (Jxl.QuadTree._ot < this._my))
        {
            if(this._ne == null)
                this._ne = new Jxl.QuadTree(this._mx,this._t,this._hw,this._hh,this);
            this._ne.addObject();
        }
        if((Jxl.QuadTree._or > this._mx) && (Jxl.QuadTree._ol < this._r) && (Jxl.QuadTree._ob > this._my) && (Jxl.QuadTree._ot < this._b))
        {
            if(this._se == null)
                this._se = new Jxl.QuadTree(this._mx,this._my,this._hw,this._hh,this);
            this._se.addObject();
        }
        if((Jxl.QuadTree._or > this._l) && (Jxl.QuadTree._ol < this._mx) && (Jxl.QuadTree._ob > this._my) && (Jxl.QuadTree._ot < this._b))
        {
            if(this._sw == null)
                this._sw = new Jxl.QuadTree(this._l,this._my,this._hw,this._hh,this);
            this._sw.addObject();
        }
    },
    addToList: function() {
        var ot;
        if(Jxl.QuadTree._oa == Jxl.QuadTree.A_LIST)
        {
            if(this._tailA.object != null)
            {
                ot = this._tailA;
                this._tailA = new Jxl.List();
                ot.next = this._tailA;
            }
            this._tailA.object =Jxl.QuadTree._o;
        }
        else
        {
            if(this._tailB.object != null)
            {
                ot = this._tailB;
                this._tailB = new Jxl.List();
                ot.next = this._tailB;
            }
            this._tailB.object =Jxl.QuadTree._o;
        }
        if(!this._canSubdivide)
            return;
        if(this._nw != null)
            this._nw.addToList();
        if(this._ne != null)
            this._ne.addToList();
        if(this._se != null)
            this._se.addToList();
        if(this._sw != null)
            this._sw.addToList();
    },
    overlap: function(BothLists, Callback) {
        BothLists = (BothLists === undefined) ? true : BothLists;
        Callback = (Callback === undefined) ? null : Callback;
    
       Jxl.QuadTree._oc = Callback;
        var c = false;
        var itr;
        if(BothLists)
        {
            //An A-B list comparison
           Jxl.QuadTree._oa = Jxl.QuadTree.B_LIST;
            if(this._headA.object != null)
            {
                itr = this._headA;
                while(itr != null)
                {
                    Jxl.QuadTree._o = itr.object;
                    if(Jxl.QuadTree._o.exists &&Jxl.QuadTree._o.solid && this.overlapNode())
                        c = true;
                    itr = itr.next;
                }
            }
           Jxl.QuadTree._oa = Jxl.QuadTree.A_LIST;
            if(this._headB.object != null)
            {
                itr = this._headB;
                while(itr != null)
                {
                    Jxl.QuadTree._o = itr.object;
                    if(Jxl.QuadTree._o.exists &&Jxl.QuadTree._o.solid)
                    {
                        if((this._nw != null) && this._nw.overlapNode())
                            c = true;
                        if((this._ne != null) && this._ne.overlapNode())
                            c = true;
                        if((this._se != null) && this._se.overlapNode())
                            c = true;
                        if((this._sw != null) && this._sw.overlapNode())
                            c = true;
                    }
                    itr = itr.next;
                }
            }
        }
        else
        {
            //Just checking the A list against itself
            if(this._headA.object != null)
            {
                itr = this._headA;
                while(itr != null)
                {
                    Jxl.QuadTree._o = itr.object;
                    if(Jxl.QuadTree._o.exists &&Jxl.QuadTree._o.solid && this.overlapNode(itr.next))
                        c = true;
                    itr = itr.next;
                }
            }
        }
    
        //Advance through the tree by calling overlap on each child
        if((this._nw != null) && this._nw.overlap(BothLists,Jxl.QuadTree._oc))
            c = true;
        if((this._ne != null) && this._ne.overlap(BothLists,Jxl.QuadTree._oc))
            c = true;
        if((this._se != null) && this._se.overlap(BothLists,Jxl.QuadTree._oc))
            c = true;
        if((this._sw != null) && this._sw.overlap(BothLists,Jxl.QuadTree._oc))
            c = true;
    
        return c;
    },
    overlapNode: function(Iterator) {
        Iterator = (Iterator === undefined) ? null : Iterator;
    
        //member list setup
        var c = false;
        var co;
        var itr = Iterator;
        if(itr == null)
        {
            if(this._oa == Jxl.QuadTree.A_LIST)
                itr = this._headA;
            else
                itr = this._headB;
        }
    
        //Make sure this is a valid list to walk first!
        if(itr.object != null)
        {
            //Walk the list and check for overlaps
            while(itr != null)
            {
                co = itr.object;
                if( (Jxl.QuadTree._o === co) || !co.exists || !Jxl.QuadTree._o.exists || !co.solid || !Jxl.QuadTree._o.solid ||
                    (Jxl.QuadTree._o.x +Jxl.QuadTree._o.width  < co.x + Jxl.u.roundingError) ||
                    (Jxl.QuadTree._o.x + Jxl.u.roundingError > co.x + co.width) ||
                    (Jxl.QuadTree._o.y +Jxl.QuadTree._o.height < co.y + Jxl.u.roundingError) ||
                    (Jxl.QuadTree._o.y + Jxl.u.roundingError > co.y + co.height) )
                {
                    itr = itr.next;
                    continue;
                }
                if(Jxl.QuadTree._oc == null)
                {
                   Jxl.QuadTree._o.kill();
                    co.kill();
                    c = true;
                }
                else if(Jxl.QuadTree._oc(Jxl.QuadTree._o,co))
                    c = true;
                itr = itr.next;
            }
        }
        return c;
    }
});
Jxl.QuadTree.A_LIST = 0;
Jxl.QuadTree.B_LIST = 1;
Jxl.QuadTree.divisions = 3;
Jxl.QuadTree.quadTree = null;
Jxl.QuadTree.bounds = null;

Jxl.Util = new Class({
    initialize: function() {
        this.roundingError = 0.0000001;
        this.quadTreeDivisions = 3;
    },
    random: function(Seed) {
        if(( Seed == undefined) || Seed === undefined)
                            return Math.random();
        else
        {
            //Make sure the seed value is OK
            if(Seed == 0)
                Seed = Number.MIN_VALUE; // don't think this works
            if(Seed >= 1)
            {
                if((Seed % 1) == 0)
                    Seed /= Math.PI;
                Seed %= 1;
            }
            else if(Seed < 0)
                Seed = (Seed % 1) + 1;
    
            //Then do an LCG thing and return a predictable random number
            return ((69621 * Math.floor(Seed * 0x7FFFFFFF)) % 0x7FFFFFFF) / 0x7FFFFFFF;
        }
    },
    overlap: function(obj1, obj2, callback) {
        if( (obj1 == null) || !obj1.exists ||
                                    (obj2 == null) || !obj2.exists )
                                    return false;
        quadTree = new Jxl.QuadTree(Jxl.QuadTree.bounds.x,Jxl.QuadTree.bounds.y,Jxl.QuadTree.bounds.width,Jxl.QuadTree.bounds.height);
        quadTree.add(obj1,Jxl.QuadTree.A_LIST);
        if(obj1 === obj2)
            return quadTree.overlap(false,callback);
        quadTree.add(obj2,Jxl.QuadTree.B_LIST);
        return quadTree.overlap(true,callback);
    },
    makeRGBA: function(Color) {
		var f = Color.toString(16);
		var a = parseInt(f.substr(0, 2), 16) / 255;
		var r = parseInt(f.substr(2, 2), 16);
		var g = parseInt(f.substr(4, 2), 16);
		var b = parseInt(f.substr(6, 2), 16);

		return ("rgba(" + r + "," + g + "," + b + "," + a + ")");
	},
    collide: function(obj1, obj2) {
        if( (obj1 == null) || !obj1.exists ||
            (obj2 == null) || !obj2.exists )
            return false;
        
        quadTree = new Jxl.QuadTree(Jxl.QuadTree.bounds.x,Jxl.QuadTree.bounds.y,Jxl.QuadTree.bounds.width,Jxl.QuadTree.bounds.height);
        quadTree.add(obj1,Jxl.QuadTree.A_LIST);
        var match = obj1 === obj2;
        if(!match) quadTree.add(obj2,Jxl.QuadTree.B_LIST);
        var cx = quadTree.overlap(!match,Jxl.u.solveXCollision);
        var cy = quadTree.overlap(!match,Jxl.u.solveYCollision);
        return cx || cy;
    },
    rotatePoint: function(x, y, pivotX, pivotY, angle, p) {
        if(p == undefined) p = new JxlPoint();
        var radians = -angle / 180 * Math.PI;
        var dx = x-pivotX;
        var dy = pivotY-y;
        p.x = pivotX + Math.cos(radians)*dx - Math.sin(radians)*dy;
        p.y = pivotY - (Math.sin(radians)*dx + Math.cos(radians)*dy);
        return p;
    },
    solveXCollision: function(obj1, obj2) {
        //Avoid messed up collisions ahead of time
        var o1 = obj1.colVector.x;
        var o2 = obj2.colVector.x;
        if(o1 == o2) return false;
        
        //Give the objs a heads up that we're about to resolve some collisions
        obj1.preCollide(obj2);
        obj2.preCollide(obj1);
    
        //Basic resolution variables
        var f1;
        var f2;
        var overlap;
        var hit = false;
        var p1hn2;
        
        //Directional variables
        var obj1Stopped = o1 == 0;
        var obj1MoveNeg = o1 < 0;
        var obj1MovePos = o1 > 0;
        var obj2Stopped = o2 == 0;
        var obj2MoveNeg = o2 < 0;
        var obj2MovePos = o2 > 0;
        
        //Offset loop variables
        var i1;
        var i2;
        var obj1Hull = obj1.colHullX;
        var obj2Hull = obj2.colHullX;
        var co1 = obj1.colOffsets;
        var co2 = obj2.colOffsets;
        var l1 = co1.length;
        var l2 = co2.length;
        var ox1;
        var oy1;
        var ox2;
        var oy2;
        var r1;
        var r2;
        var sv1;
        var sv2;
        
        //Decide based on obj's movement patterns if it was a right-side or left-side collision
        p1hn2 = ((obj1Stopped && obj2MoveNeg) || (obj1MovePos && obj2Stopped) || (obj1MovePos && obj2MoveNeg) || //the obvious cases
                (obj1MoveNeg && obj2MoveNeg && (((o1>0)?o1:-o1) < ((o2>0)?o2:-o2))) || //both moving left, obj2 overtakes obj1
                (obj1MovePos && obj2MovePos && (((o1>0)?o1:-o1) > ((o2>0)?o2:-o2))) ); //both moving right, obj1 overtakes obj2
        
        //Check to see if these objs allow these collisions
        if(p1hn2?(!obj1.collideRight || !obj2.collideLeft):(!obj1.collideLeft || !obj2.collideRight))
            return false;
        
        //this looks insane, but we're just looping through collision offsets on each obj
        for(i1 = 0; i1 < l1; i1++)
        {
            ox1 = co1[i1].x;
            oy1 = co1[i1].y;
            obj1Hull.x += ox1;
            obj1Hull.y += oy1;
            for(i2 = 0; i2 < l2; i2++)
            {
                ox2 = co2[i2].x;
                oy2 = co2[i2].y;
                obj2Hull.x += ox2;
                obj2Hull.y += oy2;
                
                //See if it's a actually a valid collision
                if( (obj1Hull.x + obj1Hull.width  < obj2Hull.x + Jxl.u.roundingError) ||
                    (obj1Hull.x + Jxl.u.roundingError > obj2Hull.x + obj2Hull.width) ||
                    (obj1Hull.y + obj1Hull.height < obj2Hull.y + Jxl.u.roundingError) ||
                    (obj1Hull.y + Jxl.u.roundingError > obj2Hull.y + obj2Hull.height) )
                {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }
    
                //Calculate the overlap between the objs
                if(p1hn2)
                {
                    if(obj1MoveNeg)
                        r1 = obj1Hull.x + obj1.colHullY.width;
                    else
                        r1 = obj1Hull.x + obj1Hull.width;
                    if(obj2MoveNeg)
                        r2 = obj2Hull.x;
                    else
                        r2 = obj2Hull.x + obj2Hull.width - obj2.colHullY.width;
                }
                else
                {
                    if(obj2MoveNeg)
                        r1 = -obj2Hull.x - obj2.colHullY.width;
                    else
                        r1 = -obj2Hull.x - obj2Hull.width;
                    if(obj1MoveNeg)
                        r2 = -obj1Hull.x;
                    else
                        r2 = -obj1Hull.x - obj1Hull.width + obj1.colHullY.width;
                }
                overlap = r1 - r2;
            
                //Last chance to skip out on a bogus collision resolution
                if( (overlap == 0) ||
                    ((!obj1.fixed && ((overlap>0)?overlap:-overlap) > obj1Hull.width*0.8)) ||
                    ((!obj2.fixed && ((overlap>0)?overlap:-overlap) > obj2Hull.width*0.8)) )
                {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }
                
                hit = true;
                
                //Adjust the objs according to their flags and stuff
                sv1 = obj2.velocity.x;
                sv2 = obj1.velocity.x;
                if(!obj1.fixed && obj2.fixed)
                {
                    if(obj1._group)
                        obj1.reset(obj1.x - overlap,obj1.y);
                    else
                        obj1.x -= overlap;
                }
                else if(obj1.fixed && !obj2.fixed)
                {
                    if(obj2._group)
                        obj2.reset(obj2.x + overlap,obj2.y);
                    else
                        obj2.x += overlap;
                }
                else if(!obj1.fixed && !obj2.fixed)
                {
                    overlap /= 2;
                    if(obj1._group)
                        obj1.reset(obj1.x - overlap,obj1.y);
                    else
                        obj1.x -= overlap;
                    if(obj2._group)
                        obj2.reset(obj2.x + overlap,obj2.y);
                    else
                        obj2.x += overlap;
                    sv1 /= 2;
                    sv2 /= 2;
                }
                if(p1hn2)
                {
                    obj1.hitRight(obj2,sv1);
                    obj2.hitLeft(obj1,sv2);
                }
                else
                {
                    obj1.hitLeft(obj2,sv1);
                    obj2.hitRight(obj1,sv2);
                }
                
                //Adjust collision hulls if necessary
                if(!obj1.fixed && (overlap != 0))
                {
                    if(p1hn2)
                        obj1Hull.width -= overlap;
                    else
                    {
                        obj1Hull.x -= overlap;
                        obj1Hull.width += overlap;
                    }
                    obj1.colHullY.x -= overlap;
                }
                if(!obj2.fixed && (overlap != 0))
                {
                    if(p1hn2)
                    {
                        obj2Hull.x += overlap;
                        obj2Hull.width -= overlap;
                    }
                    else
                        obj2Hull.width += overlap;
                    obj2.colHullY.x += overlap;
                }
                obj2Hull.x -= ox2;
                obj2Hull.y -= oy2;
            }
            obj1Hull.x -= ox1;
            obj1Hull.y -= oy1;
        }
    
        return hit;
    },
    solveYCollision: function(obj1, obj2) {
        var o1 = obj1.colVector.y;
        var o2 = obj2.colVector.y;
        if(o1 == o2) return false;
        
        //Give the objs a heads up that we're about to resolve some collisions
        obj1.preCollide(obj2);
        obj2.preCollide(obj1);
        
        //Basic resolution variables
        var overlap;
        var hit = false;
        var p1hn2;
        
        //Directional variables
        var obj1Stopped = o1 == 0;
        var obj1MoveNeg = o1 < 0;
        var obj1MovePos = o1 > 0;
        var obj2Stopped = o2 == 0;
        var obj2MoveNeg = o2 < 0;
        var obj2MovePos = o2 > 0;
        
        //Offset loop variables
        var i1;
        var i2;
        var obj1Hull = obj1.colHullY;
        var obj2Hull = obj2.colHullY;
        var co1 = obj1.colOffsets;
        var co2 = obj2.colOffsets;
        var l1 = co1.length;
        var l2 = co2.length;
        var ox1;
        var oy1;
        var ox2;
        var oy2;
        var r1;
        var r2;
        var sv1;
        var sv2;
        
        //Decide based on obj's movement patterns if it was a top or bottom collision
        p1hn2 = ((obj1Stopped && obj2MoveNeg) || (obj1MovePos && obj2Stopped) || (obj1MovePos && obj2MoveNeg) || //the obvious cases
            (obj1MoveNeg && obj2MoveNeg && (((o1>0)?o1:-o1) < ((o2>0)?o2:-o2))) || //both moving up, obj2 overtakes obj1
            (obj1MovePos && obj2MovePos && (((o1>0)?o1:-o1) > ((o2>0)?o2:-o2))) ); //both moving down, obj1 overtakes obj2
        
        //Check to see if these objs allow these collisions
        if(p1hn2?(!obj1.collideBottom || !obj2.collideTop):(!obj1.collideTop || !obj2.collideBottom))
            return false;
        
        //this looks insane, but we're just looping through collision offsets on each obj
        for(i1 = 0; i1 < l1; i1++) {
            ox1 = co1[i1].x;
            oy1 = co1[i1].y;
            obj1Hull.x += ox1;
            obj1Hull.y += oy1;
            for(i2 = 0; i2 < l2; i2++) {
                ox2 = co2[i2].x;
                oy2 = co2[i2].y;
                obj2Hull.x += ox2;
                obj2Hull.y += oy2;
                
                //See if it's a actually a valid collision
                if( (obj1Hull.x + obj1Hull.width  < obj2Hull.x + Jxl.u.roundingError) ||
                    (obj1Hull.x + Jxl.u.roundingError > obj2Hull.x + obj2Hull.width) ||
                    (obj1Hull.y + obj1Hull.height < obj2Hull.y + Jxl.u.roundingError) ||
                    (obj1Hull.y + Jxl.u.roundingError > obj2Hull.y + obj2Hull.height) ) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }
                
                //Calculate the overlap between the objs
                if(p1hn2) {
                    if(obj1MoveNeg)
                        r1 = obj1Hull.y + obj1.colHullX.height;
                    else
                        r1 = obj1Hull.y + obj1Hull.height;
                    if(obj2MoveNeg)
                        r2 = obj2Hull.y;
                    else
                        r2 = obj2Hull.y + obj2Hull.height - obj2.colHullX.height;
                } else {
                    if(obj2MoveNeg)
                        r1 = -obj2Hull.y - obj2.colHullX.height;
                    else
                        r1 = -obj2Hull.y - obj2Hull.height;
                    if(obj1MoveNeg)
                        r2 = -obj1Hull.y;
                    else
                        r2 = -obj1Hull.y - obj1Hull.height + obj1.colHullX.height;
                }
                overlap = r1 - r2;
                
                //Last chance to skip out on a bogus collision resolution
                if( (overlap == 0) ||
                    ((!obj1.fixed && ((overlap>0)?overlap:-overlap) > obj1Hull.height*0.8)) ||
                    ((!obj2.fixed && ((overlap>0)?overlap:-overlap) > obj2Hull.height*0.8)) ) {
                    obj2Hull.x -= ox2;
                    obj2Hull.y -= oy2;
                    continue;
                }
                hit = true;
                
                //Adjust the objs according to their flags and stuff
                sv1 = obj2.velocity.y;
                sv2 = obj1.velocity.y;
                if(!obj1.fixed && obj2.fixed) {
                    if(obj1._group)
                        obj1.reset(obj1.x, obj1.y - overlap);
                    else
                        obj1.y -= overlap;
                } else if(obj1.fixed && !obj2.fixed) {
                    if(obj2._group)
                        obj2.reset(obj2.x, obj2.y + overlap);
                    else
                        obj2.y += overlap;
                } else if(!obj1.fixed && !obj2.fixed) {
                    overlap /= 2;
                    if(obj1._group)
                        obj1.reset(obj1.x, obj1.y - overlap);
                    else
                        obj1.y -= overlap;
                    if(obj2._group)
                        obj2.reset(obj2.x, obj2.y + overlap);
                    else
                        obj2.y += overlap;
                    sv1 /= 2;
                    sv2 /= 2;
                }
                if(p1hn2) {
                    obj1.hitBottom(obj2,sv1);
                    obj2.hitTop(obj1,sv2);
                } else {
                    obj1.hitTop(obj2,sv1);
                    obj2.hitBottom(obj1,sv2);
                }
                
                //Adjust collision hulls if necessary
                if(!obj1.fixed && (overlap != 0)) {
                    if(p1hn2) {
                        obj1Hull.y -= overlap;
                        
                        //This code helps stuff ride horizontally moving platforms.
                        if(obj2.fixed && obj2.moves) {
                            sv1 = obj2.colVector.x;
                            obj1.x += sv1;
                            obj1Hull.x += sv1;
                            obj1.colHullX.x += sv1;
                        }
                    } else {
                        obj1Hull.y -= overlap;
                        obj1Hull.height += overlap;
                    }
                }
                if(!obj2.fixed && (overlap != 0)) {
                    if(p1hn2){
                        obj2Hull.y += overlap;
                        obj2Hull.height -= overlap;
                    } else {
                        obj2Hull.height += overlap;
                    
                        //This code helps stuff ride horizontally moving platforms.
                        if(obj1.fixed && obj1.moves) {
                            sv2 = obj1.colVector.x;
                            obj2.x += sv2;
                            obj2Hull.x += sv2;
                            obj2.colHullX.x += sv2;
                        }
                    }
                }
                obj2Hull.x -= ox2;
                obj2Hull.y -= oy2;
            }
            obj1Hull.x -= ox1;
            obj1Hull.y -= oy1;
        }
        
        return hit;
    },
    getAngle: function(x, y) {
        return Math.atan2(y, x) * 180/Math.PI;
    },
    computeVelocity: function(time, velocity, acceleration, drag, max) {
        if(acceleration == undefined) acceleration = 0;
        if(drag == undefined) drag = 0;
        if(max == undefined) max =  10000;
        
        if(acceleration != 0) velocity += acceleration*time;
        else if(drag != 0) {
            var d = drag*time;
            if(velocity - d > 0) velocity -= d;
            else if (velocity + d < 0) velocity +=d;
            else velocity = 0;
        }
        if((velocity != 0) && (max != 10000)) {
            if(velocity > max) velocity = max;
            else if(velocity < -max) velocity = -max;
        }
        return velocity;
    },
    setWorldBounds: function(X, Y, Width, Height, Divisions) {
        //Set default values for optional parameters
        X = (( X == undefined)) ? 0 : X;
        Y = (( Y == undefined)) ? 0 : Y;
        Width = (( Width == undefined)) ? 0 : Width;
        Height = (( Height == undefined)) ? 0 : Height;
        Divisions = (( Divisions == undefined)) ? 3 : Divisions;
    
        if(Jxl.QuadTree.bounds == null)
            Jxl.QuadTree.bounds = new Jxl.Rect();
        Jxl.QuadTree.bounds.x = X;
        Jxl.QuadTree.bounds.y = Y;
        if(Width > 0)
            Jxl.QuadTree.bounds.width = Width;
        if(Height > 0)
            Jxl.QuadTree.bounds.height = Height;
        if(Divisions > 0)
            Jxl.QuadTree.divisions = Divisions;
    }
});
Jxl.u = new Jxl.Util();Jxl.UI = {};
Jxl.UI.Object = new Class({
    Implements: [Options],
    initialize: function(options) {
        this.setOptions(options);
        Object.merge(this, this.options);
    },
    rendered: false,
    render: function(to) {
        this.rendered = true;
	var self = this;
	this.html = new Element('div', this.attr);
	Object.each(this.members, function(value, key) {
	    self.html.grab(value.render().html.set('id', key));
	});
	if(to !== undefined) to.grab(this.html);
	return this;
    },
    destroy: function() {
        this.rendered = false;
	this.html.dispose();
    }
});

Jxl.UI.Dialog = new Class({
    Extends: Jxl.UI.Object,
    render: function(to) {
	this.parent();
	this.html.set('class', 'jxDialog');
	if(this.modal === true) {
	    this.html = new Element('div', {
		'class': 'jxModal'
	    }).grab(this.html);
	}
	if(to !== undefined) to.grab(this.html);
	return this;
    }
});

Jxl.UI.Button = new Class({
    Extends: Jxl.UI.Object,
    attr: {
	class: 'jxButton'
    }
});

Jxl.UI.pause = new Jxl.UI.Dialog({
    attr: {
	id: 'pauseMenu',
	html: 'Jixel is Paused'
    },
    members: {
	'unpause': new Jxl.UI.Button({
	    attr: {
		html: 'Resume!',
		events: {
		    click: function() {
			Jxl.unpause();
		    }
		}
	    }
	})
    },
   modal: true
});

Jxl.UI.fps = new Jxl.UI.Object({
    attr: {
	styles: {
	    fontWeight: 'bold',
	    position:'fixed',
	    top:'0px',
	    right:'0px'
	}
    }
});Jxl.Mouse = new Class({
    Extends: Jxl.Object,
    initialize: function() {
        this.parent();
        var self = this;
        Jxl.canvas.addEvent('mousemove', function(e) {
            self.x = e.event.x/Jxl.scale;
            self.y = e.event.y/Jxl.scale;
        });
    },
    options: {
        scrollFactor: new Jxl.Point({x: 0, y: 0}),
        width: 1,
        height: 1
    }
});