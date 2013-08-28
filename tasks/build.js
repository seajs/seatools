module.exports = function(grunt) {

  grunt.registerTask("post-concat", function() {
    var filepath = "dist/sea-debug.js";
    var version = grunt.config("pkg.version");

    var code = grunt.file.read(filepath);
    code = code.replace(/@VERSION/g, version);
    grunt.file.write(filepath, code);

    grunt.log.writeln('"@VERSION" is replaced to "' + version + '".');
  });

  grunt.registerTask("post-uglify", "Fix sourceMap etc.", function() {
    var minfile = "dist/sea.js";
    var code = grunt.file.read(minfile) + "\n";
    grunt.file.write(minfile, code);

    grunt.log.writeln('File "' + minfile + '" fixed.');
  });

  grunt.registerTask("size", "Get file size", function() {
    var path = require('path');
    var exec = require('child_process').exec;
    var cmd = path.join(__dirname, '../lib/tools/size.sh') + ' sea';
    var done = this.async();
    exec(cmd, {
      cwd: path.resolve('.'),
    }, function (error, stdout, stderr) {
      grunt.log.writeln(stdout);
      done();
    });
  });
};