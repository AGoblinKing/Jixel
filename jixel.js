Function.prototype.Inherits = function (fnSuper)
{
    var prop;

    if (this == fnSuper)
        {
        alert("Error - cannot derive from self");
        return;
        }

    for (prop in fnSuper.prototype)
        {
        if (typeof(fnSuper.prototype[prop]) == "function" && !this.prototype[prop])
            {
            this.prototype[prop] = fnSuper.prototype[prop];
            }
        }

    this.prototype[fnSuper.StName()] = fnSuper;
}
Function.prototype.StName = function ()
{
    var st;

    st = this.toString();
    st = st.substring(st.indexOf(" ")+1, st.indexOf("("));
    if (st.charAt(0) == "(")
        st = "function ...";

    return st;
}
Function.prototype.Override = function (fnSuper, stMethod)
{
    this.prototype[fnSuper.StName() + "_" + stMethod] = fnSuper.prototype[stMethod];
}

var objID = 0;
var jxlU = new JxlU();
/*** Game Objects ***/
function Jixel(canvas) {
    /*** Setup Core ***/
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
    console.log(this.width >> 1);
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
                self.update((curTime - self.lastUpdate)/1000);
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
function JxlObject(x, y, width, height) {
    this._point = new JxlPoint(); // preallocated point ... not sure if want
    this.id = objID;
    objID++;
    if(x == undefined) {
        this.x = 0;
        this.y = 0;
    } else {
        this.x = x;
        this.y = y;
    }
    this.width = width;
    this.height = height;
    this.mass = 1;
    this.visible = true;
    this.scrollFactor = new JxlPoint(1, 1);
}
//Override Me.
JxlObject.prototype.update = function() {}
JxlObject.prototype.render = function() {}
JxlObject.prototype.getScreenXY = function(game, point) {
    if(point == undefined) point = new JxlPoint();
    point.x = Math.floor(this.x+jxlU.roundingError)+Math.floor(game.scroll.x*this.scrollFactor.x);
    point.y = Math.floor(this.y+jxlU.roundingError)+Math.floor(game.scroll.y*this.scrollFactor.y);
    return point;
}

JxlSprite.Inherits(JxlObject);
function JxlSprite(asset, x, y, width, height) {
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
    this.updateAnimation(game, time);
}
JxlSprite.prototype.move = function(time, distance) {
    this.x += distance[0]*time;
    this.y += distance[1]*time;
}
JxlSprite.prototype.getScreenXY = function(game, point) {
    if(point == undefined) point = new JxlPoint();
    point.x = Math.floor(this.x+jxlU.roundingError)+Math.floor(game.scroll.x*this.scrollFactor.x) - this.offset.x;
    point.y = Math.floor(this.y+jxlU.roundingError)+Math.floor(game.scroll.y*this.scrollFactor.y) - this.offset.y;
    return point;
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
function JxlTileMap(x, y) {
    this.JxlObject(x, y);
    this.widthInTiles = 0;
    this.heightInTiles = 0;
    this._data;
    this.drawIndex = 1;
    this.startingIndex = 0;
    this._pixels;
    this.auto = 0;
    this._block = new JxlObject();
    this.tileGraphic;
    
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
    totalTiles = this.widthInTiles*this.heightInTiles;
    //Do AutoTile later
    if(this.auto > 0) {
        
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
    
    this._rects = new Array(totalTiles);
    for(i=0; i < totalTiles; i++)
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

function JxlPoint(x, y){
    if(x == undefined) x = 0;
    if(y == undefined) y = 0;
    
    this.x = x;
    this.y = y;
}

/*** Universe ***/
function JxlU() {
    this.roundingError = 0.0000001;
    this.quadTreeDivisions = 3;
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
/*** Utilities ***/
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
