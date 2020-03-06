/* eslint-disable @typescript-eslint/no-var-requires */
const
  gulp = require("gulp"),
  eslint = require("gulp-eslint"),
  config = require("../../gulpfile.config")
  ;

function preBuild() {
  console.log("Start linting");

  return gulp
    .src(config.tsSourceFiles)
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError())
    ;
}
module.exports.preBuild = preBuild;

/**
 * Lint all custom TypeScript files.
 */
gulp.task("es-lint", function () {
  // var f = filter(['**/*.ts', '!**/template']);
  console.log("Start linting");

  return gulp
    .src(config.tsSourceFiles)
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError())
    ;
});
