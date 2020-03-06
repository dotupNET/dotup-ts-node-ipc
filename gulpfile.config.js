//const skill = require('./secrets/skill.config.json');

const GulpConfig = {
  BuildMode: Object.freeze({
    "production": "production",
    "dev": "dev"
  }),
  ActiveComponents: {
    "lambda": false,
    "build": true,
    "docs": true,
    "mocha": false,
    "eslint": false,
    "watch": false,
    "yogen": false,
    "npm": true,
    "statics": true,
    "skill": false
  },
  Paths: {
    // source
    sourcePath: "src",

    // test
    testPath: "src",

    // target
    targetPath: "dist",

    // docs
    docsPath: "docs"
  },
  buildMode: null,

  // GulpConfig = {

  // buildMode: GulpConfig.buildMode,

  tsConfigFile: "",

  // Root path
  rootPath: __dirname
};

Object.assign(GulpConfig, {
  // source
  sourcePath: GulpConfig.Paths.sourcePath,

  tsSourceFiles: GulpConfig.Paths.sourcePath + "/**/*.ts",

  // test
  testPath: GulpConfig.Paths.testPath,
  testFiles: `${GulpConfig.Paths.testPath}/**/*.ts`,

  // target
  targetPath: GulpConfig.Paths.targetPath,

  // docs
  docsPath: GulpConfig.Paths.docsPath,

  docsFiles: GulpConfig.Paths.docsPath + "/**/*",
  setBuildMode: (value) => {
    GulpConfig.buildMode = value;
    if (value === GulpConfig.BuildMode.dev) {
      GulpConfig.tsConfigFile = "tsconfig.json";
    } else {
      GulpConfig.tsConfigFile = "tsconfig.build.json";
    }
    return GulpConfig.buildMode;
  },

  // Static files
  statics: [
    {
      sourcePath: `${GulpConfig.Paths.sourcePath}/assets/**`,
      targetPath: `${GulpConfig.Paths.targetPath}/assets`
    }
  ],

  npmLink: [
    // {
    //   name: 'module-name1',
    //   path: '../'
    // },
    // {
    //   name: 'module-name2',
    //   path: '../'
    // }
  ],
  // lambda: [
  //   {
  //     sourcePath: `${Paths.targetPath}/skill`,
  //     targetFile: `${Paths.targetPath}/lambda.zip`,
  //     params: {
  //       FunctionName: skill.functionArn,
  //       Publish: false
  //     }
  //   }
  // ]
});

// const config = new GulpConfig();
module.exports = GulpConfig;
