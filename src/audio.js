def('Jxl.Audio', {
    init: function() {
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