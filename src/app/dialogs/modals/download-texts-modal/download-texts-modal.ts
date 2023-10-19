import { Component, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

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
  imports: [NgClass, NgIf, IonicModule]
})
export class DownloadTextsModal implements OnInit {
  @Input() origin: string = '';
  @Input() textItemID: string = '';

  apiEndPoint: string;
  appMachineName: string;
  chapterId: string = '';
  collectionId: string = '';
  collectionTitle: string = '';
  commentTitle: string = '';
  copyrightText: string = '';
  downloadFormatsCom: Record<string, any> | undefined = undefined;
  downloadFormatsEst: Record<string, any> | undefined = undefined;
  downloadFormatsIntro: Record<string, any> | undefined = undefined;
  instructionsText: string = '';
  introductionMode: boolean = false;
  introductionTitle: string = '';
  loadingCom: boolean = false;
  loadingEst: boolean = false;
  loadingIntro: boolean = false;
  positionId: string = '';
  printTranslation: string = '';
  publicationId: string = '';
  publicationTitle: string = '';
  readTextsMode: boolean = false;
  showCopyright: boolean = false;
  showErrorMessage: boolean = false;
  showInstructions: boolean = false;
  siteUrl: string = '';
  textSizeTranslation: string = '';

  constructor(
    private collectionContentService: CollectionContentService,
    private collectionsService: CollectionsService,
    private commentService: CommentService,
    private parserService: HtmlParserService,
    private modalCtrl: ModalController,
    private tocService: CollectionTableOfContentsService,
    private viewOptionsService: ViewOptionsService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    // Get configs
    this.appMachineName = config.app?.machineName ?? '';
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.siteUrl = config.app?.siteURLOrigin ?? '';
    this.downloadFormatsIntro = config.textDownloadOptions?.enabledIntroductionFormats ?? undefined;
    this.downloadFormatsEst = config.textDownloadOptions?.enabledEstablishedFormats ?? undefined;
    this.downloadFormatsCom = config.textDownloadOptions?.enabledCommentsFormats ?? undefined;

    // Set download formats options from config
    if (
      !this.downloadFormatsIntro ||
      Object.keys(this.downloadFormatsIntro).length < 1
    ) {
      this.downloadFormatsIntro = {
        xml: false,
        print: false
      }
    }

    if (
      !this.downloadFormatsEst ||
      Object.keys(this.downloadFormatsEst).length < 1
    ) {
      this.downloadFormatsEst = {
        xml: false,
        txt: false,
        print: false
      }
    }

    if (
      !this.downloadFormatsCom ||
      Object.keys(this.downloadFormatsCom).length < 1
    ) {
      this.downloadFormatsCom = {
        xml: false,
        txt: false,
        print: false
      }
    }
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
      this.publicationId = idParts[1] || '';
      this.chapterId = idParts[2] || '';
      this.positionId = this.textItemID.split(';')[1] || '';

      this.setCollectionTitle();

      // Get publication title from TOC (this way we can also get
      // correct chapter titles for publications with chapters)
      if (this.readTextsMode) {
        this.setPublicationTitle();
      }
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  initiateDownload(textType: string, format: string) {
    this.showErrorMessage = false;
    let mimetype = 'application/xml';
    let fileExtension = 'xml';
    if (format === 'txt') {
      mimetype = 'text/plain';
      fileExtension = 'txt';
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
          link.download = this.convertToFilename(this.introductionTitle + '-' + this.collectionTitle) + '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingIntro = false;
          URL.revokeObjectURL(blobUrl);
        },
        error: (e: any) => {
          console.error('error getting introduction in ' + format + ' format', e);
          this.loadingIntro = false;
          this.showErrorMessage = true;
        }
      });
    } else if (textType === 'est') {
      this.loadingEst = true;
      this.collectionContentService.getDownloadableReadText(
        this.textItemID, format
      ).subscribe({
        next: (res: any) => {
          const blob = new Blob([res.content], {type: mimetype});
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = this.convertToFilename(this.publicationTitle) +  '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingEst = false;
          URL.revokeObjectURL(blobUrl);
        },
        error: (e: any) => {
          console.error('error getting read text in ' + format + ' format', e);
          this.loadingEst = false;
          this.showErrorMessage = true;
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
          link.download = this.convertToFilename(this.publicationTitle + '-' + this.commentTitle) +  '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingCom = false;
          URL.revokeObjectURL(blobUrl);
        },
        error: (e: any) =>  {
          console.error('error getting comments in ' + format + ' format', e);
          this.loadingCom = false;
          this.showErrorMessage = true;
        }
      });
    }
  }

  openPrintFriendlyText(textType: string) {
    this.showErrorMessage = false;
    if (textType === 'intro') {
      this.loadingIntro = true;
      this.openIntroductionForPrint();
    } else if (textType === 'est') {
      this.loadingEst = true;
      this.openEstablishedForPrint();
    } else if (textType === 'com') {
      this.loadingCom = true;
      this.openCommentsForPrint();
    }
  }

  private openIntroductionForPrint() {
    this.collectionContentService.getIntroduction(this.textItemID, this.activeLocale).subscribe({
      next: (res) => {
        let content = res.content.replace(/images\//g, 'assets/images/').replace(/\.png/g, '.svg');
        content = this.constructHtmlForPrint(content, 'intro');

        try {
          const newWindowRef = window.open();
          if (newWindowRef) {
            newWindowRef.document.write(content);
            newWindowRef.document.close();
            newWindowRef.focus();
          } else {
            this.showErrorMessage = true;
            console.log('unable to open new window');
          }
          this.loadingIntro = false;
        } catch (e) {
          this.loadingIntro = false;
          this.showErrorMessage = true;
          console.log('error opening introduction in print format in new window', e);
        }
      },
      error: (e) => {
        console.log('error loading introduction');
        this.loadingIntro = false;
        this.showErrorMessage = true;
      }
    });
  }

  private openEstablishedForPrint() {
    this.collectionContentService.getReadText(this.textItemID).subscribe({
      next: content => {
        if (content === '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>File not found</body></html>') {
          content = '';
        } else {
          const c_id = String(this.textItemID).split('_')[0];
          content = this.parserService.postprocessEstablishedText(content, c_id);

          content = content.substring(content.indexOf('<body>') + 6, content.indexOf('</body>'));
          content = content.replace('<p> </p><p> </p><section role="doc-endnotes"><ol class="tei footnotesList"></ol></section>', '');

          content = this.constructHtmlForPrint(content, 'est');
        }

        try {
          const newWindowRef = window.open();
          if (newWindowRef) {
            newWindowRef.document.write(content);
            newWindowRef.document.close();
            newWindowRef.focus();
          } else {
            this.showErrorMessage = true;
            console.log('unable to open new window');
          }
          this.loadingEst = false;
        } catch (e) {
          this.loadingEst = false;
          this.showErrorMessage = true;
          console.log('error opening established text in print format in new window', e);
        }
      },
      error: e => {
        console.log('error loading established text');
        this.loadingEst = false;
        this.showErrorMessage = true;
      }
    });
  }

  private openCommentsForPrint() {
    this.commentService.getComments(this.textItemID).subscribe({
      next: content => {
        this.commentService.getCorrespondanceMetadata(String(this.textItemID).split('_')[1].split(';')[0]).subscribe({
          next: metadata => {
            if (content === null || content === undefined || content.length < 1) {
              content = '';
            } else {
              // in order to get id attributes for tooltips
              content = String(content).replace(/images\//g, 'assets/images/')
                  .replace(/\.png/g, '.svg').replace(/class=\"([a-z A-Z _ 0-9]{1,140})\"/g, 'class=\"teiComment $1\"')
                  .replace(/(teiComment teiComment )/g, 'teiComment ')
                  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            }
            content = this.constructHtmlForPrint(content, 'com');

            if (metadata !== undefined && metadata !== null && Object.keys(metadata).length !== 0) {
              let concatSenders = '';
              let concatReceivers = '';
              if (metadata['subjects'] !== undefined && metadata['subjects'] !== null) {
                if (metadata['subjects'].length > 0) {
                  const senders = [] as any;
                  const receivers = [] as any;
                  metadata['subjects'].forEach((subject: any) => {
                    if ( subject['avs\u00e4ndare'] ) {
                      senders.push(subject['avs\u00e4ndare']);
                    }
                    if ( subject['mottagare'] ) {
                      receivers.push(subject['mottagare']);
                    }
                  });
                  concatSenders = concatenateNames(senders);
                  concatReceivers = concatenateNames(receivers);
                }
              }
              if (metadata['letter'] !== undefined && metadata['letter'] !== null) {
                let mContent = '';
                mContent += '<div class="ms">\n';
                mContent += '<h3>' + $localize`:@@Read.Comments.Manuscript.Title:Manuskriptbeskrivning` + '</h3>\n';
                mContent += '<ul>\n';
                mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.LegacyId:Brevsignum` + ': ' + metadata.letter.legacy_id + '</li>\n';
                mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Sender:Avsändare` + ': ' + concatSenders + '</li>\n';
                mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Receiver:Mottagare` + ': ' + concatReceivers + '</li>\n';
                mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Archive:Arkiv` + ': ' + metadata.letter.source_archive + '</li>\n';
                mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Collection:Samling, signum` + ': ' + metadata.letter.source_collection_id + '</li>\n';
                mContent += '</ul>\n';
                mContent += '<ul>\n';
                if (metadata.letter.material_type) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Type:Form` + ': ' + metadata.letter.material_type + '</li>\n';
                }
                if (metadata.letter.material_source) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Status:Status` + ': ' + metadata.letter.material_source + '</li>\n';
                }
                if (metadata.letter.material_format) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Format:Format` + ': ' + metadata.letter.material_format + '</li>\n';
                }
                if (metadata.letter.leaf_count) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Leafs:Lägg` + ': ' + metadata.letter.leaf_count + '</li>\n';
                }
                if (metadata.letter.sheet_count) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Sheets:Antal blad` + ': ' + metadata.letter.sheet_count + '</li>\n';
                }
                if (metadata.letter.page_count) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Pages:Sidor brevtext` + ': ' + metadata.letter.page_count + '</li>\n';
                }
                if (metadata.letter.material_color) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Color:Färg` + ': ' + metadata.letter.material_color + '</li>\n';
                }
                if (metadata.letter.material_quality) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Quality:Kvalitet` + ': ' + metadata.letter.material_quality + '</li>\n';
                }
                if (metadata.letter.material_pattern) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Pattern:Mönster` + ': ' + metadata.letter.material_pattern + '</li>\n';
                }
                if (metadata.letter.material_state) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.State:Tillstånd` + ': ' + metadata.letter.material_state + '</li>\n';
                }
                if (metadata.letter.material) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Material:Skrivmaterial` + ': ' + metadata.letter.material + '</li>\n';
                }
                if (metadata.letter.material_notes) {
                  mContent += '<li>' + $localize`:@@Read.Comments.Manuscript.Other:Övrigt` + ': ' + metadata.letter.material_notes + '</li>\n';
                }
                mContent += '</ul>\n';
                mContent += '</div>\n';

                const contentParts = content.split('</div>\n</comments>');
                content = contentParts[0] + mContent + '</div>\n</comments>' + contentParts[1];

                try {
                  const newWindowRef = window.open();
                  if (newWindowRef) {
                    newWindowRef.document.write(content);
                    newWindowRef.document.close();
                    newWindowRef.focus();
                  } else {
                    this.showErrorMessage = true;
                    console.log('unable to open new window');
                  }
                  this.loadingCom = false;
                } catch (e) {
                  this.loadingCom = false;
                  this.showErrorMessage = true;
                  console.log('error opening comment text in print format in new window', e);
                }
              }
            } else {
              try {
                const newWindowRef = window.open();
                if (newWindowRef) {
                  newWindowRef.document.write(content);
                  newWindowRef.document.close();
                  newWindowRef.focus();
                } else {
                  this.showErrorMessage = true;
                  console.log('unable to open new window');
                }
                this.loadingCom = false;
              } catch (e) {
                this.loadingCom = false;
                this.showErrorMessage = true;
                console.log('error opening comment text in print format in new window', e);
              }
            }
          },
          error: metadataError => {
            console.log('error loading correspondence metadata');
            this.loadingCom = false;
            this.showErrorMessage = true;
          }
        });
      },
      error: e => {
        console.log('error loading comments');
        this.loadingCom = false;
        this.showErrorMessage = true;
      }
    });
  }

  private constructHtmlForPrint(text: string, textType: string) {
    const cssStylesheets = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
      const href = document.styleSheets[i].href;
      if (href && (href.indexOf('/assets/custom') !== -1 || href.indexOf('/build/main') !== -1)) {
        cssStylesheets.push(document.styleSheets[i].href);
      }
    }

    let header = '<!DOCTYPE html>\n';
    header += '<html>\n';
    header += '<head>\n';
    header += '<meta charset="UTF-8">\n';
    header += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    header += '<title>' + this.constructPrintHtmlTitle(textType) + '</title>\n';
    cssStylesheets.forEach(sheetUrl => {
      header += '<link href="' + sheetUrl + '" rel="stylesheet">\n';
    });
    header += '<style>\n';
    header += '    body  { position: static; overflow: auto; height: initial; max-height: initial; width: initial; }\n';
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
    header += '    .print-header button { display: block; font-family: var(--font-stack-system); font-size: 1rem; font-weight: 600; text-shadow: 0 0.04em 0.04em rgba(0,0,0,0.35); text-transform: uppercase; color: #fff; background-color: #2a75cb; border-radius: 0.4em; padding: 0.5em 1.3em; margin: 2em auto; cursor: pointer; transition: all 0.2s; }\n';
    header += '    .print-header button:hover { background-color: #12447e; }\n';
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
    header += '<div class="print-header">\n';
    header += '    <button type="button" onclick="window.print();return false;">' + this.printTranslation + '</button>\n';
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
    header += '<div class="content">\n';
    if (textType === 'est') {
      header += '<read-text>\n';
    } else if (textType === 'com') {
      header += '<comments>\n';
    }
    header += '<div id="teiContainerDiv" class="tei teiContainer ' + this.getViewOptionsAsClassNames(textType) + '">\n';
    if (textType === 'com') {
      header += '<h1 class="tei commentPublicationTitle">' + this.publicationTitle + '</h1>\n';
    }

    let closer = '</div>\n';
    if (textType === 'est') {
      closer += '</read-text>\n';
    } else if (textType === 'com') {
      closer += '</comments>\n';
    }
    closer += '</div>\n';
    if (textType === 'intro') {
      closer += '</page-introduction>\n';
    } else {
      closer += '</page-text>\n';
    }
    closer += '<script>\n';
    closer += '    const slider = document.getElementById("textSizeSlider");\n';
    closer += '    const teiContainer = document.getElementById("teiContainerDiv")\n';
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
    closer += '        const classes = teiContainer.className.split(" ");\n';
    closer += '        for (let i = 0; i < classes.length; i++) {\n';
    closer += '            if (classes[i].indexOf("FontSize") !== -1) {\n';
    closer += '                teiContainer.classList.remove(classes[i]);\n';
    closer += '                break;\n';
    closer += '            }\n';
    closer += '        }\n';
    closer += '        teiContainer.classList.add(fontSize);\n';
    closer += '    }\n';
    closer += '    \n';
    closer += '</script>\n';
    closer += '</body>\n';
    closer += '</html>\n';

    /*
    if (textType === 'intro') {
      const pattern = /<div data-id="content">(.*?)<\/div>/;
      const matches = text.match(pattern);
      if ( matches !== null ) {
        let edited_toc_div = matches[0].replace('<div data-id="content">', '<div>');
        edited_toc_div = '<nav id="TOC">\n<div id="toc-text">\n' + edited_toc_div + '</div>\n</nav>\n';
        text = text.replace(matches[0], edited_toc_div);
      }
    }
    */

    text = header + text + closer;
    return text;
  }

  private getViewOptionsAsClassNames(textType: string) {
    let classes = 'xxxsmallFontSize '; // Default font size for printing, equals about 11pt
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
    let title: any = '';
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
        this.showInstructions = true;
        this.instructionsText = $localize`:@@DownloadTexts.Instructions:Här kan du ladda ner texterna i olika format. Du kan också öppna texterna i utskriftsvänligt format. Den valda texten öppnas då i ett nytt fönster (du måste tillåta popup-fönster från webbplatsen).`;
      } else {
        this.showInstructions = false;
      }

      if ($localize`:@@DownloadTexts.CopyrightNotice:Licens: CC BY-NC-ND 4.0`) {
        this.showCopyright = true;
        this.copyrightText = $localize`:@@DownloadTexts.CopyrightNotice:Licens: CC BY-NC-ND 4.0`;
      } else {
        this.showCopyright = false;
      }
    } else if (this.introductionMode) {
      this.introductionTitle = $localize`:@@Read.Introduction.Title:Inledning`;

      if ($localize`:@@DownloadTexts.InstructionsIntroduction:Här kan du ladda ner inledningen eller öppna den i utskriftsvänligt format. Den öppnas då i ett nytt fönster (du måste tillåta popup-fönster från webbplatsen).`) {
        this.showInstructions = true;
        this.instructionsText = $localize`:@@DownloadTexts.InstructionsIntroduction:Här kan du ladda ner inledningen eller öppna den i utskriftsvänligt format. Den öppnas då i ett nytt fönster (du måste tillåta popup-fönster från webbplatsen).`;
      } else {
        this.showInstructions = false;
      }

      if ($localize`:@@DownloadTexts.CopyrightNoticeIntroduction:Licens: CC BY-NC-ND 4.0`) {
        this.showCopyright = true;
        this.copyrightText = $localize`:@@DownloadTexts.CopyrightNoticeIntroduction:Licens: CC BY-NC-ND 4.0`;
      } else {
        this.showCopyright = false;
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
            let searchItemId = this.textItemID.split(';')[0];
            if (!this.positionId) {
              this.recursiveSearchTocForPublicationTitle(toc.children, searchItemId);
            } else {
              searchItemId += ';';
              this.recursiveSearchTocForPublicationTitle(toc.children, searchItemId, true);
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
  private convertToFilename(title: string | undefined, maxLength = 75) {
    let filename = title ? title.replace(/[àáåä]/gi, 'a').replace(/[öøô]/gi, 'o').replace(/[æ]/gi, 'ae').replace(/[èéêë]/gi, 'e').replace(/[ûü]/gi, 'u') : '';
    filename = filename.replace(/[  ]/gi, '_').replace(/[,:;*+?!"'^%/${}()|[\]\\]/g, '').replace(/[^a-z0-9_-]/gi, '-');
    filename = filename.replace(/_{2,}/g, '_').replace(/\-{2,}/g, '-').replace('-_', '_').toLowerCase();
    if (filename.length > maxLength) {
      filename = filename.slice(0, maxLength - 3);
      filename += '---'
    }
    return filename;
  }

}
