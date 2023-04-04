import { Component, Inject, LOCALE_ID } from '@angular/core';
import { NavController, ModalController, NavParams } from '@ionic/angular';
import { EventsService } from 'src/app/services/events/events.service';
import { TextService } from 'src/app/services/texts/text.service';
import { CommentService } from 'src/app/services/comments/comment.service';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { TableOfContentsService } from 'src/app/services/toc/table-of-contents.service';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { config } from "src/app/services/config/config";

@Component({
  selector: 'page-download-texts-modal',
  templateUrl: 'download-texts-modal.html',
  styleUrls: ['download-texts-modal.scss']
})
export class DownloadTextsModalPage {

  apiEndPoint: string;
  appMachineName: string;
  siteUrl: string;
  introductionMode: Boolean = false;
  readTextsMode: Boolean = false;
  textId: string;
  collectionId?: string;
  publicationId?: string;
  chapterId?: string;
  positionId?: string;
  collectionTitle?: string;
  publicationTitle?: string;
  introductionTitle?: string;
  commentTitle?: string;
  downloadFormatsIntro?: Record<string, any> = {};
  downloadFormatsEst?: Record<string, any> = {};
  downloadFormatsCom?: Record<string, any> = {};
  showInstructions: Boolean = false;
  instructionsText?: string;
  showCopyright: Boolean = false;
  copyrightText?: string;
  printTranslation?: string;
  textSizeTranslation?: string;
  loadingIntro: Boolean = false;
  loadingEst: Boolean = false;
  loadingCom: Boolean = false;
  showErrorMessage: Boolean = false;
  objectURLs: any[] = [];

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ModalController,
    params: NavParams,
    private textService: TextService,
    private commentService: CommentService,
    private events: EventsService,
    public readPopoverService: ReadPopoverService,
    private tocService: TableOfContentsService,
    public commonFunctions: CommonFunctionsService,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    // Get configs
    this.appMachineName = config.app?.machineName ?? '';
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.siteUrl = config.siteMetaData?.website?.url ?? '';
    this.downloadFormatsIntro = config.textDownloadOptions?.enabledIntroductionFormats ?? undefined;
    this.downloadFormatsEst = config.textDownloadOptions?.enabledEstablishedFormats ?? undefined;
    this.downloadFormatsCom = config.textDownloadOptions?.enabledCommentsFormats ?? undefined;

    // Process download formats options
    if (this.downloadFormatsIntro === undefined ||
      this.downloadFormatsIntro === null ||
      Object.keys(this.downloadFormatsIntro).length === 0) {
       this.downloadFormatsIntro = {
        'xml': false,
        'print': false
       }
    }
    if (this.downloadFormatsEst === undefined ||
      this.downloadFormatsEst === null ||
      Object.keys(this.downloadFormatsEst).length === 0) {
       this.downloadFormatsEst = {
        'xml': false,
        'txt': false,
        'print': false
       }
    }
    if (this.downloadFormatsCom === undefined ||
      this.downloadFormatsCom === null ||
      Object.keys(this.downloadFormatsCom).length === 0) {
       this.downloadFormatsCom = {
        'xml': false,
        'txt': false,
        'print': false
       }
    }

    // Get which page has initiated the download modal from nav params
    try {
      const origin = String(params.get('origin'));
      if (origin === 'page-read') {
        this.readTextsMode = true;
      } else if (origin === 'page-introduction') {
        this.introductionMode = true;
      }
    } catch (e) {}

    // Get text id from nav params
    try {
      this.textId = String(params.get('textId'));
    } catch (e) {
      this.textId = '';
    }

    // Parse text id
    if (this.textId) {
      const idParts = this.textId.split('_');
      this.collectionId = idParts[0];
      if (idParts.length > 1) {
        this.publicationId = idParts[1];
        if (idParts.length > 2) {
          this.chapterId = idParts[2].split(';')[0];
          if (idParts[2].split(';')[1] !== undefined) {
            this.positionId = idParts[2].split(';')[1];
          }
        } else {
          this.chapterId = '';
          this.positionId = '';
        }
      } else {
        this.publicationId = '';
        this.chapterId = '';
      }
    }

    // Get translations
    if (this.readTextsMode) {
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

    // Get collection title from database
    this.textService.getCollection(this.collectionId as string).subscribe({
      next: (collectionData) => {
        if (collectionData[0] !== undefined) {
          this.collectionTitle = collectionData[0]['name'];
        } else {
          this.collectionTitle = '';
        }
      },
      error: (e) => { this.collectionTitle = ''; }
    });

    // Get publication title from TOC (this way we can also get correct chapter titles for publications with chapters)
    if (this.readTextsMode) {
      this.tocService.getTableOfContents(this.collectionId as string).subscribe({
        next: (toc: any) => {
          if (toc !== null) {
            if (toc.children) {
              let searchItemId = this.collectionId + '_' + this.publicationId;
              if (this.chapterId) {
                searchItemId += '_' + this.chapterId;
              }
              if (!this.positionId) {
                this.recursiveSearchTocForPublicationTitle(toc.children, searchItemId);
              } else {
                searchItemId += ';pos';
                this.recursiveSearchTocForPublicationTitle(toc.children, searchItemId, true);
              }
            }
          }
        }
      });
    }

    // Get translation for comments-column title
    if (this.readTextsMode) {
      this.commentTitle = $localize`:@@Read.Comments.Title:Kommentarer`;
    }

    // Get translation for introduction title
    if (this.introductionMode) {
      this.introductionTitle = $localize`:@@Read.Introduction.Title:Inledning`;
    }

  }

