/**
 * This script should be run from the root of where you run "yarn" from.
 */

import fs from "fs";

const logPrefix = "[postinstall.mts]";
const nodeModulePath = "./node_modules/bloom-player/dist";
const bloomPlayerAssetFolderPath = "./public/bloom-player/";
const filesToNotCopy: string[] = [];

console.log(
    `${logPrefix}: Copying files from ${nodeModulePath} to ${bloomPlayerAssetFolderPath}`
);

const moduleFiles = fs.readdirSync(nodeModulePath);
const moduleFilesToCopy = moduleFiles.filter(
    (filename) => !filesToNotCopy.includes(filename)
);

rmSafe(bloomPlayerAssetFolderPath); // Clear out any outdated contents
mkdirSafe(bloomPlayerAssetFolderPath);

moduleFilesToCopy.forEach((filename) => {
    // The filename is expected to contain just the filename (no directories of any sort at all)
    fs.copyFileSync(
        `${nodeModulePath}/${filename}`,
        `${bloomPlayerAssetFolderPath}/${filename}`
    );
});
function rmSafe(path: fs.PathLike) {
    if (fs.existsSync(path)) {
        fs.rmSync(path, { recursive: true });
    }
}
function mkdirSafe(path: fs.PathLike) {
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
}
