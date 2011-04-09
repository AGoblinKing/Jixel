var game, am;
var mapData =
"2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2\n"+
"2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2";

window.addEvent('domready', function() {
    var can = document.createElement('canvas');
    can.getContext('2d')
    game = new Jixel(can);
    game._width(640);
    game._height(480);
    am = game.am;
    var assets = {
                  'tiles':['image', 'assets/tilemap.png'],
                  'animals':['image', 'assets/animals.png']
                };
    am.load(assets, function() {
        game.state = new GameState();
        game.start();
        game.showFPS();
        $$('body').grab(can);
    });
});
var GameState = new Class({
    Extends: JxlState,
    initialize: function() {
        this.parent();
        this.map = new JxlTileMap(0,0).loadMap(game, mapData, am.get('tiles'));
        this.map.collideIndex = 2;
        this.add(this.map);
        this.player = new Cat(am.get('animals'), 50, 150);
        this.add(this.player);
        game.follow(this.player);
    }
});
var Cat = new Class({
    Extends: JxlSprite,
    initialize: function(graphic, x, y) {
        this.parent(graphic, x, y, 32, 32);
        this.addAnimation('run', [72,73,74,73], .30);
        this.addAnimation('idle', [48,49,50,49], .50);
        this.play('idle');
        this.speed = -80;
        this.drag = new JxlPoint(150,150);
        this.acceleration.y = 500;
    },
    update: function(game, time) {
        if ('A' in game.keys) {
          this.velocity.x = this.speed;
          this._flipped = true;
          this.play('run');
        } else if ('D' in game.keys) {
          this._flipped = false;
          this.play('run');
          this.velocity.x = -1*this.speed;
        } else {
          this.play('idle');
        }
        if('SPACE' in game.keys && this.onFloor) {
          game.audio.play('jump');
   
          this.velocity.y = -150;
        } 
        
        this.parent(game, time);
        
        jxlU.collide(game.state.map, this);
    }
});
      