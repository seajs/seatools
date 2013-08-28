var path = require('path');
var grunt = require('grunt');

// invoke grunt task in ../Gruntfile.js
exports.invoke = function(name, options) {
  grunt.option.init(options);
  var fn = require(path.join(__dirname, '../Gruntfile'));
  fn.call(grunt, grunt);
  if (grunt.task._tasks[name]) {
    var task = grunt.task;
    var fail = grunt.fail;
  
    var uncaughtHandler = function(e) {
      fail.fatal(e, fail.code.TASK_FAILURE);
    };
    process.on('uncaughtException', uncaughtHandler);

    task.options({
      error: function(e) {
        fail.warn(e, fail.code.TASK_FAILURE);
      },
      done: function() {
        process.removeListener('uncaughtException', uncaughtHandler);
        fail.report();
        process.exit(0);
      }
    });
    task.run(name);
    task.start();
  }
};