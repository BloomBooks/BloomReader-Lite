import { Asset } from "expo-asset";
import { Locations } from "../constants/Locations";
import { importBookToCollection } from "../models/BookCollection";
import { copyAssetAsync } from "../util/FileUtil";

// NOTE: These asset names must not contain any URI special characters (Space is a special character)
const modules = [require("../../assets/books/The_Moon_and_the_Cap.bloompub")];
export const sampleBookAssets = modules.map((module) => {
    return Asset.fromModule(module);
});

export async function importSampleBooks() {
    const debugging: string[] = [];
    for (let i = 0; i < sampleBookAssets.length; ++i) {
        const asset = sampleBookAssets[i];

        const assetFileName = `${asset.name}.${asset.type}`;
        const copyToPath = `${Locations.BooksFolder}/${encodeURIComponent(
            assetFileName
        )}`;
        await copyAssetAsync({
            asset,
            to: copyToPath,
        });
        debugging.push(copyToPath);
        await importBookToCollection(copyToPath, null);
    }

    console.log({ imported: debugging });
}
