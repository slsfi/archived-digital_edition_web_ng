import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, map, Observable, of } from 'rxjs';
import { marked } from 'marked';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';


@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
  styleUrls: ['content.scss']
})

export class ContentPage implements OnInit {
  text$: Observable<SafeHtml>;

  constructor(
    private sanitizer: DomSanitizer,
    private mdContentService: MdContentService,
    public userSettingsService: UserSettingsService,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {}

  ngOnInit() {
    this.text$ = this.getMdContent(this.activeLocale + '-02');
  }

  getMdContent(fileID: string): Observable<SafeHtml> {
    return this.mdContentService.getMdContent(fileID).pipe(
      map((res: any) => {
        return this.sanitizer.bypassSecurityTrustHtml(marked(res.content));
      }),
      catchError(e => {
        return of('');
      })
    );
  }

}
