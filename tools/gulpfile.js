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
const renderingVariantsGlob = [ '../Rendering Variants/**/-/scriban/**/*.scriban' ];
const filesGlob = [...mediaLibraryFilesGlob, ...renderingVariantsGlob];

const context = {
  server: siteAndUserConfig.server,
  user: { ...siteAndUserConfig.user },
  limiter: new Bottleneck(gulpConfig.bottleneckConfig),
  verbose: gulpConfig.verbose
}

const fullDeploy = async (done) => {
  let fileList = [];
  gulp
    .src(filesGlob, {
      strict: true,
      silent: false
    })
    .pipe(through.obj(function (file, enc, cb) {
      fileList.push(file.path);
      cb(null);
  }))
  .pipe(gulp.dest('./temp/'))
  .on ('end', function () {
      console.log(fileList);
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
  gulp.watch([...mediaLibraryFilesGlob, ...renderingVariantsGlob], {
    delay: 500,
  }).on('all', (fileEvent, filePath) => {
    if (context.verbose) {
      console.log(`Changed file [${fileEvent}] '${filePath.replace(global.rootPath + '\\', '')}'`);
    }
    fileActionResolver(fileEvent, filePath, context);
  });
}

// Exported Gulp tasks
exports.fullDeploy = fullDeploy;
exports.watch = watch;