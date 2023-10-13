/**
 * Checks if the code is running in a browser by checking the existance of the window object.
 * @returns boolean
 */
export function isBrowser(): boolean {
    if (typeof window !== 'undefined') {
        return true;
    } else {
        return false;
    }
}

export function decodeHtmlEntity(str: string): string {
    return str.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });
}

/**
 * Converts the given named entity type to the form required by the
 * backend API: 'person' is converted to 'subject', 'place' to 'location'
 * and 'keyword' to 'tag'.
 * @param type string
 * @returns string
 */
export function convertNamedEntityTypeForBackend(type: string): string {
    return (type === 'person') ? 'subject'
        : (type === 'place') ? 'location'
        : (type === 'keyword') ? 'tag'
        : type;
}
