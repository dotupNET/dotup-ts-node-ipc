/**
 * Welcome to your gulpfile!
 * The gulp tasks are split in several files in the tools/gulp directory for better modularity.
 */
const GulpLoader = require('./tools/gulp/gulpLoader');

// Load all gulp files.
const gulpLoader = new GulpLoader();
gulpLoader.loadAllFiles();

gulpLoader.task('project-build', gulpLoader.getProcessSerie(gulpLoader.processNames.build));
gulpLoader.task('project-publish', gulpLoader.getProcessSerie(gulpLoader.processNames.publish));
    // gulp.task('project-watch', gulp.parallel(gulpLoader.getProcess(gulpLoader.processNames.watch)));
