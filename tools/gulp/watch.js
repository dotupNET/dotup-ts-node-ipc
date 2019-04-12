// const
//   gulp = require('gulp'),
//   Config = require('../../gulpfile.config')
//   ;
// // browserSync = require('browser-sync'),
// // superstatic = require('superstatic');

// const config = new Config();

// gulp.task('watch-src', function () {
//   return gulp.watch([config.tsSourceFiles], gulp.series('compile-ts'));
// });

// gulp.task('watch-assets', function () {
//   return gulp.watch([`${config.sourcePath}/assets`],
//     gulp.series('clean-assets', 'copy-assets')
//   );
// });

// gulp.task('watch', gulp.parallel('watch-assets', 'watch-src'), function (done) {
//   done();
// });
