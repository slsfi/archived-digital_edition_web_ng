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
