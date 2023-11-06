import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NgIf } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonicModule, ModalController } from '@ionic/angular';

import { IllustrationModal } from '@modals/illustration/illustration.modal';
import { CommentService } from '@services/comment.service';
import { HtmlParserService } from '@services/html-parser.service';
import { ScrollService } from '@services/scroll.service';
import { ViewOptionsService } from '@services/view-options.service';
import { concatenateNames, isBrowser } from '@utility-functions';


@Component({
  standalone: true,
  selector: 'comments',
  templateUrl: 'comments.html',
  styleUrls: ['comments.scss'],
  imports: [NgIf, IonicModule]
})
export class CommentsComponent implements OnInit, OnDestroy {
  @Input() searchMatches: string[] = [];
  @Input() textItemID: string = '';

  intervalTimerId: number = 0;
  letter: any = undefined;
  manuscript: any = undefined;
  receiver: string = '';
  sender: string = '';
  text: SafeHtml | string = '';

  private unlistenClickEvents?: () => void;

  constructor(
    private commentService: CommentService,
    private elementRef: ElementRef,
    private modalController: ModalController,
    private ngZone: NgZone,
    private parserService: HtmlParserService,
    private renderer2: Renderer2,
    private sanitizer: DomSanitizer,
    private scrollService: ScrollService,
    public viewOptionsService: ViewOptionsService
  ) {}

  ngOnInit() {
    if (this.textItemID) {
      this.loadCommentsText();
      this.getCorrespondanceMetadata();
    }
    if (isBrowser()) {
      this.setUpTextListeners();
    }
  }

  ngOnDestroy() {
    this.unlistenClickEvents?.();
  }

  loadCommentsText() {
    this.commentService.getComments(this.textItemID).subscribe({
      next: (text) => {
        if (text) {
          text = this.parserService.insertSearchMatchTags(String(text), this.searchMatches);
          this.text = this.sanitizer.bypassSecurityTrustHtml(text);
          if (this.searchMatches.length) {
            this.scrollService.scrollToFirstSearchMatch(this.elementRef.nativeElement, this.intervalTimerId);
          }
        } else {
          this.text = $localize`:@@Commentary.None:Inga kommentarer.`;
        }
      },
      error: (e) =>  {
        console.error(e);
        this.text = $localize`:@@Commentary.Error:Ett fel har uppstått. Kommentarer kunde inte hämtas.`;
      }
    });
  }

  getCorrespondanceMetadata() {
    this.commentService.getCorrespondanceMetadata(this.textItemID.split('_')[1]).subscribe(
      (text: any) => {
        if (text?.subjects?.length > 0) {
          const senders: string[] = [];
          const receivers: string[] = [];
          text.subjects.forEach((subject: any) => {
            if (subject['avs\u00e4ndare']) {
              senders.push(subject['avs\u00e4ndare']);
            }
            if (subject['mottagare']) {
              receivers.push(subject['mottagare']);
            }
          });
          this.sender = concatenateNames(senders);
          this.receiver = concatenateNames(receivers);
        }

        if (text?.letter) {
          this.letter = text.letter;
        }
      }
    );
  }

  private setUpTextListeners() {
    const nElement: HTMLElement = this.elementRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {

      /* CLICK EVENTS */
      this.unlistenClickEvents = this.renderer2.listen(nElement, 'click', (event) => {
        try {
          // This check for xreference is necessary since we don't want the comment to
          // scroll if the clicked target is a link in a comment. Clicks on links are
          // handled by read.ts.
          let targetIsLink = false;
          let targetElem: HTMLElement | null = event.target as HTMLElement;

          if (
            targetElem.classList.contains('xreference') ||
            (
              targetElem.parentElement !== null &&
              targetElem.parentElement.classList.contains('xreference')
            ) ||
            (
              targetElem.parentElement?.parentElement !== null &&
              targetElem.parentElement?.parentElement.classList.contains('xreference')
            )
          ) {
            targetIsLink = true;
          }

          if (!targetIsLink && this.viewOptionsService.show.comments) {
            // This is linking to a comment lemma ("asterisk") in the reading text,
            // i.e. the user has clicked a comment in the comments-column.
            event.preventDefault();

            // Find the comment element that has been clicked in the comment-column.
            if (!targetElem.classList.contains('commentScrollTarget')) {
              targetElem = targetElem.parentElement;
              while (
                targetElem !== null &&
                !targetElem.classList.contains('commentScrollTarget') &&
                targetElem.tagName !== 'COMMENT'
              ) {
                targetElem = targetElem.parentElement;
              }
            }
            if (targetElem !== null && targetElem !== undefined) {
              // Find the lemma in the reading text. Remove all non-digits at the start of the comment's id.
              const numId = targetElem.classList[targetElem.classList.length - 1].replace( /^\D+/g, '');
              const targetId = 'start' + numId;
              let lemmaStart = document.querySelector(
                'page-text:not([ion-page-hidden]):not(.ion-page-hidden) read-text'
              ) as HTMLElement;
              lemmaStart = lemmaStart.querySelector('[data-id="' + targetId + '"]') as HTMLElement;
              if (
                (
                  lemmaStart.parentElement !== null &&
                  lemmaStart.parentElement.classList.contains('ttFixed')
                ) ||
                (
                  lemmaStart.parentElement?.parentElement !== null &&
                  lemmaStart.parentElement?.parentElement.classList.contains('ttFixed')
                )
              ) {
                // The lemma is in a footnote, so we should get the second element with targetId
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
                this.scrollService.scrollToComment(numId, targetElem);
              }
            }
          }

          // Check if click on a link to an illustration that should be opened in a modal
          if (targetIsLink && targetElem?.classList.contains('ref_illustration')) {
            const illRefElem = targetElem as HTMLAnchorElement;
            const hashNumber = illRefElem.hash;
            const imageNumber = hashNumber.split('#')[1];
            this.ngZone.run(() => {
              this.openIllustration(imageNumber);
            });
          }
        } catch (e) {}
      });

    });
  }

  async openIllustration(imageNumber: string) {
    const modal = await this.modalController.create({
      component: IllustrationModal,
      componentProps: { 'imageNumber': imageNumber }
    });
    modal.present();
  }

}
