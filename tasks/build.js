module.exports = function(grunt) {

  // Replace @VERSION tokens to real values
  grunt.registerTask("post-concat", function() {
    var filepath = "dist/sea-debug.js";
    var version = grunt.config("pkg.version");

    var code = grunt.file.read(filepath);
    code = code.replace(/@VERSION/g, version);
    grunt.file.write(filepath, code);

    grunt.log.writeln('"@VERSION" is replaced to "' + version + '".');
  });

  // Fix sourceMap after compressing
  grunt.registerTask("post-uglify", "Fix sourceMap etc.", function() {
    var mapfile = "dist/sea.js.map";

    var code = grunt.file.read(mapfile);
    code = code.replace('"file":"dist/sea.js"', '"file":"sea.js"');
    code = code.replace("dist/sea-debug.js", "sea-debug.js");
    grunt.file.write(mapfile, code);
    grunt.log.writeln('"' + mapfile + '" is fixed.');

    var minfile = "dist/sea.js";
    code = grunt.file.read(minfile);
    code = code.replace(/\/\*\n\/\/@ sourceMappingURL=sea\.js\.map\n\*\//, "");
    grunt.file.write(minfile, code);
    grunt.log.writeln('"' + minfile + '" is fixed.');
  });

  grunt.registerTask("size", "Get file size", function() {
    var path = require('path');
    var exec = require('child_process').exec;
    var cmd = path.join(__dirname, '../lib/size.sh') + ' sea';
    var done = this.async();
    exec(cmd, {
      cwd: path.resolve('.'),
    }, function (error, stdout, stderr) {
      grunt.log.writeln(stdout);
      done();
    });
  });
};