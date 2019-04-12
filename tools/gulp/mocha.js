const
  gulp = require('gulp'),
  tsc = require('gulp-typescript'),
  mocha = require('gulp-mocha'),
  Config = require('../../gulpfile.config')
  ;

const config = new Config();

function run() {
  return gulp
    .src(config.testFiles)
    .pipe(
      mocha(
        {
          reporter: 'spec',
          require: ['ts-node/register']
        }
      )
    );
}
module.exports.run = run;

gulp.task('test-mocha', run);

// exports['test-mocha'] = run;
// task('test-mocha', function () {
//   return gulp.src(config.testFiles)
//     .pipe(mocha(
//       {
//         reporter: 'spec',
//         require: ['ts-node/register']
//       }
//     ))
//     ;
// });
