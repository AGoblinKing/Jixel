var connect = require('connect');
var pkg = ['jixel', 'ui', 'object', 'group', 'state', 'sprite', 'tilemap', 'audio', 'assetmanager', 'util'];

var server = connect.createServer();
server.use(connect.static(__dirname+'/'));
server.use(connect.router(function(app) {
    app.get('/jixel.js', function(req, res, next) {
        res.end(pack(pkg, __dirname+'/Jixel/'));
    });
}));
server.listen(80);

var fs = require('fs');
function pack(obj, basedir) {
    var rs = '';
    obj.forEach(function(obj, key) {
        rs += fs.readFileSync(basedir+obj+'.js');
    });
    fs.writeFile(__dirname+'/jixel.js', rs);
    return rs;
}
