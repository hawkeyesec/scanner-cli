'use strict';
require('grunt');
require('mocha');

var config = {
  targets: {
    test: ['test/**/*.js'],
    bin: ['bin/*'],
    src: ['lib/**/*.js', '*.js', 'config/*.js']
  },
  timeout: 5000,
  require: ['should']
};
config.targets.all = config.targets.test.concat(config.targets.bin).concat(config.targets.src);

module.exports = function(grunt) {
  grunt.initConfig({
    mochaTest: {
      stdout: {
        options: {
          reporter: 'spec',
          timeout: config.timeout,
          require: config.require
        },
        src: config.targets.test
      }
    },
    /* jshint camelcase:false */
    mocha_istanbul: {
      test: {
        options: {
          reporter: 'mocha-jenkins-reporter',
          coverageFolder: 'reports',
          timeout: config.timeout,
          require: config.require,
          reportFormats: ['cobertura', 'lcov', 'html']
        },
        src: config.targets.test
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      stdout: {
        src: config.targets.all,
      },
      checkstyle: {
        src: config.targets.all,
        options: {
          reporter: 'checkstyle',
          reporterOutput: 'reports/jshint-checkstyle-result.xml'
        }
      }
    },
    watch: {
      files: config.targets.all,
      tasks: ['default']
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint:stdout', 'mochaTest:stdout']);
  grunt.registerTask('ci', ['jshint:checkstyle', 'mocha_istanbul']);
};
