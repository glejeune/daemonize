var daemon = require('./daemonize').daemon();
var http = require('http');

// Configuration
daemon.config = {
  pidFile: "./toto.pid",
  closeIO: true
}

// Daemonize
var pid = daemon.daemonize();

// Start HTTP Server
http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<h1>Hello, World!</h1>');
  res.close();
}).listen(8000);