  public initiateDownload(textType: string, format: string) {
    this.showErrorMessage = false;
    let mimetype = 'application/xml';
    let fileExtension = 'xml';
    if (format === 'txt') {
      mimetype = 'text/plain';
      fileExtension = 'txt';
    }
    if (textType === 'intro') {
      this.loadingIntro = true;
      this.textService.getDownloadableIntroduction(this.textId, format, this.activeLocale).subscribe({
        next: (content) => {
          const blob = new Blob([String(content)], {type: mimetype});
          const blobUrl = URL.createObjectURL(blob);
          this.objectURLs.push(blobUrl);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = this.convertToFilename(this.introductionTitle + '-' + this.collectionTitle) + '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingIntro = false;
        },
        error: (e) => {
          console.log('error getting introduction in ' + format + ' format');
          this.loadingIntro = false;
          this.showErrorMessage = true;
        }
      });
    } else if (textType === 'est') {
      this.loadingEst = true;
      this.textService.getDownloadableEstablishedText(this.textId, format).subscribe({
        next: content => {
          const blob = new Blob([String(content)], {type: mimetype});
          const blobUrl = URL.createObjectURL(blob);
          this.objectURLs.push(blobUrl);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = this.convertToFilename(this.publicationTitle) +  '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingEst = false;
        },
        error: e => {
          console.log('error getting established text in ' + format + ' format');
          this.loadingEst = false;
          this.showErrorMessage = true;
        }
      });
    } else if (textType === 'com') {
      this.loadingCom = true;
      this.commentService.getDownloadableComments(this.textId, format).subscribe({
        next: content => {
          const blob = new Blob([String(content)], {type: mimetype});
          const blobUrl = URL.createObjectURL(blob);
          this.objectURLs.push(blobUrl);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = this.convertToFilename(this.publicationTitle + '-' + this.commentTitle) +  '.' + fileExtension;
          link.target = '_blank'
          link.click();
          this.loadingCom = false;
        },
        error: e =>  {
          console.log('error getting comments in ' + format + ' format');
          this.loadingCom = false;
          this.showErrorMessage = true;
        }
      });
    }
  }

  public openPrintFriendlyText(textType: string) {
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

  dismiss() {
    this.objectURLs.forEach(object => {
      URL.revokeObjectURL(object);
    });
    this.viewCtrl.dismiss();
    this.events.publishDownloadTextsModalDismiss();
  }

  private openIntroductionForPrint() {
    this.textService.getIntroduction(this.textId, this.activeLocale).subscribe({
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
    this.textService.getEstablishedText(this.textId).subscribe({
      next: content => {
        if (content === '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>File not found</body></html>') {
          content = '';
        } else {
          const c_id = String(this.textId).split('_')[0];
          content = this.textService.postprocessEstablishedText(content, c_id);

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
    this.commentService.getComments(this.textId).subscribe({
      next: content => {
        this.commentService.getCorrespondanceMetadata(String(this.textId).split('_')[1].split(';')[0]).subscribe({
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
                  concatSenders = this.commonFunctions.concatenateNames(senders);
                  concatReceivers = this.commonFunctions.concatenateNames(receivers);
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
    header += '    page-read, page-introduction { display: block; padding: 0 1.5em 4em 1.5em; }\n';
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
    header += '        page-read, page-introduction { padding: 0; }\n';
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
      header += '<page-read>\n';
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
      closer += '</page-read>\n';
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
        edited_toc_div = '<nav id="TOC">\n<div id="toc_text">\n' + edited_toc_div + '</div>\n</nav>\n';
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
      if (this.readPopoverService.show.paragraphNumbering) {
        classes += 'show_paragraphNumbering ';
      }
      if (this.readPopoverService.show.pageBreakEdition) {
        classes += 'show_pageBreakEdition ';
      }
      if (textType === 'est' && this.readPopoverService.show.pageBreakOriginal) {
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

  private recursiveSearchTocForPublicationTitle(toc_array: any, searchId: any, idIncludesPosition = false, parentTitle?: any) {
    if (toc_array !== null && toc_array !== undefined) {
      toc_array.forEach((item: any) => {
        if (item.itemId !== undefined && item.itemId === searchId) {
            this.publicationTitle = item.text;
          if (this.publicationTitle?.slice(-1) === '.') {
            this.publicationTitle = this.publicationTitle.slice(0, -1);
          }
        } else if (idIncludesPosition && item.itemId !== undefined && item.itemId.startsWith(searchId)) {
          this.publicationTitle = parentTitle;
          if (this.publicationTitle?.slice(-1) === '.') {
            this.publicationTitle = this.publicationTitle.slice(0, -1);
          }
        } else if (item.children) {
          this.recursiveSearchTocForPublicationTitle(item.children, searchId, idIncludesPosition, item.text);
        }
      });
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
