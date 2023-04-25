import { Component, Inject, LOCALE_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { marked } from 'marked';
import { MdContentService } from 'src/app/services/md/md-content.service';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  styleUrls: ['about.scss']
})
export class AboutPage {
  markdownText$: Observable<SafeHtml>;

  constructor(
    private sanitizer: DomSanitizer,
    private mdContentService: MdContentService,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {}

  ngOnInit() {
    this.markdownText$ = this.route.params.pipe(
      switchMap(({id}) => {
        return this.getMdContent(this.activeLocale + '-' + id);
      })
    );
  }

  getMdContent(fileID: string): Observable<SafeHtml> {
    return this.mdContentService.getMdContent(fileID).pipe(
      map((res: any) => {
        return this.sanitizer.bypassSecurityTrustHtml(marked(res.content));
      }),
      catchError(e => {
        return throwError(() => new Error(e));
      })
    );
  }

}
