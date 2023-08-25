// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
    "html",
    "css",
    // ENHANCE: Adding the "js" or "javascript" extension breaks the build
    // (not too surprising, since most Javascript files shouldn't be treated as assets)
    // Work around this by renaming the .js files to have .jsAsset extensions.
    // At runtime, copy the .jsAsset file back to a .js extension
    "jsAsset",
    "bloompub", // For sample books
    "htm" // For bloomplayer.htm
);

if (!config.watchFolders) {
    config.watchFolders = [];
}

// This is necessary for EXTERNAL path aliases to work
config.watchFolders.push(path.resolve(__dirname + "/../shared/dist"));

module.exports = config;
