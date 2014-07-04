
module.exports = function(grunt) {

  var path = require('path');
  var pkg = grunt.file.readJSON('package.json');
  var src = [
    'index.html',
    'docs/**/*',
    'dist/**/*',
    'src/**/*',
    'tests/**/*',
    'examples/**/*',
    'CNAME'
  ];

  var pluginSrc;
  if (pkg.config && pkg.config['plugin-concat']) {
    pluginSrc = pkg.config['plugin-concat'].map(function(item) {
      return 'src/' + item;
    });
  }

  grunt.initConfig({
    pkg: pkg,

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
          hostname: '*',
          base: '_site',
          'middleware': function(connect, options) {
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
        tasks: ['copy', 'meta'],
        options: {
          livereload: true
        }
      }
    },

    meta: {
      site: {},
      publish: {
        options: {
          isPublish: true
        }
      },
      test: {
        options: {
          isTest: true
        }
      }
    },

    "build-plugin": {
      options: {
        idleading: (pkg.family ? pkg.family : (pkg.name.indexOf('-') > 0 ? pkg.name.match(/([^-]+)-/)[1] : '')) + '/' + pkg.name + '/' + pkg.version,
        filename: pkg.name
      },
      plugin: {
        src: pluginSrc || []
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

  if (/^seajs-/.test(pkg.name)) {
    buildSeajsPlugin();
  } else {
    buildSeajs();
  }
  grunt.registerTask('site', ['clean:site', 'copy', 'meta:site']);
  grunt.registerTask('site-test', ['clean:site', 'copy', 'meta:test']);
  grunt.registerTask('site-watch', ['site', 'connect', 'watch']);
  grunt.registerTask('publish', ['clean:site', 'copy', 'meta:publish', 'ghp-import']);
  grunt.registerTask('test-totoro', ['site-test', 'totoro']);
  grunt.registerTask('test-local', ['site-test', 'local']);
  grunt.registerTask('test-http', ['site-test', 'http']);
  grunt.registerTask('test', ['site-test', 'local', 'http']);

  function buildSeajs() {
    grunt.util._.merge(grunt.config.data, {
      concat: {
        dist: {
          src: [
            'src/intro.js',
            'src/sea.js',
            'src/util-lang.js',
            'src/util-events.js',
            'src/util-path.js',
            'src/util-request.js',
            'src/util-cs.js',
            'src/util-deps.js',
            'src/module.js',
            'src/config.js',
            'src/outro.js'
          ],
          dest: 'dist/sea-debug.js'
        },
        standalone: {
          src: ['src/standalone.js'],
          dest: 'dist/standalone-debug.js'
        },
        runtime: {
          src: [
            'src/intro.js',
            'src/sea.js',
            'src/util-lang.js',
            'src/util-events.js',
            'src/util-path.js',
            'src/util-request.js',
            'src/module.js',
            'src/config.js',
            'src/outro.js'
          ],
          dest: 'dist/runtime-debug.js'
        }
      },

      uglify: {
        seajs: {
          files: {
            'dist/sea.js': ['dist/sea-debug.js'],
            'dist/standalone.js': ['dist/standalone-debug.js'],
            'dist/runtime.js': ['dist/runtime-debug.js']
          },
          options: {
            banner: '/*! Sea.js <%= pkg.version %> | seajs.org/LICENSE.md */\n',
            compress: {
              unsafe: true,
              unused: false
            }
          }
        }
      }
    });
    grunt.registerTask('build', [
      'concat',
      'post-concat',
      'uglify:seajs',
      'post-uglify',
      'size'
    ]);
  }

  function buildSeajsPlugin() {
    var build = require('spm-build');
    var options = build.parseOptions();
    var config = build.getConfig(options);
    grunt.util._.merge(grunt.config.data, config);
    grunt.util._.merge(grunt.config.data, {
      uglify: {
        plugin: {
          expand: true,
          cwd: '.build/tmp',
          src: '*.js',
          dest: '.build/dist'
        }
      }
    });
    loadSubTasks('spm-build');

    grunt.registerTask('build', [
      'clean:build', 
      'build-plugin',
      'uglify:plugin',
      'clean:dist',
      'copy:dist',
      'clean:build'
    ]);
  }

  function loadSubTasks(name) {
    var basedir = path.join(__dirname, 'node_modules', name);
    if (!basedir) {
      grunt.log.error('task ' + name + ' not found.');
      return;
    }
    var pkgfile = path.join(basedir, 'package.json');
    var pkg = grunt.file.exists(pkgfile) ? grunt.file.readJSON(pkgfile): {keywords: []};

    var taskdir = path.join(basedir, 'tasks');
    // Process collection plugins
    if (pkg.keywords && pkg.keywords.indexOf('gruntcollection') !== -1) {

      Object.keys(pkg.dependencies).forEach(function(depName) {
        // global task name should begin with grunt
        if (!/^grunt/.test(depName)) return;
        var filepath = path.join(basedir, 'node_modules', depName);
        if (grunt.file.exists(filepath)) {
          // Load this task plugin recursively
          loadSubTasks(name + '/node_modules/' + depName);
        }
      });

      // Load the tasks of itself
      if (grunt.file.exists(taskdir)) {
        grunt.loadTasks(taskdir);
      }
      return;
    }
    if (grunt.file.exists(taskdir)) {
      grunt.loadTasks(taskdir);
    } else {
      grunt.log.error('task ' + name + ' not found.');
    }
  }
};
