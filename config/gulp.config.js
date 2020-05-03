module.exports = {
  // Specify all files to include for watch and upload to Sitecore and include in distribution
  mediaLibraryFilesGlob: [
    '../Media Library/Base Themes/**',
    '!../Media Library/Base Themes/**/src/**',      // never upload something from the src folder',
    '../Media Library/Extension Themes/**',
    '!../Media Library/Extension Themes/**/src/**', // never upload something from the src folder',
    '../Media Library/Themes/**/*',
    '!../Media Library/Themes/**/src/**',           // never upload something from the src folder',
    '!../Media Library/Themes/**/images/flags/**',  // Skip the flags folder when a fixed legacy theme is used
  ],

  // The "limiter.schedule()" functionality of the NPM package Bottleneck (https://www.npmjs.com/package/bottleneck)
  // is used to handle file changes and requests to the Sitecore API.  Play with this configuration to 
  // optimize for your situation. 
  bottleneckConfig: {
    maxConcurrent: 5,
    minTime: 100
  },

  // Enable to see more information on what happens
  verbose: true
};