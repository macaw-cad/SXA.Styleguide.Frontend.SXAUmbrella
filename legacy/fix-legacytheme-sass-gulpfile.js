"use strict";

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const debug = require('gulp-debug');
const bulkSass = require('gulp-sass-bulk-import');
const gulpReplace = require('gulp-replace');

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const destinationTheme = path.resolve(__dirname, packageJson.destinationTheme);

console.log("Fixing legacy theme:")
console.log(`- Current working directory: ${__dirname}`);
console.log(`- Destination theme folder: ${destinationTheme}`);

// Fix the wildcard imports of the sass copied from the SXA.Styleguide.Frontend.Enhanced front-end project of Mark van Aalst.
// The provided sass which is an updated version of the Sitecore default theme is not valid sass - top-level wildcard imports 
// initially handled by gulp-sass-bulk-import but does not work over multiple levels.
// Fix location of "base/.." and "abstracts/.." folders - must be relative due to new build approach using webpack
const fix = (done) => {
    const absoluteRootPath = path.resolve('./theme/sass/').replace(/\\/g,'/');
    // console.log(`absoluteRootPath: ${absoluteRootPath}`);
    gulp
      .src('./theme/sass/*.scss')
      .pipe(bulkSass())
      // make @import path relative to sass folder
      .pipe(gulpReplace(absoluteRootPath, '.'))
      .pipe(gulp.dest(path.resolve(destinationTheme, 'src/theme/sass/')));
  
    // fix "base/.. includes on deeper levels"
    gulp
      .src('./theme/sass/*/*.scss')
      .pipe(gulpReplace('"base/', '"../base/'))
      .pipe(gulpReplace('"abstracts/', '"../abstracts/'))
      .pipe(gulp.dest(path.resolve(destinationTheme, 'src/theme/sass/')));
    
     gulp
      .src('./theme/sass/*/*/*.scss')
      .pipe(gulpReplace('"base/', '"../../base/'))
      .pipe(gulpReplace('"abstracts/', '"../../abstracts/'))
      .pipe(gulp.dest(path.resolve(destinationTheme, 'src/theme/sass/')));
    done();
  }

  exports.fix = fix;