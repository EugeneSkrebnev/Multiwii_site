'use strict';

var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};
var recessConfig = {
  'name': 'recess',
  'createConfig': function (context, block) {
    var path = require('path');
    var cfg = {files: {}};
    var outfile = path.join(context.outDir, block.dest);
    cfg.files[outfile] = [];
    context.inFiles.forEach(function (f) { cfg.files[outfile].push(path.join(context.inDir, f)); });
    context.outFiles = [block.dest];

    return cfg;
  }
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  // show elapsed time at the end
  require('time-grunt')(grunt);

  grunt.initConfig({
    params: {
      appPath: 'app',
      componentsPath: 'app/bower_components',
      distPath: 'dist',
      testsPath: 'test'
    },
    watch: {
      options: {
        livereload: true
      },
      livereload: {
        files: [
          '<%= params.appPath %>/{,*/}*.html',
          '<%= params.appPath %>/styles/{,*/}*.less'
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      server: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'app')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= params.distPath %>/*',
            '!<%= params.distPath %>/.git*',
            '.tmp/*'
          ]
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= params.appPath %>/scripts/{,*/}*.js',
        '<%= params.testsPath %>/spec/{,*/}*.js'
      ]
    },
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.options.port %>/index.html']
        }
      }
    },
    recess: {
      options: {
        compile: true
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= params.distPath %>/scripts/{,*/}*.js',
            '<%= params.distPath %>/styles/{,*/}*.css',
            '<%= params.distPath %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
            '<%= params.distPath %>/fonts/{,*/}*.*'
          ]
        }
      }
    },
    useminPrepare: {
      dist: '<%= params.appPath %>/index.html',
      options: {
        dest: '<%= params.distPath %>/',
        flow: {
          steps: {
            'js': ['concat', 'uglifyjs'],
            'css': [recessConfig, 'cssmin']
          },
          post: {}
        }
      }
    },
    usemin: {
      html: ['<%= params.distPath %>/{,*/}*.html'],
      css: ['<%= params.distPath %>/styles/{,*/}*.css']
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= params.appPath %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= params.distPath %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: '<%= params.distPath %>',
          src: '*.html',
          dest: '<%= params.distPath %>'
        }]
      }
    },
    targethtml: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= params.appPath %>',
          src: '*.html',
          dest: '<%= params.distPath %>'
        }]
      }
    },
    copy: {
      remains: {
        files: [{
          expand: true,
          cwd: '<%= params.appPath %>',
          src: ['.htaccess', 'favicon.ico', 'robots.txt', 'fonts/*', 'CNAME'],
          dest: '<%= params.distPath %>/'
        }]
      }
    }
  });

  grunt.registerTask('server', [
    'connect:server',
    'open',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean',
    'useminPrepare',
    'recess',
    'imagemin',
    'targethtml',
    'cssmin',
    'concat',
    'uglify',
    'rev',
    'usemin',
    'htmlmin',
    'copy:remains',
    'jshint'
  ]);

  grunt.registerTask('default', 'server');
};
