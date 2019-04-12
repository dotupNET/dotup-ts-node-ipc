'use strict';

class GulpConfig {

  constructor() {

    // source
    this.sourcePath = 'src';
    this.tsSourceFiles = this.sourcePath + '/**/*.ts';

    // test
    this.testPath = 'test';
    this.testFiles = `${this.testPath}/**/*.ts`;

    // target
    this.targetPath = 'dist';

    // docs
    this.docsPath = 'docs';
    this.docsFiles = this.docsPath + '/**/*';

    // Static files
    this.statics = [
      {
        sourcePath: `${this.sourcePath}/assets/**`,
        targetPath: `${this.targetPath}/assets`
      }
    ];
  }

}
module.exports = GulpConfig;
