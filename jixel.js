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
/*** Game Objects ***/
function Jixel(canvas) {
    this.canvas = canvas;
    this.scale = 4;
    this.ctx = canvas.getContext('2d');
    this.bufferCanvas = $('<canvas/>')[0];
    this.width(240);
    this.height(160);
   
    this.buffer = this.bufferCanvas.getContext('2d');
    this.gameObjects = {};
    this.refresh = 33;
    this.running = false;
    this.am = new AssetManager(this);
    this.fullScreen = false;
    this.keepResolution = false;
    
    this.date = new Date();
    this.keys = {};
    var self = this;
    
    $(canvas).blur(function() {
       this.running = false;
       $('<div/>').append('Paused Game').dialog();
    });
    $(document).keyup(function(e){
        delete self.keys[String.fromCharCode(e.keyCode)];
    });
    $(document).keydown(function(e){
        self.keys[String.fromCharCode(e.keyCode)] = true;
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
Jixel.prototype.width = function(width) {
    if(width != undefined) {
        this.bufferCanvas.width = width;
        this.screenWidth(width*this.scale);
    }
    return this.bufferCanvas.width; 
}
Jixel.prototype.height = function(height) {
    if(height != undefined) {
        this.bufferCanvas.height = height;
        this.screenHeight(height*this.scale);
    }
    return this.bufferCanvas.height;
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
                self.update(curTime - self.lastUpdate);
                self.lastUpdate = curTime;
            }
        }, this.refresh);
    }
}
Jixel.prototype.addObject = function(obj) {
    this.gameObjects[obj.id] = obj;
}
Jixel.prototype.destroyObject = function(obj) {
    delete this.gameObjects[obj.id];
}
Jixel.prototype.update = function(timeBetween) {
    // Do Updates
    for(var x in this.gameObjects) {
        this.gameObjects[x].update(this, timeBetween);
    }    
    // Now Draw
    this.ctx.clearRect(0,0, this.screenWidth(), this.screenHeight());
    //this.buffer.clearRect(0,0, this.width(), this.height());
   
    for(var x in this.gameObjects) {
        this.gameObjects[x].draw(this.ctx, this);
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
function GameObject(x, y, width, height) {
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
}
//Override Me.
GameObject.prototype.update = function() {}
GameObject.prototype.draw = function() {}

Sprite.Inherits(GameObject);
function Sprite(asset, x, y, width, height) {
    this.GameObject(x, y, width, height);
    this.asset = asset;
    if(width == undefined) {
        this.width = asset.width;
        this.height = asset.height;
    }
}
Sprite.prototype.draw = function(ctx, game){
    ctx.drawImage(this.asset.scaled, this.x*game.scale, this.y*game.scale);
}
Sprite.prototype.move = function(time, distance) {
    this.x += distance[0]/time;
    this.y += distance[1]/time;
}

TileMap.Inherits(GameObject);
function TileMap(x, y) {
    this.GameObject(x, y);
    this.widthInTiles = 0;
    this.heightInTiles = 0;
    this._data;
    this.drawIndex = 1;
    this.startingIndex = 0;
    this._pixels;
    this.auto = 0;
    this._block = new GameObject();
    this.tileGraphic;
    
}
TileMap.prototype.loadMap  = function(Game, MapData, TileGraphic, TileWidth, TileHeight) {
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
        
    this._screenRows = Math.ceil(game.height()/this._tileHeight)+1;
    if(this._screenRows > this.heightInTiles)
        this._screenRows = this.heightInTiles;
    this._screenCols = Math.ceil(game.width()/this._tileWidth)+1;
    if(this._screenCols > this.widthInTiles)
        this._screenCols = this.widthInTiles;
    
    return this;
}

TileMap.prototype.draw = function(ctx, game) {
    var _point = new GamePoint(0,0);
    var _flashPoint = new GamePoint(_point.x, _point.y);
    
    var tx = Math.floor(-_point.x/this._tileWidth);
    var ty = Math.floor(-_point.y/this._tileHeight);
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

TileMap.prototype.updateTile = function(index){
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

function GamePoint(x, y){
    this.x = x;
    this.y = y;
}

/*** Util ***/

/*** Utilities ***/
function AssetManager(game) {
    this.game = game;
    this.assets = {};
    this.batches = [];
  }
AssetManager.prototype.get = function(name) {
    return this.assets[name];
}
AssetManager.prototype.loadCheck = function(batch, name) {
    this.batches[batch].splice(name, 1);
    if(this.batches[batch].length == 0) return true;
}
AssetManager.prototype.load = function(assets, callback, progress){
  var self = this;
  var batch = this.batches.length; 
  this.batches.push(assets);
  for(var i in assets) {
      this.loadAsset(assets[i][0], assets[i][1], assets[i][2], function() {
        if(self.loadCheck(batch, $(this).data('name'))) {
            if(callback) callback();
        } else {
            if(progress) progress();
        }
      });
  }
}
AssetManager.prototype.loadAsset = function(type, name, attr, callback) {
  var self = this;
  if(name in this.assets) {
    if(callback) callback();
    return;
  }
  switch(type) {
    case 'sound':
        var temp = $('<audio/>')[0];
        temp.src = attr.src;
        $(temp).attr(attr);
        $(temp).attr('name',name);
        this.assets[name] = temp;
        if(callback) $(temp).load(callback);
        
        break;
    case 'image':
        var temp = $('<img/>')[0];
        temp.src = attr.src;
        $(temp).attr(attr);
        $(temp).attr('name',name);
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
            if(callback) callback();
        });
    break;
  }
}