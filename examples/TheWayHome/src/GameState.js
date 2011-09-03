def('GameState', {
    extend: Jxl.State,
    init: function() {
        Jxl.State.prototype.init.call(this);
        this.player = new Cat(Jxl.am.get('animals'), 50, -50);
        this.tiles = new Jxl.TileMap({y:100}).loadMap("0,5,3,4,2,1,9,2", Jxl.am.get('tiles'), 16, 16);
        this.add(this.tiles);
        this.exploder = new Jxl.Emitter();
        this.exploder.createSprites(Jxl.am.get('tiles'), 5, new Jxl.Point({x:16, y:16}), true, true); 
        this.add(this.exploder);
        this.add(this.player);
        this.add(new Cloud(0,0));
        Jxl.audio.play('keyboard', true, .5);
        Jxl.follow(this.player);
    },
    explode: function(obj) {
        this.exploder.x = obj.x;
        this.exploder.y = obj.y;
        this.exploder.start();
    },
    update: function() {
        Jxl.State.prototype.update.call(this);
        this.player.collide(this.tiles);
        this.exploder.collide(this.tiles);
        
    }
});