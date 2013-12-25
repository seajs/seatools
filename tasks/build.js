var util = require('util');

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

  grunt.registerMultiTask("build-plugin", "Build-plugin", function() {
    var options = this.options({
      idleading: '',
      filename: ''
    });

    this.files.forEach(function(file) {
      var code = file.src.map(function(item) {
        if (/\.css$/.test(item)) {
          return css2js(grunt.file.read(item));
        } else if (/\.js$/.test(item)) {
          return grunt.file.read(item);
        } else {
          return '';
        }
      }).join('\n');

      var filename = options.filename;
      var idleading = options.idleading ? options.idleading + '/' : '';
      var id = idleading + filename;

      grunt.file.write('.build/tmp/' + filename + '.js', wrap(code, id));
      grunt.file.write('.build/dist/' + filename + '-debug.js', wrap(code, id, true));
    });
  });
};

function wrap(code, id, debug) {
  if (debug) {
    id = id + '-debug';
  }
  return util.format('(function(){\n%s\ndefine("%s", [], {});\n})();', code, id);
}

function css2js(code) {
  code = code.replace(/\"/g, '\'').replace(/\n/g, '');
  return 'seajs.importStyle("' + code + '");';
}