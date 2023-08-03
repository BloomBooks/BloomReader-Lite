export function getQueryParam(paramName: string) {
    const params = new URLSearchParams(window.location.search);
    const encodedParamValue = params.get(paramName);
    if (!encodedParamValue) {
        return encodedParamValue;
    }

    return decodeURIComponent(encodedParamValue);
}
