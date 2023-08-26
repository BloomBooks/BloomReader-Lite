// HOW TO add a new response type
// Add a "...ResponseSuccess" type with the fields expected if success. Add "& Success" to the type as well. (This allows the consumer to use a discriminated union to get the right tyep)
// Add a "...ResponseFailure" type with the fields expected if failed. Add "& Failure" to the type as well. (This allows the consumer to use a discriminated union to get the right tyep)
// Add a "...Response" with the appropriate messageType, and " & " it with ( ...ResponseSuccess | ...ResponseFailuer)
// Or the newly added "...Response" into the definition of ResponseToFrontend at the top.

import { BookCollection } from "../models/BookCollection";

/**
 * The consumer of these types can use the "messageType" and "success" fields as discriminated unions to get the precise type,
 * even across the varying responses.
 * The consumer is also encouraged to check for success or failure because Typescript will not be able to infer the success response
 * unless the "success" field is checked (via discriminated union).
 * Note: This may all fall apart afterwards if the consumer use utility types like Omit<...> or Partial<...>,
 *       so it's recommended for the consumer to avoid using utility type transformations if feasible.
 */
export type ResponseToFrontend = (
    | GetBookCollectionResponse
    | GetThumbnailResponse
    | UnpackZipFileResponse
) & {
    requestId: string; // The ID of the request that this response is for.
    success: boolean;
};

type Success = {
    success: true;
};

type Failure = {
    success: false;
};

type GenericFailure = {
    reason: string;
} & Failure;

export type GetBookCollectionResponse = {
    messageType: "get-book-collection-response";
    success: true;
    bookCollection: BookCollection;
};

export type GetThumbnailResponse = {
    messageType: "get-thumbnail-response";
} & (GetThumbnailResponseSuccess | GetThumbnailResponseFailure);

export type GetThumbnailResponseSuccess = {
    data: string;
    format: string;
} & Success;

export type GetThumbnailResponseFailure = GenericFailure;

/**
 * Indicates that the requested zip file at ${origZip} has finished unpacking and that its index HTM file is at ${indexPath}
 * Note: indexPath is not necessarily "index.htm", but may be something like "${bookTitle}.htm".
 * Note: indexPath should be well-formed by the sender and immediately consumable by the receiver.
 *       For example, any spaces in the book's title should be appropriately encoded by the sender.
 * Remarks: Equivalent to "zip-file-unpacked" in bloompub-viewer
 */
export type UnpackZipFileResponse = {
    messageType: "unpack-zip-file-response";
} & (UnpackZipFileResponseSuccess | UnpackZipFileResponseFailure);

export type UnpackZipFileResponseSuccess = {
    origZip: string;
    indexPath: string;
} & Success;

export type UnpackZipFileResponseFailure = GenericFailure;
