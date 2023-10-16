/**
 * If the given value exists in the array, it is removed from the array.
 * Otherwise the value is added to the array.
 * @param array to add or remove value to/from.
 * @param value to add to or remove from array.
 */
export function addOrRemoveValueInArray(array: any[], value: any) {
    let index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
    } else {
        array.push(value);
    }
}


/**
 * Given an array with names of people, this function return a string
 * where the names have been concatenated. The string given in 'separator'
 * is used as a separator between all of the names except between the
 * second to last and last, which are separated by an ampersand (&).
 * @param names An array of strings with the names that are to be concatenated.
 * @returns A string with the names concatenated.
 */
export function concatenateNames(names: string[], separator = ';') {
    let names_str = '';
    for (let i = 0; i < names.length; i++) {
        names_str = names_str + names[i];
        if (names.length > 2) {
            if (i < names.length - 2) {
                names_str = names_str + separator + ' ';
            } else if (i < names.length - 1) {
                names_str = names_str + ' \u0026 ';
            }
        } else if (names.length === 2 && i < 1) {
            names_str = names_str + ' \u0026 ';
        }
    }
    return names_str;
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


/**
 * Parses the given string for encoded HTML entities and decodes them.
 * @param string to parse.
 * @returns modified string.
 */
export function decodeHtmlEntity(string: string): string {
    return string.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });
}


/**
 * Checks if the code is running in a browser by checking the existance
 * of the window object.
 * @returns boolean
 */
export function isBrowser(): boolean {
    if (typeof window !== 'undefined') {
        return true;
    } else {
        return false;
    }
}


/**
 * Returns true if the given object is empty, i.e. has no properties, else false.
 */
export function isEmptyObject(obj: any) {
    return !(() => {
        for (const i in obj) {
            return true;
        }
        return false;
    })();
}


/**
 * Check if a number is even.
 */
export function numberIsEven(value: number) {
    if (value % 2 === 0) {
        return true;
    } else {
        return false;
    }
}


/**
 * Function for sorting an array of objects alphabetically ascendingly based
 * on the given object key (field).
 */
export function sortArrayOfObjectsAlphabetically(
    arrayToSort: any,
    fieldToSortOn: string
) {
    if (Array.isArray(arrayToSort)) {
        arrayToSort.sort((a, b) => {
            const fieldA = String(a[fieldToSortOn]).toUpperCase();
            const fieldB = String(b[fieldToSortOn]).toUpperCase();
            if (fieldA < fieldB) {
                return -1;
            }
            if (fieldA > fieldB) {
                return 1;
            }
            return 0;
        });
    }
}


/**
 * Function for sorting an array of objects numerically based on the
 * given object key (field). The order can be either ascendingly
 * 'asc' or descendingly 'desc'.
 */
export function sortArrayOfObjectsNumerically(
    arrayToSort: any,
    fieldToSortOn: string,
    order: string = 'desc'
) {
    if (Array.isArray(arrayToSort)) {
        arrayToSort.sort((a, b) => {
            if (a[fieldToSortOn] && b[fieldToSortOn]) {
                if (a[fieldToSortOn] > b[fieldToSortOn]) {
                    if (order === 'desc') {
                        return -1;
                    } else {
                        return 1;
                    }
                }
                if (a[fieldToSortOn] < b[fieldToSortOn]) {
                    if (order === 'desc') {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            }
            return 0;
        });
    }
}


/**
 * Check if a file is found behind the given url. Returns 1 if file found,
 * otherwise 0.
 */
export async function urlExists(url: string) {
    try {
        const response = await fetch(
            url, { method: 'HEAD', cache: 'no-store' }
        );
        if (response.ok && response.status !== 404) {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log('Could not fetch ', url);
        console.error(`${error}`);
        return 0;
    }
}
