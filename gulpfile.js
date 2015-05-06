var gulp = require('gulp');

var paths = {
	style: './src/style/*.scss'
};


gulp.task('style', function () {
	var sass = require('gulp-sass');

    gulp.src(paths.style)
        .pipe(sass())
        .pipe(gulp.dest('./src/style'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.style, ['style']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'style']);