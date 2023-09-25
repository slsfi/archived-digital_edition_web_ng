import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
import { IonicModule } from '@ionic/angular';
import { catchError, concatMap, forkJoin, from, map, mergeMap, Observable, of, toArray } from 'rxjs';

import { ParentChildPagePathPipe } from 'src/pipes/parent-child-page-path.pipe';
import { ContentItem } from 'src/app/models/content-item.model';
import { CollectionsService } from 'src/app/services/collections.service';
import { MdContentService } from 'src/app/services/md-content.service';
import { config } from "src/assets/config/config";


@Component({
  standalone: true,
  selector: 'content-grid',
  templateUrl: 'content-grid.html',
  styleUrls: ['content-grid.scss'],
  imports: [CommonModule, IonicModule, RouterLink, ParentChildPagePathPipe]
})
export class ContentGridComponent implements OnInit {
  availableEbooks: any[] = [];
  collectionCoversFolderId: string = '';
  collectionSortOrder: any[] = [];
  contentItems$: Observable<ContentItem[]>;
  showEbooksInList: boolean = false;
  showMediaCollectionsInList: boolean = false;

  constructor(
    private collectionsService: CollectionsService,
    private mdContentService: MdContentService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.availableEbooks = config.ebooks ?? [];
    this.collectionCoversFolderId = config.ProjectStaticMarkdownCoversFolder ?? '';
    this.collectionSortOrder = config.collections?.order ?? [];
    this.showEbooksInList = config.component?.contentGrid?.showEbooks ?? false;
    this.showMediaCollectionsInList = config.component?.contentGrid?.showMediaCollections ?? false;
  }

  ngOnInit() {
    // TODO: Add support for listing media collections in grid
    this.contentItems$ = forkJoin(
      [
        this.getEbooks(),
        this.getCollections()
      ]
    ).pipe(
      map((res: any[]) => {
        const items = res.flat();
        // Add 'thumb' to end of cover image filenames
        items.forEach(item => {
          const lastIndex = item.imageURL?.lastIndexOf('.') ?? -1;
          if (lastIndex > -1) {
            item.imageURL = item.imageURL.substring(0, lastIndex) + '_thumb' + item.imageURL.substring(lastIndex);
          }
        });
        return items;
      })
    );
  }

  private getEbooks(): Observable<ContentItem[]> {
    let itemsList: ContentItem[] = [];
    if (this.showEbooksInList && this.availableEbooks.length) {
      this.availableEbooks.forEach((ebook: any) => {
        const ebookItem = new ContentItem(ebook);
        itemsList.push(ebookItem);
      });
    }
    return of(itemsList);
  }

  private getCollections(): Observable<ContentItem[]> {
    // Adapted from https://stackoverflow.com/a/55517145
    // First get list of collections, then for each collection,
    // get it's cover image URL and alt-text and append this information
    // to the collection data
    return this.collectionsService.getCollections().pipe(
      mergeMap((collectionsList: any[]) =>
        // 'from' emits each collection separately
        from(collectionsList).pipe(
          // load cover info for each collection
          concatMap(
            (collection: any) => 
              this.mdContentService.getMdContent(`${this.activeLocale}-${this.collectionCoversFolderId}-${collection.id}`).pipe(
                // add image alt-text and cover URL from response to collection data
                map((coverRes: any) => ({
                  ...collection,
                  imageAltText: coverRes.content.match(/!\[(.*?)\]\(.*?\)/)[1] || undefined,
                  imageURL: coverRes.content.match(/!\[.*?\]\((.*?)\)/)[1] || undefined
                }))
              ),
          ),
          map((collection: any) => {
            return new ContentItem(collection);
          }),
          // collect all collections into an array
          toArray(),
          // sort array of collections
          map((collectionItemsList: ContentItem[]) => {
            if (
              this.collectionSortOrder.length &&
              this.collectionSortOrder[0].length
            )  {
              return this.sortCollectionsList(collectionItemsList, this.collectionSortOrder);
            } else {
              return collectionItemsList;
            }
          })
        )
      ),
      catchError((error: any) => {
        console.error('Error loading collections data', error);
        return of([]);
      })
    );
  }

  private sortCollectionsList(collectionsList: ContentItem[], sortList: any[]): ContentItem[] {
    let collectionOrderList: any[] = [];
    let orderedCollectionsList: ContentItem[] = [];
    
    for (let i = 0; i < sortList.length; i++) {
      collectionOrderList = collectionOrderList.concat(sortList[i]);
    }

    for (const id of collectionOrderList) {
      for (let x = 0; x < collectionsList.length; x++) {
        if (collectionsList[x].id && String(collectionsList[x].id) === String(id)) {
          orderedCollectionsList.push(collectionsList[x]);
          break;
        }
      }
    }

    return orderedCollectionsList;
  }

  trackById(index: number | string, item: any) {
    return item.id;
  }

}
