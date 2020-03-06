/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * dotup IT solutions. Peter Ullrich
 * 
 * The gulp tasks are split in several files in the tools/gulp directory.
 */
const GulpLoader = require("./tools/gulp/gulpLoader");
const config = require("./gulpfile.config");

// Load all gulp files.
const gulpLoader = new GulpLoader();
gulpLoader.loadAllFiles();

gulpLoader.task("project-build",
  gulpLoader.getProcessSerie(
    config.setBuildMode("production"),
    gulpLoader.processNames.build
  )
);

gulpLoader.task("project-build-dev",
  gulpLoader.getProcessSerie(
    config.setBuildMode("dev"),
    gulpLoader.processNames.build
  )
);

gulpLoader.task("project-publish",
  gulpLoader.getProcessSerie(
    config.setBuildMode("production"),
    gulpLoader.processNames.publish
  )
);

gulpLoader.task("project-publish-dev",
  gulpLoader.getProcessSerie(
    config.setBuildMode("dev"),
    gulpLoader.processNames.publish
  )
);

// gulp.task('project-watch', gulp.parallel(gulpLoader.getProcess(gulpLoader.processNames.watch)));
