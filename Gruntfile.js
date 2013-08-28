module.exports = function(grunt) {
  var path = require('path');
  var src = [
    'index.html',
    'docs/**/*',
    'dist/**/*',
    'src/**/*',
    'tests/**/*',
    'examples/**/*'
  ];

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
          banner: '/*! Sea.js <%= pkg.version %> | seajs.org/LICENSE.md */\n',
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
        src: src,
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
    },

    connect: {
      server: {
        options: {
          port: 8000,
          base: '_site',
          middleware: function(connect, options) {
            return [
              require('connect-livereload')(),
              connect.static(options.base),
              connect.directory(options.base)
            ];
          }
        }
      }
    },

    watch: {
      options: {
        spawn: false
      },
      template: {
        files: src,
        tasks: ['copy'],
        options: {
          livereload: true
        }
      }
    }
  });

  loadSubTasks('grunt-contrib-concat');
  loadSubTasks('grunt-contrib-uglify');
  loadSubTasks('grunt-contrib-copy');
  loadSubTasks('grunt-contrib-clean');
  loadSubTasks('grunt-contrib-watch');
  loadSubTasks('grunt-contrib-connect');
  grunt.loadTasks(path.join(__dirname, 'tasks'));

  grunt.registerTask('build', ['concat', 'post-concat', 'uglify', 'post-uglify', 'size']);
  grunt.registerTask('test', ['totoro']);
  grunt.registerTask('site', ['clean:site', 'copy']);
  grunt.registerTask('site-watch', ['site', 'connect', 'watch']);

  function loadSubTasks(name) {
    var task = path.join(__dirname, 'node_modules', name, 'tasks');
    grunt.loadTasks(task);
  }
};
