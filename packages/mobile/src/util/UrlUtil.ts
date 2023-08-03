/**
 * Given the unencoded query parameters, generates a well-formed URL with any special characters in the query parameters properly encoded.
 * @param origin - The left part of the URL: everything before the "?" that indicates the query string section.
 * @param unencodedQueryParams - The query parameters as key-value pairs.  The values should be in their raw, unencoded form.
 */
export function createUrlSafely(
    origin: string,
    unencodedQueryParams: Record<string, string>
) {
    // NOTE: Assumes that the key doesn't need to be encoded. (I've never run into a key that needed encoding)
    // But is that just luck, or is it not allowed for the keys to have special chars? I'm not sure.
    // Summary: Perhaps encodeURIComponent needs to be called on key too?
    const queryParamsString = Object.entries(unencodedQueryParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

    return `${origin}?${queryParamsString}`;
}
