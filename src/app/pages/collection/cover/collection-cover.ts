import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

import { MarkdownContentService } from '@services/markdown-content.service';
import { UserSettingsService } from '@services/user-settings.service';
import { config } from '@config';


@Component({
  selector: 'page-cover',
  templateUrl: 'collection-cover.html',
  styleUrls: ['collection-cover.scss']
})
export class CollectionCoverPage implements OnInit {
  collectionID: string = '';
  coverMdFolderId: string = '08';
  coverData$: Observable<any>;
  mobileMode: boolean = false;

  constructor(
    private userSettingsService: UserSettingsService,
    private mdContentService: MarkdownContentService,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.coverMdFolderId = config.collections?.coversMarkdownFolderNumber ?? '08';
  }

  ngOnInit() {
    this.mobileMode = this.userSettingsService.isMobile();

    this.coverData$ = this.route.params.pipe(
      tap(({collectionID}) => {
        this.collectionID = collectionID;
      }),
      switchMap(({collectionID}) => {
        return this.getCoverDataFromMdContent(
          `${this.activeLocale}-${this.coverMdFolderId}-${collectionID}`
        );
      })
    );
  }

  private getCoverDataFromMdContent(fileID: string): Observable<any> {
    return this.mdContentService.getMdContent(fileID).pipe(
      map((res: any) => {
        // Extract image url and alt-text from markdown content.
        let image_alt = res.content.match(/!\[(.*?)\]\(.*?\)/)[1];
        if (!image_alt) {
          image_alt = 'Cover image';
        }
        let image_src = res.content.match(/!\[.*?\]\((.*?)\)/)[1];
        if (!image_src) {
          image_src = '';
        }
        return { image_alt, image_src };
      }),
      catchError((e: any) => {
        console.error('Error loading markdown content for cover image', e);
        return of({ image_alt: 'Cover image', image_src: '' });
      })
    );
  }

}
