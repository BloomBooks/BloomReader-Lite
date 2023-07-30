/**
 * This script should be run from the root of where you run "yarn" from.
 */

// // Disable no-var-requires because this is a script, not a module, and import requires being in a module
// /* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";

const logPrefix = "[copyWebDist.js]";
const sourceFolderPath = "./dist/";

const destinationFolderPath = "../mobile/assets/web-dist";
const filesToNotCopy: string[] = [];

console.log(
    `${logPrefix}: Copying files from ${sourceFolderPath} to ${destinationFolderPath}/`
);

const sourceFiles = getAllFilePaths(sourceFolderPath);

const sourceFilesToCopy = sourceFiles.filter(
    (filename) => !filesToNotCopy.includes(filename)
);

rmSafe(destinationFolderPath); // Clear out any outdated contents
// mkdirSafe(destinationFolderPath);

const assetBasenames = new Map();
const sourceCodeExtensions = [".js"]; // What the mobile package's metro bundler thinks are source code files (which it won't like as assets)
sourceFilesToCopy.forEach((filePath) => {
    const fromFilePath = filePath;

    // This chops off the prefix of the path including sourceFolderPath
    const relativeFilePath = path.relative(sourceFolderPath, filePath);

    // Source extensions can't be directly bundled as assets
    // (the bundler can't deal with some JS files being source files and some being assets)
    // so rename something like "bloomplayer.js" to "bloomplayer.jsAsset"
    const extension = path.extname(filePath);
    const newExtension = sourceCodeExtensions.includes(extension)
        ? extension + "Asset"
        : extension;

    const basename = path.basename(filePath, extension);
    const toFilename = path
        .join(path.dirname(relativeFilePath), basename + newExtension)
        .replace(/\\/g, "/");

    // Note: Each asset should have a unique basename (case insensitive).
    // Otherwise, when you do a cloud build in Expo, gradle will error out complaining about duplicate assets.
    // Yes, that happens for something like bloomplayer.htm and bloomPlayer.js (!!!),
    //even though they don't have identical filenames, and their basenames aren't even completely identical!
    const basenameCaseInsensitive = basename.toLowerCase();
    const fileInfo = {
        fromFilename: fromFilePath,
        toFilename,
    };
    const collidingValue = assetBasenames.get(basenameCaseInsensitive);
    if (collidingValue !== undefined) {
        throw new Error(
            `Duplicate basename "${basenameCaseInsensitive}" (${collidingValue.fromFilename}, ${fileInfo.fromFilename}). ` +
                "Assets cannot share a basename or else gradle will throw duplicate asset errors during Cloud Build."
        );
    } else {
        assetBasenames.set(basenameCaseInsensitive, fileInfo);
    }

    const src = fromFilePath;
    const dest = `${destinationFolderPath}/${toFilename}`;

    copyFileSafe(src, dest, { verbose: true });
});

// Given a folder that may have subfolders, gets the paths to all the files (but none of the directories)
function getAllFilePaths(folderPath: string) {
    const filePaths: string[] = [];

    function traverseDirectory(currentPath: string) {
        const files = fs.readdirSync(currentPath);

        files.forEach((file) => {
            const filePath = path.join(currentPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isFile()) {
                filePaths.push(filePath);
            } else if (stat.isDirectory()) {
                traverseDirectory(filePath);
            }
        });
    }

    try {
        traverseDirectory(folderPath);
        return filePaths;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

function exportAssets() {
    const assetFilenames = Array.from(assetBasenames.values()).map(
        (fileInfo) => fileInfo.toFilename
    );

    const fileContents = `// This file is auto-generated by copyWebDist.mts. To make permanent changes to it, modify copyWebModules.js
import { Asset } from "expo-asset";

export const webBundleAssets = [
${assetFilenames
    .map((toFilename) => {
        return `\tAsset.fromModule(require("../../assets/web-dist/${toFilename}")),`;
    })
    .join("\n")}
];`;

    // This path should be relative to where you run yarn from.
    const generatedCodeFileLocation =
        "../mobile/src/autogenerated/WebBundleAssets.ts";
    console.log(
        `${logPrefix}: Adding Web Bundle exports to ${generatedCodeFileLocation}`
    );
    fs.writeFileSync(generatedCodeFileLocation, fileContents);
}
exportAssets();

function rmSafe(path: fs.PathLike) {
    if (fs.existsSync(path)) {
        fs.rmSync(path, { recursive: true });
    }
}
function mkdirSafe(path: fs.PathLike) {
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
}
function copyFileSafe(
    src: fs.PathLike,
    dest: string,
    options?: { verbose?: boolean }
) {
    if (options?.verbose) {
        console.info({ src, dest });
    }
    mkdirSafe(path.dirname(dest));
    fs.copyFileSync(src, dest);
}
