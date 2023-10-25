import { Component, ElementRef, Inject, LOCALE_ID, NgZone, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonFabButton, IonFabList, IonPopover, ModalController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { config } from '@config';
import { DownloadTextsModal } from '@modals/download-texts-modal/download-texts-modal';
import { ReferenceDataModal } from '@modals/reference-data/reference-data.modal';
import { SemanticDataObjectModal } from '@modals/semantic-data-object/semantic-data-object.modal';
import { Textsize } from '@models/textsize.model';
import { ViewOptionsPopover } from '@popovers/view-options/view-options.popover';
import { CollectionContentService } from '@services/collection-content.service';
import { CollectionsService } from '@services/collections.service';
import { HtmlParserService } from '@services/html-parser.service';
import { PlatformService } from '@services/platform.service';
import { ScrollService } from '@services/scroll.service';
import { TooltipService } from '@services/tooltip.service';
import { UrlService } from '@services/url.service';
import { ViewOptionsService } from '@services/view-options.service';
import { isBrowser } from '@utility-functions';


@Component({
  selector: 'page-text',
  templateUrl: 'collection-text.html',
  styleUrls: ['collection-text.scss'],
})
export class CollectionTextPage implements OnDestroy, OnInit {
  @ViewChild('addViewPopover') addViewPopover: IonPopover;
  @ViewChildren('fabColumnOptions') fabColumnOptions: QueryList<IonFabList>;
  @ViewChildren('fabColumnOptionsButton') fabColumnOptionsButton: QueryList<IonFabButton>;

  activeMobileModeViewType: string = 'established';
  addViewPopoverisOpen: boolean = false;
  availableMobileModeViews: string[] = [];
  collectionAndPublicationLegacyId: string = '';
  enabledViewTypes: string[] = [];
  illustrationsViewShown: boolean = false;
  infoOverlayPosition: any = {
    bottom: 0 + 'px',
    left: -1500 + 'px'
  };
  infoOverlayPosType: string = 'fixed';
  infoOverlayText: SafeHtml = '';
  infoOverlayTitle: string = '';
  infoOverlayWidth: string | null = null;
  legacyId: string = '';
  mobileMode: boolean = false;
  multilingualReadingTextLanguages: any[] = [];
  paramChapterID: any;
  paramCollectionID: any;
  paramPublicationID: any;
  routeParamsSubscription: Subscription | null = null;
  routeQueryParamsSubscription: Subscription | null = null;
  searchMatches: string[] = [];
  showTextDownloadButton: boolean = false;
  showURNButton: boolean = true;
  showViewOptionsButton: boolean = true;
  textItemID: string = '';
  textPosition: string = '';
  textsize: Textsize = Textsize.Small;
  textsizeSubscription: Subscription | null = null;
  toolTipMaxWidth: string | null = null;
  toolTipPosType: string = 'fixed';
  toolTipPosition: any = {
    top: 0 + 'px',
    left: -1500 + 'px'
  };
  toolTipScaleValue: number | null = null;
  toolTipText: SafeHtml = '';
  tooltipVisible: boolean = false;
  userIsTouching: boolean = false;
  views: any[] = [];

  TextsizeEnum = Textsize;
  
  private unlistenFirstTouchStartEvent?: () => void;
  private unlistenClickEvents?: () => void;
  private unlistenMouseoverEvents?: () => void;
  private unlistenMouseoutEvents?: () => void;

  constructor(
    private collectionContentService: CollectionContentService,
    private collectionsService: CollectionsService,
    private elementRef: ElementRef,
    private modalCtrl: ModalController,
    private ngZone: NgZone,
    private parserService: HtmlParserService,
    private platformService: PlatformService,
    private popoverCtrl: PopoverController,
    private renderer2: Renderer2,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    public scrollService: ScrollService,
    private tooltipService: TooltipService,
    private urlService: UrlService,
    public viewOptionsService: ViewOptionsService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.multilingualReadingTextLanguages = config.app?.i18n?.multilingualReadingTextLanguages ?? [];
    this.showTextDownloadButton = config.page?.text?.showTextDownloadButton ?? false;
    this.showURNButton = config.page?.text?.showURNButton ?? true;
    this.showViewOptionsButton = config.page?.text?.showViewOptionsButton ?? true;

    // Hide some or all of the view types that can be added (variants, facsimiles, established etc.)
    const viewTypes = config.page?.text?.viewTypes ?? {};
    for (const type in viewTypes) {
      if (
        viewTypes.hasOwnProperty(type) &&
        viewTypes[type]
      ) {
        if (
          type === 'established' &&
          this.multilingualReadingTextLanguages.length > 1
        ) {
          for (const estLanguage of this.multilingualReadingTextLanguages) {
            this.enabledViewTypes.push(type + '_' + estLanguage);
          }
        } else {
          this.enabledViewTypes.push(type);
        }
      }
    }

    // Set default mobile mode views
    if (this.multilingualReadingTextLanguages.length > 1) {
      for (const estLanguage of this.multilingualReadingTextLanguages) {
        this.availableMobileModeViews.push('established_' + estLanguage);
      }
    } else {
      this.availableMobileModeViews.push('established');
    }
    this.availableMobileModeViews.push('facsimiles');
    // availableMobileModeViews.push('manuscripts');
    const defaultViews = config.page?.text?.defaultViews ?? ['established'];
    this.activeMobileModeViewType = defaultViews.filter(
      (value: string) => this.availableMobileModeViews.includes(value) && this.enabledViewTypes.includes(value)
    )[0] || 'established';
    if (
      this.multilingualReadingTextLanguages.length > 1 &&
      this.activeMobileModeViewType.includes('established_')
    ) {
      // Set the default selected mobile mode view to the active locale's read text if multilingual read texts
      this.activeMobileModeViewType = 'established_' + this.activeLocale;
    }
    if (
      this.collectionContentService.activeCollectionTextMobileModeView &&
      this.availableMobileModeViews.includes(
        this.collectionContentService.activeCollectionTextMobileModeView
      )
    ) {
      this.activeMobileModeViewType = this.collectionContentService.activeCollectionTextMobileModeView;
    }
  }

  ngOnInit() {
    this.mobileMode = this.platformService.isMobile();

    this.textsizeSubscription = this.viewOptionsService.getTextsize().subscribe(
      (textsize: Textsize) => {
        this.textsize = textsize;
      }
    );

    this.routeParamsSubscription = this.route.params.subscribe(
      (params: any) => {
        let textItemID;

        if (params['chapterID'] !== undefined && params['chapterID'] !== '') {
          textItemID = params['collectionID'] + '_' + params['publicationID'] + '_' + params['chapterID'];
          this.paramChapterID = params['chapterID'];
        } else {
          textItemID = params['collectionID'] + '_' + params['publicationID'];
        }

        if (this.textItemID !== textItemID) {
          this.textItemID = textItemID;
          // Save the id of the previous and current read view text in textService.
          this.collectionContentService.previousReadViewTextId = this.collectionContentService.readViewTextId;
          this.collectionContentService.readViewTextId = this.textItemID;
        }

        this.paramCollectionID = params['collectionID'];
        this.paramPublicationID = params['publicationID'];

        if (config.collections?.enableLegacyIDs) {
          this.setCollectionAndPublicationLegacyId(this.paramPublicationID);
        }
      }
    );

    this.routeQueryParamsSubscription = this.route.queryParams.subscribe(
      (queryParams: any) => {

        if (queryParams['q']) {
          this.searchMatches = this.parserService.getSearchMatchesFromQueryParams(queryParams['q']);
        }

        if (queryParams['views']) {
          const parsedViews = this.urlService.parse(queryParams['views'], true);

          let viewsChanged = false;
          if (this.views.length !== parsedViews.length) {
            viewsChanged = true;
          } else {
            for (let i = 0; i < this.views.length; i++) {
              // Comparison on the entire view objects doesn't work for texts that have
              // just positions that can change, hence checking only if types unequal
              if (this.views[i].type !== parsedViews[i].type) {
                viewsChanged = true;
                break;
              }
            }
          }

          if (this.views.length < 1 || viewsChanged) {
            this.views = parsedViews;
            this.illustrationsViewShown = this.viewTypeIsShown('illustrations');
          }

          // Clear the array keeping track of recently open views in
          // text service and populate it with the current ones.
          this.collectionContentService.recentCollectionTextViews = [];
          parsedViews.forEach((viewObj: any) => {
            const cachedViewObj: any = { type: viewObj.type };
            if (
              viewObj.type === 'variants' &&
              viewObj.sortOrder
            ) {
              cachedViewObj.sortOrder = viewObj.sortOrder;
            }
            this.collectionContentService.recentCollectionTextViews.push(cachedViewObj);
          });
        } else {
          this.setViews();
        }

        if (queryParams['position'] || (this.textPosition && queryParams['position'] === undefined)) {
          this.textPosition = queryParams['position'];
        }

      }
    );

    if (isBrowser()) {
      this.setUpTextListeners();
    }
  }

  ngOnDestroy() {
    this.routeParamsSubscription?.unsubscribe();
    this.routeQueryParamsSubscription?.unsubscribe();
    this.textsizeSubscription?.unsubscribe();
    this.unlistenClickEvents?.();
    this.unlistenMouseoverEvents?.();
    this.unlistenMouseoutEvents?.();
    this.unlistenFirstTouchStartEvent?.();
  }

  private setViews() {
    // There are no views defined in the url params =>
    // show a) current views if defined,
    //      b) recent view types if defined, or
    //      c) default view types.
    if (this.views.length > 0) {
      // show current views
      this.updateViewsInRouterQueryParams(this.views);
    } else if (this.collectionContentService.recentCollectionTextViews.length > 0) {
      // show recent view types
      // if different collection than previously pass type of views only
      let typesOnly = this.textItemID.split('_')[0] !== this.collectionContentService.previousReadViewTextId.split('_')[0] ? true : false;
      this.updateViewsInRouterQueryParams(this.collectionContentService.recentCollectionTextViews, typesOnly);
    } else {
      // show default view types
      this.setDefaultViewsFromConfig();
    }
  }

  private setDefaultViewsFromConfig() {
    let newViews: Array<any> = [];

    if (this.platformService.isMobile()) {
      this.availableMobileModeViews.forEach((type: string) => {
        newViews.push({ type });
      });
    } else {
      const defaultViews: string[] = config.page?.text?.defaultViews ?? ['established'];
      defaultViews.forEach((type: string) => {
        if (this.enabledViewTypes.indexOf(type) !== -1) {
          newViews.push({ type });
        }
      });
    }

    this.updateViewsInRouterQueryParams(newViews);
  }

  private getEventTarget(event: any) {
    let eventTarget: HTMLElement = document.createElement('div');

    if (event.target.hasAttribute('data-id')) {
      return event.target;
    }
    try {
      if (event.target) {
        if (
          event.target.classList?.contains('tooltiptrigger')
        ) {
          eventTarget = event.target;
        } else if (
          event.target?.parentNode?.classList?.contains('tooltiptrigger')
        ) {
          eventTarget = event.target.parentNode;
        } else if (
          event.target.parentNode?.classList &&
          event.target.parentNode?.parentNode?.classList?.contains('tooltiptrigger')
        ) {
          eventTarget = event.target.parentNode.parentNode;
        } else if (
          event.target.classList?.contains('anchor')
        ) {
          eventTarget = event.target;
        } else if (
          event.target.classList?.contains('variantScrollTarget')
        ) {
          eventTarget = event.target;
        } else if (
          event.target.parentNode?.classList?.contains('variantScrollTarget')
        ) {
          eventTarget = event.target.parentNode;
        } else if (
          event.target.parentNode?.parentNode?.classList?.contains('variantScrollTarget')
        ) {
          eventTarget = event.target.parentNode.parentNode;
        } else if (
          event.target.classList?.contains('anchorScrollTarget')
        ) {
          eventTarget = event.target;
        } else if (
          event.target.parentNode?.classList?.contains('anchorScrollTarget')
        ) {
          eventTarget = event.target.parentNode;
        } else if (
          event.target.classList?.contains('extVariantsTrigger')
        ) {
          eventTarget = event.target;
        } else if (
          event.target.parentNode?.classList?.contains('extVariantsTrigger')
        ) {
          eventTarget = event.target.parentNode;
        }
      }
    } catch (e) {
      console.error('Error resolving event target in getEventTarget() in read.ts', e);
    }
    return eventTarget;
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
        let modalShown = false;

        // Modal trigger for person-, place- or workinfo and info overlay trigger for footnote and comment.
        // Loop needed for finding correct tooltip trigger when there are nested triggers.
        while (!modalShown && eventTarget['classList'].contains('tooltiptrigger')) {
          if (eventTarget.hasAttribute('data-id')) {
            if (
              eventTarget['classList'].contains('person') &&
              this.viewOptionsService.show.personInfo
            ) {
              this.ngZone.run(() => {
                this.showSemanticDataObjectModal(eventTarget.getAttribute('data-id'), 'subject');
              });
              modalShown = true;
            } else if (
              eventTarget['classList'].contains('placeName') &&
              this.viewOptionsService.show.placeInfo
            ) {
              this.ngZone.run(() => {
                this.showSemanticDataObjectModal(eventTarget.getAttribute('data-id'), 'location');
              });
              modalShown = true;
            } else if (
              eventTarget['classList'].contains('title') &&
              this.viewOptionsService.show.workInfo
            ) {
              this.ngZone.run(() => {
                this.showSemanticDataObjectModal(eventTarget.getAttribute('data-id'), 'work');
              });
              modalShown = true;
            } else if (
              eventTarget['classList'].contains('comment') &&
              this.viewOptionsService.show.comments
            ) {
              /* The user has clicked a comment lemma ("asterisk") in the reading-text.
                Check if comments view is shown. */
              const viewTypesShown = this.getViewTypesShown();
              const commentsViewIsShown = viewTypesShown.includes('comments');
              if (commentsViewIsShown && this.platformService.isDesktop()) {
                // Scroll to comment in comments view and scroll lemma in reading-text view.
                const numId = eventTarget.getAttribute('data-id').replace( /^\D+/g, '');
                const targetId = 'start' + numId;
                let lemmaStart = document.querySelector(
                  'page-text:not([ion-page-hidden]):not(.ion-page-hidden) read-text'
                ) as HTMLElement;
                lemmaStart = lemmaStart.querySelector('[data-id="' + targetId + '"]') as HTMLElement;
                if (
                  lemmaStart.parentElement !== null &&
                  lemmaStart.parentElement.classList.contains('ttFixed')
                ) {
                  // The lemma is in a footnote, so we should get the second element with targetId.
                  lemmaStart = document.querySelector(
                    'page-text:not([ion-page-hidden]):not(.ion-page-hidden) read-text'
                  ) as HTMLElement;
                  lemmaStart = lemmaStart.querySelectorAll(
                    '[data-id="' + targetId + '"]'
                  )[1] as HTMLElement;
                }
                if (lemmaStart !== null && lemmaStart !== undefined) {
                  // Scroll to start of lemma in reading text and temporarily prepend arrow.
                  this.scrollService.scrollToCommentLemma(lemmaStart);
                  // Scroll to comment in the comments-column.
                  this.scrollService.scrollToComment(numId);
                }
              } else {
                // If a comments view isn't shown or viewmode is mobile, show comment in infoOverlay.
                this.ngZone.run(() => {
                  this.showCommentInfoOverlay(eventTarget.getAttribute('data-id'), eventTarget);
                });
              }
              modalShown = true;
            } else if (
              eventTarget['classList'].contains('ttFoot') &&
              eventTarget['classList'].contains('teiManuscript')
            ) {
              // Footnote reference clicked in manuscript column
              this.ngZone.run(() => {
                this.showFootnoteInfoOverlay(eventTarget.getAttribute('data-id'), 'manuscript', eventTarget);
              });
              modalShown = true;
            } else if (eventTarget['classList'].contains('ttFoot')) {
              // Footnote reference clicked in reading text
              this.ngZone.run(() => {
                this.showFootnoteInfoOverlay(eventTarget.getAttribute('data-id'), 'read-text', eventTarget);
              });
              modalShown = true;
            }
          } else if (
            (eventTarget['classList'].contains('ttChanges') && this.viewOptionsService.show.changes) ||
            (eventTarget['classList'].contains('ttNormalisations') && this.viewOptionsService.show.normalisations) ||
            (eventTarget['classList'].contains('ttAbbreviations') && this.viewOptionsService.show.abbreviations)
          ) {
            this.ngZone.run(() => {
              this.showInfoOverlayFromInlineHtml(eventTarget);
            });
            modalShown = true;
          } else if (
            eventTarget['classList'].contains('ttMs') ||
            eventTarget['classList'].contains('tooltipMs')
          ) {
            if (
              eventTarget['classList'].contains('unclear') ||
              eventTarget['classList'].contains('gap') ||
              eventTarget['classList'].contains('marginalia')
            ) {
              /* Editorial note about unclear text or text in margin, should be clickable only in
                 the reading text column. */
              let parentElem: any = eventTarget;
              parentElem = parentElem.parentElement;
              while (parentElem !== null && parentElem.tagName !== 'READ-TEXT') {
                parentElem = parentElem.parentElement;
              }
              if (parentElem !== null) {
                this.ngZone.run(() => {
                  this.showInfoOverlayFromInlineHtml(eventTarget);
                });
                modalShown = true;
              }
            }
          } else if (
            eventTarget.hasAttribute('id') &&
            eventTarget['classList'].contains('ttFoot') &&
            eventTarget['classList'].contains('teiVariant')
          ) {
            // Footnote reference clicked in variant.
            this.ngZone.run(() => {
              this.showFootnoteInfoOverlay(eventTarget.getAttribute('id'), 'variant', eventTarget);
            });
            modalShown = true;
          } else if (
            eventTarget['classList'].contains('ttFoot') &&
            !eventTarget.hasAttribute('id') &&
            !eventTarget.hasAttribute('data-id')
          ) {
            this.ngZone.run(() => {
              this.showInfoOverlayFromInlineHtml(eventTarget);
            });
            modalShown = true;
          } else if (eventTarget['classList'].contains('ttComment')) {
            this.ngZone.run(() => {
              this.showInfoOverlayFromInlineHtml(eventTarget);
            });
            modalShown = true;
          }

          /* Get the parent node of the event target for the next iteration
             if a modal or infoOverlay hasn't been shown already. This is
             for finding nested tooltiptriggers, i.e. a person can be a
             child of a change. */
          if (!modalShown) {
            eventTarget = eventTarget['parentNode'];
            if (
              !eventTarget['classList'].contains('tooltiptrigger') &&
              eventTarget['parentNode'] &&
              eventTarget['parentNode']['classList'].contains('tooltiptrigger')
            ) {
              /* The parent isn't a tooltiptrigger, but the parent of the parent
                 is, use it for the next iteration. */
              eventTarget = eventTarget['parentNode'];
            }
          }
        }

        eventTarget = this.getEventTarget(event);
        if (
          eventTarget['classList'].contains('variantScrollTarget') ||
          eventTarget['classList'].contains('anchorScrollTarget')
        ) {
          // Click on variant lemma --> highlight and scroll all variant columns.

          eventTarget.classList.add('highlight');
          this.ngZone.run(() => {
            this.scrollToVariant(eventTarget);
          });
          window.setTimeout(function(elem: any) {
            elem.classList.remove('highlight');
          }.bind(null, eventTarget), 5000);
        } else if (eventTarget['classList'].contains('extVariantsTrigger')) {
          // Click on trigger for showing links to external variants
          if (eventTarget.nextElementSibling) {
            if (
              eventTarget.nextElementSibling.classList.contains('extVariants') &&
              !eventTarget.nextElementSibling.classList.contains('show-extVariants')
            ) {
              eventTarget.nextElementSibling.classList.add('show-extVariants');
            } else if (
              eventTarget.nextElementSibling.classList.contains('extVariants') &&
              eventTarget.nextElementSibling.classList.contains('show-extVariants')
            ) {
              eventTarget.nextElementSibling.classList.remove('show-extVariants');
            }
          }
        }

        // Possibly click on link.
        eventTarget = event.target as HTMLElement;
        if (!eventTarget?.classList.contains('xreference')) {
          eventTarget = eventTarget.parentElement;
          if (eventTarget) {
            if (!eventTarget.classList.contains('xreference')) {
              eventTarget = eventTarget.parentElement;
            }
          }
        }

        if (eventTarget?.classList.contains('xreference')) {
          event.preventDefault();
          const anchorElem: HTMLAnchorElement = eventTarget as HTMLAnchorElement;

          if (eventTarget.classList.contains('footnoteReference')) {
            // Link to (foot)note reference in the same text.
            let targetId = '';
            if (anchorElem.hasAttribute('href')) {
              targetId = anchorElem.getAttribute('href') || '';
            } else if (anchorElem.parentElement?.hasAttribute('href')) {
              targetId = anchorElem.parentElement.getAttribute('href') || '';
            }

            if (targetId) {
              let targetColumnId = '';
              if (anchorElem.className.includes('targetColumnId_')) {
                for (let i = 0; i < anchorElem.classList.length; i++) {
                  if (anchorElem.classList[i].startsWith('targetColumnId_')) {
                    targetColumnId = anchorElem.classList[i].replace('targetColumnId_', '');
                  }
                }
              }

              // Find the containing scrollable element.
              let containerElem = null;
              if (targetColumnId) {
                containerElem = nElement.querySelector(
                  '#' + targetColumnId
                );
              } else {
                containerElem = anchorElem.parentElement;
                while (
                  containerElem?.parentElement &&
                  !containerElem.classList.contains('scroll-content-container')
                ) {
                  containerElem = containerElem.parentElement;
                }
                if (!containerElem?.parentElement) {
                  containerElem = null;
                }
                if (!containerElem) {
                  // Check if a footnotereference link in infoOverlay. This method is used to find the container element if in mobile mode.
                  if (
                    anchorElem.parentElement?.parentElement?.hasAttribute('class') &&
                    anchorElem.parentElement?.parentElement?.classList.contains('infoOverlayContent')
                  ) {
                    containerElem = nElement.querySelector(
                      'ion-content.collection-ion-content.mobile-mode-content .scroll-content-container'
                    ) as HTMLElement;
                  }
                }
              }

              if (containerElem) {
                let dataIdSelector = '[data-id="' + String(targetId).replace('#', '') + '"]';
                if (anchorElem.classList.contains('teiVariant')) {
                  // Link to (foot)note reference in variant, uses id-attribute instead of data-id.
                  dataIdSelector = '[id="' + String(targetId).replace('#', '') + '"]';
                }
                const target = containerElem.querySelector(dataIdSelector) as HTMLElement;
                if (target) {
                  this.scrollService.scrollToHTMLElement(target, 'top');
                }
              }
            }
          } else if (anchorElem.classList.contains('ref_variant')) {
            // Click on link to another variant text
            const sid = 'sid-' + anchorElem.href.split(';sid-')[1];
            const varTargets = Array.from(document.querySelectorAll('#' + sid));

            if (varTargets.length > 0) {
              this.scrollService.scrollElementIntoView(anchorElem);
              anchorElem.classList.add('highlight');
              window.setTimeout(function(elem: any) {
                elem.classList.remove('highlight');
              }.bind(null, anchorElem), 5000);

              varTargets.forEach((varTarget: any) => {
                this.scrollService.scrollElementIntoView(varTarget);
                if (varTarget.firstElementChild?.classList.contains('var_margin')) {
                  const marginElem = varTarget.firstElementChild;

                  // Highlight all children of the margin element that have the ref_variant class
                  const refVariants = Array.from(marginElem.querySelectorAll('.ref_variant'));
                  refVariants.forEach((refVariant: any) => {
                    refVariant.classList.add('highlight');
                    window.setTimeout(function(elem: any) {
                      elem.classList.remove('highlight');
                    }.bind(null, refVariant), 5000);
                  });

                  if (marginElem.firstElementChild?.classList.contains('extVariantsTrigger')) {
                    marginElem.firstElementChild.classList.add('highlight');
                    window.setTimeout(function(elem: any) {
                      elem.classList.remove('highlight');
                    }.bind(null, marginElem.firstElementChild), 5000);
                  }
                }
              });
            }

          } else if (anchorElem.classList.contains('ref_external')) {
            // Link to external web page, open in new window/tab.
            if (anchorElem.hasAttribute('href')) {
              window.open(anchorElem.href, '_blank');
            }

          } else {
            // Link to a reading-text, comment or introduction.
            // Get the href parts for the targeted text.
            const hrefLink = anchorElem.href.replace('_', ' ');
            const hrefTargetItems: Array<string> = decodeURIComponent(
              String(hrefLink).split('/').pop() || ''
            ).trim().split(' ');
            let publicationId = '';
            let textId = '';
            let chapterId = '';
            let positionId = '';

            if (
              anchorElem.classList.contains('ref_readingtext') ||
              anchorElem.classList.contains('ref_comment')
            ) {
              // Link to reading text or comment.

              let comparePageId = '';

              if (hrefTargetItems.length === 1 && hrefTargetItems[0].startsWith('#')) {
                // If only a position starting with a hash, assume it's in the same collection, text and chapter.
                if (this.paramChapterID) {
                  comparePageId = this.paramCollectionID + '_' + this.paramPublicationID + '_' + this.paramChapterID;
                } else {
                  comparePageId = this.paramCollectionID + '_' + this.paramPublicationID;
                }
              } else if (hrefTargetItems.length > 1) {
                publicationId = hrefTargetItems[0];
                textId = hrefTargetItems[1];
                comparePageId = publicationId + '_' + textId;
                if (hrefTargetItems.length > 2 && !hrefTargetItems[2].startsWith('#')) {
                  chapterId = hrefTargetItems[2];
                  comparePageId += '_' + chapterId;
                }
              }

              let legacyPageId = this.collectionAndPublicationLegacyId;
              if (legacyPageId && this.paramChapterID) {
                legacyPageId += '_' + this.paramChapterID;
              }

              // Check if we are already on the same page.
              if (
                (comparePageId === this.textItemID || comparePageId === legacyPageId) &&
                hrefTargetItems[hrefTargetItems.length - 1].startsWith('#')
              ) {
                // We are on the same page and the last item in the target href is a textposition.
                positionId = hrefTargetItems[hrefTargetItems.length - 1].replace('#', '');

                // Find the element in the correct column (read-text or comments) based on ref type.
                const matchingElements = nElement.querySelectorAll(
                  '[name="' + positionId + '"]'
                );
                let targetElement = null;
                let refType = 'READ-TEXT';
                if (anchorElem.classList.contains('ref_comment')) {
                  refType = 'COMMENTS';
                }
                for (let i = 0; i < matchingElements.length; i++) {
                  let parentElem = matchingElements[i].parentElement;
                  while (parentElem?.tagName !== refType) {
                    parentElem = parentElem?.parentElement ?? null;
                  }
                  if (parentElem?.tagName === refType) {
                    targetElement = matchingElements[i] as HTMLElement;
                    if (
                      targetElement.parentElement?.classList.contains('ttFixed') ||
                      targetElement.parentElement?.parentElement?.classList.contains('ttFixed')
                    ) {
                      // Found position is in footnote --> look for next occurence since the first
                      // footnote element is not displayed (footnote elements are copied to a list
                      // at the end of the reading text and that's the position we need to find).
                    } else {
                      break;
                    }
                  }
                }
                if (targetElement?.classList.contains('anchor')) {
                  this.scrollService.scrollToHTMLElement(targetElement);
                }
              } else {
                // We are not on the same page, open in new window.
                // (Safari on iOS doesn't allow window.open() inside async calls so
                // we have to open the new window first and set its location later.)
                const newWindowRef = window.open();

                this.collectionsService.getCollectionAndPublicationByLegacyId(
                  publicationId + '_' + textId
                ).subscribe(
                  (data: any) => {
                    if (data?.length && data[0]['coll_id'] && data[0]['pub_id']) {
                      publicationId = data[0]['coll_id'];
                      textId = data[0]['pub_id'];
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
                );
              }

            } else if (anchorElem.classList.contains('ref_introduction')) {
              // Link to introduction, open in new window/tab.
              publicationId = hrefTargetItems[0];

              const newWindowRef = window.open();

              this.collectionsService.getCollectionAndPublicationByLegacyId(
                publicationId
              ).subscribe(
                (data: any) => {
                  if (data?.length && data[0]['coll_id']) {
                    publicationId = data[0]['coll_id'];
                  }
                  let hrefString = '/collection/' + publicationId + '/introduction';
                  if (hrefTargetItems.length > 1 && hrefTargetItems[1].startsWith('#')) {
                    positionId = hrefTargetItems[1].replace('#', '');
                    hrefString += '?position=' + positionId;
                  }
                  // Open the link in a new window/tab.
                  if (newWindowRef) {
                    newWindowRef.location.href = '/' + this.activeLocale + hrefString;
                  }
                }
              );
            }
          }
        }
      });

      /* MOUSE OVER EVENTS */
      this.unlistenMouseoverEvents = this.renderer2.listen(nElement, 'mouseover', (event) => {
        if (!this.userIsTouching) {
          // Mouseover effects only if using a cursor, not if the user is touching the screen
          let eventTarget = this.getEventTarget(event);
          // Loop needed for finding correct tooltip trigger when there are nested triggers.
          while (!this.tooltipVisible && eventTarget['classList'].contains('tooltiptrigger')) {
            if (eventTarget.hasAttribute('data-id')) {
              if (
                eventTarget['classList'].contains('person') &&
                this.viewOptionsService.show.personInfo
              ) {
                this.ngZone.run(() => {
                  this.showSemanticDataObjectTooltip(eventTarget.getAttribute('data-id'), 'person', eventTarget);
                });
              } else if (
                eventTarget['classList'].contains('placeName') &&
                this.viewOptionsService.show.placeInfo
              ) {
                this.ngZone.run(() => {
                  this.showSemanticDataObjectTooltip(eventTarget.getAttribute('data-id'), 'place', eventTarget);
                });
              } else if (
                eventTarget['classList'].contains('title') &&
                this.viewOptionsService.show.workInfo
              ) {
                this.ngZone.run(() => {
                  this.showSemanticDataObjectTooltip(eventTarget.getAttribute('data-id'), 'work', eventTarget);
                });
              } else if (
                eventTarget['classList'].contains('comment') &&
                this.viewOptionsService.show.comments
              ) {
                this.ngZone.run(() => {
                  this.showCommentTooltip(eventTarget.getAttribute('data-id'), eventTarget);
                });
              } else if (
                eventTarget['classList'].contains('teiManuscript') &&
                eventTarget['classList'].contains('ttFoot')
              ) {
                this.ngZone.run(() => {
                  this.showFootnoteTooltip(eventTarget.getAttribute('data-id'), 'manuscript', eventTarget);
                });
              } else if (eventTarget['classList'].contains('ttFoot')) {
                this.ngZone.run(() => {
                  this.showFootnoteTooltip(eventTarget.getAttribute('data-id'), 'read-text', eventTarget);
                });
              }
            } else if (
              (
                eventTarget['classList'].contains('ttChanges') &&
                this.viewOptionsService.show.changes
              ) || (
                eventTarget['classList'].contains('ttNormalisations') &&
                this.viewOptionsService.show.normalisations
              ) || (
                eventTarget['classList'].contains('ttAbbreviations') &&
                this.viewOptionsService.show.abbreviations
              )
            ) {
              this.ngZone.run(() => {
                this.showTooltipFromInlineHtml(eventTarget);
              });
            } else if (eventTarget['classList'].contains('ttVariant')) {
              this.ngZone.run(() => {
                this.showVariantTooltip(eventTarget);
              });
            } else if (eventTarget['classList'].contains('ttMs')) {
              // Check if the tooltip trigger element is in a manuscripts column
              // since ttMs should generally only be triggered there.
              if (
                eventTarget['classList'].contains('unclear') ||
                eventTarget['classList'].contains('gap') ||
                eventTarget['classList'].contains('marginalia')
              ) {
                // Tooltips for text with class unclear, gap or marginalia should be shown in other columns too.
                this.ngZone.run(() => {
                  this.showTooltipFromInlineHtml(eventTarget);
                });
              } else {
                let parentElem: HTMLElement | null = eventTarget as HTMLElement;
                parentElem = parentElem.parentElement;
                while (parentElem !== null && parentElem?.tagName !== 'MANUSCRIPTS') {
                  parentElem = parentElem.parentElement;
                }
                if (parentElem) {
                  this.ngZone.run(() => {
                    this.showTooltipFromInlineHtml(eventTarget);
                  });
                }
              }
            } else if (
              eventTarget.hasAttribute('id') &&
              eventTarget['classList'].contains('teiVariant') &&
              eventTarget['classList'].contains('ttFoot')
            ) {
              this.ngZone.run(() => {
                this.showFootnoteTooltip(
                  eventTarget.getAttribute('id'), 'variant', eventTarget
                );
              });
            } else if (
              (
                eventTarget['classList'].contains('ttFoot') ||
                eventTarget['classList'].contains('ttComment')
              ) &&
              !eventTarget.hasAttribute('id') &&
              !eventTarget.hasAttribute('data-id')
            ) {
              this.ngZone.run(() => {
                this.showTooltipFromInlineHtml(eventTarget);
              });
            }

            /* Get the parent node of the event target for the next iteration if a tooltip hasn't been shown already.
            * This is for finding nested tooltiptriggers, i.e. a person can be a child of a change. */
            if (!this.tooltipVisible) {
              eventTarget = eventTarget['parentNode'];
              if (
                !eventTarget['classList'].contains('tooltiptrigger') &&
                eventTarget['parentNode']['classList'].contains('tooltiptrigger')
              ) {
                /* The parent isn't a tooltiptrigger, but the parent of the parent is, use it for the next iteration. */
                eventTarget = eventTarget['parentNode'];
              }
            }
          }

          /* Check if mouse over doodle image which has a parent tooltiptrigger */
          if (
            eventTarget.hasAttribute('data-id') &&
            eventTarget['classList'].contains('doodle') &&
            eventTarget['classList'].contains('unknown') &&
            eventTarget['parentNode'] &&
            eventTarget['parentNode']['classList'].contains('tooltiptrigger')
          ) {
            eventTarget = eventTarget['parentNode'];
            this.ngZone.run(() => {
              this.showTooltipFromInlineHtml(eventTarget);
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

  private showSemanticDataObjectTooltip(id: string, type: string, targetElem: HTMLElement) {
    this.tooltipService.getSemanticDataObjectTooltip(id, type, targetElem).subscribe(
      (text: string) => {
        this.setToolTipPosition(targetElem, text);
        this.setToolTipText(text);
      }
    );
  }

  private showFootnoteTooltip(id: string, textType: string, targetElem: HTMLElement) {
    this.tooltipService.getFootnoteTooltip(id, textType, targetElem).subscribe(
      (footnoteHTML: string) => {
        if (footnoteHTML) {
          this.setToolTipPosition(targetElem, footnoteHTML);
          this.setToolTipText(footnoteHTML);
        }
      }
    );
  }

  /**
   * This function is used for showing tooltips for changes,
   * normalisations, abbreviations and explanations in manuscripts.
   */
  private showTooltipFromInlineHtml(targetElem: HTMLElement) {
    if (targetElem.nextElementSibling?.classList.contains('tooltip')) {
      this.setToolTipPosition(targetElem, targetElem.nextElementSibling.innerHTML);
      this.setToolTipText(targetElem.nextElementSibling.innerHTML);
    }
  }

  private showCommentTooltip(id: string, targetElem: HTMLElement) {
    this.tooltipService.getCommentTooltip(this.textItemID, id).subscribe({
      next: (tooltip) => {
        this.setToolTipPosition(targetElem, tooltip.description);
        this.setToolTipText(tooltip.description);
      },
      error: (e) => {
        const noInfoFound = $localize`:@@Occurrences.NoInfoFound:Ingen information hittades.`;
        this.setToolTipPosition(targetElem, noInfoFound);
        this.setToolTipText(noInfoFound);
      }
    });
  }

  private showVariantTooltip(targetElem: HTMLElement) {
    if (
      targetElem.nextElementSibling?.classList.contains('tooltip') &&
      targetElem.nextElementSibling?.textContent
    ) {
      this.setToolTipPosition(targetElem, targetElem.nextElementSibling.textContent);
      this.setToolTipText(targetElem.nextElementSibling.textContent);
    }
  }

  private showFootnoteInfoOverlay(id: string, textType: string, targetElem: HTMLElement) {
    this.tooltipService.getFootnoteTooltip(id, textType, targetElem).subscribe(
      (footnoteHTML: string) => {
        if (footnoteHTML) {
          this.setInfoOverlayTitle($localize`:@@note:Not`);
          this.setInfoOverlayPositionAndWidth(targetElem);
          this.setInfoOverlayText(footnoteHTML);
        }
      }
    );
  }

  private showCommentInfoOverlay(id: string, targetElem: HTMLElement) {
    this.tooltipService.getCommentTooltip(this.textItemID, id).subscribe({
      next: (tooltip) => {
        this.setInfoOverlayTitle($localize`:@@Occurrences.Commentary:Kommentar`);
        this.setInfoOverlayPositionAndWidth(targetElem);
        this.setInfoOverlayText(tooltip.description);
      },
      error: (errorC) => {
        this.setInfoOverlayTitle($localize`:@@Occurrences.Commentary:Kommentar`);
        this.setInfoOverlayPositionAndWidth(targetElem);
        this.setInfoOverlayText($localize`:@@Occurrences.NoInfoFound:Ingen information hittades.`);
      }
    });
  }

  /**
   * This function is used for showing infoOverlays for changes,
   * normalisations and abbreviations, and also comments if they
   * are present inline in the text.
   */
  private showInfoOverlayFromInlineHtml(targetElem: HTMLElement) {
    if (targetElem.nextElementSibling?.classList.contains('tooltip')) {
      let text = '';
      let lemma = '';

      if (targetElem.nextElementSibling.classList.contains('ttChanges')) {
        // Change.
        this.setInfoOverlayTitle($localize`:@@editorialChange:Utgivarändring`);
        if (targetElem.classList.contains('corr_red')) {
          lemma = targetElem.innerHTML;
        } else if (targetElem.firstElementChild?.classList.contains('corr_hide')) {
          lemma = '<span class="corr_hide">' + targetElem.firstElementChild.innerHTML + '</span>';
        } else if (targetElem.firstElementChild?.classList.contains('corr')) {
          lemma = targetElem.firstElementChild.innerHTML;
        }
        text = '<p class="infoOverlayText"><span class="ioLemma">'
          + lemma + '</span><span class="ioDescription">'
          + targetElem.nextElementSibling.innerHTML + '</span></p>';
      } else if (targetElem.nextElementSibling.classList.contains('ttNormalisations')) {
        // Normalisation.
        this.setInfoOverlayTitle($localize`:@@editorialNormalisation:Normalisering`);
        if (targetElem.classList.contains('reg_hide')) {
          lemma = '<span class="reg_hide">' + targetElem.innerHTML + '</span>';
        } else {
          lemma = targetElem.innerHTML;
        }
        text = '<p class="infoOverlayText"><span class="ioLemma">'
          + lemma + '</span><span class="ioDescription">'
          + targetElem.nextElementSibling.innerHTML + '</span></p>';
      } else if (targetElem.nextElementSibling.classList.contains('ttAbbreviations')) {
        // Abbreviation.
        this.setInfoOverlayTitle($localize`:@@abbreviation:Förkortning`);
        if (targetElem.firstElementChild?.classList.contains('abbr')) {
          text = '<p class="infoOverlayText"><span class="ioLemma">'
            + targetElem.firstElementChild.innerHTML
            + '</span><span class="ioDescription">'
            + targetElem.nextElementSibling.innerHTML + '</span></p>';
        }
      } else if (targetElem.nextElementSibling.classList.contains('ttComment')) {
        // Comment.
        this.setInfoOverlayTitle($localize`:@@comments:Kommentarer`);
        if (targetElem.nextElementSibling?.classList.contains('noteText')) {
          text = '<p class="infoOverlayText"><span class="ioDescription">'
            + targetElem.nextElementSibling.innerHTML + '</span></p>';
        }
      } else if (
        targetElem.classList.contains('ttFoot') &&
        targetElem.nextElementSibling?.classList.contains('ttFoot')
      ) {
        // Some other note coded as a footnote (but lacking id and data-id attributes).
        if (targetElem.nextElementSibling.firstElementChild?.classList.contains('ttFixed')) {
          if (targetElem.classList.contains('revision')) {
            this.setInfoOverlayTitle($localize`:@@revisionNote:Repetitionsanteckning`);
            lemma = '';
          } else {
            this.setInfoOverlayTitle('');
            lemma = '<span class="ioLemma">' + targetElem.innerHTML + '</span>';
          }
          text = '<p class="infoOverlayText">'
            + lemma + '<span class="ioDescription">'
            + targetElem.nextElementSibling.firstElementChild.innerHTML + '</span></p>';
        }
      } else {
        // Some other note, generally editorial remarks pertaining to a manuscript.
        if (targetElem.classList.contains('ttMs')) {
          this.setInfoOverlayTitle($localize`:@@criticalNote:Utgivarens anmärkning`);
        } else {
          this.setInfoOverlayTitle('');
        }
        lemma = targetElem.textContent || '';
        if (
          targetElem.classList.contains('deletion') || (
            targetElem.parentElement !== null &&
            targetElem.classList.contains('tei_deletion_medium_wrapper')
          )
        ) {
          lemma = '<span class="deletion">' + lemma + '</span>';
        }
        text = '<p class="infoOverlayText"><span class="ioLemma">'
          + lemma + '</span><span class="ioDescription">'
          + targetElem.nextElementSibling.innerHTML + '</span></p>';
      }
      this.setInfoOverlayPositionAndWidth(targetElem);
      this.setInfoOverlayText(text);
    }
  }

  private setToolTipText(text: string) {
    this.toolTipText = this.sanitizer.bypassSecurityTrustHtml(text);
  }

  private setInfoOverlayText(text: string) {
    this.infoOverlayText = this.sanitizer.bypassSecurityTrustHtml(text);
  }

  private setInfoOverlayTitle(title: string) {
    this.infoOverlayTitle = String(title);
  }

  private hideToolTip() {
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
    this.infoOverlayPosType = 'fixed'; // Position needs to be fixed so we can safely hide it outside viewport
    this.infoOverlayPosition = {
      bottom: 0 + 'px',
      left: -1500 + 'px'
    };
  }

  private setToolTipPosition(targetElem: HTMLElement, ttText: string) {
    const ttProperties = this.tooltipService.getTooltipProperties(targetElem, ttText, 'page-text');

    if (ttProperties !== undefined && ttProperties !== null) {
      // Set tooltip width, position and visibility
      this.toolTipMaxWidth = ttProperties.maxWidth;
      this.toolTipScaleValue = ttProperties.scaleValue;
      this.toolTipPosition = {
        top: ttProperties.top,
        left: ttProperties.left
      };
      this.toolTipPosType = 'absolute';
      if (this.mobileMode) {
        this.toolTipPosType = 'fixed';
      }
      this.tooltipVisible = true;
    }
  }

  /**
   * Set position and width of infoOverlay element. This function is not exactly
   * the same as in introduction.ts due to different page structure on text page.
   */
  private setInfoOverlayPositionAndWidth(triggerElement: HTMLElement, defaultMargins = 20, maxWidth = 600) {
    let margins = defaultMargins;

    // Get viewport height and width.
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    // Get text page content element and adjust viewport height with horizontal
    // scrollbar height if such is present. Also get how much the text page has
    // scrolled horizontally to the left.
    let scrollLeft = 0;
    let horizontalScrollbarOffsetHeight = 0;
    const contentElem = this.elementRef.nativeElement.querySelector(
      'ion-content.collection-ion-content'
    )?.shadowRoot?.querySelector('[part="scroll"]') as HTMLElement;
    if (contentElem) {
      scrollLeft = contentElem.scrollLeft;
      if (contentElem.clientHeight < contentElem.offsetHeight) {
        horizontalScrollbarOffsetHeight = contentElem.offsetHeight - contentElem.clientHeight;
      }
    }

    // Get bounding rectangle of the div.scroll-content-container element which is the
    // container for the column that the trigger element resides in.
    let containerElem = triggerElement.parentElement;
    while (
      containerElem?.parentElement &&
      !containerElem.classList.contains('scroll-content-container')
    ) {
      containerElem = containerElem.parentElement;
    }

    if (containerElem?.parentElement) {
      const containerElemRect = containerElem.getBoundingClientRect();
      let calcWidth = containerElem.clientWidth; // Width without scrollbar

      if (this.mobileMode && vw > 800) {
        // Adjust width in mobile view when viewport size over 800 px
        // since padding changes through CSS then.
        margins = margins + 16;
      }

      if (calcWidth > maxWidth + 2 * margins) {
        margins = Math.floor((calcWidth - maxWidth) / 2);
        calcWidth = maxWidth;
      } else {
        calcWidth = calcWidth - 2 * margins;
      }

      // Set info overlay position
      this.infoOverlayPosition = {
        bottom: (vh - horizontalScrollbarOffsetHeight - containerElemRect.bottom) + 'px',
        left: (containerElemRect.left + scrollLeft + margins - contentElem.getBoundingClientRect().left) + 'px'
      };
      if (this.mobileMode) {
        this.infoOverlayPosType = 'fixed';
      } else {
        this.infoOverlayPosType = 'absolute';
      }

      // Set info overlay width
      this.infoOverlayWidth = calcWidth + 'px';
    }
  }

  private async showSemanticDataObjectModal(id: string, type: string) {
    const modal = await this.modalCtrl.create({
      component: SemanticDataObjectModal,
      componentProps: { id: id, type: type }
    });

    modal.present();
  }

  async showViewOptionsPopover(event: any) {
    const popover = await this.popoverCtrl.create({
      component: ViewOptionsPopover,
      cssClass: 'view-options-popover',
      reference: 'trigger',
      side: 'bottom',
      alignment: 'end'
    });

    popover.present(event);
  }

  async showReference() {
    // Get URL of Page and then the URI
    const modal = await this.modalCtrl.create({
      component: ReferenceDataModal,
      componentProps: { origin: 'page-text' }
    });

    modal.present();
  }

  async showDownloadModal() {
    const modal = await this.modalCtrl.create({
      component: DownloadTextsModal,
      componentProps: { origin: 'page-text', textItemID: this.textItemID }
    });

    modal.present();
  }

  private getViewTypesShown(): string[] {
    const viewTypes: string[] = [];
    this.views.forEach((view: any) => {
      viewTypes.push(view.type);
    });
    return viewTypes;
  }

  private viewTypeIsShown(type: string, views?: any[]): boolean {
    views = views ? views : this.views;
    for (let i = 0; i < views.length; i++) {
      if (views[i].type === type) {
        return true;
      }
    }
    return false;
  }

  openNewView(event: any) {
    if (event.viewType === 'facsimiles') {
      this.addView(event.viewType, event.id);
    } else if (event.viewType === 'manuscriptFacsimile') {
      this.addView('facsimiles', event.id);
    } else if (event.viewType === 'facsimileManuscript') {
      this.addView('manuscripts', event.id);
    } else if (event.viewType === 'illustrations') {
      this.addView(event.viewType, event.id, event);
    } else {
      this.addView(event.viewType, event.id);
    }
  }

  showAllViewTypes() {
    this.enabledViewTypes.forEach((type: any) => {
      const viewTypesShown = this.getViewTypesShown();
      if (
        type !== 'showAll' &&
        viewTypesShown.indexOf(type) < 0
      ) {
        this.addView(type);
      }
    });
  }

  addView(type: string, id?: number | null, image?: any) {
    if (type === 'showAll') {
      this.showAllViewTypes();
      return;
    }

    if (this.enabledViewTypes.indexOf(type) !== -1) {
      const newView = { type: type } as any;

      if (id != null) {
        newView['id'] = id;
      }
      if (image != null) {
        newView['image'] = image;
      }

      // Append the new view to the array of current views and navigate
      this.views.push(newView);
      this.updateViewsInRouterQueryParams(this.views);
    }
  }

  removeView(i: any) {
    this.views.splice(i, 1);
    this.updateViewsInRouterQueryParams(this.views);
  }

  /**
   * Moves the view with index id one step to the right, i.e. exchange
   * positions with the view on the right.
   */
  moveViewRight(id: number) {
    if (id > -1 && id < this.views.length - 1) {
      this.views = this.moveArrayItem(this.views, id, id + 1);
      this.fabColumnOptions.forEach(fabList => {
        fabList.activated = false;
      });

      this.fabColumnOptionsButton.forEach(fabButton => {
        fabButton.activated = false;
      });

      this.updateViewsInRouterQueryParams(this.views);
    }
  }

  /**
   * Moves the view with index id one step to the left, i.e. exchange
   * positions with the view on the left.
   */
  moveViewLeft(id: number) {
    if (id > 0 && id < this.views.length) {
      this.views = this.moveArrayItem(this.views, id, id - 1);
      this.fabColumnOptions.forEach(fabList => {
        fabList.activated = false;
      });

      this.fabColumnOptionsButton.forEach(fabButton => {
        fabButton.activated = false;
      });

      this.updateViewsInRouterQueryParams(this.views);
    }
  }

  /**
   * Reorders the given array by moving the item at position 'fromIndex'
   * to the position 'toIndex'. Returns the reordered array.
   */
  private moveArrayItem(array: any[], fromIndex: number, toIndex: number) {
    const reorderedArray = array;
    if (
      fromIndex > -1 &&
      toIndex > -1 &&
      fromIndex < array.length &&
      toIndex < array.length &&
      fromIndex !== toIndex
    ) {
      reorderedArray.splice(toIndex, 0, reorderedArray.splice(fromIndex, 1)[0]);
    }
    return reorderedArray;
  }

  updateIllustrationViewImage(image: any) {
    for (let i = 0; i < this.views.length; i++) {
      if (this.views[i].type === 'illustrations') {
        this.updateViewProperty('image', image, i);
        break;
      }
    }
  }

  updateViewProperty(propertyName: string, value: any, viewIndex: number, updateQueryParams: boolean = true) {
    if (value !== null) {
      this.views[viewIndex][propertyName] = value;
    } else if (this.views[viewIndex].hasOwnProperty(propertyName)) {
      delete this.views[viewIndex][propertyName];
    }
    updateQueryParams && this.updateViewsInRouterQueryParams(this.views);
  }

  private updateViewsInRouterQueryParams(views: Array<any>, typesOnly: boolean = false) {
    this.illustrationsViewShown = this.viewTypeIsShown('illustrations', views);

    let trimmedViews: any[] = [];
    if (typesOnly) {
      views.forEach((viewObj: any) => {
        if (viewObj.type) {
          trimmedViews.push({ type: viewObj.type });
        }
      });
    } else {
      // Remove 'title' property from all view objects as it's not desired in the url
      trimmedViews = views.map(({title, ...rest}) => rest);
    }
    
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { views: this.urlService.stringify(trimmedViews, true) },
        queryParamsHandling: 'merge',
        replaceUrl: true
      }
    );
  }

  private scrollToVariant(element: HTMLElement) {
    this.hideToolTip();
    try {
      if (element['classList'].contains('variantScrollTarget')) {
        const variantContElems: NodeListOf<HTMLElement> = this.elementRef.nativeElement.querySelectorAll(
          'variants'
        );
        for (let v = 0; v < variantContElems.length; v++) {
          const elems: NodeListOf<HTMLElement> = variantContElems[v].querySelectorAll(
            '.teiVariant'
          );
          let variantNotScrolled = true;
          for (let i = 0; i < elems.length; i++) {
            if (elems[i].id === element.id) {
              if (!elems[i].classList.contains('highlight')) {
                elems[i].classList.add('highlight');
              }
              if (variantNotScrolled) {
                variantNotScrolled = false;
                this.scrollService.scrollElementIntoView(elems[i]);
              }
              setTimeout(function () {
                elems[i]?.classList.remove('highlight');
              }, 5000);
            }
          }
        }
      } else if (element['classList'].contains('anchorScrollTarget')) {
        const elems: NodeListOf<HTMLElement> = this.elementRef.nativeElement.querySelectorAll(
          '.teiVariant.anchorScrollTarget'
        );
        const elementClassList = element.className.split(' ');
        let targetClassName = '';
        let targetCompClassName = '';
        for (let x = 0; x < elementClassList.length; x++) {
          if (elementClassList[x].startsWith('struct')) {
            targetClassName = elementClassList[x];
            break;
          }
        }
        if (targetClassName.endsWith('a')) {
          targetCompClassName = targetClassName.substring(0, targetClassName.length - 1) + 'b';
        } else {
          targetCompClassName = targetClassName.substring(0, targetClassName.length - 1) + 'a';
        }
        let iClassList = [];
        for (let i = 0; i < elems.length; i++) {
          iClassList = elems[i].className.split(' ');
          for (let y = 0; y < iClassList.length; y++) {
            if (iClassList[y] === targetClassName || iClassList[y] === targetCompClassName) {
              elems[i].classList.add('highlight');
              setTimeout(function () {
                elems[i]?.classList.remove('highlight');
              }, 5000);
              if (iClassList[y] === targetClassName) {
                this.scrollService.scrollElementIntoView(elems[i]);
              }
            }
          }
        }
      }
    } catch (e) {
    }
  }

  private setCollectionAndPublicationLegacyId(publicationID: string) {
    this.collectionsService.getLegacyIdByPublicationId(publicationID).subscribe({
      next: (publication) => {
        this.collectionAndPublicationLegacyId = '';
        if (publication[0].legacy_id) {
          this.collectionAndPublicationLegacyId = publication[0].legacy_id;
        }
      },
      error: (e) => {
        this.collectionAndPublicationLegacyId = '';
        console.error('Error: could not get publication data trying to resolve collection and publication legacy id', e);
      }
    });
  }

  showAddViewPopover(e: Event) {
    this.addViewPopover.event = e;
    this.addViewPopoverisOpen = true;
  }

  storeActiveMobileModeViewType() {
    this.collectionContentService.activeCollectionTextMobileModeView = this.activeMobileModeViewType;
  }

}
