var grunt = require('grunt')
// Add the grunt-mocha-test tasks.
grunt.loadNpmTasks('grunt-mocha-test');

grunt.initConfig({
  // Configure a mochaTest task
  mochaTest: {
    test: {
      options: {
        reporter: 'spec',
        timeout: 1000000
      },
      src: ['test/*.js']
    },
    coverage: {
      options: {
        reporter: 'html-cov',
        // use the quiet flag to suppress the mocha console output
        quiet: true,
        // specify a destination file to capture the mocha
        // output (the quiet option does not suppress this)
        captureFile: 'coverage.html'
      },
      src: ['test/*.js']
    }
  }
});

grunt.registerTask('default', 'mochaTest');