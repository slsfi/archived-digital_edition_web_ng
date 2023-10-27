import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { catchError, defaultIfEmpty, filter, forkJoin, map, Observable, of, Subject, Subscription, timeout } from 'rxjs';

import { config } from '@config';
import { OccurrencesAccordionComponent } from '@components/occurrences-accordion/occurrences-accordion.component';
import { NamedEntityService } from '@services/named-entity.service';
import { TooltipService } from '@services/tooltip.service';
import { isEmptyObject } from '@utility-functions';


@Component({
  standalone: true,
  selector: 'modal-semantic-data-object',
  templateUrl: 'semantic-data-object.modal.html',
  styleUrls: ['semantic-data-object.modal.scss'],
  imports: [CommonModule, IonicModule, OccurrencesAccordionComponent, RouterModule]
})
export class SemanticDataObjectModal implements OnInit {
  @Input() id: string = '';
  @Input() type: string = '';

  loadingErrorData$: Subject<boolean> = new Subject<boolean>();
  objectData$: Observable<any>;
  routerEventsSubscription: Subscription;
  showAliasAndPrevLastName: boolean = true;
  showArticleData: boolean = false;
  showCityRegionCountry: boolean = false;
  showDescriptionLabel: boolean = false;
  showGalleryOccurrences: boolean = false;
  showMediaData: boolean = false;
  showOccupation: boolean = false;
  showOccurrences: boolean = true;
  showType: boolean = false;
  simpleWorkMetadata: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private namedEntityService: NamedEntityService,
    private router: Router,
    private tooltipService: TooltipService
  ) {
    this.showAliasAndPrevLastName = config.modal?.semanticDataObject?.showAliasAndPrevLastName ?? true;
    this.showArticleData = config.modal?.semanticDataObject?.showArticleData ?? false;
    this.showCityRegionCountry = config.modal?.semanticDataObject?.showCityRegionCountry ?? false;
    this.showDescriptionLabel = config.modal?.semanticDataObject?.showDescriptionLabel ?? false;
    this.showGalleryOccurrences = config.modal?.semanticDataObject?.showGalleryOccurrences ?? false;
    this.showMediaData = config.modal?.semanticDataObject?.showMediaData ?? false;
    this.showOccupation = config.modal?.semanticDataObject?.showOccupation ?? false;
    this.showOccurrences = config.modal?.semanticDataObject?.showOccurrences ?? true;
    this.showType = config.modal?.semanticDataObject?.showType ?? false;
    this.simpleWorkMetadata = config.modal?.semanticDataObject?.useSimpleWorkMetadata ?? false;
  }

  ngOnInit() {
    this.objectData$ = this.getSemanticDataObjectData(this.type, this.id);

    // Close the modal on route change
    this.routerEventsSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.modalCtrl.getTop().then((modal) => {
        modal?.dismiss();
      });
    });
  }

  ionViewWillLeave() {
    this.routerEventsSubscription?.unsubscribe();
  }

  private getSemanticDataObjectData(type: string, id: string): Observable<any> {
    return forkJoin(
      [
        this.getSemanticDataObjectDetails(type, id),
        this.getSemanticDataObjectMediaData(type, id),
        this.getSemanticDataObjectArticleData(type, id),
        this.getSemanticDataObjectGalleryOccurrences(type, id)
      ]
    ).pipe(
      map((res: any[]) => {
        let emptyData = true;
        for (let i = 0; i < res.length; i++) {
          if (
            (
              Array.isArray(res[i]) && res[i].length
            ) ||
            (
              typeof res[i] === 'object' && res[i] !== null && !isEmptyObject(res[i])
            )
          ) {
            emptyData = false;
          }
        }

        if (emptyData) {
          this.loadingErrorData$.next(true);
          defaultIfEmpty(null);
        } else {
          const data: any = {
            details: res[0],
            media: res[1],
            articles: res[2],
            galleryOccurrences: res[3],
          };

          return data;
        }
      }),
      catchError((error: any) => {
        console.error('Error loading object data', error);
        this.loadingErrorData$.next(true);
        return of(undefined);
      })
    );
  }

  private getSemanticDataObjectDetails(type: string, id: string): Observable<any> {
    if (type !== 'work' || (type === 'work' && this.simpleWorkMetadata)) {
      // Get semantic data object details from the backend API
      return this.namedEntityService.getEntity(type, id).pipe(
        timeout(20000),
        map((data: any) => {
          if (type === 'work') {
            data.description = null;
            data.source = null;
          }

          !data.title && data.full_name ? data.title = data.full_name
            : !data.title && data.name ? data.title = data.name
            : data.title;

          data.year_born_deceased = this.tooltipService.constructYearBornDeceasedString(
            data.date_born, data.date_deceased
          );
          // console.log('data object details: ', data);
          return data;
        }),
        catchError((error: any) => {
          return of({});
        })
      );
    } else {
      // For work manifestations, get semantic data object details from Elasticsearch API
      return this.namedEntityService.getEntityFromElastic(type, id).pipe(
        timeout(20000),
        map((data: any) => {
          if (data?.hits?.hits?.length < 1) {
            return of({});
          }

          data = data.hits.hits[0]['_source'];
          data.id = data['man_id' as keyof typeof data];
          data.description = data['reference' as keyof typeof data];
          if (
            !data.author_data ||
            !data.author_data[0] ||
            !data.author_data[0]['id']
          ) {
            data.author_data = [];
          }
          // console.log('work details: ', data);
          return data;
        }),
        catchError((error: any) => {
          return of({});
        })
      );
    }
  }

  private getSemanticDataObjectMediaData(type: string, id: string): Observable<any> {
    return (!this.showMediaData && of({})) || this.namedEntityService.getEntityMediaData(type, id).pipe(
      timeout(20000),
      map((data: any) => {
        data.imageUrl = data.image_path;
        return data;
      }),
      catchError((error: any) => {
        return of({});
      })
    );
  }

  private getSemanticDataObjectArticleData(type: string, id: string): Observable<any> {
    return (!this.showArticleData && of({})) || this.namedEntityService.getEntityArticleData(type, id).pipe(
      timeout(20000),
      catchError((error: any) => {
        return of({});
      })
    );
  }

  private getSemanticDataObjectGalleryOccurrences(type: string, id: string): Observable<any> {
    return (!this.showGalleryOccurrences && of({})) || this.namedEntityService.getEntityMediaCollectionOccurrences(type, id).pipe(
      timeout(20000),
      catchError((error: any) => {
        return of({});
      })
    );
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'close');
  }

}