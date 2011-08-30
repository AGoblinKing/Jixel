def('Jxl.AssetManager', {
    init: function() {
        this.assets = {};
	    this.batches = [];
    },
    alias: 'Jxl.am',
    singleton: true,
    get: function(name) {
        return this.assets[name];
    },
    reload: function(callback) {
    	var self = this;
    	var ln = this.batches.length, ct = 0;
    	_(this.batches).each(function(batch) {
    	    self.load(batch, function() {
        		ct++;
        		if(callback != undefined && ln == ct) callback();
    	    });
    	});
    },
    load: function(assets, callback, progress) {
    	this.batches.push(assets);
    	var self = this;
    	var ln = _(assets).values().length, ct = 0;
        _(assets).each(function(val, key) {
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
            Jxl.Audio.add(name, temp);
            if(callback) callback(temp);
            break;
        case 'image':
            var temp = document.createElement('img');
            temp.src = src;
            this.assets[name] = temp;
            temp.onload = function() {
                var can = document.createElement('canvas');
                can.width = this.width;
                can.height = this.height;
                var ctx = can.getContext('2d');
                ctx.drawImage(this, 0, 0);
                if(callback) callback(can);
            };
        break;
      }
    }
});