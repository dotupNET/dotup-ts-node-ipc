'use strict';
const
  fs = require('fs'),
  path = require('path'),
  gulp = require('gulp'),
  taskEnabled = require('./gulp.json')
  ;

const processNames = {
  clean: 'clean',
  preBuild: 'preBuild',
  build: 'build',
  postBuild: 'postBuild',
  publish: 'publish',
  watch: 'watch'
};

class GulpLoader {

  constructor() {
    this.processNames = processNames;
    // Gulp files
    this.gulps = [];
  }


  getProcessSerie(processName) {
    const procs = this.getProcess(processName);
    if (procs.length > 0) {
      return gulp.series(...procs);
    } else {
      return undefined;
    }
  }

  task(name, taskFunction) {
    return gulp.task(name, taskFunction);
  }

  getProcess(processName) {
    const result = [];
    const activeGulps = this.gulps; // .filter(g => config[path.basename(g, '.js')] === true);

    switch (processName) {
      case processNames.watch:

        this.addProcess(activeGulps, this.processNames.watch, result);

        break;

      case processNames.build:
      case processNames.publish:

        this.addProcess(activeGulps, this.processNames.clean, result);
        this.addProcess(activeGulps, this.processNames.preBuild, result);
        this.addProcess(activeGulps, this.processNames.build, result);
        this.addProcess(activeGulps, this.processNames.postBuild, result);

        break;

    }

    // Add publish functions..
    if (processName === processNames.publish) {
      this.addProcess(activeGulps, this.processNames.publish, result);
    }

    return result;
  }

  addProcess(activeGulps, processName, result) {
    let foos = activeGulps.filter(file => file[processName] !== undefined).map(file => file[processName]);
    if (foos.length > 0) {
      result.push(foos);
    }
  }

  loadAllFiles() {
    const gulpFiles = fs.readdirSync('./tools/gulp').filter(file => path.extname(file) === '.js');
    gulpFiles.forEach(file => {
      if (taskEnabled[path.basename(file, '.js')] === true) {
        console.log(`GulpLoader loading ${file}''`);

        this.gulps.push(require('./' + file));
      }
    });
  }

}
module.exports = GulpLoader;
