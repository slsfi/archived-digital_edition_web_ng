import { Component, Input, ElementRef, EventEmitter, OnInit, Output, Renderer2, NgZone, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonicModule, ModalController } from '@ionic/angular';

import { config } from '@config';
import { MathJaxDirective } from '@directives/math-jax.directive';
import { IllustrationModal } from '@modals/illustration/illustration.modal';
import { HtmlParserService } from '@services/html-parser.service';
import { CollectionContentService } from '@services/collection-content.service';
import { PlatformService } from '@services/platform.service';
import { ScrollService } from '@services/scroll.service';
import { ViewOptionsService } from '@services/view-options.service';
import { isBrowser } from '@utility-functions';


@Component({
  standalone: true,
  selector: 'read-text',
  templateUrl: 'read-text.html',
  styleUrls: ['read-text.scss'],
  imports: [CommonModule, IonicModule, MathJaxDirective]
})
export class ReadTextComponent implements OnChanges, OnDestroy, OnInit {
  @Input() searchMatches: string[] = [];
  @Input() textItemID: string = '';
  @Input() textPosition: string = '';
  @Output() openNewIllustrView: EventEmitter<any> = new EventEmitter();
  @Output() selectedIllustration: EventEmitter<any> = new EventEmitter();

  illustrationsViewAvailable: boolean = false;
  illustrationsVisibleInReadtext: boolean = false;
  intervalTimerId: number = 0;
  text: SafeHtml = '';
  textLanguage: string = '';
  private unlistenClickEvents?: () => void;

  constructor(
    private collectionContentService: CollectionContentService,
    private commonFunctions: ScrollService,
    private elementRef: ElementRef,
    private modalController: ModalController,
    private ngZone: NgZone,
    private parserService: HtmlParserService,
    public platformService: PlatformService,
    private renderer2: Renderer2,
    private sanitizer: DomSanitizer,
    public viewOptionsService: ViewOptionsService
  ) {
    this.illustrationsViewAvailable = config.page?.text?.viewTypes?.illustrations ?? false;
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
    }
    if (isBrowser()) {
      this.setUpTextListeners();
    }
  }

  ngOnDestroy() {
    this.unlistenClickEvents?.();
  }

  loadReadText() {
    this.collectionContentService.getReadText(this.textItemID).subscribe({
      next: (res) => {
        if (
          res?.content &&
          res?.content !== '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>File not found</body></html>'
        ) {
          const collectionID = this.textItemID.split('_')[0];
          let text = res.content as string;
          text = this.parserService.postprocessEstablishedText(text, collectionID);
          text = this.parserService.insertSearchMatchTags(text, this.searchMatches);
          this.text = this.sanitizer.bypassSecurityTrustHtml(text);
          this.illustrationsVisibleInReadtext = this.parserService.readTextHasVisibleIllustrations(text);

          if (this.textPosition) {
            this.scrollToTextPosition();
          } else if (this.searchMatches.length) {
            this.commonFunctions.scrollToFirstSearchMatch(this.elementRef.nativeElement, this.intervalTimerId);
          }
        } else {
          this.text = $localize`:@@Read.Established.NoEstablished:Det finns ingen utskriven lästext, se faksimil.`;
        }
        if (res?.language) {
          this.textLanguage = res.language;
        } else {
          this.textLanguage = '';
        }
      },
      error: (e) => {
        console.error(e);
        this.text = $localize`:@@Read.Established.Error:Ett fel har uppstått. Lästexten kunde inte hämtas.`;
      }
    });
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

          if (!this.platformService.isMobile()) {
            let image = null as any;

            // Check if click on an illustration or icon representing an illustration
            if (eventTarget.classList.contains('doodle') && eventTarget.hasAttribute('src')) {
              // Click on a pictogram ("doodle")
              image = {
                src: 'assets/images/verk/' + String(eventTarget.dataset['id']).replace('tag_', '') + '.jpg',
                class: 'doodle'
              };
            } else if (this.illustrationsVisibleInReadtext) {
              // There are possibly visible illustrations in the read text. Check if click on such an image.
              if (
                eventTarget.classList.contains('est_figure_graphic') &&
                eventTarget.hasAttribute('src')
              ) {
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
              if (
                document.querySelector(
                  'page-text:not([ion-page-hidden]):not(.ion-page-hidden) illustrations'
                ) === null
              ) {
                this.ngZone.run(() => {
                  this.openIllustrationInNewView(image);
                });
              } else {
                // Display image in an illustrations-view which is already open
                this.ngZone.run(() => {
                  this.updateSelectedIllustrationImage(image);
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
    this.openNewIllustrView.emit(image);
    this.commonFunctions.scrollLastViewIntoView();
  }

  updateSelectedIllustrationImage(image: any) {
    image.viewType = 'illustrations';
    this.selectedIllustration.emit(image);
  }

  async openIllustration(imageNumber: string) {
    const modal = await this.modalController.create({
      component: IllustrationModal,
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
            let target = nElement.querySelector(
              '[name="' + that.textPosition + '"]'
            ) as HTMLAnchorElement;
            if (
              target && (
                (target.parentElement && target.parentElement.classList.contains('ttFixed')) ||
                (target.parentElement?.parentElement && target.parentElement?.parentElement.classList.contains('ttFixed'))
              )
            ) {
              target = nElement.querySelectorAll(
                '[name="' + that.textPosition + '"]'
              )[1] as HTMLAnchorElement;
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
