import { Component, ElementRef, Inject, Input, LOCALE_ID, NgZone, Renderer2 } from '@angular/core';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { isBrowser } from 'src/standalone/utility-functions';


@Component({
  selector: 'legend',
  templateUrl: 'legend.html',
  styleUrls: ['legend.scss']
})
export class LegendComponent {

  @Input() itemId?: string;
  @Input() scrollToElementId?: string;
  text?: string;
  textLoading: Boolean = true;
  staticMdLegendFolderNumber = '13';
  collectionId = '';
  publicationId = '';
  intervalTimerId: number;
  private unlistenClickEvents?: () => void;

  constructor(
    private elementRef: ElementRef,
    private mdContentService: MdContentService,
    private ngZone: NgZone,
    protected readPopoverService: ReadPopoverService,
    private renderer2: Renderer2,
    public commonFunctions: CommonFunctionsService,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.intervalTimerId = 0;
  }

  ngOnInit() {
    this.collectionId = this.itemId?.split('_')[0] || '';
    this.publicationId = this.itemId?.split('_')[1].split(';')[0] || '';

    this.getMdContent(this.activeLocale + '-' + this.staticMdLegendFolderNumber + '-' + this.collectionId + '-' + this.publicationId);
    if (isBrowser()) {
      this.setUpTextListeners();
    }
  }

  ngOnDestroy() {
    this.unlistenClickEvents?.();
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: (text) => {
        this.text = text.content;
        this.textLoading = false;
        if (isBrowser()) {
          this.scrollToInitialTextPosition();
        }
      },
      error: (e) => {
        if (fileID.split('-').length > 3) {
          this.getMdContent(this.activeLocale + '-' + this.staticMdLegendFolderNumber + '-' + this.collectionId);
        } else if (fileID.split('-')[2] !== '00') {
          this.getMdContent(this.activeLocale + '-' + this.staticMdLegendFolderNumber + '-' + '00');
        } else {
          this.textLoading = false;
          this.text = $localize`:@@Read.Legend.NoLegend:Inga teckenförklaringar tillgängliga.`;
        }
      }
    });
  }

  private setUpTextListeners() {
    const nElement: HTMLElement = this.elementRef.nativeElement;
    this.ngZone.runOutsideAngular(() => {
      /* CLICK EVENTS */
      this.unlistenClickEvents = this.renderer2.listen(nElement, 'click', (event) => {
        try {
          const clickedElem = event.target as HTMLElement;

          if (clickedElem.hasAttribute('href') === true
          && clickedElem.getAttribute('href')?.startsWith('http') === false
          && clickedElem.getAttribute('href')?.startsWith('/') === false) {
            event.preventDefault();
            const targetHref = clickedElem.getAttribute('href');

            if (targetHref && targetHref.startsWith('#')) {
              // Assume link to data-id in same legend text --> find element and scroll it into view
              let containerElem = clickedElem.parentElement;
              while (containerElem !== null && containerElem.tagName !== 'LEGEND') {
                containerElem = containerElem.parentElement;
              }
              if (containerElem) {
                const targetElem = containerElem.querySelector('[data-id="' + targetHref.slice(1) + '"]') as HTMLElement;
                this.commonFunctions.scrollElementIntoView(targetElem, 'top');
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      });
    });
  }

  /**
   * Function for scrolling an element with matching data-id attribute in the
   * last legend-element into view.
   */
  scrollToInitialTextPosition() {
    if (this.scrollToElementId) {
      const that = this;
      this.ngZone.runOutsideAngular(() => {
        let iterationsLeft = 10;
        clearInterval(this.intervalTimerId);

        console.log("#### WINDOW 13");
        this.intervalTimerId = window.setInterval(function() {
          if (iterationsLeft < 1) {
            clearInterval(that.intervalTimerId);
          } else {
            iterationsLeft -= 1;
            const legendElements = document.querySelectorAll('page-read:not([ion-page-hidden]):not(.ion-page-hidden) legend');
            const element = legendElements[legendElements.length - 1].querySelector('[data-id="' + that.scrollToElementId + '"]') as any;
            if (element) {
              that.commonFunctions.scrollElementIntoView(element, 'top');
              clearInterval(that.intervalTimerId);
            }
          }
        }.bind(this), 500);
      });
    }
  }

}
