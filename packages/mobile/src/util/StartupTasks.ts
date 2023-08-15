import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import {
    bloomPlayerAssets,
    webBundleAssets,
} from "../autogenerated/WebBundleAssets";
import { Locations } from "../constants/Locations";
import { importSampleBooks } from "../storage/SampleBooks";
import { copyAssetAsync, ensureFolderAsync } from "./FileUtil";
import { Path } from "./Path";

export default async function startupTasks(): Promise<void> {
    console.info("startupTasks(): starting.");

    await Promise.all([
        loadWebBundleAsync(),
        loadBloomPlayerAsync(),
        importSampleBooks(),
    ]);

    console.info("startupTasks(): done.");
}

async function loadWebBundleAsync() {
    copyAssetsToFolder(Locations.WebRootFolder, webBundleAssets);
}

async function loadBloomPlayerAsync() {
    copyAssetsToFolder(
        Path.join(Locations.WebRootFolder, "bloom-player"),
        bloomPlayerAssets
    );
}

async function copyAssetsToFolder(destFolder: string, assets: Asset[]) {
    // Clearing the folder is optional in production,
    // but useful in development to ensure we're starting from a clean folder.
    await FileSystem.deleteAsync(destFolder, {
        idempotent: true,
    });
    await ensureFolderAsync(destFolder);
    const copyPromises = assets.map((asset) => {
        // Precondition: Right now we assume that the assets are all in a single flat folder
        // with no subfolders. This assumption simplifies the code here.
        const extension = asset.type === "jsAsset" ? "js" : asset.type;
        const destination = `${destFolder}/${asset.name}.${extension}`;
        console.log({ destination });

        return copyAssetAsync({
            asset,
            to: destination,
        });
    });

    // ENHANCE: catch if Promise.all rejects.
    await Promise.all(copyPromises);
}
