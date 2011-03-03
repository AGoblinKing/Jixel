Function.prototype.Inherits = function (fnSuper) {
    var prop;
    if (this == fnSuper) {
        alert("Error - cannot derive from self");
        return;
    }
    for (prop in fnSuper.prototype) {
    if (typeof(fnSuper.prototype[prop]) == "function" && !this.prototype[prop]) {
        this.prototype[prop] = fnSuper.prototype[prop];
        }
    }
    this.prototype[fnSuper.StName()] = fnSuper;
}

Function.prototype.StName = function () {
    var st;
    st = this.toString();
    st = st.substring(st.indexOf(" ")+1, st.indexOf("("));
    if (st.charAt(0) == "(")
        st = "function ...";
    return st;
}
Function.prototype.Override = function (fnSuper, stMethod) {
    this.prototype[fnSuper.StName() + "_" + stMethod] = fnSuper.prototype[stMethod];
}

var objID = 0;
var jxlU = new JxlU();
var jxlGame = null;
/*** Game Objects ***/
function Jixel(canvas) {
    /*** Setup Core ***/
    this.jxlGame = jxlGame; // trying to ween off this, BB uses it tho
    this.canvas = canvas;
    this.scale = 4;
    this.ctx = canvas.getContext('2d');
    this.bufferCanvas = $('<canvas/>')[0];
    this._width(240);
    this._height(160);
    this.buffer = this.bufferCanvas.getContext('2d');
    this.gameObjects = {};
    this.refresh = 16;
    this.running = false;
    this.am = new AssetManager(this);
    this.audio = new AudioManager(this);
    this.fullScreen = false;
    this.keepResolution = false;
    this.date = new Date();
    this.keys = {};
    this._showFPS = false;
    var self = this;
    this._scrollTarget = new JxlPoint();
    this.unfollow();
    jxlU.setWorldBounds(0,0,this.width, this.height);
    /*** Setup UI ***/
    this.ui = {};
    this.ui.fps = $('<div/>').css({
       fontWeight:'bold',
       position:'fixed',
       top:'0px',
       right:'0px',
       display:'none'
    }).appendTo('body');
    this.ui.pauseMenu = $('<div/>').dialog({
        autoOpen : false,
        title : 'Game Paused',
        closeText : '',
        modal : true,
        buttons : {
            'Return to Game': function() {
                self.unpause();
            }
        },
        close : function() {
            self.unpause();
        }
    });
    
    /*** Input Overrides ***/
    this.overrideKeys = {37:'',38:'',39:'',40:'',32:''};
    this.overrideElements = {'INPUT':'','TEXTAREA':''};
    this.mapKeys = {37:'A',38:'W',40:'S',39:'D',32:'SPACE'};
    /*** Setup Events ***/
    $(window).blur(function() {
       self.pause();
    });
    $(document).keyup(function(e){
        delete self.keys[String.fromCharCode(e.keyCode)];
        if(e.keyCode in self.mapKeys) {
            delete self.keys[self.mapKeys[e.keyCode]];
        }
    });
    $(document).keydown(function(e){
        self.keys[String.fromCharCode(e.keyCode)] = true;
        if(e.keyCode in self.mapKeys) {
             self.keys[self.mapKeys[e.keyCode]] = true;
        }
        if(!(document.activeElement.tagName in self.overrideElements) && e.keyCode in self.overrideKeys) {
            return false;
        }
    });
    $(canvas).click(function(e) {
      self.click(e);   
    });
    $(window).resize(function() {
        if(self.fullScreen) {
            if(!self.keepResolution) {
                self.bufferCanvas.width = self.width = $(window).width();
                self.bufferCanvas.height = self.height = $(window).height();
            }
            self.canvas.width = $(window).width();
            self.canvas.height = $(window).height();
        }
    });
    $(window).resize();
}
Jixel.prototype.toggleFPS = function() {
    if(!this._showFPS) {
        this.showFPS();
    } else {
        this.hideFPS();
    }
}
Jixel.prototype.follow = function(target, lerp) {
    if(lerp == undefined) lerp = 1;
    this.followTarget= target;
    this.followLerp = lerp;
    this._scrollTarget.x = (this.width >> 1)-this.followTarget.x-(this.followTarget.width>>1);
    this._scrollTarget.y = (this.height >> 1)-this.followTarget.y-(this.followTarget.height>>1);
    
    this.scroll.x = this._scrollTarget.x;
    this.scroll.y = this._scrollTarget.y;
    this.doFollow(0);
}
Jixel.prototype.doFollow = function(time) {
    if(this.followTarget != null) {
        this._scrollTarget.x = (this.width>>1)-this.followTarget.x-(this.followTarget.width>>1);
        this._scrollTarget.y = (this.height>>1)-this.followTarget.y-(this.followTarget.height>>1);
        if((this.followLead != null)){
            this._scrollTarget.x -= this.followTarget.velocity.x*this.followLead.x;
           this. _scrollTarget.y -= this.followTarget.velocity.y*this.followLead.y;
        }
        this.scroll.x += (this._scrollTarget.x-this.scroll.x)*this.followLerp*time;
        this.scroll.y += (this._scrollTarget.y-this.scroll.y)*this.followLerp*time;
        
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
}
Jixel.prototype.unfollow = function() {
    this.followTarget = null;
    this.followLead = null;
    this.followLerp = 1;
    this.followMin = null;
    this.followMax = null;
    if(this.scroll == null)
        this.scroll = new JxlPoint();
    else
        this.scroll.x = scroll.y = 0;
    if(this._scrollTarget == null)
        this._scrollTarget = new JxlPoint();
    else
        this._scrollTarget.x = this._scrollTarget.y = 0;
}
Jixel.prototype.showFPS = function() {
    if(!this._showFPS) {
        this._showFPS = true;
        this.ui.fps.show();
    }
}
Jixel.prototype.hideFPS = function() {
    if(this._showFPS) {
        this._showFPS = false;
        this.ui.fps.hide();
    }
}
Jixel.prototype._width = function(width) {
    if(width != undefined) {
        this.bufferCanvas.width = width;
        this.screenWidth(width*this.scale);
        this.width = width;
    }
    return this.bufferCanvas.width; 
}
Jixel.prototype._height = function(height) {
    if(height != undefined) {
        this.bufferCanvas.height = height;
        this.screenHeight(height*this.scale);
        this.height = height;
    }
    return this.bufferCanvas.height;
}
Jixel.prototype.unpause = function() {
    if(!this.running) {
        this.running = true;
        this.audio.unpause();
        this.keys = {};
        this.lastUpdate = new Date();
        this.ui.pauseMenu.dialog('close');
    }
}
Jixel.prototype.pause = function() {
    if(this.running) {
        this.running = false;
        this.audio.pause();
        this.ui.pauseMenu.dialog('open');
    }
}
Jixel.prototype.screenWidth = function(width) {
    if(width != undefined) {
        this.canvas.width = width; 
    }
    return this.canvas.width; 
}
Jixel.prototype.screenHeight = function(height) {
    if(height != undefined) {
        this.canvas.height = height;
    }
    return this.canvas.height;
}
Jixel.prototype.start = function() {
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
}
Jixel.prototype.changeScale = function(scale) {
    this.scale = scale;
    this._width(this.width);
    this._height(this.height);
    this.am.reload('image');
}
Jixel.prototype.add = function(obj) {
    this.gameObjects[obj.id] = obj;
}
Jixel.prototype.destroyObject = function(obj) {
    delete this.gameObjects[obj.id];
}
Jixel.prototype.update = function(timeBetween) {
    // Do FPS Update
    this.doFollow(timeBetween);
    if(this.showFPS) {
        this.ui.fps.html(Math.floor(1/timeBetween));
    }
    // Do AudioUpdates
    this.audio.update(timeBetween);
    // Do GameUpdates
    for(var x in this.gameObjects) {
        this.gameObjects[x].update(this, timeBetween);
    }

    // Now Draw
    this.ctx.clearRect(0,0, this.screenWidth(), this.screenHeight());
    //this.buffer.clearRect(0,0, this.width(), this.height());
   
    for(var x in this.gameObjects) {
        this.gameObjects[x].render(this.ctx, this);
    }
    //this.ctx.putImageData(this.buffer.getImageData(0,0,this.width,this.height),0,0,0,0,this.width,this.height);
    
    //this.ctx.drawImage(this.bufferCanvas,0,0);
    /*
    var temp = resize(this.buffer,0,0,this.width(),this.height(),0,0,this.screenWidth(),this.screenHeight());
    this.ctx.putImageData(temp, 0, 0);*/
}
Jixel.prototype.click = function(e) {
    //figure out where they clicked
}
function JxlPoint(x, y){
    if(x == undefined) x = 0;
    if(y == undefined) y = 0;
    
    this.x = x;
    this.y = y;
}
JxlRect.Inherits(JxlPoint);
function JxlRect(x, y, width, height) {
    this.JxlPoint(x, y);
    if(width == undefined) width = 0;
    if(height == undefined) height = 0;
    this.width = width;
    this.height = height;
}
JxlRect.prototype.left = function() {
    return this.x;
}
JxlRect.prototype.right = function() {
    return this.x + this.width;
}
JxlRect.prototype.top = function() {
    return this.y;
}
JxlRect.prototype.bottom = function() {
    return this.y+this.height;
}

JxlObject.Inherits(JxlRect);
function JxlObject(x, y, width, height) {
    this.JxlRect(x, y, width, height);
    this._point = new JxlPoint(); // preallocated point ... not sure if want
    this.id = objID;
    objID++;

    this.collideLeft = true;
    this.collideRight = true;
    this.collideTop = true;
    this.collideBottom = true;
    
    this.origin = new JxlPoint();
    this.velocity = new JxlPoint();
    this.acceleration = new JxlPoint();
    this._pZero = new JxlPoint();
    this.drag = new JxlPoint();
    this.maxVelocity = new JxlPoint(10000, 10000);
    
    this.angle = 0;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;
    this.maxAngular = 10000;
    
    this.thrust = 0;
    this.visible = true;
    this.active = true;
    this.exists = true;
    this.solid = true;
    this.fixed = false;
    this.moves = true;
    
    this.health = 1;
    this.dead = false;
    this._flicker = false;
    this._flickerTimer = -1;
    this.scrollFactor = new JxlPoint(1, 1);
    
    this.colHullX = new JxlRect();
    this.colHullY = new JxlRect();
    this.colVector = new JxlPoint();
    this.colOffsets = new Array(new JxlPoint());
    this._group = false;
}
JxlObject.prototype.refreshHulls = function() {
    this.colHullX.x = this.x;
    this.colHullX.y = this.y;
    this.colHullX.width = this.width;
    this.colHullX.height = this.height;
    this.colHullY.x = this.x;
    this.colHullY.y = this.y;
    this.colHullY.width = this.width;
    this.colHullY.height = this.height;
}
JxlObject.prototype.updateMotion = function(game, time) {
 
    if(!this.moves) return;
    if(this.solid) this.refreshHulls();
    this.onFloor = false;
    var vc = (jxlU.computeVelocity(time, this.angularVelocity, this.angularAcceleration, this.angularDrag, this.maxAngular) - this.angularVelocity)/2;
    this.angularVelocity += vc;
    this.angle += this.angularVelocity*time;
    this.angularVelocity += vc;
    
    var thrustComponents;
    if(this.thrust != 0 ) {
        thrustComponents = jxlU.rotatePoint(-this.thrust, 0, 0, 0,this.angle);
        var maxComponents = jxlU.rotatePoint(-this.maxThrust, 0, 0, 0, this.angle);
        var max = Math.abs(maxComponents.x);
        if(max > Math.abs(maxComponents.y)) maxComponents.y = max;
        else max = Math.abs(maxComponents.y);
        this.maxVelocity.x = this.maxVelocity.y = Math.abs(max);
    } else {
        thrustComponents = this._pZero;
    }
    
    vc = (jxlU.computeVelocity(time, this.velocity.x, this.acceleration.x+thrustComponents.x,this.drag.x, this.maxVelocity.x) - this.velocity.x)/2;
    this.velocity.x += vc;
    var xd = this.velocity.x * time;
    this.velocity.x += vc;
    
    vc = (jxlU.computeVelocity(time, this.velocity.y, this.acceleration.y+thrustComponents.y, this.drag.y, this.maxVelocity.y) - this.velocity.y)/2;
    this.velocity.y += vc;
    var yd = this.velocity.y * time;
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
}
JxlObject.prototype.updateFlickering = function(game, time) {
    if(this.flickering()) {
        if(this._flickerTimer > 0) {
            this._flickerTimer -= time;
            if(this._flickerTimer == 0) this._flickerTimer = -1;
        }
        if(this._flickerTimer < 0) this.flicker(-1);
        else {
            this._flicker = !this._flicker;
            this.visible = !this._flicker;
        }
    }
}
JxlObject.prototype.update = function(game, time) {
    this.updateMotion(game, time);
    this.updateFlickering(game, time);
}
JxlObject.prototype.flicker = function(duration) {
    if(duration == undefined) duration = 1;
    this._flickerTimer = duration;
    if(this._flickerTimer < 0) {
        this._flicker = false;
        this.visible = true;
    }
}
JxlObject.prototype.reset = function(x, y) {
    if(x == undefined) x = 0;
    if(y == undefined) y = 0;
    this.x = x;
    this.y = y;
    this.exists = true;
    this.dead = false;
}
JxlObject.prototype.overlaps = function(object) {
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
}
JxlObject.prototype.overlapsPoint = function(game, x, y, perPixel) {
    if(perPixel == undefined) perPixel = false;
    
    x += Math.floor(game.scroll.x);
    y += Math.floor(game.scroll.y);
    this._point = this.getScreenXY(this._point);
    if((x <= this._point.x) || (x >= this._point.x+this.width) || (y <= this._point.y) || (y >= this._point.y+this.height))
        return false;
    return true;
}
JxlObject.prototype.collide = function(object) {
    if(object == undefined) this;
    return jxlU.collide(this, object);
}
JxlObject.prototype.preCollide = function(object) {}
JxlObject.prototype.hitLeft = function(contact, velocity) {
    if(!this.fixed) this.velocity.x = velocity;
}
JxlObject.prototype.hitRight = function(contact, velocity) {
    this.hitLeft(contact, velocity);
}
JxlObject.prototype.hitTop = function(contact, velocity) {
    if(!this.fixed) this.velocity.y = velocity;
}
JxlObject.prototype.hitBottom = function(contact, velocity) {
    this.onFloor = true; 
    if(!this.fixed) this.velocity.y = velocity;
}
JxlObject.prototype.flickering = function() {
    return this._flickerTimer >= 0;
}
JxlObject.prototype.hurt = function(damage) {
    if((this.health -= damage) <= 0 ) this.kill();
}
JxlObject.prototype.kill = function() {
    this.exists = false;
    this.dead = true;
}
JxlObject.prototype.render = function() {}
JxlObject.prototype.getScreenXY = function(game, point) {
    if(point == undefined) point = new JxlPoint();
    point.x = Math.floor(this.x+jxlU.roundingError)+Math.floor(game.scroll.x*this.scrollFactor.x);
    point.y = Math.floor(this.y+jxlU.roundingError)+Math.floor(game.scroll.y*this.scrollFactor.y);
    return point;
}
JxlGroup.Inherits(JxlObject)
JxlGroup.ASCENDING = JxlGroup.prototype.ASCENDING = -1;
JxlGroup.DESCENDING = JxlGroup.prototype.DESCENDING = 1;
function JxlGroup() {
    this.JxlObject();
    this._group = true;
    this.solid = false;
    this.members = [];
    this._last = new JxlPoint();
    this._first = true;
}
JxlGroup.prototype.add = function(object, ShareScroll) {
    ShareScroll = (ShareScroll === undefined) ? false : ShareScroll;
    if (this.members.indexOf(object) < 0)
        this.members[this.members.length] = object;
    if(ShareScroll)
        object.scrollFactor = this.scrollFactor;
    return object;
}
JxlGroup.prototype.replace = function(OldObject, NewObject) {
    var index = this.members.indexOf(OldObject);
    if((index < 0) || (index >= this.members.length))
        return null;
    this.members[index] = NewObject;
    return NewObject;
}
JxlGroup.prototype.remove = function(object, Splice) {
    Splice = (Splice === undefined) ? false : Splice;
    var index = this.members.indexOf(object);
    if((index < 0) || (index >= this.members.length))
        return null;
    if(Splice)
        this.members.splice(index,1);
    else
        this.members[index] = null;
    return object;
}
JxlGroup.prototype.sort = function(Index, Order) {
    Index = (Index === undefined) ? "y" : Index;
    Order = (Order === undefined) ? JxlGroup.ASCENDING : Order;
    this._sortIndex = Index;
    this._sortOrder = Order;
    this.members.sort(this.sortHandler);
}
JxlGroup.prototype.getFirstAvail = function() {
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
}
JxlGroup.prototype.getFirstNull = function() {
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
}
JxlGroup.prototype.resetFirstAvail = function(X, Y) {
    X = (X === undefined) ? 0 : X;
    Y = (Y === undefined) ? 0 : Y;
    var o = this.getFirstAvail();
    if(o == null)
        return false;
    o.reset(X,Y);
    return true;
}
JxlGroup.getFirstExtant = function() {
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
}
JxlGroup.prototype.getFirstAlive = function() {
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
}
JxlGroup.prototype.getFirstDead = function() {
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
}
JxlGroup.prototype.countLiving = function() {
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
}
JxlGroup.prototype.countDead = function() {
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
}
JxlGroup.prototype.countOnScreen = function() {
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
}
JxlGroup.prototype.getRandom = function() {
    var c = 0;
    var o = null;
    var l = this.members.length;
    var i = Math.floor(jxlU.random()*l);
    while((o === null || o === undefined) && (c < this.members.length))
    {
        o = this.members[(++i)%l];
        c++;
    }
    return o;
}
JxlGroup.prototype.saveOldPosition = function() {
    if(this._first)
    {
        this._first = false;
        this._last.x = 0;
        this._last.y = 0;
        return;
    }
    this._last.x = this.x;
    this._last.y = this.y;
}
JxlGroup.prototype.updateMembers = function(game, time) {
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
                o.update(game, time);
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
}
JxlGroup.prototype.update = function(game, time) {
    this.saveOldPosition();
    this.updateMotion(game, time);
    this.updateMembers(game, time);
    this.updateFlickering(game, time);
}
JxlGroup.prototype.renderMembers = function(ctx, game) {
    var i = 0;
    var o;
    var ml = this.members.length;
    while(i < ml)
    {
        o = this.members[i++];
        if((o != null) && o.exists && o.visible)
            o.render(ctx, game);
    }
}
JxlGroup.prototype.render = function(ctx, game) {
    this.renderMembers(ctx, game);
}
JxlGroup.prototype.killMembers = function() {
    var i = 0;
    var o;
    var ml = this.members.length;
    while(i < ml)
    {
        o = this.members[i++];
        if(o != null)
            o.kill();
    }
}
JxlGroup.prototype.kill = function() {
    this.killMembers();
	this.parent();
}
JxlGroup.prototype.destroyMembers = function() {
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
}
JxlGroup.prototype.destroy = function() {
    this.destroyMembers();
	this.parent();
}
JxlGroup.prototype.reset = function(X, Y) {
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
}
JxlGroup.prototype.sortHandler = function(Obj1, Obj2) {
    if(Obj1[this._sortIndex] < Obj2[this._sortIndex])
        return this._sortOrder;
    else if(Obj1[this._sortIndex] > Obj2[this._sortIndex])
        return -this._sortOrder;
    return 0;
}
JxlSprite.Inherits(JxlObject);
JxlSprite.LEFT = 0;
JxlSprite.RIGHT = 1;
JxlSprite.UP = 2;
JxlSprite.DOWN = 3;

function JxlSprite(asset, x, y, width, height) {
    this.isSprite = true;
    this.JxlObject(x, y, width, height);
    this.angle = 0;
    this._alpha = 1;
    this._color = 0x00ffffff;
    this._blend = null;
    this.scale = new JxlPoint(1,1);
    this._facing = 1;
    this._animations = {};
    this._flipped = 0;
    this._curFrame = 0;
    this._frameTimer = 0;
    this.finished = false;
    this._caf = 0;
    this.offset = new JxlPoint();
    this._curAnim = null;
   
    //Could probably reduce memory/cpu here
    
    this._graphic = $('<canvas/>')[0];
    this._graphicCTX = this._graphic.getContext('2d');
    
    this.asset = asset;
    if(width == undefined) {
        this.width = asset.width;
        this.height = asset.height;
    } else {
        this.width = width;
        this.height = height;
    }
}
JxlSprite.prototype.play = function(name, force) {
    if(force == undefined) force = false;
    if(!force && this._curAnim != null && name == this._curAnim.name) return;
    this._curFrame = 0;
    this._caf = 0;
    this._curAnim = this._animations[name];
    this._curFrame = this._curAnim.frames[this._caf]; 
    
}
JxlSprite.prototype.calcFrame = function(game) {
    var rx = this._curFrame * this.width;
    var ry = 0;
    
    if(rx > this.asset.width) {
        ry = Math.floor(rx/this.asset.width)*this.height;
        rx = rx % this.asset.width;
    }
    
    this._graphic.width = this.width*game.scale;
    this._graphic.height = this.height*game.scale;
    if(this._flipped) {
        this._graphicCTX.scale(-1,1);
        this._graphicCTX.translate(-this._graphic.width,0);
    }
    this._graphicCTX.drawImage(this.asset.scaled,rx*game.scale,ry*game.scale,this.width*game.scale, this.height*game.scale, 0,0,this.width*game.scale, this.height*game.scale );

}
// Rotations are stored on the fly instead of prebaked since they are cheaper here than in flixel
JxlSprite.prototype.render = function(ctx, game){
    if(!this.visible) return;
    this._point = this.getScreenXY(game, this._point);
    
    this.calcFrame(game);
    var rCan = this._graphic;
    var mod = 1;
     
    //lets not worry about frames for now.
    if(this.angle !=0) {
        mod = 1.5;
        var key = this.angle+':'+this._curFrame;
        if(this.asset.rotations[key] == undefined) {
            rCan=$('<canvas/>')[0];
            rCan.width = this.asset.scaled.width*1.5;
            rCan.height = this.asset.scaled.height*1.5;
            var rCTX = rCan.getContext('2d');
            rCTX.translate(rCan.width/2,rCan.height/2);
            rCTX.rotate(this.angle*Math.PI/180);
            rCTX.drawImage(this.asset.scaled, -this.asset.scaled.width/2,-this.asset.scaled.height/2,this.asset.scaled.width,this.asset.scaled.height);
            this.asset.rotations[key] = rCan;
        } else {
            rCan = this.asset.rotations[key];
        }
    }
    
    ctx.drawImage(rCan, 0,0, this.width*game.scale*mod, this.height*game.scale*mod, this._point.x *game.scale, this._point.y*game.scale, this.width*game.scale*mod, this.height*game.scale*mod);    

}
JxlSprite.prototype.updateAnimation = function(game, time) {
    if((this._curAnim != null) && (this._curAnim.delay > 0) && (this._curAnim.looped || !this.finished )) {
        this._frameTimer += time;
        if(this._frameTimer > this._curAnim.delay) {
            this._frameTimer -= this._curAnim.delay;
            if(this._caf == this._curAnim.frames.length-1) {
                if(this._curAnim.looped) this._caf = 0;
                this.finished = true;
            } else {
                this._caf++;
            }
            this._curFrame = this._curAnim.frames[this._caf];
        }
    }
}
JxlSprite.prototype.addAnimation = function(name, frames, frameRate, looped ){
    if(frameRate == undefined)
        frameRate = 0;
    if(looped == undefined)
        looped = true;
    this._animations[name] = new JxlAnim(name, frames, frameRate, looped);
}
JxlSprite.prototype.update = function(game, time) {
    this.updateMotion(game, time);
    this.updateAnimation(game, time);
    this.updateFlickering(game, time);
}
JxlSprite.prototype.getScreenXY = function(game, point) {
    if(point == undefined) point = new JxlPoint();
    point.x = Math.floor(this.x+jxlU.roundingError)+Math.floor(game.scroll.x*this.scrollFactor.x) - this.offset.x;
    point.y = Math.floor(this.y+jxlU.roundingError)+Math.floor(game.scroll.y*this.scrollFactor.y) - this.offset.y;
    return point;
}
JxlSprite.prototype.overlapsPoint = function(game, x, y, perPixel) {
    if(perPixel == undefined) perPixel = false;
    
    x -= Math.floor(game.scroll.x);
    y -= Math.floor(game.scroll.y);
    this._point = this.getScreenXY(this._point);

    if((x <= this._point.x) || (x >= this._point.x+this.width) || (y <= this._point.y) || (y >= this._point.y+this.height))
        return false;
    return true;
}
JxlSprite.prototype.getFacing = function() {
    return this._facing;
}
JxlSprite.prototype.setFacing = function(Direction) {
    var c = this._facing != Direction;
    this._facing = Direction;
    if(c) this.calcFrame();
}
function JxlAnim(name, frames, frameRate, looped){
    this.name = name;
    this.delay = 0;
    if(frameRate > 0)
        this.delay = frameRate;
    this.frames = frames;
    this.looped = looped;
}

JxlTileMap.Inherits(JxlObject);
JxlTileMap.OFF =  0;
JxlTileMap.AUTO =  1;
JxlTileMap.ALT = 2;
JxlTileMap.arrayToCSV = function(Data, Width) {
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
function JxlTileMap(x, y, auto) {
    this.JxlObject(x, y);
    this.auto = auto == undefined ? JxlTileMap.OFF : auto;
    this.collideIndex = 1;
    this.startingIndex = 0;
    this.drawIndex = 1;
    this.widthInTiles = 0;
    this.heightInTiles = 0;
    this.totalTiles = 0;
    this._buffer = null;
    this._bufferLoc = new JxlPoint();
    this._flashRect2 = new JxlRect();
    this._flashRect = this._flashRect2;
    this._data = null;
    this._tileWidth = 0;
    this._tileHeight = 0;
    this._rects = null;
    this._pixels = null;
    this._block = new JxlObject();
    this._block.width = this._block.height = 0;
    this._block.fixed = true;
    this._callbacks = new Array();
    this.fixed = true;
}
JxlTileMap.prototype.loadMap  = function(Game, MapData, TileGraphic, TileWidth, TileHeight) {
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
    if(this.auto > JxlTileMap.OFF)
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
        
    this._screenRows = Math.ceil(game.height/this._tileHeight)+1;
    if(this._screenRows > this.heightInTiles)
        this._screenRows = this.heightInTiles;
    this._screenCols = Math.ceil(game.width/this._tileWidth)+1;
    if(this._screenCols > this.widthInTiles)
        this._screenCols = this.widthInTiles;
    
    return this;
}

JxlTileMap.prototype.render = function(ctx, game) {
    this._point = this.getScreenXY(game,this._point);
    var _flashPoint = new JxlPoint(this._point.x, this._point.y);
    
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
                ctx.drawImage(this._pixels.scaled, _flashRect[0]*game.scale, _flashRect[1]*game.scale,
                        _flashRect[2]*game.scale, _flashRect[3]*game.scale, _flashPoint.x*game.scale,
                        _flashPoint.y*game.scale,  this._tileWidth*game.scale, this._tileHeight*game.scale);
            _flashPoint.x += this._tileWidth;
        }
        ri += this.widthInTiles;
        _flashPoint.x = opx;
        _flashPoint.y += this._tileHeight;
    }
}

