/* eslint-disable @typescript-eslint/no-var-requires */
const
  gulp = require("gulp"),
  del = require("del"),
  ghPages = require("gulp-gh-pages"),
  spawn = require("cross-spawn"),
  config = require("../../gulpfile.config")
  ;


/**
 * Remove all generated docs.
 */
function clean() {
  return del([config.docsPath]);
}
module.exports.clean = clean;
gulp.task("docs-clean", clean);

function build(done) {
  spawn.sync("npm", ["run", "docs"], { stdio: "inherit" });
  done();
}

module.exports.build = build;
gulp.task("docs-build", build);

/**
 * Publish typedoc documents to gh-pages
 */
function publish() {
  return gulp
    .src(config.docsFiles)
    .pipe(ghPages())
    ;
}
module.exports.publish = publish;
gulp.task("docs-publish", publish);
