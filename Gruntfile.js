module.exports = function(grunt) {
  var path = require('path');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'src/intro.js',
          'src/sea.js',
          'src/util-lang.js',
          'src/util-events.js',
          'src/util-path.js',
          'src/util-request.js',
          'src/util-deps.js',
          'src/module.js',
          'src/config.js',
          'src/outro.js'
        ],
        dest: 'dist/sea-debug.js'
      }
    },

    uglify: {
      all: {
        files: {
          'dist/sea.js': ['dist/sea-debug.js']
        },
        options: {
          banner: '/*! Sea.js <%= pkg.version %> | seajs.org/LICENSE.md\n' +
              '//@ sourceMappingURL=sea.js.map\n*/\n',
          sourceMap: 'dist/sea.js.map',
          sourceMappingURL: 'sea.js.map',
          //report: 'gzip',
          compress: {
            unsafe: true,
            unused: false
          },
          mangle: {
          }
        }
      }
    }
  });

  // Load grunt tasks from NPM packages
  grunt.loadTasks(path.join(__dirname, 'tasks'));
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', ['concat', 'post-concat', 'uglify', 'post-uglify', 'size']);
};