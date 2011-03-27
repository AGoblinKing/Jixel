var AssetManager = new Class({
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

Jxl.loader = new AssetManager();