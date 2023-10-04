import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, map, Observable, of } from 'rxjs';
import { marked } from 'marked';

import { MdContentService } from 'src/app/services/md-content.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { config } from 'src/assets/config/config';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styleUrls: ['home.scss'],
})
export class HomePage implements OnInit {
  descriptionText$: Observable<SafeHtml>;
  footerText$: Observable<SafeHtml>;
  imageOnRight: boolean = false;
  imageOrientationPortrait: boolean = false;
  imageUrl: string = '';
  imageUrlStyle: string = '';
  portraitImageAltText: string = '';
  showContentGrid: boolean = false;
  showFooter: boolean = false;
  siteHasSubtitle: boolean = false;
  titleOnImage: boolean = false;

  constructor(
    private mdContentService: MdContentService,
    private sanitizer: DomSanitizer,
    private userSettingsService: UserSettingsService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.imageOnRight = config.page?.home?.imageOnRightIfPortrait ?? false;
    this.imageOrientationPortrait = config.page?.home?.imageOrientationIsPortrait ?? false;
    this.imageUrl = config.page?.home?.imageUrl ?? 'assets/images/frontpage-image-landscape.jpg';
    this.portraitImageAltText = config.page?.home?.portraitImageAltText?.[this.activeLocale] ?? 'front image';
    this.showContentGrid = config.page?.home?.showContentGrid ?? false;
    this.showFooter = config.page?.home?.showFooter ?? false;
    this.titleOnImage = config.page?.home?.siteTitleOnTopOfImageInMobileModeIfPortrait ?? false;

    // Change front page image if mobile mode and the image orientation is set to portrait
    if (this.userSettingsService.isMobile() && this.imageOrientationPortrait) {
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

  private getMdContent(fileID: string): Observable<SafeHtml> {
    return this.mdContentService.getMdContent(fileID).pipe(
      map((res: any) => {
        return this.sanitizer.bypassSecurityTrustHtml(marked(res.content));
      }),
      catchError((e) => {
        console.error(e);
        return of('');
      })
    );
  }

}
