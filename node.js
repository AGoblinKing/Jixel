var connect = require('connect'),
    jsp = require('./node_modules/uglify-js/lib/parse-js'),
    pro = require('./node_modules/uglify-js/lib/process');
    
var pkg = ['jixel', 'ui', 'object', 'group', 'state', 'sprite', 'tilemap', 'audio', 'assetmanager', 'util'];

var server = connect.createServer();
server.use(connect.router(function(app) {
    app.get('/jixel.js', function(req, res, next) {
        res.end(pack(pkg, __dirname+'/Jixel/'));
    });
}));
server.use(connect.static(__dirname+'/'));

server.listen(80);

var fs = require('fs');
function pack(obj, basedir) {
    var rs = '';
    obj.forEach(function(obj, key) {
        rs += fs.readFileSync(basedir+obj+'.js');
    });
    fs.writeFile(__dirname+'/jixel.js', rs);
    /*
    var ast = jsp.parse(rs);
    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
    fs.writeFile(__dirname+'/jixel.compressed.js', pro.gen_code(ast));*/
    return rs;
}
