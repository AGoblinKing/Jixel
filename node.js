var connect = require('connect'),
    jsp = require('./node_modules/uglify-js/lib/parse-js'),
    pro = require('./node_modules/uglify-js/lib/process');

var libpkg = ['underscore', 'def', 'RAF'];
var pkg = ['jixel', 'object', 'group', 'state', 'sprite', 'tilemap', 'audio', 'assetmanager', 'util', 'emitter', 'mouse', 'keyboard'];

var server = connect.createServer();
server.use(connect.router(function(app) {
    app.get('/jixel.js', function(req, res, next) {
        var rs = pack(libpkg, __dirname +'/lib/')+pack(pkg, __dirname + '/src/');
        res.end(rs);
        fs.writeFile(__dirname + '/jixel.js', rs);
        var ast = jsp.parse(rs);
        ast = pro.ast_mangle(ast);
        ast = pro.ast_squeeze(ast);
        fs.writeFile(__dirname + '/jixel.compressed.js', pro.gen_code(ast));
    });
}));
server.use(connect.static(__dirname + '/'));

var port = process.env.C9_PORT != undefined ? process.env.C9_PORT : '8080';
server.listen(port);

var fs = require('fs');

function pack(obj, basedir) {
    var rs = '';
    obj.forEach(function(obj, key) {
        rs += '\r\n'+fs.readFileSync(basedir + obj + '.js');
    });
    return rs;
}
