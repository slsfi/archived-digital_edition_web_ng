import { Component, Inject, LOCALE_ID, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, map, Observable, of } from 'rxjs';
import { marked } from 'marked';

import { MarkdownContentService } from '@services/markdown-content.service';


@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
  styleUrls: ['content.scss']
})
export class ContentPage implements OnInit {
  mdContent$: Observable<SafeHtml | null>;

  constructor(
    private sanitizer: DomSanitizer,
    private mdContentService: MarkdownContentService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {}

  ngOnInit() {
    this.mdContent$ = this.getMdContent(this.activeLocale + '-02').pipe(
      map((res: string) => {
        return this.sanitizer.sanitize(
          SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(res)
        );
      })
    );
  }

  getMdContent(fileID: string): Observable<string> {
    return this.mdContentService.getMdContent(fileID).pipe(
      map((res: any) => {
        return marked(res.content);
      }),
      catchError(e => {
        return of('');
      })
    );
  }

}
