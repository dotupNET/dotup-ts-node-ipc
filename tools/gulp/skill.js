/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const gulp = require("gulp");
const AlexaPublisher = require("../scripts/AlexaPublisher");
const AlexaCli = require("../scripts/AlexaCli");
const config = require("../../gulpfile.config");

const rootPath = path.join(__dirname, "..", "..");
const cli = new AlexaCli(rootPath);
const manifest = new AlexaPublisher(rootPath);

// const loader = new awsCreds.AwsCredentialsLoader();
// const credentials = loader.GetCredentials();

// Generate skill.json from template and prod config
async function generateManifestProd() {
  manifest.generateManifest(config.BuildMode.production);
}

// Generate skill.json from template and dev config
async function generateManifestDev() {
  manifest.generateManifest(config.BuildMode.dev);
}

// Publish prod skill.json
async function publishManifestProd() {
  manifest.generateManifest(config.BuildMode.production);
  cli.updateSkill(manifest.skillId);
}

// Publish dev skill.json
async function publishManifestDev() {
  manifest.generateManifest(config.BuildMode.dev);
  cli.updateSkill(manifest.skillId);
}

async function postBuild() {
  manifest.generateManifest(config.buildMode);
  cli.generatePackageJson();
}
module.exports.postBuild = postBuild;

async function prePublish() {
  cli.generatePackageJson();
  cli.updateSkill(manifest.skillId);
  if (config.buildMode === config.BuildMode.production) {
    console.log("Installing dependencies...");
    cli.installDependencies();
  }
}
module.exports.prePublish = prePublish;
// async function publish(){
//   await publishManifestProd(); // gulp.series(generateManifestDev);
//   cli.generatePackageJson();
//   cli.installDependencies();
//   await aws.publish();
// }
// module.exports.publish = publish;

gulp.task("skill-manifest-generate-dev", generateManifestDev);

gulp.task("skill-manifest-generate-prod", generateManifestProd);

gulp.task("skill-manifest-publish-dev", publishManifestDev);

gulp.task("skill-manifest-publish-prod", publishManifestProd);

gulp.task("skill-generate-package-json", async () => {
  cli.generatePackageJson();
});

// 'clone skill into tmp folder'
gulp.task("skill-clone", async () => {
  manifest.loadConfiguration(config.BuildMode.dev);

  cli.cloneSkill(manifest.skillId);
});

// 'install into dist/skill folder'
gulp.task("skill-install-dependencies", async () => {
  cli.installDependencies();
});

// 'install into dist/skill folder'
gulp.task("skill-build", postBuild);
gulp.task("skill-publish", prePublish);
