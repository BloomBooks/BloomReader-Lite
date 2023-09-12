/**
 * This script should be run from the root of where you run "yarn" from.
 */

import fs from "fs";
import { unlink } from "fs/promises";
import path from "path";

const logPrefix = "[copyWebDist.js]";
const sourceFolderPath = "../web/dist/"; // Or from node_modules/bloom-reader-lite-web/dist
const destinationFolderPath = "./assets/web-dist";
// This path should be relative to where you run yarn from.
const generatedCodeFileFolder = "./src/autogenerated";

const assetBasenames = new Map();

main();

async function main() {
    const filesToNotCopy: string[] = [];

    console.time(logPrefix);
    // console.log(
    //     `${logPrefix}: Copying files from ${sourceFolderPath} to ${destinationFolderPath}/`
    // );

    const sourceFiles = getAllFilePaths(sourceFolderPath);

    const sourceFilesToCopy = sourceFiles.filter(
        (filename) => !filesToNotCopy.includes(filename)
    );

    // rmSafe(destinationFolderPath); // Clear out any outdated contents
    // mkdirSafe(destinationFolderPath);

    const sourceCodeExtensions = [".js"]; // What the Metro bundler thinks are source code files (which it won't like as assets)
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
        const toFilename = normalizeSeparators(
            path.join(path.dirname(relativeFilePath), basename + newExtension)
        );

        // Note: Each asset should have a unique basename (case insensitive).
        // Otherwise, when you do a cloud build in Expo, gradle will error out complaining about duplicate assets.
        // Yes, that happens for something like bloomplayer.htm and bloomPlayer.js (!!!),
        // even though they don't have identical filenames, and their basenames aren't even completely identical!
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

    await cleanupOutdatedFilesAsync();

    console.timeEnd(logPrefix);
    const now = new Date();
    console.info(logPrefix, "Last built at " + now.toTimeString());
}

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
    const assets = Array.from(assetBasenames.values()).map((fileInfo) => ({
        toFilename: fileInfo.toFilename,
        isBloomPlayer: fileInfo.toFilename.startsWith("bloom-player/"),
    }));

    const bloomPlayerAssets = assets.filter((asset) => asset.isBloomPlayer);
    console.debug({ bloomPlayerAssets });

    const webAssetFilenames = assets.filter((asset) => !asset.isBloomPlayer);

    const fileContents = `// This file is auto-generated by copyWebDist.mts. To make permanent changes to it, modify copyWebModules.js
import { Asset } from "expo-asset";

export const webBundleAssets = [
${webAssetFilenames
    .map(({ toFilename }) => {
        return `\tAsset.fromModule(require("../../assets/web-dist/${toFilename}")),`;
    })
    .join("\n")}
];

export const bloomPlayerAssets = [
${bloomPlayerAssets
    .map(({ toFilename }) => {
        return `\tAsset.fromModule(require("../../assets/web-dist/${toFilename}")),`;
    })
    .join("\n")}
];
`;

    const generatedCodeFileLocation = `${generatedCodeFileFolder}/WebBundleAssets.ts`;
    console.log(
        `${logPrefix}: Adding Web Bundle exports to ${generatedCodeFileLocation}`
    );
    mkdirSafe(generatedCodeFileFolder);
    fs.writeFileSync(generatedCodeFileLocation, fileContents);
}
exportAssets();

async function cleanupOutdatedFilesAsync() {
    // Note: It would be safer to just delete this whole directory at the beginning,
    // but that messes up Expo's hot reload, so that's why we manually delete these.

    const activeFilenames = Array.from(assetBasenames.values()).map(
        (fileInfo) => fileInfo.toFilename
    );
    const activeFilenameSet = new Set(activeFilenames);

    // Absolute paths
    const destFilePaths = getAllFilePaths(destinationFolderPath);

    // Relative paths
    const destRelativeFilePaths = destFilePaths.map((filePath) =>
        normalizeSeparators(path.relative(destinationFolderPath, filePath))
    );
    const relativePathsToDelete = destRelativeFilePaths.filter(
        (filePath) => !activeFilenameSet.has(filePath)
    );

    const absolutePathsToDelete = relativePathsToDelete.map((relativePath) =>
        path.join(destinationFolderPath, relativePath)
    );
    if (absolutePathsToDelete.length === 0) {
        return;
    }

    console.info(`${logPrefix} Deleting outdated files`);
    console.info(absolutePathsToDelete);
    const deletePromises = absolutePathsToDelete.map((path) => unlink(path));
    await Promise.all(deletePromises);
    console.info(`${logPrefix} Delete successful`);
}

// function rmSafe(path: fs.PathLike) {
//     if (fs.existsSync(path)) {
//         fs.rmSync(path, { recursive: true });
//     }
// }
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
function normalizeSeparators(path: string) {
    return path.replace(/\\/g, "/");
}