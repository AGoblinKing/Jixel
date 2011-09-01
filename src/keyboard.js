def('Jxl.Keyboard', {
    init: function() {
        var self = this;
        window.addEventListener('keydown', function(e) {
            self.keys[String.fromCharCode(e.keyCode)] = true;
            self.keys[e.keyCode] = true;
        }, true);
        window.addEventListener('keypress', function(e) {
            self.pressed[String.fromCharCode(e.keyCode)] = true;
            self.pressed[e.keyCode] = true;
        }, true);
        window.addEventListener('keyup', function(e) {
            delete self.keys[e.keyCode];
            delete self.keys[String.fromCharCode(e.keyCode)];
        }, true);
    },
    pressed: {},
    keys: {},
    on: function(key) {
        return key in this.keys;
    },
    press: function(key) {
        return key in this.pressed;
    },
    update: function() {
        this.pressed = {};
    }
});