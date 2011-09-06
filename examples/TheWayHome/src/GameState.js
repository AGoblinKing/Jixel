def('TWH.GameState', {
    extend: Jxl.State,
    init: function() {
        Jxl.State.prototype.init.call(this);
        this.map = new Jxl.TileMap({
            mapData: Jxl.am.get('map'), 
            tileGraphic: Jxl.am.get('tiles'), 
            collideIndex: 2,
            noCollide: {5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: true, 12: true, 13: true}
        });
        this.drawClouds(15);
        this.player = new TWH.Cat(Jxl.am.get('animals'), 0, 272);
        this.add(this.map);
        this.add(this.player);
        Jxl.followLead = new Jxl.Point({x:2, y:2});
        Jxl.follow(this.player);
    },
    drawClouds: function(num) {
        for(var n=0;n<num;n++) {
            this.add(new TWH.Cloud(Math.random()*this.map.width, Jxl.Util.range(-200, 200)));
        }
    },
    update: function() {
        Jxl.State.prototype.update.call(this);
        Jxl.Util.collide(this.player, this.map);
    }
});
