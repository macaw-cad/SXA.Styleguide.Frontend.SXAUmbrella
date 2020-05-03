"use strict";

const fs = require('fs');
const path = require('path');
const through = require('through2');
const gulp = require('gulp');
const Bottleneck = require('Bottleneck');

const fileActionResolver = require('./util/fileActionResolver');

// We are in the tools subfolder, set rootPath to root where package.json lives
global.rootPath = path.resolve(path.join(__dirname, '..'));

const siteAndUserConfig = JSON.parse(fs.readFileSync(path.join(global.rootPath, 'config/config.json')));

const gulpConfig = require('../config/gulp.config.js');

const mediaLibraryFilesGlob = gulpConfig.mediaLibraryFilesGlob;
const renderingVariantsGlob = [ 
  '../Rendering Variants/**/-/scriban/metadata.json', 
  '../Rendering Variants/**/-/scriban/**/*.scriban' 
];
const fullDeployGlob = [...mediaLibraryFilesGlob, '../Rendering Variants/**/-/scriban/metadata.json']; // Scriban files imported per directory
const watchGlob = [...mediaLibraryFilesGlob, ...renderingVariantsGlob];

const context = {
  server: siteAndUserConfig.server,
  user: { ...siteAndUserConfig.user },
  limiter: new Bottleneck(gulpConfig.bottleneckConfig),
  verbose: gulpConfig.verbose
}

const fullDeploy = async (done) => {
  let fileList = [];
  gulp
    .src(fullDeployGlob, {
      strict: true,
      silent: false
    })
    .pipe(through.obj(function (file, enc, cb) {
      fileList.push(file.path);
      cb(null);
  }))
  .pipe(gulp.dest('./temp/'))
  .on ('end', function () {
      fileList.forEach(filePath => {
        if (fs.lstatSync(filePath).isFile()) {
            if (context.verbose) {
              console.log(`Processing file '${filePath.replace(global.rootPath + '\\', '')}'`);
            }
            fileActionResolver('change', filePath, context);
        }
      });
  });
  done();
}

const watch = () => {
  gulp.watch(watchGlob, {
    delay: 500,
  }).on('all', (fileEvent, filePath) => {
    if (context.verbose) {
      console.log(`Changed file [${fileEvent}] '${path.resolve(__dirname, filePath).replace(global.rootPath + '\\', '')}'`);
    }
    fileActionResolver(fileEvent, filePath, context);
  });
}

// Exported Gulp tasks
exports.fullDeploy = fullDeploy;
exports.watch = watch;