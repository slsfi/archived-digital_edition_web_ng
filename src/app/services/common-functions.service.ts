import { Injectable, NgZone } from '@angular/core';
import { Parser } from 'htmlparser2';

import { isBrowser } from '@utility-functions';


@Injectable({
  providedIn: 'root',
})
export class CommonFunctionsService {
  intervalTimerId: number;

  constructor(
    public ngZone: NgZone
  ) {
    this.intervalTimerId = 0;
  }


  /**
   * This function can be used to scroll a container so that the element which it
   * contains is placed either at the top edge of the container or in the center
   * of the container. This function can be called multiple times simultaneously
   * on elements in different containers, unlike the native scrollIntoView function
   * which cannot be called multiple times simultaneously in Chrome due to a bug.
   * Valid values for yPosition are 'top' and 'center'. The scroll behavior can
   * either be 'auto' or the default 'smooth'.
   */
  scrollElementIntoView(element: HTMLElement, yPosition = 'center', offset = 0, scrollBehavior = 'smooth', container?: HTMLElement) {
    if (element === undefined || element === null || (yPosition !== 'center' && yPosition !== 'top')) {
      return;
    }

    // Find the scrollable container of the element which is to be scrolled into view
    if (!container) {
      container = element.parentElement as HTMLElement;
      while (container !== null && container.parentElement !== null &&
        !container.classList.contains('scroll-content-container')) {
        container = container.parentElement;
      }
      if (container === null || container.parentElement === null) {
        return;
      }
    }

    const y = Math.floor(element.getBoundingClientRect().top + container.scrollTop - container.getBoundingClientRect().top);
    let baseOffset = 10;
    if (yPosition === 'center') {
      baseOffset = Math.floor(container.offsetHeight / 2);
      if (baseOffset > 45) {
        baseOffset = baseOffset - 45;
      }
    }
    if (scrollBehavior === 'smooth') {
      container.scrollTo({top: y - baseOffset - offset, behavior: 'smooth'});
    } else {
      container.scrollTo({top: y - baseOffset - offset, behavior: 'auto'});
    }
  }


  /**
   * Scrolls element into view and prepends arrow for the duration of timeOut.
   * @param element The target html element.
   * @param position Either 'top' or 'center'.
   * @param timeOut Timeout in milliseconds.
   * @param scrollBehavior Either 'smooth' or 'auto'.
   */
  scrollToHTMLElement(element: HTMLElement, position = 'top', timeOut = 5000, scrollBehavior = 'smooth') {
    try {
      this.ngZone.runOutsideAngular(() => {
        const tmpImage: HTMLImageElement = new Image();
        tmpImage.src = 'assets/images/ms_arrow_right.svg';
        tmpImage.alt = 'right arrow';
        tmpImage.classList.add('inl_ms_arrow');
        element.parentElement?.insertBefore(tmpImage, element);
        this.scrollElementIntoView(tmpImage, position, 0, scrollBehavior);
        setTimeout(function() {
          element.parentElement?.removeChild(tmpImage);
        }, timeOut);
      });
    } catch ( e ) {
      console.error(e);
    }
  }


  /**
   * Helper function for scrolling the collection text page horizontally.
   * @param columnElement which should be scrolled into view.
   * @param offset horizontal adjustment to scroll position.
   * @returns true on success, false on failure.
   */
  scrollCollectionTextColumnIntoView(columnElement: HTMLElement, offset: number = 26): boolean {
    if (!columnElement) {
      return false;
    }
    const scrollingContainer = document.querySelector(
      'page-text:not([ion-page-hidden]):not(.ion-page-hidden) ion-content.collection-ion-content'
    )?.shadowRoot?.querySelector('[part="scroll"]') as HTMLElement;
    if (scrollingContainer) {
      const x = columnElement.getBoundingClientRect().left
            + scrollingContainer.scrollLeft
            - scrollingContainer.getBoundingClientRect().left
            - offset;
      scrollingContainer.scrollTo({top: 0, left: x, behavior: 'smooth'});
      return true;
    } else {
      return false;
    }
  }


