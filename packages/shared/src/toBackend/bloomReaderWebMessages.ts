// This file represents the message events uniquely used in the context of the BloomReader-Lite webapp
export type BloomReaderWebappMessages =
    | ConsoleLogMessage
    | GetBookCollectionMessage
    | GetThumbnailMessage
    | UnpackZipFileMessage;

export type ConsoleLogMessage = {
    messageType: "console-log";
    logLevel: string;
    message: string | any;
    optionalParams: any;
};

/**
 * Gets the books and shelves available in this collection
 */
export type GetBookCollectionMessage = {
    messageType: "get-book-collection";
};

/**
 * Gets the books and shelves available in this collection
 */
export type GetThumbnailMessage = {
    messageType: "get-thumbnail";
    id: string; // TODO: Make this more generic
    thumbPath: string;
};

/**
 * Requests that the specified ${zipFilePath} be extracted
 *
 * Remarks: Equivalent to bloompub-viewer's unpack-zip-file
 */
export type UnpackZipFileMessage = {
    messageType: "unpack-zip-file";
    zipFilePath: string; // the path to the .bloompub or .bloomd
};
