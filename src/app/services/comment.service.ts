import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { CommonFunctionsService } from './common-functions.service';
import { config } from 'src/assets/config/config';


@Injectable({
  providedIn: 'root',
})
export class CommentService {
  cachedCollectionComments: Record<string, any> = {};
  activeCommentHighlight: any;
  activeLemmaHighlight: any;

  constructor(
    private http: HttpClient,
    public commonFunctions: CommonFunctionsService
  ) {
    this.activeCommentHighlight = {
      commentTimeOutId: null,
      commentLemmaElement: null,
    };
    this.activeLemmaHighlight = {
      lemmaTimeOutId: null,
      lemmaElement: null,
    };
  }

  /**
   * Returns an html fragment as a string observable of all comments for the specified text.
   * @param textItemID The full text id: <collectionID>_<publicationID>_<chapterID>.
   * <chapterID> is optional.
   * @returns Observable of string.
   */
  getComments(textItemID: string): Observable<any> {
    textItemID = textItemID.replace('_com', '').split(';')[0];

    if (this.cachedCollectionComments.hasOwnProperty(textItemID)) {
      // The comments for the text are cached
      return of(this.cachedCollectionComments[textItemID]);
    } else {
      const textIDParts = textItemID.split('_');
      const collection_id = textIDParts[0];
      const pub_id = textIDParts[1];
      let chapter_id = '';
      if (textIDParts[2] !== undefined) {
        chapter_id = textIDParts[2];
      }
  
      let url = '/text/' + collection_id + '/' + pub_id + '/com';
      if (chapter_id) {
        url += '/' + chapter_id + '/' + chapter_id;
      }
  
      url = config.app.apiEndpoint + '/' + config.app.machineName + url;

      return this.http.get(url).pipe(
        map((res) => {
          let body = res as any;
          if (body.content) {
            body = (body.content as string).trim();
            body = this.postprocessCommentsText(body);
            this.clearCachedCollectionComments();
            this.cachedCollectionComments[textItemID] = body;
          }
          return body || '';
        }),
        catchError(this.handleError)
      );
    }
  }

  /**
   * Returns the html fragment of a single comment as a string observable.
   * @param textItemID The full text id: <collectionID>_<publicationID>_<chapterID>.
   * <chapterID> is optional.
   * @param elementID Unique class name of the html element wrapping the comment.
   * @returns Observable of string.
   */
  getSingleComment(textItemID: string, elementID: string): Observable<any> {
    if (elementID == '') {
      return of('');
    }

    if (this.cachedCollectionComments.hasOwnProperty(textItemID)) {
      // The comments for the text are cached
      let singleComment = this.extractSingleComment(elementID, this.cachedCollectionComments[textItemID]);
      return of(singleComment);
    } else {
      // Comments not cached, get them from backend and then extract single comment
      const textIDParts = textItemID.split('_');
      const collection_id = textIDParts[0];
      const pub_id = textIDParts[1];
      let chapter_id = '';
      if (textIDParts[2] !== undefined) {
        chapter_id = textIDParts[2];
      }
  
      let url = '/text/' + collection_id + '/' + pub_id + '/com';
      if (chapter_id) {
        url += '/' + chapter_id + '/' + chapter_id;
      }
  
      url = config.app.apiEndpoint + '/' + config.app.machineName + url;
  
      return this.http.get(url).pipe(
        map((res) => {
          let body = res as any;
          if (body.content) {
            body = (body.content as string).trim();
            body = this.postprocessCommentsText(body);
            this.clearCachedCollectionComments();
            this.cachedCollectionComments[textItemID] = body;
            let singleComment = this.extractSingleComment(elementID, body);
            return singleComment;
          }
          return '';
        }),
        catchError(this.handleError)
      );
    }
  }

  /**
   * Returns an html fragment as a string with the comment with class
   * name @param elementID from the set of all comments in @param comments.
   * @returns String.
   */
  private extractSingleComment(elementID: string, comments: string): string {
    // TODO: document.createRange() is safe here because this function is only
    // called in the browser, however, this could be refactored to use the
    // SSR compatible htmlparser2 instead.
    const selector = '.' + elementID;
    const range = document.createRange();
    const docFrags = range.createContextualFragment(comments);
    const htmlElement = docFrags.querySelector(selector);
    if (htmlElement) {
      const htmlElementNext = htmlElement.nextElementSibling;
      const strippedBody = htmlElement.innerHTML;
      if (strippedBody !== undefined && strippedBody.length > 0) {
        return strippedBody || ' - no content - ';
      } else if (
        // TODO: not sure if this is needed, comments should never be in this format
        htmlElementNext?.nodeName === 'SPAN' &&
        htmlElementNext?.className.includes('tooltip')
      ) {
        return htmlElementNext.textContent || ' - no content - ';
      }
    }
    return ' - no content - ';
  }

