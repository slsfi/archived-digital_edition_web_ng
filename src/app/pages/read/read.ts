import { Component, Renderer2, ElementRef, ViewChild, ViewChildren, QueryList, SecurityContext, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonFabButton, IonFabList, IonPopover, ModalController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { DownloadTextsModalPage } from 'src/app/modals/download-texts-modal/download-texts-modal';
import { OccurrencesPage } from 'src/app/modals/occurrences/occurrences';
import { ReadPopoverPage } from 'src/app/modals/read-popover/read-popover';
import { SearchAppPage } from 'src/app/modals/search-app/search-app';
import { OccurrenceResult } from 'src/app/models/occurrence.model';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { CommentService } from 'src/app/services/comments/comment.service';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { EventsService } from 'src/app/services/events/events.service';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { TextService } from 'src/app/services/texts/text.service';
import { TableOfContentsService } from 'src/app/services/toc/table-of-contents.service';
import { TooltipService } from 'src/app/services/tooltips/tooltip.service';
import { config } from "src/app/services/config/config";
import { DragScrollComponent } from 'src/directives/ngx-drag-scroll/public-api';
import { isBrowser } from 'src/standalone/utility-functions';

@Component({
  selector: 'page-read',
  templateUrl: './read.html',
  styleUrls: ['read.scss'],
})
export class ReadPage /*implements OnDestroy*/ {
  @ViewChild('nav', { read: DragScrollComponent }) ds!: DragScrollComponent;
  @ViewChild('addViewPopover') addViewPopover: IonPopover;
  @ViewChildren('fabColumnOptions') fabColumnOptions: QueryList<IonFabList>;
  @ViewChildren('fabColumnOptionsButton') fabColumnOptionsButton: QueryList<IonFabButton>;

  multilingualEST: false;
  estLanguages = [];
  estLang: 'none';
  popover?: ReadPopoverPage;
  hasOccurrenceResults = false;
  showOccurrencesModal = false;
  searchResult: string | null;
  toolTipsSettings?: Record<string, any> = {};
  toolTipPosType: string;
  toolTipPosition: any;
  toolTipMaxWidth: string | null;
  toolTipScaleValue: number | null;
  toolTipText: string = '';
  tooltipVisible: Boolean = false;
  infoOverlayPosType: string;
  infoOverlayPosition: any;
  infoOverlayWidth: string | null;
  infoOverlayText: string;
  infoOverlayTitle: string;
  intervalTimerId: number;
  userIsTouching: Boolean = false;
  collectionAndPublicationLegacyId?: string;
  illustrationsViewShown: Boolean = false;
  simpleWorkMetadata?: Boolean;
  showURNButton: Boolean;
  showViewOptionsButton: Boolean = true;
  showTextDownloadButton: Boolean = false;
  usePrintNotDownloadIcon: Boolean = false;

  addViewPopoverisOpen: boolean = false;

  private unlistenFirstTouchStartEvent?: () => void;
  private unlistenClickEvents?: () => void;
  private unlistenMouseoverEvents?: () => void;
  private unlistenMouseoutEvents?: () => void;

  // Used for infinite facsimile
  facs_id: any;
  facs_nr: any;
  song_id: any;
  search_title: any;

  searchMatches: Array<string> = [];

  displayToggles: any;

  occurrenceResult?: OccurrenceResult;


  views = [] as any;

  show = 'established'; // Mobile tabs

  availableViewModes: Array<string> = [];

  tooltips = {
    'persons': {} as any,
    'comments': {} as any,
    'works': {} as any,
    'places': {} as any,
    'abbreviations': {} as any,
    'footnotes': {} as any
  };

  paramCollectionID: any;
  paramPublicationID: any;
  paramChapterID: any;
  queryParamObjectType: any


  // TODO OLLIN UUDET
  public views$: Observable<any>;
  public textItemID$: Observable<string>;

  textItemID: string = '';
  textPosition: string = '';

  routeQueryParamsSubscription: Subscription | null;
  routeParamsSubscription: Subscription | null;

  // TODO paramX$ tyyli

  constructor(
    private textService: TextService,
    private commentService: CommentService,
    private renderer2: Renderer2,
    private ngZone: NgZone,
    private elementRef: ElementRef,
    public popoverCtrl: PopoverController,
    public readPopoverService: ReadPopoverService,
    public modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private tooltipService: TooltipService,
    public tocService: TableOfContentsService,
    public translate: TranslateService,
    private events: EventsService,
    public semanticDataService: SemanticDataService,
    public userSettingsService: UserSettingsService,
    private analyticsService: AnalyticsService,
    public commonFunctions: CommonFunctionsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.searchResult = null;

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
    this.intervalTimerId = 0;
    try {
      const i18n = config.i18n ?? undefined;

      if (i18n.multilingualEST !== undefined) {
        this.multilingualEST = i18n.multilingualEST;
      } else {
        this.multilingualEST = false;
      }
      if (i18n.estLanguages !== undefined) {
        this.estLanguages = i18n.estLanguages;
        this.estLang = i18n.estLanguages[0];
      } else {
        this.estLanguages = [];
        this.estLang = 'none';
      }
    } catch (e) {
      this.multilingualEST = false;
      this.estLanguages = [];
      this.estLang = 'none';
      console.error(e);
    }

    this.showURNButton = config.page?.read?.showURNButton ?? true;
    this.showViewOptionsButton = config.page?.read?.showViewOptionsButton ?? true;

    try {
      const textDownloadOptions = config.textDownloadOptions ?? undefined;
      if (
        textDownloadOptions !== undefined &&
        textDownloadOptions.enabledEstablishedFormats !== undefined &&
        textDownloadOptions.enabledEstablishedFormats !== null &&
        Object.keys(textDownloadOptions.enabledEstablishedFormats).length !== 0
      ) {
        for (const [key, value] of Object.entries(textDownloadOptions.enabledEstablishedFormats)) {
          if (value) {
            this.showTextDownloadButton = true;
            break;
          }
        }
      }
      if (!this.showTextDownloadButton) {
        if (
          textDownloadOptions.enabledCommentsFormats !== undefined &&
          textDownloadOptions.enabledCommentsFormats !== null &&
          Object.keys(textDownloadOptions.enabledCommentsFormats).length !== 0
        ) {
          for (const [key, value] of Object.entries(textDownloadOptions.enabledCommentsFormats)) {
            if (value) {
              this.showTextDownloadButton = true;
              break;
            }
          }
        }
      }
      if (textDownloadOptions.usePrintNotDownloadIcon !== undefined) {
        this.usePrintNotDownloadIcon = textDownloadOptions.usePrintNotDownloadIcon;
      }
    } catch (e) {
      this.showTextDownloadButton = false;
    }

    // Hide some or all of the display toggles (variations, facsimiles, established etc.)
    this.displayToggles = config.settings?.displayTypesToggles ?? [];
    for (const toggle in this.displayToggles) {
      if (this.displayToggles[toggle as keyof typeof this.displayToggles]) {
        this.availableViewModes.push(toggle);
      }
    }

    this.toolTipsSettings = config.settings?.toolTips ?? undefined;
    this.show = config.defaults?.ReadModeView ?? 'established';

    this.routeParamsSubscription = null;
    this.routeQueryParamsSubscription = null;
  }

  ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe({
      next: (params) => {
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
          // TODO: This is maybe not needed any more:
          this.textService.previousReadViewTextId = this.textService.readViewTextId;
          this.textService.readViewTextId = this.textItemID;
        }

        this.paramCollectionID = params['collectionID'];
        this.paramPublicationID = params['publicationID'];

        this.setCollectionAndPublicationLegacyId();
      },
      error: (e) => {},
      complete: () => {}
    });

    this.routeQueryParamsSubscription = this.route.queryParams.subscribe({
      next: (queryParams) => {

        if (queryParams['search']) {
          // console.log('search in queryparams:', queryParams['search']);
          let searchMatches: Array<string> = [];
          const parsedSearchMatches = JSON.parse(queryParams['search']);
          if (parsedSearchMatches.length > 0) {
            parsedSearchMatches.forEach((search_match: any) => {
              // Remove line break characters
              let decoded_match = search_match.replace(/\n/gm, '');
              // Remove any script tags
              decoded_match = decoded_match.replace(/<script.+?<\/script>/gi, '');
              decoded_match = this.commonFunctions.encodeCharEntities(decoded_match);
              searchMatches.push(decoded_match);
            });
            this.searchMatches = searchMatches;
          } else {
            this.searchMatches = [];
          }
        }

        if (queryParams['views']) {
          // console.log('views in queryparams:', queryParams['views']);
          const parsedViews = JSON.parse(queryParams['views']);

          let viewsChanged = false;
          if (this.views.length !== parsedViews.length) {
            viewsChanged = true;
          } else {
            for (let i = 0; i < this.views.length; i++) {
              if (JSON.stringify(this.views[i]) !== JSON.stringify(parsedViews[i])) {
                viewsChanged = true;
                break;
              }
            }
          }

          if (this.views.length < 1 || viewsChanged) {
            this.views = parsedViews;
          }

          // Clear the array keeping track of recently open views in
          // text service and populate it with the current ones.
          this.textService.recentPageReadViews = [];
          parsedViews.forEach((viewObj: any) => {
            this.textService.recentPageReadViews.push({ type: viewObj.type });
          });
        } else {
          this.setDefaultViews();
        }

        if (queryParams['position'] || (this.textPosition && queryParams['position'] === undefined)) {
          // console.log('position in queryparams:', queryParams['position']);
          this.textPosition = queryParams['position'];
        }

        // TODO: Not sure facs_id and facs_nr are needed, or if they should be passed in the view object for facsimiles instead
        if (queryParams['facs_id']) {
          // console.log('facs_id in queryparams:', queryParams['facs_id']);
          this.facs_id = queryParams['facs_id'];
        }

        if (queryParams['facs_nr']) {
          // console.log('facs_nr in queryparams:', queryParams['facs_nr']);
          this.facs_nr = queryParams['facs_nr'];
        }

      },
      error: (e) => {},
      complete: () => {}
    });

    if (isBrowser()) {
      this.setUpTextListeners();
    }
  }

  ionViewDidEnter() {
    this.analyticsService.doPageView('Read');
  }

  ngOnDestroy() {
    if (this.routeQueryParamsSubscription) {
      this.routeQueryParamsSubscription.unsubscribe();
    }
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
    this.unlistenClickEvents?.();
    this.unlistenMouseoverEvents?.();
    this.unlistenMouseoutEvents?.();
    this.unlistenFirstTouchStartEvent?.();
  }

  async openOccurrenceResult() {
    let showOccurrencesModalOnRead = false;
    let objectType = '';

    if (this.showOccurrencesModal) {
      showOccurrencesModalOnRead = true;
    }

    if (this.queryParamObjectType) {
      objectType = this.queryParamObjectType;
    }

    if (this.hasOccurrenceResults && this.occurrenceResult) {
      const occurrenceModal = await this.modalCtrl.create({
        component: OccurrencesPage,
        componentProps: {
          occurrenceResult: this.occurrenceResult,
          showOccurrencesModalOnRead: showOccurrencesModalOnRead,
          objectType: objectType
        }
      });

      return await occurrenceModal.present();
    }
  }

  showAllViews() {
    this.availableViewModes.forEach((viewmode: any) => {
      const viewTypesShown = this.getViewTypesShown();
      if (
        viewmode !== 'showAll' &&
        this.viewModeShouldBeShown(viewmode) &&
        viewTypesShown.indexOf(viewmode) === -1
      ) {
        this.show = viewmode;
        this.addView(viewmode);
      }
    });
  }

  viewModeShouldBeShown(viewmode: any) {
    if (viewmode.startsWith('established') && !this.displayToggles[viewmode]) {
      return false;
    } else if (viewmode === 'comments' && !this.displayToggles['comments']) {
      return false;
    } else if (viewmode === 'facsimiles' && !this.displayToggles['facsimiles']) {
      return false;
    } else if (viewmode === 'manuscripts' && !this.displayToggles['manuscripts']) {
      return false;
    } else if (viewmode === 'variations' && !this.displayToggles['variations']) {
      return false;
    } else if (viewmode === 'illustrations' && !this.displayToggles['illustrations']) {
      return false;
    } else if (viewmode === 'legend' && !this.displayToggles['legend']) {
      return false;
    }

    return true;
  }

  setDefaultViews() {
    // There are no views defined in the url params => open either recent or default views
    if (this.textService.recentPageReadViews.length > 0) {
      this.updateViewsInRouterQueryParams(this.textService.recentPageReadViews);
    } else {
      this.setConfigDefaultReadModeViews();
    }
  }

  /**
   * Supports also multiple default read-modes.
   * If there are multiple it loops through every read-mode (array of strings).
   * If it's not an array it just sets the string value it gets from config.json.
   * And if no config for this was set at all it sets established as the default.
   */
  setConfigDefaultReadModeViews() {
    const defaultReadModes: any = config.defaults?.ReadModeView ?? ['established'];
    let newViews: Array<any> = [];
    let defaultReadModeForMobileSelected = false;

    defaultReadModes.forEach((val: any) => {
      // TODO: Fix setting default view for mobile
      if (!defaultReadModeForMobileSelected && this.displayToggles[val]) {
        /* Sets the default view on mobile to the first default read mode view which is available. */
        this.show = val;
        defaultReadModeForMobileSelected = true;
      }

      if (this.availableViewModes.indexOf(val) !== -1) {
        const view = { type: val } as any;
        newViews.push(view);
      }
    });

    this.updateViewsInRouterQueryParams(newViews);
  }

  viewsExistInAvailableViewModes(viewmodes: any) {
    const that = this;
    viewmodes.forEach(function (viewmode: any) {
      if ( that.availableViewModes.indexOf(viewmode) === -1 ) {
        return false;
      }
      return viewmode;
    }.bind(this));

    return true;
  }

  getViewTypesShown() {
    const viewModes = [] as any;

    this.views.forEach(function (view: any) {
      viewModes.push(view.type);
    }.bind(this));

    return viewModes;
  }

  private getEventTarget(event: any) {
    let eventTarget: HTMLElement = document.createElement('div');

    if (event.target.hasAttribute('data-id')) {
      return event.target;
    }
    try {
      if (event.target !== undefined && event.target !== null) {
        if (event.target['classList'] !== undefined && event.target['classList'].contains('tooltiptrigger')) {
          eventTarget = event.target;
        } else if (event['target']['parentNode'] !== undefined && event['target']['parentNode'] !== null
        && event['target']['parentNode']['classList'] !== undefined
        && event['target']['parentNode']['classList'].contains('tooltiptrigger')) {
          eventTarget = event['target']['parentNode'];
        } else if (event['target']['parentNode']['parentNode'] !== undefined && event['target']['parentNode']['parentNode'] !== null
        && event['target']['parentNode']['classList'] !== undefined
        && event['target']['parentNode']['parentNode']['classList'].contains('tooltiptrigger')) {
          eventTarget = event['target']['parentNode']['parentNode'];
        } else if (event['target']['classList'] !== undefined && event['target']['classList'].contains('anchor')) {
          eventTarget = event.target;
        } else if (event['target']['classList'] !== undefined && event['target']['classList'].contains('variantScrollTarget')) {
          eventTarget = event.target;
        } else if (event['target']['parentNode'] !== undefined && event['target']['parentNode'] !== null
        && event['target']['parentNode']['classList'] !== undefined
        && event['target']['parentNode']['classList'].contains('variantScrollTarget')) {
          eventTarget = event['target']['parentNode'];
        } else if (event['target']['parentNode']['parentNode'] !== undefined && event['target']['parentNode']['parentNode'] !== null
        && event['target']['parentNode']['parentNode']['classList'] !== undefined
        && event['target']['parentNode']['parentNode']['classList'].contains('variantScrollTarget')) {
          eventTarget = event['target']['parentNode']['parentNode'];
        } else if (event['target']['classList'] !== undefined && event['target']['classList'].contains('anchorScrollTarget')) {
          eventTarget = event.target;
        } else if (event['target']['parentNode'] !== undefined && event['target']['parentNode'] !== null
        && event['target']['parentNode']['classList'] !== undefined
        && event['target']['parentNode']['classList'].contains('anchorScrollTarget')) {
          eventTarget = event['target']['parentNode'];
        } else if (event['target']['classList'] !== undefined && event['target']['classList'].contains('extVariantsTrigger')) {
          eventTarget = event.target;
        } else if (event['target']['parentNode'] !== undefined && event['target']['parentNode'] !== null
        && event['target']['parentNode']['classList'] !== undefined
        && event['target']['parentNode']['classList'].contains('extVariantsTrigger')) {
          eventTarget = event['target']['parentNode'];
        }
      }
    } catch (e) {
      console.log('Error resolving event target in getEventTarget() in read.ts');
      console.error(e);
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
            if (eventTarget['classList'].contains('person')
            && this.readPopoverService.show.personInfo) {
              this.ngZone.run(() => {
                this.showPersonModal(eventTarget.getAttribute('data-id'));
              });
              modalShown = true;
            } else if (eventTarget['classList'].contains('placeName')
            && this.readPopoverService.show.placeInfo) {
              this.ngZone.run(() => {
                this.showPlaceModal(eventTarget.getAttribute('data-id'));
              });
              modalShown = true;
            } else if (eventTarget['classList'].contains('title')
            && this.readPopoverService.show.workInfo) {
              this.ngZone.run(() => {
                this.showWorkModal(eventTarget.getAttribute('data-id'));
              });
              modalShown = true;
            } else if (eventTarget['classList'].contains('comment')
            && this.readPopoverService.show.comments) {
              /* The user has clicked a comment lemma ("asterisk") in the reading-text.
                Check if comments view is shown. */
              const viewTypesShown = this.getViewTypesShown();
              const commentsViewIsShown = viewTypesShown.includes('comments');
              if (commentsViewIsShown && this.userSettingsService.isDesktop()) {
                // Scroll to comment in comments view and scroll lemma in reading-text view.
                const numId = eventTarget.getAttribute('data-id').replace( /^\D+/g, '');
                const targetId = 'start' + numId;
                let lemmaStart = document.querySelector('page-read:not([ion-page-hidden]):not(.ion-page-hidden) read-text') as HTMLElement;
                lemmaStart = lemmaStart.querySelector('[data-id="' + targetId + '"]') as HTMLElement;
                if (lemmaStart.parentElement !== null && lemmaStart.parentElement.classList.contains('ttFixed')) {
                  // The lemma is in a footnote, so we should get the second element with targetId.
                  lemmaStart = document.querySelector('page-read:not([ion-page-hidden]):not(.ion-page-hidden) read-text') as HTMLElement;
                  lemmaStart = lemmaStart.querySelectorAll('[data-id="' + targetId + '"]')[1] as HTMLElement;
                }
                if (lemmaStart !== null && lemmaStart !== undefined) {
                  // Scroll to start of lemma in reading text and temporarily prepend arrow.
                  this.commentService.scrollToCommentLemma(lemmaStart);
                  // Scroll to comment in the comments-column.
                  this.commentService.scrollToComment(numId);
                }
              } else {
                // If a comments view isn't shown or viewmode is mobile, show comment in infoOverlay.
                this.ngZone.run(() => {
                  this.showCommentInfoOverlay(eventTarget.getAttribute('data-id'), eventTarget);
                });
              }
              modalShown = true;
            } else if (eventTarget['classList'].contains('ttFoot') && eventTarget['classList'].contains('teiManuscript')) {
              // Footnote reference clicked in manuscript column
              this.ngZone.run(() => {
                this.showManuscriptFootnoteInfoOverlay(eventTarget.getAttribute('data-id'), eventTarget);
              });
              modalShown = true;
            } else if (eventTarget['classList'].contains('ttFoot')) {
              // Footnote reference clicked in reading text
              this.ngZone.run(() => {
                this.showFootnoteInfoOverlay(eventTarget.getAttribute('data-id'), eventTarget);
              });
              modalShown = true;
            }
          } else if ((eventTarget['classList'].contains('ttChanges')
          && this.readPopoverService.show.changes)
          || (eventTarget['classList'].contains('ttNormalisations')
          && this.readPopoverService.show.normalisations)
          || (eventTarget['classList'].contains('ttAbbreviations')
          && this.readPopoverService.show.abbreviations)) {
            this.ngZone.run(() => {
              this.showInfoOverlayFromInlineHtml(eventTarget);
            });
            modalShown = true;
          } else if (eventTarget['classList'].contains('ttMs')
          || eventTarget['classList'].contains('tooltipMs')) {
            if (eventTarget['classList'].contains('unclear') || eventTarget['classList'].contains('gap')) {
              /* Editorial note about unclear text, should be clickable only in
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
          } else if (eventTarget.hasAttribute('id')
          && eventTarget['classList'].contains('ttFoot')
          && eventTarget['classList'].contains('teiVariant')) {
            // Footnote reference clicked in variant.
            this.ngZone.run(() => {
              this.showVariantFootnoteInfoOverlay(eventTarget.getAttribute('id'), eventTarget);
            });
            modalShown = true;
          } else if (eventTarget['classList'].contains('ttFoot')
          && !eventTarget.hasAttribute('id')
          && !eventTarget.hasAttribute('data-id')) {
            this.ngZone.run(() => {
              this.showInfoOverlayFromInlineHtml(eventTarget);
            });
            modalShown = true;
          } else if (eventTarget['classList'].contains('ttComment')) {
            console.log('comment');
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
            if (!eventTarget['classList'].contains('tooltiptrigger')
            && eventTarget['parentNode']
            && eventTarget['parentNode']['classList'].contains('tooltiptrigger')) {
              /* The parent isn't a tooltiptrigger, but the parent of the parent
                 is, use it for the next iteration. */
              eventTarget = eventTarget['parentNode'];
            }
          }
        }

        eventTarget = this.getEventTarget(event);
        if (eventTarget['classList'].contains('variantScrollTarget') || eventTarget['classList'].contains('anchorScrollTarget')) {
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
          if (eventTarget.nextElementSibling !== null && eventTarget.nextElementSibling !== undefined) {
            if (eventTarget.nextElementSibling.classList.contains('extVariants')
            && !eventTarget.nextElementSibling.classList.contains('show-extVariants')) {
              eventTarget.nextElementSibling.classList.add('show-extVariants');
            } else if (eventTarget.nextElementSibling.classList.contains('extVariants')
            && eventTarget.nextElementSibling.classList.contains('show-extVariants')) {
              eventTarget.nextElementSibling.classList.remove('show-extVariants');
            }
          }
        }

        // Possibly click on link.
        eventTarget = event.target as HTMLElement;
        if (eventTarget !== null && !eventTarget.classList.contains('xreference')) {
          eventTarget = eventTarget.parentElement;
          if (eventTarget !== null) {
            if (!eventTarget.classList.contains('xreference')) {
              eventTarget = eventTarget.parentElement;
            }
          }
        }

        if (eventTarget !== null && eventTarget.classList.contains('xreference')) {
          event.preventDefault();
          const anchorElem: HTMLAnchorElement = eventTarget as HTMLAnchorElement;

          if (eventTarget.classList.contains('footnoteReference')) {
            // Link to (foot)note reference in the same text.
            let targetId = '';
            if (anchorElem.hasAttribute('href')) {
              targetId = anchorElem.getAttribute('href') || '';
            } else if (anchorElem.parentElement && anchorElem.parentElement.hasAttribute('href')) {
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
                containerElem = document.querySelector('page-read:not([ion-page-hidden]):not(.ion-page-hidden) #' + targetColumnId);
              } else {
                containerElem = anchorElem.parentElement;
                while (containerElem !== null && containerElem.parentElement !== null &&
                !(containerElem.classList.contains('scroll-content') &&
                containerElem.parentElement.tagName === 'ION-SCROLL')) {
                  containerElem = containerElem.parentElement;
                }
                if (containerElem?.parentElement === null) {
                  containerElem = null;
                }
                if (containerElem === null) {
                  // Check if a footnotereference link in infoOverlay. This method is used to find the container element if in mobile mode.
                  if (anchorElem.parentElement !== null
                  && anchorElem.parentElement.parentElement !== null
                  && anchorElem.parentElement.parentElement.hasAttribute('class')
                  && anchorElem.parentElement.parentElement.classList.contains('infoOverlayContent')) {
                    containerElem = document.querySelector('page-read:not([ion-page-hidden]):not(.ion-page-hidden) .mobile-mode-read-content > .scroll-content > ion-scroll > .scroll-content');
                  }
                }
              }

              if (containerElem !== null) {
                let dataIdSelector = '[data-id="' + String(targetId).replace('#', '') + '"]';
                if (anchorElem.classList.contains('teiVariant')) {
                  // Link to (foot)note reference in variant, uses id-attribute instead of data-id.
                  dataIdSelector = '[id="' + String(targetId).replace('#', '') + '"]';
                }
                const target = containerElem.querySelector(dataIdSelector) as HTMLElement;
                if (target !== null) {
                  this.commonFunctions.scrollToHTMLElement(target, 'top');
                }
              }
            }
          } else if (anchorElem.classList.contains('ref_variant')) {
            // Click on link to another variant text
            const sid = 'sid-' + anchorElem.href.split(';sid-')[1];
            const varTargets = Array.from(document.querySelectorAll('#' + sid));

            if (varTargets.length > 0) {
              this.commonFunctions.scrollElementIntoView(anchorElem);
              anchorElem.classList.add('highlight');
              window.setTimeout(function(elem: any) {
                elem.classList.remove('highlight');
              }.bind(null, anchorElem), 5000);

              varTargets.forEach((varTarget: any) => {
                this.commonFunctions.scrollElementIntoView(varTarget);
                if (varTarget.firstElementChild !== null
                  && varTarget.firstElementChild !== undefined) {
                  if (varTarget.firstElementChild.classList.contains('var_margin')) {
                    const marginElem = varTarget.firstElementChild;

                    // Highlight all children of the margin element that have the ref_variant class
                    const refVariants = Array.from(marginElem.querySelectorAll('.ref_variant'));
                    refVariants.forEach((refVariant: any) => {
                      refVariant.classList.add('highlight');
                      window.setTimeout(function(elem: any) {
                        elem.classList.remove('highlight');
                      }.bind(null, refVariant), 5000);
                    });

                    if (marginElem.firstElementChild !== null && marginElem.firstElementChild !== undefined
                      && marginElem.firstElementChild.classList.contains('extVariantsTrigger')) {
                        marginElem.firstElementChild.classList.add('highlight');
                        window.setTimeout(function(elem: any) {
                          elem.classList.remove('highlight');
                        }.bind(null, marginElem.firstElementChild), 5000);
                    }
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
            const hrefLink = anchorElem.href;
            const hrefTargetItems: Array<string> = decodeURIComponent(String(hrefLink).split('/').pop() || '').trim().split(' ');
            let publicationId = '';
            let textId = '';
            let chapterId = '';
            let positionId = '';

            if (anchorElem.classList.contains('ref_readingtext') || anchorElem.classList.contains('ref_comment')) {
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
              if (this.paramChapterID) {
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
                const matchingElements = document.querySelectorAll('page-read:not([ion-page-hidden]):not(.ion-page-hidden) [name="' + positionId + '"]');
                let targetElement = null;
                let refType = 'READ-TEXT';
                if (anchorElem.classList.contains('ref_comment')) {
                  refType = 'COMMENTS';
                }
                for (let i = 0; i < matchingElements.length; i++) {
                  let parentElem = matchingElements[i].parentElement;
                  while (parentElem !== null && parentElem.tagName !== refType) {
                    parentElem = parentElem.parentElement;
                  }
                  if (parentElem !== null && parentElem.tagName === refType) {
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
                if (targetElement !== null && targetElement.classList.contains('anchor')) {
                  this.commonFunctions.scrollToHTMLElement(targetElement);
                }
              } else {
                // We are not on the same page, open in new window.
                // (Safari on iOS doesn't allow window.open() inside async calls so
                // we have to open the new window first and set its location later.)
                const newWindowRef = window.open();

                this.textService.getCollectionAndPublicationByLegacyId(publicationId + '_' + textId).subscribe(data => {
                  if (data[0] !== undefined) {
                    publicationId = data[0]['coll_id'];
                    textId = data[0]['pub_id'];
                  }

                  let hrefString = '/publication/' + publicationId + '/text/' + textId;
                  if (chapterId) {
                    hrefString += '/' + chapterId;
                    if (hrefTargetItems.length > 3 && hrefTargetItems[3].startsWith('#')) {
                      positionId = hrefTargetItems[3].replace('#', ';');
                      hrefString += '?position=' + positionId;
                    }
                  } else if (hrefTargetItems.length > 2 && hrefTargetItems[2].startsWith('#')) {
                    positionId = hrefTargetItems[2].replace('#', ';');
                    hrefString += '?position=' + positionId;
                  }
                  if (newWindowRef) {
                    newWindowRef.location.href = hrefString;
                  }
                });
              }

            } else if (anchorElem.classList.contains('ref_introduction')) {
              // Link to introduction.
              publicationId = hrefTargetItems[0];

              this.textService.getCollectionAndPublicationByLegacyId(publicationId).subscribe(data => {
                if (data[0] !== undefined) {
                  publicationId = data[0]['coll_id'];
                }
                let hrefString = '/publication/' + publicationId + '/introduction';
                if (hrefTargetItems.length > 1 && hrefTargetItems[1].startsWith('#')) {
                  positionId = hrefTargetItems[1];
                  hrefString += '?position=' + positionId;
                }
                // Open the link in a new window/tab.
                window.open(hrefString, '_blank');
              });
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
              if (this.toolTipsSettings?.['personInfo']
              && eventTarget['classList'].contains('person')
              && this.readPopoverService.show.personInfo) {
                this.ngZone.run(() => {
                  this.showPersonTooltip(eventTarget.getAttribute('data-id'), eventTarget, event);
                });
              } else if (this.toolTipsSettings?.['placeInfo']
              && eventTarget['classList'].contains('placeName')
              && this.readPopoverService.show.placeInfo) {
                this.ngZone.run(() => {
                  this.showPlaceTooltip(eventTarget.getAttribute('data-id'), eventTarget, event);
                });
              } else if (this.toolTipsSettings?.['workInfo']
              && eventTarget['classList'].contains('title')
              && this.readPopoverService.show.workInfo) {
                this.ngZone.run(() => {
                  this.showWorkTooltip(eventTarget.getAttribute('data-id'), eventTarget, event);
                });
              } else if (this.toolTipsSettings?.['comments']
              && eventTarget['classList'].contains('comment')
              && this.readPopoverService.show.comments) {
                this.ngZone.run(() => {
                  this.showCommentTooltip(eventTarget.getAttribute('data-id'), eventTarget);
                });
              } else if (this.toolTipsSettings?.['footNotes']
              && eventTarget['classList'].contains('teiManuscript')
              && eventTarget['classList'].contains('ttFoot')) {
                this.ngZone.run(() => {
                  this.showManuscriptFootnoteTooltip(eventTarget.getAttribute('data-id'), eventTarget);
                });
              } else if (this.toolTipsSettings?.['footNotes']
              && eventTarget['classList'].contains('ttFoot')) {
                this.ngZone.run(() => {
                  this.showFootnoteTooltip(eventTarget.getAttribute('data-id'), eventTarget);
                });
              }
            } else if ( (this.toolTipsSettings && this.toolTipsSettings['changes'] && eventTarget['classList'].contains('ttChanges')
            && this.readPopoverService.show.changes)
            || (this.toolTipsSettings && this.toolTipsSettings['normalisations'] && eventTarget['classList'].contains('ttNormalisations')
            && this.readPopoverService.show.normalisations)
            || (this.toolTipsSettings && this.toolTipsSettings['abbreviations'] && eventTarget['classList'].contains('ttAbbreviations')
            && this.readPopoverService.show.abbreviations) ) {
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
              if (eventTarget['classList'].contains('unclear') || eventTarget['classList'].contains('gap')) {
                // Tooltips for text with class unclear or gap should be shown in other columns too.
                this.ngZone.run(() => {
                  this.showTooltipFromInlineHtml(eventTarget);
                });
              } else {
                let parentElem: HTMLElement | null = eventTarget as HTMLElement;
                parentElem = parentElem.parentElement;
                while (parentElem !== null && parentElem.tagName !== 'MANUSCRIPTS') {
                  parentElem = parentElem.parentElement;
                }
                if (parentElem !== null) {
                  this.ngZone.run(() => {
                    this.showTooltipFromInlineHtml(eventTarget);
                  });
                }
              }
            } else if (this.toolTipsSettings?.['footNotes'] && eventTarget.hasAttribute('id')
            && eventTarget['classList'].contains('teiVariant') && eventTarget['classList'].contains('ttFoot')) {
              this.ngZone.run(() => {
                this.showVariantFootnoteTooltip(eventTarget.getAttribute('id'), eventTarget);
              });
            } else if (eventTarget['classList'].contains('ttFoot')
            && !eventTarget.hasAttribute('id')
            && !eventTarget.hasAttribute('data-id')) {
              this.ngZone.run(() => {
                this.showTooltipFromInlineHtml(eventTarget);
              });
            } else if (eventTarget['classList'].contains('ttComment')
            && !eventTarget.hasAttribute('id')
            && !eventTarget.hasAttribute('data-id')) {
              this.ngZone.run(() => {
                this.showTooltipFromInlineHtml(eventTarget);
              });
            }

            /* Get the parent node of the event target for the next iteration if a tooltip hasn't been shown already.
            * This is for finding nested tooltiptriggers, i.e. a person can be a child of a change. */
            if (!this.tooltipVisible) {
              eventTarget = eventTarget['parentNode'];
              if (!eventTarget['classList'].contains('tooltiptrigger')
              && eventTarget['parentNode']['classList'].contains('tooltiptrigger')) {
                /* The parent isn't a tooltiptrigger, but the parent of the parent is, use it for the next iteration. */
                eventTarget = eventTarget['parentNode'];
              }
            }
          }

          /* Check if mouse over doodle image which has a parent tooltiptrigger */
          if (eventTarget.hasAttribute('data-id')
          && eventTarget['classList'].contains('doodle')
          && eventTarget['classList'].contains('unknown')) {
            if (eventTarget['parentNode'] !== undefined && eventTarget['parentNode'] !== null
            && eventTarget['parentNode']['classList'].contains('tooltiptrigger')) {
              eventTarget = eventTarget['parentNode'];
              this.ngZone.run(() => {
                this.showTooltipFromInlineHtml(eventTarget);
              });
            }
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

  showPersonTooltip(id: string, targetElem: HTMLElement, origin: any) {
    if (this.tooltips.persons[id]) {
      this.setToolTipPosition(targetElem, this.tooltips.persons[id]);
      this.setToolTipText(this.tooltips.persons[id]);
      return;
    }

    this.tooltipService.getPersonTooltip(id).subscribe(
      tooltip => {
        const text = this.tooltipService.constructPersonTooltipText(tooltip, targetElem);
        this.setToolTipPosition(targetElem, text);
        this.setToolTipText(text);
        this.tooltips.persons[id] = text;
      },
      error => {
        let noInfoFound = 'Could not get person information';
        this.translate.get('Occurrences.NoInfoFound').subscribe(
          translation => {
            noInfoFound = translation;
          }, err => { }
        );
        this.setToolTipPosition(targetElem, noInfoFound);
        this.setToolTipText(noInfoFound);
      }
    );
  }

  showPlaceTooltip(id: string, targetElem: HTMLElement, origin: any) {
    if (this.tooltips.places[id]) {
      this.setToolTipPosition(targetElem, this.tooltips.places[id]);
      this.setToolTipText(this.tooltips.places[id]);
      return;
    }

    this.tooltipService.getPlaceTooltip(id).subscribe(
      tooltip => {
        let text = '<b>' + tooltip.name.trim() + '</b>';
        if (tooltip.description) {
          text = text + ', ' + tooltip.description.trim();
        }
        this.setToolTipPosition(targetElem, text);
        this.setToolTipText(text);
        this.tooltips.places[id] = text;
      },
      error => {
        let noInfoFound = 'Could not get place information';
        this.translate.get('Occurrences.NoInfoFound').subscribe(
          translation => {
            noInfoFound = translation;
          }, err => { }
        );
        this.setToolTipPosition(targetElem, noInfoFound);
        this.setToolTipText(noInfoFound);
      }
    );
  }

  showWorkTooltip(id: string, targetElem: HTMLElement, origin: any) {
    if (this.tooltips.works[id]) {
      this.setToolTipPosition(targetElem, this.tooltips.works[id]);
      this.setToolTipText(this.tooltips.works[id]);
      return;
    }

    if (this.simpleWorkMetadata === undefined) {
      this.simpleWorkMetadata = config.useSimpleWorkMetadata ?? false;
    }

    if (this.simpleWorkMetadata === false) {
      this.semanticDataService.getSingleObjectElastic('work', id).subscribe(
        tooltip => {
          if ( tooltip.hits.hits[0] === undefined || tooltip.hits.hits[0]['_source'] === undefined ) {
            let noInfoFound = 'Could not get work information';
            this.translate.get('Occurrences.NoInfoFound').subscribe(
              translation => {
                noInfoFound = translation;
              }, err => { }
            );
            this.setToolTipPosition(targetElem, noInfoFound);
            this.setToolTipText(noInfoFound);
            return;
          }
          tooltip = tooltip.hits.hits[0]['_source'];
          const description = '<span class="work_title">' + tooltip.title  + '</span><br/>' + tooltip.reference;
          this.setToolTipPosition(targetElem, description);
          this.setToolTipText(description);
          this.tooltips.works[id] = description;
        },
        error => {
          let noInfoFound = 'Could not get work information';
          this.translate.get('Occurrences.NoInfoFound').subscribe(
            translation => {
              noInfoFound = translation;
            }, err => { }
          );
          this.setToolTipPosition(targetElem, noInfoFound);
          this.setToolTipText(noInfoFound);
        }
      );
    } else {
      this.tooltipService.getWorkTooltip(id).subscribe(
        tooltip => {
          this.setToolTipPosition(targetElem, tooltip.description);
          this.setToolTipText(tooltip.description);
          this.tooltips.works[id] = tooltip.description;
        },
        error => {
          let noInfoFound = 'Could not get work information';
          this.translate.get('Occurrences.NoInfoFound').subscribe(
            translation => {
              noInfoFound = translation;
            }, err => { }
          );
          this.setToolTipPosition(targetElem, noInfoFound);
          this.setToolTipText(noInfoFound);
        }
      );
    }
  }

  showFootnoteTooltip(id: string, targetElem: HTMLElement) {
    if (this.tooltips.footnotes[id] && this.userSettingsService.isDesktop()) {
      this.setToolTipPosition(targetElem, this.tooltips.footnotes[id]);
      this.setToolTipText(this.tooltips.footnotes[id]);
      return;
    }

    let footnoteText: any = '';
    if (targetElem.nextElementSibling !== null
    && targetElem.nextElementSibling.firstElementChild !== null
    && targetElem.nextElementSibling.classList.contains('ttFoot')
    && targetElem.nextElementSibling.firstElementChild.classList.contains('ttFixed')
    && targetElem.nextElementSibling.firstElementChild.getAttribute('data-id') === id) {
      footnoteText = targetElem.nextElementSibling.firstElementChild.innerHTML;
      // MathJx problem with resolving the actual formula, not the translated formula.
      if (targetElem.nextElementSibling.firstElementChild.lastChild?.nodeName === 'SCRIPT') {
        const tmpElem = <HTMLElement> targetElem.nextElementSibling.firstElementChild.lastChild;
        footnoteText = '$' + tmpElem.innerHTML + '$';
      }
    } else {
      return;
    }

    footnoteText = footnoteText.replace(' xmlns:tei="http://www.tei-c.org/ns/1.0"', '');

    // Get column id of the column where the footnote is.
    let containerElem = targetElem.parentElement;
    while (containerElem !== null && !(containerElem.classList.contains('read-column') &&
     containerElem.hasAttribute('id'))) {
      containerElem = containerElem.parentElement;
    }
    if (containerElem !== null) {
      const columnId = containerElem.getAttribute('id');

      // Prepend the footnoteindicator to the footnote text.
      const footnoteWithIndicator: string = '<div class="footnoteWrapper"><a class="xreference footnoteReference targetColumnId_'
      + columnId + '" href="#' + id + '">' + targetElem.textContent
      + '</a>' + '<p class="footnoteText">' + footnoteText  + '</p></div>';
      const footNoteHTML: string | null = this.sanitizer.sanitize(SecurityContext.HTML,
        this.sanitizer.bypassSecurityTrustHtml(footnoteWithIndicator));

      if (footNoteHTML) {
        this.setToolTipPosition(targetElem, footNoteHTML);
        this.setToolTipText(footNoteHTML);
      }
      if (this.userSettingsService.isDesktop()) {
        this.tooltips.footnotes[id] = footNoteHTML;
      }
    }
  }

  showVariantFootnoteTooltip(id: string, targetElem: HTMLElement) {
    const footNoteHTML: string | null = this.getVariantFootnoteText(id, targetElem);
    if (footNoteHTML) {
      this.setToolTipPosition(targetElem, footNoteHTML);
      this.setToolTipText(footNoteHTML);
    }
  }

  showManuscriptFootnoteTooltip(id: string, targetElem: HTMLElement) {
    const footNoteHTML: string | null = this.getManuscriptFootnoteText(id, targetElem);
    if (footNoteHTML) {
      this.setToolTipPosition(targetElem, footNoteHTML);
      this.setToolTipText(footNoteHTML);
    }
  }

  /* Use this method to get a footnote text in a variant text. Returns a string with the footnote html. */
  private getVariantFootnoteText(id: string, triggerElem: HTMLElement) {
    if (triggerElem.nextElementSibling !== null
    && triggerElem.nextElementSibling.firstElementChild !== null
    && triggerElem.nextElementSibling.classList.contains('teiVariant')
    && triggerElem.nextElementSibling.classList.contains('ttFoot')
    && triggerElem.nextElementSibling.firstElementChild.classList.contains('ttFixed')
    && triggerElem.nextElementSibling.firstElementChild.getAttribute('id') === id) {
      let ttText = triggerElem.nextElementSibling.firstElementChild.innerHTML;
      // MathJx problem with resolving the actual formula, not the translated formula.
      if (triggerElem.nextElementSibling.firstElementChild.lastChild?.nodeName === 'SCRIPT') {
        const tmpElem = <HTMLElement> triggerElem.nextElementSibling.firstElementChild.lastChild;
        ttText = '$' + tmpElem.innerHTML + '$';
      }

      // Get column id of the column where the footnote is.
      let containerElem = triggerElem.parentElement;
      while (containerElem !== null && !(containerElem.classList.contains('read-column') &&
       containerElem.hasAttribute('id'))) {
        containerElem = containerElem.parentElement;
      }
      if (containerElem !== null) {
        const columnId = containerElem.getAttribute('id');

        // Prepend the footnoteindicator to the the footnote text.
        const footnoteWithIndicator: string = '<div class="footnoteWrapper">'
        + '<a class="xreference footnoteReference teiVariant targetColumnId_'
        + columnId + '" href="#' + id + '">' + triggerElem.textContent
        + '</a>' + '<p class="footnoteText">' + ttText  + '</p></div>';
        const footNoteHTML: string | null = this.sanitizer.sanitize(SecurityContext.HTML,
        this.sanitizer.bypassSecurityTrustHtml(footnoteWithIndicator));
        return footNoteHTML;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  /* Use this method to get a footnote text in a manuscript text. Returns a string with the footnote html. */
  private getManuscriptFootnoteText(id: string, triggerElem: HTMLElement) {
    if (triggerElem.nextElementSibling !== null
    && triggerElem.nextElementSibling.firstElementChild !== null
    && triggerElem.nextElementSibling.classList.contains('teiManuscript')
    && triggerElem.nextElementSibling.classList.contains('ttFoot')
    && triggerElem.nextElementSibling.firstElementChild.classList.contains('ttFixed')
    && triggerElem.nextElementSibling.firstElementChild.getAttribute('data-id') === id) {
      let ttText = triggerElem.nextElementSibling.firstElementChild.innerHTML;
      // MathJx problem with resolving the actual formula, not the translated formula.
      if (triggerElem.nextElementSibling.firstElementChild.lastChild?.nodeName === 'SCRIPT') {
        const tmpElem = <HTMLElement> triggerElem.nextElementSibling.firstElementChild.lastChild;
        ttText = '$' + tmpElem.innerHTML + '$';
      }

      // Get column id of the column where the footnote is.
      let containerElem = triggerElem.parentElement;
      while (containerElem !== null && !(containerElem.classList.contains('read-column') &&
       containerElem.hasAttribute('id'))) {
        containerElem = containerElem.parentElement;
      }
      if (containerElem !== null) {
        const columnId = containerElem.getAttribute('id');

        // Prepend the footnoteindicator to the the footnote text.
        const footnoteWithIndicator: string = '<div class="footnoteWrapper">'
        + '<a class="xreference footnoteReference teiManuscript targetColumnId_'
        + columnId + '" href="#' + id + '">' + triggerElem.textContent
        + '</a>' + '<p class="footnoteText">' + ttText  + '</p></div>';
        const footNoteHTML: string | null = this.sanitizer.sanitize(SecurityContext.HTML,
        this.sanitizer.bypassSecurityTrustHtml(footnoteWithIndicator));
        return footNoteHTML;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  /* This method is used for showing tooltips for changes, normalisations, abbreviations and explanations in manuscripts. */
  showTooltipFromInlineHtml(targetElem: HTMLElement) {
    if (targetElem.nextElementSibling !== null
    && targetElem.nextElementSibling.classList.contains('tooltip')) {
      this.setToolTipPosition(targetElem, targetElem.nextElementSibling.innerHTML);
      this.setToolTipText(targetElem.nextElementSibling.innerHTML);
    }
  }

  showCommentTooltip(id: string, targetElem: HTMLElement) {
    if (this.tooltips.comments[id]) {
      this.setToolTipPosition(targetElem, this.tooltips.comments[id]);
      this.setToolTipText(this.tooltips.comments[id]);
      return;
    }

    this.tooltipService.getCommentTooltip(this.textItemID, id).subscribe({
      next: (tooltip) => {
        this.setToolTipPosition(targetElem, tooltip.description);
        this.setToolTipText(tooltip.description);
        this.tooltips.comments[id] = tooltip.description
      },
      error: (e) => {
        let noInfoFound = 'Could not get comment information';
        this.translate.get('Occurrences.NoInfoFound').subscribe({
          next: (translation) => {
            noInfoFound = translation;
          }, error: (errorT) => { }
        });
        this.setToolTipPosition(targetElem, noInfoFound);
        this.setToolTipText(noInfoFound);
      }
    });
  }

  showVariantTooltip(targetElem: HTMLElement) {
    if (targetElem.nextElementSibling !== null
    && targetElem.nextElementSibling.classList.contains('tooltip')) {
      if (targetElem.nextElementSibling.textContent) {
        this.setToolTipPosition(targetElem, targetElem.nextElementSibling.textContent);
        this.setToolTipText(targetElem.nextElementSibling.textContent);
      }
    }
  }

  showFootnoteInfoOverlay(id: string, targetElem: HTMLElement) {
    if (this.tooltips.footnotes[id] && this.userSettingsService.isDesktop()) {
      this.translate.get('note').subscribe({
        next: (translation) => {
          this.setInfoOverlayTitle(translation);
        }, error: (e) => { }
      });
      this.setInfoOverlayPositionAndWidth(targetElem);
      this.setInfoOverlayText(this.tooltips.footnotes[id]);
      return;
    }

    let footnoteText: any = '';
    if (targetElem.nextElementSibling !== null
    && targetElem.nextElementSibling.firstElementChild !== null
    && targetElem.nextElementSibling.classList.contains('ttFoot')
    && targetElem.nextElementSibling.firstElementChild.classList.contains('ttFixed')
    && targetElem.nextElementSibling.firstElementChild.getAttribute('data-id') === id) {
      footnoteText = targetElem.nextElementSibling.firstElementChild.innerHTML;
      // MathJx problem with resolving the actual formula, not the translated formula.
      if (targetElem.nextElementSibling.firstElementChild.lastChild?.nodeName === 'SCRIPT') {
        const tmpElem = <HTMLElement> targetElem.nextElementSibling.firstElementChild.lastChild;
        footnoteText = '$' + tmpElem.innerHTML + '$';
      }
    } else {
      return;
    }

    footnoteText = footnoteText.replace(' xmlns:tei="http://www.tei-c.org/ns/1.0"', '');

    let footnoteWithIndicator = '';
    if (this.userSettingsService.isDesktop()) {
      // Get column id of the column where the footnote is.
      let containerElem = targetElem.parentElement;
      while (containerElem !== null && !(containerElem.classList.contains('read-column') &&
      containerElem.hasAttribute('id'))) {
        containerElem = containerElem.parentElement;
      }
      if (containerElem !== null) {
        const columnId = containerElem.getAttribute('id');

        // Prepend the footnoteindicator to the footnote text.
        footnoteWithIndicator = '<div class="footnoteWrapper"><a class="xreference footnoteReference targetColumnId_'
        + columnId + '" href="#' + id + '">' + targetElem.textContent + '</a>'
        + '<p class="footnoteText">' + footnoteText + '</p></div>';
      }
    } else {
      // This is for mobile view.
      // Prepend the footnoteindicator to the footnote text.
      footnoteWithIndicator = '<div class="footnoteWrapper"><a class="xreference footnoteReference" href="#' + id + '">'
      + targetElem.textContent + '</a>' + '<p class="footnoteText">'
      + footnoteText + '</p></div>';
    }

    const footNoteHTML: string | null = this.sanitizer.sanitize(SecurityContext.HTML,
      this.sanitizer.bypassSecurityTrustHtml(footnoteWithIndicator));

    this.translate.get('note').subscribe({
      next: (translation) => {
        this.setInfoOverlayTitle(translation);
      }, error: (e) => { }
    });
    this.setInfoOverlayPositionAndWidth(targetElem);
    if (footNoteHTML) {
      this.setInfoOverlayText(footNoteHTML);
    }
    if (this.userSettingsService.isDesktop()) {
      this.tooltips.footnotes[id] = footNoteHTML;
    }
  }

  showManuscriptFootnoteInfoOverlay(id: string, targetElem: HTMLElement) {
    this.translate.get('note').subscribe({
      next: (translation) => {
        this.setInfoOverlayTitle(translation);
      }, error: (e) => { }
    });
    const footNoteHTML: string | null = this.getManuscriptFootnoteText(id, targetElem);
    this.setInfoOverlayPositionAndWidth(targetElem);
    if (footNoteHTML) {
      this.setInfoOverlayText(footNoteHTML);
    }
  }

  showVariantFootnoteInfoOverlay(id: string, targetElem: HTMLElement) {
    this.translate.get('note').subscribe({
      next: (translation) => {
        this.setInfoOverlayTitle(translation);
      }, error: (e) => { }
    });
    const footNoteHTML: string | null = this.getVariantFootnoteText(id, targetElem);
    this.setInfoOverlayPositionAndWidth(targetElem);
    if (footNoteHTML) {
      this.setInfoOverlayText(footNoteHTML);
    }
  }

  showCommentInfoOverlay(id: string, targetElem: HTMLElement) {
    if (this.tooltips.comments[id as keyof typeof this.tooltips.comments]) {
      this.translate.get('Occurrences.Commentary').subscribe({
        next: (translation) => {
          this.setInfoOverlayTitle(translation);
        }, error: (errorA) => { }
      });
      this.setInfoOverlayPositionAndWidth(targetElem);
      this.setInfoOverlayText(this.tooltips.comments[id as keyof typeof this.tooltips.comments]);
      return;
    }

    this.tooltipService.getCommentTooltip(this.textItemID, id).subscribe({
      next: (tooltip) => {
        this.translate.get('Occurrences.Commentary').subscribe({
          next: (translation) => {
            this.setInfoOverlayTitle(translation);
          }, error: (errorB) => { }
        });
        this.setInfoOverlayPositionAndWidth(targetElem);
        this.setInfoOverlayText(tooltip.description);
        this.tooltips.comments[id] = tooltip.description
      },
      error: (errorC) => {
        let noInfoFound = 'Could not get comment information';
        this.translate.get('Occurrences.NoInfoFound').subscribe({
          next: (translation) => {
            noInfoFound = translation;
          }, error: (errorD) => { }
        });
        this.translate.get('Occurrences.Commentary').subscribe({
          next: (translation) => {
            this.setInfoOverlayTitle(translation);
          }, error: (errorE) => { }
        });
        this.setInfoOverlayPositionAndWidth(targetElem);
        this.setInfoOverlayText(noInfoFound);
      }
    });
  }

  /* This method is used for showing infoOverlays for changes, normalisations and abbreviations. */
  showInfoOverlayFromInlineHtml(targetElem: HTMLElement) {
    if (targetElem.nextElementSibling !== null
    && targetElem.nextElementSibling.classList.contains('tooltip')) {
      let title = '';
      let text = '';
      let lemma = '';

      if (targetElem.nextElementSibling.classList.contains('ttChanges')) {
        // Change.
        title = 'editorialChange';
        if (targetElem.classList.contains('corr_red')) {
          lemma = targetElem.innerHTML;
        } else if (targetElem.firstElementChild !== null
        && targetElem.firstElementChild.classList.contains('corr_hide')) {
          lemma = '<span class="corr_hide">' + targetElem.firstElementChild.innerHTML + '</span>';
        } else if (targetElem.firstElementChild !== null
        && targetElem.firstElementChild.classList.contains('corr')) {
          lemma = targetElem.firstElementChild.innerHTML;
        }
        text = '<p class="infoOverlayText"><span class="ioLemma">'
        + lemma + '</span><span class="ioDescription">'
        + targetElem.nextElementSibling.innerHTML + '</span></p>';
      } else if (targetElem.nextElementSibling.classList.contains('ttNormalisations')) {
        // Normalisation.
        title = 'editorialNormalisation';
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
        title = 'abbreviation';
        if (targetElem.firstElementChild !== null
        && targetElem.firstElementChild.classList.contains('abbr')) {
          text = '<p class="infoOverlayText"><span class="ioLemma">'
          + targetElem.firstElementChild.innerHTML
          + '</span><span class="ioDescription">'
          + targetElem.nextElementSibling.innerHTML + '</span></p>';
        }
      } else if (targetElem.nextElementSibling.classList.contains('ttComment')) {
        // Abbreviation.
        title = 'comments';
        if (targetElem.firstElementChild !== null
        && targetElem.firstElementChild.classList.contains('noteText')) {
          text = '<p class="infoOverlayText"><span class="ioLemma">'
          + targetElem.firstElementChild.innerHTML
          + '</span><span class="ioDescription">'
          + targetElem.nextElementSibling.innerHTML + '</span></p>';
        }
      } else if (targetElem.classList.contains('ttFoot')
      && targetElem.nextElementSibling !== null
      && targetElem.nextElementSibling.classList.contains('ttFoot')) {
        // Some other note coded as a footnote (but lacking id and data-id attributes).
        if (targetElem.nextElementSibling.firstElementChild !== null
        && targetElem.nextElementSibling.firstElementChild.classList.contains('ttFixed')) {
          title = '';
          if (targetElem.classList.contains('revision')) {
            title = 'revisionNote';
            lemma = '';
          } else {
            lemma = '<span class="ioLemma">' + targetElem.innerHTML + '</span>';
          }
          text = '<p class="infoOverlayText">'
          + lemma + '<span class="ioDescription">'
          + targetElem.nextElementSibling.firstElementChild.innerHTML + '</span></p>';
        }
      } else {
        // Some other note, generally editorial remarks pertaining to a manuscript.
        title = '';
        if (targetElem.classList.contains('ttMs')) {
          title = 'criticalNote';
        }
        lemma = targetElem.textContent || '';
        if ( targetElem.classList.contains('deletion')
        || (targetElem.parentElement !== null && targetElem.classList.contains('tei_deletion_medium_wrapper')) ) {
          lemma = '<span class="deletion">' + lemma + '</span>';
        }
        text = '<p class="infoOverlayText"><span class="ioLemma">'
        + lemma + '</span><span class="ioDescription">'
        + targetElem.nextElementSibling.innerHTML + '</span></p>';
      }
      if (title) {
        this.translate.get(title).subscribe(
          translation => {
            this.setInfoOverlayTitle(translation);
          }, error => { }
        );
      } else {
        this.setInfoOverlayTitle('');
      }
      this.setInfoOverlayPositionAndWidth(targetElem);
      this.setInfoOverlayText(text);
    }
  }

  setToolTipText(text: string) {
    this.toolTipText = text;
  }

  setInfoOverlayText(text: string) {
    this.infoOverlayText = text;
  }

  setInfoOverlayTitle(title: string) {
    this.infoOverlayTitle = String(title);
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
    this.infoOverlayPosType = 'fixed'; // Position needs to be fixed so we can safely hide it outside viewport
    this.infoOverlayPosition = {
      bottom: 0 + 'px',
      left: -1500 + 'px'
    };
  }

  setToolTipPosition(targetElem: HTMLElement, ttText: string) {
    const ttProperties = this.tooltipService.getTooltipProperties(targetElem, ttText, 'page-read');

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

  /**
   * Set position and width of infoOverlay element. This function is not exactly
   * the same as in introduction.ts due to different page structure on read page.
   */
  private setInfoOverlayPositionAndWidth(triggerElement: HTMLElement, defaultMargins = 20, maxWidth = 600) {
    let margins = defaultMargins;

    // Get viewport height and width.
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    // Get read page content element and adjust viewport height with horizontal
    // scrollbar height if such is present. Also get how much the read page has
    // scrolled horizontally to the left.
    let scrollLeft = 0;
    let horizontalScrollbarOffsetHeight = 0;
    const contentElem = document.querySelector('page-read:not([ion-page-hidden]):not(.ion-page-hidden) > ion-content > .scroll-content') as HTMLElement;
    if (contentElem !== null) {
      scrollLeft = contentElem.scrollLeft;

      if (contentElem.clientHeight < contentElem.offsetHeight) {
        horizontalScrollbarOffsetHeight = contentElem.offsetHeight - contentElem.clientHeight;
      }
    }

    // Get bounding rectangle of the div.scroll-content element which is the
    // container for the column that the trigger element resides in.
    let containerElem = triggerElement.parentElement;
    while (containerElem !== null && containerElem.parentElement !== null &&
      !(containerElem.classList.contains('scroll-content') &&
      containerElem.parentElement.tagName === 'ION-SCROLL')) {
      containerElem = containerElem.parentElement;
    }

    if (containerElem !== null && containerElem.parentElement !== null) {
      const containerElemRect = containerElem.getBoundingClientRect();
      let calcWidth = containerElem.clientWidth; // Width without scrollbar

      if (this.userSettingsService.isMobile() && vw > 800) {
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
      if (this.userSettingsService.isDesktop()) {
        this.infoOverlayPosType = 'absolute';
      } else {
        this.infoOverlayPosType = 'fixed';
      }

      // Set info overlay width
      this.infoOverlayWidth = calcWidth + 'px';
    }
  }

  async showPersonModal(id: string) {
    const modal = await this.modalCtrl.create({
      component: OccurrencesPage,
      componentProps: { id: id, type: 'subject' }
    });
    return await modal.present();
  }

  async showPlaceModal(id: string) {
    const modal = await this.modalCtrl.create({
      component: OccurrencesPage,
      componentProps: { id: id, type: 'location' }
    });
    return await modal.present();
  }

  async showWorkModal(id: string) {
    const modal = await this.modalCtrl.create({
      component: OccurrencesPage,
      componentProps: { id: id, type: 'work' }
    });
    return await modal.present();
  }

  async showPopover(event: any) {
    const popover = await this.popoverCtrl.create({
      component: ReadPopoverPage,
      cssClass: 'read-popover',
      reference: 'trigger',
      side: 'bottom',
      alignment: 'end'
    });
    return await popover.present(event);
  }

  public async showReference() {
    // Get URL of Page and then the URI
    const modal = await this.modalCtrl.create({
      component: DownloadTextsModalPage,
      componentProps: { id: document.URL, type: 'reference', origin: 'page-read' }
    })
    return await modal.present();
  }

  public async showDownloadModal() {
    const modal = await this.modalCtrl.create({
      component: DownloadTextsModalPage,
      componentProps: { textId: this.textItemID, origin: 'page-read' }
    })
    return await modal.present();
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

  addView(type: string, id?: string | null, image?: any | null, language?: string | null, variationSortOrder?: number) {

    // TODO: Adding the correct unique variations still requires some work
    if (type === 'variations' && variationSortOrder === undefined) {
      let currentVariationsViews = 0;
      this.views.forEach((viewObj: any) => {
        if (viewObj.type === 'variations') { currentVariationsViews++; }
      });
      variationSortOrder = currentVariationsViews;
    }

    if (this.availableViewModes.indexOf(type) !== -1) {
      const newView = { type: type } as any;

      if (id != null) {
        newView['id'] = id;
      }
      if (image != null) {
        newView['image'] = image;
      }
      if (variationSortOrder != null) {
        newView['variationSortOrder'] = variationSortOrder;
      }
      if (this.multilingualEST && type === 'established' && language) {
        newView['type'] = 'established_' + language;
      }

      // Append the new view to the array of current views and navigate
      this.views.push(newView);
      this.updateViewsInRouterQueryParams(this.views);
    }
  }

  removeView(i: any) {
    this.removeVariationSortOrderFromService(i);
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
      this.switchVariationSortOrdersInService(id, id + 1);

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
      this.switchVariationSortOrdersInService(id, id - 1);

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
  moveArrayItem(array: any[], fromIndex: number, toIndex: number) {
    const reorderedArray = array;
    if (fromIndex > -1 && toIndex > -1 && fromIndex < array.length
      && toIndex < array.length && fromIndex !== toIndex) {
      reorderedArray.splice(toIndex, 0, reorderedArray.splice(fromIndex, 1)[0]);
    }
    return reorderedArray;
  }

  updateViewManuscriptID(manuscriptID: string, viewIndex: number) {
    this.views[viewIndex]['id'] = manuscriptID;
    this.updateViewsInRouterQueryParams(this.views);
  }

  updateViewsInRouterQueryParams(views: Array<any>) {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { views: JSON.stringify(views) },
        queryParamsHandling: 'merge'
      }
    );
  }

  private scrollToVariant(element: HTMLElement) {
    this.hideToolTip();
    try {
      if (element['classList'].contains('variantScrollTarget')) {
        const variantContElems: NodeListOf<HTMLElement> = document.querySelectorAll('page-read:not([ion-page-hidden]):not(.ion-page-hidden) variations');
        for (let v = 0; v < variantContElems.length; v++) {
          const elems: NodeListOf<HTMLElement> = variantContElems[v].querySelectorAll('.teiVariant');
          let variantNotScrolled = true;
          for (let i = 0; i < elems.length; i++) {
            if (elems[i].id === element.id) {
              if (!elems[i].classList.contains('highlight')) {
                elems[i].classList.add('highlight');
              }
              if (variantNotScrolled) {
                variantNotScrolled = false;
                this.commonFunctions.scrollElementIntoView(elems[i]);
              }
              setTimeout(function () {
                if (elems[i] !== undefined) {
                  elems[i].classList.remove('highlight');
                }
              }, 5000);
            }
          }
        }
      } else if (element['classList'].contains('anchorScrollTarget')) {
        const elems: NodeListOf<HTMLElement> = document.querySelectorAll('page-read:not([ion-page-hidden]):not(.ion-page-hidden) .teiVariant.anchorScrollTarget');
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
                if (elems[i] !== undefined) {
                  elems[i].classList.remove('highlight');
                }
              }, 5000);
              if (iClassList[y] === targetClassName) {
                this.commonFunctions.scrollElementIntoView(elems[i]);
              }
            }
          }
        }
      }
    } catch (e) {
    }
  }

  printMainContentClasses() {
    if (this.userSettingsService.isMobile()) {
      return 'mobile-mode-read-content';
    } else {
      return '';
    }
  }

  setCollectionAndPublicationLegacyId() {
    this.textService.getLegacyIdByPublicationId(this.paramPublicationID).subscribe({
      next: (publication) => {
        this.collectionAndPublicationLegacyId = '';
        if (publication[0].legacy_id) {
          this.collectionAndPublicationLegacyId = publication[0].legacy_id;
        }
      },
      error: (e) => {
        this.collectionAndPublicationLegacyId = '';
        console.log('could not get publication data trying to resolve collection and publication legacy id');
      }
    });
  }

  /**
   * Removes the sort order of the variations column with the given index from the variationsOrder
   * array in textService.
   */
  removeVariationSortOrderFromService(columnIndex: number) {
    const columnElem = document.querySelector('page-read:not([ion-page-hidden]):not(.ion-page-hidden) div#read_div_' + columnIndex);
    if (columnElem) {
      const currentVarElem = columnElem.querySelector('variations');
      if (currentVarElem) {
        /* Find the index of the current variations column among just the variations columns */
        const key = this.findVariationsColumnIndex(columnIndex);
        /* Remove the sort order of the removed variations column from textService */
        if (key !== undefined) {
          if (this.textService.variationsOrder[key] !== undefined) {
            this.textService.variationsOrder.splice(key, 1);
          }
        }
      }
    }
  }

  /**
   * Switches the positions of two variations columns' sort orders in the variationsOrder array
   * in textService.
   */
  switchVariationSortOrdersInService(currentColumnIndex: number, otherColumnIndex: number) {
    /* Check if either the current column or the one it is changing places with is a variations column */
    const currentColumnElem = document.querySelector('page-read:not([ion-page-hidden]):not(.ion-page-hidden) div#read_div_' + currentColumnIndex);
    const otherColumnElem = document.querySelector('page-read:not([ion-page-hidden]):not(.ion-page-hidden) div#read_div_' + otherColumnIndex);
    if (currentColumnElem && otherColumnElem) {
      const currentVarElem = currentColumnElem.querySelector('variations');
      const otherVarElem = otherColumnElem.querySelector('variations');
      if (currentVarElem && otherVarElem) {
        /* Find the indices of the two variations column among just the variations columns */
        const currentVarIndex = this.findVariationsColumnIndex(currentColumnIndex);
        let otherVarIndex = (currentVarIndex || 0) + 1;
        if (otherColumnIndex < currentColumnIndex) {
          otherVarIndex = (currentVarIndex || 0) - 1;
        }
        this.textService.variationsOrder = this.moveArrayItem(this.textService.variationsOrder, (currentVarIndex || 0), otherVarIndex);
      }
    }

  }

  /**
   * Given the read column index of a variations column, this function returns the index of the
   * column among just the variations columns in the read view. So, for instance, if there are
   * 3 read columns in total, 2 of which are variations columns, this function can tell if the
   * variations column with index columnIndex is the first or second variations column.
   */
  findVariationsColumnIndex(columnIndex: number) {
    const columnElems = Array.from(document.querySelectorAll('page-read:not([ion-page-hidden]):not(.ion-page-hidden) div.read-column'));
    const varColIds = [] as any;
    columnElems.forEach(function(column) {
      const varElem = column.querySelector('variations');
      if (varElem) {
        varColIds.push(column.id);
      }
    });
    let varIndex = undefined;
    for (let i = 0; i < varColIds.length; i++) {
      if (varColIds[i] === 'read_div_' + columnIndex) {
        varIndex = i;
        break;
      }
    }
    return varIndex;
  }

  showAddViewPopover(e: Event) {
    this.addViewPopover.event = e;
    this.addViewPopoverisOpen = true;
  }

}
