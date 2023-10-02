import { Component, ElementRef, Inject, LOCALE_ID, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { combineLatest, map, Observable, Subscription } from 'rxjs';

import { DownloadTextsModalPage } from 'src/app/modals/download-texts-modal/download-texts-modal';
import { ReferenceDataModal } from 'src/app/modals/reference-data/reference-data.modal';
import { IllustrationModal } from 'src/app/modals/illustration/illustration.modal';
import { SemanticDataObjectModal } from 'src/app/modals/semantic-data-object/semantic-data-object.modal';
import { ViewOptionsPopover } from 'src/app/modals/view-options/view-options.popover';
import { TextService } from 'src/app/services/text.service';
import { TooltipService } from 'src/app/services/tooltip.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { ReadPopoverService } from 'src/app/services/read-popover.service';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { config } from 'src/assets/config/config';
import { isBrowser } from 'src/standalone/utility-functions';


@Component({
  selector: 'page-introduction',
  templateUrl: 'collection-introduction.html',
  styleUrls: ['collection-introduction.scss']
})
export class CollectionIntroductionPage implements OnInit, OnDestroy {
  collectionLegacyId: string = '';
  hasSeparateIntroToc: boolean = false;
  hasTOCLabelTranslation: boolean = false;
  id = '';
  infoOverlayPosType: string;
  infoOverlayPosition: any;
  infoOverlayWidth: string | null;
  infoOverlayText: SafeHtml = '';
  infoOverlayTitle: string = '';
  intervalTimerId: number = 0;
  pos: string | null;
  viewOptionsTogglesIntro: any = {};
  searchMatches: string[] = [];
  showTextDownloadButton: boolean = false;
  showURNButton: boolean;
  showViewOptionsButton: boolean = true;
  simpleWorkMetadata?: boolean;
  text: SafeHtml;
  textLoading: boolean = true;
  textMenu: SafeHtml;
  tocMenuOpen: boolean;
  toolTipPosType: string;
  toolTipPosition: any;
  toolTipMaxWidth: string | null;
  toolTipScaleValue: number | null;
  toolTipText: SafeHtml = '';
  tooltipVisible: boolean = false;
  urlParameters$: Observable<any>;
  urlParametersSubscription: Subscription | null = null;
  usePrintNotDownloadIcon: boolean = false;
  userIsTouching: boolean = false;

  private unlistenClickEvents?: () => void;
  private unlistenMouseoverEvents?: () => void;
  private unlistenMouseoutEvents?: () => void;
  private unlistenFirstTouchStartEvent?: () => void;

  constructor(
    private sanitizer: DomSanitizer,
    private renderer2: Renderer2,
    private ngZone: NgZone,
    private tooltipService: TooltipService,
    private elementRef: ElementRef,
    private popoverCtrl: PopoverController,
    public userSettingsService: UserSettingsService,
    public readPopoverService: ReadPopoverService,
    private textService: TextService,
    private commonFunctions: CommonFunctionsService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.pos = null;
    this.tocMenuOpen = false;
    this.toolTipPosType = 'fixed';
    this.toolTipMaxWidth = null;
    this.toolTipScaleValue = null;
    this.toolTipPosition = {
      top: 0 + 'px',
      left: -1500 + 'px'
    };
    this.infoOverlayText = '';
    this.infoOverlayTitle = '';
    this.infoOverlayWidth = null;
    this.infoOverlayPosType = 'fixed';
    this.infoOverlayPosition = {
      bottom: 0 + 'px',
      left: -1500 + 'px'
    };

    this.viewOptionsTogglesIntro = config.page?.introduction?.viewOptions ?? undefined;

    if (
      this.viewOptionsTogglesIntro === undefined ||
      this.viewOptionsTogglesIntro === null ||
      Object.keys(this.viewOptionsTogglesIntro).length === 0
    ) {
      this.viewOptionsTogglesIntro = {
        'comments': false,
        'personInfo': false,
        'placeInfo': false,
        'workInfo': false,
        'changes': false,
        'normalisations': false,
        'abbreviations': false,
        'paragraphNumbering': true,
        'pageBreakOriginal': false,
        'pageBreakEdition': false
      };
    } else {
      this.viewOptionsTogglesIntro.comments = false;
      this.viewOptionsTogglesIntro.changes = false;
      this.viewOptionsTogglesIntro.normalisations = false;
      this.viewOptionsTogglesIntro.abbreviations = false;
      this.viewOptionsTogglesIntro.pageBreakOriginal = false;
    }

    this.showURNButton = config.page?.introduction?.showURNButton ?? true;
    this.showViewOptionsButton = config.page?.introduction?.showViewOptionsButton ?? true;
    this.hasSeparateIntroToc = config.page?.introduction?.hasSeparateTOC ?? false;

    if ($localize`:@@Read.Introduction.Contents:Innehåll`) {
      this.hasTOCLabelTranslation = true;
    } else {
      this.hasTOCLabelTranslation = false;
    }

    try {
      const textDownloadOptions = config.textDownloadOptions ?? undefined;
      if (
        textDownloadOptions.enabledIntroductionFormats !== undefined &&
        textDownloadOptions.enabledIntroductionFormats !== null &&
        Object.keys(textDownloadOptions.enabledIntroductionFormats).length !== 0
      ) {
        for (const [key, value] of Object.entries(textDownloadOptions.enabledIntroductionFormats)) {
          if (value) {
            this.showTextDownloadButton = true;
            break;
          }
        }
      }
      if (textDownloadOptions.usePrintNotDownloadIcon !== undefined) {
        this.usePrintNotDownloadIcon = textDownloadOptions.usePrintNotDownloadIcon;
      }
    } catch (e) {
      this.showTextDownloadButton = false;
    }

  }

  ngOnInit() {
    this.urlParameters$ = combineLatest(
      [this.route.params, this.route.queryParams]
    ).pipe(
      map(([params, queryParams]) => ({...params, ...queryParams}))
    );
     
    this.urlParametersSubscription = this.urlParameters$.subscribe(routeParams => {
      
      // Check if there is a text position in the route params
      // (comes from queryParams)
      if (routeParams['position'] !== undefined) {
        this.pos = routeParams['position'];
      } else {
        this.pos = null;
      }


      if (routeParams['q'] !== undefined) {
        this.searchMatches = this.commonFunctions.getSearchMatchesFromQueryParams(routeParams['q']);
      }

      // If there is a collection id in the route params and it's
      // not the same as already stored in the component, load
      // content. If it's the same collection id, try to scroll
      // the text to this.pos (will only scroll if not null).
      if (routeParams['collectionID']) {
        if (routeParams['collectionID'] !== this.id) {
          this.id = routeParams['collectionID'];
          if (config.app?.enableCollectionLegacyIDs) {
            this.setCollectionLegacyId(this.id);
          }
          this.loadIntroduction(this.id, this.activeLocale);
        } else {
          // Try to scroll to a position in the text
          this.scrollToPos(100);
        }
      }
    });

    if (isBrowser()) {
      this.setUpTextListeners();
    }
  }

  ngOnDestroy() {
    this.urlParametersSubscription?.unsubscribe();
    this.unlistenClickEvents?.();
    this.unlistenMouseoverEvents?.();
    this.unlistenMouseoutEvents?.();
    this.unlistenFirstTouchStartEvent?.();
  }

  private loadIntroduction(id: string, lang: string) {
    this.text = '';
    this.textLoading = true;
    this.textService.getIntroduction(id, lang).subscribe({
      next: (res: any) => {
        if (res?.content) {
          this.textLoading = false;
          // Fix paths for images and file extensions for icons
          let textContent = res.content.replace(/images\//g, 'assets/images/').replace(/\.png/g, '.svg');

          // TODO: this manipulation of the introductions TOC should be made using htmlparser2
          // Find the introduction's table of contents in the text
          const pattern = /<div data-id="content">(.*?)<\/div>/;
          const matches = textContent.match(pattern);
          if (matches && matches.length > 0) {
            // The introduction's table of contents was found,
            // copy it to this.textMenu and remove it from this.text
            this.textMenu = this.sanitizer.bypassSecurityTrustHtml(matches[1]);
            textContent = textContent.replace(pattern, '');
            if (!this.userSettingsService.isMobile()) {
              if (!this.tocMenuOpen) {
                this.tocMenuOpen = true;
              }
            }
          } else {
            this.hasSeparateIntroToc = false;
          }

          textContent = this.commonFunctions.insertSearchMatchTags(textContent, this.searchMatches);
          this.text = this.sanitizer.bypassSecurityTrustHtml(textContent);
          // Try to scroll to a position in the text or first search match
          if (this.pos) {
            this.scrollToPos();
          } else if (this.searchMatches.length) {
            this.commonFunctions.scrollToFirstSearchMatch(this.elementRef.nativeElement, this.intervalTimerId);
          }
        } else {
          this.textLoading = false;
          this.text = $localize`:@@Read.Introduction.NoIntroduction:Inledningen kunde inte laddas.`;
          this.hasSeparateIntroToc = false;
        }
      },
      error: (e: any) =>  {
        console.error(e);
        this.textLoading = false;
        this.text = $localize`:@@Read.Introduction.NoIntroduction:Inledningen kunde inte laddas.`;
        this.hasSeparateIntroToc = false;
      }
    });
  }

  /**
   * Try to scroll to an element in the text, checks if this.pos
   * is null. Interval, to give text some time to load on the page.
   * */
  private scrollToPos(timeout: number = 1000) {
    if (isBrowser()) {
      const that = this;
      this.ngZone.runOutsideAngular(() => {
        let iterationsLeft = 10;
        clearInterval(this.intervalTimerId);
        this.intervalTimerId = window.setInterval(function() {
          if (iterationsLeft < 1) {
            clearInterval(that.intervalTimerId);
          } else {
            iterationsLeft -= 1;
            if (that.pos !== undefined && that.pos !== null) {
              // Look for position in name attributes
              let posElem: HTMLElement | null = document.querySelector(
                'page-introduction:not([ion-page-hidden]):not(.ion-page-hidden) [name="' + that.pos + '"]'
              );
              if (posElem) {
                const parentElem = posElem.parentElement;
                if (parentElem) {
                  if (
                    parentElem.classList.contains('ttFixed') ||
                    parentElem.parentElement?.classList?.contains('ttFixed')
                  ) {
                    // Anchor is in footnote --> look for next occurence
                    // since the first footnote element is not displayed
                    // (footnote elements are copied to a list at the
                    // end of the introduction and that's the position
                    // we need to find).
                    posElem = document.querySelectorAll(
                      'page-introduction:not([ion-page-hidden]):not(.ion-page-hidden) [name="' + that.pos + '"]'
                    )[1] as HTMLElement;
                  }
                }
                if (posElem && !posElem.classList?.contains('anchor')) {
                  posElem = null;
                }
              } else {
                // Look for position in data-id attributes
                posElem = document.querySelector(
                  'page-introduction:not([ion-page-hidden]):not(.ion-page-hidden) [data-id="' + that.pos + '"]'
                );
              }
              if (posElem) {
                if (
                  posElem.classList?.contains('anchor') ||
                  posElem.classList?.contains('footnoteindicator')
                ) {
                  that.commonFunctions.scrollToHTMLElement(posElem, 'top');
                } else {
                  that.commonFunctions.scrollElementIntoView(posElem, 'top');
                }
                clearInterval(that.intervalTimerId);
              }
            } else {
              clearInterval(that.intervalTimerId);
            }
          }
        }.bind(this), timeout);
      });
    }
  }

  private setCollectionLegacyId(id: string) {
    this.textService.getLegacyIdByCollectionId(id).subscribe({
      next: (collection: any) => {
        this.collectionLegacyId = '';
        if (collection[0].legacy_id) {
          this.collectionLegacyId = collection[0].legacy_id;
        }
      },
      error: (e: any) => {
        this.collectionLegacyId = '';
        console.log('could not get collection data trying to resolve collection legacy id');
      }
    });
  }

  private setUpTextListeners() {
    const nElement: HTMLElement = this.elementRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {

      /* CHECK ONCE IF THE USER IF TOUCHING THE SCREEN */
      this.unlistenFirstTouchStartEvent = this.renderer2.listen(nElement, 'touchstart', (event) => {
        this.userIsTouching = true;
        // Don't listen for mouseover and mouseout events since they should have no effect on touch devices
        this.unlistenMouseoverEvents?.();
        this.unlistenMouseoutEvents?.();
        this.unlistenFirstTouchStartEvent?.();
      });

      /* CLICK EVENTS */
      this.unlistenClickEvents = this.renderer2.listen(nElement, 'click', (event) => {
        if (!this.userIsTouching) {
          this.ngZone.run(() => {
            this.hideToolTip();
          });
        }
        let eventTarget = this.getEventTarget(event);

        // Modal trigger for person-, place- or workinfo and info overlay trigger for footnote.
        if (eventTarget.classList.contains('tooltiptrigger') && eventTarget.hasAttribute('data-id')) {
          this.ngZone.run(() => {
            if (eventTarget.classList.contains('person') && this.readPopoverService.show.personInfo) {
              this.showSemanticDataObjectModal(eventTarget.getAttribute('data-id') || '', 'subject');
            } else if (eventTarget.classList.contains('placeName') && this.readPopoverService.show.placeInfo) {
              this.showSemanticDataObjectModal(eventTarget.getAttribute('data-id') || '', 'location');
            } else if (eventTarget.classList.contains('title') && this.readPopoverService.show.workInfo) {
              this.showSemanticDataObjectModal(eventTarget.getAttribute('data-id') || '', 'work');
            } else if (eventTarget.classList.contains('ttFoot')) {
              this.showFootnoteInfoOverlay(eventTarget.getAttribute('data-id') || '', eventTarget);
            }
          });
        }

        // Possibly click on link.
        eventTarget = event.target as HTMLElement;
        if (eventTarget !== null && !eventTarget.classList.contains('xreference')) {
          if (eventTarget.parentElement) {
            eventTarget = eventTarget.parentElement;
            if (eventTarget !== null) {
              if (!eventTarget.classList.contains('xreference') && eventTarget.parentElement) {
                eventTarget = eventTarget.parentElement;
              }
            }
          }
        }

        // Links in the introduction.
        if (
          eventTarget !== null &&
          eventTarget.classList.contains('xreference')
        ) {
          event.preventDefault();
          const anchorElem: HTMLAnchorElement = eventTarget as HTMLAnchorElement;

          if (anchorElem.classList.contains('ref_external')) {
            // Link to external web page, open in new window/tab.
            if (anchorElem.hasAttribute('href')) {
              window.open(anchorElem.href, '_blank');
            }

          } else if (
            anchorElem.classList.contains('ref_readingtext') ||
            anchorElem.classList.contains('ref_comment') ||
            anchorElem.classList.contains('ref_introduction')
          ) {
            // Link to reading text, comment or introduction.
            // Get the href parts for the targeted text.
            const link = anchorElem.href;
            const hrefTargetItems: Array<string> = decodeURIComponent(
              String(link).split('/').pop() || ''
            ).trim().split(' ');
            let publicationId = '';
            let textId = '';
            let chapterId = '';
            let positionId = '';

            if (
              anchorElem.classList.contains('ref_readingtext') ||
              anchorElem.classList.contains('ref_comment')
            ) {
              // Link to reading text or comment, open in new window.
              const newWindowRef = window.open();

              publicationId = hrefTargetItems[0];
              textId = hrefTargetItems[1];
              this.textService.getCollectionAndPublicationByLegacyId(
                publicationId + '_' + textId
              ).subscribe({
                next: (data: any) => {
                  if (data?.length && data[0]['coll_id'] && data[0]['pub_id']) {
                    publicationId = data[0]['coll_id'];
                    textId = data[0]['pub_id'];
                  }

                  if (hrefTargetItems.length > 2 && !hrefTargetItems[2].startsWith('#')) {
                    chapterId = hrefTargetItems[2];
                  }

                  let hrefString = '/collection/' + publicationId + '/text/' + textId;
                  if (chapterId) {
                    hrefString += '/' + chapterId;
                    if (hrefTargetItems.length > 3 && hrefTargetItems[3].startsWith('#')) {
                      positionId = hrefTargetItems[3].replace('#', '');
                      hrefString += '?position=' + positionId;
                    }
                  } else if (hrefTargetItems.length > 2 && hrefTargetItems[2].startsWith('#')) {
                    positionId = hrefTargetItems[2].replace('#', '');
                    hrefString += '?position=' + positionId;
                  }
                  if (newWindowRef) {
                    newWindowRef.location.href = '/' + this.activeLocale + hrefString;
                  }
                }
              });

            } else if (anchorElem.classList.contains('ref_introduction')) {
              // Link to introduction.
              if (hrefTargetItems.length === 1 && hrefTargetItems[0].startsWith('#')) {
                // If only a position starting with a hash, assume it's in the same publication.
                publicationId = this.id;
                positionId = hrefTargetItems[0];
              } else {
                publicationId = hrefTargetItems[0];
              }
              if (
                hrefTargetItems.length > 1 &&
                hrefTargetItems[hrefTargetItems.length - 1].startsWith('#')
              ) {
                positionId = hrefTargetItems[hrefTargetItems.length - 1];
              }

              // Check if we are already on the same page.
              if (
                (
                  String(publicationId) === String(this.id) ||
                  String(publicationId) === String(this.collectionLegacyId)
                ) && positionId !== undefined 
              ) {
                // Same introduction.
                positionId = positionId.replace('#', '');
                this.ngZone.run(() => {
                  if (positionId !== this.pos) {
                    this.router.navigate(
                      [],
                      {
                        relativeTo: this.route,
                        queryParams: { position: positionId },
                        queryParamsHandling: 'merge'
                      }
                    );
                  } else {
                    this.scrollToPos(100);
                  }
                });
              } else {
                // Different introduction, open in new window.
                const newWindowRef = window.open();
                this.textService.getCollectionAndPublicationByLegacyId(
                  publicationId
                ).subscribe({
                  next: (data: any) => {
                    if (data?.length && data[0]['coll_id']) {
                      publicationId = data[0]['coll_id'];
                    }
                    let hrefString = '/collection/' + publicationId + '/introduction';
                    if (hrefTargetItems.length > 1 && hrefTargetItems[1].startsWith('#')) {
                      positionId = hrefTargetItems[1].replace('#', '');
                      hrefString += '?position=' + positionId;
                    }
                    if (newWindowRef) {
                      newWindowRef.location.href = '/' + this.activeLocale + hrefString;
                    }
                  }
                });
              }
            }
          } else if (anchorElem.classList.contains('ref_illustration')) {
            const imageNumber = anchorElem.hash.split('#')[1];
            this.ngZone.run(() => {
              this.showIllustrationModal(imageNumber);
            });
          } else {
            // Link in the introduction's TOC or link to (foot)note reference
            let targetId = '' as any;
            if (anchorElem.hasAttribute('href')) {
              targetId = anchorElem.getAttribute('href');
            } else if (anchorElem.parentElement?.hasAttribute('href')) {
              targetId = anchorElem.parentElement.getAttribute('href');
            }
            targetId = String(targetId).replace('#', '');
            const dataIdSelector = '[data-id="' + targetId + '"]';
            let target = nElement.querySelector(dataIdSelector) as HTMLElement;
            if (target !== null) {
              this.ngZone.run(() => {
                if (targetId !== this.pos) {
                  this.router.navigate(
                    [],
                    {
                      relativeTo: this.route,
                      queryParams: { position: targetId },
                      queryParamsHandling: 'merge'
                    }
                  );
                } else {
                  this.scrollToPos(100);
                }
              });
            }
          }
        }
      });

      /* MOUSE OVER EVENTS */
      this.unlistenMouseoverEvents = this.renderer2.listen(nElement, 'mouseover', (event) => {
        if (!this.userIsTouching) {
          // Mouseover effects only if using a cursor, not if the user is touching the screen
          const eventTarget = this.getEventTarget(event) as any;

          if (
            eventTarget.classList.contains('tooltiptrigger') &&
            eventTarget.hasAttribute('data-id')
          ) {
            this.ngZone.run(() => {
              if (
                eventTarget.classList.contains('person') &&
                this.readPopoverService.show.personInfo
              ) {
                this.showSemanticDataObjectTooltip(
                  eventTarget.getAttribute('data-id'), 'person', eventTarget
                );
              } else if (
                eventTarget.classList.contains('placeName') &&
                this.readPopoverService.show.placeInfo
              ) {
                this.showSemanticDataObjectTooltip(
                  eventTarget.getAttribute('data-id'), 'place', eventTarget
                );
              } else if (
                eventTarget.classList.contains('title') &&
                this.readPopoverService.show.workInfo
              ) {
                this.showSemanticDataObjectTooltip(
                  eventTarget.getAttribute('data-id'), 'work', eventTarget
                );
              } else if (eventTarget.classList.contains('ttFoot')) {
                this.showFootnoteTooltip(
                  eventTarget.getAttribute('data-id'), eventTarget
                );
              }
            });
          }
        }
      });

      /* MOUSE OUT EVENTS */
      this.unlistenMouseoutEvents = this.renderer2.listen(nElement, 'mouseout', (event) => {
        if (!this.userIsTouching && this.tooltipVisible) {
          this.ngZone.run(() => {
            this.hideToolTip();
          });
        }
      });

    });
  }

  showSemanticDataObjectTooltip(id: string, type: string, targetElem: HTMLElement) {
    this.tooltipService.getSemanticDataObjectTooltip(id, type, targetElem).subscribe(
      (text) => {
        this.setToolTipPosition(targetElem, text);
        this.setToolTipText(text);
      }
    );
  }

  showFootnoteTooltip(id: string, targetElem: HTMLElement) {
    this.tooltipService.getFootnoteTooltip(id, 'introduction', targetElem).subscribe(
      (footnoteHTML: string) => {
        if (footnoteHTML) {
          this.setToolTipPosition(targetElem, footnoteHTML);
          this.setToolTipText(footnoteHTML);
        }
      }
    );
  }

  showFootnoteInfoOverlay(id: string, targetElem: HTMLElement) {
    this.tooltipService.getFootnoteTooltip(id, 'introduction', targetElem).subscribe(
      (footnoteHTML: string) => {
        if (footnoteHTML) {
          this.setInfoOverlayTitle($localize`:@@note:Not`);
          this.setInfoOverlayPositionAndWidth(targetElem);
          this.setInfoOverlayText(footnoteHTML);
        }
      }
    );
  }

  setToolTipPosition(targetElem: HTMLElement, ttText: string) {
    const ttProperties = this.tooltipService.getTooltipProperties(targetElem, ttText, 'page-introduction');

    if (ttProperties !== undefined && ttProperties !== null) {
      // Set tooltip width, position and visibility
      this.toolTipMaxWidth = ttProperties.maxWidth;
      this.toolTipScaleValue = ttProperties.scaleValue;
      this.toolTipPosition = {
        top: ttProperties.top,
        left: ttProperties.left
      };
      this.toolTipPosType = 'absolute';
      if (!this.userSettingsService.isDesktop()) {
        this.toolTipPosType = 'fixed';
      }
      this.tooltipVisible = true;
    }
  }

  /** Set position and width of infoOverlay element. This function is not exactly
   *  the same as in read.ts due to different page structure in introductions.
   */
  private setInfoOverlayPositionAndWidth(triggerElement: HTMLElement, defaultMargins = 10, maxWidth = 600) {
    let margins = defaultMargins;

    // If the viewport width is less than this value the overlay will be placed at the bottom of the viewport.
    const bottomPosBreakpointWidth = 800;

    // Get viewport height and width.
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    // Get page content element and adjust viewport height with horizontal scrollbar height if such is present
    const contentElem = document.querySelector(
      'page-introduction:not([ion-page-hidden]):not(.ion-page-hidden) ion-content.collection-ion-content'
    ) as HTMLElement;
    let horizontalScrollbarOffsetHeight = 0;
    if (contentElem.clientHeight < contentElem.offsetHeight) {
      horizontalScrollbarOffsetHeight = contentElem.offsetHeight - contentElem.clientHeight;
    }

    // Get bounding rectangle of the div.scroll-content-container element which is the container for the column that the trigger element resides in.
    let containerElem = triggerElement.parentElement;
    while (containerElem !== null && containerElem.parentElement !== null &&
     !containerElem.classList.contains('scroll-content-container')) {
       containerElem = containerElem.parentElement;
    }

    if (containerElem !== null && containerElem.parentElement !== null) {
      const containerElemRect = containerElem.getBoundingClientRect();
      let calcWidth = containerElem.clientWidth; // Width without scrollbar

      if (calcWidth > maxWidth + 2 * margins) {
        margins = Math.floor((calcWidth - maxWidth) / 2);
        calcWidth = maxWidth;
      } else {
        calcWidth = calcWidth - 2 * margins;
      }

      let bottomPos = vh - horizontalScrollbarOffsetHeight - containerElemRect.bottom;
      if (
        vw <= bottomPosBreakpointWidth && !(this.userSettingsService.isMobile()) ||
        this.userSettingsService.isMobile()
      ) {
        bottomPos = 0;
      }

      // Set info overlay position
      this.infoOverlayPosition = {
        bottom: bottomPos + 'px',
        left: (containerElemRect.left + margins - contentElem.getBoundingClientRect().left) + 'px'
      };
      this.infoOverlayPosType = 'absolute';

      // Set info overlay width
      this.infoOverlayWidth = calcWidth + 'px';
    }
  }

  private getEventTarget(event: any) {
    const eventTarget: HTMLElement = event.target as HTMLElement;

    try {
      if (eventTarget !== undefined && eventTarget !== null) {
        if (eventTarget.getAttribute('data-id')) {
          return eventTarget;
        }

        if (eventTarget.classList.contains('tooltiptrigger')) {
          return eventTarget;
        } else if (eventTarget.parentElement) {
          if (eventTarget.parentElement.classList.contains('tooltiptrigger')) {
            return eventTarget.parentElement;
          } else if (eventTarget.parentElement?.parentElement?.classList.contains('tooltiptrigger')) {
            return eventTarget.parentElement.parentElement;
          }
        }
        if (eventTarget.classList.contains('anchor')) {
          return eventTarget;
        } else {
          return document.createElement('div');
        }
      } else {
        return document.createElement('div');
      }
    } catch (e) {
      console.error(e);
      return document.createElement('div');
    }
  }

  setToolTipText(text: string) {
    this.toolTipText = this.sanitizer.bypassSecurityTrustHtml(text);
  }

  setInfoOverlayText(text: string) {
    this.infoOverlayText = this.sanitizer.bypassSecurityTrustHtml(text);
  }

  setInfoOverlayTitle(title: string) {
    this.infoOverlayTitle = title;
  }

  hideToolTip() {
    this.setToolTipText('');
    this.toolTipPosType = 'fixed'; // Position needs to be fixed so we can safely hide it outside viewport
    this.toolTipPosition = {
      top: 0 + 'px',
      left: -1500 + 'px'
    };
    this.tooltipVisible = false;
  }

  hideInfoOverlay() {
    this.setInfoOverlayText('');
    this.setInfoOverlayTitle('');
    this.infoOverlayPosType = 'fixed'; // Position needs to be fixed so we can hide it outside viewport
    this.infoOverlayPosition = {
      bottom: 0 + 'px',
      left: -1500 + 'px'
    };
  }

  async showSemanticDataObjectModal(id: string, type: string) {
    const modal = await this.modalCtrl.create({
      component: SemanticDataObjectModal,
      componentProps: { id, type }
    });
    modal.present();
  }

  async showIllustrationModal(imageNumber: string) {
    const modal = await this.modalCtrl.create({
      component: IllustrationModal,
      componentProps: { 'imageNumber': imageNumber }
    });
    modal.present();
  }

  async showViewOptionsPopover(event: any) {
    const toggles = this.viewOptionsTogglesIntro;
    const popover = await this.popoverCtrl.create({
      component: ViewOptionsPopover,
      componentProps: { toggles },
      cssClass: 'view-options-popover',
      reference: 'trigger',
      side: 'bottom',
      alignment: 'end'
    });
    popover.present(event);
  }

  async showReference() {
    const modal = await this.modalCtrl.create({
      component: ReferenceDataModal,
      componentProps: { origin: 'page-introduction' }
    });
    modal.present();
  }

  async showDownloadModal() {
    const modal = await this.modalCtrl.create({
      component: DownloadTextsModalPage,
      componentProps: { textId: this.id, origin: 'page-introduction' }
    });
    modal.present();
  }

  toggleTocMenu() {
    this.tocMenuOpen = !this.tocMenuOpen;
  }

  printMainContentClasses() {
    if (this.userSettingsService.isMobile()) {
      return 'mobile-mode-content';
    } else {
      return '';
    }
  }

}
