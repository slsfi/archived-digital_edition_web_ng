import { Component, Inject, LOCALE_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, map, Observable, of } from 'rxjs';
import { marked } from 'marked';
import { MdContentService } from 'src/app/services/md-content.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { TextService } from 'src/app/services/text.service';
import { config } from "src/assets/config/config";

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  styleUrls: ['home.scss'],
})
export class HomePage {
  siteHasSubtitle: boolean = false;
  descriptionText$: Observable<SafeHtml>;
  footerText$: Observable<SafeHtml>;
  imageOrientationPortrait: Boolean = false;
  imageOnRight: Boolean = false;
  titleOnImage: Boolean = false;
  showEditionList: Boolean = false;
  showFooter: Boolean = false;
  imageUrl = '';
  imageUrlStyle = '';
  portraitImageAltText = '';

  constructor(
    private sanitizer: DomSanitizer,
    private mdContentService: MdContentService,
    private userSettingsService: UserSettingsService,
    protected textService: TextService,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {

    // Get config for front page image and text content
    this.imageOrientationPortrait = config.page?.home?.imageOrientationIsPortrait ?? false;
    this.imageOnRight = config.page?.home?.imageOnRightIfPortrait ?? false;
    this.titleOnImage = config.page?.home?.siteTitleOnTopOfImageInMobileModeIfPortrait ?? false;
    this.portraitImageAltText = config.page?.home?.portraitImageAltText ?? 'front image';
    this.showEditionList = config.page?.home?.showEditionList ?? false;
    this.showFooter = config.page?.home?.showFooter ?? false;
    this.imageUrl = config.page?.home?.imageUrl ?? 'assets/images/frontpage-image-landscape.jpg';

    // Change front page image if not in desktop mode and the image orientation is set to portrait
    if (!this.userSettingsService.isDesktop() && this.imageOrientationPortrait) {
      const imageUrlMobile = config.page?.home?.portraitImageUrlInMobileMode ?? '';
      if (imageUrlMobile) {
        this.imageUrl = imageUrlMobile;
      }
    }

    this.imageUrlStyle = `url(${this.imageUrl})`;

    // Only show subtitle if translation for it not missing
    if ($localize`:@@Site.Subtitle:Webbplatsens undertitel`) {
      this.siteHasSubtitle = true;
    } else {
      this.siteHasSubtitle = false;
    }
  }

  ngOnInit() {
    this.descriptionText$ = this.getMdContent(this.activeLocale + '-01');
    if (this.showFooter) {
      this.footerText$ = this.getMdContent(this.activeLocale + '-06');
    }
  }

  ionViewWillEnter() {
    /* Update the variables in textService that keep track of which texts have
       recently been opened in page-text. The purpose of this is to cause
       texts that are cached in storage to be cleared upon the next visit
       to page-text after visiting home. */
    if (
      this.textService.previousReadViewTextId !== undefined &&
      this.textService.readViewTextId !== undefined
    ) {
      this.textService.previousReadViewTextId = this.textService.readViewTextId;
      this.textService.readViewTextId = '';
    }
  }

  getMdContent(fileID: string): Observable<SafeHtml> {
    return this.mdContentService.getMdContent(fileID).pipe(
      map((res: any) => {
        return this.sanitizer.bypassSecurityTrustHtml(marked(res.content));
      }),
      catchError((e) => {
        return of('');
      })
    );
  }

}
