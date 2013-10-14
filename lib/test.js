var fs = require('fs');
var http = require('http');
var path = require('path');
var print = require('util').print;
var spawn = require('child_process').spawn;
var Static = require('node-static');

exports.runTotoro = function() {
  // copy totoro adapter to _site/tests
  // https://github.com/seajs/seatools/issues/3
  var adapter = path.join('./_site/tests', 'totoro-adapter.js');
  copy(
    path.join(__dirname, 'tools', 'totoro-adapter.js'),
    adapter
  );
  var Client = require('totoro');
  new Client({
    adapter: adapter,
    runner: path.resolve('_site/tests/runner.html')
  });
};

exports.runLocal = function() {
  var runner = spawn('phantomjs', [path.join(__dirname, 'tools', 'phantom.js'), '_site/tests/runner.html?console']);
  runner.stdout.on('data', function(data) {
    print(data.valueOf());
  });
};

exports.runHttp = function() {
  createServer('_site/tests/runner.html?console');
};

function copy(src, dest) {
  if (fs.existsSync(src)) {
    var readStream = fs.createReadStream(src);
    var writeStream = fs.createWriteStream(dest);
    readStream.pipe(writeStream);
  }
}

function createServer(filepath, port) {
  port = parseInt(port || 9012, 10);
  var fileServer = new Static.Server(fs.realpathSync('.'));

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
