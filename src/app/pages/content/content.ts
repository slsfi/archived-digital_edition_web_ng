import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MdContent } from 'src/app/models/md-content.model';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { config } from "src/app/services/config/config";


@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
  styleUrls: ['content.scss']
})
export class ContentPage {

  appName?: string;
  mdContent?: MdContent;
  lang: string;
  fileID?: string;
  languageSubscription: Subscription | null;

  constructor(
    private mdContentService: MdContentService,
    protected langService: LanguageService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
  ) {
    this.languageSubscription = null;
    this.lang = config.i18n?.locale ?? 'sv';

    this.langService.getLanguage().subscribe((lang) => {
      this.lang = lang;
    });

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (this.fileID !== params['id']) {
        this.fileID = params['id'];
        this.mdContent = new MdContent({id: this.fileID, title: '...', content: null, filename: null});
        this.loadContent();
      }
    });

    this.languageSubscription = this.langService.languageSubjectChange().subscribe(lang => {
      if (lang) {
        this.lang = lang;
        this.loadContent();
      }
    });
  }

  ionViewDidEnter() {
    this.analyticsService.doPageView('Content');
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadContent() {
    if (this.fileID) {
      this.getMdContent(this.fileID);
    }
  }

  doAnalytics( title: any ) {
    this.analyticsService.doPageView('Content - ' + title);
    this.analyticsService.doAnalyticsEvent('Content', 'Content - ' + title, title);
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: text => {
        if (this.mdContent) {
          this.mdContent.content = text.content;
          this.doAnalytics(this.mdContent.id);
        }
      },
      error: e => {}
    });
  }

}
