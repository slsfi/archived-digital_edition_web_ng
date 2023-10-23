import { Component, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { AsyncPipe, DOCUMENT, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { config } from '@config';
import { CollectionContentService } from '@services/collection-content.service';
import { CollectionsService } from '@services/collections.service';
import { CollectionTableOfContentsService } from '@services/collection-toc.service';
import { CommentService } from '@services/comment.service';
import { HtmlParserService } from '@services/html-parser.service';
import { ViewOptionsService } from '@services/view-options.service';
import { concatenateNames } from '@utility-functions';


@Component({
  standalone: true,
  selector: 'page-download-texts-modal',
  templateUrl: 'download-texts-modal.html',
  styleUrls: ['download-texts-modal.scss'],
  imports: [AsyncPipe, NgClass, NgFor, NgIf, NgStyle, IonicModule]
})
export class DownloadTextsModal implements OnInit {
  @Input() origin: string = '';
  @Input() textItemID: string = '';

  collectionId: string = '';
  collectionTitle: string = '';
  commentTitle: string = '';
  copyrightText: string = '';
  copyrightURL: string = '';
  downloadFormatsCom: string[] = [];
  downloadFormatsEst: string[] = [];
  downloadFormatsIntro: string[] = [];
  downloadFormatsMs: string[] = [];
  instructionsText: string = '';
  introductionMode: boolean = false;
  introductionTitle: string = '';
  loadingCom: boolean = false;
  loadingEst: boolean = false;
  loadingIntro: boolean = false;
  loadingMs: boolean = false;
  manuscriptsList$: Observable<any[]>;
  readTextLanguages: string[] = [];
  printTranslation: string = '';
  publicationTitle: string = '';
  readTextsMode: boolean = false;
  showLoadingError: boolean = false;
  showMissingTextError: boolean = false;
  showPrintError: boolean = false;
  siteUrl: string = '';
  publicationData$: Observable<any>;
  textSizeTranslation: string = '';

  constructor(
    private collectionContentService: CollectionContentService,
    private collectionsService: CollectionsService,
    private commentService: CommentService,
    private modalCtrl: ModalController,
    private parserService: HtmlParserService,
    private tocService: CollectionTableOfContentsService,
    private viewOptionsService: ViewOptionsService,
    @Inject(LOCALE_ID) private activeLocale: string,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Get configs
    this.readTextLanguages = config.app?.i18n?.multilingualReadingTextLanguages ?? [];
    if (this.readTextLanguages.length < 2) {
      this.readTextLanguages = ['default'];
    }

    this.siteUrl = config.app?.siteURLOrigin ?? '';

    const formatsCom = config.modal?.downloadTexts?.commentsFormats ?? {};
    const formatsEst = config.modal?.downloadTexts?.readTextFormats ?? {};
    const formatsIntro = config.modal?.downloadTexts?.introductionFormats ?? {};
    const formatsMs = config.modal?.downloadTexts?.manuscriptsFormats ?? {};

    const supportedFormats: string[] = ['xml', 'html', 'xhtml', 'txt', 'print'];

    // Set enabled download formats
    Object.entries(formatsCom).forEach(([key, value]) => {
      if (value && supportedFormats.includes(key)) {
        this.downloadFormatsCom.push(key);
      }
    });

    Object.entries(formatsEst).forEach(([key, value]) => {
      if (value && supportedFormats.includes(key)) {
        this.downloadFormatsEst.push(key);
      }
    });

    Object.entries(formatsIntro).forEach(([key, value]) => {
      if (value && supportedFormats.includes(key)) {
        this.downloadFormatsIntro.push(key);
      }
    });

    Object.entries(formatsMs).forEach(([key, value]) => {
      if (value && supportedFormats.includes(key)) {
        this.downloadFormatsMs.push(key);
      }
    });

    // Move any 'print' formats to the end of the arrays
    this.downloadFormatsCom.length && this.downloadFormatsCom.push(
      this.downloadFormatsCom.splice(this.downloadFormatsCom.indexOf('print'), 1)[0]
    );
    this.downloadFormatsEst.length && this.downloadFormatsEst.push(
      this.downloadFormatsEst.splice(this.downloadFormatsEst.indexOf('print'), 1)[0]
    );
    this.downloadFormatsIntro.length && this.downloadFormatsIntro.push(
      this.downloadFormatsIntro.splice(this.downloadFormatsIntro.indexOf('print'), 1)[0]
    );
    this.downloadFormatsMs.length && this.downloadFormatsMs.push(
      this.downloadFormatsMs.splice(this.downloadFormatsMs.indexOf('print'), 1)[0]
    );
  }

  ngOnInit(): void {
    // Set which page has initiated the download modal
    if (this.origin === 'page-text') {
      this.readTextsMode = true;
    } else if (this.origin === 'page-introduction') {
      this.introductionMode = true;
    }

    this.setTranslations();

    if (this.textItemID) {
      // Parse text item id
      const idParts = this.textItemID.split(';')[0].split('_');
      this.collectionId = idParts[0];

      this.setCollectionTitle();

      if (this.readTextsMode) {
        // Get publication title from TOC (this way we can also get
        // correct chapter titles for publications with chapters)
        this.setPublicationTitle();

        if (this.downloadFormatsEst.length || this.downloadFormatsCom.length) {
          this.publicationData$ = this.collectionsService.getPublication(
            idParts[1]
          );
        }

        if (this.downloadFormatsMs.length) {
          this.manuscriptsList$ = this.collectionContentService.getManuscriptsList(
            this.textItemID
          ).pipe(
            map((res: any) => {
              return res?.manuscripts?.length ? res.manuscripts : null;
            })
          );
        }
      }
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  initiateDownload(textType: string, format: string, language?: string, typeID?: number) {
    this.showLoadingError = false;
    this.showMissingTextError = false;
    this.showPrintError = false;
    let mimetype = 'application/xml';
    let fileExtension = 'xml';

    if (format === 'txt') {
      mimetype = 'text/plain';
      fileExtension = 'txt';
    } else if (format === 'html') {
      mimetype = 'text/html';
      fileExtension = 'html';
    } else if (format === 'xhtml') {
      mimetype = 'application/xhtml+xml';
      fileExtension = 'xhtml';
    }

    if (textType === 'intro') {
      this.loadingIntro = true;
      this.collectionContentService.getDownloadableIntroduction(
        this.textItemID, format, this.activeLocale
      ).subscribe({
        next: (res: any) => {
          const blob = new Blob([res.content || ''], {type: mimetype});
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = this.convertToFilename(this.introductionTitle + '-' + this.collectionTitle)
                + '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingIntro = false;
          URL.revokeObjectURL(blobUrl);
        },
        error: (e: any) => {
          console.error('error getting introduction in ' + format + ' format', e);
          this.loadingIntro = false;
          this.showLoadingError = true;
        }
      });
    } else if (textType === 'est') {
      this.loadingEst = true;
      if (language === 'default' || !language) {
        language = '';
      }
      this.collectionContentService.getDownloadableReadText(
        this.textItemID, format, language
      ).subscribe({
        next: (res: any) => {
          const langForFilename = language ? '_' + language : '';
          const blob = new Blob([res.content], {type: mimetype});
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = this.convertToFilename(this.publicationTitle)
                + langForFilename + '_id-' + this.textItemID.split('_')[1] + '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingEst = false;
          URL.revokeObjectURL(blobUrl);
        },
        error: (e: any) => {
          console.error('error getting read text in ' + format + ' format', e);
          this.loadingEst = false;
          this.showLoadingError = true;
        }
      });
    } else if (textType === 'com') {
      this.loadingCom = true;
      this.commentService.getDownloadableComments(this.textItemID, format).subscribe({
        next: (res: any) => {
          const blob = new Blob([res.content], {type: mimetype});
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = this.convertToFilename(this.publicationTitle + '-' + this.commentTitle)
                + '_id-' + this.textItemID.split('_')[1] + '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingCom = false;
          URL.revokeObjectURL(blobUrl);
        },
        error: (e: any) =>  {
          console.error('error getting comments in ' + format + ' format', e);
          this.loadingCom = false;
          this.showLoadingError = true;
        }
      });
    } else if (textType === 'ms') {
      this.loadingMs = true;
      this.collectionContentService.getDownloadableManuscript(this.textItemID, typeID || 0, format).subscribe({
        next: (res: any) => {
          const blob = new Blob([res.content], {type: mimetype});
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = this.convertToFilename(this.publicationTitle)
                + '_id-' + this.textItemID.split('_')[1] + '_ms-' + typeID + '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingMs = false;
          URL.revokeObjectURL(blobUrl);
        },
        error: (e: any) =>  {
          console.error('error getting manuscript ' + typeID + ' in ' + format + ' format', e);
          this.loadingMs = false;
          this.showLoadingError = true;
        }
      });
    }
  }

  openPrintFriendlyText(textType: string, language?: string, typeID?: number) {
    if (language === 'default' || !language) {
      language = '';
    }
    this.showLoadingError = false;
    this.showMissingTextError = false;
    this.showPrintError = false;
    if (textType === 'intro') {
      this.loadingIntro = true;
      this.openIntroductionForPrint();
    } else if (textType === 'est') {
      this.loadingEst = true;
      this.openReadTextForPrint(language);
    } else if (textType === 'com') {
      this.loadingCom = true;
      this.openCommentsForPrint();
    } else if (textType === 'ms') {
      this.loadingMs = true;
      this.openManuscriptForPrint(typeID || 0);
    }
  }

  private openIntroductionForPrint() {
    this.collectionContentService.getIntroduction(this.textItemID, this.activeLocale).subscribe({
      next: (res: any) => {
        if (res?.content) {
          let text = res.content.replace(/images\//g, 'assets/images/').replace(/\.png/g, '.svg');
          text = this.fixImagePaths(text);
          text = this.constructHtmlForPrint(text, 'intro');

          try {
            const newWindowRef = window.open();
            if (newWindowRef) {
              newWindowRef.document.write(text);
              newWindowRef.document.close();
              newWindowRef.focus();
            } else {
              this.showPrintError = true;
              console.log('unable to open new window');
            }
          } catch (e: any) {
            this.showPrintError = true;
            console.error('error opening introduction in print format in new window', e);
          }
        } else {
          this.showPrintError = true;
          console.log('invalid introduction text format');
        }
        this.loadingIntro = false;
      },
      error: (e: any) => {
        console.error('error loading introduction', e);
        this.loadingIntro = false;
        this.showPrintError = true;
      }
    });
  }

  private openReadTextForPrint(language: string) {
    this.collectionContentService.getReadText(this.textItemID, language).subscribe({
      next: (res: any) => {
        if (
          res?.content &&
          res?.content !== '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>File not found</body></html>'
        ) {
          let text: string = res.content;
          text = this.parserService.postprocessReadText(text, this.textItemID.split('_')[0]);
          text = this.fixImagePaths(text);
          text = text.replace('<p> </p><p> </p><section role="doc-endnotes"><ol class="tei footnotesList"></ol></section>', '');

          text = this.constructHtmlForPrint(text, 'est', language);

          try {
            const newWindowRef = window.open();
            if (newWindowRef) {
              newWindowRef.document.write(text);
              newWindowRef.document.close();
              newWindowRef.focus();
            } else {
              this.showPrintError = true;
              console.log('unable to open new window');
            }           
          } catch (e) {
            this.showPrintError = true;
            console.error('error opening read text in print format in new window', e);
          }
          this.loadingEst = false;
        } else {
          this.loadingEst = false;
          this.showMissingTextError = true;
          console.log('read text does not exits');
        }
      },
      error: (e: any) => {
        console.error('error loading read text', e);
        this.loadingEst = false;
        this.showPrintError = true;
      }
    });
  }

  private openCommentsForPrint() {
    forkJoin([
      this.commentService.getComments(this.textItemID).pipe(
        catchError(error => of({ error }))
      ),
      this.commentService.getCorrespondanceMetadata(this.textItemID.split('_')[1]).pipe(
        catchError(error => of({ error }))
      )
    ]).pipe(
      map((res: any[]) => {
        return { comments: res[0], metadata: res[1] };
      })
    ).subscribe((commentsData: any) => {
      if (commentsData?.comments && !commentsData.comments.error) {
        let comContent  = this.constructHtmlForPrint(commentsData.comments, 'com');
        let metaContent = '';

        if (commentsData.metadata?.letter) {
          let concatSenders = '';
          let concatReceivers = '';

          if (commentsData.metadata?.subjects?.length > 0) {
            const senders: string[] = [];
            const receivers: string[] = [];
            commentsData.metadata.subjects.forEach((subject: any) => {
              if (subject['avs\u00e4ndare']) {
                senders.push(subject['avs\u00e4ndare']);
              }
              if (subject['mottagare']) {
                receivers.push(subject['mottagare']);
              }
            });
            concatSenders = concatenateNames(senders);
            concatReceivers = concatenateNames(receivers);
          }

          if (commentsData.metadata.letter) {
            metaContent = this.getCorrespondenceDataAsHtml(
              commentsData.metadata.letter, concatSenders, concatReceivers
            );
            const contentParts = comContent.split('</div>\n</comments>');
            comContent = contentParts[0] + metaContent + '</div>\n</comments>' + contentParts[1];
          }
        }

        try {
          const newWindowRef = window.open();
          if (newWindowRef) {
            newWindowRef.document.write(comContent);
            newWindowRef.document.close();
            newWindowRef.focus();
          } else {
            this.showPrintError = true;
            console.log('unable to open new window');
          }
        } catch (e: any) {
          this.showPrintError = true;
          console.error('error opening comment text in print format in new window', e);
        }
        this.loadingCom = false;
      } else {
        console.log('invalid comments format or error loading comments data');
        this.loadingCom = false;
        this.showPrintError = true;
      }
    });
  }

  private openManuscriptForPrint(typeID: number) {
    this.collectionContentService.getManuscripts(this.textItemID, typeID).subscribe({
      next: (res: any) => {
        if (
          res?.manuscripts?.length > 0 &&
          res?.manuscripts[0]?.manuscript_changes
        ) {
          let text: string = res.manuscripts[0].manuscript_changes;
          text = this.parserService.postprocessManuscriptText(text);
          text = this.fixImagePaths(text);
          text = this.constructHtmlForPrint(text, 'ms', res.manuscripts[0].language);

          try {
            const newWindowRef = window.open();
            if (newWindowRef) {
              newWindowRef.document.write(text);
              newWindowRef.document.close();
              newWindowRef.focus();
            } else {
              this.showPrintError = true;
              console.log('unable to open new window');
            }           
          } catch (e) {
            this.showPrintError = true;
            console.error('error opening manuscript text in print format in new window', e);
          }
          this.loadingMs = false;
        } else {
          this.loadingMs = false;
          this.showPrintError = true;
          console.log('invalid manuscript text format');
        }
      },
      error: (e: any) => {
        console.error('error loading manuscript text', e);
        this.loadingMs = false;
        this.showPrintError = true;
      }
    });
  }

  private constructHtmlForPrint(text: string, textType: string, language?: string) {
    const cssStylesheets = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].href) {
        cssStylesheets.push(document.styleSheets[i].href);
      }
    }

    let header = '<!DOCTYPE html>\n';
    if (language) {
      header += '<html lang="' + language + '" class="hydrated">\n';
    } else {
      header += '<html class="hydrated">\n';
    }
    header += '<head>\n';
    header += '<meta charset="UTF-8">\n';
    header += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    header += '<title>' + this.constructPrintHtmlTitle(textType) + '</title>\n';
    cssStylesheets.forEach(sheetUrl => {
      header += '<link href="' + sheetUrl + '" rel="stylesheet">\n';
    });
    header += '<style>\n';
    header += '    body  { background-color: #fff; position: static; overflow: auto; height: initial; max-height: initial; width: initial; }\n';
    header += '    page-text, page-introduction { display: block; padding: 0 1.5em 4em 1.5em; }\n';
    header += '    div.tei.teiContainer * { cursor: auto !important; }\n';
    header += '    div.tei.teiContainer { padding-bottom: 0; line-height: 1.45em; }\n';
    header += '    div.tei.teiContainer p { line-height: 1.45em; }\n';
    header += '    div.tei p.teiComment.note { margin-top: 0.25rem; margin-left: 1.5em; text-indent: -1.5em; }\n';
    header += '    read-text .tei.show_paragraphNumbering, page-introduction .tei.show_paragraphNumbering { padding-left: 35px; }\n';
    header += '    div.tei ol.footnotesList li.footnoteItem a.footnoteReference { color: initial; }\n';
    header += '    page-introduction div.tei span.footnoteindicator { color: initial; }\n';
    header += '    h1, h2, h3, h4, h5, h6 { break-after: avoid; break-inside: avoid; }\n';
    header += '    h1.tei.commentPublicationTitle { font-variant: small-caps; }\n';
    header += '    table { page-break-inside:auto; }\n';
    header += '    tr    { page-break-inside:avoid; page-break-after:auto; }\n';
    header += '    thead { display:table-header-group; }\n';
    header += '    tfoot { display:table-footer-group; }\n';
    header += '    .print-header { padding: 1px; margin-bottom: 2rem; background-color: #ededed; }\n';
    header += '    .print-header button { display: block; font-family: var(--font-stack-system); font-size: 1rem; font-weight: 600; text-shadow: 0 0.04em 0.04em rgba(0,0,0,0.35); text-transform: uppercase; color: #fff; background-color: #2a75cb; border-radius: 0.4em; padding: 0.5em 1.3em; margin: 2em auto; cursor: pointer; transition: all 0.2s; line-height: 1.5; }\n';
    header += '    .print-header button:hover, .print-header button:focus { background-color: #12447e; }\n';
    header += '    .slide-container { font-family: var(--font-stack-system); display: flex; flex-direction: column; align-items: center; }\n';
    header += '    .slide-container label { font-weight: 600; }\n';
    header += '    .slider { width: 300px; max-width: 90%; margin: 1em auto 0.25em auto; display: block; }\n';
    header += '    .slide-container .range-labels { width: 300px; max-width: 90%; display: flex; justify-content: space-between; align-items: center; padding: 0 1px 0 4px; margin-bottom: 2em; font-size: 1rem; font-weight: 600; }\n';
    header += '    .slide-container .range-labels .smallest { font-size: 0.75rem; }\n';
    header += '    .slide-container .range-labels .largest { font-size: 1.375rem; }\n';
    header += '    @media only print {\n';
    header += '        .print-header, .print-header button { display: none; }\n';
    header += '        page-text, page-introduction { padding: 0; }\n';
    header += '    }\n';
    header += '    @page { size: auto; margin: 25mm 20mm 25mm 20mm; }\n';
    header += '</style>\n';
    header += '</head>\n';
    header += '<body class="print-mode">\n';
    header += '<div class="print-header" lang="' + this.activeLocale + '">\n';
    header += '    <button type="button" tabindex="0" onclick="window.print();return false;">' + this.printTranslation + '</button>\n';
    header += '    <div class="slide-container">\n';
    header += '        <label for="textSizeSlider">' + this.textSizeTranslation + '</label>\n';
    header += '        <input type="range" min="1" max="7" value="3" class="slider" id="textSizeSlider" list="tickmarks">\n';
    header += '        <datalist id="tickmarks">\n';
    header += '        <option value="1"></option>\n';
    header += '        <option value="2"></option>\n';
    header += '        <option value="3"></option>\n';
    header += '        <option value="4"></option>\n';
    header += '        <option value="5"></option>\n';
    header += '        <option value="6"></option>\n';
    header += '        <option value="7"></option>\n';
    header += '        </datalist>\n';
    header += '        <div class="range-labels"><span class="smallest">A</span><span class="largest">A</span></div>\n';
    header += '    </div>\n';
    header += '</div>\n';
    if (textType === 'intro') {
      header += '<page-introduction>\n';
    } else {
      header += '<page-text>\n';
    }
    header += '<div id="contentContainer" class="content xxxsmallFontSize">\n';
    if (textType === 'est') {
      header += '<read-text>\n';
    } else if (textType === 'com') {
      header += '<comments>\n';
    } else if (textType === 'ms') {
      header += '<manuscripts>\n';
    }
    header += '<div class="tei teiContainer ' + this.getViewOptionsClassNames(textType) + '">\n';
    if (textType === 'com') {
      header += '<h1 class="tei commentPublicationTitle">' + this.publicationTitle + '</h1>\n';
    }

    let closer = '</div>\n';
    if (textType === 'est') {
      closer += '</read-text>\n';
    } else if (textType === 'com') {
      closer += '</comments>\n';
    } else if (textType === 'ms') {
      closer += '</manuscripts>\n';
    }
    closer += '</div>\n';
    if (textType === 'intro') {
      closer += '</page-introduction>\n';
    } else {
      closer += '</page-text>\n';
    }
    closer += '<script>\n';
    closer += '    const slider = document.getElementById("textSizeSlider");\n';
    closer += '    const contentWrapper = document.getElementById("contentContainer")\n';
    closer += '    slider.oninput = function() {\n';
    closer += '        let fontSize = "";\n';
    closer += '        if (this.value === "1") {\n';
    closer += '            fontSize = "miniFontSize";\n';
    closer += '        } else if (this.value === "2") {\n';
    closer += '            fontSize = "tinyFontSize";\n';
    closer += '        } else if (this.value === "4") {\n';
    closer += '            fontSize = "xxsmallFontSize";\n';
    closer += '        } else if (this.value === "5") {\n';
    closer += '            fontSize = "xsmallFontSize";\n';
    closer += '        } else if (this.value === "6") {\n';
    closer += '            fontSize = "smallFontSize";\n';
    closer += '        } else if (this.value === "7") {\n';
    closer += '            fontSize = "mediumFontSize";\n';
    closer += '        } else {\n';
    closer += '            fontSize = "xxxsmallFontSize";\n';
    closer += '        }\n';
    closer += '        const classes = contentWrapper.className.split(" ");\n';
    closer += '        for (let i = 0; i < classes.length; i++) {\n';
    closer += '            if (classes[i].indexOf("FontSize") !== -1) {\n';
    closer += '                contentWrapper.classList.remove(classes[i]);\n';
    closer += '                break;\n';
    closer += '            }\n';
    closer += '        }\n';
    closer += '        contentWrapper.classList.add(fontSize);\n';
    closer += '    }\n';
    closer += '    \n';
    closer += '</script>\n';
    closer += '</body>\n';
    closer += '</html>\n';

    text = header + text + closer;
    return text;
  }

  private getViewOptionsClassNames(textType: string): string {
    let classes = '';
    if (textType === 'est' || textType === 'intro') {
      if (this.viewOptionsService.show.paragraphNumbering) {
        classes += 'show_paragraphNumbering ';
      }
      if (this.viewOptionsService.show.pageBreakEdition) {
        classes += 'show_pageBreakEdition ';
      }
      if (textType === 'est' && this.viewOptionsService.show.pageBreakOriginal) {
        classes += 'show_pageBreakOriginal ';
      }
    }
    return classes.trim();
  }

  private constructPrintHtmlTitle(textType: string) {
    let title: string = '';
    if (textType === 'intro') {
      if (this.introductionTitle) {
        title = this.introductionTitle + ' | ';
      }
      title += this.collectionTitle;
      if (this.siteUrl) {
        title += ' | ' + this.siteUrl;
      }
    } else {
      title = this.publicationTitle;
      if (title) {
        title += ' | ';
      }
      title += this.collectionTitle;
      if (this.siteUrl) {
        title += ' | ' + this.siteUrl;
      }
      if (textType === 'com' && this.commentTitle) {
        title = this.commentTitle + ' | ' + title;
      }
    }
    return title;
  }

  private setTranslations() {
    // Set translations
    if (this.readTextsMode) {
      this.commentTitle = $localize`:@@Read.Comments.Title:Kommentarer`;

      if ($localize`:@@DownloadTexts.Instructions:Här kan du ladda ner texterna i olika format. Du kan också öppna texterna i utskriftsvänligt format. Den valda texten öppnas då i ett nytt fönster (du måste tillåta popup-fönster från webbplatsen).`) {
        this.instructionsText = $localize`:@@DownloadTexts.Instructions:Här kan du ladda ner texterna i olika format. Du kan också öppna texterna i utskriftsvänligt format. Den valda texten öppnas då i ett nytt fönster (du måste tillåta popup-fönster från webbplatsen).`;
      }

      if ($localize`:@@DownloadTexts.CopyrightNotice:Licens: CC BY-NC-ND 4.0`) {
        this.copyrightText = $localize`:@@DownloadTexts.CopyrightNotice:Licens: CC BY-NC-ND 4.0`;
      }

      if ($localize`:@@DownloadTexts.CopyrightURL:https://creativecommons.org/licenses/by-nc-nd/4.0/deed.sv`) {
        this.copyrightURL = $localize`:@@DownloadTexts.CopyrightURL:https://creativecommons.org/licenses/by-nc-nd/4.0/deed.sv`;
      }
    } else if (this.introductionMode) {
      this.introductionTitle = $localize`:@@Read.Introduction.Title:Inledning`;

      if ($localize`:@@DownloadTexts.InstructionsIntroduction:Här kan du ladda ner inledningen eller öppna den i utskriftsvänligt format. Den öppnas då i ett nytt fönster (du måste tillåta popup-fönster från webbplatsen).`) {
        this.instructionsText = $localize`:@@DownloadTexts.InstructionsIntroduction:Här kan du ladda ner inledningen eller öppna den i utskriftsvänligt format. Den öppnas då i ett nytt fönster (du måste tillåta popup-fönster från webbplatsen).`;
      }

      if ($localize`:@@DownloadTexts.CopyrightNoticeIntroduction:Licens: CC BY-NC-ND 4.0`) {
        this.copyrightText = $localize`:@@DownloadTexts.CopyrightNoticeIntroduction:Licens: CC BY-NC-ND 4.0`;
      }

      if ($localize`:@@DownloadTexts.CopyrightURLIntroduction:https://creativecommons.org/licenses/by-nc-nd/4.0/deed.sv`) {
        this.copyrightURL = $localize`:@@DownloadTexts.CopyrightURLIntroduction:https://creativecommons.org/licenses/by-nc-nd/4.0/deed.sv`;
      }
    }

    if ($localize`:@@DownloadTexts.Print:Skriv ut`) {
      this.printTranslation = $localize`:@@DownloadTexts.Print:Skriv ut`;
    } else {
      this.printTranslation = 'Skriv ut';
    }

    if ($localize`:@@DownloadTexts.Textsize:Textstorlek`) {
      this.textSizeTranslation = $localize`:@@DownloadTexts.Textsize:Textstorlek`;
    } else {
      this.textSizeTranslation = 'Text storlek';
    }
  }

  private setCollectionTitle() {
    // Get collection title from database
    if (this.collectionId) {
      this.collectionsService.getCollection(this.collectionId).subscribe(
        (collectionData: any) => {
          if (collectionData?.[0]?.['name']) {
            this.collectionTitle = collectionData[0]['name'];
          } else {
            this.collectionTitle = '';
          }
        }
      );
    }
  }

  private setPublicationTitle() {
    if (this.collectionId) {
      this.tocService.getTableOfContents(this.collectionId).subscribe(
        (toc: any) => {
          if (toc?.children) {
            const idParts = this.textItemID.split(';');
            const searchItemId = idParts[0];
            const positionId = idParts[1] || '';
            if (!positionId) {
              this.recursiveSearchTocForPublicationTitle(toc.children, searchItemId);
            } else {
              this.recursiveSearchTocForPublicationTitle(toc.children, searchItemId + ';', true);
            }
          }
        }
      );
    }
  }

  private recursiveSearchTocForPublicationTitle(
    tocArray: any[],
    searchId: string,
    idIncludesPosition: boolean = false,
    parentTitle?: string
  ) {
    if (tocArray?.length) {
      for (let i = 0; i < tocArray.length; i++) {
        if (tocArray[i].itemId === searchId) {
          this.publicationTitle = tocArray[i].text;
          if (this.publicationTitle?.slice(-1) === '.') {
            this.publicationTitle = this.publicationTitle.slice(0, -1);
          }
          break;
        } else if (
          idIncludesPosition &&
          tocArray[i].itemId?.startsWith(searchId)
        ) {
          this.publicationTitle = parentTitle || '';
          if (this.publicationTitle?.slice(-1) === '.') {
            this.publicationTitle = this.publicationTitle.slice(0, -1);
          }
          break;
        } else if (tocArray[i].children) {
          this.recursiveSearchTocForPublicationTitle(
            tocArray[i].children,
            searchId,
            idIncludesPosition,
            tocArray[i].text
          );
        }
      }
    }
  }

  // Returns the given title string as a string that can be used as a filename
  private convertToFilename(title: string, maxLength = 70): string {
    let filename = title
          ? title.replace(/[àáåä]/gi, 'a')
                  .replace(/[öøô]/gi, 'o')
                  .replace(/[æ]/gi, 'ae')
                  .replace(/[èéêë]/gi, 'e')
                  .replace(/[ûü]/gi, 'u')
          : 'filename';
    filename = filename.replace(/[  ]/gi, '_')
                  .replace(/[,:;*+?!"'^%/${}()|[\]\\]/g, '')
                  .replace(/[^a-z0-9_-]/gi, '-');
    filename = filename.replace(/_{2,}/g, '_')
                  .replace(/\-{2,}/g, '-')
                  .replace('-_', '_')
                  .toLowerCase();
    if (filename.length > maxLength) {
      filename = filename.slice(0, maxLength - 3);
      filename += '---'
    }
    return filename;
  }

  private getCorrespondenceDataAsHtml(data: any, concatSenders: string, concatReceivers: string): string {
    let mContent = '';
    mContent += '<div class="ms">\n';
    mContent += '<h3>' + $localize`:@@Read.Comments.Manuscript.Title:Manuskriptbeskrivning` + '</h3>\n';

    if (data.legacy_id || concatSenders || concatReceivers || data.source_archive || data.source_collection_id) {
      mContent += '<ul>\n';
    }
    if (data.legacy_id) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.LegacyId:Brevsignum` + ': ' + data.legacy_id + '</li>\n';
    }
    if (concatSenders) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Sender:Avsändare` + ': ' + concatSenders + '</li>\n';
    }
    if (concatReceivers) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Receiver:Mottagare` + ': ' + concatReceivers + '</li>\n';
    }
    if (data.source_archive) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Archive:Arkiv` + ': ' + data.source_archive + '</li>\n';
    }
    if (data.source_collection_id) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Collection:Samling, signum` + ': ' + data.source_collection_id + '</li>\n';
    }
    if (data.legacy_id || concatSenders || concatReceivers || data.source_archive || data.source_collection_id) {
      mContent += '</ul>\n';
    }

    mContent += '<ul>\n';
    if (data.material_type) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Type:Form` + ': ' + data.material_type + '</li>\n';
    }
    if (data.material_source) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Status:Status` + ': ' + data.material_source + '</li>\n';
    }
    if (data.material_format) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Format:Format` + ': ' + data.material_format + '</li>\n';
    }
    if (data.leaf_count) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Leafs:Lägg` + ': ' + data.leaf_count + '</li>\n';
    }
    if (data.sheet_count) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Sheets:Antal blad` + ': ' + data.sheet_count + '</li>\n';
    }
    if (data.page_count) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Pages:Sidor brevtext` + ': ' + data.page_count + '</li>\n';
    }
    if (data.material_color) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Color:Färg` + ': ' + data.material_color + '</li>\n';
    }
    if (data.material_quality) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Quality:Kvalitet` + ': ' + data.material_quality + '</li>\n';
    }
    if (data.material_pattern) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Pattern:Mönster` + ': ' + data.material_pattern + '</li>\n';
    }
    if (data.material_state) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.State:Tillstånd` + ': ' + data.material_state + '</li>\n';
    }
    if (data.material) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Material:Skrivmaterial` + ': ' + data.material + '</li>\n';
    }
    if (data.material_notes) {
      mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Other:Övrigt` + ': ' + data.material_notes + '</li>\n';
    }
    mContent += '</ul>\n';
    mContent += '</div>\n';
    return mContent;
  }

  private fixImagePaths(text: string): string {
    // fix image paths
    return text.replace(
      /assets\/images\//g,
      (this.document.defaultView?.location.origin ?? '')
            + (this.document.defaultView?.location.pathname.split('/')[1] === this.activeLocale ? '/' + this.activeLocale : '')
            + '/assets/images/'
    );
  }

}
