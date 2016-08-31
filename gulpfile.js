var gulp = require('gulp');
var strip = require('gulp-strip-comments');
var babel = require('gulp-babel');

gulp.task('build', function(){
  gulp.src([
      'src/*.js',
      'src/**/*.js'
    ])
    .pipe(babel({
      presets: ['react', 'es2015'],
      plugins: [
        "add-module-exports",
        "transform-class-properties",
        "transform-decorators-legacy",
        [
          "react-intl",
          {
            "messagesDir": "./translations/extractedMessages/",
            "enforceDescriptions": true
          }
        ]
      ]
    }))
    .pipe(gulp.dest('dist'));
  gulp.src([
      'src/**/*.json'
    ])
    .pipe(strip())
    .pipe(gulp.dest('dist'));
});
