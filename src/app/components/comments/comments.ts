import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonicModule, ModalController } from '@ionic/angular';

import { CommentService } from 'src/app/services/comment.service';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { ReadPopoverService } from 'src/app/services/read-popover.service';
import { IllustrationModal } from 'src/app/modals/illustration/illustration.modal';
import { isBrowser } from 'src/standalone/utility-functions';


@Component({
  standalone: true,
  selector: 'comments',
  templateUrl: 'comments.html',
  styleUrls: ['comments.scss'],
  imports: [CommonModule, IonicModule]
})
export class CommentsComponent implements OnInit, OnDestroy {
  @Input() searchMatches: Array<string> = [];
  @Input() textItemID: string = '';

  letter: any = undefined;
  manuscript: any = undefined;
  receiver: string = '';
  sender: string = '';
  text: SafeHtml | string = '';
  private unlistenClickEvents?: () => void;

  constructor(
    private commentService: CommentService,
    private commonFunctions: CommonFunctionsService,
    private elementRef: ElementRef,
    private modalController: ModalController,
    private ngZone: NgZone,
    public readPopoverService: ReadPopoverService,
    private renderer2: Renderer2,
    private sanitizer: DomSanitizer
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
          text = this.commonFunctions.insertSearchMatchTags(String(text), this.searchMatches);
          this.text = this.sanitizer.bypassSecurityTrustHtml(text);
        } else {
          this.text = $localize`:@@Read.Comments.NoComments:Inga kommentarer.`;
        }
      },
      error: (e) =>  {
        console.error(e);
        this.text = $localize`:@@Read.Comments.NoComments:Inga kommentarer.`;
      }
    });
  }

  getCorrespondanceMetadata() {
    this.commentService.getCorrespondanceMetadata(this.textItemID.split('_')[1]).subscribe(
      (text: any) => {
        if (text['subjects'] !== undefined && text['subjects'] !== null) {
          if (text['subjects'].length > 0) {
            const senders = [] as any;
            const receivers = [] as any;
            text['subjects'].forEach((subject: any) => {
              if (subject['avs\u00e4ndare']) {
                senders.push(subject['avs\u00e4ndare']);
              }
              if (subject['mottagare']) {
                receivers.push(subject['mottagare']);
              }
            });
            this.sender = this.commonFunctions.concatenateNames(senders);
            this.receiver = this.commonFunctions.concatenateNames(receivers);
          }
        }

        if (text['letter'] !== undefined && text['letter'] !== null) {
          this.letter = text['letter'];
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

          if (!targetIsLink && this.readPopoverService.show.comments) {
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
                this.commentService.scrollToCommentLemma(lemmaStart);
                // Scroll to comment in the comments-column.
                this.commentService.scrollToComment(numId, targetElem);
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
