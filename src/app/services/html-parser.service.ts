import { Injectable } from '@angular/core';
import { Parser } from 'htmlparser2';


@Injectable({
    providedIn: 'root',
})
export class HtmlParserService {

    /**
     * Inserts <mark> tags in 'text' (html as a string) around the strings
     * defined in 'matches'.
     * 
     * TODO: The regex doesn't work if the match string in the text is
     * interspersed with opening and closing tags.
     * 
     * For instance, in the text the match could have a span indicating
     * page break:
     * Tavast<span class="tei pb_zts">|87|</span>länningar.
     * This occurrence will not be marked with <mark> tags in a search for
     * "Tavastlänningar". These kind of matches ARE found on the elastic-
     * search page. However, the regex does take care of self-closing tags
     * in the match string, for instance <img/>.
     */
    insertSearchMatchTags(text: string, matches: string[] | undefined) {
        if (matches instanceof Array && matches.length > 0) {
            matches.forEach((val) => {
                if (val) {
                    // Replace spaces in the match string with a regex and also insert a regex between each
                    // character in the match string. This way html tags inside the match string can be
                    // ignored when searching for the match string in the text.
                    let c_val = '';
                    for (let i = 0; i < val.length; i++) {
                        const char = val.charAt(i);
                        if (char === ' ') {
                            c_val = c_val + '(?:\\s*<[^>]+>\\s*)*\\s+(?:\\s*<[^>]+>\\s*)*';
                        } else if (i < val.length - 1) {
                            c_val = c_val + char + '(?:<[^>]+>)*';
                        } else {
                            c_val = c_val + char;
                        }
                    }
                    const re = new RegExp('(?<=^|\\P{L})(' + c_val + ')(?=\\P{L}|$)', 'gumi');
                    text = text.replace(re, '<mark>$1</mark>');
                }
            });
        }
        return text;
    }


    getSearchMatchesFromQueryParams(terms: string | string[]): string[] {
        const queryMatches: string[] = Array.isArray(terms)
            ? terms : [terms];
        let matches: string[] = [];

        if (queryMatches.length && queryMatches[0]) {
            queryMatches.forEach((term: any) => {
                // Remove line break characters
                let decoded_match = term.replace(/\n/gm, '');
                // Remove any script tags
                decoded_match = decoded_match.replace(/<script.+?<\/script>/gi, '');
                decoded_match = this.encodeSelectedCharEntities(decoded_match);
                matches.push(decoded_match);
            });
        }
        return matches;
    }


    /**
     * Returns the text with all occurrences of a selected set of characters
     * replaced with their corresponding character entity references.
     * The replaced characters are: & < > " ' ℔ ʄ
     * @param text string or html fragment as string to be encoded
     * @returns encoded text 
     */
    private encodeSelectedCharEntities(text: string): string {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&apos;',
            '℔': '&#x2114;',
            'ʄ': '&#x284;'
        };

        // First parse the text using SSR compatible htmlparser2 as html,
        // which will decode all entity references, otherwise & in
        // existing entity references will be replaced.
        let parsed_text = '';
        let isBody = false;
        const parser2 = new Parser({
            onopentagname(tag) {
                if (tag === 'body') {
                    isBody = true;
                }
            },
            ontext(textContent) {
                if (isBody) {
                    parsed_text += textContent;
                }
            },
            onclosetag(tag) {
                if (tag === 'body') {
                    isBody = false;
                }
            }
        });
        parser2.write('<!DOCTYPE html><html><body>' + text + '</body></html>');
        parser2.end();

        // Then encode the selected characters
        Object.entries(entities).forEach(([code, entity]) => {
            const re = new RegExp('[' + code + ']', 'gi');
            parsed_text = parsed_text.replace(re, entity);
        });

        return parsed_text;
    }

}
