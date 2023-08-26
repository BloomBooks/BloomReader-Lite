// These represent the messages that the frontend is expecting to be notified about

import { BookCollection } from "../models/BookCollection";

export type MessageToFrontend =
    | BookCollectionChangedMessage
    | GetThumbnailResponseMessage
    | ZipFileUnpackedMessage;

export type MessageToFrontendWithId = MessageToFrontend & {
    id: string;
};

export type BookCollectionChangedMessage = {
    messageType: "book-collection-changed";
    bookCollection: BookCollection;
};

export type GetThumbnailResponseMessage = {
    messageType: "get-thumbnail-response";
    thumbPath: string;
    data: string;
    format: string;
};

/**
 * Message events indicating that the requested zip file at ${origZip} has finished unpacking and that its index HTM file is at ${indexPath}
 * Note: indexPath is not necessarily "index.htm", but may be something like "${bookTitle}.htm".
 * Note: indexPath should be well-formed by the sender and immediately consumable by the receiver.
 *       For example, any spaces in the book's title should be appropriately encoded by the sender.
 */
export type ZipFileUnpackedMessage = {
    messageType: "zip-file-unpacked";
    origZip: string;
    indexPath: string;
};
