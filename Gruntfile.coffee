module.exports = (grunt) ->

  grunt.task.loadNpmTasks 'grunt-contrib-concat'
  grunt.task.loadNpmTasks 'grunt-contrib-uglify'
  grunt.task.loadNpmTasks 'grunt-contrib-watch'
  grunt.task.loadNpmTasks 'grunt-growl'
  grunt.task.loadNpmTasks 'grunt-shell'

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    banner: """
/*!
 * <%= pkg.name %> (<%= pkg.repository.url %>)
 * <%= pkg.description %>
 *
 * Lastupdate: <%= grunt.template.today("yyyy-mm-dd") + ' ' + pkg.lastUpdateComment %>
 * Version: <%= pkg.version %>
 * Require: <%= pkg.require %>
 * Link: <%= pkg.link %>
 * Author: <%= pkg.author %>
 * License: MIT
 */

"""

    growl:
      ok:
        title: 'Grunt OK'
      css:
        title: 'CSS compiled'
      js:
        title: 'JS compiled'
      build:
        title: 'Build completed'
      deploy:
        title: 'Deploy completed'

    concat:
      main:
        options:
          banner: '<%= banner %>'
        files: [
          'jquery.liquidCarousel.js': 'src/jquery.liquidCarousel.js'
        ]

    uglify:
      main:
        options:
          banner: '<%= banner %>'
        files: [
          'jquery.liquidCarousel.min.js': 'src/jquery.liquidCarousel.js'
        ]

    shell:
      reload:
        command: 'osascript -e \'tell application "Google Chrome" to reload active tab of window 1\''

    watch:
      html:
        files: [ 'demos/**/*.html' ]
        tasks: [
          'shell:reload'
        ]
      js:
        files: [ 'src/**/*.js' ]
        tasks: [
          'concat:main'
          'uglify:main'
          'shell:reload'
          'growl:js'
        ]


  grunt.registerTask 'build', [
    'concat'
    'uglify'
    'growl:build'
  ]

  grunt.registerTask 'default', [
    'build'
  ]
