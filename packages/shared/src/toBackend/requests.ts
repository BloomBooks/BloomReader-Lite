/**
 * The base of a request to the backend
 * This type is for the frontend consumer - it has the fields that the frontend needs to fill out
 */
export type RequestToBackendBase =
    | ConsoleLogRequestBase
    | GetBookCollectionRequestBase
    | GetThumbnailRequestBase
    | UnpackZipFileRequestBase;

/**
 * A fully fledged request to the backend
 * This type is more for the backend - it has the exact form that the request should take "over the wire"
 */

export type RequestToBackend =
    | ConsoleLogRequest
    | GetBookCollectionRequest
    | GetThumbnailRequest
    | UnpackZipFileRequest;

export type WithId = {
    id: string;
};

export type ConsoleLogRequestBase = {
    messageType: "console-log";
    logLevel: string;
    message: string | any;
    optionalParams: any;
};
export type ConsoleLogRequest = ConsoleLogRequestBase;

/**
 * Gets the books and shelves available in this collection
 */
export type GetBookCollectionRequestBase = {
    messageType: "get-book-collection";
};
export type GetBookCollectionRequest = GetBookCollectionRequestBase & WithId;

/**
 * Gets the books and shelves available in this collection
 */
export type GetThumbnailRequestBase = {
    messageType: "get-thumbnail";
    thumbPath: string;
};
export type GetThumbnailRequest = GetThumbnailRequestBase & WithId;

/**
 * Requests that the specified ${zipFilePath} be extracted
 *
 * Remarks: Equivalent to bloompub-viewer's unpack-zip-file
 */
export type UnpackZipFileRequestBase = {
    messageType: "unpack-zip-file";
    zipFilePath: string; // the path to the .bloompub or .bloomd
};
export type UnpackZipFileRequest = UnpackZipFileRequestBase & WithId;
