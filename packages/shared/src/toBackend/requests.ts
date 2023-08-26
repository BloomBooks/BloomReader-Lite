export type RequestToBackend = GetBookCollectionRequest | GetThumbnailRequest;

/**
 * Same as RequestToBackend, but with an id field.
 * Remarks: Make RequestToBackend and RequestToBackendWithId separate requests
 * because the narrowed types with discriminated unions seem to fall apart if you use things like Omit<ResponseToBackendWithId, "id">
 */
export type RequestToBackendWithId = RequestToBackend & {
    id: string;
};

/**
 * Gets the books and shelves available in this collection
 */
export type GetBookCollectionRequest = {
    messageType: "get-book-collection";
};

/**
 * Gets the books and shelves available in this collection
 */
export type GetThumbnailRequest = {
    messageType: "get-thumbnail";
    thumbPath: string;
};
