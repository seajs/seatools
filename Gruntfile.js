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
    },

    copy: {
      seajs: {
        expand: true,
        cwd: './',
        src: [
          'dist/**/*',
          'src/**/*',
          'tests/**/*',
          'examples/**/*'
        ],
        dest: '_site/'
      },

      template: {
        expand: true,
        cwd: path.join(__dirname, 'lib', 'template'),
        src: '**/*',
        dest: '_site/tests/'
      }
    },

    clean: {
      site: '_site/'
    }
  });

  loadTasks('grunt-contrib-concat');
  loadTasks('grunt-contrib-uglify');
  loadTasks('grunt-contrib-copy');
  loadTasks('grunt-contrib-clean');
  grunt.loadTasks(path.join(__dirname, 'tasks'));

  grunt.registerTask('build', ['concat', 'post-concat', 'uglify', 'post-uglify', 'size']);
  grunt.registerTask('test', ['totoro']);
  grunt.registerTask('site', ['clean:site', 'copy:seajs', 'copy:template']);

  function loadTasks(name) {
    var task = path.join(__dirname, 'node_modules', name, 'tasks');
    grunt.loadTasks(task);
  }
};