JxlTileMap.prototype.updateTile = function(index){
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
}

JxlTileMap.prototype.autoTile = function(Index) {
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
        
    if((this.auto == JxlTileMap.ALT) && (this._data[Index] == 15))	//The alternate algo checks for interior corners
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
}
JxlTileMap.prototype.overlaps = function(Core) {
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
}
JxlTileMap.prototype.setTile = function(X, Y, Tile, UpdateGraphics) {
    UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;
    if((X >= this.widthInTiles) || (Y >= this.heightInTiles))
        return false;
    return this.setTileByIndex(Y * this.widthInTiles + X,Tile,UpdateGraphics);
}
JxlTileMap.prototype.setTileByIndex = function(Index, Tile, UpdateGraphics) {
    UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;
    if(Index >= this._data.length)
        return false;
    
    var ok = true;
    this._data[Index] = Tile;
    
    if(!UpdateGraphics)
        return ok;
    
    this.refresh = true;
    
    if(this.auto == FlxTilemap.OFF)
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
}
JxlTileMap.prototype.overlapsPoint = function(X, Y, PerPixel) {
    var t = getTile(
            Math.floor( (X-this.x) / this._tileWidth ),
            Math.floor( (Y-this.y) / this._tileHeight)
    );
    return  t >= this.collideIndex;
}
JxlTileMap.prototype.refreshHulls = function() {
    this.colHullX.x = 0;
    this.colHullX.y = 0;
    this.colHullX.width = this._tileWidth;
    this.colHullX.height = this._tileHeight;
    this.colHullY.x = 0;
    this.colHullY.y = 0;
    this.colHullY.width = this._tileWidth;
    this.colHullY.height = this._tileHeight;
}

