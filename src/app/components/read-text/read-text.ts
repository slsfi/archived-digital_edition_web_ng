import { Component, Input, ElementRef, EventEmitter, Output, Renderer2, NgZone, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { IllustrationPage } from 'src/app/modals/illustration/illustration';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { EventsService } from 'src/app/services/events/events.service';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { TextService } from 'src/app/services/texts/text.service';
import { config } from "src/assets/config/config";
import { isBrowser } from 'src/standalone/utility-functions';


@Component({
  selector: 'read-text',
  templateUrl: 'read-text.html',
  styleUrls: ['read-text.scss']
})
export class ReadTextComponent {
  @Input() textItemID: string = '';
  @Input() textPosition: string = '';
  @Input() searchMatches: Array<string> = [];
  @Output() openNewIllustrView: EventEmitter<any> = new EventEmitter();

  text: any;
  textLanguage: string = '';
  illustrationsVisibleInReadtext: boolean = false;
  illustrationsViewAvailable: boolean = false;
  intervalTimerId: number;
  private unlistenClickEvents?: () => void;

  constructor(
    public events: EventsService,
    protected readPopoverService: ReadPopoverService,
    protected textService: TextService,
    protected sanitizer: DomSanitizer,
    private renderer2: Renderer2,
    private ngZone: NgZone,
    private elementRef: ElementRef,
    public userSettingsService: UserSettingsService,
    protected modalController: ModalController,
    public commonFunctions: CommonFunctionsService
  ) {
    this.intervalTimerId = 0;
    this.illustrationsViewAvailable = config.page?.read?.viewTypeSettings?.illustrations ?? false;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (propName === 'textPosition') {
          if (
            !changes.textPosition.firstChange &&
            changes.textPosition.currentValue &&
            changes.textPosition.currentValue !== changes.textPosition.previousValue
          ) {
            this.scrollToTextPosition();
          } else if (
            changes.textPosition.previousValue &&
            changes.textPosition.currentValue === undefined
          ) {
            this.scrollReadTextToTop();
          }
        }
      }
    }
  }

  ngOnInit() {
    if (this.textItemID) {
      this.loadReadText();
      this.setIllustrationsInReadtextStatus();
    }
    if (isBrowser()) {
      this.setUpTextListeners();
    }
  }

  ngOnDestroy() {
    this.unlistenClickEvents?.();
  }

  loadReadText() {
    this.textService.getEstablishedText(this.textItemID).subscribe({
      next: (res) => {
        if (
          res &&
          res.content &&
          res.content !== '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>File not found</body></html>'
        ) {
          const collectionID = this.textItemID.split('_')[0];
          let text = res.content as string;
          text = this.textService.postprocessEstablishedText(text, collectionID);
          text = this.commonFunctions.insertSearchMatchTags(text, this.searchMatches);
          this.text = this.sanitizer.bypassSecurityTrustHtml(text);
          if (this.textPosition) {
            this.scrollToTextPosition();
          }
        } else {
          this.text = $localize`:@@Read.Established.NoEstablished:Det finns ingen utskriven lästext, se faksimil.`;
        }
        if (res && res.language) {
          this.textLanguage = res.language;
        } else {
          this.textLanguage = '';
        }
      },
      error: (e) => {
        // TODO: Add translated error message.
        this.text = 'Ett fel har uppstått. Lästexten kunde inte hämtas.';
      }
    });
  }

  /**
   * Checks config settings if the current reading text has illustrations that are
   * shown inline in the reading text view (based on matching publication id or collection id).
   * Sets this.illustrationsVisibleInReadtext either true or false.
   */
  private setIllustrationsInReadtextStatus() {
    const showIllustrations = config.settings?.showReadTextIllustrations ?? [];
    if (
      showIllustrations.includes(this.textItemID.split('_')[0]) ||
      showIllustrations.includes(this.textItemID.split('_')[1])
    ) {
      this.illustrationsVisibleInReadtext = true;
    } else {
      this.illustrationsVisibleInReadtext = false;
    }
  }

  private setUpTextListeners() {
    const nElement: HTMLElement = this.elementRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {

      /* CLICK EVENTS */
      this.unlistenClickEvents = this.renderer2.listen(nElement, 'click', (event) => {
        try {
          const eventTarget = event.target as HTMLElement;

          // Some of the texts, e.g. ordsprak.sls.fi, have links to external sites
          if (
            eventTarget.hasAttribute('href') === true &&
            eventTarget.getAttribute('href')?.includes('http') === false
          ) {
            event.preventDefault();
          }

          if (!this.userSettingsService.isMobile()) {
            let image = null as any;

            // Check if click on an illustration or icon representing an illustration
            if (eventTarget.classList.contains('doodle') && eventTarget.hasAttribute('src')) {
              // Click on a pictogram ("doodle")
              image = {
                src: '/assets/images/verk/' + String(eventTarget.dataset['id']).replace('tag_', '') + '.jpg',
                class: 'doodle'
              };
            } else if (this.illustrationsVisibleInReadtext) {
              // There are possibly visible illustrations in the read text. Check if click on such an image.
              if (eventTarget.classList.contains('est_figure_graphic') && eventTarget.hasAttribute('src')) {
                image = { src: event.target.src, class: 'visible-illustration' };
              }
            } else {
              // Check if click on an icon representing an image which is NOT visible in the reading text
              if (
                eventTarget.previousElementSibling !== null &&
                eventTarget.previousElementSibling.classList.contains('est_figure_graphic') &&
                eventTarget.previousElementSibling.hasAttribute('src')
              ) {
                image = { src: event.target.previousElementSibling.src, class: 'illustration' };
              }
            }

            // Check if we have an image to show in the illustrations-view
            if (image !== null) {
              // Check if we have an illustrations-view open, if not, open and display the clicked image there
              if (document.querySelector('page-text:not([ion-page-hidden]):not(.ion-page-hidden) illustrations') === null) {
                this.ngZone.run(() => {
                  this.openIllustrationInNewView(image);
                });
              } else {
                // Display image in an illustrations-view which is already open
                this.ngZone.run(() => {
                  this.events.publishGiveIllustration(image);
                });
              }
            }
          }
        } catch (e) {
          console.error(e);
        }

        // Check if click on an icon which links to an illustration that should be opened in a modal
        if (event.target.parentNode.classList.contains('ref_illustration')) {
          const hashNumber = event.target.parentNode.hash;
          const imageNumber = hashNumber.split('#')[1];
          this.ngZone.run(() => {
            this.openIllustration(imageNumber);
          });
        }
      });

    });
  }

  /**
   * Function for opening the passed image in a new illustrations-view.
   */
  openIllustrationInNewView(image: any) {
    image.viewType = 'illustrations';
    image.id = null;
    this.openNewIllustrView.emit(image);
    this.commonFunctions.scrollLastViewIntoView();
  }

  async openIllustration(imageNumber: any) {
    const modal = await this.modalController.create({
      component: IllustrationPage,
      componentProps: { 'imageNumber': imageNumber }
    });
    modal.present();
  }

  scrollToTextPosition() {
    // Scroll to textPosition if defined.
    if (isBrowser() && this.textPosition) {
      this.ngZone.runOutsideAngular(() => {
        let iterationsLeft = 10;
        clearInterval(this.intervalTimerId);
        const that = this;
        const nElement: HTMLElement = this.elementRef.nativeElement;

        this.intervalTimerId = window.setInterval(function() {
          if (iterationsLeft < 1) {
            clearInterval(that.intervalTimerId);
          } else {
            iterationsLeft -= 1;
            /*
            let target = document.querySelector(
              'page-text:not([ion-page-hidden]):not(.ion-page-hidden) [name="' + that.textPosition + '"]'
            ) as HTMLAnchorElement;
            */
           // TODO: test this way of finding the target and use elsewhere as well, i.e. nElement. This way all read-text columns that are displayed will scroll to the new textPosition, not just the first one.
            let target = nElement.querySelector('[name="' + that.textPosition + '"]') as HTMLAnchorElement;
            if (
              target && (
                (target.parentElement && target.parentElement.classList.contains('ttFixed')) ||
                (target.parentElement?.parentElement && target.parentElement?.parentElement.classList.contains('ttFixed'))
              )
            ) {
              // Position in footnote --> look for second target
              /*
              target = document.querySelectorAll(
                'page-text:not([ion-page-hidden]):not(.ion-page-hidden) [name="' + that.textPosition + '"]'
              )[1] as HTMLAnchorElement;
              */
              target = nElement.querySelectorAll('[name="' + that.textPosition + '"]')[1] as HTMLAnchorElement;
            }
            if (target) {
              that.commonFunctions.scrollToHTMLElement(target);
              clearInterval(that.intervalTimerId);
            }
          }
        }.bind(this), 1000);
      });
    }
  }

  scrollReadTextToTop() {
    if (isBrowser()) {
      this.ngZone.runOutsideAngular(() => {
        const target = document.querySelector(
          'page-text:not([ion-page-hidden]):not(.ion-page-hidden) read-text'
        ) as HTMLElement;
        if (target) {
          this.commonFunctions.scrollElementIntoView(target, 'top', 50);
        }
      });
    }
  }

}
