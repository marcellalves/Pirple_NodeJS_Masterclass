var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res) {
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    req.on('data', function() {});

    req.on('end', function() {
        var chosenHandler = typeof(router[trimmedPath]) != 'undefined' ? router[trimmedPath] : handlers.notFound;

        chosenHandler(function(statusCode, payload) {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            var payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
});

server.listen(3000, function() {
    console.log('Application is listening on port 3000');
});

var handlers = {};

handlers.hello = function(callback) {
    callback(200, { 'message': 'hello, world!' });
}

handlers.notFound = function(callback) {
    callback(404);
}

var router = {
    'hello': handlers.hello
}