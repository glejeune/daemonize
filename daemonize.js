var fs = require('fs');
var sys = require('sys');
var daemonize = require("./build/default/daemonize");
var restart = false;

var Daemonize = function() {
  this.config = {
    pidFile: "daemonize.pid",
    closeIO: true
  }
}

Daemonize.prototype.start = function() {
  try {
    var pid = parseInt(fs.readFileSync(this.config.pidFile));
    sys.puts("Daemon already started! (PID: #"+pid+")")
    sys.puts("If you are sure that I'm mistaken, please remove the file "+this.config.pidFile)
    process.exit(0);
  }
  catch(e) {}
  
  var pid = daemonize.start(this.config.pidFile);
  if( pid > 0 ) {
    sys.puts("Start process with PID #" + pid);
    if( this.closeIO == true ) {
      daemonize.closeIO();
    }
    return pid;
  } else {
    sys.puts("Daemonize process faild!");
  }
}

Daemonize.prototype.stop = function() {
  try {
    process.kill(parseInt(fs.readFileSync(this.config.pidFile)));
    fs.unlinkSync(this.config.pidFile);
  }
  catch(e) {
    sys.puts(e)
    sys.puts("Daemon is not running! In fact, I did not find the PID file!");
  }
  
  if(restart == false) {
    process.exit(0);
  }
}

Daemonize.prototype.status = function() {
  try {
    var pid = parseInt(fs.readFileSync(this.config.pidFile));
    sys.puts("Daemon is running! (PID: #"+pid+")");
  }
  catch(e) {
    sys.puts("Daemon is not running!");
  }
  process.exit(0);  
}

Daemonize.prototype.daemonize = function() {
  var args = process.argv;
  var pid;

  // Handle start stop commands
  switch(args[2]) {
    case "stop":
      this.stop();
      break;

    case "start":
      pid = this.start();
      break;
  
    case "restart":
      restart = true;
      this.stop();
      this.start();
      restart = false;
      break;

    case "status":
      this.status();
      break;

    case "console":
      break;

    default:
      sys.puts('Usage: [start|stop|restart|console]');
      process.exit(0);
  }
  
  return pid;
}

exports.daemon = function() {
  var d = new Daemonize();
  return d;
}