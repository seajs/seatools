var fs = require('fs');
var http = require('http');
var path = require('path');
var print = require('util').print;
var spawn = require('child_process').spawn;
var Static = require('node-static');

exports.runTotoro = function() {
  var Client = require('totoro').Client;
  new Client({
    adapter: path.join(__dirname, 'tools', 'totoro-adapter.js')
  });
};

exports.runLocal = function() {
  console.log('local')
};

exports.runHttp = function() {
  createServer('seajs/tests/runner.html?console');
};


function createServer(filepath, port) {
  port = parseInt(port || 9012, 10);
  var fileServer = new Static.Server(fs.realpathSync('../'));

  var server = http.createServer(function(request, response) {
    request.addListener('end',function() {
      fileServer.serve(request, response);
    }).resume();
  });

  server.listen(port, function() {
    var page = 'http://127.0.0.1:' + port + '/' + filepath;
    var runner = spawn('phantomjs', [path.join(__dirname, 'tools', 'phantom.js'), page]);

    runner.stdout.on('data', function(data) {
      print(data.valueOf());
    });

    runner.on('exit', function(code) {
      if (code === 127) {
        print('phantomjs not available');
      }
      server.close();
      process.exit(code);
    });
  });
}