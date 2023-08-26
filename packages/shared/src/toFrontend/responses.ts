// HOW TO add a new response type
// Add a "...ResponseSuccess" type with the fields expected if success. Add "& Success" to the type as well. (This allows the consumer to use a discriminated union to get the right tyep)
// Add a "...ResponseFailure" type with the fields expected if failed. Add "& Failure" to the type as well. (This allows the consumer to use a discriminated union to get the right tyep)
// Add a "...Response" with the appropriate messageType, and " & " it with ( ...ResponseSuccess | ...ResponseFailuer)
// Or the newly added "...Response" into the definition of ResponseToFrontend at the top.

/**
 * The consumer of these types can use the "messageType" and "success" fields as discriminated unions to get the precise type,
 * even across the varying responses.
 * The consumer is also encouraged to check for success or failure because Typescript will not be able to infer the success response
 * unless the "success" field is checked (via discriminated union).
 * Note: This may all fall apart afterwards if the consumer use Mapped Types (e.g. Omit<...> or Partial<...>),
 *       so it's recommended for the consumer to avoid using Mapped Types if feasible.
 */
export type ResponseToFrontend = GetThumbnailResponse & {
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

export type GetThumbnailResponse = {
    messageType: "get-thumbnail-response";
} & (GetThumbnailResponseSuccess | GetThumbnailResponseFailure);

export type GetThumbnailResponseSuccess = {
    data: string;
    format: string;
} & Success;

export type GetThumbnailResponseFailure = GenericFailure;

export type UnpackZipFileResponse = {
    messageType: "unpack-zip-file-response";
} & (UnpackZipFileResponseSuccess | UnpackZipFileResponseFailure);

export type UnpackZipFileResponseSuccess = {
    data: string;
    format: string;
} & Success;

export type UnpackZipFileResponseFailure = GenericFailure;
