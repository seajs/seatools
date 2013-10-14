var fs = require('fs');
var http = require('http');
var path = require('path');
var print = require('util').print;
var spawn = require('child_process').spawn;
var Static = require('node-static');

module.exports = function(grunt) {
  // 在每个 js 尾部添加 seajs.use 保证插件马上执行
  grunt.registerTask("totoro", function() {
    var adapter = path.join('./_site/tests', 'totoro-adapter.js');
    copy(
      path.join(__dirname, '../lib/tools/totoro-adapter.js'),
      adapter
    );

    var Client = require('totoro');
    var report = require('totoro/lib/report');
    var done = this.async();
    new Client({
      adapter: adapter,
      runner: path.resolve('_site/tests/runner.html'),
      report: function() {
        report.apply(null, arguments);
        done();
      }
    });
  });

  grunt.registerTask("local", function() {
    var done = this.async();
    var runner = spawn('phantomjs', [path.join(__dirname, '../lib/tools/phantom.js'), '_site/tests/runner.html?console']);
    runner.stdout.on('data', function(data) {
      printResult(data.valueOf());
    });
    runner.on('close', function() {
      done();
    });
  });

  grunt.registerTask("http", function() {
    var done = this.async();
    createServer('_site/tests/runner.html?console', function(code) {
      printResult(' code is ' + code);
      done();
    });
  });
};

function copy(src, dest) {
  if (fs.existsSync(src)) {
    var readStream = fs.createReadStream(src);
    var writeStream = fs.createWriteStream(dest);
    readStream.pipe(writeStream);
  }
}

function createServer(filepath, callback, port) {
  port = parseInt(port || 9012, 10);
  var fileServer = new Static.Server(fs.realpathSync('.'));

  var server = http.createServer(function(request, response) {
    request.addListener('end',function() {
      fileServer.serve(request, response);
    }).resume();
  });

  server.listen(port, function() {
    var page = 'http://127.0.0.1:' + port + '/' + filepath;
    var runner = spawn('phantomjs', [path.join(__dirname, '../lib/tools/phantom.js'), page]);

    runner.stdout.on('data', function(data) {
      printResult(data.valueOf());
    });

    runner.on('exit', function(code) {
      if (code === 127) {
        print('phantomjs not available');
      }
      server.close();
      callback(code);
    });
  });
}

function printResult(value) {
  var prefix = '         result:';
  value = value.toString()
    .split(/\n/)
    .map(function(item) {
      if (item) {
        return prefix + item;
      } else {
        return item;
      }
    })
    .join('\n');
  print(value);
}
