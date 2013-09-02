module.exports = function(grunt) {

  grunt.registerTask("ghp-import", function() {
    var path = require('path');
    var spawn = require('child_process').spawn;
    var done = this.async();

    var cmd = path.join(__dirname, '../lib/tools/ghp-import.py');
    var options = {
      stdio: 'inherit'
    };
    spawn(cmd, ['_site', '-p'], options)
      .on('close', function() {
        done();
      });
  });
};