JxlTileMap.prototype.preCollide = function(Obj) {
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
                this.colOffsets[col++] = new JxlPoint(this.x + c * this._tileWidth, this.y + r * this._tileHeight);
        }
        rs += this.widthInTiles;
    }
    if(this.colOffsets.length != col)
        this.colOffsets.length = col;
}
JxlTileMap.prototype.ray = function(StartX, StartY, EndX, EndY, Result, Resolution) {
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
                    Result = new FlxPoint();
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
                    Result = new FlxPoint();
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
JxlTileMap.prototype.generateBoundingTiles = function() {
    this.refresh = true;
    
    if((this._bbKey == null) || (this._bbKey.length <= 0))
        return;
    
    //Check for an existing version of this bounding boxes tilemap
    var bbc = this.getBoundingColor();
    var key = this._bbKey + ":BBTILES" + bbc;
    var skipGen = FlxG.checkBitmapCache(key);
    this._bbPixels = FlxG.createBitmap(this._pixels.width, this._pixels.height, 0, true, key);
    if(!skipGen)
    {
        //Generate a bounding boxes tilemap for this color
        this._flashRect.width = this._pixels.width;
        this._flashRect.height = this._pixels.height;
        this._flashPoint.x = 0;
        this._flashPoint.y = 0;
        
        this._bbPixels.copyPixels(this._pixels,this._flashRect,this._flashPoint);
        this._flashRect.width = this._tileWidth;
        this._flashRect.height = this._tileHeight;
        
        //Check for an existing non-collide bounding box stamp
        var ov = this._solid;
        this._solid = false;
        bbc = this.getBoundingColor();
        key = "BBTILESTAMP"+ this._tileWidth + "X" + this._tileHeight + bbc;
        skipGen = FlxG.checkBitmapCache(key);
        var stamp1 = FlxG.createBitmap(this._tileWidth, this._tileHeight, 0, true, key);
        if(!skipGen)
        {
            //Generate a bounding boxes stamp for this color
            stamp1.fillRect(this._flashRect, bbc);
            this._flashRect.x = this._flashRect.y = 1;
            this._flashRect.width = this._flashRect.width - 2;
            this._flashRect.height = this._flashRect.height - 2;
            stamp1.fillRect(this._flashRect, 0);
            this._flashRect.x = this._flashRect.y = 0;
            this._flashRect.width = this._tileWidth;
            this._flashRect.height = this._tileHeight;
        }
        this._solid = ov;
        
        //Check for an existing collide bounding box
        bbc = this.getBoundingColor();
        key = "BBTILESTAMP" + this._tileWidth + "X" + this._tileHeight + bbc;
        skipGen = FlxG.checkBitmapCache(key);
        var stamp2 = FlxG.createBitmap(this._tileWidth, this._tileHeight, 0, true, key);
        if(!skipGen)
        {
            //Generate a bounding boxes stamp for this color
            stamp2.fillRect(this._flashRect, bbc);
            this._flashRect.x = this._flashRect.y = 1;
            this._flashRect.width = this._flashRect.width - 2;
            this._flashRect.height = this._flashRect.height - 2;
            stamp2.fillRect(this._flashRect,0);
            this._flashRect.x = this._flashRect.y = 0;
            this._flashRect.width = this._tileWidth;
            this._flashRect.height = this._tileHeight;
        }
        
        //Stamp the new tile bitmap with the bounding box border
        var r = 0;
        var c;
        var i = 0;
        while(r < this._bbPixels.height)
        {
            c = 0;
            while(c < this._bbPixels.width)
            {
                this._flashPoint.x = c;
                this._flashPoint.y = r;
                if(i++ < this.collideIndex)
                    this._bbPixels.copyPixels(stamp1,this._flashRect,this._flashPoint,null,null,true);
                else
                    this._bbPixels.copyPixels(stamp2,this._flashRect,this._flashPoint,null,null,true);
                c += this._tileWidth;
            }
            r += this._tileHeight;
        }
        
        this._flashRect.x = 0;
        this._flashRect.y = 0;
        this._flashRect.width = this._buffer.width;
        this._flashRect.height = this._buffer.height;
    }
}
JxlState.Inherits(JxlSprite);
function JxlState() {
    this.JxlSprite();
    this.defaultGroup = new FlxGroup();
    if(FlxState.screen === undefined || FlxState.screen === null) {
        FlxState.screen = new FlxSprite();
        FlxState.screen.createGraphic(FlxG.width,FlxG.height,0,true);
        FlxState.screen.origin.x = FlxState.screen.origin.y = 0;
        FlxState.screen.antialiasing = true;
        FlxState.screen.exists = false;
        FlxState.screen.solid = false;
        FlxState.screen.fixed = true;
    }
}
/*** Utility ***/
JxlU.roundingError = 0.0000001;
JxlU.quadTreeDivisions = 3;

function JxlU() {
    this.roundingError = 0.0000001;
    this.quadTreeDivisions = 3;
}
JxlU.prototype.random = function(Seed) {
    if(isNaN(Seed) || Seed === undefined)
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
}
JxlU.prototype.overlap = function(obj1, obj2, callback) {
    if( (obj1 == null) || !obj1.exists ||
				(obj2 == null) || !obj2.exists )
				return false;
    quadTree = new JxlQuadTree(JxlQuadTree.bounds.x,JxlQuadTree.bounds.y,JxlQuadTree.bounds.width,JxlQuadTree.bounds.height);
    quadTree.add(obj1,JxlQuadTree.A_LIST);
    if(obj1 === obj2)
        return quadTree.overlap(false,callback);
    quadTree.add(obj2,JxlQuadTree.B_LIST);
    return quadTree.overlap(true,callback);
}
JxlU.prototype.collide = function(obj1, obj2) {
    if( (obj1 == null) || !obj1.exists ||
        (obj2 == null) || !obj2.exists )
        return false;
    
    quadTree = new JxlQuadTree(JxlQuadTree.bounds.x,JxlQuadTree.bounds.y,JxlQuadTree.bounds.width,JxlQuadTree.bounds.height);
    quadTree.add(obj1,JxlQuadTree.A_LIST);
    var match = obj1 === obj2;
    if(!match) quadTree.add(obj2,JxlQuadTree.B_LIST);
    var cx = quadTree.overlap(!match,jxlU.solveXCollision);
    var cy = quadTree.overlap(!match,jxlU.solveYCollision);
    return cx || cy;
}
JxlU.prototype.rotatePoint = function(x, y, pivotX, pivotY, angle, p) {
    if(p == undefined) p = new JxlPoint();
    var radians = -angle / 180 * Math.PI;
    var dx = x-pivotX;
    var dy = pivotY-y;
    p.x = pivotX + Math.cos(radians)*dx - Math.sin(radians)*dy;
    p.y = pivotY - (Math.sin(radians)*dx + Math.cos(radians)*dy);
    return p;
}

JxlU.prototype.solveXCollision = function(obj1, obj2) {
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
            if( (obj1Hull.x + obj1Hull.width  < obj2Hull.x + JxlU.roundingError) ||
                (obj1Hull.x + JxlU.roundingError > obj2Hull.x + obj2Hull.width) ||
                (obj1Hull.y + obj1Hull.height < obj2Hull.y + JxlU.roundingError) ||
                (obj1Hull.y + JxlU.roundingError > obj2Hull.y + obj2Hull.height) )
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
}
JxlU.prototype.solveYCollision = function(obj1, obj2) {
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
            if( (obj1Hull.x + obj1Hull.width  < obj2Hull.x + JxlU.roundingError) ||
                (obj1Hull.x + JxlU.roundingError > obj2Hull.x + obj2Hull.width) ||
                (obj1Hull.y + obj1Hull.height < obj2Hull.y + JxlU.roundingError) ||
                (obj1Hull.y + JxlU.roundingError > obj2Hull.y + obj2Hull.height) ) {
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
}
JxlU.prototype.getAngle = function(x, y) {
    return Math.atan2(y, x) * 180/Math.PI;
}
JxlU.prototype.computeVelocity = function(time, velocity, acceleration, drag, max) {
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
}
JxlU.prototype.setWorldBounds = function(X, Y, Width, Height, Divisions) {
    //Set default values for optional parameters
    X = (isNaN(X)) ? 0 : X;
    Y = (isNaN(Y)) ? 0 : Y;
    Width = (isNaN(Width)) ? 0 : Width;
    Height = (isNaN(Height)) ? 0 : Height;
    Divisions = (isNaN(Divisions)) ? 3 : Divisions;

    if(JxlQuadTree.bounds == null)
        JxlQuadTree.bounds = new JxlRect();
    JxlQuadTree.bounds.x = X;
    JxlQuadTree.bounds.y = Y;
    if(Width > 0)
        JxlQuadTree.bounds.width = Width;
    if(Height > 0)
        JxlQuadTree.bounds.height = Height;
    if(Divisions > 0)
        JxlQuadTree.divisions = Divisions;
}
/*** Data and nongame related ;) ***/
function JxlList() {
    this.object = null;
    this.next = null;
}
JxlQuadTree.Inherits(JxlRect);
JxlQuadTree.A_LIST = 0;
JxlQuadTree.B_LIST = 1;
JxlQuadTree.divisions = 3;
JxlQuadTree.quadTree = null;
JxlQuadTree.bounds = null;
function JxlQuadTree(x, y, width, height, parent) {
    this.JxlRect(x, y, width, height);
    
    this._headA = this._tailA = new JxlList();
    this._headB = this._tailB = new JxlList();
    
    if(parent != undefined) {
        var itr;
        var ot;
        if(parent._headA.object != null) {
            itr = parent._headA;
            while(itr != null) {
                if(this._tailA.object != null) {
                    ot = this._tailA;
                    this._tailA = new JxlList();
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
                    this._tailB = new JxlList();
                    ot.next = this._tailB;
                }
                this._tailB.object = itr.object;
                itr = itr.next;
            }
        }
    } else {
        this._min = (this.width + this.height)/(2*jxlU.quadTreeDivisions);
    }
    this._canSubdivide = (this.width > this._min) || (this.height > JxlQuadTree._min);
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
}
JxlQuadTree.prototype.add = function(obj, list) {
   JxlQuadTree._oa = list;
    
    if(obj._group) {
        var m;
        var members = obj.members;
        var l = members.length;
        
        for(var i = 0;i < l; i++ ) {
            m = members[i];
            if((m != null) && m.exists) {
                if(m._group) this.add(m, list);
                else if(m.solid) {
                   JxlQuadTree._o = m;
                   JxlQuadTree._ol =JxlQuadTree._o.x;
                   JxlQuadTree._ot =JxlQuadTree._o.y;
                   JxlQuadTree._or =JxlQuadTree._o.x +JxlQuadTree._o.width;
                   JxlQuadTree._ob =JxlQuadTree._o.y +JxlQuadTree._o.height;
                    this.addObject();
                }
            }
        }
    }
    if(obj.solid) {
       JxlQuadTree._o = obj;
       JxlQuadTree._ol =JxlQuadTree._o.x;
       JxlQuadTree._ot =JxlQuadTree._o.y;
       JxlQuadTree._or =JxlQuadTree._o.x +JxlQuadTree._o.width;
       JxlQuadTree._ob =JxlQuadTree._o.y +JxlQuadTree._o.height;
        this.addObject();
    }
}
JxlQuadTree.prototype.addObject = function() {
   //If this quad (not its children) lies entirely inside this object, add it here
    if(!this._canSubdivide || ((this._l >=JxlQuadTree._ol) && (this._r <=JxlQuadTree._or) && (this._t >=JxlQuadTree._ot) && (this._b <=JxlQuadTree._ob)))
    {
        this.addToList();
        return;
    }

    //See if the selected object fits completely inside any of the quadrants
    if((JxlQuadTree._ol > this._l) && (JxlQuadTree._or < this._mx))
    {
        if((JxlQuadTree._ot > this._t) && (JxlQuadTree._ob < this._my))
        {
            if(this._nw == null)
                this._nw = new JxlQuadTree(this._l,this._t,this._hw,this._hh,this);
            this._nw.addObject();
            return;
        }
        if((JxlQuadTree._ot > this._my) && (JxlQuadTree._ob < this._b))
        {
            if(this._sw == null)
                this._sw = new JxlQuadTree(this._l,this._my,this._hw,this._hh,this);
            this._sw.addObject();
            return;
        }
    }
    if((JxlQuadTree._ol > this._mx) && (JxlQuadTree._or < this._r))
    {
        if((JxlQuadTree._ot > this._t) && (JxlQuadTree._ob < this._my))
        {
            if(this._ne == null)
                this._ne = new JxlQuadTree(this._mx,this._t,this._hw,this._hh,this);
            this._ne.addObject();
            return;
        }
        if((JxlQuadTree._ot > this._my) && (JxlQuadTree._ob < this._b))
        {
            if(this._se == null)
                this._se = new JxlQuadTree(this._mx,this._my,this._hw,this._hh,this);
            this._se.addObject();
            return;
        }
    }

    //If it wasn't completely contained we have to check out the partial overlaps
    if((JxlQuadTree._or > this._l) && (JxlQuadTree._ol < this._mx) && (JxlQuadTree._ob > this._t) && (JxlQuadTree._ot < this._my))
    {
        if(this._nw == null)
            this._nw = new JxlQuadTree(this._l,this._t,this._hw,this._hh,this);
        this._nw.addObject();
    }
    if((JxlQuadTree._or > this._mx) && (JxlQuadTree._ol < this._r) && (JxlQuadTree._ob > this._t) && (JxlQuadTree._ot < this._my))
    {
        if(this._ne == null)
            this._ne = new JxlQuadTree(this._mx,this._t,this._hw,this._hh,this);
        this._ne.addObject();
    }
    if((JxlQuadTree._or > this._mx) && (JxlQuadTree._ol < this._r) && (JxlQuadTree._ob > this._my) && (JxlQuadTree._ot < this._b))
    {
        if(this._se == null)
            this._se = new JxlQuadTree(this._mx,this._my,this._hw,this._hh,this);
        this._se.addObject();
    }
    if((JxlQuadTree._or > this._l) && (JxlQuadTree._ol < this._mx) && (JxlQuadTree._ob > this._my) && (JxlQuadTree._ot < this._b))
    {
        if(this._sw == null)
            this._sw = new JxlQuadTree(this._l,this._my,this._hw,this._hh,this);
        this._sw.addObject();
    }
}
JxlQuadTree.prototype.addToList = function() {
    var ot;
    if(JxlQuadTree._oa == JxlQuadTree.A_LIST)
    {
        if(this._tailA.object != null)
        {
            ot = this._tailA;
            this._tailA = new JxlList();
            ot.next = this._tailA;
        }
        this._tailA.object =JxlQuadTree._o;
    }
    else
    {
        if(this._tailB.object != null)
        {
            ot = this._tailB;
            this._tailB = new JxlList();
            ot.next = this._tailB;
        }
        this._tailB.object =JxlQuadTree._o;
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
}
JxlQuadTree.prototype.overlap = function(BothLists, Callback) {
    BothLists = (BothLists === undefined) ? true : BothLists;
    Callback = (Callback === undefined) ? null : Callback;

   JxlQuadTree._oc = Callback;
    var c = false;
    var itr;
    if(BothLists)
    {
        //An A-B list comparison
       JxlQuadTree._oa = JxlQuadTree.B_LIST;
        if(this._headA.object != null)
        {
            itr = this._headA;
            while(itr != null)
            {
                JxlQuadTree._o = itr.object;
                if(JxlQuadTree._o.exists &&JxlQuadTree._o.solid && this.overlapNode())
                    c = true;
                itr = itr.next;
            }
        }
       JxlQuadTree._oa = JxlQuadTree.A_LIST;
        if(this._headB.object != null)
        {
            itr = this._headB;
            while(itr != null)
            {
                JxlQuadTree._o = itr.object;
                if(JxlQuadTree._o.exists &&JxlQuadTree._o.solid)
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
                JxlQuadTree._o = itr.object;
                if(JxlQuadTree._o.exists &&JxlQuadTree._o.solid && this.overlapNode(itr.next))
                    c = true;
                itr = itr.next;
            }
        }
    }

    //Advance through the tree by calling overlap on each child
    if((this._nw != null) && this._nw.overlap(BothLists,JxlQuadTree._oc))
        c = true;
    if((this._ne != null) && this._ne.overlap(BothLists,JxlQuadTree._oc))
        c = true;
    if((this._se != null) && this._se.overlap(BothLists,JxlQuadTree._oc))
        c = true;
    if((this._sw != null) && this._sw.overlap(BothLists,JxlQuadTree._oc))
        c = true;

    return c;
}
JxlQuadTree.prototype.overlapNode = function(Iterator) {
    Iterator = (Iterator === undefined) ? null : Iterator;

    //member list setup
    var c = false;
    var co;
    var itr = Iterator;
    if(itr == null)
    {
        if(this._oa == JxlQuadTree.A_LIST)
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
            if( (JxlQuadTree._o === co) || !co.exists || !JxlQuadTree._o.exists || !co.solid || !JxlQuadTree._o.solid ||
                (JxlQuadTree._o.x +JxlQuadTree._o.width  < co.x + JxlU.roundingError) ||
                (JxlQuadTree._o.x + JxlU.roundingError > co.x + co.width) ||
                (JxlQuadTree._o.y +JxlQuadTree._o.height < co.y + JxlU.roundingError) ||
                (JxlQuadTree._o.y + JxlU.roundingError > co.y + co.height) )
            {
                itr = itr.next;
                continue;
            }
            if(JxlQuadTree._oc == null)
            {
               JxlQuadTree._o.kill();
                co.kill();
                c = true;
            }
            else if(JxlQuadTree._oc(JxlQuadTree._o,co))
                c = true;
            itr = itr.next;
        }
    }
    return c;
}
function AudioManager(game) {
    this.game = game;
    this.sounds = {};
    this.channels = [];
    for(var i=0;i<16;i++) {
        this.channels[i] = new Audio();
        this.channels[i].dead = true;
    }
}
AudioManager.prototype.play = function(name, loop, start, finish, volume) {
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
}
AudioManager.prototype.unpause = function () {
    for(var i in this.channels) {
        if(!this.channels[i].dead) this.channels[i].play();
    }
}
AudioManager.prototype.pause = function() {
    for(var i in this.channels) {
        this.channels[i].pause();
    }
}
AudioManager.prototype.update = function(time) {
    for(var i in this.channels) {
        if(!this.channels[i].paused && this.channels[i].currentTime >= this.channels[i].finish) {
            if(this.channels[i].loop) {
                this.channels[i].currentTime = this.channels[i].start;
            } else {
                this.channels[i].dead = true;
                this.channels[i].pause();
            }
        }
    }
}
AudioManager.prototype.add = function(name, audio) {
    this.sounds[name] = audio;
}
function AssetManager(game) {
    this.game = game;
    this.assets = {};
    this.batches = [];
  }
AssetManager.prototype.get = function(name) {
    return this.assets[name];
}
AssetManager.prototype.loadCheck = function(batch, name) {
    this.batches[batch][name].completed = true;
    this.batches[batch].count--;
    if(this.batches[batch].count == 0) return true;
}
AssetManager.prototype.reload = function(type) {
    for(var i in this.assets) {
        if($(assets[i]).data('type') == type) {
            $(assets[i]).trigger('load');
        } else {
            
        }
    }
}
AssetManager.prototype.load = function(assets, callback, progress){
  var self = this;
  var batch = this.batches.length;
  this.batches.push(assets);
  this.batches[batch].count = -1;
  for(var x in assets) {
    this.batches[batch].count++;
  }
  for(var i in assets) {
      this.loadAsset(assets[i][0], i, assets[i][1], function(item) {
        if(self.loadCheck(batch, $(item).data('name'))) {
            if(callback) callback();
        } else {
            if(progress) progress();
        }
      }, batch);
  }
}
AssetManager.prototype.loadAsset = function(type, name, src, callback, batch) {
  var self = this;
  if(name in this.assets) {
    if(callback) callback();
    return;
  }
  switch(type) {
    case 'audio':
    case 'sound':
        var temp = new Audio(src);
        temp.src = src;
        temp.load();
        $(temp).data('name',name);
        $(temp).data('batch', batch);
        $(temp).data('type', 'audio');
        this.assets[name] = temp;
        self.game.audio.add(name, temp);
        
        
        if(callback) callback(temp);
    
        break;
    case 'image':
        var temp = $('<img/>')[0];
        temp.src = src;
        $(temp).data('batch', batch);
        $(temp).data('type','image');
        $(temp).data('name',name);
        this.assets[name] = temp;
        $(temp).load(function() {
            var can = $('<canvas/>')[0];
            can.width = this.width;
            can.height = this.height;
            var ctx = can.getContext('2d');
            ctx.drawImage(this, 0, 0);
            var id = ctx.getImageData(0, 0, this.width, this.height);
            var nd = ctx.createImageData(this.width*self.game.scale, this.height*self.game.scale);
            
            for(var x=0; x < this.width*self.game.scale; x++) {
                for(var y=0; y < this.height*self.game.scale; y++){
                    var i = (Math.floor((y/self.game.scale))*this.width+Math.floor(x/self.game.scale))*4;
                    var ni = (y*this.width*self.game.scale+x)*4;
                    nd.data[ni] = id.data[i];
                    nd.data[ni+1] = id.data[i+1];
                    nd.data[ni+2] = id.data[i+2];
                    nd.data[ni+3] = id.data[i+3];
                }
            }
            can.width = this.width*self.game.scale;
            can.height = this.height*self.game.scale;
            ctx.clearRect(0,0,can.width,can.height);
            ctx.putImageData(nd, 0, 0);
            this.scaled = can;
            this.scaledCTX = ctx;
            this.rotations = {};
            if(callback) callback(this);
        });
    break;
  }
}