  private async handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = (await error.json()) || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    throw errMsg;
  }

  getCorrespondanceMetadata(pub_id: any): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/correspondence/publication/metadata/' +
        pub_id + ''
    );
  }

  getDownloadableComments(id: string, format: string): Observable<any> {
    const id2 = id.replace('_com', '');
    const parts = id2.split(';');
    const collection_id = parts[0].split('_')[0];
    const pub_id = parts[0].split('_')[1];
    const chapter_id = parts[0].split('_')[2];

    if (!parts[1]) {
      parts[1] = '';
    }

    const commentId =
      collection_id +
      '_' +
      pub_id +
      (chapter_id === undefined && chapter_id !== '')
        ? '_' + chapter_id
        : '';
    let url =
      '/text/downloadable/' +
      format +
      '/' +
      collection_id +
      '/' +
      pub_id +
      '/com';

    if (chapter_id !== undefined && chapter_id !== '') {
      url = url + '/' + chapter_id;
    }

    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        url
    );
  }

  postprocessCommentsText(text: string) {
    // Replace png images with svg counterparts
    text = text.replace(/\.png/g, '.svg');
    // Fix image paths
    text = text.replace(/images\//g, 'assets/images/');
    // Add "teiComment" to all classlists
    text = text.replace(
      /class=\"([a-z A-Z _ 0-9]{1,140})\"/g,
      'class=\"teiComment $1\"'
      );
    
    // text = text.replace(/(teiComment teiComment )/g, 'teiComment ');
    // text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // text = text.replace(/&amp;/g, '&');

    return text;
  }

  clearCachedCollectionComments() {
    for (const property in this.cachedCollectionComments) {
      if (this.cachedCollectionComments.hasOwnProperty(property)) {
        delete this.cachedCollectionComments[property];
      }
    }
  }

  /* Use this function to scroll the lemma of a comment into view in the reading text view. */
  /**
   * Function used to scroll the lemma of a comment into view in the reading text view.
   * @param lemmaStartElem The html element marking the start of the lemma in the reading text view.
   * @param timeOut Duration for showing an arrow at the start of the lemma in the reading text view.
   */
  scrollToCommentLemma(lemmaStartElem: HTMLElement, timeOut = 5000) {
    if (
      lemmaStartElem !== null &&
      lemmaStartElem !== undefined &&
      lemmaStartElem.classList.contains('anchor_lemma')
    ) {
      if (this.activeLemmaHighlight.lemmaTimeOutId !== null) {
        // Clear previous lemma highlight if still active
        this.activeLemmaHighlight.lemmaElement.style.display = null;
        window.clearTimeout(this.activeLemmaHighlight.lemmaTimeOutId);
      }

      lemmaStartElem.style.display = 'inline';
      this.commonFunctions.scrollElementIntoView(lemmaStartElem);
      const settimeoutId = setTimeout(() => {
        lemmaStartElem.style.display = '';
        this.activeLemmaHighlight = {
          lemmaTimeOutId: null,
          lemmaElement: null,
        };
      }, timeOut);

      this.activeLemmaHighlight = {
        lemmaTimeOutId: settimeoutId,
        lemmaElement: lemmaStartElem,
      };
    }
  }

  /**
   * Function for scrolling to the comment with the specified numeric id
   * (excluding prefixes like 'end') in the first comments view on the page.
   * Alternatively, the comment element can be passed as an optional parameter.
   * @param numericId The numeric id of the comment as a string. Must not contain prefixes like 'en',
   * 'end' or 'start'.
   * @param commentElement Optionally passed comment element. If omitted, the correct comment
   * element will be searched for using numericId.
   */
  scrollToComment(numericId: string, commentElement?: HTMLElement) {
    let elem = commentElement;
    if (
      elem === undefined ||
      elem === null ||
      !elem.classList.contains('en' + numericId)
    ) {
      // Find the comment in the comments view.
      const commentsWrapper = document.querySelector(
        'page-text:not([ion-page-hidden]):not(.ion-page-hidden) comments'
      ) as HTMLElement;
      elem = commentsWrapper.getElementsByClassName(
        'en' + numericId
      )[0] as HTMLElement;
    }
    if (elem !== null && elem !== undefined) {
      if (this.activeCommentHighlight.commentTimeOutId !== null) {
        // Clear previous comment highlight if still active
        this.activeCommentHighlight.commentLemmaElement.classList.remove(
          'highlight'
        );
        window.clearTimeout(this.activeCommentHighlight.commentTimeOutId);
      }

      // Scroll the comment into view.
      this.commonFunctions.scrollElementIntoView(elem, 'center', -5);
      const noteLemmaElem = elem.getElementsByClassName(
        'noteLemma'
      )[0] as HTMLElement;
      noteLemmaElem.classList.add('highlight');
      const settimeoutId = setTimeout(() => {
        noteLemmaElem.classList.remove('highlight');
        this.activeCommentHighlight = {
          commentTimeOutId: null,
          commentLemmaElement: null,
        };
      }, 5000);

      this.activeCommentHighlight = {
        commentTimeOutId: settimeoutId,
        commentLemmaElement: noteLemmaElem,
      };
    }
  }
}
