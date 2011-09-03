var connect = require('connect'),
    jsp = require('./node_modules/uglify-js/lib/parse-js'),
    pro = require('./node_modules/uglify-js/lib/process');

var libpkg = ['underscore', 'def', 'RAF'];
var pkg = ['jixel', 'object', 'group', 'state', 'sprite', 'tilemap', 'audio', 'assetmanager', 'util', 'emitter', 'mouse', 'keyboard'];

var server = connect.createServer();
server.use(connect.router(function(app) {
    app.get('/jixel.js', function(req, res, next) {
        res.end(pack(libpkg, __dirname +'/lib/')+pack(pkg, __dirname + '/src/'));
    });
}));
server.use(connect.static(__dirname + '/'));

server.listen(process.env.C9_PORT);

var fs = require('fs');

function pack(obj, basedir) {
    var rs = '';
    obj.forEach(function(obj, key) {
        rs += '\r\n'+fs.readFileSync(basedir + obj + '.js');
    });
    fs.writeFile(__dirname + '/jixel.js', rs);
    /*
    var ast = jsp.parse(rs);
    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);
    fs.writeFile(__dirname + '/jixel.compressed.js', pro.gen_code(ast));*/
    return rs;
}