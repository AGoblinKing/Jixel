var connect = require('connect');
    
var server = connect.createServer();
server.use(connect.static(__dirname+'/'));
server.listen(404);
