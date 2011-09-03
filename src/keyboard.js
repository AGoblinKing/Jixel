def('Jxl.Keyboard', {
    init: function() {
        var self = this;
        window.addEventListener('keydown', function(e) {
            self.keys[String.fromCharCode(e.keyCode)] = true;
            self.keys[e.keyCode] = true;
            if(!(e.keyCode in self.pressed)) {
                self.pressed[String.fromCharCode(e.keyCode)] = true;
                self.pressed[e.keyCode] = true;
            }   
        }, true);
        window.addEventListener('keyup', function(e) {
            delete self.keys[e.keyCode];
            delete self.keys[String.fromCharCode(e.keyCode)];
            delete self.pressed[String.fromCharCode(e.keyCode)];
            delete self.pressed[e.keyCode];
        }, true);

        document.body.addEventListener('touchstart', function(e) {
            self.touch = true;
            self.touchPress = true;
            e.preventDefault();
        });
        document.body.addEventListener('touchstop', function(e) {
            self.touch = false;
            e.preventDefault();
        });
        
    },
    touch: false,
    touchPress: false,
    pressed: {},
    keys: {},
    on: function(key) {
        return this.keys[key];
    },
    press: function(key) {
        return this.pressed[key];
    },
    update: function() {
        var self = this;
        _(this.pressed).each(function(val, key) {
            self.pressed[key] = false; 
        });
        self.touchPress = false;
    }
});