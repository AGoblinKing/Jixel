def('GameState', {
    extend: Jxl.State,
    init: function() {
        Jxl.State.prototype.init.call(this);
        this.player = new Cat(Jxl.am.get('animals'), 50, -50);
        this.tiles = new Jxl.TileMap({y:100}).loadMap("0,5,3,4,2,1,9,2", Jxl.am.get('tiles'), 16, 16);
        this.add(this.tiles);
        this.add(this.player);
        this.add(new Cloud(0,0));
        Jxl.follow(this.player);
    },
    update: function() {
        Jxl.State.prototype.update.call(this);
        this.collide();
    }
});