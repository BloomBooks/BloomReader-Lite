import * as FileSystem from "expo-file-system";
import { Path } from "../util/Path";

export const BLOOM_PLAYER_FOLDER = FileSystem.cacheDirectory + "bloomPlayer";

export class Locations {
    // This could be in the cache folder, but we also need to access books which need to be in the documents directory
    // (because the books are wanted to be retained long-term)
    // For the webview's iOS-specific allowingReadAccessToURL prop,
    // it seems to only receive one string (and setting it to the earliest common ancestor of cache and documents didn't work)
    // so the workaround is to put it all in Documents.
    // This StackOverflow link came up with the same workaround I did: https://stackoverflow.com/a/51543318
    //
    // FYI, on both Android and iOS, FileSystem.documentDirectory is an app-specific one.
    public static WebRootFolder = Path.join(
        FileSystem.documentDirectory!, // never null on Android or iOS, but returns null if on web.
        "www"
    );

    public static BooksFolder = Path.join(
        FileSystem.documentDirectory!, // never null on Android or iOS, but returns null if on web.
        "Books"
    );

    public static ThumbsFolder = Path.join(
        FileSystem.documentDirectory!, // never null on Android or iOS, but returns null if on web.
        "thumbs"
    );
}
