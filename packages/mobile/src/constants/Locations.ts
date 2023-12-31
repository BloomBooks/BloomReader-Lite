import * as FileSystem from "expo-file-system";
import { Path } from "../util/Path";

export const BLOOM_PLAYER_FOLDER = FileSystem.cacheDirectory + "bloomPlayer";

export class Locations {
    public static WebRootFolder = Path.join(
        FileSystem.cacheDirectory!, // never null on Android or iOS, but returns null if on web.
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