  /**
   * This function scrolls the collection text page horisontally to the last (rightmost) column.
   * It should be called after adding new views/columns.
   */
  scrollLastViewIntoView() {
    if (isBrowser()) {
      this.ngZone.runOutsideAngular(() => {
        let iterationsLeft = 10;
        clearInterval(this.intervalTimerId);
        const that = this;
        this.intervalTimerId = window.setInterval(function() {
          if (iterationsLeft < 1) {
            clearInterval(that.intervalTimerId);
          } else {
            iterationsLeft -= 1;
            const viewElements = document.querySelector('page-text:not([ion-page-hidden]):not(.ion-page-hidden)')?.getElementsByClassName('read-column');
            if (viewElements && viewElements[0] !== undefined) {
              const lastViewElement = viewElements[viewElements.length - 1] as HTMLElement;
              that.scrollCollectionTextColumnIntoView(lastViewElement, 0) && clearInterval(that.intervalTimerId);
            }
          }
        }.bind(this), 500);
      });
    }
  }


  /**
   * Searches for the first <mark> element that isn't in a footnote tooltip within
   * the given containerElement and scrolls it into view.
   * @param containerElement the context element to look for <mark> within
   * @param intervalTimerId reference to a variable where the return value of
   * window.setInterval can be stored
   */
  scrollToFirstSearchMatch(containerElement: HTMLElement, intervalTimerId: number) {
    if (isBrowser()) {
      this.ngZone.runOutsideAngular(() => {
        let iterationsLeft = 10;
        clearInterval(intervalTimerId);
        const that = this;

        intervalTimerId = window.setInterval(function() {
          if (iterationsLeft < 1) {
            clearInterval(intervalTimerId);
          } else {
            iterationsLeft -= 1;
            let target: HTMLElement | null | undefined = containerElement.querySelector('mark');

            if (
              target?.parentElement?.classList.contains('ttFixed') ||
              target?.parentElement?.parentElement?.classList.contains('ttFixed')
            ) {
              // The search match is in a footnote tooltip, look for next which isn't
              const targets: NodeListOf<HTMLElement> = containerElement.querySelectorAll('mark');
              let i = 0;

              while (
                target?.parentElement?.classList.contains('ttFixed') ||
                target?.parentElement?.parentElement?.classList.contains('ttFixed')
              ) {
                i++;
                target = targets[i];
              }
            }

            if (target) {
              that.scrollToHTMLElement(target);
              clearInterval(intervalTimerId);
            }
          }
        }.bind(this), 1000);
      });
    }
  }


  /**
   * TODO: The regex doesn't work if the match string in the text is interspersed with opening and closing tags.
   * For instance, in the text the match could have a span indicating page break:
   * Tavast<span class="tei pb_zts">|87|</span>länningar. This occurrence will not be marked
   * with <mark> tags in a search for "Tavastlänningar". However, these kind of matches are
   * found on the elastic-search page.
   * However, the regex does take care of self-closing tags in the match string, for instance <img/>.
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
  encodeSelectedCharEntities(text: string): string {
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


  /**
   * Given an object with nested objects in the property 'branchingKey',
   * returns a flattened array of the object. If 'requiredKey' is not
   * undefined, only objects that have a non-empty 'requiredKey' property
   * are included.
   */
  flattenObjectTree(data: any, branchingKey: string = 'children', requiredKey?: string) {
    const dataWithoutChildren = (({[branchingKey]: _, ...d}) => d)(data);
    let list: any[] = [];
    if (!requiredKey || (requiredKey && data[requiredKey])) {
        list = [dataWithoutChildren];
    }
    if (!data[branchingKey] && (!requiredKey || (requiredKey && data[requiredKey]))) {
      return list;
    }
    if (data[branchingKey]?.length) {
      for (const child of data[branchingKey]) {
        list = list.concat(this.flattenObjectTree(child, branchingKey, requiredKey));
      }
    }
    return list;
  }

}
